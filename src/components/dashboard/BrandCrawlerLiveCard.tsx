"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  Bot,
  Radar,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCrawlStatusAction, triggerRecrawlAction } from "@/lib/serverActions";
import type { SafeSiteProfile } from "@/lib/sanitize";

interface BrandCrawlerLiveCardProps {
  profile: SafeSiteProfile;
  onProfileUpdated: (updated: Partial<SafeSiteProfile>) => void;
  onNavigateTab: (tab: "brand" | "articles" | "automations" | "developer" | "billing") => void;
}

export function BrandCrawlerLiveCard({
  profile,
  onProfileUpdated,
  onNavigateTab,
}: BrandCrawlerLiveCardProps) {
  const [crawlStatus, setCrawlStatus] = useState(profile.crawl_status || "completed");
  const [progress, setProgress] = useState(profile.crawl_progress ?? 100);
  const [pageCount, setPageCount] = useState(profile.crawl_page_count ?? 0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [tickerMessage, setTickerMessage] = useState("Initializing website scan...");

  // Auto-polling when crawl is in progress
  useEffect(() => {
    if (crawlStatus !== "in_progress") return;

    const interval = setInterval(async () => {
      try {
        const res = await getCrawlStatusAction(profile.id);
        if (res.success && res.crawl_status) {
          setCrawlStatus(res.crawl_status);
          if (res.crawl_progress !== undefined) setProgress(res.crawl_progress);
          if (res.crawl_page_count !== undefined) setPageCount(res.crawl_page_count);

          if (res.crawl_progress && res.crawl_progress < 30) {
            setTickerMessage("Inspecting sitemap.xml & navigation links...");
          } else if (res.crawl_progress && res.crawl_progress < 80) {
            setTickerMessage(`Deep crawling high-value site pages (${res.crawl_page_count || 8} pages)...`);
          } else if (res.crawl_progress && res.crawl_progress < 95) {
            setTickerMessage("Synthesizing Brand Voice & Canonical Backlink Map with AI...");
          } else {
            setTickerMessage("Finalizing brand knowledge base...");
          }

          if (res.crawl_status === "completed") {
            clearInterval(interval);
            onProfileUpdated({
              crawl_status: "completed",
              crawl_progress: 100,
              crawl_page_count: res.crawl_page_count,
              site_name: res.site_name || profile.site_name,
              tone: res.tone || profile.tone,
              target_audience: res.target_audience || profile.target_audience,
            });
          }
        }
      } catch (err) {
        console.warn("[BrandCrawlerLiveCard] Polling error:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [crawlStatus, profile.id, profile.site_name, profile.tone, profile.target_audience, onProfileUpdated]);

  const handleRecrawl = async () => {
    setIsRetrying(true);
    setCrawlStatus("in_progress");
    setProgress(15);
    setTickerMessage("Connecting to domain & discovering sitemaps...");

    try {
      const res = await triggerRecrawlAction(profile.id);
      if (res.success) {
        onProfileUpdated({ crawl_status: "in_progress", crawl_progress: 15 });
      } else {
        setCrawlStatus("failed");
      }
    } catch {
      setCrawlStatus("failed");
    } finally {
      setIsRetrying(false);
    }
  };

  const backlinkCount = profile.internal_links?.length || 0;

  // 1. IN PROGRESS STATE
  if (crawlStatus === "in_progress") {
    return (
      <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-background backdrop-blur-xl shadow-lg relative overflow-hidden animate-pulse-glow">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Radar className="h-32 w-32 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <CardContent className="p-5 space-y-3.5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Deep Autonomous Website Scan</h3>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] py-0 px-2 animate-pulse">
                    Live Crawling
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Scanning <span className="text-foreground font-semibold">{profile.domain}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-indigo-400">{progress}%</div>
              <div className="text-[10px] text-muted-foreground">AI Pipeline Active</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Progress value={progress} className="h-2 bg-muted/40" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                {tickerMessage}
              </span>
              <span>15+ pages deep discovery</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. FAILED STATE
  if (crawlStatus === "failed") {
    return (
      <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-xl">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <div className="text-xs font-semibold text-foreground">Website Crawl Incomplete</div>
              <div className="text-[11px] text-muted-foreground">
                Could not fetch full sitemap for {profile.domain}. You can re-trigger anytime.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRecrawl}
            disabled={isRetrying}
            className="text-xs gap-1.5 shrink-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
            Re-scan Site
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 3. COMPLETED STATE (Rich Brand Intelligence summary)
  return (
    <Card className="border-border/70 bg-card/40 backdrop-blur-xl hover:border-border transition-all">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  Autonomous Brand Intelligence &bull; {profile.site_name}
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Live Sync
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-indigo-400" />
                  {profile.domain}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3 text-amber-400" />
                  <strong>{backlinkCount}</strong> Canonical Backlinks Active
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Bot className="h-3 w-3 text-purple-400" />
                  Tone: <span className="text-foreground capitalize">{profile.tone?.split(",")[0] || "Authoritative"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 lg:pt-0 self-end lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecrawl}
              disabled={isRetrying}
              className="text-xs gap-1.5 h-8"
              title="Re-crawl and update brand intelligence from live website"
            >
              <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
              Re-scan
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab("brand")}
              className="text-xs gap-1.5 h-8"
            >
              View Brand Intelligence
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
