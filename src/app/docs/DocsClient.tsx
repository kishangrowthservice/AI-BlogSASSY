"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export function DocsClient() {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlQuickstart = `curl -X POST https://api.growthservice.in/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_YOUR_SECRET_KEY" \\
  -d '{
    "topic": "Why High-Intent SEO Converts Better Than Paid Social Ads",
    "keywords": ["SEO ROI", "Customer Acquisition Cost", "B2B Organic"],
    "wordCount": 1200
  }'`;

  const nodeQuickstart = `import { BlogClient } from "@growthservice/blog-client";

const client = new BlogClient({
  apiKey: process.env.BLOG_API_KEY,
  endpoint: "https://api.growthservice.in"
});

// Generates and returns structured blog post with canonical links
const post = await client.generateBlog({
  topic: "Why High-Intent SEO Converts Better Than Paid Social Ads",
  keywords: ["SEO ROI", "Customer Acquisition Cost"],
  wordCount: 1200
});

console.log("Title:", post.title);
console.log("HTML:", post.content);`;

  const pythonQuickstart = `import requests
import os

url = "https://api.growthservice.in/api/generate-blog"
headers = {
    "Content-Type": "application/json",
    "x-api-key": os.getenv("BLOG_API_KEY")
}
payload = {
    "topic": "Why High-Intent SEO Converts Better Than Paid Social Ads",
    "keywords": ["SEO ROI", "Customer Acquisition Cost"],
    "wordCount": 1200
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print("Title:", data["post"]["title"])
print("HTML:", data["post"]["content"])`;

  const responseJson = `{
  "post": {
    "title": "Why High-Intent SEO Converts Better Than Paid Social Ads: The 2026 Breakdown",
    "metaDescription": "Discover why modern businesses are prioritizing durable organic search over fluctuating ad auctions. Includes actionable benchmarks and conversion architecture.",
    "content": "<h2>The Unsustainable Rise of Ad Acquisition Costs</h2>\\n<p>In modern performance marketing, acquiring leads through auction-based ads has become increasingly volatile...</p>",
    "suggestedTags": ["seo-roi", "b2b-growth", "organic-traffic"]
  },
  "telemetry": {
    "provider_used": "groq",
    "model": "llama-3.3-70b-versatile",
    "latency_ms": 1380,
    "total_tokens": 1420,
    "fallback_triggered": false
  }
}`;

  const hmacVerificationCode = `import crypto from "crypto";

export function verifyWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = "sha256=" + hmac.update(rawPayload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(digest));
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
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>API Reference</span>
                <Badge variant="outline" className="font-mono text-[9px]">v2.4</Badge>
              </div>

              <nav className="space-y-1 text-xs">
                {[
                  { id: "quickstart", label: "Quickstart" },
                  { id: "authentication", label: "Authentication (x-api-key)" },
                  { id: "generate", label: "POST /api/generate-blog" },
                  { id: "queue", label: "Async Queue & Polling" },
                  { id: "webhooks", label: "CMS Outbound Webhooks" },
                  { id: "errors", label: "Errors & Status Codes" },
                  { id: "ratelimits", label: "Rate Limits & Quota" },
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
                  Platform queries are backed by Groq and Google Gemini 2.5 Flash with sub-2s latency and automatic 429 failover.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Documentation Body */}
          <div className="lg:col-span-9 space-y-16">
            {/* Quickstart Section */}
            <section id="quickstart" className="space-y-4">
              <Badge variant="outline" className="text-xs font-mono">
                DEVELOPER QUICKSTART
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                AI Blog Generator REST API
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Publish high-ranking, Google E-E-A-T compliant articles with canonical internal backlinks directly from your code, CI/CD pipeline, or automated scheduler.
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
                        <Code2 className="h-3 w-3 text-emerald-400" /> Node.js / TS
                      </TabsTrigger>
                      <TabsTrigger value="python" className="text-xs gap-1.5 font-mono">
                        <Code2 className="h-3 w-3 text-sky-400" /> Python
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="curl" className="relative mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-3 top-3 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                      onClick={() => copyToClipboard(curlQuickstart, "curl")}
                    >
                      {copiedCode === "curl" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCode === "curl" ? "Copied" : "Copy"}
                    </Button>
                    <pre className="p-4 rounded-xl border border-border/70 bg-black/80 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                      {curlQuickstart}
                    </pre>
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
                SECURITY
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">Authentication</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All requests to the generation API must include your secret API key in the <code className="text-primary font-mono bg-muted/60 px-1 py-0.5 rounded">x-api-key</code> HTTP header.
              </p>

              <div className="rounded-lg border border-border/70 bg-background/50 p-4 space-y-2 font-mono text-xs">
                <div className="text-muted-foreground">Header Format:</div>
                <div className="text-indigo-300 font-bold">x-api-key: gs_live_xxxxxxxxxxxxxxxxxxxxxxxx</div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Keep your secret key private:</strong> Never commit your key to public client repositories. API keys are one-way SHA-256 hashed on our servers; lost keys can be rotated anytime from your client dashboard.
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
                Synchronously generates a complete SEO blog post or enqueues a background job if <code>async: true</code> is provided.
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
                        <TableCell className="font-sans text-muted-foreground">The primary subject or headline concept (e.g. &quot;Top SEO Trends in 2026&quot;).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">keywords</TableCell>
                        <TableCell className="text-muted-foreground">string[]</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Secondary search terms naturally incorporated into content and tags.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">wordCount</TableCell>
                        <TableCell className="text-muted-foreground">number</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">Target length (default: 1000, range: 600 - 3500).</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-foreground">async</TableCell>
                        <TableCell className="text-muted-foreground">boolean</TableCell>
                        <TableCell className="text-muted-foreground">No</TableCell>
                        <TableCell className="font-sans text-muted-foreground">If true, returns <code>202 Accepted</code> with a jobId for burst queue polling.</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Response Example */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Response Payload (200 OK)
                </h4>
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
              </div>
            </section>

            {/* CMS Outbound Webhooks */}
            <section id="webhooks" className="space-y-4 pt-4 border-t border-border/40">
              <Badge variant="outline" className="text-xs font-mono">
                AUTOMATED CMS SYNC
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">CMS Outbound Webhooks</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                When you configure a webhook URL in your dashboard, our dispatcher immediately posts completed articles to your endpoint. Validate payloads using the cryptographic HMAC header:
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
                Standard REST error representations returned by the API gateway:
              </p>

              <Card className="border-border/70 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold">Meaning</TableHead>
                      <TableHead className="text-xs font-bold">Resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    <TableRow>
                      <TableCell className="font-mono font-bold text-emerald-400">200 OK</TableCell>
                      <TableCell>Article generated successfully</TableCell>
                      <TableCell className="text-muted-foreground">Synchronous generation payload returned.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-sky-400">202 Accepted</TableCell>
                      <TableCell>Job enqueued for background processing</TableCell>
                      <TableCell className="text-muted-foreground">Poll <code>/api/generate-blog/queue/{`{jobId}`}</code> until completed.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-amber-400">401 Unauthorized</TableCell>
                      <TableCell>Missing or invalid <code>x-api-key</code></TableCell>
                      <TableCell className="text-muted-foreground">Ensure secret key is correctly set in header.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-amber-400">429 Rate Limited / Quota</TableCell>
                      <TableCell>Monthly quota exhausted or concurrent limit</TableCell>
                      <TableCell className="text-muted-foreground">Upgrade subscription tier or configure BYO keys.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold text-red-400">500 Server Error</TableCell>
                      <TableCell>Upstream provider outage (all models failed)</TableCell>
                      <TableCell className="text-muted-foreground">Automatic retry recommended with exponential backoff.</TableCell>
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
