import type { GeneratedBlogPost, GenerateBlogParams, QueueJob } from "../types";

export interface BlogClientConfig {
  baseUrl?: string;
  apiKey: string;
}

export interface EnqueueJobResponse {
  status: "accepted";
  jobId: string;
  message: string;
  checkStatusUrl: string;
}

export class BlogClientError extends Error {
  statusCode: number;
  retryAfter?: number;

  constructor(message: string, statusCode: number, retryAfter?: number) {
    super(message);
    this.name = "BlogClientError";
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

/**
 * Universal Client SDK for consuming sites across ANY tech stack (§2 Functional Requirements).
 * Compatible with Next.js, Vite, React, Vue, Svelte, Express, or browser fetch.
 */
export class BlogClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: BlogClientConfig) {
    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error("BlogClient: Missing required apiKey.");
    }
    this.apiKey = config.apiKey.trim();
    this.baseUrl = (config.baseUrl || "").replace(/\/$/, "");
  }

  /**
   * Request synchronous blog post generation from the content generation gateway.
   */
  async generateBlog(params: GenerateBlogParams): Promise<GeneratedBlogPost> {
    if (!params.topic || !params.topic.trim()) {
      throw new BlogClientError("Field 'topic' is required.", 400);
    }

    const endpoint = `${this.baseUrl}/api/generate-blog`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(params),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const retryHeader = res.headers.get("Retry-After");
      const retryAfter = retryHeader ? parseInt(retryHeader, 10) : undefined;
      const errorMsg = data.error || `HTTP ${res.status}: Blog generation request failed`;

      throw new BlogClientError(errorMsg, res.status, retryAfter);
    }

    return data as GeneratedBlogPost;
  }

  /**
   * Enqueue blog post for asynchronous burst smoothing (§8 Scaling Strategy).
   */
  async enqueueBlog(params: GenerateBlogParams): Promise<EnqueueJobResponse> {
    if (!params.topic || !params.topic.trim()) {
      throw new BlogClientError("Field 'topic' is required.", 400);
    }

    const endpoint = `${this.baseUrl}/api/generate-blog`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({ ...params, async: true }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status !== 202) {
      const retryHeader = res.headers.get("Retry-After");
      const retryAfter = retryHeader ? parseInt(retryHeader, 10) : undefined;
      const errorMsg = data.error || `HTTP ${res.status}: Failed to enqueue blog generation`;

      throw new BlogClientError(errorMsg, res.status, retryAfter);
    }

    return data as EnqueueJobResponse;
  }

  /**
   * Fetch current status and result of an enqueued generation job.
   */
  async getQueueStatus(jobId: string): Promise<QueueJob> {
    if (!jobId || !jobId.trim()) {
      throw new BlogClientError("Field 'jobId' is required.", 400);
    }

    const endpoint = `${this.baseUrl}/api/generate-blog/queue/${encodeURIComponent(jobId.trim())}`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new BlogClientError(
        data.error || `HTTP ${res.status}: Failed to get queue status`,
        res.status
      );
    }

    return data as QueueJob;
  }

  /**
   * Enqueue job and poll until completed or failed.
   */
  async generateBlogAsync(
    params: GenerateBlogParams,
    pollIntervalMs: number = 1000,
    maxWaitMs: number = 60000
  ): Promise<GeneratedBlogPost> {
    const enqueueResult = await this.enqueueBlog(params);
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      const job = await this.getQueueStatus(enqueueResult.jobId);
      if (job.status === "completed" && job.result) {
        return job.result;
      }
      if (job.status === "failed") {
        throw new BlogClientError(job.error_message || "Async blog generation failed", 500);
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new BlogClientError(`Async generation timed out after ${maxWaitMs}ms`, 408);
  }
}

/**
 * Helper factory function for one-line blog generation.
 */
export async function generateBlogWithKey(
  apiKey: string,
  params: GenerateBlogParams,
  baseUrl = ""
): Promise<GeneratedBlogPost> {
  const client = new BlogClient({ apiKey, baseUrl });
  return client.generateBlog(params);
}

