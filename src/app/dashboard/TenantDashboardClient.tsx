"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar, type DashboardTab } from "@/components/dashboard/DashboardSidebar";
import { DeveloperTab } from "@/components/dashboard/DeveloperTab";
import { ApiPlaygroundTab } from "@/components/dashboard/ApiPlaygroundTab";
import { ApiDocsTab } from "@/components/dashboard/ApiDocsTab";
import { AiEnginesTab } from "@/components/dashboard/AiEnginesTab";
import { UsageGraphsTab } from "@/components/dashboard/UsageGraphsTab";
import { RequestLogsTab } from "@/components/dashboard/RequestLogsTab";
import { WebhooksTab } from "@/components/dashboard/WebhooksTab";
import { BillingTab } from "@/components/dashboard/BillingTab";
import { KeyRevealModal } from "@/components/dashboard/KeyRevealModal";
import { generateTenantApiKeyAction, type UserSiteSummary } from "@/lib/serverActions";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog, GeneratedBlogPost, GenerationTelemetry } from "@/lib/types";

interface TenantDashboardProps {
  initialProfile: SafeSiteProfile;
  initialKeyPrefix: string | null;
  initialLogs: GenerationLog[];
  currentUserEmail?: string | null;
  initialUserSites?: UserSiteSummary[];
}

export function TenantDashboardClient({
  initialProfile,
  initialKeyPrefix,
  initialLogs,
  currentUserEmail,
  initialUserSites = [],
}: TenantDashboardProps) {
  const [profile, setProfile] = useState<SafeSiteProfile>(initialProfile);
  const [userSites, setUserSites] = useState<UserSiteSummary[]>(initialUserSites);
  const [keyPrefix, setKeyPrefix] = useState<string | null>(initialKeyPrefix);
  const [logs, setLogs] = useState<GenerationLog[]>(initialLogs);
  const [currentTab, setCurrentTab] = useState<DashboardTab>("usage-graphs");
  const [apiOrigin, setApiOrigin] = useState("https://api.growthservice.in");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // Sync API origin and check query params for tab or upgrade notice
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      setApiOrigin(process.env.NEXT_PUBLIC_API_URL);
    } else if (typeof window !== "undefined" && window.location.origin) {
      setApiOrigin(window.location.origin);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as DashboardTab;
      if (tabParam && ["developer", "api-playground", "ai-engines", "api-docs", "webhooks", "usage-graphs", "request-logs", "billing"].includes(tabParam)) {
        setCurrentTab(tabParam as DashboardTab);
      }
      if (params.get("upgrade") === "success") {
        setCurrentTab("billing");
      }
    }
  }, []);

  // Update profile handler for sub-tabs
  const handleProfileUpdated = (updated: Partial<SafeSiteProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Generate / Rotate API Key Action
  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      const res = await generateTenantApiKeyAction(profile.id);
      if (res.success && res.rawApiKey && res.keyPrefix) {
        setRevealedRawKey(res.rawApiKey);
        setKeyPrefix(res.keyPrefix);
        setShowKeyModal(true);
      }
    } catch (err) {
      console.error("Failed to generate key:", err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleTabChange = (tab: DashboardTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Application Header */}
      <DashboardHeader
        profile={profile}
        userSites={userSites}
        currentUserEmail={currentUserEmail}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main SaaS Workspace with Persistent Sidebar */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        <DashboardSidebar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          profile={profile}
          articlesCount={logs.length}
          onOpenUpgradeModal={() => setCurrentTab("billing")}
          className="hidden md:flex h-full overflow-y-auto"
        />

        {/* Mobile Navigation Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-card border-border/70">
            <DashboardSidebar
              currentTab={currentTab}
              onTabChange={handleTabChange}
              profile={profile}
              articlesCount={logs.length}
              onOpenUpgradeModal={() => {
                setCurrentTab("billing");
                setMobileMenuOpen(false);
              }}
              className="h-full border-r-0"
            />
          </SheetContent>
        </Sheet>

        {/* Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === "developer" && (
            <DeveloperTab
              profile={profile}
              keyPrefix={keyPrefix}
              apiOrigin={apiOrigin}
              onGenerateKey={handleGenerateKey}
              isGeneratingKey={isGeneratingKey}
            />
          )}

          {currentTab === "api-playground" && (
            <ApiPlaygroundTab
              profile={profile}
              apiOrigin={apiOrigin}
              keyPrefix={keyPrefix}
            />
          )}

          {currentTab === "ai-engines" && (
            <AiEnginesTab profile={profile} logs={logs} />
          )}

          {currentTab === "api-docs" && (
            <ApiDocsTab apiOrigin={apiOrigin} />
          )}

          {currentTab === "webhooks" && (
            <WebhooksTab profile={profile} />
          )}

          {currentTab === "usage-graphs" && (
            <UsageGraphsTab profile={profile} logs={logs} />
          )}

          {currentTab === "request-logs" && (
            <RequestLogsTab logs={logs} />
          )}

          {currentTab === "billing" && (
            <BillingTab profile={profile} />
          )}
        </main>
      </div>

      <KeyRevealModal
        rawKey={revealedRawKey}
        open={showKeyModal}
        onOpenChange={setShowKeyModal}
      />
    </div>
  );
}
