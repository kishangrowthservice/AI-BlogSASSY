import { hashApiKey, localSiteProfiles, getSiteProfileByApiKey } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";
import { POST as generateBlogHandler } from "../src/app/api/generate-blog/route";
import { GET as getQueueHandler } from "../src/app/api/generate-blog/queue/[jobId]/route";
import crypto from "crypto";

async function runApiVerification() {
  console.log("=================================================");
  console.log("  VERIFY DEVELOPER API INTEGRATION (END-TO-END) ");
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

  // 1. Fixture Setup: Create an active test tenant with API key
  const testSiteId = "test-api-tenant-" + Date.now();
  const rawKey = "ak_live_" + crypto.randomBytes(16).toString("hex");
  const hashedKey = hashApiKey(rawKey);

  const fixtureProfile: SiteProfile = {
    id: testSiteId,
    site_name: "Developer API Test Site",
    domain: "api-test.com",
    api_key_hash: hashedKey,
    key_prefix: rawKey.slice(0, 12),
    is_active: true,
    brand_knowledge: "Autonomous B2B marketing engine",
    tone: "Authoritative, technical",
    target_audience: "Software developers",
    internal_links: [{ url: "/api-docs", label: "Developer Docs", category: "API" }],
    monthly_quota: 50,
    used_quota: 0,
    groq_model: "llama-3.3-70b-versatile",
    gemini_model: "gemini-2.0-flash",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localSiteProfiles.set(testSiteId, fixtureProfile);

  // --- Test 1: Authentication Failure on Missing Key ---
  console.log("--- 1. Missing Key Rejection ---");
  const missingKeyReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Test Topic" }),
  });
  const res1 = await generateBlogHandler(missingKeyReq);
  assert(res1.status === 401, "Missing API key returns 401 Unauthorized");
  const data1 = await res1.json();
  assert(data1.error.includes("Missing API key"), "Error message prompts for x-api-key or Authorization Bearer");

  // --- Test 2: Authentication Failure on Invalid Key ---
  console.log("\n--- 2. Invalid Key Rejection ---");
  const invalidKeyReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "ak_live_invalid_bad_key_12345",
    },
    body: JSON.stringify({ topic: "Test Topic" }),
  });
  const res2 = await generateBlogHandler(invalidKeyReq);
  assert(res2.status === 401, "Invalid API key returns 401 Access Denied");

  // --- Test 3: Key Resolution via x-api-key Header ---
  console.log("\n--- 3. Header Resolution (x-api-key) ---");
  const resolvedProfile1 = await getSiteProfileByApiKey(rawKey);
  assert(Boolean(resolvedProfile1 && resolvedProfile1.id === testSiteId), "Site profile correctly resolved by raw key hash");

  // --- Test 4: Header Resolution via Authorization: Bearer Header ---
  console.log("\n--- 4. Header Resolution (Authorization: Bearer <key>) ---");
  const bearerReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${rawKey}`,
    },
    body: JSON.stringify({}), // empty body to test auth pass before validation
  });
  const resBearer = await generateBlogHandler(bearerReq);
  // Auth must succeed, validation should return 400 for missing topic
  assert(resBearer.status === 400, "Authorization Bearer header accepted; proceeds to payload validation (400)");
  const dataBearer = await resBearer.json();
  assert(dataBearer.error.includes("Field 'topic' is required"), "Validation correctly identifies missing topic parameter");

  // --- Test 5: Input Validation & Clamping ---
  console.log("\n--- 5. Input Validation ---");
  const emptyTopicReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": rawKey,
    },
    body: JSON.stringify({ topic: "   " }),
  });
  const resEmptyTopic = await generateBlogHandler(emptyTopicReq);
  assert(resEmptyTopic.status === 400, "Whitespace-only topic rejected with 400 Bad Request");

  // --- Test 6: Queue Endpoint Authorization with Bearer Token ---
  console.log("\n--- 6. Queue Status Endpoint Bearer Auth ---");
  const queueReq = new Request("http://localhost:3000/api/generate-blog/queue/job_123", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${rawKey}`,
    },
  });
  const resQueue = await getQueueHandler(queueReq, { params: Promise.resolve({ jobId: "job_123" }) });
  // Should pass auth and return 404 for non-existent job
  assert(resQueue.status === 404, "Queue route accepts Bearer auth token and correctly looks up job (404)");

  // --- Test 7: Quota Exceeded Enforcement ---
  console.log("\n--- 7. Quota Overdraft Protection ---");
  const maxedProfile: SiteProfile = {
    ...fixtureProfile,
    id: "maxed-tenant-" + Date.now(),
    monthly_quota: 10,
    used_quota: 10,
  };
  const maxedRawKey = "ak_live_maxed_" + crypto.randomBytes(8).toString("hex");
  maxedProfile.api_key_hash = hashApiKey(maxedRawKey);
  localSiteProfiles.set(maxedProfile.id, maxedProfile);

  const maxedReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${maxedRawKey}`,
    },
    body: JSON.stringify({ topic: "Scale Topic" }),
  });
  const resMaxed = await generateBlogHandler(maxedReq);
  assert(resMaxed.status === 429, "Exhausted quota returns 429 Too Many Requests");
  const dataMaxed = await resMaxed.json();
  assert(dataMaxed.error.includes("Monthly generation quota exceeded"), "Detailed quota upgrade message returned");

  // Summary
  console.log("\n=================================================");
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runApiVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
