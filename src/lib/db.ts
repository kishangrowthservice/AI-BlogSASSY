import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { SiteProfile } from "./types";

let supabaseClient: SupabaseClient | null = null;

export function getDbClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
    }

    supabaseClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

// In-memory site profile store for local development and test environments
export const localSiteProfiles = new Map<string, SiteProfile>();

// Short-TTL cache per warm function instance (SYSTEM_DESIGN.md §8 Scaling Strategy)
const profileCache = new Map<string, { profile: SiteProfile; expiry: number }>();

export function invalidateProfileCache(apiKeyHash?: string): void {
  if (apiKeyHash) {
    profileCache.delete(apiKeyHash);
  } else {
    profileCache.clear();
  }
}

/**
 * Hash raw API key using SHA-256 for secure lookup.
 * Raw API keys are never stored in the database.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

/**
 * Lookup site profile by raw API key.
 * Enforces is_active check with short-TTL cache.
 */
export async function getSiteProfileByApiKey(rawKey: string): Promise<SiteProfile | null> {
  const hashed = hashApiKey(rawKey);

  const cached = profileCache.get(hashed);
  if (cached && cached.expiry > Date.now() && cached.profile.is_active) {
    return cached.profile;
  }

  try {
    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("site_profiles")
      .select("*")
      .eq("api_key_hash", hashed)
      .eq("is_active", true)
      .single();

    if (!error && data) {
      const profile = data as SiteProfile;
      profileCache.set(hashed, { profile, expiry: Date.now() + 60_000 });
      return profile;
    }
  } catch {
    // Supabase unavailable or table not migrated yet
  }

  // Fallback to local profile store
  for (const profile of localSiteProfiles.values()) {
    if (profile.api_key_hash === hashed && profile.is_active) {
      profileCache.set(hashed, { profile, expiry: Date.now() + 60_000 });
      return profile;
    }
  }

  return null;
}

/**
 * Atomically increment used_quota counter for a tenant.
 */
export async function incrementUsedQuota(siteId: string): Promise<void> {
  try {
    const supabase = getDbClient();
    const { error } = await supabase.rpc("increment_tenant_quota", { p_site_id: siteId });
    if (error) {
      // Fallback if RPC not yet deployed to remote instance
      const { data: profile } = await supabase
        .from("site_profiles")
        .select("used_quota")
        .eq("id", siteId)
        .single();

      if (profile) {
        await supabase
          .from("site_profiles")
          .update({ used_quota: (profile.used_quota || 0) + 1 })
          .eq("id", siteId);
      }
    }
  } catch {
    // Ignore remote increment failure
  }

  const local = localSiteProfiles.get(siteId);
  if (local) {
    local.used_quota = (local.used_quota || 0) + 1;
  }

  for (const entry of profileCache.values()) {
    if (entry.profile.id === siteId) {
      entry.profile.used_quota = (entry.profile.used_quota || 0) + 1;
    }
  }
}

/**
 * Record telemetry row in generation_logs (SYSTEM_DESIGN.md §5, §10).
 * Fails gracefully to never block blog response delivery.
 */
export async function recordGenerationLog(log: import("./types").GenerationLog): Promise<void> {
  try {
    const supabase = getDbClient();
    const { error } = await supabase.from("generation_logs").insert([log]);
    if (error) {
      console.error("[db] Error recording generation_log:", error.message);
    }
  } catch (err: unknown) {
    console.error("[db] Failed to record generation log:", err);
  }
}


