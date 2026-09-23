import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { buildBlogPostPrompt, blogPostResponseSchema, geminiBlogPostResponseSchema } from "./blogEngine";
import type { SiteProfile, GenerateBlogParams, GeneratedBlogPost, GeneratedBlogPostWithTelemetry, GenerationTelemetry } from "./types";

let groqInstance: Groq | null = null;
let geminiInstance: GoogleGenAI | null = null;

function getGroqClient(customKey?: string): Groq {
  if (customKey && customKey.trim()) {
    return new Groq({ apiKey: customKey.trim() });
  }
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment");
    }
    groqInstance = new Groq({ apiKey });
  }
  return groqInstance;
}

function getGeminiClient(customKey?: string): GoogleGenAI {
  if (customKey && customKey.trim()) {
    return new GoogleGenAI({ apiKey: customKey.trim() });
  }
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment");
    }
    geminiInstance = new GoogleGenAI({ apiKey });
  }
  return geminiInstance;
}

function parseGeneratedJson(raw: string): GeneratedBlogPost {
  let cleaned = raw.trim();
  // Strip markdown fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed.title || !parsed.content) {
    throw new Error("Response JSON missing required 'title' or 'content' fields");
  }

  return {
    title: String(parsed.title),
    metaDescription: String(parsed.metaDescription || ""),
    content: String(parsed.content),
    suggestedTags: Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags.map(String)
      : [],
  };
}

/**
 * Generate blog post using Groq as primary provider with telemetry.
 */
async function generateWithGroq(
  prompt: string,
  model: string,
  customKey?: string
): Promise<GeneratedBlogPostWithTelemetry> {
  const groq = getGroqClient(customKey);
  const start = Date.now();

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert human content director. Output strictly valid JSON matching the schema. No markdown fences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
    max_completion_tokens: 8000,
    reasoning_effort: "low",
    response_format: {
      type: "json_schema",
      json_schema: blogPostResponseSchema,
    },
  } as any);

  const latency_ms = Date.now() - start;
  const choice = completion.choices[0];
  const finish_reason = choice?.finish_reason;

  if (finish_reason === "length") {
    console.warn(
      "[blogEngine] Groq response truncated (finish_reason: length).",
      { usage: completion.usage }
    );
  }

  const content = choice?.message?.content;
  if (!content) {
    throw new Error("Empty response received from Groq");
  }

  const post = parseGeneratedJson(content);
  const telemetry: GenerationTelemetry = {
    provider_used: "groq",
    model,
    prompt_tokens: completion.usage?.prompt_tokens,
    completion_tokens: completion.usage?.completion_tokens,
    total_tokens: completion.usage?.total_tokens,
    latency_ms,
    finish_reason: finish_reason || "stop",
    fallback_triggered: false,
  };

  return { post, telemetry };
}

/**
 * Generate blog post using Gemini as fallback provider with telemetry.
 */
async function generateWithGemini(
  prompt: string,
  model: string,
  customKey?: string
): Promise<GeneratedBlogPostWithTelemetry> {
  const gemini = getGeminiClient(customKey);
  const start = Date.now();

  const response = await gemini.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: geminiBlogPostResponseSchema,
      temperature: 0.7,
    },
  });

  const latency_ms = Date.now() - start;
  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini fallback");
  }

  const post = parseGeneratedJson(text);
  const candidate = response.candidates?.[0];
  const telemetry: GenerationTelemetry = {
    provider_used: "gemini",
    model,
    prompt_tokens: response.usageMetadata?.promptTokenCount,
    completion_tokens: response.usageMetadata?.candidatesTokenCount,
    total_tokens: response.usageMetadata?.totalTokenCount,
    latency_ms,
    finish_reason: candidate?.finishReason || "STOP",
    fallback_triggered: true,
  };

  return { post, telemetry };
}

import { getCircuitBreakerStatus, recordCircuitSuccess, recordCircuitFailure } from "./circuitBreaker";

/**
 * Resilient Orchestrator: Tries Groq primary, immediately falls back to Gemini on 429.
 * Also checks circuit breaker (§7) and uses tenant-dedicated BYO-Key if configured (§8).
 * Captures request-level telemetry for generation_logs (§5, §7, §10).
 */
export async function generateBlogPostResilient(
  siteProfile: SiteProfile,
  params: GenerateBlogParams
): Promise<GeneratedBlogPostWithTelemetry> {
  const prompt = buildBlogPostPrompt(siteProfile, params);
  const groqModel = params.model || siteProfile.groq_model || "openai/gpt-oss-120b";
  const geminiModel = siteProfile.gemini_model || "gemini-2.5-flash-lite";

  // Support explicit Gemini fallback or default provider override
  const preferGemini =
    process.env.DEFAULT_LLM_PROVIDER === "gemini" ||
    process.env.USE_GEMINI_FALLBACK === "true";

  const hasGroqKey = Boolean(siteProfile.byo_groq_api_key?.trim() || process.env.GROQ_API_KEY);
  if (preferGemini || !hasGroqKey) {
    console.log(`[LLM Orchestrator] Operating on Gemini mode (${geminiModel}).`);
    return await generateWithGemini(prompt, geminiModel, siteProfile.byo_gemini_api_key);
  }

  // Check circuit breaker state for Groq provider
  const circuit = await getCircuitBreakerStatus("groq");
  if (circuit.isOpen) {
    console.warn(
      `[Circuit Breaker] ${circuit.reason} Bypassing Groq directly to Gemini fallback (${geminiModel}).`
    );
    try {
      return await generateWithGemini(prompt, geminiModel, siteProfile.byo_gemini_api_key);
    } catch (geminiErr: unknown) {
      const geminiMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      throw new Error(
        `Both LLM providers failed. Groq circuit OPEN. Fallback Gemini error: ${geminiMsg}`
      );
    }
  }

  try {
    const result = await generateWithGroq(prompt, groqModel, siteProfile.byo_groq_api_key);
    // Provider healthy: reset failure counter
    await recordCircuitSuccess("groq");
    return result;
  } catch (err: unknown) {
    // Record failure in circuit breaker
    await recordCircuitFailure("groq");

    const status = (err as { status?: number })?.status;
    const message = (err as { message?: string })?.message || "";

    if (status === 401) {
      // A bad/revoked key won't be fixed by switching providers for one
      // request — it'll fail on every subsequent call too. Fail loudly
      // instead of silently routing all future traffic to Gemini forever.
      console.error(
        `[ALERT: GROQ_AUTH_FAILURE] Groq API key rejected (401) for tenant "${siteProfile.site_name}". Needs manual fixing, not a fallback. Message: ${message}`
      );
      throw err;
    }

    const isTransientProviderIssue = status === 429 || status === 500 || status === 503;

    if (isTransientProviderIssue) {
      console.warn(
        `[LLM Orchestrator] Groq transient failure (${status}). Switching immediately to Gemini fallback (${geminiModel})...`
      );

      try {
        return await generateWithGemini(prompt, geminiModel, siteProfile.byo_gemini_api_key);
      } catch (geminiErr: unknown) {
        const geminiMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        throw new Error(
          `Both LLM providers failed. Primary Groq unavailable (${status}). Fallback Gemini error: ${geminiMsg}`
        );
      }
    }

    // Non-recoverable / unexpected error — surface it directly, don't guess.
    throw err;
  }
}

