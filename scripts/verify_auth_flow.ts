import fs from "fs";
import path from "path";
import {
  selfServeOnboardAction,
  generateTenantApiKeyAction,
  getTenantDashboardData,
  getUserPrimarySiteId,
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

async function runAuthFlowVerification() {
  console.log("=================================================");
  console.log("  AUTH & ONBOARDING ARCHITECTURE VERIFICATION     ");
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

  // Test 1: Self-Serve Onboard with User Context
  console.log("--- 1. Onboard Brand Account Linked to User ---");
  const testSiteName = "Apex Dental Analytics";
  const testDomain = "https://apexdentalanalytics.com";

  const onboardRes = await selfServeOnboardAction({
    site_name: testSiteName,
    domain: testDomain,
    brand_knowledge: "AI practice management software for dental clinics across North America.",
    tone: "professional, trustworthy, clinical",
    target_audience: "Clinic owners and dental surgeons",
  });

  assert(onboardRes.success === true, "Onboarding succeeds", onboardRes.error);
  assert(Boolean(onboardRes.siteId), "Returns unique site ID", onboardRes.siteId);
  const siteId = onboardRes.siteId!;

  // Test 2: Verify Strict On-Demand Key Requirement
  console.log("\n--- 2. Verify Zero Auto-Key Generation ---");
  const dashDataBefore = await getTenantDashboardData(siteId);
  assert(dashDataBefore.success === true, "Dashboard data retrieved successfully");
  assert(dashDataBefore.profile?.api_key_hash === undefined, "API key hash is stripped from client profile for security");
  assert(dashDataBefore.keyPrefix === null, "Key prefix is NULL before user clicks generate");

  // Test 3: Generate Key On Demand
  console.log("\n--- 3. On-Demand Key Generation ---");
  const keyGenRes = await generateTenantApiKeyAction(siteId);
  assert(keyGenRes.success === true, "Key generation succeeds");
  assert(Boolean(keyGenRes.rawApiKey?.startsWith("gs_live_")), "Raw secret starts with gs_live_ prefix", keyGenRes.rawApiKey);
  assert(Boolean(keyGenRes.keyPrefix?.includes("••••")), "Masked key prefix formatted properly", keyGenRes.keyPrefix);

  // Test 4: Dashboard Data Reflects Generated Key
  console.log("\n--- 4. Verify Dashboard Key Status ---");
  const dashDataAfter = await getTenantDashboardData(siteId);
  assert(dashDataAfter.keyPrefix === keyGenRes.keyPrefix, "Dashboard displays matching masked prefix");
  assert(dashDataAfter.profile?.key_prefix === keyGenRes.keyPrefix, "Profile reflects generated masked prefix");

  console.log("\n=================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthFlowVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
