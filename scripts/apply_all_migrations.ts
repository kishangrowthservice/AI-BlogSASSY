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

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = "pmhqzcvaakaeddhlcric";

async function executeSql(sql: string, description: string) {
  console.log(`Executing SQL: ${description}...`);
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const status = response.status;
  const text = await response.text();
  if (status >= 200 && status < 300) {
    console.log(`[SUCCESS] ${description}`);
    return { ok: true, data: text };
  } else {
    console.error(`[ERROR] ${description} (HTTP ${status}):`, text);
    return { ok: false, error: text };
  }
}

async function run() {
  console.log("=================================================");
  console.log("  APPLYING MIGRATIONS DIRECTLY VIA SUPABASE API  ");
  console.log("=================================================\n");

  const migrationsDir = path.resolve(process.cwd(), "supabase", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    await executeSql(sql, file);
  }

  console.log("\n=================================================");
  console.log("  ALL MIGRATIONS PROCESSED                       ");
  console.log("=================================================");
}

run().catch(console.error);
