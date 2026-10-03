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

async function inspect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  console.log("Checking DB connection and tables...");
  const { data: profiles, error: pErr } = await supabase.from("site_profiles").select("id, site_name, domain, key_prefix, api_key_hash, used_quota, monthly_quota");
  console.log("Profiles count:", profiles?.length, "Error:", pErr?.message || "none");
  if (profiles) {
    console.log("Tenants in DB:");
    for (const p of profiles) {
      console.log(`- ${p.site_name} (${p.domain}): id=${p.id}, has_hash=${Boolean(p.api_key_hash)}, prefix=${p.key_prefix}, quota=${p.used_quota}/${p.monthly_quota}`);
    }
  }

  // Check RPC reserve_tenant_quota
  console.log("\nTesting RPC reserve_tenant_quota directly on first profile if exists...");
  if (profiles && profiles.length > 0) {
    const p0 = profiles[0];
    const { data: rpcData, error: rpcErr } = await supabase.rpc("reserve_tenant_quota", { p_site_id: p0.id });
    console.log("RPC result:", rpcData, "RPC Error:", rpcErr ? `${rpcErr.code} - ${rpcErr.message}` : "none");
    if (!rpcErr) {
      // release it back
      await supabase.rpc("release_tenant_quota", { p_site_id: p0.id });
    }
  }

  // Check other tables
  const tables = ["generation_logs", "generation_queue", "circuit_breaker_state", "rate_limit_buckets"];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    console.log(`Table '${t}': count=${count}, error=${error?.message || "none"}`);
  }
}

inspect().catch(console.error);
