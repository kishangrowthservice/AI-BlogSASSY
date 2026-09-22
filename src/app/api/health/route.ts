import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/db";
import { getCircuitBreakerStatus } from "@/lib/circuitBreaker";

export const runtime = "nodejs";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;

  try {
    const supabase = getDbClient();
    const dbStart = Date.now();
    const { error } = await supabase.from("circuit_breaker_state").select("provider").limit(1);
    dbLatencyMs = Date.now() - dbStart;
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const [groqCircuit, geminiCircuit] = await Promise.all([
    getCircuitBreakerStatus("groq"),
    getCircuitBreakerStatus("gemini").catch(() => ({ isOpen: false, state: "closed", consecutiveFailures: 0 })),
  ]);

  const isHealthy = dbOk && !groqCircuit.isOpen;
  const isDegraded = dbOk && groqCircuit.isOpen; // Operating on Gemini fallback

  const payload = {
    status: isHealthy ? "healthy" : isDegraded ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - start,
    checks: {
      database: {
        status: dbOk ? "connected" : "disconnected",
        latencyMs: dbLatencyMs,
      },
      providers: {
        groq: {
          circuitState: groqCircuit.state,
          isOpen: groqCircuit.isOpen,
          consecutiveFailures: groqCircuit.consecutiveFailures,
        },
        gemini: {
          circuitState: geminiCircuit.state,
          isOpen: geminiCircuit.isOpen,
        },
      },
    },
    cluster: {
      mode: isDegraded ? "fallback_gemini" : "primary_groq",
      targetCapacity: "10,000+ concurrent users",
    },
  };

  return NextResponse.json(payload, {
    status: isHealthy || isDegraded ? 200 : 503,
    headers: corsHeaders,
  });
}
