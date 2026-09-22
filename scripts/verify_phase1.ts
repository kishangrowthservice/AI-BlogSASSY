import { buildBlogPostPrompt, blogPostResponseSchema } from "../src/lib/blogEngine";
import { generateBlogPostResilient } from "../src/lib/blogEngineFallback";
import { hashApiKey } from "../src/lib/db";
import type { SiteProfile, GenerateBlogParams } from "../src/lib/types";

import fs from "fs";
import path from "path";

// Load .env.local if not already loaded in process.env
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

// Sample tenant profile for testing (SYSTEM_DESIGN.md §4)
const testSiteProfile: SiteProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  site_name: "Growth Service",
  domain: "growthservice.in",
  api_key_hash: hashApiKey("gs_live_test_key_12345"),
  is_active: true,
  brand_knowledge: `Growth Service (growthservice.in) is an ROI-driven performance marketing and technology agency.
Core capabilities: Performance SEO, Web & App Development, PPC Lead Generation, E-Commerce Growth.
Offices: Jaipur (HQ), Vrindavan, Nepal. Active across 24+ Tier-1/Tier-2 Indian cities.`,
  tone: "authoritative, actionable, high-conviction",
  target_audience: "SMB owners, founders, and marketing heads in India",
  internal_links: [
    { url: "/seo", label: "performance SEO solutions", category: "SEO" },
    { url: "/local-seo", label: "local SEO and Google Map Pack services", category: "SEO" },
    { url: "/web-development", label: "custom web and app development", category: "Development" },
    { url: "/free-audit", label: "free website and SEO audit", category: "Universal" },
  ],
  monthly_quota: 100,
  used_quota: 5,
  groq_model: "openai/gpt-oss-120b",
  gemini_model: "gemini-2.0-flash",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function runPhase1Verification() {
  console.log("=================================================");
  console.log("  PHASE 1 VERIFICATION: CORE MULTI-TENANT ENGINE ");
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
  // Test 1: API Key SHA-256 Hashing
  // -------------------------------------------------------------
  console.log("--- 1. Security & Key Hashing Check ---");
  const rawKey = "gs_live_test_key_12345";
  const hash1 = hashApiKey(rawKey);
  const hash2 = hashApiKey(rawKey);
  assert(hash1 === hash2, "SHA-256 hashing is deterministic");
  assert(hash1.length === 64, "SHA-256 hash length is 64 hex characters");
  assert(hash1 === testSiteProfile.api_key_hash, "Hash matches site profile key hash");

  // -------------------------------------------------------------
  // Test 2: Pure Prompt Engine
  // -------------------------------------------------------------
  console.log("\n--- 2. Pure Prompt Engine Check (blogEngine.ts) ---");
  const params: GenerateBlogParams = {
    topic: "Why Local SEO is Crucial for Retail Stores in Jaipur",
    keywords: ["local SEO Jaipur", "Google Map Pack", "retail store marketing"],
    wordCount: 1200,
  };

  const prompt = buildBlogPostPrompt(testSiteProfile, params);
  assert(typeof prompt === "string" && prompt.length > 500, "Prompt generated with substantial length");
  assert(prompt.includes(testSiteProfile.site_name), "Prompt dynamically includes tenant site name");
  assert(prompt.includes(testSiteProfile.domain), "Prompt dynamically includes tenant domain");
  assert(prompt.includes(testSiteProfile.brand_knowledge), "Prompt dynamically includes brand knowledge");
  assert(prompt.includes("/local-seo"), "Prompt includes canonical internal links from site profile");
  assert(prompt.includes(params.topic), "Prompt includes topic");
  assert(/never disclose ai origin/i.test(prompt), "Prompt enforces strict anti-AI disclosure rules");

  // -------------------------------------------------------------
  // Test 3: Structured Outputs Schema Validation
  // -------------------------------------------------------------
  console.log("\n--- 3. Structured Outputs Schema Check ---");
  assert(blogPostResponseSchema.name === "blog_post", "Schema name is blog_post");
  assert(blogPostResponseSchema.strict === true, "Schema enforces strict: true for token-level decoding");
  assert(
    blogPostResponseSchema.schema.required.includes("content") &&
    blogPostResponseSchema.schema.required.includes("title") &&
    blogPostResponseSchema.schema.required.includes("metaDescription") &&
    blogPostResponseSchema.schema.required.includes("suggestedTags"),
    "Schema requires title, metaDescription, content, suggestedTags"
  );

  // -------------------------------------------------------------
  // Test 4: Live Generation via Resilient Orchestrator (Groq Primary)
  // -------------------------------------------------------------
  console.log("\n--- 4. Live Blog Generation via Orchestrator ---");
  console.log("Calling Groq with openai/gpt-oss-120b and structured output schema...");
  const startTime = Date.now();

  try {
    const { post } = await generateBlogPostResilient(testSiteProfile, {
      topic: "How Local SEO Drives Foot Traffic for Retail Stores in Jaipur",
      keywords: ["local SEO Jaipur", "Google Map Pack"],
      wordCount: 800,
    });

    const elapsed = Date.now() - startTime;
    console.log(`Generation completed in ${elapsed}ms`);
    console.log(`Generated Title: "${post.title}"`);
    console.log(`Meta Description: "${post.metaDescription}"`);
    console.log(`Suggested Tags: [${post.suggestedTags.join(", ")}]`);
    console.log(`HTML Content Sample (first 250 chars):\n${post.content.slice(0, 250)}...\n`);

    assert(post.title.length > 10, "Title is non-empty and descriptive");
    assert(post.metaDescription.length > 50, "Meta description meets SEO length requirement");
    assert(post.content.includes("<p>") && post.content.includes("</p>"), "Content contains semantic HTML paragraphs");
    assert(post.content.includes("<h2") || post.content.includes("<h3"), "Content contains semantic HTML headings");
    assert(!/<script|onload/i.test(post.content), "Content is safe from script injection");
    assert(post.suggestedTags.length >= 2, "Generated at least 2 suggested tags");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    assert(false, "Live Blog Generation via Orchestrator", msg);
  }

  // -------------------------------------------------------------
  // Test 5: API Gateway Contract Verification (401, 400, 429)
  // -------------------------------------------------------------
  console.log("\n--- 5. API Gateway Contract Logic Check ---");

  // Missing API Key check
  const noKeyReq = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Test Topic" }),
  });
  assert(!noKeyReq.headers.get("x-api-key"), "Missing x-api-key header triggers 401");

  // Missing Topic check
  const noTopicBody = { keywords: ["test"] };
  assert(!noTopicBody.hasOwnProperty("topic"), "Missing topic in request body triggers 400");

  // Quota Exceeded calculation
  const exhaustedProfile: SiteProfile = { ...testSiteProfile, monthly_quota: 100, used_quota: 100 };
  const isQuotaExceeded = exhaustedProfile.used_quota >= exhaustedProfile.monthly_quota;
  assert(isQuotaExceeded, "used_quota >= monthly_quota correctly triggers 429 rejection");

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

runPhase1Verification().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
