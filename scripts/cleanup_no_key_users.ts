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

async function cleanupNoKeyUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  console.log("=== Finding Tenants With No API Key in Supabase ===");
  const { data: noKeyProfiles, error: fetchErr } = await supabase
    .from("site_profiles")
    .select("id, site_name, domain, user_id, api_key_hash")
    .is("api_key_hash", null);

  if (fetchErr) {
    console.error("Error fetching profiles:", fetchErr);
    return;
  }

  if (!noKeyProfiles || noKeyProfiles.length === 0) {
    console.log("No profiles with missing API keys found.");
    return;
  }

  console.log(`Found ${noKeyProfiles.length} tenant profile(s) with no API key:`);
  for (const p of noKeyProfiles) {
    console.log(`- ${p.site_name} (${p.domain}) [ID: ${p.id}]`);
  }

  const siteIds = noKeyProfiles.map((p) => p.id);

  // 1. Clean up generation_logs if any exist for these sites
  console.log("\nCleaning up any related generation_logs...");
  const { error: logsErr } = await supabase
    .from("generation_logs")
    .delete()
    .in("site_id", siteIds);
  if (logsErr) console.warn("Notice cleaning generation_logs:", logsErr.message);

  // 2. Clean up generation_queue if any exist
  console.log("Cleaning up any related generation_queue...");
  const { error: queueErr } = await supabase
    .from("generation_queue")
    .delete()
    .in("site_id", siteIds);
  if (queueErr) console.warn("Notice cleaning generation_queue:", queueErr.message);

  // 3. Delete from site_profiles
  console.log("Removing tenant profiles from site_profiles table...");
  const { error: deleteErr } = await supabase
    .from("site_profiles")
    .delete()
    .in("id", siteIds);

  if (deleteErr) {
    console.error("Failed to delete from site_profiles:", deleteErr);
    return;
  }

  console.log("Successfully removed tenant profile records from Supabase DB!");

  // Verify remaining profiles
  const { data: remaining } = await supabase
    .from("site_profiles")
    .select("id, site_name, domain, key_prefix, api_key_hash");

  console.log("\nRemaining Active Tenants in DB:");
  for (const r of remaining || []) {
    console.log(`- ${r.site_name} (${r.domain}) [Key Prefix: ${r.key_prefix}]`);
  }
}

cleanupNoKeyUsers().catch(console.error);
