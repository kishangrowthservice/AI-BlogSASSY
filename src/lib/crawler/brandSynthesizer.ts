/**
 * AI Brand Synthesizer
 * Uses Groq (or Gemini fallback) to transform raw crawled website data
 * into a tailored Brand Knowledge Base, Voice Tone, and Canonical Internal Backlink Map.
 */

import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { getDbClient, localSiteProfiles } from "@/lib/db";
import { deepCrawlWebsite, type DeepCrawlResult } from "./deepCrawler";
import type { InternalLinkItem } from "@/lib/types";

export interface SynthesizedBrandProfile {
  brandName: string;
  brandKnowledge: string;
  tone: string;
  targetAudience: string;
  internalLinks: InternalLinkItem[];
}

function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  return key ? new Groq({ apiKey: key }) : null;
}

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GoogleGenAI({ apiKey: key }) : null;
}

/**
 * Builds aggregated text digest from crawled pages.
 */
function buildCrawlDigest(crawlResult: DeepCrawlResult): string {
  const { origin, domain, siteTitle, pages } = crawlResult;

  let digest = `TARGET DOMAIN: ${domain} (${origin})\nPAGE TITLE: ${siteTitle}\nTOTAL CRAWLED PAGES: ${pages.length}\n\n`;

  // Collect all discovered anchors
  const allAnchorsMap = new Map<string, Set<string>>();
  for (const page of pages) {
    for (const a of page.internalAnchors) {
      if (!allAnchorsMap.has(a.href)) allAnchorsMap.set(a.href, new Set());
      if (a.label.length > 2 && a.label.length < 60) {
        allAnchorsMap.get(a.href)!.add(a.label);
      }
    }
  }

  digest += `--- DISCOVERED INTERNAL ROUTES & ANCHOR TEXTS ---\n`;
  for (const [path, labels] of allAnchorsMap.entries()) {
    digest += `- Path: ${path} | Labels: ${Array.from(labels).slice(0, 4).join(", ") || path}\n`;
  }

  digest += `\n--- PAGE EXCERPTS ---\n`;
  for (const page of pages.slice(0, 15)) {
    digest += `\n### [PAGE] ${page.path} (${page.title})\n`;
    if (page.description) digest += `Meta: ${page.description}\n`;
    if (page.headings.length > 0) digest += `Headings: ${page.headings.join(" | ")}\n`;
    digest += `Summary: ${page.cleanText.slice(0, 800)}\n`;
  }

  return digest;
}

const BRAND_SYNTHESIS_SCHEMA = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    brandKnowledge: { type: "string" },
    tone: { type: "string" },
    targetAudience: { type: "string" },
    internalLinks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          label: { type: "string" },
          category: { type: "string" },
        },
        required: ["url", "label"],
      },
    },
  },
  required: ["brandName", "brandKnowledge", "tone", "targetAudience", "internalLinks"],
  additionalProperties: false,
} as const;

/**
 * Synthesizes Brand Intelligence from crawl result using Groq / Gemini.
 */
export async function synthesizeBrandProfile(
  crawlResult: DeepCrawlResult
): Promise<SynthesizedBrandProfile> {
  const digest = buildCrawlDigest(crawlResult);

  const prompt = `You are an elite Brand Strategist, Technical Copywriter, and SEO Architect.
Analyze the following deep crawl digest of a live company website and synthesize a structured Brand Intelligence Profile.

Requirements:
1. "brandName": Extract the real brand/company name (e.g. "Acme Cloud", "Apex Analytics"), not the generic page title.
2. "brandKnowledge": Write a high-density, multi-paragraph company knowledge base tailored for AI generation:
   - Identity & Mission: What the company does, their philosophy, and domain focus.
   - Core Capabilities & Offerings: Bullet points or breakdown of primary products/services found on their site.
   - Distinctive Edge & Proof: Any named mechanisms, metrics, client case studies, certifications, or specific methodologies mentioned.
   - Geographic Reach / Market: Who they serve (e.g. US Enterprise, Global SaaS, Local Indian businesses).
3. "tone": A 1-line exact voice specification matching their real live copy (e.g. "direct, high-conviction, developer-centric, technical without fluff" or "approachable, consultative, ROI-driven").
4. "targetAudience": Specific primary and secondary buyer personas (e.g. "VP of Engineering, DevOps Leads, Cloud Architects").
5. "internalLinks": Select 5-15 of the most valuable internal routes from the discovered list (About, primary Services/Solutions, Pricing, Case Studies, Contact). Assign a natural, descriptive anchor label (never "click here") and category (e.g. "Services", "Company", "Proof", "Conversion"). Each url should be a relative path like '/services' or '/pricing'.

WEBSITE CRAWL DIGEST:
${digest}

Output strictly valid JSON matching the requested schema.`;

  // 1. Try Groq
  const groq = getGroqClient();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are a brand intelligence extraction system. Output strictly valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "brand_intelligence",
            strict: true,
            schema: BRAND_SYNTHESIS_SCHEMA,
          },
        },
        temperature: 0.2,
      } as any);

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        return formatSynthesizedProfile(parsed, crawlResult);
      }
    } catch (err) {
      console.warn("[brandSynthesizer] Groq synthesis failed, falling back to Gemini:", err);
    }
  }

  // 2. Try Gemini fallback
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const res = await gemini.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const raw = res.text;
      if (raw) {
        const parsed = JSON.parse(raw);
        return formatSynthesizedProfile(parsed, crawlResult);
      }
    } catch (err) {
      console.warn("[brandSynthesizer] Gemini synthesis failed:", err);
    }
  }

  // Fallback heuristic profile if AI services are unavailable
  return {
    brandName: crawlResult.siteTitle.split(/[|\-–]/)[0].trim() || crawlResult.domain,
    brandKnowledge: `${crawlResult.siteTitle}\nOperating at ${crawlResult.origin}.\nDiscovered ${crawlResult.pages.length} site pages.`,
    tone: "authoritative, actionable, conversion-focused",
    targetAudience: "business decision makers and prospective clients",
    internalLinks: crawlResult.pages.slice(0, 6).map((p) => ({
      url: p.path,
      label: p.title || p.path,
      category: "Site",
    })),
  };
}

function formatSynthesizedProfile(
  raw: any,
  crawlResult: DeepCrawlResult
): SynthesizedBrandProfile {
  const brandName = String(raw.brandName || crawlResult.siteTitle || crawlResult.domain).trim();
  const brandKnowledge = String(raw.brandKnowledge || "").trim();
  const tone = String(raw.tone || "authoritative, actionable, conversion-focused").trim();
  const targetAudience = String(raw.targetAudience || "industry decision makers").trim();

  const internalLinks: InternalLinkItem[] = [];
  if (Array.isArray(raw.internalLinks)) {
    for (const item of raw.internalLinks) {
      if (item && item.url && item.label) {
        let url = String(item.url).trim();
        if (!url.startsWith("/") && !url.startsWith("http")) {
          url = "/" + url;
        }
        internalLinks.push({
          url,
          label: String(item.label).trim(),
          category: item.category ? String(item.category).trim() : undefined,
        });
      }
    }
  }

  return { brandName, brandKnowledge, tone, targetAudience, internalLinks };
}

/**
 * Executes full deep crawl and AI brand synthesis for a site_profile ID.
 */
export async function runFullSiteCrawlAndSynthesis(
  siteId: string,
  websiteUrl: string
): Promise<void> {
  const db = getDbClient();

  const updateStatus = async (progress: number, msg: string) => {
    try {
      await db
        .from("site_profiles")
        .update({
          crawl_status: "in_progress",
          crawl_progress: progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);
    } catch {}

    const local = localSiteProfiles.get(siteId);
    if (local) {
      local.crawl_status = "in_progress";
      local.crawl_progress = progress;
    }
  };

  try {
    await updateStatus(5, "Starting site crawler...");

    // 1. Deep multi-page crawl
    const crawlResult = await deepCrawlWebsite(websiteUrl, async (pct: number, msg: string) => {
      await updateStatus(pct, msg);
    }, 18);

    await updateStatus(88, "Synthesizing Brand Intelligence with AI...");

    // 2. Synthesize Brand Profile with Groq/Gemini
    const synthesized = await synthesizeBrandProfile(crawlResult);

    await updateStatus(96, "Saving synthesized brand intelligence...");

    // 3. Update site_profiles in DB
    const updates = {
      site_name: synthesized.brandName,
      brand_knowledge: synthesized.brandKnowledge,
      tone: synthesized.tone,
      target_audience: synthesized.targetAudience,
      internal_links: synthesized.internalLinks,
      crawl_status: "completed",
      crawl_progress: 100,
      crawl_page_count: crawlResult.pages.length,
      crawl_error: null,
      updated_at: new Date().toISOString(),
    };

    try {
      await db.from("site_profiles").update(updates).eq("id", siteId);
    } catch (dbErr) {
      console.warn("[brandSynthesizer] DB update error:", dbErr);
    }

    const local = localSiteProfiles.get(siteId);
    if (local) {
      Object.assign(local, updates);
    }

    console.log(`[brandSynthesizer] Successfully synthesized site ${siteId} (${synthesized.brandName}) from ${crawlResult.pages.length} pages.`);
  } catch (err: any) {
    console.error(`[brandSynthesizer] Crawl and synthesis failed for site ${siteId}:`, err);
    const errorUpdates = {
      crawl_status: "failed",
      crawl_error: err?.message || "Crawl and brand synthesis failed",
      updated_at: new Date().toISOString(),
    };
    try {
      await db.from("site_profiles").update(errorUpdates).eq("id", siteId);
    } catch {}

    const local = localSiteProfiles.get(siteId);
    if (local) {
      Object.assign(local, errorUpdates);
    }
  }
}
