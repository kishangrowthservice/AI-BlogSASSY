"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Search,
  Globe,
  Sliders,
  Database,
  ArrowRight,
  CheckCircle2,
  Lock,
  Share2,
  TrendingUp,
  FileText,
  Clock,
  Code2,
  Workflow,
  Check,
  X,
} from "lucide-react";

interface FeaturePillar {
  badge: string;
  badgeVariant?: "default" | "secondary" | "outline" | "success" | "groq" | "gemini";
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  techHighlight: string;
  codeSnippet?: string;
}

const PILLARS: FeaturePillar[] = [
  {
    badge: "DUAL-LLM ARCHITECTURE",
    badgeVariant: "groq",
    title: "Zero-Downtime Dual LLM Failover",
    subtitle: "Groq Llama 3.3 70B primary engine with automatic Google Gemini 2.5 Flash failover.",
    description:
      "Third-party AI providers experience transient rate limits, token throttling, and sporadic downtime. AI Blog SaaS incorporates atomic PostgreSQL circuit breakers. When an upstream provider flags a 429 or latency exceeds threshold, traffic instantly shifts to our secondary model pool with zero dropped publishing jobs.",
    bullets: [
      "Groq primary for sub-2-second generation speeds",
      "Google Gemini 2.5 Flash fallback with strict JSON schema parity",
      "Atomic circuit breaker state persisted in PostgreSQL",
      "Asynchronous 202 Accepted burst queue smoothing",
    ],
    techHighlight: "100% SLA publishing guarantee — no missed editorial deadlines.",
    codeSnippet: `// Engine Failover Telemetry
{
  "provider": "groq",
  "status": "healthy",
  "circuit_breaker": "closed",
  "consecutive_failures": 0,
  "fallback_standby": "gemini-2.5-flash",
  "latency_p95_ms": 1420
}`,
  },
  {
    badge: "SEARCH ARCHITECTURE",
    badgeVariant: "success",
    title: "Google E-E-A-T & Semantic Optimization",
    subtitle: "Engineered specifically to fulfill search intent and pass modern algorithmic quality audits.",
    description:
      "Google's Helpful Content System penalizes generic AI fluff. Our prompt architecture enforces Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) by mandating practical frameworks, real-world examples, actionable subheadings, and complete elimination of robotic clichés.",
    bullets: [
      "Natural semantic keyword distribution without keyword stuffing",
      "Compelling first-paragraph query answers to minimize bounce rates",
      "Structured schema markup ready meta descriptions and tags",
      "Adheres strictly to search intent matching benchmarks",
    ],
    techHighlight: "Content that reads like a veteran practitioner wrote it.",
    codeSnippet: `// SEO Schema Output
{
  "title": "Scaling Organic Pipeline: The Definitive 2026 Blueprint",
  "metaDescription": "Discover actionable frameworks to increase search revenue...",
  "suggestedTags": ["organic-growth", "b2b-strategy", "seo-authority"],
  "eeat_score": "verified_practitioner"
}`,
  },
  {
    badge: "INTERNAL LINK GRAPH",
    badgeVariant: "secondary",
    title: "Canonical Internal Link Injection",
    subtitle: "Automatically pass link equity and direct qualified readers to your highest-converting pages.",
    description:
      "Most AI content sits as an isolated island on your domain. Our internal link graph algorithm analyzes each generated article's context and naturally weaves in 2 to 3 contextual anchor links pointing toward your core service, product, or pricing URLs, turning everyday articles into conversion funnels.",
    bullets: [
      "Configure unlimited destination URLs and custom anchor tags",
      "Context-aware insertion ensures links read naturally",
      "Passes PageRank link equity to cornerstone commercial pages",
      "Zero manual link insertion required after publishing",
    ],
    techHighlight: "Compounding site authority with every published post.",
    codeSnippet: `// Injected Link Context
<p>
  When optimizing your conversion funnels, consider reviewing 
  <a href='/services/performance-seo'>our performance SEO services</a> 
  to establish predictable organic acquisition.
</p>`,
  },
  {
    badge: "AUTOMATED PUBLISHING",
    badgeVariant: "outline",
    title: "1-Click CMS Outbound Webhooks",
    subtitle: "Publish clean semantic HTML directly to WordPress, Shopify, Webflow, and Ghost.",
    description:
      "No more copy-pasting between browser tabs. Once an article completes generation, AI Blog SaaS automatically dispatches the complete payload via HTTP POST to your configured CMS webhook endpoint, accompanied by cryptographic HMAC-SHA256 signatures for bulletproof security.",
    bullets: [
      "Native compatibility with WordPress REST API and plugins",
      "Instant integration with Shopify, Webflow, Ghost, and Strapi",
      "Cryptographic HMAC signature verification for defense-in-depth",
      "Includes formatted titles, meta summaries, content, and tags",
    ],
    techHighlight: "Zero-touch publishing from idea to live URL.",
    codeSnippet: `// Webhook Outbound Payload
POST https://yourdomain.com/api/webhooks/incoming-article
X-Signature-SHA256: d5a4c6...
Content-Type: application/json

{
  "event": "article.published",
  "site_id": "site_982f1b4c",
  "article": { ... }
}`,
  },
  {
    badge: "VOICE MODELING",
    badgeVariant: "secondary",
    title: "Custom Brand DNA Voice Modeling",
    subtitle: "Train the engine on your company story, target audience, and preferred tone.",
    description:
      "Generic AI sounds like everyone else. With our Brand DNA system, you define your unique company overview, target demographic, and tone presets (Authoritative, Conversational, or Technical). Every sentence produced aligns with your distinct vocabulary and editorial guidelines.",
    bullets: [
      "Learns custom industry jargon and eliminates banned buzzwords",
      "Calibrates vocabulary for specialized B2B or B2C audiences",
      "Independent brand profiles for multi-site agencies",
      "Easy adjustments directly from your client dashboard",
    ],
    techHighlight: "Your authentic voice, scaled across hundreds of articles.",
    codeSnippet: `// Brand Profile Configuration
{
  "brand_knowledge": "B2B infrastructure & developer tools...",
  "tone": "authoritative, technical, high-conviction",
  "target_audience": "VP of Engineering & DevOps Directors"
}`,
  },
  {
    badge: "ENTERPRISE SECURITY",
    badgeVariant: "default",
    title: "Multi-Tenant Isolation & BYO AI Keys",
    subtitle: "Bring your own Groq or Gemini keys and enjoy strict row-level data isolation.",
    description:
      "Security and data privacy are core architectural tenets. Every tenant's data is strictly partitioned using PostgreSQL Row-Level Security (RLS). Furthermore, clients with existing enterprise LLM contracts can bring their own API keys (BYO Keys), with credentials hashed and sanitized across all client interfaces.",
    bullets: [
      "PostgreSQL Row-Level Security (RLS) on all database tables",
      "One-way SHA-256 hashed API key authentication",
      "Client profile sanitization prevents key exposure in browser props",
      "Optional BYO Groq and Google Gemini API key configuration",
    ],
    techHighlight: "Enterprise privacy: Your data is never used to train public models.",
    codeSnippet: `// Sanitized Client Profile Contract
export type SafeSiteProfile = Omit<
  SiteProfile, 
  "byo_groq_api_key" | "byo_gemini_api_key" | "api_key_hash"
>;`,
  },
];

const COMPARISON_ROWS = [
  { feature: "Time to Publish 1 Article", us: "30 Seconds", copywriter: "3 to 5 Days", genericAi: "30 to 45 Minutes" },
  { feature: "Average Cost per Article", us: "$0.80 – $1.20", copywriter: "$100 – $250", genericAi: "$5 – $15" },
  { feature: "Automated CMS Webhook Push", us: true, copywriter: false, genericAi: false },
  { feature: "Canonical Internal Link Injection", us: true, copywriter: "Manual", genericAi: false },
  { feature: "Dual-LLM Circuit Breaker Uptime", us: true, copywriter: false, genericAi: false },
  { feature: "Google E-E-A-T Intent Compliance", us: true, copywriter: "Varies", genericAi: "Generic Fluff" },
  { feature: "Multi-Site Agency Management", us: true, copywriter: false, genericAi: false },
  { feature: "Bring Your Own AI Keys (BYO)", us: true, copywriter: false, genericAi: false },
];

export function FeaturesClient() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1">
            ENGINEERING EXCELLENCE • ZERO COMPROMISE
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Architecture Designed to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dominate Organic Search
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Discover the technical, content, and infrastructure features that transform automated AI drafts into authoritative, high-ranking assets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="sm" className="text-xs font-semibold">
              <Link href="/signup">
                Start Free Trial &rarr;
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
              <Link href="/preview">
                Test in Live Studio
              </Link>
            </Button>
          </div>
        </div>

        {/* 6 Feature Pillars */}
        <div className="space-y-16">
          {PILLARS.map((pillar, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden p-6 sm:p-10">
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}>
                    {/* Content Column */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={pillar.badgeVariant as any || "outline"} className="text-[10px] font-mono font-bold tracking-wider">
                          {pillar.badge}
                        </Badge>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {pillar.title}
                      </h2>

                      <p className="text-xs sm:text-sm font-semibold text-indigo-300">
                        {pillar.subtitle}
                      </p>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {pillar.description}
                      </p>

                      <div className="space-y-2 pt-2">
                        {pillar.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2 text-xs text-foreground/90">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md inline-block">
                          ⚡ {pillar.techHighlight}
                        </span>
                      </div>
                    </div>

                    {/* Code Snippet / Technical Visual Column */}
                    <div className="lg:col-span-5">
                      <div className="rounded-xl border border-border/70 bg-black/80 p-4 shadow-2xl overflow-hidden font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                          </div>
                          <span>system_telemetry.json</span>
                        </div>
                        <pre className="text-sky-300 text-[11px] overflow-x-auto leading-relaxed">
                          {pillar.codeSnippet}
                        </pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Matrix: AI Blog SaaS vs Copywriter vs Generic AI */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="font-mono text-xs px-3 py-1">
              THE UNFAIR ADVANTAGE
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How AI Blog SaaS Compares
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Why high-growth brands choose autonomous publishing over manual agencies and fragile wrappers.
            </p>
          </div>

          <Card className="border-border/70 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-transparent">
                  <TableHead className="w-[35%] text-xs font-bold text-foreground">Metric / Feature</TableHead>
                  <TableHead className="w-[25%] text-center text-xs font-bold text-emerald-400 bg-emerald-500/10">
                    AI Blog SaaS Platform
                  </TableHead>
                  <TableHead className="w-[20%] text-center text-xs font-bold text-muted-foreground">Traditional Agency</TableHead>
                  <TableHead className="w-[20%] text-center text-xs font-bold text-muted-foreground">Generic AI Wrappers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium text-foreground py-3">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-emerald-400 bg-emerald-500/5 py-3">
                      {typeof row.us === "boolean" ? (
                        row.us ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-red-400 mx-auto" />
                      ) : (
                        row.us
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground py-3">
                      {typeof row.copywriter === "boolean" ? (
                        row.copywriter ? <Check className="h-4 w-4 text-muted-foreground mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.copywriter
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground py-3">
                      {typeof row.genericAi === "boolean" ? (
                        row.genericAi ? <Check className="h-4 w-4 text-muted-foreground mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      ) : (
                        row.genericAi
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Final Conversion Banner */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-indigo-950/40 via-card/80 to-background/80 p-8 sm:p-12 text-center space-y-6 max-w-4xl mx-auto shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Workflow className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Experience the Engine on Your Domain
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Set up your brand profile in under 2 minutes. Start publishing high-converting, Google-compliant articles automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-11 px-6 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
              <Link href="/signup">
                Start 14-Day Free Trial &rarr;
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold border-border/80">
              <Link href="/pricing">
                View Pricing Plans
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
