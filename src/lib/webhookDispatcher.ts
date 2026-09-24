import crypto from "crypto";
import type { SiteProfile, GeneratedBlogPost, GenerationTelemetry } from "./types";

export interface WebhookPayload {
  event: "article.published";
  site_id: string;
  site_name: string;
  domain: string;
  article: {
    title: string;
    metaDescription: string;
    content: string; // Valid semantic HTML
    suggestedTags: string[];
    wordCount: number;
    readingTimeMinutes: number;
  };
  telemetry: {
    provider: string;
    model: string;
    latency_ms: number;
  };
  timestamp: string;
}

/**
 * Computes HMAC-SHA256 signature for the outbound webhook payload.
 */
export function computeWebhookSignature(payloadString: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(payloadString).digest("hex");
}

/**
 * Constructs the standardized webhook payload.
 */
export function buildWebhookPayload(
  siteProfile: SiteProfile,
  post: GeneratedBlogPost,
  telemetry: GenerationTelemetry
): WebhookPayload {
  const plainText = post.content.replace(/<[^>]+>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    event: "article.published",
    site_id: siteProfile.id,
    site_name: siteProfile.site_name,
    domain: siteProfile.domain,
    article: {
      title: post.title,
      metaDescription: post.metaDescription,
      content: post.content,
      suggestedTags: post.suggestedTags || [],
      wordCount,
      readingTimeMinutes,
    },
    telemetry: {
      provider: telemetry.provider_used,
      model: telemetry.model,
      latency_ms: telemetry.latency_ms,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Asynchronously dispatches the generated article payload to the tenant's configured CMS webhook URL.
 * Non-blocking: timed out at 5 seconds and fails gracefully to never impact caller latency.
 */
export async function dispatchCmsWebhook(
  siteProfile: SiteProfile,
  post: GeneratedBlogPost,
  telemetry: GenerationTelemetry
): Promise<{ dispatched: boolean; status?: number; error?: string }> {
  const targetUrl = siteProfile.webhook_url?.trim();
  if (!targetUrl) {
    return { dispatched: false };
  }

  try {
    const payload = buildWebhookPayload(siteProfile, post, telemetry);
    const payloadJson = JSON.stringify(payload);

    // Sign payload using site ID as secret seed or SESSION_SECRET
    const signingKey = process.env.SESSION_SECRET || siteProfile.id;
    const signature = computeWebhookSignature(payloadJson, signingKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AI-Blog-SaaS-Publisher/1.0",
        "x-saas-event": "article.published",
        "x-saas-signature": `sha256=${signature}`,
      },
      body: payloadJson,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(
      `[webhookDispatcher] Dispatched post "${post.title}" to ${targetUrl} (Status: ${response.status})`
    );

    return { dispatched: true, status: response.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[webhookDispatcher] Non-fatal delivery failure to ${targetUrl}:`, message);
    return { dispatched: false, error: message };
  }
}
