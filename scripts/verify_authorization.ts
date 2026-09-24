import { hashApiKey, localSiteProfiles } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";
import {
  verifySiteOwnership,
  getTenantDashboardData,
  generateTenantApiKeyAction,
  updateTenantBrandAction,
  updateTenantByoKeys,
} from "../src/lib/serverActions";
import fs from "fs";
import path from "path";

// Load .env.local if not already loaded in process.env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runAuthorizationVerification() {
  console.log("=================================================");
  console.log("  VERIFY AUTHORIZATION: CROSS-TENANT PERMISSION  ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Setup Fixtures: Two distinct tenant profiles with different user_ids
  // -------------------------------------------------------------
  const tenantAId = "11111111-1111-4111-a111-111111111111";
  const tenantBId = "22222222-2222-4222-b222-222222222222";
  const userAId = "user-auth-uuid-aaaa-1111";
  const userBId = "user-auth-uuid-bbbb-2222";

  const profileA: SiteProfile = {
    id: tenantAId,
    site_name: "Tenant Alpha Solutions",
    domain: "tenant-alpha.com",
    api_key_hash: hashApiKey("gs_live_alpha_secret_key"),
    key_prefix: "gs_live_••••aaaa",
    is_active: true,
    brand_knowledge: "Alpha proprietary brand knowledge and marketing directives.",
    tone: "authoritative, corporate",
    target_audience: "Enterprise CTOs",
    internal_links: [{ url: "/enterprise", label: "Enterprise Solutions", category: "Core" }],
    monthly_quota: 100,
    used_quota: 5,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    user_id: userAId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const profileB: SiteProfile = {
    id: tenantBId,
    site_name: "Tenant Beta Media",
    domain: "tenant-beta.io",
    api_key_hash: hashApiKey("gs_live_beta_secret_key"),
    key_prefix: "gs_live_••••bbbb",
    is_active: true,
    brand_knowledge: "Beta lifestyle publishing directives.",
    tone: "conversational, witty",
    target_audience: "Digital Creators",
    internal_links: [{ url: "/creators", label: "Creator Studio", category: "Media" }],
    monthly_quota: 50,
    used_quota: 1,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    user_id: userBId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localSiteProfiles.set(tenantAId, profileA);
  localSiteProfiles.set(tenantBId, profileB);

  // -------------------------------------------------------------
  // Test 1: Verify Ownership Helper Baseline Checks
  // -------------------------------------------------------------
  console.log("--- 1. Site Ownership Verification Helper ---");
  const isOwnerA = await verifySiteOwnership(tenantAId, userAId);
  assert(isOwnerA === true, "Rightful owner A verified for Tenant A profile");

  const crossUserAccess = await verifySiteOwnership(tenantAId, userBId);
  assert(crossUserAccess === false, "Cross-tenant User B rejected when attempting access to Tenant A profile");

  const nonExistentAccess = await verifySiteOwnership("non-existent-id", userAId);
  assert(nonExistentAccess === false, "Access rejected for non-existent site ID");

  // -------------------------------------------------------------
  // Test 2: getTenantDashboardData Authorization Boundary
  // -------------------------------------------------------------
  console.log("\n--- 2. getTenantDashboardData Action Security ---");
  // Attempt unauthenticated call
  const unauthDashboard = await getTenantDashboardData(tenantAId);
  assert(
    unauthDashboard.success === false && Boolean(unauthDashboard.error?.toLowerCase().includes("unauthorized")),
    "getTenantDashboardData rejected for unauthenticated caller",
    unauthDashboard.error
  );

  // -------------------------------------------------------------
  // Test 3: generateTenantApiKeyAction Authorization Boundary
  // -------------------------------------------------------------
  console.log("\n--- 3. generateTenantApiKeyAction Security ---");
  const unauthKeyGen = await generateTenantApiKeyAction(tenantAId);
  assert(
    unauthKeyGen.success === false && Boolean(unauthKeyGen.error?.toLowerCase().includes("unauthorized")),
    "generateTenantApiKeyAction rejected for unauthenticated caller",
    unauthKeyGen.error
  );

  // -------------------------------------------------------------
  // Test 4: updateTenantBrandAction Authorization Boundary
  // -------------------------------------------------------------
  console.log("\n--- 4. updateTenantBrandAction Security ---");
  const unauthBrandUpdate = await updateTenantBrandAction(tenantAId, {
    brand_knowledge: "Malicious injection brand content",
    tone: "hostile",
    target_audience: "anyone",
  });
  assert(
    unauthBrandUpdate.success === false && Boolean(unauthBrandUpdate.error?.toLowerCase().includes("unauthorized")),
    "updateTenantBrandAction rejected for unauthenticated caller",
    unauthBrandUpdate.error
  );

  // Assert target profile content remained unchanged
  const intactProfile = localSiteProfiles.get(tenantAId);
  assert(
    intactProfile?.brand_knowledge === profileA.brand_knowledge,
    "Tenant A brand knowledge remains completely untampered"
  );

  // -------------------------------------------------------------
  // Test 5: updateTenantByoKeys Authorization Boundary
  // -------------------------------------------------------------
  console.log("\n--- 5. updateTenantByoKeys Security ---");
  const unauthByoSave = await updateTenantByoKeys(tenantAId, "gsk_attacker_key", "AIza_attacker_key");
  assert(
    unauthByoSave === false,
    "updateTenantByoKeys returns false and blocks unauthenticated caller"
  );

  // Verify BYO keys were NOT written to the profile
  assert(
    !intactProfile?.byo_groq_api_key && !intactProfile?.byo_gemini_api_key,
    "Tenant A BYO keys remain untouched"
  );

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthorizationVerification().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
