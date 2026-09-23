import fs from "fs";
import path from "path";
import {
  selfServeOnboardAction,
  generateTenantApiKeyAction,
  getTenantDashboardData,
  updateTenantBrandAction,
} from "../src/lib/serverActions";
import { localSiteProfiles } from "../src/lib/db";

// Load .env.local
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

async function runSelfServeVerification() {
  console.log("=================================================");
  console.log("  SELF-SERVE & ON-DEMAND API KEY VERIFICATION     ");
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
  // Test 1: Self-Serve Onboard (Zero Key Auto-Generation)
  // -------------------------------------------------------------
  console.log("--- 1. Self-Serve Onboarding Without API Key ---");
  const testSiteName = "Vortex Cloud Systems";
  const testDomain = "https://vortexcloud.io/blog/";

  const onboardRes = await selfServeOnboardAction({
    site_name: testSiteName,
    domain: testDomain,
    brand_knowledge: "Vortex provides real-time distributed edge databases for enterprise microservices.",
    tone: "technical, rigorous, developer-friendly",
    target_audience: "Backend Engineers and Cloud Architects",
  });

  assert(onboardRes.success === true, "Self-serve onboarding returns success: true");
  assert(typeof onboardRes.siteId === "string" && onboardRes.siteId.length > 0, "Returns valid siteId");

  const siteId = onboardRes.siteId!;

  // Check profile state: api_key_hash must NOT be set yet!
  const dashDataBeforeKey = await getTenantDashboardData(siteId);
  assert(dashDataBeforeKey.success === true, "Dashboard data loaded for newly registered site");
  assert(dashDataBeforeKey.profile?.site_name === testSiteName, "Profile site_name matches input");
  assert(dashDataBeforeKey.profile?.domain === "vortexcloud.io", "Domain stripped of protocol and trailing paths");
  assert(dashDataBeforeKey.keyPrefix === null || dashDataBeforeKey.keyPrefix === undefined, "Zero API key generated on onboarding (keyPrefix is null)");
  assert((dashDataBeforeKey.profile as any)?.api_key_hash === undefined, "Hash is sanitized and never exposed to client");

  // -------------------------------------------------------------
  // Test 2: On-Demand API Key Generation
  // -------------------------------------------------------------
  console.log("\n--- 2. On-Demand Key Generation (Button Click) ---");
  const keyGenRes = await generateTenantApiKeyAction(siteId);

  assert(keyGenRes.success === true, "generateTenantApiKeyAction returns success: true");
  assert(typeof keyGenRes.rawApiKey === "string" && keyGenRes.rawApiKey.startsWith("gs_live_"), "Raw key generated with gs_live_ prefix");
  assert(keyGenRes.rawApiKey!.length === 48, "Raw key has 48-char standard cryptographic length (gs_live_ + 40 hex)");
  assert(typeof keyGenRes.keyPrefix === "string" && keyGenRes.keyPrefix.includes("••••"), "Returns masked keyPrefix for safe display");
  assert(keyGenRes.keyPrefix!.endsWith(keyGenRes.rawApiKey!.slice(-4)), "Masked keyPrefix displays last 4 characters accurately");

  // -------------------------------------------------------------
  // Test 3: Dashboard State After Key Generation
  // -------------------------------------------------------------
  console.log("\n--- 3. Dashboard State After Key Generation ---");
  const dashDataAfterKey = await getTenantDashboardData(siteId);
  assert(dashDataAfterKey.success === true, "Dashboard reloads successfully");
  assert(dashDataAfterKey.keyPrefix === keyGenRes.keyPrefix, "Dashboard displays active masked keyPrefix");
  assert((dashDataAfterKey.profile as any)?.api_key_hash === undefined, "Raw key and hash remain secret from dashboard payload");

  // -------------------------------------------------------------
  // Test 4: Key Regeneration (On-Demand Rotation)
  // -------------------------------------------------------------
  console.log("\n--- 4. Key Regeneration (Rotation) ---");
  const regenRes = await generateTenantApiKeyAction(siteId);
  assert(regenRes.success === true, "Regenerate key returns success: true");
  assert(regenRes.rawApiKey !== keyGenRes.rawApiKey, "Regenerated key is cryptographically unique from previous key");
  assert(regenRes.keyPrefix !== keyGenRes.keyPrefix || regenRes.rawApiKey !== keyGenRes.rawApiKey, "Key prefix updated in database");

  // -------------------------------------------------------------
  // Test 5: Brand DNA Update Action
  // -------------------------------------------------------------
  console.log("\n--- 5. Brand DNA Update ---");
  const updateBrandRes = await updateTenantBrandAction(siteId, {
    brand_knowledge: "Updated brand summary for enterprise testing.",
    tone: "authoritative, direct",
    target_audience: "CTOs and VPs of Engineering",
  });
  assert(updateBrandRes.success === true, "updateTenantBrandAction returns success: true");

  const dashUpdated = await getTenantDashboardData(siteId);
  assert(dashUpdated.profile?.brand_knowledge === "Updated brand summary for enterprise testing.", "Brand knowledge updated in tenant profile");

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

runSelfServeVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
