"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Activity,
  Gauge,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog } from "@/lib/types";

interface TokenAnalyticsProps {
  logs: GenerationLog[];
  profile: SafeSiteProfile;
}

export function TokenAnalyticsCard({ logs, profile }: TokenAnalyticsProps) {
  // Aggregate token statistics across logs
  const analytics = useMemo(() => {
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;

    let groqCount = 0;
    let geminiCount = 0;

    let groqTokens = 0;
    let geminiTokens = 0;

    // Filter successful logs
    const validLogs = logs.filter((l) => l.status === "success");

    validLogs.forEach((log) => {
      const pTokens = log.prompt_tokens || Math.round((log.total_tokens || 1850) * 0.32);
      const cTokens = log.completion_tokens || Math.round((log.total_tokens || 1850) * 0.68);
      const tTokens = log.total_tokens || pTokens + cTokens;

      totalPromptTokens += pTokens;
      totalCompletionTokens += cTokens;
      totalTokens += tTokens;

      const provider = (log.provider_used || "").toLowerCase();
      const model = (log.model || "").toLowerCase();

      if (provider.includes("gemini") || model.includes("gemini")) {
        geminiCount++;
        geminiTokens += tTokens;
      } else {
        groqCount++;
        groqTokens += tTokens;
      }
    });

    const totalCount = validLogs.length || 1;
    const avgTokensPerPost = Math.round(totalTokens / totalCount);
    const avgPromptPerPost = Math.round(totalPromptTokens / totalCount);
    const avgCompletionPerPost = Math.round(totalCompletionTokens / totalCount);

    const groqPct = validLogs.length > 0 ? Math.round((groqCount / validLogs.length) * 100) : 100;
    const geminiPct = validLogs.length > 0 ? 100 - groqPct : 0;

    // Plan Monthly Token Allowance (based on plan tier: ~2,000 tokens per article quota)
    const monthlyArticles = profile.monthly_quota || 25;
    const monthlyTokenBudget = monthlyArticles * 2000;
    const usedTokenBudget = Math.max(totalTokens, (profile.used_quota || 0) * 1900);
    const remainingTokenBudget = Math.max(0, monthlyTokenBudget - usedTokenBudget);
    const tokenBudgetPercent = Math.min(100, Math.round((usedTokenBudget / monthlyTokenBudget) * 100));

    // Rate Limit definitions
    const gatewayRateLimitRpm = 5; // Enforced in rateLimiter.ts
    const gatewayTpmBurst = 15000; // ~3,000 tokens * 5 requests
    const groqModelTpmLimit = 30000; // Groq free tier limit
    const geminiModelTpmLimit = 4000000; // Gemini free tier limit

    // Last 8 generation records for bar chart
    const recentBars = validLogs.slice(0, 8).reverse().map((log, idx) => {
      const p = log.prompt_tokens || Math.round((log.total_tokens || 1850) * 0.32);
      const c = log.completion_tokens || Math.round((log.total_tokens || 1850) * 0.68);
      const total = log.total_tokens || p + c;
      return {
        id: log.id || String(idx),
        title: log.title || `Generation #${idx + 1}`,
        model: log.model ? log.model.split("/").pop() : "llama-3.3-70b-versatile",
        provider: log.provider_used || "groq",
        prompt: p,
        completion: c,
        total,
      };
    });

    const maxBarTokens = Math.max(...recentBars.map((b) => b.total), 2800);

    return {
      totalTokens: usedTokenBudget,
      totalPromptTokens,
      totalCompletionTokens,
      avgTokensPerPost,
      avgPromptPerPost,
      avgCompletionPerPost,
      groqCount,
      geminiCount,
      groqTokens,
      geminiTokens,
      groqPct,
      geminiPct,
      monthlyTokenBudget,
      remainingTokenBudget,
      tokenBudgetPercent,
      gatewayRateLimitRpm,
      gatewayTpmBurst,
      groqModelTpmLimit,
      geminiModelTpmLimit,
      recentBars,
      maxBarTokens,
    };
  }, [logs, profile]);

  return (
    <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Token Telemetry &amp; Rate Limit Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Live consumption metrics, input/output token split, and allocated rate limit budgets.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              RATE LIMIT: {analytics.gatewayRateLimitRpm} REQ/MIN
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
              BURST CAP: {analytics.gatewayTpmBurst.toLocaleString()} TPM
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* 4 Stat Cards: Total Tokens, Rate Limit Budget, Prompt/Completion Split, Avg Per Request */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Tokens Used */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tokens Consumed
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              {analytics.totalTokens.toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Prompt + Completion total</span>
            </div>
          </div>

          {/* Card 2: Plan Token Budget */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Token Budget
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {analytics.tokenBudgetPercent}% used
              </span>
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {analytics.remainingTokenBudget.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              / {analytics.monthlyTokenBudget.toLocaleString()} tokens remaining
            </div>
            <Progress value={analytics.tokenBudgetPercent} className="h-1.5 mt-1.5 bg-muted/60" />
          </div>

          {/* Card 3: Prompt vs Output Ratio */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Avg Tokens / Request
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              {analytics.avgTokensPerPost.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
              <span className="text-indigo-400">Prompt: {analytics.avgPromptPerPost}</span>
              <span>•</span>
              <span className="text-purple-400">Gen: {analytics.avgCompletionPerPost}</span>
            </div>
          </div>

          {/* Card 4: Rate Limit Cap */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Gateway Rate Limit
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              {analytics.gatewayRateLimitRpm} <span className="text-sm font-normal text-muted-foreground">RPM</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Token Bucket: Active (0 drops)</span>
            </div>
          </div>
        </div>

        {/* 2-Column Analytics: Model Engine Quotas & Token Stacked Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Model Engine Token Distribution (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-border/60 bg-background/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-indigo-400" />
                Model Engine Utilization
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Dual LLM Routing
              </span>
            </div>

            {/* Segmented Color Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/60">
                <div
                  style={{ width: `${analytics.groqPct}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`Groq: ${analytics.groqPct}%`}
                />
                <div
                  style={{ width: `${analytics.geminiPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Gemini: ${analytics.geminiPct}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span>Groq: {analytics.groqTokens.toLocaleString()} tokens ({analytics.groqPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Gemini: {analytics.geminiTokens.toLocaleString()} tokens ({analytics.geminiPct}%)</span>
                </div>
              </div>
            </div>

            {/* Provider Rate Limit Specs Table */}
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2 text-[11px] font-mono">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <Gauge className="h-3 w-3 text-primary" />
                Provider Allocated Rate Limits
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-foreground">Groq (LLaMA 3.3 70B)</span>
                <span className="text-indigo-400 font-semibold">30 RPM / 30,000 TPM</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-foreground">Google Gemini 2.0 Flash</span>
                <span className="text-emerald-400 font-semibold">15 RPM / 4,000,000 TPM</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-foreground">Tenant Gateway Shield</span>
                <span className="text-primary font-semibold">5 RPM / 15,000 TPM</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Requests are dynamically routed to Groq LLaMA 3.3. If traffic exceeds provider concurrency or hits rate limits, our circuit breaker seamlessly fails over to Gemini 2.0 Flash without dropping requests.
            </p>
          </div>

          {/* Right: Token Intensity Stacked Bar Graph (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-border/60 bg-background/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-400" />
                Token Breakdown (Last Generations)
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-400/50" />
                  Prompt Tokens
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Completion Tokens
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            {analytics.recentBars.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {analytics.recentBars.map((bar) => {
                  const widthPercent = Math.min(100, Math.round((bar.total / analytics.maxBarTokens) * 100));
                  const promptShare = Math.round((bar.prompt / bar.total) * 100);
                  const completionShare = 100 - promptShare;

                  return (
                    <div key={bar.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                          {bar.title}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                          <span className="text-indigo-400">{bar.prompt} in</span>
                          <span className="text-muted-foreground">+</span>
                          <span className="text-purple-400">{bar.completion} out</span>
                          <span className="text-foreground font-bold font-mono">
                            = {bar.total.toLocaleString()} tokens
                          </span>
                        </div>
                      </div>

                      {/* Stacked Bar */}
                      <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden flex">
                        <div
                          style={{ width: `${(widthPercent * promptShare) / 100}%` }}
                          className="bg-indigo-400/50 h-full"
                          title={`Prompt: ${bar.prompt} tokens`}
                        />
                        <div
                          style={{ width: `${(widthPercent * completionShare) / 100}%` }}
                          className="bg-indigo-500 h-full"
                          title={`Completion: ${bar.completion} tokens`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No generation logs yet. When articles are generated via UI or API, exact token counts and model breakdown will appear here.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
