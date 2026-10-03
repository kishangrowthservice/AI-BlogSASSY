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

import { POST as generateBlogHandler } from "../src/app/api/generate-blog/route";

async function inspectFullContent() {
  const rawKey = "gs_live_8d669147b3b089ec0ac939f70692e2a64834ce2c";
  const req = new Request("http://localhost:3000/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": rawKey,
    },
    body: JSON.stringify({
      topic: "How Real-Time Performance Tuning Boosts High-Traffic Next.js SaaS",
      targetKeywords: ["Next.js performance", "SaaS latency", "Core Web Vitals"],
    }),
  });

  const res = await generateBlogHandler(req);
  const data = await res.json();

  console.log("=== FULL GENERATED BLOG RESPONSE ===");
  console.log("Keys in response:", Object.keys(data));
  console.log("\n--- Title ---");
  console.log(data.title);
  console.log("\n--- Meta Description ---");
  console.log(data.metaDescription);
  console.log("\n--- Suggested Tags ---");
  console.log(data.suggestedTags);
  console.log("\n--- Content HTML (Full) ---");
  console.log(data.content);
}

inspectFullContent().catch(console.error);
