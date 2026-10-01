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

import { getDbClient } from "../src/lib/db";

async function run() {
  const db = getDbClient();
  const { data } = await db.from("site_profiles").select("*");
  console.log(`Site profiles count: ${data?.length || 0}`);
  for (const s of data || []) {
    console.log("ID:", s.id);
    console.log("Site name:", s.site_name);
    console.log("Domain:", s.domain);
    console.log("Internal links count:", s.internal_links?.length);
    console.log("Brand knowledge preview:", s.brand_knowledge?.slice(0, 150));
    console.log("Tone:", s.tone);
    console.log("Created at:", s.created_at);
    console.log("Updated at:", s.updated_at);
  }
}

run().catch(console.error);
