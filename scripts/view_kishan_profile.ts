import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

async function viewProfile() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  const { data: profile } = await supabase
    .from("site_profiles")
    .select("*")
    .eq("domain", "kishan.codes")
    .single();

  console.log("=== Profile for kishan.codes ===");
  console.log("Site Name:        ", profile?.site_name);
  console.log("Domain:           ", profile?.domain);
  console.log("Tone:             ", profile?.tone);
  console.log("Target Audience:  ", profile?.target_audience);
  console.log("Internal Links:   ", profile?.internal_links);
  console.log("Brand Knowledge:  ", profile?.brand_knowledge);
}

viewProfile().catch(console.error);
