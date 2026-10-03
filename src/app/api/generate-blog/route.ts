import { NextResponse } from "next/server";
import { getSiteProfileByApiKey, reserveTenantQuota, releaseTenantQuota, recordGenerationLog } from "@/lib/db";
import { generateBlogPostResilient } from "@/lib/blogEngineFallback";
import { checkTenantRateLimit } from "@/lib/rateLimiter";
import { enqueueGenerationJob } from "@/lib/queueService";
import { dispatchCmsWebhook } from "@/lib/webhookDispatcher";
import type { SiteProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow sufficient duration for LLM post generation

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const requestStart = Date.now();
  let siteProfile: SiteProfile | null = null;
  let quotaReserved = false;
  let attemptedTopic: string | undefined;

  try {
    // 1. Authenticate via x-api-key, apikey, Authorization Bearer header, or query parameters
    let rawApiKey =
      request.headers.get("x-api-key") ||
      request.headers.get("apikey") ||
      request.headers.get("api-key");

    if (!rawApiKey || !rawApiKey.trim()) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        rawApiKey = authHeader.slice(7).trim();
      }
    }

    // Support query param ?apiKey=... or ?api_key=... for integrations
    if (!rawApiKey || !rawApiKey.trim()) {
      try {
        const url = new URL(request.url);
        rawApiKey = url.searchParams.get("apiKey") || url.searchParams.get("api_key");
      } catch {
        // Ignore URL parsing errors
      }
    }

    // Strip leading/trailing whitespace and surrounding single or double quotes
    if (rawApiKey) {
      rawApiKey = rawApiKey.trim().replace(/^["']|["']$/g, "").trim();
    }

    if (!rawApiKey || !rawApiKey.trim()) {
      return NextResponse.json(
        { error: "Missing API key. Provide via 'x-api-key' header or 'Authorization: Bearer <key>'." },
        { status: 401 }
      );
    }

    // Helpful developer diagnostic if client passes the masked prefix
    if (rawApiKey.includes("••••") || rawApiKey.includes("...")) {
      return NextResponse.json(
        {
          error:
            "Invalid API key format: you passed a masked key prefix (e.g. 'gs_live_••••...'). Please supply your full 48-character raw secret API key (starts with 'gs_live_') generated in your dashboard or provided by your admin.",
        },
        { status: 401 }
      );
    }

    siteProfile = await getSiteProfileByApiKey(rawApiKey);
    if (!siteProfile) {
      return NextResponse.json(
        { error: "Invalid or inactive API key. Access denied." },
        { status: 401 }
      );
    }

    // 2. Atomically reserve tenant monthly quota slot (PHASE4.md Task 1)
    const reservation = await reserveTenantQuota(siteProfile.id);
    quotaReserved = reservation.reserved;
    if (!reservation.reserved) {
      return NextResponse.json(
        {
          error: `Monthly generation quota exceeded (${reservation.used_quota}/${reservation.monthly_quota}). Please upgrade your plan or wait for the monthly reset.`,
        },
        { status: 429 }
      );
    }

    // 2.5. Enforce noisy-neighbor rate limit (SYSTEM_DESIGN.md §5, §7)
    // 5 requests per minute per tenant default
    const rateLimit = await checkTenantRateLimit(siteProfile.id, 5);
    if (!rateLimit.allowed) {
      if (quotaReserved) await releaseTenantQuota(siteProfile.id).catch(() => {});
      return NextResponse.json(
        {
          error: `Per-minute rate limit exceeded (${rateLimit.current}/${rateLimit.limit} RPM). Burst protection engaged to prevent noisy-neighbor starvation.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    // 3. Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      if (quotaReserved) await releaseTenantQuota(siteProfile.id).catch(() => {});
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { topic, keywords, wordCount, tone, audience, model } = body || {};

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      if (quotaReserved) await releaseTenantQuota(siteProfile.id).catch(() => {});
      return NextResponse.json(
        { error: "Field 'topic' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // 4. Input bounds clamping (§9 Security)
    const safeTopic = topic.trim().slice(0, 500);
    attemptedTopic = safeTopic;
    const safeTone = typeof tone === "string" ? tone.trim().slice(0, 100) : undefined;
    const safeAudience = typeof audience === "string" ? audience.trim().slice(0, 200) : undefined;
    const safeModel = typeof model === "string" ? model.trim().slice(0, 100) : undefined;
    const safeWordCount =
      typeof wordCount === "number" && !isNaN(wordCount)
        ? Math.min(Math.max(Math.round(wordCount), 200), 3000)
        : 1000;
    const safeKeywords = Array.isArray(keywords)
      ? keywords
          .slice(0, 10)
          .map((k) => String(k).trim().slice(0, 60))
          .filter(Boolean)
      : undefined;

    const safeParams = {
      topic: safeTopic,
      keywords: safeKeywords,
      wordCount: safeWordCount,
      tone: safeTone,
      audience: safeAudience,
      model: safeModel,
    };

    // 4.5. Async Queue for Burst Smoothing (§8 Scaling Strategy)
    if (body?.async === true || body?.sync === false) {
      const job = await enqueueGenerationJob(siteProfile.id, safeParams);
      return NextResponse.json(
        {
          status: "accepted",
          jobId: job.id,
          message: "Request accepted and queued for asynchronous burst smoothing.",
          checkStatusUrl: `/api/generate-blog/queue/${job.id}`,
        },
        { status: 202, headers: corsHeaders }
      );
    }

    // 5. Invoke Resilient LLM Orchestrator
    const { post, telemetry } = await generateBlogPostResilient(siteProfile, safeParams);

    // 6. Record telemetry and full post content in generation_logs (§5, §10, §11)
    await recordGenerationLog({
      site_id: siteProfile.id,
      title: post.title,
      content: post.content,
      meta_description: post.metaDescription,
      suggested_tags: post.suggestedTags,
      provider_used: telemetry.provider_used,
      model: telemetry.model,
      prompt_tokens: telemetry.prompt_tokens,
      completion_tokens: telemetry.completion_tokens,
      total_tokens: telemetry.total_tokens,
      latency_ms: telemetry.latency_ms,
      finish_reason: telemetry.finish_reason,
      status: "success",
      fallback_triggered: telemetry.fallback_triggered,
    });

    // 6.5. Asynchronously dispatch to customer's outbound CMS webhook (non-blocking)
    if (siteProfile.webhook_url) {
      dispatchCmsWebhook(siteProfile, post, telemetry).catch((err) => {
        console.warn("[generate-blog] CMS webhook delivery failed:", err);
      });
    }

    // 7. Enrich response with slug, reading time, snake_case aliases, and telemetry
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const plainText = post.content.replace(/<[^>]*>/g, " ");
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    const contentWordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(contentWordCount / 200));

    const enrichedPost = {
      ...post,
      slug,
      meta_description: post.metaDescription,
      suggested_tags: post.suggestedTags,
      tags: post.suggestedTags,
      word_count: contentWordCount,
      wordCount: contentWordCount,
      reading_time_minutes: readingTimeMinutes,
      readingTime: `${readingTimeMinutes} min read`,
      telemetry: {
        provider: telemetry.provider_used,
        model: telemetry.model,
        latency_ms: telemetry.latency_ms,
        tokens: {
          prompt: telemetry.prompt_tokens,
          completion: telemetry.completion_tokens,
          total: telemetry.total_tokens,
        },
      },
    };

    return NextResponse.json(enrichedPost, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    if (quotaReserved) {
      await releaseTenantQuota(siteProfile!.id).catch(() => {});
    }

    const elapsed = Date.now() - requestStart;
    const message = err instanceof Error ? err.message : "Internal generation failure";
    console.error("[generate-blog] Execution error:", err);

    // Record failure in generation_logs if tenant was authenticated
    if (siteProfile) {
      const isDualFailure = /both providers|primary groq rate-limited/i.test(message);
      if (isDualFailure) {
        // Critical Alert (§10): Log dual provider failure
        console.error(
          `[ALERT: DUAL_PROVIDER_FAILURE] Both LLM providers failed for tenant "${siteProfile.site_name}" (${siteProfile.id}). Service halted for request. Reason: ${message}`
        );
      }

      await recordGenerationLog({
        site_id: siteProfile.id,
        title: attemptedTopic,
        provider_used: "none",
        model: siteProfile.groq_model || "openai/gpt-oss-120b",
        latency_ms: elapsed,
        status: "failed",
        error_message: message,
        fallback_triggered: isDualFailure,
      });
    }

    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

