"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowRight,
} from "lucide-react";

interface ReleaseItem {
  version: string;
  date: string;
  title: string;
  tag: "Major" | "Feature" | "Security" | "Performance";
  tagColor: "default" | "secondary" | "success" | "warning";
  summary: string;
  changes: { type: "New" | "Improved" | "Fixed" | "Security"; description: string }[];
}

const RELEASES: ReleaseItem[] = [
  {
    version: "v2.4.0",
    date: "September 24, 2026",
    title: "Dual-LLM Atomic Circuit Breakers & Multi-Site Agency Switcher",
    tag: "Major",
    tagColor: "success",
    summary:
      "Introduced atomic PostgreSQL-persisted circuit breakers for zero-downtime failover between Groq Llama 3.3 and Google Gemini 2.5 Flash, alongside multi-site client management.",
    changes: [
      { type: "New", description: "Multi-Site Switcher dropdown in the dashboard header for seamless multi-client management." },
      { type: "New", description: "Atomic PostgreSQL stored procedures record_circuit_failure and record_circuit_success." },
      { type: "Improved", description: "Gemini 2.5 Flash fallback generation updated with strict JSON schema enforcement matching Groq." },
      { type: "Security", description: "Comprehensive cross-tenant authorization audit and regression testing test suite." },
    ],
  },
  {
    version: "v2.3.0",
    date: "September 22, 2026",
    title: "Atomic Quota Reservation & CMS Outbound Webhooks",
    tag: "Feature",
    tagColor: "default",
    summary:
      "Eliminated concurrency race conditions in generation quota allocation and added automated outbound HTTP POST dispatching to customer CMS endpoints.",
    changes: [
      { type: "New", description: "Atomic reserve_tenant_quota and release_tenant_quota stored procedures prevent quota overshooting." },
      { type: "New", description: "Automated CMS Outbound Webhook dispatcher with cryptographic HMAC-SHA256 signature verification." },
      { type: "New", description: "Full article persistence in generation logs with click-to-inspect modal viewer and 1-click HTML copy." },
      { type: "Improved", description: "Stripe billing checkout integration for seamless self-serve subscription tier upgrades." },
    ],
  },
  {
    version: "v2.2.0",
    date: "September 18, 2026",
    title: "Bring Your Own Key (BYO) & Studio Sandbox",
    tag: "Feature",
    tagColor: "default",
    summary:
      "Added client dashboard support for custom Groq and Gemini API keys and introduced the interactive Live Studio playground.",
    changes: [
      { type: "New", description: "BYO Groq and Google Gemini API key inputs with real-time UI feedback." },
      { type: "New", description: "Interactive Live Studio sandbox (/preview) supporting simulated demo mode and live API key testing." },
      { type: "Security", description: "SafeSiteProfile contract strips raw API keys before serializing to client browser props." },
      { type: "Improved", description: "Defense-in-depth HTTP security headers (X-Frame-Options, CSP, Referrer-Policy, HSTS)." },
    ],
  },
  {
    version: "v2.1.0",
    date: "September 12, 2026",
    title: "Canonical Internal Link Injection Engine",
    tag: "Performance",
    tagColor: "warning",
    summary:
      "Launched context-aware algorithmic internal link injection that weaves links to core commercial pages directly into article copy.",
    changes: [
      { type: "New", description: "Interactive Internal Links manager in tenant dashboard for managing anchor text and URLs." },
      { type: "New", description: "Algorithm weaves 2–3 contextual canonical backlinks per post to pass link equity." },
      { type: "Improved", description: "Google E-E-A-T prompt engineering benchmarks eliminate repetitive AI introductory clichés." },
      { type: "Fixed", description: "HTML entity escaping and single-quote attribute enforcement for flawless CMS parsing." },
    ],
  },
  {
    version: "v2.0.0",
    date: "September 1, 2026",
    title: "Next.js 15 App Router Architecture & Supabase RLS",
    tag: "Major",
    tagColor: "success",
    summary:
      "Core platform rebuild on Next.js 15 with Tailwind CSS, shadcn/ui components, and Supabase Row-Level Security.",
    changes: [
      { type: "New", description: "Next.js 15 App Router architecture with server actions and edge-ready API routes." },
      { type: "New", description: "Supabase Row-Level Security (RLS) policies enforcing multi-tenant isolation." },
      { type: "New", description: "SHA-256 hashed API key authentication for secure external API access." },
      { type: "New", description: "Asynchronous burst queue smoothing (202 Accepted) protecting upstream LLM limits." },
    ],
  },
];

export function ChangelogClient() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1">
            CONTINUOUS IMPROVEMENT
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Product Changelog &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Release Notes
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Follow our weekly engineering updates, infrastructure reliability milestones, and feature releases as we build the world&apos;s most resilient autonomous content platform.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
          {RELEASES.map((rel) => (
            <div key={rel.version} className="relative pl-10 space-y-3">
              {/* Timeline Indicator Dot */}
              <div className="absolute left-2 top-1.5 -translate-x-1/2 h-4 w-4 rounded-full bg-background border-2 border-indigo-500 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </div>

              {/* Version & Date Strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm text-foreground">{rel.version}</span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {rel.date}
                </span>
                <Badge variant={rel.tagColor as any} className="text-[10px] font-mono font-semibold py-0">
                  {rel.tag}
                </Badge>
              </div>

              {/* Release Card */}
              <Card className="border-border/70 bg-card/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">{rel.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rel.summary}</p>
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Key Changes
                  </span>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {rel.changes.map((change, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2">
                        <Badge
                          variant={
                            change.type === "New"
                              ? "success"
                              : change.type === "Security"
                              ? "destructive"
                              : change.type === "Improved"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[9px] font-mono px-1.5 py-0 shrink-0 mt-0.5"
                        >
                          {change.type}
                        </Badge>
                        <span className="text-foreground/90 leading-relaxed">{change.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <Card className="border-border/80 bg-gradient-to-r from-indigo-950/40 via-card/80 to-background/80 p-8 rounded-2xl shadow-xl backdrop-blur-xl text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-foreground">Stay Informed on Platform Upgrades</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Get instant notifications when new CMS plugins, model updates, and optimization algorithms go live.
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/signup">
                Create Free Account &rarr;
              </Link>
            </Button>
          </div>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
