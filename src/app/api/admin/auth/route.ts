import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDbClient } from "@/lib/db";

export const runtime = "nodejs";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");
const SESSION_TOKEN = requireEnv("ADMIN_SESSION_TOKEN");
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// Local fallback in-memory map
const localLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

async function verifyLoginLockout(ip: string): Promise<{ isLocked: boolean; waitSec: number }> {
  try {
    const supabase = getDbClient();
    const { data } = await supabase
      .from("admin_login_attempts")
      .select("locked_until")
      .eq("ip_address", ip)
      .single();

    if (data?.locked_until) {
      const remainingMs = new Date(data.locked_until).getTime() - Date.now();
      if (remainingMs > 0) {
        return { isLocked: true, waitSec: Math.ceil(remainingMs / 1000) };
      }
    }
  } catch {
    // Fallback to local map
  }

  const now = Date.now();
  const attempt = localLoginAttempts.get(ip);
  if (attempt && attempt.lockedUntil > now) {
    return { isLocked: true, waitSec: Math.ceil((attempt.lockedUntil - now) / 1000) };
  }
  return { isLocked: false, waitSec: 0 };
}

async function recordLoginFailure(ip: string): Promise<void> {
  const now = Date.now();
  try {
    const supabase = getDbClient();
    await supabase.rpc("check_and_record_login_attempt", {
      p_ip: ip,
      p_is_failure: true,
      p_max_attempts: 5,
      p_lockout_seconds: 900,
    });
  } catch {
    // Fallback
  }

  const attempt = localLoginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1000;
  }
  localLoginAttempts.set(ip, attempt);
}

async function resetLoginAttempts(ip: string): Promise<void> {
  try {
    const supabase = getDbClient();
    await supabase.from("admin_login_attempts").delete().eq("ip_address", ip);
  } catch {
    // Fallback
  }
  localLoginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const lockout = await verifyLoginLockout(ip);

    if (lockout.isLocked) {
      return NextResponse.json(
        { error: `Too many failed login attempts. Account temporarily locked. Try again in ${lockout.waitSec}s.` },
        { status: 429, headers: { "Retry-After": String(lockout.waitSec) } }
      );
    }

    const body = await request.json();
    const { password } = body || {};

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (password !== ADMIN_PASSWORD) {
      await recordLoginFailure(ip);
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Reset attempts on successful login
    await resetLoginAttempts(ip);

    const expires = new Date(Date.now() + SESSION_DURATION_MS);
    const cookieStore = await cookies();
    cookieStore.set("admin_session", SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auth error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true }, { status: 200 });
}
