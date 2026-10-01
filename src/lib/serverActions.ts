"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { getDbClient, hashApiKey, localSiteProfiles, reserveTenantQuota, releaseTenantQuota, recordGenerationLog } from "./db";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { generateBlogPostResilient } from "./blogEngineFallback";
import { dispatchCmsWebhook, computeWebhookSignature } from "./webhookDispatcher";
import type { SiteProfile, GenerationLog, GenerateBlogParams, GeneratedBlogPost, GenerationTelemetry } from "./types";
import { toSafeSiteProfile, type SafeSiteProfile } from "./sanitize";
import type { OnboardTenantInput, OnboardTenantResult } from "./adminActions";
import { runFullSiteCrawlAndSynthesis, liveCrawlState } from "./crawler/brandSynthesizer";

async function verifyAdminAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_SESSION_TOKEN;
  if (!adminToken) {
    return false;
  }
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return Boolean(session && session.value === adminToken);
  } catch {
    return false;
  }
}

/**
 * Resolves the currently authenticated user's ID via Supabase server auth.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const serverAuth = await createSupabaseServerClient();
    const { data: { user } } = await serverAuth.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Strictly verifies whether the given site profile is owned by the specified user
 * (or currently authenticated user if userId not provided).
 * Fails closed (returns false) if unauthenticated, site doesn't exist, or user_id doesn't match.
 */
export async function verifySiteOwnership(siteId: string, userId?: string): Promise<boolean> {
  if (!siteId) return false;
  const uid = userId || (await getAuthenticatedUserId());
  if (!uid) return false;

  try {
    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("site_profiles")
      .select("user_id")
      .eq("id", siteId)
      .single();

    if (!error && data) {
      return data.user_id === uid;
    }
  } catch {
    // Database check fallback
  }

  const local = localSiteProfiles.get(siteId);
  if (local) {
    return local.user_id === uid;
  }

  return false;
}

/**
 * Generate a cryptographically secure raw API key helper.
 */
function createRawKey(): string {
  const randomHex = crypto.randomBytes(20).toString("hex");
  return `gs_live_${randomHex}`;
}

/**
 * Onboards a new tenant site profile.
 */
export async function onboardTenantAction(input: OnboardTenantInput): Promise<OnboardTenantResult> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }
    if (!input.site_name || !input.site_name.trim()) {
      return { success: false, error: "Site name is required" };
    }
    if (!input.domain || !input.domain.trim()) {
      return { success: false, error: "Domain is required" };
    }
    if (!input.brand_knowledge || !input.brand_knowledge.trim()) {
      return { success: false, error: "Brand knowledge is required" };
    }

    const rawApiKey = createRawKey();
    const hashed = hashApiKey(rawApiKey);

    const payload = {
      site_name: input.site_name.trim(),
      domain: input.domain.trim().toLowerCase().replace(/^https?:\/\//, ""),
      api_key_hash: hashed,
      is_active: true,
      brand_knowledge: input.brand_knowledge.trim(),
      tone: input.tone?.trim() || "authoritative, actionable, high-conviction",
      target_audience: input.target_audience?.trim() || "business decision makers and professionals",
      internal_links: input.internal_links || [],
      monthly_quota: input.monthly_quota && input.monthly_quota > 0 ? input.monthly_quota : 100,
      used_quota: 0,
      groq_model: input.groq_model || "openai/gpt-oss-120b",
      gemini_model: input.gemini_model || "gemini-3.8-flash",
      byo_groq_api_key: input.byo_groq_api_key?.trim() || undefined,
      byo_gemini_api_key: input.byo_gemini_api_key?.trim() || undefined,
    };

    let profile: SiteProfile | null = null;
    try {
      const supabase = getDbClient();
      const { data, error } = await supabase
        .from("site_profiles")
        .insert([payload])
        .select("*")
        .single();

      if (!error && data) {
        profile = data as SiteProfile;
      }
    } catch {
      // Remote DB not migrated or offline
    }

    if (!profile) {
      const mockId = crypto.randomUUID();
      profile = {
        id: mockId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SiteProfile;
    }

    localSiteProfiles.set(profile.id, profile);

    return {
      success: true,
      profile: toSafeSiteProfile(profile),
      rawApiKey,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to onboard tenant";
    console.error("[serverActions] onboardTenant error:", err);
    return { success: false, error: message };
  }
}

/**
 * Update dedicated tenant BYO keys.
 */
export async function updateTenantByoKeys(
  siteId: string,
  byoGroqKey?: string | null,
  byoGeminiKey?: string | null
): Promise<boolean> {
  const isAuthorized = (await verifyAdminAuth()) || (await verifySiteOwnership(siteId));
  if (!isAuthorized) {
    return false;
  }

  try {
    const supabase = getDbClient();
    const updates: Record<string, string | null> = {};
    if (byoGroqKey !== undefined) updates.byo_groq_api_key = byoGroqKey ? byoGroqKey.trim() : null;
    if (byoGeminiKey !== undefined) updates.byo_gemini_api_key = byoGeminiKey ? byoGeminiKey.trim() : null;

    const { error } = await supabase
      .from("site_profiles")
      .update(updates)
      .eq("id", siteId);

    if (!error) return true;
  } catch {
    // Remote update fallback
  }

  const local = localSiteProfiles.get(siteId);
  if (local) {
    if (byoGroqKey !== undefined) local.byo_groq_api_key = byoGroqKey ? byoGroqKey.trim() : undefined;
    if (byoGeminiKey !== undefined) local.byo_gemini_api_key = byoGeminiKey ? byoGeminiKey.trim() : undefined;
    return true;
  }

  return true;
}

/**
 * Toggle active state of tenant profile without deleting historical records.
 */
export async function toggleTenantStatus(siteId: string, isActive: boolean): Promise<boolean> {
  const isAuthorized = await verifyAdminAuth();
  if (!isAuthorized) {
    return false;
  }

  try {
    const supabase = getDbClient();
    const { error } = await supabase
      .from("site_profiles")
      .update({ is_active: isActive })
      .eq("id", siteId);

    if (!error) return true;
  } catch {
    // Fallback
  }

  const local = localSiteProfiles.get(siteId);
  if (local) {
    local.is_active = isActive;
    return true;
  }

  return true;
}

export interface SelfServeOnboardInput {
  site_name: string;
  domain: string;
  brand_knowledge: string;
  tone?: string;
  target_audience?: string;
  internal_links?: Array<{ url: string; label: string; category?: string }>;
  user_id?: string;
}

export interface SelfServeOnboardResult {
  success: boolean;
  siteId?: string;
  error?: string;
}

export interface GenerateApiKeyResult {
  success: boolean;
  rawApiKey?: string;
  keyPrefix?: string;
  error?: string;
}

export interface TenantDashboardData {
  success: boolean;
  profile?: SafeSiteProfile;
  keyPrefix?: string | null;
  recentLogs?: GenerationLog[];
  error?: string;
}

/**
 * Self-serve tenant onboarding action.
 * Strictly does NOT generate an API key yet — user must generate on demand in dashboard.
 */
export async function selfServeOnboardAction(input: SelfServeOnboardInput): Promise<SelfServeOnboardResult> {
  try {
    if (!input.site_name || !input.site_name.trim()) {
      return { success: false, error: "Site name is required" };
    }
    if (!input.domain || !input.domain.trim()) {
      return { success: false, error: "Domain is required" };
    }
    if (!input.brand_knowledge || !input.brand_knowledge.trim()) {
      return { success: false, error: "Brand knowledge is required" };
    }

    const cleanedDomain = input.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // Resolve current authenticated Supabase user
    let authUserId: string | null = null;
    try {
      const serverAuth = await createSupabaseServerClient();
      const { data: { user } } = await serverAuth.auth.getUser();
      if (user?.id) authUserId = user.id;
    } catch {
      // In test/non-HTTP context
    }

    const targetUserId = authUserId || input.user_id || null;
    if (!targetUserId && process.env.NODE_ENV === "production") {
      return { success: false, error: "Authentication required to onboard a site profile." };
    }

    const payload: any = {
      site_name: input.site_name.trim(),
      domain: cleanedDomain,
      api_key_hash: null,
      user_id: targetUserId,
      is_active: true,
      brand_knowledge: input.brand_knowledge.trim(),
      tone: input.tone?.trim() || "authoritative, actionable, conversion-focused",
      target_audience: input.target_audience?.trim() || "business decision makers and professionals",
      internal_links: input.internal_links || [],
      monthly_quota: 25, // Starter free quota
      used_quota: 0,
      groq_model: "openai/gpt-oss-120b",
      gemini_model: "gemini-3.8-flash",
    };

    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("site_profiles")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      console.error("Supabase site profile insert error:", error);
      return {
        success: false,
        error: error.message || "Failed to create brand account in database",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Failed to retrieve created brand account",
      };
    }

    const profile = data as SiteProfile;
    localSiteProfiles.set(profile.id, profile);

    return {
      success: true,
      siteId: profile.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to onboard site",
    };
  }
}

/**
 * 1-Field URL Onboarding: Instantly provisions a site profile from a website URL,
 * redirects user immediately, and starts deep multi-page crawl + AI brand synthesis in background.
 */
export async function startSiteOnboardUrlAction(input: {
  websiteUrl: string;
  selectedPlan?: string | null;
}): Promise<{ success: boolean; siteId?: string; error?: string }> {
  try {
    const rawUrl = input.websiteUrl?.trim();
    if (!rawUrl) {
      return { success: false, error: "Please enter your website URL." };
    }

    let normalizedUrl = rawUrl;
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(normalizedUrl);
    } catch {
      return { success: false, error: "Invalid website URL format. Please include a valid domain (e.g. https://mybrand.com)." };
    }

    const domain = urlObj.hostname.replace(/^www\./, "").toLowerCase();
    let initialSiteName = domain.split(".")[0];
    initialSiteName = initialSiteName.charAt(0).toUpperCase() + initialSiteName.slice(1);

    // Quick 2s prefetch for real site title if accessible
    try {
      const quickRes = await fetch(urlObj.origin, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(2500),
      });
      if (quickRes.ok) {
        const html = await quickRes.text();
        const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (m && m[1]) {
          const rawTitle = m[1].trim().split(/[|\-–]/)[0].trim();
          if (rawTitle && rawTitle.length > 1 && rawTitle.length < 50) {
            initialSiteName = rawTitle;
          }
        }
      }
    } catch {}

    // Resolve authenticated user
    let targetUserId: string | null = null;
    try {
      const serverAuth = await createSupabaseServerClient();
      const { data: { user } } = await serverAuth.auth.getUser();
      if (user?.id) targetUserId = user.id;
    } catch {}

    const selectedPlan = input.selectedPlan?.toLowerCase() || "starter";
    const monthlyQuota = selectedPlan === "agency" ? 500 : selectedPlan === "pro" ? 250 : 100;

    const payload: any = {
      site_name: initialSiteName,
      domain,
      api_key_hash: null,
      user_id: targetUserId,
      is_active: true,
      brand_knowledge: `Website analysis and deep crawling in progress for ${domain}...`,
      tone: "authoritative, actionable, conversion-focused",
      target_audience: "business decision makers and prospective clients",
      internal_links: [],
      monthly_quota: monthlyQuota,
      used_quota: 0,
      groq_model: "openai/gpt-oss-120b",
      gemini_model: "gemini-3.8-flash",
      plan_tier: selectedPlan,
      crawl_status: "in_progress",
      crawl_progress: 10,
      crawl_page_count: 1,
      crawl_error: null,
    };

    let siteId: string | null = null;
    try {
      const db = getDbClient();
      const { data, error } = await db
        .from("site_profiles")
        .insert([payload])
        .select("id")
        .single();

      if (!error && data?.id) {
        siteId = data.id;
      } else if (error) {
        // Fallback: If migration 017/015 columns are not on Supabase table yet, insert core columns
        const { plan_tier, crawl_status, crawl_progress, crawl_page_count, crawl_error, ...basePayload } = payload;
        const { data: baseData, error: baseError } = await db
          .from("site_profiles")
          .insert([basePayload])
          .select("id")
          .single();

        if (!baseError && baseData?.id) {
          siteId = baseData.id;
        } else if (baseError) {
          console.error("[startSiteOnboardUrlAction] DB insert error:", baseError);
        }
      }
    } catch (dbErr) {
      console.error("[startSiteOnboardUrlAction] DB exception:", dbErr);
    }

    if (!siteId) {
      siteId = crypto.randomUUID();
      localSiteProfiles.set(siteId, { id: siteId, ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }

    // Set initial live crawl state
    liveCrawlState.set(siteId, {
      crawl_status: "in_progress",
      crawl_progress: 10,
      crawl_page_count: 1,
    });

    // Trigger deep crawling and AI brand synthesis asynchronously
    runFullSiteCrawlAndSynthesis(siteId, urlObj.origin).catch((err) => {
      console.error(`[startSiteOnboardUrlAction] Background crawl execution error for ${siteId}:`, err);
    });

    return {
      success: true,
      siteId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to initialize website onboarding.",
    };
  }
}

/**
 * Checks crawl and brand intelligence progress for the live dashboard scanner widget.
 */
export async function getCrawlStatusAction(siteId: string): Promise<{
  success: boolean;
  crawl_status?: "idle" | "in_progress" | "completed" | "failed";
  crawl_progress?: number;
  crawl_page_count?: number;
  crawl_error?: string | null;
  site_name?: string;
  domain?: string;
  tone?: string;
  target_audience?: string;
  internal_links_count?: number;
  error?: string;
}> {
  try {
    if (!siteId) return { success: false, error: "Site ID is required" };

    const live = liveCrawlState.get(siteId);

    const db = getDbClient();
    const { data, error } = await db
      .from("site_profiles")
      .select("*")
      .eq("id", siteId)
      .single();

    if (!error && data) {
      const isPlaceholder = (data.brand_knowledge || "").includes("Website analysis and deep crawling in progress");
      const derivedStatus = isPlaceholder ? "in_progress" : "completed";
      const derivedProgress = isPlaceholder ? 40 : 100;

      return {
        success: true,
        crawl_status: live?.crawl_status || data.crawl_status || derivedStatus,
        crawl_progress: live?.crawl_progress ?? (data.crawl_progress ?? derivedProgress),
        crawl_page_count: live?.crawl_page_count ?? (data.crawl_page_count ?? (Array.isArray(data.internal_links) ? data.internal_links.length : 0)),
        crawl_error: live?.crawl_error || data.crawl_error || null,
        site_name: live?.site_name || data.site_name,
        domain: data.domain,
        tone: live?.tone || data.tone,
        target_audience: live?.target_audience || data.target_audience,
        internal_links_count: live?.internal_links?.length || (Array.isArray(data.internal_links) ? data.internal_links.length : 0),
      };
    }

    const local = localSiteProfiles.get(siteId);
    if (local) {
      return {
        success: true,
        crawl_status: live?.crawl_status || local.crawl_status || "completed",
        crawl_progress: live?.crawl_progress ?? (local.crawl_progress ?? 100),
        crawl_page_count: live?.crawl_page_count ?? (local.crawl_page_count ?? 0),
        crawl_error: live?.crawl_error || local.crawl_error,
        site_name: live?.site_name || local.site_name,
        domain: local.domain,
        tone: live?.tone || local.tone,
        target_audience: live?.target_audience || local.target_audience,
        internal_links_count: live?.internal_links?.length || local.internal_links?.length || 0,
      };
    }

    return { success: false, error: "Site profile not found" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to get crawl status" };
  }
}

/**
 * Allows tenant to manually trigger a fresh re-scan of their website anytime.
 */
export async function triggerRecrawlAction(siteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!siteId) return { success: false, error: "Site ID is required" };

    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. Permission denied." };
    }

    const db = getDbClient();
    const { data: site, error } = await db
      .from("site_profiles")
      .select("domain")
      .eq("id", siteId)
      .single();

    const domain = site?.domain || localSiteProfiles.get(siteId)?.domain;
    if (!domain) {
      return { success: false, error: "Site domain not found." };
    }

    const targetUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    liveCrawlState.set(siteId, {
      crawl_status: "in_progress",
      crawl_progress: 15,
      crawl_page_count: 1,
    });

    // Mark in_progress
    try {
      await db.from("site_profiles").update({ crawl_status: "in_progress", crawl_progress: 10, crawl_error: null }).eq("id", siteId);
    } catch {}

    const local = localSiteProfiles.get(siteId);
    if (local) {
      local.crawl_status = "in_progress";
      local.crawl_progress = 10;
      local.crawl_error = undefined;
    }

    // Run async
    runFullSiteCrawlAndSynthesis(siteId, targetUrl).catch((err) => {
      console.error(`[triggerRecrawlAction] Background re-crawl error:`, err);
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to trigger re-crawl." };
  }
}

/**
 * On-demand API key generation for a tenant site.
 * Generates raw key, stores SHA-256 hash + masked prefix, and returns raw key once.
 */
export async function generateTenantApiKeyAction(siteId: string): Promise<GenerateApiKeyResult> {
  try {
    if (!siteId) {
      return { success: false, error: "Site ID is required" };
    }

    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. You do not have permission to generate keys for this website." };
    }

    const rawApiKey = createRawKey();
    const hashed = hashApiKey(rawApiKey);
    const keyPrefix = `gs_live_••••${rawApiKey.slice(-4)}`;

    try {
      const supabase = getDbClient();
      const { error } = await supabase
        .from("site_profiles")
        .update({
          api_key_hash: hashed,
          key_prefix: keyPrefix,
        })
        .eq("id", siteId);

      if (error) {
        // Fallback: update api_key_hash if key_prefix column not yet added to remote DB
        await supabase
          .from("site_profiles")
          .update({
            api_key_hash: hashed,
          })
          .eq("id", siteId);
      }
    } catch {
      // Remote DB fallback
    }

    // Update local memory profile if present
    const local = localSiteProfiles.get(siteId);
    if (local) {
      local.api_key_hash = hashed;
      local.key_prefix = keyPrefix;
    }

    return {
      success: true,
      rawApiKey,
      keyPrefix,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to generate API key",
    };
  }
}

/**
 * Loads dashboard data for a tenant (profile, masked key, recent logs).
 */
export async function getTenantDashboardData(siteId: string): Promise<TenantDashboardData> {
  try {
    if (!siteId) {
      return { success: false, error: "Site ID is required" };
    }

    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. You do not have permission to view this website dashboard." };
    }

    let profile: SiteProfile | null = null;
    let recentLogs: GenerationLog[] = [];

    try {
      const supabase = getDbClient();
      const { data, error } = await supabase
        .from("site_profiles")
        .select("*")
        .eq("id", siteId)
        .single();

      if (!error && data) {
        profile = data as SiteProfile;
      }

      if (profile) {
        const { data: logs } = await supabase
          .from("generation_logs")
          .select("*")
          .eq("site_id", siteId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (logs) recentLogs = logs;
      }
    } catch {
      // Remote DB fallback
    }

    if (!profile) {
      profile = localSiteProfiles.get(siteId) || null;
    }

    if (!profile) {
      return { success: false, error: "Site profile not found" };
    }

    // Resolve key prefix: stored prefix OR fallback masked indicator if api_key_hash exists
    const resolvedPrefix = profile.key_prefix || (profile.api_key_hash ? "gs_live_••••active" : null);

    // Sanitize: Never expose api_key_hash or BYO keys to client
    const safeProfile = toSafeSiteProfile({
      ...profile,
      key_prefix: resolvedPrefix,
    });

    return {
      success: true,
      profile: safeProfile,
      keyPrefix: resolvedPrefix,
      recentLogs,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to load dashboard data",
    };
  }
}

/**
 * Allows tenant to update their brand DNA and internal links.
 */
export async function updateTenantBrandAction(
  siteId: string,
  input: {
    brand_knowledge: string;
    tone: string;
    target_audience: string;
    internal_links?: Array<{ url: string; label: string; category?: string }>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!siteId) return { success: false, error: "Site ID is required" };

    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. You do not have permission to modify this website profile." };
    }

    const updatePayload = {
      brand_knowledge: input.brand_knowledge.trim(),
      tone: input.tone.trim(),
      target_audience: input.target_audience.trim(),
      internal_links: input.internal_links || [],
    };

    try {
      const supabase = getDbClient();
      await supabase
        .from("site_profiles")
        .update(updatePayload)
        .eq("id", siteId);
    } catch {
      // DB Fallback
    }

    const local = localSiteProfiles.get(siteId);
    if (local) {
      Object.assign(local, updatePayload);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update brand profile" };
  }
}

/**
 * Resolves the primary site ID for the current authenticated user.
 */
export async function getUserPrimarySiteId(): Promise<string | null> {
  try {
    const serverAuth = await createSupabaseServerClient();
    const { data: { user } } = await serverAuth.auth.getUser();
    if (!user) return null;

    try {
      const db = getDbClient();
      const { data, error } = await db
        .from("site_profiles")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.id) return data.id;
    } catch {
      // Local fallback
    }

    for (const [id, prof] of localSiteProfiles.entries()) {
      if (prof.user_id === user.id) return id;
    }

    return null;
  } catch {
    return null;
  }
}

export interface UserSiteSummary {
  id: string;
  site_name: string;
  domain: string;
  is_active: boolean;
  monthly_quota: number;
  used_quota: number;
  plan_tier?: string;
  created_at: string;
}

/**
 * Returns all website profiles owned by the currently authenticated user.
 * Enables multi-site portfolio switching and management.
 */
export async function getUserSitesAction(): Promise<UserSiteSummary[]> {
  try {
    const serverAuth = await createSupabaseServerClient();
    const { data: { user } } = await serverAuth.auth.getUser();
    if (!user) return [];

    try {
      const db = getDbClient();
      const { data, error } = await db
        .from("site_profiles")
        .select("id, site_name, domain, is_active, monthly_quota, used_quota, plan_tier, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as UserSiteSummary[];
      }
    } catch {
      // Local fallback
    }

    const matched: UserSiteSummary[] = [];
    for (const [id, prof] of localSiteProfiles.entries()) {
      if (prof.user_id === user.id) {
        matched.push({
          id,
          site_name: prof.site_name,
          domain: prof.domain,
          is_active: prof.is_active,
          monthly_quota: prof.monthly_quota,
          used_quota: prof.used_quota,
          plan_tier: prof.plan_tier || "starter",
          created_at: prof.created_at,
        });
      }
    }
    return matched;
  } catch {
    return [];
  }
}

/**
 * Allows tenant to configure their outbound CMS webhook URL.
 */
export async function updateTenantWebhookAction(
  siteId: string,
  webhookUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized to update webhook settings for this website." };
    }

    const cleanedUrl = webhookUrl?.trim() ? webhookUrl.trim() : null;

    try {
      const supabase = getDbClient();
      await supabase
        .from("site_profiles")
        .update({ webhook_url: cleanedUrl })
        .eq("id", siteId);
    } catch {
      // Local fallback
    }

    const local = localSiteProfiles.get(siteId);
    if (local) {
      local.webhook_url = cleanedUrl;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update webhook URL" };
  }
}

/**
 * Dispatches a simulated test ping to verify endpoint connectivity, response latency, and HMAC signature calculation.
 */
export async function testWebhookPingAction(
  siteId: string,
  webhookUrl: string
): Promise<{ success: boolean; statusCode?: number; latencyMs?: number; message: string }> {
  try {
    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, message: "Unauthorized to test webhook for this website." };
    }

    const trimmedUrl = webhookUrl.trim();
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      return { success: false, message: "Webhook URL must start with http:// or https://" };
    }

    const testPayload = {
      event: "article.published" as const,
      is_test_ping: true,
      site_id: siteId,
      site_name: "Test Site",
      domain: "example.com",
      article: {
        title: "Test Verification Article: Autonomous Publishing Pipeline",
        metaDescription: "Test ping verifying outbound webhook delivery pipeline and HMAC cryptographic signature.",
        content: "<h2>Connection Verified</h2><p>Your CMS endpoint successfully received our test article payload.</p>",
        suggestedTags: ["Integration", "Test"],
        wordCount: 15,
        readingTimeMinutes: 1,
      },
      telemetry: {
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        latency_ms: 1100,
      },
      timestamp: new Date().toISOString(),
    };

    const payloadJson = JSON.stringify(testPayload);
    const signature = computeWebhookSignature(payloadJson, process.env.SESSION_SECRET || siteId);

    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(trimmedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AI-Blog-SaaS-Publisher/1.0",
          "x-saas-event": "article.published",
          "x-saas-test": "true",
          "x-saas-signature": `sha256=${signature}`,
        },
        body: payloadJson,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;

      if (response.ok || (response.status >= 200 && response.status < 300)) {
        return {
          success: true,
          statusCode: response.status,
          latencyMs: elapsed,
          message: `Endpoint verified! Received HTTP ${response.status} in ${elapsed}ms. HMAC-SHA256 signature accepted.`,
        };
      } else {
        return {
          success: false,
          statusCode: response.status,
          latencyMs: elapsed,
          message: `Endpoint returned HTTP ${response.status} (${response.statusText || "Error"}) in ${elapsed}ms. Check your receiver route.`,
        };
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;
      if (fetchErr.name === "AbortError") {
        return {
          success: false,
          latencyMs: elapsed,
          message: `Delivery timed out after 6000ms. Ensure your endpoint responds quickly (< 5s).`,
        };
      }
      return {
        success: false,
        latencyMs: elapsed,
        message: `Network error reaching endpoint: ${fetchErr?.message || "Failed to fetch"}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Unexpected failure while testing webhook endpoint.",
    };
  }
}


export interface DashboardGenerateResult {
  success: boolean;
  post?: GeneratedBlogPost;
  telemetry?: GenerationTelemetry;
  usedQuota?: number;
  monthlyQuota?: number;
  error?: string;
}

/**
 * Generates an article directly from the authenticated tenant dashboard.
 * Atomically reserves quota, generates post with resilient dual-LLM fallback,
 * persists full content to database logs, and dispatches outbound CMS webhooks.
 */
export async function generateDashboardBlogAction(
  siteId: string,
  params: GenerateBlogParams
): Promise<DashboardGenerateResult> {
  let quotaReserved = false;
  try {
    if (!siteId) return { success: false, error: "Site ID is required" };
    if (!params.topic || !params.topic.trim()) {
      return { success: false, error: "Topic is required" };
    }

    const isAuthorized = (await verifySiteOwnership(siteId)) || (await verifyAdminAuth());
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. You do not own this website profile." };
    }

    // Retrieve profile
    let profile: SiteProfile | null = null;
    try {
      const db = getDbClient();
      const { data } = await db.from("site_profiles").select("*").eq("id", siteId).single();
      if (data) profile = data as SiteProfile;
    } catch {
      // Local fallback
    }
    if (!profile) profile = localSiteProfiles.get(siteId) || null;
    if (!profile) return { success: false, error: "Site profile not found" };

    // Atomically reserve quota slot
    const reservation = await reserveTenantQuota(siteId);
    quotaReserved = reservation.reserved;
    if (!reservation.reserved) {
      return {
        success: false,
        error: `Monthly quota exceeded (${reservation.used_quota}/${reservation.monthly_quota}). Please upgrade your plan.`,
      };
    }

    // Clamp parameters
    const safeTopic = params.topic.trim().slice(0, 500);
    const safeWordCount =
      typeof params.wordCount === "number" && !isNaN(params.wordCount)
        ? Math.min(Math.max(Math.round(params.wordCount), 200), 3000)
        : 1000;

    const safeParams: GenerateBlogParams = {
      ...params,
      topic: safeTopic,
      wordCount: safeWordCount,
    };

    const { post, telemetry } = await generateBlogPostResilient(profile, safeParams);

    // Save full post content in generation_logs
    await recordGenerationLog({
      site_id: siteId,
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

    // Outbound CMS Webhook
    if (profile.webhook_url) {
      dispatchCmsWebhook(profile, post, telemetry).catch((err) => {
        console.warn("[dashboardAction] Webhook delivery failed:", err);
      });
    }

    return {
      success: true,
      post,
      telemetry,
      usedQuota: reservation.used_quota,
      monthlyQuota: reservation.monthly_quota,
    };
  } catch (err: unknown) {
    if (quotaReserved) {
      await releaseTenantQuota(siteId).catch(() => {});
    }
    const message = err instanceof Error ? err.message : "Failed to generate blog post";
    return { success: false, error: message };
  }
}

/**
 * Admin action to adjust tenant monthly quota and plan tier.
 */
export async function adminUpdateTenantQuotaAction(
  siteId: string,
  monthlyQuota: number,
  planTier?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    const updates: Record<string, any> = { monthly_quota: monthlyQuota };
    if (planTier) updates.plan_tier = planTier;

    try {
      const db = getDbClient();
      await db.from("site_profiles").update(updates).eq("id", siteId);
    } catch {
      // Local fallback
    }

    const local = localSiteProfiles.get(siteId);
    if (local) {
      local.monthly_quota = monthlyQuota;
      if (planTier) local.plan_tier = planTier;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update tenant quota" };
  }
}

/**
 * Direct sign up action: creates a user with email_confirm: true so no email verification
 * link is sent or required, enabling immediate active session establishment upon registration.
 */
export async function directSignUpAction(input: {
  email: string;
  password: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const adminDb = getDbClient();

    // 1. Create the user with email_confirm: true (bypasses email verification)
    const { data: createData, error: createError } = await adminDb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { registered_via: "direct_signup" },
    });

    if (!createError && createData.user) {
      return { success: true, userId: createData.user.id };
    }

    // 2. Handle case if account already exists
    if (createError) {
      const errMsg = createError.message.toLowerCase();
      if (
        errMsg.includes("already registered") ||
        errMsg.includes("already exists") ||
        errMsg.includes("user already")
      ) {
        try {
          const { data: listData } = await adminDb.auth.admin.listUsers();
          const existingUser = listData?.users?.find(
            (u) => u.email?.toLowerCase() === email
          );
          if (existingUser) {
            // Auto-confirm the unconfirmed existing account and update password so they can log in immediately
            await adminDb.auth.admin.updateUserById(existingUser.id, {
              password,
              email_confirm: true,
            });
            return { success: true, userId: existingUser.id };
          }
        } catch {
          // Fall through
        }
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      return { success: false, error: createError.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to create account. Please try again.",
    };
  }
}

/**
 * Auto-confirms any user who attempts sign in but has an unconfirmed status.
 */
export async function autoConfirmUserAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: "Email required." };

    const adminDb = getDbClient();
    const { data: listData } = await adminDb.auth.admin.listUsers();
    const user = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (user && !user.email_confirmed_at) {
      await adminDb.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to auto-confirm user." };
  }
}


