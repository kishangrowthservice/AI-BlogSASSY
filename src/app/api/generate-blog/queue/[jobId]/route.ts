import { NextResponse } from "next/server";
import { getSiteProfileByApiKey } from "@/lib/db";
import { getQueueJob } from "@/lib/queueService";

export const runtime = "nodejs";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const rawApiKey = request.headers.get("x-api-key");
    if (!rawApiKey || !rawApiKey.trim()) {
      return NextResponse.json(
        { error: "Missing x-api-key header. Provide a valid tenant API key." },
        { status: 401 }
      );
    }

    const siteProfile = await getSiteProfileByApiKey(rawApiKey);
    if (!siteProfile) {
      return NextResponse.json(
        { error: "Invalid or inactive API key. Access denied." },
        { status: 401 }
      );
    }

    const { jobId } = await context.params;
    if (!jobId || !jobId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid jobId parameter." },
        { status: 400 }
      );
    }

    const job = await getQueueJob(jobId.trim());
    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${jobId}' not found.` },
        { status: 404 }
      );
    }

    // Tenant isolation: verify job site_id matches authenticated tenant (§9 Security)
    if (job.site_id !== siteProfile.id) {
      return NextResponse.json(
        { error: "Access denied. Queue job belongs to a different tenant." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        id: job.id,
        site_id: job.site_id,
        status: job.status,
        result: job.result,
        error_message: job.error_message,
        attempts: job.attempts,
        max_attempts: job.max_attempts,
        scheduled_for: job.scheduled_for,
        completed_at: job.completed_at,
        created_at: job.created_at,
        updated_at: job.updated_at,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal queue retrieval error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
