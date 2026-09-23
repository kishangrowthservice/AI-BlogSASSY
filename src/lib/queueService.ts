import { getDbClient, incrementUsedQuota, recordGenerationLog } from "./db";
import { generateBlogPostResilient } from "./blogEngineFallback";
import type { QueueJob, GenerateBlogParams, SiteProfile } from "./types";

// In-memory fallback queue for development and local testing
const localQueue = new Map<string, QueueJob>();

/**
 * Enqueue a blog generation request for async burst smoothing (§8 Scaling Strategy).
 */
export async function enqueueGenerationJob(
  siteId: string,
  payload: GenerateBlogParams
): Promise<QueueJob> {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newJob: QueueJob = {
    id: jobId,
    site_id: siteId,
    payload,
    status: "pending",
    result: null,
    error_message: null,
    attempts: 0,
    max_attempts: 3,
    scheduled_for: now,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("generation_queue")
      .insert([newJob])
      .select("*")
      .single();

    if (error || !data) {
      throw error || new Error("Queue insert returned no data");
    }

    return data as QueueJob;
  } catch {
    // Fallback: In-memory queue storage
    localQueue.set(jobId, newJob);
    return newJob;
  }
}

/**
 * Fetch status of an enqueued generation job.
 */
export async function getQueueJob(jobId: string): Promise<QueueJob | null> {
  try {
    const supabase = getDbClient();
    const { data, error } = await supabase
      .from("generation_queue")
      .select("*")
      .eq("id", jobId)
      .single();

    if (data) {
      return data as QueueJob;
    }
  } catch {
    // Fallback to local queue
  }

  return localQueue.get(jobId) || null;
}

/**
 * Process a batch of pending jobs from the queue (§8 Burst Smoothing).
 * Typically invoked by a cron endpoint or background worker.
 */
export async function processNextQueueJobs(
  batchSize: number = 3
): Promise<{ processed: number; successful: number; failed: number }> {
  let pendingJobs: QueueJob[] = [];
  const nowIso = new Date().toISOString();

  try {
    const supabase = getDbClient();
    // 1. Atomic claim using FOR UPDATE SKIP LOCKED (prevents duplicate generation)
    const { data: claimedData, error: claimErr } = await supabase.rpc("claim_next_queue_jobs", {
      p_batch_size: batchSize,
    });

    if (!claimErr && claimedData && Array.isArray(claimedData) && claimedData.length > 0) {
      pendingJobs = claimedData as QueueJob[];
    } else {
      // Fallback query if RPC not yet migrated
      const { data } = await supabase
        .from("generation_queue")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", nowIso)
        .order("scheduled_for", { ascending: true })
        .limit(batchSize);

      if (data && data.length > 0) {
        pendingJobs = data as QueueJob[];
      }
    }
  } catch {
    // Fallback: Check local queue
  }

  if (pendingJobs.length === 0) {
    for (const job of localQueue.values()) {
      if (job.status === "pending" && pendingJobs.length < batchSize) {
        pendingJobs.push(job);
      }
    }
  }

  let successful = 0;
  let failed = 0;

  for (const job of pendingJobs) {
    job.status = "processing";
    localQueue.set(job.id, job);

    try {
      const supabase = getDbClient();
      const { data: profile } = await supabase
        .from("site_profiles")
        .select("*")
        .eq("id", job.site_id)
        .single();

      if (!profile) {
        throw new Error(`Tenant site profile not found for site_id: ${job.site_id}`);
      }

      const siteProfile = profile as SiteProfile;
      const { post, telemetry } = await generateBlogPostResilient(siteProfile, job.payload);

      job.status = "completed";
      job.result = post;
      job.completed_at = new Date().toISOString();
      job.updated_at = new Date().toISOString();
      localQueue.set(job.id, job);

      try {
        await supabase
          .from("generation_queue")
          .update({
            status: "completed",
            result: post,
            completed_at: job.completed_at,
            updated_at: job.updated_at,
          })
          .eq("id", job.id);
      } catch {
        // Fallback already updated in localQueue
      }

      await incrementUsedQuota(job.site_id).catch((err) =>
        console.error("[queueService] Failed to increment used_quota:", err)
      );
      await recordGenerationLog({
        site_id: job.site_id,
        provider_used: telemetry.provider_used,
        model: telemetry.model,
        prompt_tokens: telemetry.prompt_tokens,
        completion_tokens: telemetry.completion_tokens,
        total_tokens: telemetry.total_tokens,
        latency_ms: telemetry.latency_ms,
        finish_reason: telemetry.finish_reason,
        status: "success",
        fallback_triggered: telemetry.fallback_triggered,
      });

      successful++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      job.attempts += 1;
      job.error_message = msg;
      job.status = job.attempts >= job.max_attempts ? "failed" : "pending";
      job.updated_at = new Date().toISOString();

      // Exponential backoff with jitter (prevents queue hammering at 10,000+ users)
      if (job.status === "pending") {
        const backoffSeconds = Math.min(300, Math.pow(2, job.attempts) * 30 + Math.floor(Math.random() * 10));
        job.scheduled_for = new Date(Date.now() + backoffSeconds * 1000).toISOString();
      }

      localQueue.set(job.id, job);

      try {
        const supabase = getDbClient();
        await supabase
          .from("generation_queue")
          .update({
            status: job.status,
            attempts: job.attempts,
            error_message: job.error_message,
            scheduled_for: job.scheduled_for,
            updated_at: job.updated_at,
          })
          .eq("id", job.id);
      } catch {
        // Fallback in localQueue
      }

      if (job.status === "failed") {
        await recordGenerationLog({
          site_id: job.site_id,
          provider_used: "none",
          model: job.payload.model || "unknown",
          latency_ms: 0,
          status: "failed",
          error_message: msg,
          fallback_triggered: false,
        }).catch(() => {});
      }

      failed++;
    }
  }

  return {
    processed: pendingJobs.length,
    successful,
    failed,
  };
}
