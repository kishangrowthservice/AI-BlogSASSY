import fs from "fs";
import path from "path";
import crypto from "crypto";

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

import { getDbClient, hashApiKey } from "../src/lib/db";
import { POST as generateBlogHandler } from "../src/app/api/generate-blog/route";

async function testUserKey() {
  const rawKey = "gs_live_8d669147b3b089ec0ac939f70692e2a64834ce2c";
  const hashed = hashApiKey(rawKey);

  console.log("=================================================");
  console.log("   TESTING GENERATION API KEY PROVIDED BY USER   ");
  console.log("=================================================");
  console.log("Raw Key:   ", rawKey);
  console.log("Key Prefix:", `gs_live_••••${rawKey.slice(-4)}`);
  console.log("SHA-256:   ", hashed);
  console.log("");

  const db = getDbClient();

  // 1. Check if key exists in Supabase DB
  console.log("--- Step 1: Querying Supabase Database ---");
  const { data: matchedProfile, error: dbErr } = await db
    .from("site_profiles")
    .select("id, site_name, domain, key_prefix, used_quota, monthly_quota, is_active, groq_model, gemini_model")
    .eq("api_key_hash", hashed)
    .single();

  if (dbErr || !matchedProfile) {
    console.log("[NOTICE] This key is NOT currently registered in Supabase `site_profiles` table.");
    console.log("Checking all active profiles in DB:");
    const { data: allProfiles } = await db
      .from("site_profiles")
      .select("id, site_name, domain, key_prefix, api_key_hash");
    for (const p of allProfiles || []) {
      console.log(`- ${p.site_name} (${p.domain}): prefix=${p.key_prefix}, has_key=${Boolean(p.api_key_hash)}`);
    }

    console.log("\n--- Testing API Route Behavior with this unregistered key ---");
    const testReq = new Request("http://localhost:3000/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": rawKey,
      },
      body: JSON.stringify({
        topic: "Future of Autonomous AI Blogging Engines",
      }),
    });

    const res = await generateBlogHandler(testReq);
    const body = await res.json();
    console.log(`HTTP Status: ${res.status}`);
    console.log("Response Body:", JSON.stringify(body, null, 2));
    return;
  }

  console.log("[FOUND] Site Profile Matched:");
  console.log(`  Site Name:     ${matchedProfile.site_name}`);
  console.log(`  Domain:        ${matchedProfile.domain}`);
  console.log(`  Tenant ID:     ${matchedProfile.id}`);
  console.log(`  Quota:         ${matchedProfile.used_quota} / ${matchedProfile.monthly_quota}`);
  console.log(`  Is Active:     ${matchedProfile.is_active}`);

  // 2. Call generate-blog with this key
  console.log("\n--- Step 2: Calling /api/generate-blog with live LLM ---");
  const testTopic = "Next-Generation Autonomous Content Syndication for SaaS";
  console.log(`Prompt Topic: "${testTopic}"`);

  const req = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": rawKey,
    },
    body: JSON.stringify({
      topic: testTopic,
      targetKeywords: ["AI blog automation", "Next.js SaaS", "SEO content API"],
    }),
  });

  const startTime = Date.now();
  const res = await generateBlogHandler(req);
  const latency = Date.now() - startTime;
  const data = await res.json();

  console.log(`\nHTTP Status: ${res.status} (${latency}ms)`);
  if (res.status === 200) {
    console.log("-------------------------------------------------");
    console.log("GENERATION SUCCESSFUL!");
    console.log("-------------------------------------------------");
    console.log("Title:           ", data.title);
    console.log("Meta Description:", data.metaDescription);
    console.log("Suggested Tags:  ", data.suggestedTags?.join(", "));
    console.log("Provider Used:   ", data.telemetry?.provider);
    console.log("Model Used:      ", data.telemetry?.model);
    console.log("Total Tokens:    ", data.telemetry?.totalTokens);
    console.log("Content Length:  ", data.content?.length, "characters");
    console.log("\nContent Excerpt (first 300 chars):");
    console.log(data.content?.slice(0, 300) + "...\n");
  } else {
    console.error("GENERATION FAILED:", JSON.stringify(data, null, 2));
  }
}

testUserKey().catch(console.error);
