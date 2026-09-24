import {
  verifySiteOwnership,
  generateTenantApiKeyAction,
  getTenantDashboardData,
  updateTenantBrandAction,
  getUserPrimarySiteId,
} from "../src/lib/serverActions";
import { localSiteProfiles } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";

async function runAuthorizationTests() {
  console.log("=== Running Cross-Tenant Authorization Boundary Tests ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Setup test tenant profiles in local memory
  const tenantAId = "00000000-0000-0000-0000-00000000000a";
  const tenantBId = "00000000-0000-0000-0000-00000000000b";
  const orphanSiteId = "00000000-0000-0000-0000-00000000000c";

  const profileA: SiteProfile = {
    id: tenantAId,
    site_name: "Tenant A Site",
    domain: "tenanta.com",
    api_key_hash: "hash_a",
    key_prefix: "gs_live_••••1111",
    is_active: true,
    brand_knowledge: "Brand A confidential data",
    tone: "formal",
    target_audience: "Enterprise A",
    internal_links: [],
    monthly_quota: 50,
    used_quota: 2,
    groq_model: "llama3",
    gemini_model: "gemini",
    user_id: "user-uuid-aaa",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const profileB: SiteProfile = {
    id: tenantBId,
    site_name: "Tenant B Site",
    domain: "tenantb.com",
    api_key_hash: "hash_b",
    key_prefix: "gs_live_••••2222",
    is_active: true,
    brand_knowledge: "Brand B confidential data",
    tone: "playful",
    target_audience: "Consumer B",
    internal_links: [],
    monthly_quota: 25,
    used_quota: 0,
    groq_model: "llama3",
    gemini_model: "gemini",
    user_id: "user-uuid-bbb",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const orphanProfile: SiteProfile = {
    id: orphanSiteId,
    site_name: "Admin Onboarded Orphan",
    domain: "adminorphan.com",
    api_key_hash: "hash_c",
    is_active: true,
    brand_knowledge: "Admin client secret brand",
    tone: "professional",
    target_audience: "VIP Client",
    internal_links: [],
    monthly_quota: 100,
    used_quota: 0,
    groq_model: "llama3",
    gemini_model: "gemini",
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localSiteProfiles.set(tenantAId, profileA);
  localSiteProfiles.set(tenantBId, profileB);
  localSiteProfiles.set(orphanSiteId, orphanProfile);

  // Test 1: verifySiteOwnership confirms owner match
  const isOwnerA = await verifySiteOwnership(tenantAId, "user-uuid-aaa");
  assert(isOwnerA === true, "verifySiteOwnership returns true for rightful owner");

  // Test 2: verifySiteOwnership rejects cross-tenant access
  const crossTenantAccess = await verifySiteOwnership(tenantAId, "user-uuid-bbb");
  assert(crossTenantAccess === false, "verifySiteOwnership blocks cross-tenant user B from accessing Site A");

  // Test 3: verifySiteOwnership rejects non-existent site
  const nonExistent = await verifySiteOwnership("non-existent-uuid", "user-uuid-aaa");
  assert(nonExistent === false, "verifySiteOwnership returns false for non-existent site");

  // Test 4: verifySiteOwnership rejects missing user
  const missingUser = await verifySiteOwnership(tenantAId, "");
  assert(missingUser === false, "verifySiteOwnership returns false when userId is empty");

  // Test 5: verifySiteOwnership rejects unassigned orphan profiles
  const orphanAccess = await verifySiteOwnership(orphanSiteId, "random-user");
  assert(orphanAccess === false, "verifySiteOwnership blocks access to unassigned orphan sites");

  // Test 6: getTenantDashboardData rejects unauthenticated caller
  const dashboardRes = await getTenantDashboardData(tenantAId);
  assert(
    dashboardRes.success === false && Boolean(dashboardRes.error?.includes("Unauthorized")),
    "getTenantDashboardData rejects unauthorized request"
  );

  // Test 7: generateTenantApiKeyAction rejects unauthenticated caller
  const keyGenRes = await generateTenantApiKeyAction(tenantAId);
  assert(
    keyGenRes.success === false && Boolean(keyGenRes.error?.includes("Unauthorized")),
    "generateTenantApiKeyAction rejects unauthorized key generation request"
  );

  // Test 8: updateTenantBrandAction rejects unauthenticated caller
  const brandRes = await updateTenantBrandAction(tenantAId, {
    brand_knowledge: "Hacked knowledge",
    tone: "hacked",
    target_audience: "hacked",
  });
  assert(
    brandRes.success === false && Boolean(brandRes.error?.includes("Unauthorized")),
    "updateTenantBrandAction rejects unauthorized brand modification"
  );

  // Test 9: getUserPrimarySiteId in unauthenticated context returns null without claiming orphan
  const primaryId = await getUserPrimarySiteId();
  assert(primaryId === null, "getUserPrimarySiteId returns null for unauthenticated session");

  // Verify orphan site was NOT hijacked
  const orphanStillIntact = localSiteProfiles.get(orphanSiteId);
  assert(
    orphanStillIntact?.user_id === null,
    "Orphan site remains unassigned and was NOT silently claimed"
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthorizationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
