import { getDbClient } from "./db";

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  retryAfterSeconds: number;
}

// In-memory fallback bucket map (per cold start / local resilience)
const localBuckets = new Map<string, { count: number; expiresAt: number }>();

/**
 * Enforces per-tenant rate limiting (noisy-neighbor protection) before LLM invocation (SYSTEM_DESIGN.md §5, §7).
 * Rejects burst traffic with HTTP 429 at gateway level so one tenant cannot starve shared LLM quotas.
 */
export async function checkTenantRateLimit(
  siteId: string,
  maxPerMinute: number = 5
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 60000;
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStartDate = new Date(windowStartMs).toISOString();
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStartMs + windowMs - now) / 1000));

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId);

  if (isUuid) {
    try {
      const supabase = getDbClient();

      // 1. Try atomic database RPC (safe against concurrent bursts)
      const { data: rpcData, error: rpcErr } = await supabase.rpc("check_and_increment_rate_limit", {
        p_site_id: siteId,
        p_window_start: windowStartDate,
        p_limit: maxPerMinute,
      });

      if (!rpcErr && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const { allowed, current_count } = rpcData[0];
        return {
          allowed,
          current: current_count,
          limit: maxPerMinute,
          retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
        };
      }

      // 2. Fallback upsert if RPC not yet deployed
      const { data: existing } = await supabase
        .from("rate_limit_buckets")
        .select("request_count")
        .eq("site_id", siteId)
        .eq("window_start", windowStartDate)
        .single();

      const currentCount = (existing?.request_count || 0) + 1;

      const { error: upsertErr } = await supabase
        .from("rate_limit_buckets")
        .upsert({
          site_id: siteId,
          window_start: windowStartDate,
          request_count: currentCount,
        });

      if (!upsertErr) {
        if (currentCount > maxPerMinute) {
          return {
            allowed: false,
            current: currentCount,
            limit: maxPerMinute,
            retryAfterSeconds,
          };
        }

        return {
          allowed: true,
          current: currentCount,
          limit: maxPerMinute,
          retryAfterSeconds: 0,
        };
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  // Fallback: In-memory rate limiting when DB table is not yet migrated, unreachable, or non-UUID id
  const key = `${siteId}:${windowStartMs}`;
  const entry = localBuckets.get(key) || { count: 0, expiresAt: windowStartMs + windowMs };
  entry.count += 1;
  localBuckets.set(key, entry);

  // Clean up expired local buckets
  for (const [k, v] of localBuckets.entries()) {
    if (v.expiresAt < now) {
      localBuckets.delete(k);
    }
  }

  if (entry.count > maxPerMinute) {
    return {
      allowed: false,
      current: entry.count,
      limit: maxPerMinute,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    current: entry.count,
    limit: maxPerMinute,
    retryAfterSeconds: 0,
  };
}
