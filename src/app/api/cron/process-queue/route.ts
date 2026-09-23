import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { processNextQueueJobs } from "@/lib/queueService";

export const runtime = "nodejs";

const ADMIN_TOKEN = process.env.ADMIN_SESSION_TOKEN;
if (!ADMIN_TOKEN) {
  throw new Error("Missing required environment variable: ADMIN_SESSION_TOKEN");
}

async function handleProcessQueue(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    const isCronAuthorized = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);

    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdminAuthorized = Boolean(adminSession && adminSession.value === ADMIN_TOKEN);

    if (!isCronAuthorized && !isAdminAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron invocation." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawBatchSize = searchParams.get("batchSize");
    const batchSize = rawBatchSize ? Math.min(Math.max(parseInt(rawBatchSize, 10) || 3, 1), 10) : 3;

    const stats = await processNextQueueJobs(batchSize);

    return NextResponse.json(
      {
        success: true,
        batchSize,
        ...stats,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process generation queue";
    console.error("[cron/process-queue] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleProcessQueue(request);
}

export async function POST(request: Request) {
  return handleProcessQueue(request);
}
