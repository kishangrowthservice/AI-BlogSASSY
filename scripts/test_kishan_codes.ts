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

import { runFullSiteCrawlAndSynthesis } from "../src/lib/crawler/brandSynthesizer";

async function testKishanCodes() {
  console.log("Testing crawl for kishan.codes...");
  await runFullSiteCrawlAndSynthesis(
    "4d29237e-6fd1-4e3e-b252-4ecb5af6c1bb",
    "https://kishan.codes"
  );
  console.log("Crawl finished!");
}

testKishanCodes().catch(console.error);
