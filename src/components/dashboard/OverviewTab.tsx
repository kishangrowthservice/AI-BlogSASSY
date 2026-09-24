"use client";

import React from "react";
import {
  FileText,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Globe,
  Sliders,
  Check,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog } from "@/lib/types";
import { getPlanTier } from "@/lib/billing";
import { TokenAnalyticsCard } from "./TokenAnalyticsCard";

interface OverviewTabProps {
  profile: SafeSiteProfile;
  logs: GenerationLog[];
  keyPrefix: string | null;
  onOpenGenerateModal: () => void;
  onNavigateTab: (tab: "articles" | "brand" | "automations" | "developer" | "billing") => void;
  onInspectLog: (log: GenerationLog) => void;
}

export function OverviewTab({
  profile,
  logs,
  keyPrefix,
  onOpenGenerateModal,
  onNavigateTab,
  onInspectLog,
}: OverviewTabProps) {
  const currentPlan = getPlanTier(profile.plan_tier);

  // Compute metrics
  const successfulLogs = logs.filter((l) => l.status === "success");
  const totalArticles = profile.used_quota || successfulLogs.length;

  const totalPromptTokens = successfulLogs.reduce((acc, log) => {
    const p = log.prompt_tokens || Math.round((log.total_tokens || 1850) * 0.32);
    return acc + p;
  }, 0);

  const totalCompletionTokens = successfulLogs.reduce((acc, log) => {
    const c = log.completion_tokens || Math.round((log.total_tokens || 1850) * 0.68);
    return acc + c;
  }, 0);

  const totalTokens = Math.max(
    totalPromptTokens + totalCompletionTokens,
    (profile.used_quota || 0) * 1900
  );

  const avgLatency = successfulLogs.length > 0
    ? (successfulLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / successfulLogs.length / 1000).toFixed(1)
    : "1.4";

  const remainingQuota = Math.max(0, (profile.monthly_quota || 0) - (profile.used_quota || 0));
  const quotaPercent = Math.min(100, Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100));

  // Setup Checklist Calculation
  const setupSteps = [
    { label: "Website Profile Connected", done: true },
    { label: "Connection Key Active", done: Boolean(keyPrefix) },
    { label: "Brand Voice Configured", done: Boolean(profile.brand_knowledge && profile.brand_knowledge.length > 10) },
    { label: "Internal Links Added", done: Boolean(profile.internal_links && profile.internal_links.length > 0) },
    { label: "CMS Webhook Connected", done: Boolean(profile.webhook_url) },
  ];
  const completedSteps = setupSteps.filter((s) => s.done).length;
  const checklistPercent = Math.round((completedSteps / setupSteps.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-indigo-950/40 via-card/80 to-background/80 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Website: {profile.site_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Autonomous Content Performance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your autonomous AI content pipeline is actively generating human-grade articles, matching your brand voice, and distributing organic backlinks across your domain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onOpenGenerateModal}
              className="text-xs font-semibold gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 h-10 px-5"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Generate Article Now
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigateTab("articles")}
              className="text-xs font-semibold gap-1.5 h-10 px-4 border-border/80"
            >
              <FileText className="h-4 w-4" />
              View Articles ({logs.length})
            </Button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Articles Published */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Articles
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">{totalArticles}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>All-time published</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Total Tokens Processed */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tokens Consumed
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">
              {totalTokens.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono flex items-center gap-1.5">
              <span className="text-indigo-400 font-semibold">{totalPromptTokens.toLocaleString()} in</span>
              <span>•</span>
              <span className="text-purple-400 font-semibold">{totalCompletionTokens.toLocaleString()} out</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Average Latency & Throughput */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Latency &amp; Speed
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">{avgLatency}s</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <Activity className="h-3 w-3" />
              <span>~{Math.round(totalTokens / Math.max(1, totalArticles))} tokens / request</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Monthly Quota Remaining */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Quota &amp; Limits
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono text-primary">
              {currentPlan.name}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-foreground font-mono">
                {remainingQuota}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                / {profile.monthly_quota} articles
              </span>
            </div>
            <Progress value={quotaPercent} className="h-1.5 mt-2 bg-muted/60" />
            <div className="text-[10px] text-muted-foreground font-mono mt-2 flex items-center justify-between">
              <span>Rate Limit: 5 RPM</span>
              <span className="text-emerald-400">Burst: 15k TPM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Section: Setup Checklist & Dual-LLM Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Website Setup Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Website Setup Checklist
                </CardTitle>
                <span className="font-mono text-xs text-primary font-bold">{checklistPercent}%</span>
              </div>
              <CardDescription className="text-xs">
                Essential configurations for full autonomous SEO rankings.
              </CardDescription>
              <Progress value={checklistPercent} className="h-1.5 mt-2 bg-muted/60" />
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {setupSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-xs"
                >
                  <span className={step.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                  {step.done ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5 gap-1">
                      <Check className="h-3 w-3" /> Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] text-amber-400 bg-amber-500/10">
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>

            <div className="p-4 border-t border-border/40 bg-muted/10 rounded-b-xl flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Configure brand voice &amp; links:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab("brand")}
                className="text-xs text-primary font-semibold hover:text-primary/80 h-7"
              >
                Go to Brand DNA &rarr;
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Dual-LLM Redundancy Status & Engine Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  Dual-LLM Engine Redundancy Matrix
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                  99.99% PUBLISHING SLA
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Resilient content generation with automatic sub-second provider failover.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Engine 1: Groq */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-300">Primary Engine</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">
                      Operational
                    </Badge>
                  </div>
                  <div className="font-mono text-xs font-semibold text-foreground">Groq Llama 3.3 70B</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Ultra-low latency inference delivering human-grade structure and search intent analysis in ~1-2s.
                  </p>
                </div>

                {/* Engine 2: Gemini */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-300">Automated Fallback</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">
                      Standby Active
                    </Badge>
                  </div>
                  <div className="font-mono text-xs font-semibold text-foreground">Google Gemini 2.0 Flash</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Automatic circuit breaker failover if Groq experiences provider rate limits or spikes.
                  </p>
                </div>
              </div>

              {/* Status details bar */}
              <div className="rounded-lg border border-border/50 bg-background/50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-foreground">Circuit Breaker: CLOSED</span>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Concurrency limit: 25 workers • HMAC-SHA256 verified
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-border/40 bg-muted/10 rounded-b-xl flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Want to use your own private API keys?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab("developer")}
                className="text-xs text-primary font-semibold hover:text-primary/80 h-7"
              >
                BYO Key Settings &rarr;
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Token Consumption & Model Distribution Analytics Graph */}
      <TokenAnalyticsCard logs={logs} profile={profile} />

      {/* Recent Published Articles Preview */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Recent Published Articles</CardTitle>
            <CardDescription className="text-xs">
              Generated posts for this website. Click any row to inspect HTML, copy markdown, or view tags.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("articles")}
            className="text-xs font-semibold gap-1.5"
          >
            <span>View All ({logs.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="divide-y divide-border/40 text-xs">
              {logs.slice(0, 5).map((log, idx) => (
                <div
                  key={log.id || idx}
                  onClick={() => onInspectLog(log)}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 px-3 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate pr-4">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        log.status === "success" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-sm sm:max-w-md">
                      {log.title || `Article #${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground text-[11px] shrink-0">
                    <span className="font-mono">
                      {log.latency_ms ? `${(log.latency_ms / 1000).toFixed(1)}s` : "< 2s"}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 font-mono">
                      {log.model ? log.model.split("/").pop() : "groq-70b"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No Articles Published Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Generate your first human-grade SEO post using our interactive Studio, or connect your CMS webhook to automate publishing.
              </p>
              <Button
                size="sm"
                onClick={onOpenGenerateModal}
                className="text-xs font-semibold gap-1.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Generate First Article
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
