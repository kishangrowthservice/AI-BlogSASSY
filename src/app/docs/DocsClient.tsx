"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Code2,
  Terminal,
  Key,
  Layers,
  Share2,
  Check,
  Copy,
  AlertTriangle,
  Clock,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function DocsClient() {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://api.yourdomain.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlQuickstart = `curl -X POST "${origin}/api/generate-blog" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_YOUR_RAW_SECRET_KEY" \\
  -d '{
    "topic": "Why High-Intent SEO Converts Better Than Paid Social Ads",
    "keywords": ["SEO ROI", "Customer Acquisition Cost", "B2B Organic"],
    "wordCount": 1200
  }'`;

  const curlBearer = `curl -X POST "${origin}/api/generate-blog" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer gs_live_YOUR_RAW_SECRET_KEY" \\
  -d '{
    "topic": "How Real-Time Performance Tuning Boosts High-Traffic Next.js SaaS",
    "keywords": ["Next.js performance", "SaaS latency", "Core Web Vitals"]
  }'`;

  const nodeQuickstart = `// Standard TypeScript / Next.js / Node.js 18+ (Zero External Dependencies)
export interface GeneratedArticle {
  title: string;
  slug: string;
  metaDescription: string;
  meta_description: string;
  content: string; // Ready-to-render semantic HTML
  suggestedTags: string[];
  tags: string[];
  wordCount: number;
  readingTime: string;
  telemetry?: {
    provider: string;
    model: string;
    latency_ms: number;
  };
}

export async function generateArticle(topic: string, keywords: string[]): Promise<GeneratedArticle> {
  const apiKey = process.env.AI_BLOG_API_KEY;
  if (!apiKey) throw new Error("AI_BLOG_API_KEY environment variable is required");

  const response = await fetch("${origin}/api/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      topic,
      keywords,
      wordCount: 1200,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || \`API request failed with status \${response.status}\`);
  }

  const article: GeneratedArticle = await response.json();
  return article;
}

// Example Execution:
// const post = await generateArticle("Top 10 Growth Tactics in 2026", ["growth", "b2b"]);
// console.log("Slug:", post.slug);
// console.log("Title:", post.title);`;

  const pythonQuickstart = `import os
import requests

API_URL = "${origin}/api/generate-blog"
API_KEY = os.getenv("AI_BLOG_API_KEY", "gs_live_YOUR_RAW_SECRET_KEY")

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
}

payload = {
    "topic": "Why High-Intent SEO Converts Better Than Paid Social Ads",
    "keywords": ["SEO ROI", "Customer Acquisition Cost", "B2B Organic"],
    "wordCount": 1200,
}

response = requests.post(API_URL, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Title:       ", data["title"])
    print("Slug:        ", data["slug"])
    print("Reading Time:", data["readingTime"])
    print("Tags:        ", ", ".join(data["tags"]))
    print("HTML Length: ", len(data["content"]), "characters")
else:
    print(f"Error {response.status_code}:", response.json())`;

  const responseJson = `{
  "title": "Why High-Intent SEO Converts Better Than Paid Social Ads",
  "slug": "why-high-intent-seo-converts-better-than-paid-social-ads",
  "metaDescription": "Discover why modern businesses prioritize durable organic search over fluctuating ad auctions. Includes actionable benchmarks and conversion architecture.",
  "meta_description": "Discover why modern businesses prioritize durable organic search over fluctuating ad auctions. Includes actionable benchmarks and conversion architecture.",
  "content": "<p>High‑traffic SaaS apps can’t afford a slow page...</p><h2>The Unsustainable Rise of Ad Acquisition Costs</h2><p>Acquiring leads through auction-based ads has become increasingly volatile...</p><blockquote><p>“If you’re not measuring performance in real time, you’re flying blind.”</p></blockquote><h3>FAQ</h3><h3>How does organic search drive lower CAC?</h3><p>Unlike paid ads that stop delivering the moment ad spend pauses, organic search assets compound over time.</p>",
  "suggestedTags": ["SEO ROI", "Organic Traffic", "B2B Growth"],
  "suggested_tags": ["SEO ROI", "Organic Traffic", "B2B Growth"],
  "tags": ["SEO ROI", "Organic Traffic", "B2B Growth"],
  "wordCount": 1240,
  "word_count": 1240,
  "readingTime": "7 min read",
  "reading_time_minutes": 7,
  "telemetry": {
    "provider": "groq",
    "model": "openai/gpt-oss-120b",
    "latency_ms": 3420,
    "tokens": {
      "prompt": 1280,
      "completion": 745,
      "total": 2025
    }
  }
}`;

  const hmacVerificationCode = `import crypto from "crypto";

/**
 * Verify inbound webhook payload from AI Blog SaaS
 * @param rawPayload - Raw UTF-8 request body string (do NOT parse JSON before verifying)
 * @param signatureHeader - Value of the 'x-hub-signature-256' or 'x-signature' header
 * @param webhookSecret - Your webhook signing secret from dashboard
 */
export function verifyWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  if (!rawPayload || !signatureHeader || !webhookSecret) return false;

  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = "sha256=" + hmac.update(rawPayload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(digest));
  } catch {
    return false;
  }
}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Docs Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>API Reference</span>
                <Badge variant="outline" className="font-mono text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">v2.5</Badge>
              </div>

              <nav className="space-y-1 text-xs">
                {[
                  { id: "quickstart", label: "Quickstart & Examples" },
                  { id: "authentication", label: "Authentication (x-api-key / Bearer)" },
                  { id: "generate", label: "POST /api/generate-blog" },
                  { id: "response-schema", label: "Response Schema & Fields" },
                  { id: "queue", label: "Async Queue & Polling" },
                  { id: "webhooks", label: "CMS Outbound Webhooks" },
                  { id: "errors", label: "HTTP Status Codes & Errors" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <Separator className="bg-border/40" />

              <div className="rounded-lg border border-border/60 bg-card/40 p-3 space-y-2 text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Dual-LLM SLA
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Inference is powered by Groq (GPT-OSS-120B / Llama 3.3) with automatic, zero-downtime failover to Google Gemini 3.1 Flash-Lite.
                </p>
              </div>

              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 space-y-1.5 text-xs text-indigo-300">
                <span className="font-bold text-[11px] flex items-center gap-1 text-indigo-200">
                  <Sparkles className="h-3 w-3" /> 100% Free Public Beta
                </span>
                <p className="text-[11px] leading-relaxed text-indigo-300/90">
                  All endpoints, priority generation, and quotas are currently free in production. No credit card required.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Documentation Body */}
          <div className="lg:col-span-9 space-y-16">
            {/* Quickstart Section */}
            <section id="quickstart" className="space-y-4">
              <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
                DEVELOPER QUICKSTART
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                AI Blog Generator REST API
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate search-optimized, Google E-E-A-T compliant articles with canonical internal backlinks, dynamic FAQ sections, and rich HTML formatting directly from your application or CMS.
              </p>

              {/* Code Snippets Tabs */}
              <div className="pt-2">
                <Tabs defaultValue="curl" className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <TabsList className="bg-muted/50 p-1">
                      <TabsTrigger value="curl" className="text-xs gap-1.5 font-mono">
                        <Terminal className="h-3 w-3" /> cURL
                      </TabsTrigger>
                      <TabsTrigger value="node" className="text-xs gap-1.5 font-mono">
                        <Code2 className="h-3 w-3 text-emerald-400" /> Node.js / TypeScript
                      </TabsTrigger>
                      <TabsTrigger value="python" className="text-xs gap-1.5 font-mono">
                        <Code2 className="h-3 w-3 text-sky-400" /> Python
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="curl" className="relative mt-0 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                        <span>Standard Header (<code className="text-foreground">x-api-key</code>):</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1 px-2"
                          onClick={() => copyToClipboard(curlQuickstart, "curl1")}
                        >
                          {copiedCode === "curl1" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedCode === "curl1" ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                        {curlQuickstart}
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                        <span>Bearer Header (<code className="text-foreground">Authorization: Bearer &lt;key&gt;</code>):</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs gap-1 px-2"
                          onClick={() => copyToClipboard(curlBearer, "curl2")}
                        >
                          {copiedCode === "curl2" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedCode === "curl2" ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                        {curlBearer}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="node" className="relative mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-3 top-3 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                      onClick={() => copyToClipboard(nodeQuickstart, "node")}
                    >
                      {copiedCode === "node" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCode === "node" ? "Copied" : "Copy"}
                    </Button>
                    <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                      {nodeQuickstart}
                    </pre>
                  </TabsContent>

                  <TabsContent value="python" className="relative mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-3 top-3 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                      onClick={() => copyToClipboard(pythonQuickstart, "python")}
                    >
                      {copiedCode === "python" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCode === "python" ? "Copied" : "Copy"}
                    </Button>
                    <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
                      {pythonQuickstart}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Authentication Section */}
            <section id="authentication" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                SECURITY &amp; KEYS
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">Authentication</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All requests to the AI Blog API require a valid API key. We support three convenient authentication schemes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                  <div className="text-muted-foreground text-[11px] font-sans font-semibold">1. Standard Header (Recommended)</div>
                  <div className="text-indigo-300 font-bold truncate">x-api-key: gs_live_...</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                  <div className="text-muted-foreground text-[11px] font-sans font-semibold">2. Bearer Token</div>
                  <div className="text-emerald-300 font-bold truncate">Authorization: Bearer gs_live_...</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                  <div className="text-muted-foreground text-[11px] font-sans font-semibold">3. Query Parameter</div>
                  <div className="text-amber-300 font-bold truncate">?apiKey=gs_live_...</div>
                </div>
              </div>

              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  <strong>CRITICAL: Do NOT use the masked preview prefix:</strong> When you generate an API key in the dashboard, you are shown the raw 48-character key (e.g. <code>gs_live_a1b2c3...</code>). In the table row, we only display a masked prefix (e.g. <code>gs_live_••••1234</code>) to protect your secret from shoulder-surfing. Passing the masked prefix with dots will be rejected with an HTTP 401 error.
                </span>
              </div>
            </section>

            {/* Generate Endpoint Section */}
            <section id="generate" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                ENDPOINT
              </Badge>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold font-mono">
                  POST
                </Badge>
                <code className="text-base sm:text-lg font-bold font-mono text-foreground">
                  /api/generate-blog
                </code>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                Synchronously generates a complete, formatted article with live metadata or enqueues a background job if <code>async: true</code> is provided.
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Request JSON Body Parameters
                </h4>
                <Card className="border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs font-bold">Parameter</TableHead>
                        <TableHead className="text-xs font-bold">Type</TableHead>
                        <TableHead className="text-xs font-bold">Required</TableHead>
                        <TableHead className="text-xs font-bold">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs font-mono">
                      <TableRow>
                        <TableCell className="font-bold text-foreground">topic</TableCell>
                        <TableCell className="text-muted-foreground">string</TableCell>
                        <TableCell className="text-emerald-400">Yes</TableCell>
                        <TableCell className="font-sans text-muted-foreground">The primary subject or headline concept (e.g. &quot;Top Next.js Performance Hacks in 2026&quot;).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">keywords</TableCell>
                        <TableCell className="text-muted-foreground">string[]</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Secondary search queries naturally woven into <code>&lt;h2&gt;</code> and content.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">wordCount</TableCell>
                        <TableCell className="text-muted-foreground">number</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Target article word count (default: 1000, supported range: 200 - 3000).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">tone</TableCell>
                        <TableCell className="text-muted-foreground">string</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Override brand tone (e.g. &quot;authoritative, consultative, data-backed&quot;).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">audience</TableCell>
                        <TableCell className="text-muted-foreground">string</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Target persona (e.g. &quot;CTOs, VP of Engineering, React Developers&quot;).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">async</TableCell>
                        <TableCell className="text-muted-foreground">boolean</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">If true, returns <code>202 Accepted</code> with a <code>jobId</code> for asynchronous queue workers.</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </section>

            {/* Response Schema Section */}
            <section id="response-schema" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                DATA CONTRACT
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">Response Schema &amp; Fields</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                The generation API returns clean JSON formatted for immediate CMS storage or frontend rendering (both camelCase and snake_case aliases are included):
              </p>

              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                  onClick={() => copyToClipboard(responseJson, "res")}
                >
                  {copiedCode === "res" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === "res" ? "Copied" : "Copy"}
                </Button>
                <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {responseJson}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border/60 bg-card/40 space-y-1">
                  <span className="font-bold text-foreground font-mono">slug</span>
                  <p className="text-muted-foreground text-[11px]">URL-friendly slug derived from the title. Ideal for dynamic Next.js routes like <code>/blog/[slug]</code>.</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-card/40 space-y-1">
                  <span className="font-bold text-foreground font-mono">content</span>
                  <p className="text-muted-foreground text-[11px]">Valid semantic HTML containing <code>&lt;p&gt;</code>, <code>&lt;h2&gt;</code>, <code>&lt;h3&gt;</code>, <code>&lt;blockquote&gt;</code>, and <code>&lt;ul&gt;</code>/<code>&lt;ol&gt;</code> tags.</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-card/40 space-y-1">
                  <span className="font-bold text-foreground font-mono">readingTime</span>
                  <p className="text-muted-foreground text-[11px]">Human-readable reading estimate (e.g. &quot;7 min read&quot;) calculated from word count.</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-card/40 space-y-1">
                  <span className="font-bold text-foreground font-mono">telemetry</span>
                  <p className="text-muted-foreground text-[11px]">Operational metadata including model used, prompt/completion tokens, and latency in milliseconds.</p>
                </div>
              </div>
            </section>

            {/* Async Queue Polling */}
            <section id="queue" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                ASYNC WORKERS
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">Async Queue &amp; Polling</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                When generating in batch or during traffic spikes, pass <code>&quot;async&quot;: true</code> in your request payload to avoid keeping HTTP connections open:
              </p>

              <div className="rounded-lg border border-border/70 bg-black/80 p-4 font-mono text-xs text-sky-300 space-y-2">
                <div className="text-muted-foreground">// 1. Enqueue returns 202 Accepted:</div>
                <div>{`{ "status": "accepted", "jobId": "4a71...", "checkStatusUrl": "/api/generate-blog/queue/4a71..." }`}</div>
                <div className="text-muted-foreground pt-2">// 2. Poll the status URL with your x-api-key:</div>
                <div className="text-emerald-300">curl -H &quot;x-api-key: gs_live_...&quot; &quot;{origin}/api/generate-blog/queue/4a71...&quot;</div>
              </div>
            </section>

            {/* CMS Outbound Webhooks */}
            <section id="webhooks" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                AUTOMATED CMS SYNC
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">CMS Outbound Webhooks</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Configure a webhook URL in your dashboard to have completed articles automatically delivered to your CMS (WordPress, Strapi, Webflow, custom Next.js). Validate payloads using HMAC SHA-256 signatures:
              </p>

              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                  onClick={() => copyToClipboard(hmacVerificationCode, "hmac")}
                >
                  {copiedCode === "hmac" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === "hmac" ? "Copied" : "Copy"}
                </Button>
                <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed">
                  {hmacVerificationCode}
                </pre>
              </div>
            </section>

            {/* Error Codes Reference */}
            <section id="errors" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                STATUS CODES
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">HTTP Status Codes</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                REST status codes returned by the API gateway:
              </p>

              <Card className="border-border/70 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold">Meaning</TableHead>
                      <TableHead className="text-xs font-bold">Action / Fix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    <TableRow>
                      <TableCell className="font-mono font-bold text-emerald-400">200 OK</TableCell>
                      <TableCell>Generation Succeeded</TableCell>
                      <TableCell className="text-muted-foreground">Complete article payload returned synchronously.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-sky-400">202 Accepted</TableCell>
                      <TableCell>Job Enqueued</TableCell>
                      <TableCell className="text-muted-foreground">Poll <code>checkStatusUrl</code> with your API key until status is <code>completed</code>.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-amber-400">400 Bad Request</TableCell>
                      <TableCell>Invalid Request Payload</TableCell>
                      <TableCell className="text-muted-foreground">Ensure <code>topic</code> is provided and is a non-empty string.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-amber-400">401 Unauthorized</TableCell>
                      <TableCell>Invalid or Missing API Key</TableCell>
                      <TableCell className="text-muted-foreground">Pass raw secret key via <code>x-api-key</code> or <code>Authorization: Bearer &lt;key&gt;</code>. Never pass masked dots (••••).</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-amber-400">429 Quota Exceeded</TableCell>
                      <TableCell>Monthly Limit Reached</TableCell>
                      <TableCell className="text-muted-foreground">Switch tier in dashboard (free during beta) to increase quota.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-red-400">500 Server Error</TableCell>
                      <TableCell>Inference Pipeline Issue</TableCell>
                      <TableCell className="text-muted-foreground">Primary and fallback models failed. Automatic retry with exponential backoff recommended.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
