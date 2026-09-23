import { NextResponse } from "next/server";
import { getSiteProfileByApiKey, reserveTenantQuota, releaseTenantQuota, recordGenerationLog } from "@/lib/db";
import { generateBlogPostResilient } from "@/lib/blogEngineFallback";
import { checkTenantRateLimit } from "@/lib/rateLimiter";
import { enqueueGenerationJob } from "@/lib/queueService";
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

  try {
    // 1. Authenticate via x-api-key header
    const rawApiKey = request.headers.get("x-api-key");
    if (!rawApiKey || !rawApiKey.trim()) {
      return NextResponse.json(
        { error: "Missing x-api-key header. Provide a valid tenant API key." },
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
    if (body?.async === true) {
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

    // 6. Record telemetry row asynchronously in generation_logs (§5, §10, §11)
    await recordGenerationLog({
      site_id: siteProfile.id,
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

    return NextResponse.json(post, { status: 200, headers: corsHeaders });
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

