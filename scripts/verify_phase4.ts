import assert from "assert";
import fs from "fs";
import path from "path";

if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

import { reserveTenantQuota, releaseTenantQuota, localSiteProfiles, getDbClient } from "../src/lib/db";
import { toSafeSiteProfile, SafeSiteProfile } from "../src/lib/sanitize";
import type { SiteProfile } from "../src/lib/types";

async function runPhase4Verification() {
  console.log("=== PHASE 4 VERIFICATION SUITE ===");

  // -------------------------------------------------------------
  // Test 1: Atomic Quota Reservation & Release (Local & DB Fallback)
  // -------------------------------------------------------------
  console.log("\n--- 1. Atomic Quota Reservation & Release ---");

  const testSiteId = crypto.randomUUID();
  const testProfile: SiteProfile = {
    id: testSiteId,
    site_name: "Phase 4 Quota Test",
    domain: "quota-test.com",
    api_key_hash: "secret_hash_12345",
    is_active: true,
    brand_knowledge: "Brand test",
    tone: "Professional",
    target_audience: "CTOs",
    internal_links: [],
    monthly_quota: 2,
    used_quota: 0,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    byo_groq_api_key: "gsk_super_secret_groq_key_9999",
    byo_gemini_api_key: "gemini_super_secret_key_8888",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Seed into local profiles store
  localSiteProfiles.set(testSiteId, { ...testProfile });

  // Try creating in Supabase DB if accessible
  try {
    const supabase = getDbClient();
    await supabase.from("site_profiles").insert([testProfile]);
  } catch {
    // Falls back gracefully to localSiteProfiles
  }

  // 1a. First slot reservation
  const res1 = await reserveTenantQuota(testSiteId);
  console.log("Reservation 1 result:", res1);
  assert(res1.reserved === true, "First quota reservation succeeds");
  assert(res1.used_quota === 1, "used_quota incremented to 1");

  // 1b. Second slot reservation (hits monthly limit)
  const res2 = await reserveTenantQuota(testSiteId);
  console.log("Reservation 2 result:", res2);
  assert(res2.reserved === true, "Second quota reservation succeeds");
  assert(res2.used_quota === 2, "used_quota incremented to 2 (monthly limit)");

  // 1c. Third slot reservation must be REJECTED (quota full)
  const res3 = await reserveTenantQuota(testSiteId);
  console.log("Reservation 3 result (full):", res3);
  assert(res3.reserved === false, "Third reservation must be rejected when full");
  assert(res3.used_quota === 2, "used_quota does not exceed monthly limit (2)");

  // 1d. Simulate concurrent burst: 5 concurrent reservations when quota is full
  console.log("Testing concurrent burst protection...");
  const burstResults = await Promise.all([
    reserveTenantQuota(testSiteId),
    reserveTenantQuota(testSiteId),
    reserveTenantQuota(testSiteId),
    reserveTenantQuota(testSiteId),
    reserveTenantQuota(testSiteId),
  ]);
  const allowedInBurst = burstResults.filter((r) => r.reserved).length;
  assert(allowedInBurst === 0, `All concurrent requests rejected when quota full (allowed: ${allowedInBurst})`);
  const profileAfterBurst = localSiteProfiles.get(testSiteId);
  if (profileAfterBurst) {
    assert(profileAfterBurst.used_quota <= 2, "used_quota strictly protected from overshooting limit");
  }

  // 1e. Release one slot (e.g. Generation failed or aborted)
  console.log("Releasing reservation after simulated generation failure...");
  await releaseTenantQuota(testSiteId);
  const profileAfterRelease = localSiteProfiles.get(testSiteId);
  console.log("Profile used_quota after release:", profileAfterRelease?.used_quota);

  // 1f. Reservation succeeds again now that 1 slot is freed
  const res4 = await reserveTenantQuota(testSiteId);
  console.log("Reservation after slot release:", res4);
  assert(res4.reserved === true, "Reservation succeeds after slot was released");
  assert(res4.used_quota === 2, "used_quota back at limit 2");

  // Cleanup test profile
  try {
    const supabase = getDbClient();
    await supabase.from("site_profiles").delete().eq("id", testSiteId);
  } catch {}
  localSiteProfiles.delete(testSiteId);
  console.log("PASS: Atomic Quota Reservation & Release verified!");

  // -------------------------------------------------------------
  // Test 2: BYO Key Exposure Audit & Sanitization
  // -------------------------------------------------------------
  console.log("\n--- 2. BYO Key Exposure Audit & Sanitization ---");

  const fullProfile: SiteProfile = {
    id: "test-site-uuid-secret",
    site_name: "Audit Test Brand",
    domain: "audit.test.com",
    api_key_hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    key_prefix: "gs_live_••••3b4f",
    is_active: true,
    brand_knowledge: "Brand secret knowledge",
    tone: "Direct",
    target_audience: "Engineers",
    internal_links: [{ url: "/demo", label: "Demo" }],
    monthly_quota: 50,
    used_quota: 10,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    byo_groq_api_key: "gsk_live_very_secret_groq_api_token_12345",
    byo_gemini_api_key: "AIzaSy_very_secret_gemini_api_token_67890",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const safeProfile = toSafeSiteProfile(fullProfile);

  // Assert keys are completely removed
  assert((safeProfile as any).byo_groq_api_key === undefined, "byo_groq_api_key stripped from SafeSiteProfile");
  assert((safeProfile as any).byo_gemini_api_key === undefined, "byo_gemini_api_key stripped from SafeSiteProfile");
  assert((safeProfile as any).api_key_hash === undefined, "api_key_hash stripped from SafeSiteProfile");

  // Assert non-sensitive fields preserved
  assert(safeProfile.id === fullProfile.id, "Profile ID preserved");
  assert(safeProfile.site_name === fullProfile.site_name, "Site name preserved");
  assert(safeProfile.domain === fullProfile.domain, "Domain preserved");
  assert(safeProfile.monthly_quota === fullProfile.monthly_quota, "Quota limits preserved");
  assert(safeProfile.key_prefix === "gs_live_••••3b4f", "Safe masked prefix preserved");

  // Verify JSON serialization doesn't leak secrets
  const jsonOutput = JSON.stringify(safeProfile);
  assert(!jsonOutput.includes("gsk_live_very_secret"), "Serialized JSON does not contain Groq secret");
  assert(!jsonOutput.includes("AIzaSy_very_secret"), "Serialized JSON does not contain Gemini secret");
  assert(!jsonOutput.includes("5e884898da280471"), "Serialized JSON does not contain api_key_hash");

  console.log("PASS: BYO key exposure audit & sanitization verified!");

  console.log("\n==============================================");
  console.log("ALL PHASE 4 TESTS PASSED SUCCESSFULLY!");
  console.log("==============================================");
}

runPhase4Verification().catch((err) => {
  console.error("PHASE 4 TEST FAILURE:", err);
  process.exit(1);
});
