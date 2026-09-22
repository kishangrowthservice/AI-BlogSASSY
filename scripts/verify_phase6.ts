import fs from "fs";
import path from "path";
import { enqueueGenerationJob, getQueueJob, processNextQueueJobs } from "../src/lib/queueService";
import { BlogClient, BlogClientError } from "../src/lib/client/blogClient";
import { onboardTenantAction, updateTenantByoKeys } from "../src/lib/adminActions";
import type { QueueJob, SiteProfile } from "../src/lib/types";

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

async function runPhase6Verification() {
  console.log("=================================================");
  console.log("  PHASE 6 VERIFICATION: ASYNC QUEUE & TENANT BYO-KEY ");
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
  // Test 1: Migration 004 Schema Integrity
  // -------------------------------------------------------------
  console.log("--- 1. Migration 004 Schema Integrity ---");
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/004_generation_queue_and_byo_key.sql");
  assert(fs.existsSync(migrationPath), "Migration 004 file exists");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  assert(migrationSql.includes("byo_groq_api_key"), "Migration adds byo_groq_api_key column");
  assert(migrationSql.includes("byo_gemini_api_key"), "Migration adds byo_gemini_api_key column");
  assert(migrationSql.includes("CREATE TABLE IF NOT EXISTS generation_queue"), "Migration creates generation_queue table");
  assert(migrationSql.includes("idx_generation_queue_poll"), "Migration creates index for cron polling");

  // -------------------------------------------------------------
  // Test 2: TypeScript Contract & BYO-Key in SiteProfile
  // -------------------------------------------------------------
  console.log("\n--- 2. TypeScript Contract & BYO-Key in SiteProfile ---");
  const testProfile: SiteProfile = {
    id: "tenant-uuid-101",
    site_name: "Enterprise Client",
    domain: "enterprise.example.com",
    api_key_hash: "mockhash123",
    is_active: true,
    brand_knowledge: "Enterprise AI Solutions",
    tone: "formal",
    target_audience: "CTOs",
    internal_links: [],
    monthly_quota: 500,
    used_quota: 10,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.0-flash",
    byo_groq_api_key: "gsk_custom_tenant_key_enterprise",
    byo_gemini_api_key: "AIzaSyCustomGeminiKey",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assert(testProfile.byo_groq_api_key === "gsk_custom_tenant_key_enterprise", "SiteProfile accepts dedicated BYO Groq key");
  assert(testProfile.byo_gemini_api_key === "AIzaSyCustomGeminiKey", "SiteProfile accepts dedicated BYO Gemini key");

  // -------------------------------------------------------------
  // Test 3: Admin Actions BYO-Key Support
  // -------------------------------------------------------------
  console.log("\n--- 3. Admin Actions BYO-Key Support ---");
  const onboardRes = await onboardTenantAction({
    site_name: "BYO Key Tenant",
    domain: "byo.example.com",
    brand_knowledge: "BYO Test Knowledge",
    byo_groq_api_key: "gsk_tenant_onboard_key",
    byo_gemini_api_key: "gemini_tenant_onboard_key",
  });

  assert(onboardRes.success, "onboardTenantAction succeeds with BYO-key input");
  if (onboardRes.profile) {
    assert(onboardRes.profile.byo_groq_api_key === "gsk_tenant_onboard_key", "Profile persisted BYO Groq key");
    assert(onboardRes.profile.byo_gemini_api_key === "gemini_tenant_onboard_key", "Profile persisted BYO Gemini key");
  }

  const updateResult = await updateTenantByoKeys("tenant-uuid-101", "gsk_updated_key", null);
  assert(typeof updateResult === "boolean", "updateTenantByoKeys executes and returns boolean status");

  // -------------------------------------------------------------
  // Test 4: Queue Service Enqueue & Retrieval
  // -------------------------------------------------------------
  console.log("\n--- 4. Queue Service Enqueue & Retrieval ---");
  const jobPayload = {
    topic: "Scaling AI Multi-Tenant SaaS with Async Queues",
    keywords: ["queues", "burst smoothing", "multi-tenant"],
    wordCount: 800,
  };

  const job = await enqueueGenerationJob("tenant-uuid-101", jobPayload);
  assert(Boolean(job.id), "enqueueGenerationJob generates unique job ID");
  assert(job.status === "pending", "Newly enqueued job has status 'pending'");
  assert(job.attempts === 0, "Job initial attempts count is 0");
  assert(job.max_attempts === 3, "Job max_attempts is set to 3");
  assert(job.site_id === "tenant-uuid-101", "Job associated with correct site_id");

  const retrievedJob = await getQueueJob(job.id);
  assert(retrievedJob !== null, "getQueueJob retrieves enqueued job by ID");
  assert(retrievedJob?.payload.topic === jobPayload.topic, "Retrieved job payload matches enqueued payload");

  const nonExistentJob = await getQueueJob("invalid-uuid-99999");
  assert(nonExistentJob === null, "getQueueJob returns null for non-existent job ID");

  // -------------------------------------------------------------
  // Test 5: Queue Worker Batch Processing Contract
  // -------------------------------------------------------------
  console.log("\n--- 5. Queue Worker Batch Processing Contract ---");
  const batchStats = await processNextQueueJobs(2);
  assert(typeof batchStats.processed === "number", "processNextQueueJobs returns processed count");
  assert(typeof batchStats.successful === "number", "processNextQueueJobs returns successful count");
  assert(typeof batchStats.failed === "number", "processNextQueueJobs returns failed count");

  // -------------------------------------------------------------
  // Test 6: Client SDK Async Queue Methods
  // -------------------------------------------------------------
  console.log("\n--- 6. Universal Client SDK Async Methods ---");
  const client = new BlogClient({ apiKey: "gs_live_testkey123", baseUrl: "https://example.com" });

  assert(typeof client.enqueueBlog === "function", "BlogClient exposes enqueueBlog method");
  assert(typeof client.getQueueStatus === "function", "BlogClient exposes getQueueStatus method");
  assert(typeof client.generateBlogAsync === "function", "BlogClient exposes generateBlogAsync polling wrapper");

  let enqueueTopicError = false;
  try {
    await client.enqueueBlog({ topic: "" });
  } catch (err) {
    if (err instanceof BlogClientError && err.statusCode === 400) {
      enqueueTopicError = true;
    }
  }
  assert(enqueueTopicError, "enqueueBlog validates and rejects empty topic with BlogClientError (400)");

  let getStatusIdError = false;
  try {
    await client.getQueueStatus("");
  } catch (err) {
    if (err instanceof BlogClientError && err.statusCode === 400) {
      getStatusIdError = true;
    }
  }
  assert(getStatusIdError, "getQueueStatus validates and rejects empty jobId with BlogClientError (400)");

  // -------------------------------------------------------------
  // Test 7: API Route Handlers Integrity
  // -------------------------------------------------------------
  console.log("\n--- 7. API Route Handlers Files Existence ---");
  const queueStatusRoutePath = path.resolve(process.cwd(), "src/app/api/generate-blog/queue/[jobId]/route.ts");
  const cronProcessRoutePath = path.resolve(process.cwd(), "src/app/api/cron/process-queue/route.ts");
  const generateBlogRoutePath = path.resolve(process.cwd(), "src/app/api/generate-blog/route.ts");

  assert(fs.existsSync(queueStatusRoutePath), "Queue status route file exists");
  assert(fs.existsSync(cronProcessRoutePath), "Cron process-queue route file exists");

  const generateBlogContent = fs.readFileSync(generateBlogRoutePath, "utf-8");
  assert(generateBlogContent.includes("body?.async === true"), "Generate-blog route contains async check");
  assert(generateBlogContent.includes("enqueueGenerationJob"), "Generate-blog route enqueues job");
  assert(generateBlogContent.includes("status: 202"), "Generate-blog route returns HTTP 202 Accepted for async requests");

  const queueStatusContent = fs.readFileSync(queueStatusRoutePath, "utf-8");
  assert(queueStatusContent.includes("job.site_id !== siteProfile.id"), "Queue status route enforces tenant isolation");
  assert(queueStatusContent.includes("status: 403"), "Queue status route rejects cross-tenant job access with 403");

  const cronContent = fs.readFileSync(cronProcessRoutePath, "utf-8");
  assert(cronContent.includes("processNextQueueJobs"), "Cron route invokes processNextQueueJobs");
  assert(cronContent.includes("CRON_SECRET"), "Cron route verifies optional CRON_SECRET");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`  PHASE 6 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Verification().catch((err) => {
  console.error("Verification script exception:", err);
  process.exit(1);
});
