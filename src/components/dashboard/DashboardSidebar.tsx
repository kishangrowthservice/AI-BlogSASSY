"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  Sliders,
  Share2,
  Key,
  Cpu,
  CreditCard,
  BookOpen,
  List,
  Zap,
  Webhook,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { getPlanTier } from "@/lib/billing";

export type DashboardTab =
  | "brand"
  | "developer"
  | "api-playground"
  | "ai-engines"
  | "api-docs"
  | "webhooks"
  | "usage-graphs"
  | "request-logs"
  | "billing";

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  profile: SafeSiteProfile;
  articlesCount: number;
  onOpenUpgradeModal: () => void;
  className?: string;
}

interface NavSection {
  title: string;
  items: {
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[];
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

  const sections: NavSection[] = [
    {
      title: "Content & Brand",
      items: [
        {
          id: "brand",
          label: "Brand Voice & SEO",
          icon: Sparkles,
        },
      ],
    },
    {
      title: "Monitoring",
      items: [
        {
          id: "usage-graphs",
          label: "Usage & Rate Limits",
          icon: LayoutDashboard,
        },
        {
          id: "request-logs",
          label: "Request Logs",
          icon: List,
        },
      ],
    },
    {
      title: "API Platform",
      items: [
        {
          id: "developer",
          label: "API Keys & Hub",
          icon: Key,
        },
        {
          id: "api-playground",
          label: "API Playground",
          icon: Zap,
        },
        {
          id: "ai-engines",
          label: "AI Engines & BYOK",
          icon: Cpu,
        },
        {
          id: "api-docs",
          label: "API Documentation",
          icon: BookOpen,
        },
        {
          id: "webhooks",
          label: "Webhooks",
          icon: Webhook,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "billing",
          label: "Billing & Quota",
          icon: CreditCard,
        },
      ],
    },
  ];

  return (
    <aside
      className={`flex flex-col justify-between border-r border-border/60 bg-background/95 p-4 w-64 shrink-0 ${className}`}
    >
      {/* Top: Grouped Navigation */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 font-semibold">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-muted text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
        ))}
      </div>

      {/* Bottom: Quota & System Health Card */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        <div className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-2.5 shadow-xs">
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
            <span>Dual-LLM Active</span>
          </div>
          <span className="font-mono text-emerald-400">99.9% Uptime</span>
        </div>
      </div>
    </aside>
  );
}
