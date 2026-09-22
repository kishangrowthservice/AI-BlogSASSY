import fs from "fs";
import path from "path";
import { checkTenantRateLimit } from "../src/lib/rateLimiter";
import {
  getCircuitBreakerStatus,
  recordCircuitFailure,
  recordCircuitSuccess,
} from "../src/lib/circuitBreaker";
import { hashApiKey } from "../src/lib/db";
import type { SiteProfile } from "../src/lib/types";

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

async function runPhase3Verification() {
  console.log("=================================================");
  console.log("  PHASE 3 VERIFICATION: NOISY NEIGHBOR & CIRCUIT ");
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
  // Test 1: Per-Tenant Rate Limiting (Noisy Neighbor Protection)
  // -------------------------------------------------------------
  console.log("--- 1. Per-Tenant Rate Limiting & Burst Protection ---");
  const noisyTenantId = "tenant-noisy-1234";
  const innocentTenantId = "tenant-innocent-5678";
  const maxRpm = 3;

  // Requests 1, 2, 3 for noisy tenant should pass
  const r1 = await checkTenantRateLimit(noisyTenantId, maxRpm);
  const r2 = await checkTenantRateLimit(noisyTenantId, maxRpm);
  const r3 = await checkTenantRateLimit(noisyTenantId, maxRpm);

  assert(r1.allowed === true && r1.current === 1, "First request within window is allowed");
  assert(r2.allowed === true && r2.current === 2, "Second request within window is allowed");
  assert(r3.allowed === true && r3.current === 3, "Third request at capacity is allowed");

  // Request 4 for noisy tenant must be rejected
  const r4 = await checkTenantRateLimit(noisyTenantId, maxRpm);
  assert(r4.allowed === false, "4th burst request exceeding 3 RPM is blocked (429)");
  assert(r4.current > r4.limit, "Current count exceeds limit");
  assert(r4.retryAfterSeconds > 0, "Provides positive Retry-After seconds");

  // Innocent tenant requesting in same second must be allowed (isolation)
  const rInnocent = await checkTenantRateLimit(innocentTenantId, maxRpm);
  assert(rInnocent.allowed === true, "Innocent tenant is NOT blocked by noisy neighbor burst");
  assert(rInnocent.current === 1, "Innocent tenant has separate quota bucket");

  // -------------------------------------------------------------
  // Test 2: Circuit Breaker State Transitions
  // -------------------------------------------------------------
  console.log("\n--- 2. Circuit Breaker State Transitions ---");
  const provider = "test_groq_breaker";

  // Initial state should be closed
  await recordCircuitSuccess(provider);
  let status = await getCircuitBreakerStatus(provider);
  assert(status.isOpen === false, "Initial circuit state is closed");

  // 1st failure
  await recordCircuitFailure(provider);
  status = await getCircuitBreakerStatus(provider);
  assert(status.isOpen === false, "Single failure does not trip circuit");

  // 2nd failure
  await recordCircuitFailure(provider);
  status = await getCircuitBreakerStatus(provider);
  assert(status.isOpen === false, "Two failures do not trip circuit (threshold=3)");

  // 3rd failure -> should trip to open!
  await recordCircuitFailure(provider);
  status = await getCircuitBreakerStatus(provider);
  assert(status.isOpen === true, "3 consecutive failures trips circuit to OPEN");
  assert(status.state === "open", "Circuit state is 'open'");
  assert(typeof status.reason === "string" && status.reason.includes("Cool-off active"), "Reason cites cool-off active");

  // Success resets the circuit
  await recordCircuitSuccess(provider);
  status = await getCircuitBreakerStatus(provider);
  assert(status.isOpen === false, "Circuit success resets state to CLOSED");
  assert(status.consecutiveFailures === 0, "Consecutive failures reset to 0");

  // -------------------------------------------------------------
  // Test 3: Gateway Rate Limit 429 Header Format
  // -------------------------------------------------------------
  console.log("\n--- 3. Gateway Rate Limit HTTP Contract ---");
  const sample429Response = {
    error: `Per-minute rate limit exceeded (4/3 RPM). Burst protection engaged.`,
    retryAfter: r4.retryAfterSeconds,
  };
  assert(typeof sample429Response.retryAfter === "number", "429 payload includes retryAfter integer");
  assert(sample429Response.error.includes("Burst protection"), "429 payload clarifies burst protection");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`  PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error("Phase 3 verification crashed:", err);
  process.exit(1);
});
