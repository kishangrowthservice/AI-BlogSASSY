"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { getDbClient, hashApiKey, localSiteProfiles } from "./db";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteProfile } from "./types";
import { toSafeSiteProfile, type SafeSiteProfile } from "./sanitize";
import type { OnboardTenantInput, OnboardTenantResult } from "./adminActions";

async function verifyAdminAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_SESSION_TOKEN;
  if (!adminToken) {
    throw new Error("Missing required environment variable: ADMIN_SESSION_TOKEN");
  }
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return Boolean(session && session.value === adminToken);
  } catch {
    // Support non-HTTP script/test environments (e.g. tsx verify scripts)
    return process.env.NODE_ENV !== "production";
  }
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
      gemini_model: input.gemini_model || "gemini-2.5-flash-lite",
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
  const isAuthorized = await verifyAdminAuth();
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
  recentLogs?: any[];
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

    // Resolve current authenticated Supabase user if present
    let authUserId: string | null = null;
    try {
      const serverAuth = await createSupabaseServerClient();
      const { data: { user } } = await serverAuth.auth.getUser();
      if (user?.id) authUserId = user.id;
    } catch {
      // In test/non-HTTP context
    }

    const targetUserId = input.user_id || authUserId;

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
      gemini_model: "gemini-2.5-flash-lite",
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
 * On-demand API key generation for a tenant site.
 * Generates raw key, stores SHA-256 hash + masked prefix, and returns raw key once.
 */
export async function generateTenantApiKeyAction(siteId: string): Promise<GenerateApiKeyResult> {
  try {
    if (!siteId) {
      return { success: false, error: "Site ID is required" };
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

    let profile: SiteProfile | null = null;
    let recentLogs: any[] = [];

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

      // Fallback: If tenant site was created before user_id binding or with null user_id,
      // claim the most recent unassigned profile for this authenticated user
      const { data: orphan } = await db
        .from("site_profiles")
        .select("id")
        .is("user_id", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (orphan?.id) {
        await db.from("site_profiles").update({ user_id: user.id }).eq("id", orphan.id);
        return orphan.id;
      }
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

