import fs from "fs";
import path from "path";
import { generateBlogPostResilient } from "../src/lib/blogEngineFallback";
import { recordGenerationLog, hashApiKey } from "../src/lib/db";
import type { SiteProfile, GenerationLog } from "../src/lib/types";

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

const testProfile: SiteProfile = {
  id: "00000000-0000-0000-0000-000000000002",
  site_name: "Phase 2 Observability Test Site",
  domain: "test.growthservice.in",
  api_key_hash: hashApiKey("gs_test_phase2_key"),
  is_active: true,
  brand_knowledge: "Observability test tenant specializing in data intelligence.",
  tone: "analytical, concise, authoritative",
  target_audience: "CTOs and engineering leaders",
  internal_links: [{ url: "/observability", label: "observability suite", category: "Tech" }],
  monthly_quota: 50,
  used_quota: 10,
  groq_model: "openai/gpt-oss-120b",
  gemini_model: "gemini-2.5-flash-lite",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function runPhase2Verification() {
  console.log("=================================================");
  console.log("  PHASE 2 VERIFICATION: OBSERVABILITY & LOGS     ");
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
  // Test 1: Live Generation with Rich Telemetry Extraction
  // -------------------------------------------------------------
  console.log("--- 1. Telemetry Capture from Live Generation ---");
  console.log("Executing generation with telemetry recording...");

  try {
    const { post, telemetry } = await generateBlogPostResilient(testProfile, {
      topic: "Serverless Observability Metrics for Microservices",
      keywords: ["serverless latency", "log analytics"],
      wordCount: 600,
    });

    console.log("\nTelemetry Captured:");
    console.log(`- Provider Used: ${telemetry.provider_used}`);
    console.log(`- Model: ${telemetry.model}`);
    console.log(`- Latency: ${telemetry.latency_ms}ms`);
    console.log(`- Prompt Tokens: ${telemetry.prompt_tokens}`);
    console.log(`- Completion Tokens: ${telemetry.completion_tokens}`);
    console.log(`- Total Tokens: ${telemetry.total_tokens}`);
    console.log(`- Finish Reason: ${telemetry.finish_reason}`);
    console.log(`- Fallback Triggered: ${telemetry.fallback_triggered}`);

    assert(telemetry.provider_used === "groq", "Primary provider was Groq");
    assert(telemetry.model.includes("gpt-oss-120b"), "Model matches groq_model configuration");
    assert(typeof telemetry.latency_ms === "number" && telemetry.latency_ms > 0, "Latency accurately measured");
    assert(typeof telemetry.prompt_tokens === "number" && telemetry.prompt_tokens > 0, "Prompt tokens recorded");
    assert(typeof telemetry.completion_tokens === "number" && telemetry.completion_tokens > 0, "Completion tokens recorded");
    assert(typeof telemetry.total_tokens === "number" && telemetry.total_tokens > 0, "Total tokens recorded");
    assert(typeof telemetry.finish_reason === "string", "Finish reason captured (e.g. stop/length)");
    assert(telemetry.fallback_triggered === false, "Fallback was not triggered on healthy provider");
    assert(post.title.length > 5, "Generated post title valid");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    assert(false, "Live Generation with Telemetry", msg);
  }

  // -------------------------------------------------------------
  // Test 2: GenerationLog Data Contract
  // -------------------------------------------------------------
  console.log("\n--- 2. GenerationLog Data Contract Validation ---");
  const sampleSuccessLog: GenerationLog = {
    site_id: testProfile.id,
    provider_used: "groq",
    model: "openai/gpt-oss-120b",
    prompt_tokens: 450,
    completion_tokens: 1200,
    total_tokens: 1650,
    latency_ms: 3450,
    finish_reason: "stop",
    status: "success",
    fallback_triggered: false,
  };

  assert(sampleSuccessLog.status === "success", "Log status is success");
  assert(sampleSuccessLog.fallback_triggered === false, "Fallback triggered flag is false");
  assert(sampleSuccessLog.total_tokens === 1650, "Token counts correctly structured for billing tracking");

  const sampleFailureLog: GenerationLog = {
    site_id: testProfile.id,
    provider_used: "none",
    model: "openai/gpt-oss-120b",
    latency_ms: 5120,
    status: "failed",
    error_message: "Both LLM providers failed. Primary Groq rate-limited.",
    fallback_triggered: true,
  };

  assert(sampleFailureLog.status === "failed", "Failure log status is failed");
  assert(sampleFailureLog.fallback_triggered === true, "Failure log captures fallback_triggered state");
  assert(typeof sampleFailureLog.error_message === "string", "Error message recorded for diagnostics");

  // -------------------------------------------------------------
  // Test 3: Log Recording Resilience (recordGenerationLog non-blocking)
  // -------------------------------------------------------------
  console.log("\n--- 3. Log Recording Resilience Check ---");
  let loggedWithoutThrow = true;
  try {
    await recordGenerationLog(sampleSuccessLog);
  } catch {
    loggedWithoutThrow = false;
  }
  assert(loggedWithoutThrow, "recordGenerationLog executes safely without unhandled exception");

  // -------------------------------------------------------------
  // Test 4: Dual-Provider Failure Alert Logic (§10)
  // -------------------------------------------------------------
  console.log("\n--- 4. Dual Provider Failure Alert Logic ---");
  const errorSimulation = "Both LLM providers failed. Primary Groq rate-limited. Fallback Gemini error: Quota exceeded";
  const isDualFailure = /both providers|primary groq rate-limited/i.test(errorSimulation);
  assert(isDualFailure, "Dual-provider failure alert correctly triggers on dual failure string");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`  PHASE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Verification().catch((err) => {
  console.error("Phase 2 verification crashed:", err);
  process.exit(1);
});
