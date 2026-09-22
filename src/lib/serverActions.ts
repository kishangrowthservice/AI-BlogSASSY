"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { getDbClient, hashApiKey, localSiteProfiles } from "./db";
import type { SiteProfile } from "./types";
import type { OnboardTenantInput, OnboardTenantResult } from "./adminActions";

const ADMIN_TOKEN = process.env.ADMIN_SESSION_TOKEN || "aiblog-admin-valid-session-2024";

async function verifyAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return Boolean(session && session.value === ADMIN_TOKEN);
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
      gemini_model: input.gemini_model || "gemini-2.0-flash",
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
      profile,
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
