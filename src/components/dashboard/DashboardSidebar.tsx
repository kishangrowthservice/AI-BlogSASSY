"use client";

import React from "react";
import {
  BarChart3,
  FileText,
  Sliders,
  Share2,
  Key,
  Cpu,
  CreditCard,
  Zap,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { getPlanTier } from "@/lib/billing";

export type DashboardTab =
  | "overview"
  | "articles"
  | "brand"
  | "automations"
  | "developer"
  | "ai-engines"
  | "billing";

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  profile: SafeSiteProfile;
  articlesCount: number;
  onOpenUpgradeModal: () => void;
  className?: string;
}

export function DashboardSidebar({
  currentTab,
  onTabChange,
  profile,
  articlesCount,
  onOpenUpgradeModal,
  className = "",
}: DashboardSidebarProps) {
  const currentPlan = getPlanTier(profile.plan_tier);
  const quotaPercent = Math.min(
    100,
    Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100)
  );

  const navItems: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "articles",
      label: "Articles & Studio",
      icon: FileText,
      badge: articlesCount > 0 ? articlesCount : undefined,
    },
    {
      id: "brand",
      label: "Brand DNA",
      icon: Sliders,
    },
    {
      id: "automations",
      label: "CMS Automations",
      icon: Share2,
    },
    {
      id: "developer",
      label: "API & Developers",
      icon: Key,
    },
    {
      id: "ai-engines",
      label: "AI Providers",
      icon: Cpu,
    },
    {
      id: "billing",
      label: "Billing & Plans",
      icon: CreditCard,
    },
  ];

  return (
    <aside
      className={`flex flex-col justify-between border-r border-border/50 bg-card/30 backdrop-blur-xl p-4 w-64 shrink-0 ${className}`}
    >
      {/* Top: Nav Menu */}
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Workspaces
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={`text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-mono ${
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Quota & System Health Card */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        {/* Usage Card */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Monthly Quota
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {profile.used_quota || 0}/{profile.monthly_quota}
            </span>
          </div>

          <Progress value={quotaPercent} className="h-1.5 bg-muted/60" />

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {(profile.monthly_quota || 0) - (profile.used_quota || 0)} posts left
            </span>
            <button
              onClick={onOpenUpgradeModal}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Upgrade &rarr;
            </button>
          </div>
        </div>

        {/* Engine Status Pill */}
        <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-LLM Engines</span>
          </div>
          <span className="font-mono text-emerald-400">99.9% Up</span>
        </div>
      </div>
    </aside>
  );
}
