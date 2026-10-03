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

async function fixInternalLinks() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  console.log("Updating internal_links for kishan.codes...");
  const cleanLinks = [
    { url: "/#contact", label: "Get in touch", category: "Contact" },
    { url: "/#projects", label: "Featured Projects", category: "Portfolio" },
  ];

  const { data, error } = await supabase
    .from("site_profiles")
    .update({ internal_links: cleanLinks })
    .eq("domain", "kishan.codes")
    .select("domain, internal_links");

  if (error) {
    console.error("Error updating internal links:", error);
  } else {
    console.log("Successfully updated internal links:", data);
  }
}

fixInternalLinks().catch(console.error);
