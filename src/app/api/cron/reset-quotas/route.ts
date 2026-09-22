import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDbClient, localSiteProfiles } from "@/lib/db";

export const runtime = "nodejs";

const ADMIN_TOKEN = process.env.ADMIN_SESSION_TOKEN || "aiblog-admin-valid-session-2024";

async function handleResetQuotas(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    const isCronAuthorized = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);

    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdminAuthorized = Boolean(adminSession && adminSession.value === ADMIN_TOKEN);

    if (!isCronAuthorized && !isAdminAuthorized) {
      if (process.env.NODE_ENV === "production" || cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron invocation." }, { status: 401 });
      }
    }

    let resetCount = 0;
    try {
      const supabase = getDbClient();
      const { data, error } = await supabase.rpc("reset_monthly_quotas");
      if (!error && typeof data === "number") {
        resetCount = data;
      } else {
        // Fallback direct update
        const { data: updatedRows } = await supabase
          .from("site_profiles")
          .update({ used_quota: 0, updated_at: new Date().toISOString() })
          .gt("used_quota", 0)
          .select("id");
        resetCount = updatedRows?.length || 0;
      }
    } catch {
      // In-memory fallback
    }

    for (const profile of localSiteProfiles.values()) {
      if (profile.used_quota > 0) {
        profile.used_quota = 0;
        resetCount++;
      }
    }

    return NextResponse.json({
      success: true,
      resetCount,
      timestamp: new Date().toISOString(),
      message: `Successfully reset monthly quota for ${resetCount} tenants.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset quotas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleResetQuotas(request);
}

export async function POST(request: Request) {
  return handleResetQuotas(request);
}
