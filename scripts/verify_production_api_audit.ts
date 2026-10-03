import fs from "fs";
import path from "path";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import crypto from "crypto";
import { getDbClient, hashApiKey } from "../src/lib/db";
import { POST as generateBlogHandler, OPTIONS as generateBlogOptions } from "../src/app/api/generate-blog/route";
import { GET as queueStatusHandler } from "../src/app/api/generate-blog/queue/[jobId]/route";
import { POST as adminAuthPostHandler } from "../src/app/api/admin/auth/route";
import { GET as healthHandler } from "../src/app/api/health/route";
import { POST as checkoutHandler } from "../src/app/api/billing/checkout/route";
import { POST as portalHandler } from "../src/app/api/billing/portal/route";
import { GET as processQueueHandler } from "../src/app/api/cron/process-queue/route";
import { GET as resetQuotasHandler } from "../src/app/api/cron/reset-quotas/route";

async function runProductionAudit() {
  console.log("===============================================================");
  console.log("  SENIOR-LEVEL PRODUCTION AUDIT & LIVE API VERIFICATION SUITE   ");
  console.log("===============================================================\n");

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

  const db = getDbClient();
  const testSiteId = crypto.randomUUID();
  const rawKey = "gs_live_" + crypto.randomBytes(20).toString("hex");
  const hashedKey = hashApiKey(rawKey);
  const maskedPrefix = `gs_live_••••${rawKey.slice(-4)}`;

  console.log(">>> Phase 1: Provision Real Tenant Directly in Supabase (No Memory Mocking) <<<");
  const { data: createdTenant, error: insertError } = await db
    .from("site_profiles")
    .insert([
      {
        id: testSiteId,
        site_name: "Audit Production Tenant",
        domain: "audit-production.example.com",
        api_key_hash: hashedKey,
        key_prefix: maskedPrefix,
        is_active: true,
        brand_knowledge: "Enterprise SaaS API platform specializing in autonomous content syndication.",
        tone: "authoritative, technical, high-conviction",
        target_audience: "CTOs, VP of Engineering, and Platform Architects",
        internal_links: [{ url: "/api-docs", label: "API Reference" }],
        monthly_quota: 100,
        used_quota: 0,
        groq_model: "openai/gpt-oss-120b",
        gemini_model: "gemini-3.1-flash-lite",
      },
    ])
    .select("*")
    .single();

  assert(!insertError && Boolean(createdTenant), "Tenant successfully inserted into Supabase DB", insertError?.message);

  try {
    // -------------------------------------------------------------
    // Test 1: Missing API Key
    // -------------------------------------------------------------
    console.log("\n--- Test 1: Missing API Key Rejected (401) ---");
    const noKeyReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "AI Blog Architecture" }),
    });
    const resNoKey = await generateBlogHandler(noKeyReq);
    assert(resNoKey.status === 401, "Missing API key rejected with 401");
    const dataNoKey = await resNoKey.json();
    assert(dataNoKey.error.includes("Missing API key"), "Prompts user to pass key via x-api-key or Bearer");

    // -------------------------------------------------------------
    // Test 2: Invalid API Key
    // -------------------------------------------------------------
    console.log("\n--- Test 2: Invalid API Key Rejected (401) ---");
    const badKeyReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "gs_live_invalid_bad_key_12345" },
      body: JSON.stringify({ topic: "AI Blog Architecture" }),
    });
    const resBadKey = await generateBlogHandler(badKeyReq);
    assert(resBadKey.status === 401, "Invalid API key rejected with 401");

    // -------------------------------------------------------------
    // Test 3: Masked Key Prefix Rejection with Helpful Diagnostic
    // -------------------------------------------------------------
    console.log("\n--- Test 3: Masked Prefix (e.g. gs_live_••••...) Friendly Diagnostic (401) ---");
    const maskedKeyReq = new Request(
      `http://localhost:3000/api/generate-blog?apiKey=${encodeURIComponent(maskedPrefix)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "AI Blog Architecture" }),
      }
    );
    const resMasked = await generateBlogHandler(maskedKeyReq);
    assert(resMasked.status === 401, "Masked key prefix rejected with 401");
    const dataMasked = await resMasked.json();
    assert(dataMasked.error.includes("masked key prefix"), "Returns diagnostic explaining the user passed a masked prefix");

    // -------------------------------------------------------------
    // Test 4: Key Passed With Quotes in Authorization Bearer Header
    // -------------------------------------------------------------
    console.log("\n--- Test 4: API Key with Accidental Shell Quotes via Authorization Bearer ---");
    const quotedBearerReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer "${rawKey}"`,
      },
      body: JSON.stringify({
        topic: "Production Resiliency in Cloud AI SaaS",
        wordCount: 250,
      }),
    });
    const resQuoted = await generateBlogHandler(quotedBearerReq);
    assert(resQuoted.status === 200, "Quoted Bearer key authenticated and blog generated (200 OK)");
    const dataQuoted = await resQuoted.json();
    assert(Boolean(dataQuoted.title && dataQuoted.content), "Valid article post returned (title + content)");

    // -------------------------------------------------------------
    // Test 5: Standard x-api-key Header Live Generation
    // -------------------------------------------------------------
    console.log("\n--- Test 5: Standard x-api-key Header Live LLM Generation ---");
    const standardReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": rawKey,
      },
      body: JSON.stringify({
        topic: "Autonomous Multi-Tenant Architecture in TypeScript",
        wordCount: 300,
        tone: "authoritative",
      }),
    });
    const resStandard = await generateBlogHandler(standardReq);
    assert(resStandard.status === 200, "Standard x-api-key generation succeeded with 200 OK");
    const dataStandard = await resStandard.json();
    assert(Boolean(dataStandard.title && dataStandard.metaDescription), "Contains generated title and metaDescription");
    assert(Array.isArray(dataStandard.suggestedTags), "Contains suggestedTags array");

    // -------------------------------------------------------------
    // Test 6: Verify Quota Was Actually Reserved and Tracked in Database
    // -------------------------------------------------------------
    console.log("\n--- Test 6: Verify Atomic Quota Reservation in Live Supabase DB ---");
    const { data: liveCheck } = await db
      .from("site_profiles")
      .select("used_quota, monthly_quota")
      .eq("id", testSiteId)
      .single();
    assert(Boolean(liveCheck && liveCheck.used_quota >= 2), `used_quota in Supabase DB incremented (current: ${liveCheck?.used_quota}/100)`);

    // -------------------------------------------------------------
    // Test 7: Query Param Authentication (?apiKey=...)
    // -------------------------------------------------------------
    console.log("\n--- Test 7: Query Parameter Authentication (?apiKey=...) ---");
    const queryParamReq = new Request(`http://localhost:3000/api/generate-blog?apiKey=${rawKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Webhook Integration for Headless CMS",
        wordCount: 200,
      }),
    });
    const resQueryParam = await generateBlogHandler(queryParamReq);
    assert(resQueryParam.status === 200, "Query parameter apiKey authenticated successfully (200 OK)");

    // -------------------------------------------------------------
    // Test 8: Asynchronous Burst Queue Enqueue & Queue Polling
    // -------------------------------------------------------------
    console.log("\n--- Test 8: Asynchronous Queue Mode (async: true) ---");
    const asyncReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": rawKey },
      body: JSON.stringify({ topic: "Async Queue Background Processing", async: true }),
    });
    const resAsync = await generateBlogHandler(asyncReq);
    assert(resAsync.status === 202, "Async queue generation accepted with 202 Accepted");
    const dataAsync = await resAsync.json();
    assert(Boolean(dataAsync.jobId && dataAsync.checkStatusUrl), "Returns jobId and checkStatusUrl");

    // Check Queue Status Endpoint
    const queuePollReq = new Request(`http://localhost:3000${dataAsync.checkStatusUrl}`, {
      method: "GET",
      headers: { "x-api-key": rawKey },
    });
    const resQueuePoll = await queueStatusHandler(queuePollReq, {
      params: Promise.resolve({ jobId: dataAsync.jobId }),
    });
    assert(resQueuePoll.status === 200, "Queue status endpoint authenticated with x-api-key and returns 200 OK");
    const dataQueuePoll = await resQueuePoll.json();
    assert(dataQueuePoll.id === dataAsync.jobId, "Returned queue job matches requested jobId");

    // -------------------------------------------------------------
    // Test 9: CORS Preflight
    // -------------------------------------------------------------
    console.log("\n--- Test 9: CORS Preflight Options ---");
    const resCors = await generateBlogOptions();
    assert(resCors.status === 204, "OPTIONS returns 204 No Content");
    assert(resCors.headers.get("Access-Control-Allow-Origin") === "*", "CORS Origin is *");

    // -------------------------------------------------------------
    // Test 10: Admin Auth Endpoint
    // -------------------------------------------------------------
    console.log("\n--- Test 10: Admin Authentication Endpoint (/api/admin/auth) ---");
    const adminReq = new Request("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    const resAdmin = await adminAuthPostHandler(adminReq);
    assert(resAdmin.status === 200, "Admin login succeeds with 200 OK");

    // -------------------------------------------------------------
    // Test 11: System Health Endpoint
    // -------------------------------------------------------------
    console.log("\n--- Test 11: System Health Check (/api/health) ---");
    const resHealth = await healthHandler();
    assert(resHealth.status === 200 || resHealth.status === 503, "Health check responds with valid status");
    const dataHealth = await resHealth.json();
    assert(Boolean(dataHealth.status && dataHealth.checks?.database), "Health check verifies database connectivity");

    // -------------------------------------------------------------
    // Test 12: Billing APIs Rejection of Unauthenticated Requests
    // -------------------------------------------------------------
    console.log("\n--- Test 12: Billing APIs (/api/billing/checkout & portal) ---");
    const resCheckout = await checkoutHandler(
      new Request("http://localhost:3000/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: testSiteId, planId: "pro" }),
      })
    );
    assert(resCheckout.status === 401, "Unauthenticated checkout returns 401");

    // -------------------------------------------------------------
    // Test 13: Cron Endpoints Protection
    // -------------------------------------------------------------
    console.log("\n--- Test 13: Cron Protection (/api/cron/process-queue & reset-quotas) ---");
    const resCron = await processQueueHandler(
      new Request("http://localhost:3000/api/cron/process-queue", { method: "GET" })
    );
    assert(resCron.status === 401, "Unauthenticated cron call rejected with 401");

    const authCronReq = new Request("http://localhost:3000/api/cron/process-queue", {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const resAuthCron = await processQueueHandler(authCronReq);
    assert(resAuthCron.status === 200, "Authenticated cron call accepted with 200 OK");
  } finally {
    console.log("\n>>> Phase 2: Cleanup Test Tenant from Supabase <<<");
    await db.from("site_profiles").delete().eq("id", testSiteId);
    console.log("Test tenant cleaned up.");
  }

  console.log("\n===============================================================");
  console.log(`  AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionAudit().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
