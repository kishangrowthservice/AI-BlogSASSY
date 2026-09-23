import crypto from "crypto";
import { getDbClient, hashApiKey, localSiteProfiles } from "./db";
import type { SiteProfile, GenerationLog } from "./types";
import type { SafeSiteProfile } from "./sanitize";

export interface OnboardTenantInput {
  site_name: string;
  domain: string;
  brand_knowledge: string;
  tone?: string;
  target_audience?: string;
  internal_links?: Array<{ url: string; label: string; category?: string }>;
  monthly_quota?: number;
  groq_model?: string;
  gemini_model?: string;
  byo_groq_api_key?: string;
  byo_gemini_api_key?: string;
}

export interface OnboardTenantResult {
  success: boolean;
  profile?: SafeSiteProfile;
  rawApiKey?: string;
  error?: string;
}

export interface ObservabilityStats {
  totalTenants: number;
  activeTenants: number;
  totalGenerations: number;
  successRatePercent: number;
  avgLatencyMs: number;
  groqCount: number;
  geminiCount: number;
  recentLogs: GenerationLog[];
  pendingQueueJobs?: number;
}

/**
 * Generate a cryptographically secure raw API key.
 * (SYSTEM_DESIGN.md §9: Shown once at creation, stored only as SHA-256 hash)
 */
export function generateRawApiKey(): string {
  const randomHex = crypto.randomBytes(20).toString("hex");
  return `gs_live_${randomHex}`;
}

/**
 * List all registered tenant site profiles with fallback for empty state.
 */
export async function listSiteProfiles(): Promise<SiteProfile[]> {
  try {
    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("site_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as SiteProfile[];
    }
  } catch (err) {
    console.error("[adminActions] Error listing site profiles:", err);
  }

  return Array.from(localSiteProfiles.values());
}

export { onboardTenantAction, updateTenantByoKeys, toggleTenantStatus } from "./serverActions";


/**
 * Aggregates observability metrics from generation_logs (§10).
 */
export async function getObservabilityStats(): Promise<ObservabilityStats> {
  try {
    const supabase = getDbClient();

    // Fetch site profiles count
    const { data: profiles } = await supabase
      .from("site_profiles")
      .select("id, is_active");

    const totalTenants = profiles?.length || 0;
    const activeTenants = profiles?.filter((p) => p.is_active).length || 0;

    // Fetch recent logs
    const { data: logs } = await supabase
      .from("generation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const recentLogs = (logs || []) as GenerationLog[];
    const totalGenerations = recentLogs.length;

    let successCount = 0;
    let totalLatency = 0;
    let groqCount = 0;
    let geminiCount = 0;

    for (const log of recentLogs) {
      if (log.status === "success") successCount++;
      totalLatency += log.latency_ms || 0;
      if (log.provider_used === "groq") groqCount++;
      if (log.provider_used === "gemini") geminiCount++;
    }

    const successRatePercent = totalGenerations > 0 ? Math.round((successCount / totalGenerations) * 100) : 100;
    const avgLatencyMs = totalGenerations > 0 ? Math.round(totalLatency / totalGenerations) : 0;

    // Check pending queue jobs
    let pendingQueueJobs = 0;
    try {
      const { count } = await supabase
        .from("generation_queue")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      pendingQueueJobs = count || 0;
    } catch {
      // In-memory fallback: local queue
    }

    return {
      totalTenants,
      activeTenants,
      totalGenerations,
      successRatePercent,
      avgLatencyMs,
      groqCount,
      geminiCount,
      recentLogs: recentLogs.slice(0, 20),
      pendingQueueJobs,
    };
  } catch (err) {
    console.error("[adminActions] Error calculating observability stats:", err);
    return {
      totalTenants: 0,
      activeTenants: 0,
      totalGenerations: 0,
      successRatePercent: 100,
      avgLatencyMs: 0,
      groqCount: 0,
      geminiCount: 0,
      recentLogs: [],
      pendingQueueJobs: 0,
    };
  }
}
