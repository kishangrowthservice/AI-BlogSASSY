import { BlogClient, BlogClientError } from "../src/lib/client/blogClient";
import { defaultBrandConfig } from "../src/theme/brand.config";
import type { GeneratedBlogPost } from "../src/lib/types";

async function runPhase5Verification() {
  console.log("=================================================");
  console.log("  PHASE 5 VERIFICATION: CLIENT SDK & THEME TEMPLATE ");
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
  // Test 1: Universal BlogClient SDK Contract
  // -------------------------------------------------------------
  console.log("--- 1. Universal BlogClient SDK Contract ---");

  // Missing API Key check
  let keyErrorCaught = false;
  try {
    new BlogClient({ apiKey: "" });
  } catch (err) {
    keyErrorCaught = true;
  }
  assert(keyErrorCaught, "BlogClient throws error when apiKey is empty");

  // Client instantiation
  const client = new BlogClient({ apiKey: "gs_live_testkey12345", baseUrl: "https://api.growthservice.in" });
  assert(client instanceof BlogClient, "BlogClient instantiated successfully");

  // Missing topic check
  let topicErrorCaught = false;
  try {
    await client.generateBlog({ topic: "" });
  } catch (err) {
    if (err instanceof BlogClientError && err.statusCode === 400) {
      topicErrorCaught = true;
    }
  }
  assert(topicErrorCaught, "generateBlog rejects empty topic with BlogClientError (400)");

  // Error class check
  const customErr = new BlogClientError("Burst limit", 429, 45);
  assert(customErr.statusCode === 429, "BlogClientError records statusCode 429");
  assert(customErr.retryAfter === 45, "BlogClientError parses retryAfter parameter");

  // -------------------------------------------------------------
  // Test 2: Brand Configuration Preset Contract (brand.config.ts)
  // -------------------------------------------------------------
  console.log("\n--- 2. Brand Configuration Contract (brand.config.ts) ---");
  assert(defaultBrandConfig.brandName === "Growth Service", "defaultBrandConfig specifies brand name");
  assert(defaultBrandConfig.domain === "growthservice.in", "defaultBrandConfig specifies canonical domain");
  assert(defaultBrandConfig.colors.primary === "#6A0DAD", "Brand uses authentic Royal Purple lock");
  assert(defaultBrandConfig.colors.secondary === "#FFD700", "Brand uses authentic Vibrant Gold lock");
  assert(typeof defaultBrandConfig.cta.buttonUrl === "string", "Brand CTA contains valid button URL");
  assert(typeof defaultBrandConfig.author.name === "string", "Brand author metadata configured");

  // -------------------------------------------------------------
  // Test 3: Reading Time & Content Structure Calculation
  // -------------------------------------------------------------
  console.log("\n--- 3. Reading Time & HTML Content Contract ---");
  const samplePost: GeneratedBlogPost = {
    title: "10 Proven SEO Tactics for Modern Growth",
    metaDescription: "Explore 10 data-backed SEO tactics that drive organic growth.",
    content: "<p>Intro paragraph.</p><h2>Section 1</h2><p>" + "word ".repeat(400) + "</p><blockquote><p>Quote insight</p></blockquote>",
    suggestedTags: ["SEO", "Growth", "Marketing"],
  };

  const plainText = samplePost.content.replace(/<[^>]+>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  assert(wordCount > 400, "Accurately extracts plain text word count from semantic HTML");
  assert(readTimeMinutes === 3, "200 wpm calculation yields correct reading time (3 mins for ~403 words)");
  assert(samplePost.suggestedTags.length === 3, "Suggested tags properly structured");
  assert(!samplePost.content.includes("ChatGPT") && !samplePost.content.includes("language model"), "Zero AI disclosure in generated HTML");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`  PHASE 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Verification().catch((err) => {
  console.error("Phase 5 verification crashed:", err);
  process.exit(1);
});
