import { normalizeContentToHtml, cleanHtml } from "../src/lib/contentFormatter";
import { buildBlogPostPrompt } from "../src/lib/blogEngine";
import type { SiteProfile, GenerateBlogParams } from "../src/lib/types";

async function runVerification() {
  console.log("=== Verifying Deep Crawler, Brand Intelligence & Content Formatter ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Test Content Formatter (HTML Normalization and Sanitization)
  console.log("--- 1. Testing HTML Formatter & Sanitizer ---");
  const rawMarkdown = `
# Main Heading That Should Be H2
Some introductory text with **bold metrics** and *technical term*.

- First step of audit
- Second step of framework

> A strong contrarian take on marketing.

<script>alert('xss')</script>
<p>Clean paragraph with <a href="/seo">SEO Services</a></p>
`;

  const formattedHtml = normalizeContentToHtml(rawMarkdown);
  assert(!formattedHtml.includes("<script>"), "Strips malicious <script> tags completely");
  assert(formattedHtml.includes("<h2>Main Heading That Should Be H2</h2>"), "Converts top-level heading to <h2>");
  assert(formattedHtml.includes("<strong>bold metrics</strong>"), "Normalizes markdown **bold** to <strong>");
  assert(formattedHtml.includes("<blockquote>"), "Wraps markdown quotes in <blockquote>");
  assert(formattedHtml.includes("<ul>") && formattedHtml.includes("<li>First step of audit</li>"), "Formats unordered lists properly");

  // 2. Test Prompt Builder with Growth-Service Cadence & Dynamic Internal Backlinks
  console.log("\n--- 2. Testing Prompt Builder & Growth-Service Editorial Rules ---");
  const mockProfile: SiteProfile = {
    id: "test-site-uuid",
    site_name: "Apex Cloud Services",
    domain: "apexcloud.io",
    is_active: true,
    brand_knowledge: "Apex Cloud provides enterprise AWS and GCP Kubernetes migration and FinOps cost optimization.",
    tone: "direct, technical, high-conviction",
    target_audience: "CTOs and VP of Engineering",
    internal_links: [
      { url: "/services/k8s", label: "Kubernetes Migration Services", category: "Services" },
      { url: "/pricing", label: "Transparent Cloud Pricing", category: "Pricing" },
    ],
    monthly_quota: 100,
    used_quota: 5,
    groq_model: "openai/gpt-oss-120b",
    gemini_model: "gemini-2.5-flash-lite",
    crawl_status: "completed",
    crawl_progress: 100,
    crawl_page_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const blogParams: GenerateBlogParams = {
    topic: "How to Reduce EKS Cloud Costs by 40%",
    keywords: ["EKS cost optimization", "AWS Kubernetes costs"],
    wordCount: 1200,
  };

  const prompt = buildBlogPostPrompt(mockProfile, blogParams);

  assert(prompt.includes("Apex Cloud Services"), "Injects site name into editorial role");
  assert(prompt.includes("apexcloud.io"), "Injects domain into prompt");
  assert(prompt.includes("VOICE: MATCH THIS CADENCE, NOT THIS CONTENT"), "Contains Growth-Service cadence guidance");
  assert(prompt.includes("Never use AI clichés or corporate filler"), "Enforces strict ban on AI clichés");
  assert(prompt.includes("<a href='/services/k8s'>Kubernetes Migration Services</a>"), "Dynamically injects canonical internal links from crawled site data");
  assert(prompt.includes("<untrusted_tenant_input>"), "Preserves security boundary around user input");

  console.log(`\n=========================================`);
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log(`=========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
