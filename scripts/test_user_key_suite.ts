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

import { getDbClient, hashApiKey } from "../src/lib/db";
import { POST as generateBlogHandler } from "../src/app/api/generate-blog/route";

async function runTestSuite() {
  const rawKey = "gs_live_8d669147b3b089ec0ac939f70692e2a64834ce2c";
  const db = getDbClient();

  console.log("=================================================");
  console.log("      VERIFYING USER API KEY ACROSS AUTH MODES   ");
  console.log("=================================================");
  console.log("Key: ", rawKey);

  // Test 1: x-api-key header
  console.log("\n[Test 1] Using `x-api-key` Header:");
  const req1 = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": rawKey,
    },
    body: JSON.stringify({
      topic: "How Autonomous AI Blog Engines Scale SEO in 2026",
    }),
  });
  const res1 = await generateBlogHandler(req1);
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}`);
  if (res1.status === 200) {
    console.log(`Generated Title: "${data1.title}"`);
    console.log(`Content Length:  ${data1.content?.length} characters`);
  } else {
    console.error("Failed:", data1);
  }

  // Test 2: Authorization: Bearer <key>
  console.log("\n[Test 2] Using `Authorization: Bearer <key>` Header:");
  const req2 = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${rawKey}`,
    },
    body: JSON.stringify({
      topic: "Optimizing Web Vitals & Core Speed for Technical Content",
    }),
  });
  const res2 = await generateBlogHandler(req2);
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}`);
  if (res2.status === 200) {
    console.log(`Generated Title: "${data2.title}"`);
    console.log(`Content Length:  ${data2.content?.length} characters`);
  } else {
    console.error("Failed:", data2);
  }

  // Check Quota state in DB
  const hashed = hashApiKey(rawKey);
  const { data: profile } = await db
    .from("site_profiles")
    .select("site_name, domain, used_quota, monthly_quota")
    .eq("api_key_hash", hashed)
    .single();

  console.log("\n=================================================");
  console.log("              DATABASE QUOTA STATUS              ");
  console.log("=================================================");
  console.log(`Tenant:      ${profile?.site_name} (${profile?.domain})`);
  console.log(`Quota Used:  ${profile?.used_quota} / ${profile?.monthly_quota}`);
  console.log("=================================================");
}

runTestSuite().catch(console.error);
