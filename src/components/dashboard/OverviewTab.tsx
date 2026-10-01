"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Sliders,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Zap,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog } from "@/lib/types";
import { getPlanTier } from "@/lib/billing";
import { BrandCrawlerLiveCard } from "./BrandCrawlerLiveCard";

interface OverviewTabProps {
  profile: SafeSiteProfile;
  logs: GenerationLog[];
  keyPrefix: string | null;
  onOpenGenerateModal: () => void;
  onNavigateTab: (tab: "articles" | "brand" | "automations" | "developer" | "billing") => void;
  onInspectLog: (log: GenerationLog) => void;
  onProfileUpdated?: (updated: Partial<SafeSiteProfile>) => void;
}

export function OverviewTab({
  profile,
  logs,
  keyPrefix,
  onOpenGenerateModal,
  onNavigateTab,
  onInspectLog,
  onProfileUpdated = () => {},
}: OverviewTabProps) {
  const currentPlan = getPlanTier(profile.plan_tier);

  // Compute key numbers
  const successfulLogs = logs.filter((l) => l.status === "success");
  const totalArticles = profile.used_quota || successfulLogs.length;
  const remainingQuota = Math.max(0, (profile.monthly_quota || 0) - (profile.used_quota || 0));
  const quotaPercent = Math.min(100, Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100));
  const backlinkCount = profile.internal_links?.length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* 1. Clean Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {profile.site_name}
            </h1>
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono">
              {profile.domain}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Autonomous AI content engine &bull; Voice, search intent, and internal backlinks configured.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("articles")}
            className="text-xs font-medium gap-1.5 h-9"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Article Studio ({logs.length})
          </Button>

          <Button
            size="sm"
            onClick={onOpenGenerateModal}
            className="text-xs font-semibold gap-1.5 h-9 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Write New Article
          </Button>
        </div>
      </div>

      {/* 2. Brand Intelligence Live Scanner Card */}
      <BrandCrawlerLiveCard
        profile={profile}
        onProfileUpdated={onProfileUpdated}
        onNavigateTab={onNavigateTab}
      />

      {/* 3. Three Focused, Meaningful Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Articles Published */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Articles Published
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground font-mono">{totalArticles}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{successfulLogs.length} live in database</span>
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Monthly Quota */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Quota
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono capitalize border-primary/30 text-primary">
              {currentPlan.name} Plan
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-foreground font-mono">
                {remainingQuota}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                / {profile.monthly_quota} left
              </span>
            </div>
            <Progress value={quotaPercent} className="h-1.5 mt-2.5 bg-muted/50" />
          </CardContent>
        </Card>

        {/* Metric 3: Active Internal Backlinks */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Internal Backlinks
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground font-mono">{backlinkCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Automatically distributed in posts</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Two-Column Workspace: Recent Articles + Brand Quick Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Articles (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Recent Generated Articles
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any article to inspect the HTML, copy markdown, or view SEO metadata.
                </CardDescription>
              </div>

              {logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab("articles")}
                  className="text-xs font-semibold gap-1 text-primary hover:text-primary/80 h-8"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-1">
              {logs && logs.length > 0 ? (
                <div className="divide-y divide-border/30 text-xs">
                  {logs.slice(0, 6).map((log, idx) => (
                    <div
                      key={log.id || idx}
                      onClick={() => onInspectLog(log)}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                          <FileText className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {log.title || `Article #${idx + 1}`}
                          </div>
                          {log.meta_description && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-sm sm:max-w-md">
                              {log.meta_description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground text-[11px] sm:self-center self-start">
                        <Badge variant="outline" className="text-[10px] font-mono border-border/60">
                          {log.model ? log.model.split("/").pop() : "groq-70b"}
                        </Badge>
                        <span className="font-mono text-[11px]">
                          {log.created_at ? new Date(log.created_at).toLocaleDateString() : "Recent"}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">No Articles Created Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Your autonomous engine is ready. Enter any topic or keyword to generate a search-optimized, human-grade article in seconds.
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

        {/* Right Column: Quick Studio & Brand DNA Snapshot (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Create Card */}
          <Card className="border-border/60 bg-gradient-to-br from-card/80 to-indigo-950/20 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Quick Blog Generator
              </CardTitle>
              <CardDescription className="text-xs">
                Launch generation with your brand voice preset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onOpenGenerateModal}
                className="w-full text-xs font-semibold gap-2 bg-primary text-primary-foreground h-10 hover:bg-primary/90"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Open Article Studio
              </Button>
            </CardContent>
          </Card>

          {/* Brand Voice Snapshot */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Brand Identity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab("brand")}
                  className="text-xs text-primary font-semibold h-7 px-2"
                >
                  Edit &rarr;
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tone of Voice
                </div>
                <div className="text-foreground capitalize font-medium">
                  {profile.tone || "Direct, results-driven, professional"}
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Audience
                </div>
                <div className="text-foreground text-[11px] line-clamp-2">
                  {profile.target_audience || "Industry professionals and decision makers"}
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between">
                <span className="text-muted-foreground">Internal Backlinks</span>
                <span className="font-mono font-bold text-foreground">{backlinkCount} links active</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Providers Status */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-2.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  Dual-LLM Engine Status
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  99.9% Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Primary: Groq Llama 3.3 70B</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Fallback: Gemini 3.8 Flash</span>
                <span className="text-indigo-400 font-medium">Standby</span>
              </div>
              <div className="pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab("developer")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground h-7"
                >
                  Configure Private Keys &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
