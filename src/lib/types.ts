export interface InternalLinkItem {
  url: string;
  label: string;
  category?: string;
}

export interface SiteProfile {
  id: string;
  site_name: string;
  domain: string;
  api_key_hash?: string | null;
  key_prefix?: string | null;
  is_active: boolean;
  brand_knowledge: string;
  tone: string;
  target_audience: string;
  internal_links: InternalLinkItem[];
  monthly_quota: number;
  used_quota: number;
  groq_model: string;
  gemini_model: string;
  byo_groq_api_key?: string;
  byo_gemini_api_key?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateBlogParams {
  topic: string;
  keywords?: string[];
  wordCount?: number;
  tone?: string;
  audience?: string;
  model?: string;
  async?: boolean;
}

export interface QueueJob {
  id: string;
  site_id: string;
  payload: GenerateBlogParams;
  status: "pending" | "processing" | "completed" | "failed";
  result?: GeneratedBlogPost | null;
  error_message?: string | null;
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedBlogPost {
  title: string;
  metaDescription: string;
  content: string; // Clean semantic HTML
  suggestedTags: string[];
}

export interface GenerationTelemetry {
  provider_used: "groq" | "gemini" | "none";
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  latency_ms: number;
  finish_reason?: string;
  fallback_triggered: boolean;
}

export interface GeneratedBlogPostWithTelemetry {
  post: GeneratedBlogPost;
  telemetry: GenerationTelemetry;
}

export interface GenerationLog {
  id?: string;
  site_id: string;
  provider_used: string;
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  latency_ms: number;
  finish_reason?: string;
  status: "success" | "failed";
  error_message?: string;
  fallback_triggered: boolean;
  created_at?: string;
}

