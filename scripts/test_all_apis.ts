import { GET as healthHandler, OPTIONS as healthOptionsHandler } from "../src/app/api/health/route";
import { POST as adminAuthPostHandler, DELETE as adminAuthDeleteHandler } from "../src/app/api/admin/auth/route";
import { POST as generateBlogHandler, OPTIONS as generateBlogOptionsHandler } from "../src/app/api/generate-blog/route";
import { GET as queueStatusHandler } from "../src/app/api/generate-blog/queue/[jobId]/route";
import { POST as checkoutHandler } from "../src/app/api/billing/checkout/route";
import { POST as portalHandler } from "../src/app/api/billing/portal/route";
import { GET as processQueueHandler } from "../src/app/api/cron/process-queue/route";
import { GET as resetQuotasHandler } from "../src/app/api/cron/reset-quotas/route";
import { POST as stripeWebhookHandler } from "../src/app/api/webhooks/stripe/route";
import { localSiteProfiles, hashApiKey } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";
import crypto from "crypto";

// Ensure essential env vars exist for the test runner
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TestAdminPassword123!";
process.env.ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "test_admin_session_token_xyz";
process.env.CRON_SECRET = process.env.CRON_SECRET || "test_cron_secret_abc123";

async function runAllApisTestSuite() {
  console.log("=================================================");
  console.log("  COMPREHENSIVE API AUDIT & EXECUTION TEST SUITE ");
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

  // Set up a mock tenant profile in local memory
  const testSiteId = "test-site-" + Date.now();
  const rawKey = "gs_live_" + crypto.randomBytes(20).toString("hex");
  const hashedKey = hashApiKey(rawKey);

  const fixtureProfile: SiteProfile = {
    id: testSiteId,
    site_name: "API Test Suite Site",
    domain: "apitest.example.com",
    api_key_hash: hashedKey,
    key_prefix: `gs_live_••••${rawKey.slice(-4)}`,
    is_active: true,
    brand_knowledge: "Technical enterprise SEO test profile.",
    tone: "rigorous, authoritative",
    target_audience: "CTOs and Tech Leads",
    internal_links: [{ url: "/docs", label: "Documentation" }],
    monthly_quota: 100,
    used_quota: 0,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-3.1-pro-preview",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localSiteProfiles.set(testSiteId, fixtureProfile);

  // -------------------------------------------------------------
  // 1. Health API Check (/api/health)
  // -------------------------------------------------------------
  console.log("--- 1. Health Check Endpoint (/api/health) ---");
  const healthReq = new Request("http://localhost:3000/api/health", { method: "GET" });
  const healthRes = await healthHandler();
  assert(healthRes.status === 200 || healthRes.status === 503, "Health endpoint returns valid status code (200 or 503)");
  const healthData = await healthRes.json();
  assert(Boolean(healthData.status && healthData.checks), "Health payload contains status and subsystem checks");

  const healthOptionsRes = await healthOptionsHandler();
  assert(healthOptionsRes.status === 204, "Health OPTIONS preflight returns 204 No Content");

  // -------------------------------------------------------------
  // 2. Admin Auth API (/api/admin/auth)
  // -------------------------------------------------------------
  console.log("\n--- 2. Admin Auth Endpoint (/api/admin/auth) ---");
  // Missing password
  const emptyAuthReq = new Request("http://localhost:3000/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const emptyAuthRes = await adminAuthPostHandler(emptyAuthReq);
  assert(emptyAuthRes.status === 400, "Empty admin password rejected with 400 Bad Request");

  // Wrong password
  const wrongAuthReq = new Request("http://localhost:3000/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "CompletelyWrongPassword!" }),
  });
  const wrongAuthRes = await adminAuthPostHandler(wrongAuthReq);
  assert(wrongAuthRes.status === 401, "Invalid admin password rejected with 401 Unauthorized");

  // Valid password
  const validAuthReq = new Request("http://localhost:3000/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  });
  const validAuthRes = await adminAuthPostHandler(validAuthReq);
  assert(validAuthRes.status === 200, "Valid admin credentials return 200 OK");
  const validAuthData = await validAuthRes.json();
  assert(validAuthData.success === true, "Admin session authenticated successfully");

  // Admin Logout (DELETE)
  const logoutRes = await adminAuthDeleteHandler();
  assert(logoutRes.status === 200, "Admin logout (DELETE) returns 200 OK");

  // -------------------------------------------------------------
  // 3. Blog Generation API (/api/generate-blog)
  // -------------------------------------------------------------
  console.log("\n--- 3. Blog Generation Endpoint (/api/generate-blog) ---");
  // CORS Preflight
  const corsRes = await generateBlogOptionsHandler();
  assert(corsRes.status === 204, "OPTIONS preflight returns 204 No Content");
  assert(corsRes.headers.get("Access-Control-Allow-Origin") === "*", "CORS allow origin set to *");

  // Missing API Key
  const noKeyReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Test Topic" }),
  });
  const noKeyRes = await generateBlogHandler(noKeyReq);
  assert(noKeyRes.status === 401, "Missing API key rejected with 401 Unauthorized");

  // Invalid API Key
  const badKeyReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": "gs_live_invalid_fake_key" },
    body: JSON.stringify({ topic: "Test Topic" }),
  });
  const badKeyRes = await generateBlogHandler(badKeyReq);
  assert(badKeyRes.status === 401, "Invalid API key rejected with 401 Access Denied");

  // Valid API Key with Empty Topic
  const emptyTopicReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": rawKey },
    body: JSON.stringify({ topic: "" }),
  });
  const emptyTopicRes = await generateBlogHandler(emptyTopicReq);
  assert(emptyTopicRes.status === 400, "Empty topic rejected with 400 Bad Request");

  // Valid API Key with Async Queue Option
  const asyncQueueReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": rawKey },
    body: JSON.stringify({ topic: "Autonomous API Testing in High Scale SaaS", async: true }),
  });
  const asyncQueueRes = await generateBlogHandler(asyncQueueReq);
  assert(asyncQueueRes.status === 202, "Async queue generation accepted with 202 Accepted");
  const asyncQueueData = await asyncQueueRes.json();
  assert(Boolean(asyncQueueData.jobId && asyncQueueData.checkStatusUrl), "Returns jobId and checkStatusUrl");

  // -------------------------------------------------------------
  // 4. Queue Status Endpoint (/api/generate-blog/queue/[jobId])
  // -------------------------------------------------------------
  console.log("\n--- 4. Queue Status Endpoint (/api/generate-blog/queue/[jobId]) ---");
  const queueReq = new Request("http://localhost:3000/api/generate-blog/queue/non-existent-job-id", {
    method: "GET",
    headers: { "x-api-key": rawKey },
  });
  const queueRes = await queueStatusHandler(queueReq, { params: Promise.resolve({ jobId: "non-existent-job-id" }) });
  assert(queueRes.status === 404, "Non-existent job returns 404 Not Found");

  // -------------------------------------------------------------
  // 5. Billing APIs (/api/billing/checkout & /api/billing/portal)
  // -------------------------------------------------------------
  console.log("\n--- 5. Billing Endpoints (/api/billing/checkout & portal) ---");
  // Unauthenticated checkout request
  const unauthCheckoutReq = new Request("http://localhost:3000/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteId: testSiteId, planId: "pro" }),
  });
  const unauthCheckoutRes = await checkoutHandler(unauthCheckoutReq);
  assert(unauthCheckoutRes.status === 401, "Unauthenticated checkout rejected with 401 Unauthorized");

  // Unauthenticated portal request
  const unauthPortalReq = new Request("http://localhost:3000/api/billing/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteId: testSiteId }),
  });
  const unauthPortalRes = await portalHandler(unauthPortalReq);
  assert(unauthPortalRes.status === 401, "Unauthenticated billing portal rejected with 401 Unauthorized");

  // -------------------------------------------------------------
  // 6. Cron Endpoints (/api/cron/process-queue & reset-quotas)
  // -------------------------------------------------------------
  console.log("\n--- 6. Cron Endpoints (/api/cron/process-queue & reset-quotas) ---");
  // Unauthenticated process-queue
  const unauthCronReq = new Request("http://localhost:3000/api/cron/process-queue", { method: "GET" });
  const unauthCronRes = await processQueueHandler(unauthCronReq);
  assert(unauthCronRes.status === 401, "Unauthenticated cron invocation rejected with 401");

  // Authorized process-queue via Bearer CRON_SECRET
  const authCronReq = new Request("http://localhost:3000/api/cron/process-queue?batchSize=1", {
    method: "GET",
    headers: { "Authorization": `Bearer ${process.env.CRON_SECRET}` },
  });
  const authCronRes = await processQueueHandler(authCronReq);
  assert(authCronRes.status === 200, "Authorized cron process-queue invocation returns 200 OK");
  const cronData = await authCronRes.json();
  assert(cronData.success === true, "Process queue reports success: true");

  // Authorized reset-quotas via Bearer CRON_SECRET
  const authResetReq = new Request("http://localhost:3000/api/cron/reset-quotas", {
    method: "GET",
    headers: { "Authorization": `Bearer ${process.env.CRON_SECRET}` },
  });
  const authResetRes = await resetQuotasHandler(authResetReq);
  assert(authResetRes.status === 200, "Authorized cron reset-quotas returns 200 OK");
  const resetData = await authResetRes.json();
  assert(resetData.success === true, "Reset quotas reports success: true");

  // -------------------------------------------------------------
  // 7. Stripe Webhook Endpoint (/api/webhooks/stripe)
  // -------------------------------------------------------------
  console.log("\n--- 7. Stripe Webhook Endpoint (/api/webhooks/stripe) ---");
  // Simulated checkout completed webhook in test mode
  const webhookBody = JSON.stringify({
    type: "checkout.session.completed",
    data: {
      object: {
        client_reference_id: testSiteId,
        customer: "cus_mock_test_123",
        subscription: "sub_mock_test_456",
        metadata: { siteId: testSiteId, planId: "pro" },
      },
    },
  });

  const webhookReq = new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: webhookBody,
  });

  const webhookRes = await stripeWebhookHandler(webhookReq);
  assert(webhookRes.status === 200, "Stripe webhook processed successfully (200 OK)");
  const webhookData = await webhookRes.json();
  assert(webhookData.received === true, "Webhook returns { received: true }");

  console.log("\n=================================================");
  console.log(`  API SUITE RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllApisTestSuite().catch((err) => {
  console.error("Unhandled error running API test suite:", err);
  process.exit(1);
});
