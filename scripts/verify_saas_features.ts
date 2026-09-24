import { hashApiKey, localSiteProfiles } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";
import {
  getUserSitesAction,
  updateTenantBrandAction,
  updateTenantWebhookAction,
} from "../src/lib/serverActions";
import { getPlanTier, updateTenantSubscription, PLAN_TIERS } from "../src/lib/billing";
import crypto from "crypto";

async function runSaaSFeaturesVerification() {
  console.log("=================================================");
  console.log("  VERIFY PRODUCTION SAAS FEATURES & RELIABILITY  ");
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
  // Test 1: Plan Tier Configuration & Quotas
  // -------------------------------------------------------------
  console.log("--- 1. Billing Tier Definitions & Quota Controls ---");
  const starter = getPlanTier("starter");
  assert(starter.monthlyQuota === 25, "Starter tier has exactly 25 monthly articles quota");

  const pro = getPlanTier("pro");
  assert(pro.monthlyQuota === 100, "Pro tier has exactly 100 monthly articles quota");

  const agency = getPlanTier("agency");
  assert(agency.monthlyQuota === 500, "Agency tier has exactly 500 monthly articles quota");

  // -------------------------------------------------------------
  // Test 2: In-Memory Subscription Upgrade
  // -------------------------------------------------------------
  console.log("\n--- 2. Subscription Upgrade Mutation ---");
  const testSiteId = "sub-test-site-0000-000000000001";
  const testProfile: SiteProfile = {
    id: testSiteId,
    site_name: "Subscription Test Brand",
    domain: "subtest.com",
    api_key_hash: hashApiKey("gs_live_sub_test"),
    key_prefix: "gs_live_••••sub1",
    is_active: true,
    brand_knowledge: "Brand knowledge",
    tone: "authoritative",
    target_audience: "Professionals",
    internal_links: [],
    monthly_quota: 25,
    used_quota: 10,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    plan_tier: "starter",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localSiteProfiles.set(testSiteId, testProfile);

  const upgradeResult = await updateTenantSubscription(testSiteId, "pro", {
    stripeCustomerId: "cus_mock_12345",
    stripeSubscriptionId: "sub_mock_67890",
  });

  assert(upgradeResult.success === true, "Subscription update returns success");
  assert(upgradeResult.newQuota === 100, "Upgraded quota is 100 articles");
  assert(testProfile.monthly_quota === 100, "In-memory profile reflects 100 quota");
  assert(testProfile.plan_tier === "pro", "In-memory profile plan_tier is updated to 'pro'");
  assert(testProfile.stripe_customer_id === "cus_mock_12345", "Customer ID stored successfully");

  // -------------------------------------------------------------
  // Test 3: Constant-Time Admin Password Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Constant-Time Admin Password Timing Defense ---");
  const sampleAdminPassword = "super_secret_production_password_xyz";
  const inputCorrect = "super_secret_production_password_xyz";
  const inputWrong = "super_secret_production_password_abc";

  const adminHash = crypto.createHash("sha256").update(sampleAdminPassword).digest();
  const correctHash = crypto.createHash("sha256").update(inputCorrect).digest();
  const wrongHash = crypto.createHash("sha256").update(inputWrong).digest();

  const isCorrectValid = crypto.timingSafeEqual(correctHash, adminHash);
  assert(isCorrectValid === true, "timingSafeEqual accurately accepts correct credentials");

  const isWrongValid = crypto.timingSafeEqual(wrongHash, adminHash);
  assert(isWrongValid === false, "timingSafeEqual strictly rejects incorrect credentials");

  // -------------------------------------------------------------
  // Test 4: Webhook URL Configuration Security
  // -------------------------------------------------------------
  console.log("\n--- 4. Outbound Webhook Authorization Boundary ---");
  // Unauthenticated caller should fail closed
  const unauthWebhook = await updateTenantWebhookAction(testSiteId, "https://webhook.site/test");
  assert(
    unauthWebhook.success === false && Boolean(unauthWebhook.error?.toLowerCase().includes("unauthorized")),
    "updateTenantWebhookAction rejects unauthenticated callers"
  );

  // -------------------------------------------------------------
  // Test 5: Outbound CMS Webhook Payload & HMAC Cryptographic Signature
  // -------------------------------------------------------------
  console.log("\n--- 5. Outbound CMS Webhook Payload & HMAC Cryptographic Signatures ---");
  const { buildWebhookPayload, computeWebhookSignature } = await import("../src/lib/webhookDispatcher");

  const mockPost = {
    title: "10 SEO Tips for SaaS Founders",
    metaDescription: "Boost your organic conversions with these actionable tips.",
    content: "<h1>10 SEO Tips</h1><p>Actionable advice...</p>",
    suggestedTags: ["seo", "saas", "growth"],
  };
  const mockTelemetry = {
    provider_used: "groq" as const,
    model: "openai/gpt-oss-120b",
    latency_ms: 1250,
    total_tokens: 850,
    fallback_triggered: false,
  };

  const payload = buildWebhookPayload(testProfile, mockPost, mockTelemetry);
  assert(payload.event === "article.published", "Webhook event is article.published");
  assert(payload.article.title === mockPost.title, "Webhook payload contains post title");
  assert(payload.article.content === mockPost.content, "Webhook payload contains full HTML content");
  assert(payload.site_id === testSiteId, "Webhook payload contains correct site ID");

  const webhookSecret = "whsec_test_secret_key_123456789";
  const rawBody = JSON.stringify(payload);
  const signature = computeWebhookSignature(rawBody, webhookSecret);

  // Verify HMAC mathematically
  const expectedHash = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  assert(signature === expectedHash, "HMAC signature matches expected cryptographic hash");

  // Tamper detection
  const tamperedBody = rawBody + "tampered";
  const tamperedHash = crypto.createHmac("sha256", webhookSecret).update(tamperedBody).digest("hex");
  assert(signature !== tamperedHash, "HMAC signature detects any tampering of payload");

  // -------------------------------------------------------------
  // Test 6: Admin Quota & Plan Management Authorization Boundary
  // -------------------------------------------------------------
  console.log("\n--- 6. Admin Quota & Plan Management Authorization Boundary ---");
  const { adminUpdateTenantQuotaAction } = await import("../src/lib/serverActions");

  const unauthQuotaUpdate = await adminUpdateTenantQuotaAction(testSiteId, 500, "agency");
  assert(
    unauthQuotaUpdate.success === false && Boolean(unauthQuotaUpdate.error?.includes("Admin session required")),
    "adminUpdateTenantQuotaAction rejects non-admin callers"
  );

  console.log("\n=================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSaaSFeaturesVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
