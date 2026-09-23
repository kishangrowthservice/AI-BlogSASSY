"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { GenerationLog } from "@/lib/types";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { ObservabilityStats } from "@/lib/adminActions";
import { onboardTenantAction, toggleTenantStatus } from "@/lib/serverActions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Check,
  Copy,
  Globe,
  Key,
  Layers,
  MoreVertical,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
  Code2,
  Cpu,
  RefreshCw,
  Terminal,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Flame,
} from "lucide-react";

interface Props {
  initialProfiles: SafeSiteProfile[];
  stats: ObservabilityStats;
}

export function AdminDashboardClient({ initialProfiles, stats }: Props) {
  const [profiles, setProfiles] = useState<SafeSiteProfile[]>(initialProfiles);
  const [activeTab, setActiveTab] = useState<string>("tenants");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Selected log for inspect sheet
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);

  // Modal states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [newlyOnboardedSite, setNewlyOnboardedSite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cron queue runner state
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [cronResult, setCronResult] = useState<{ processed?: number; successful?: number } | null>(null);

  // Form states
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [brandKnowledge, setBrandKnowledge] = useState("");
  const [tone, setTone] = useState("authoritative, actionable, high-conviction");
  const [targetAudience, setTargetAudience] = useState("business decision makers and professionals");
  const [monthlyQuota, setMonthlyQuota] = useState(100);
  const [byoGroqKey, setByoGroqKey] = useState("");
  const [byoGeminiKey, setByoGeminiKey] = useState("");
  const [internalLinksJson, setInternalLinksJson] = useState(`[
  {"url": "/services", "label": "our professional services", "category": "Core"},
  {"url": "/contact", "label": "contact our strategy team", "category": "Contact"}
]`);

  // Listen to tab changes via URL query param or popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["tenants", "logs", "circuits", "queue", "apikeys"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", val);
    window.history.pushState({}, "", url.toString());
  };

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.site_name.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [profiles, searchQuery, statusFilter]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    let parsedLinks = [];
    try {
      if (internalLinksJson.trim()) {
        parsedLinks = JSON.parse(internalLinksJson);
      }
    } catch {
      setErrorMsg("Internal links must be valid JSON array of {url, label, category}.");
      setIsSubmitting(false);
      return;
    }

    const res = await onboardTenantAction({
      site_name: siteName,
      domain,
      brand_knowledge: brandKnowledge,
      tone,
      target_audience: targetAudience,
      internal_links: parsedLinks,
      monthly_quota: Number(monthlyQuota),
      byo_groq_api_key: byoGroqKey.trim() || undefined,
      byo_gemini_api_key: byoGeminiKey.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.rawApiKey && res.profile) {
      setProfiles([res.profile, ...profiles]);
      setGeneratedKey(res.rawApiKey);
      setNewlyOnboardedSite(res.profile.site_name);
      setShowOnboardModal(false);
      // Reset form
      setSiteName("");
      setDomain("");
      setBrandKnowledge("");
      setByoGroqKey("");
      setByoGeminiKey("");
    } else {
      setErrorMsg(res.error || "Failed to onboard site.");
    }
  };

  const handleToggleActive = async (profile: SafeSiteProfile) => {
    const updatedStatus = !profile.is_active;
    const ok = await toggleTenantStatus(profile.id, updatedStatus);
    if (ok) {
      setProfiles(
        profiles.map((p) => (p.id === profile.id ? { ...p, is_active: updatedStatus } : p))
      );
    }
  };

  const handleRunQueueBatch = async () => {
    setIsProcessingQueue(true);
    try {
      const res = await fetch("/api/cron/process-queue", { method: "POST" });
      const data = await res.json();
      setCronResult(data);
    } catch (err) {
      console.error("Queue process error:", err);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* SaaS Executive KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card/70 border-border/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Tenant Workspaces</span>
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">{profiles.length}</span>
              <Badge variant="success" className="text-[10px] font-mono">
                {profiles.filter((p) => p.is_active).length} Active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Multi-tenant isolated DB</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Total Invocations</span>
              <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">{stats.totalGenerations}</span>
              <span className="text-xs text-muted-foreground font-mono">+100% SLA</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">API gateway traffic</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Generation Success</span>
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-emerald-400">
                {stats.successRatePercent}%
              </span>
              <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                Resilient
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">0 fatal cluster drops</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Provider Balancing</span>
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Badge variant="groq" className="text-[10px]">Groq: {stats.groqCount}</Badge>
              <Badge variant="gemini" className="text-[10px]">Gemini: {stats.geminiCount}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Automatic 429 failover</p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Burst Queue Jobs</span>
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.pendingQueueJobs || 0}
              </span>
              <Badge
                variant={(stats.pendingQueueJobs || 0) > 0 ? "warning" : "success"}
                className="text-[10px]"
              >
                {(stats.pendingQueueJobs || 0) > 0 ? "Smoothing" : "Clear"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Async 202 buffer</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed SaaS Console */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <TabsList className="bg-muted/40 p-1 border border-border/60">
            <TabsTrigger value="tenants" className="gap-2 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5" />
              <span>Tenants</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {profiles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 text-xs font-medium">
              <Activity className="h-3.5 w-3.5" />
              <span>Observability Logs</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {stats.recentLogs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>Async Queue</span>
            </TabsTrigger>
            <TabsTrigger value="circuits" className="gap-2 text-xs font-medium">
              <Cpu className="h-3.5 w-3.5" />
              <span>Circuit Breakers</span>
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="gap-2 text-xs font-medium">
              <Code2 className="h-3.5 w-3.5" />
              <span>API Gateway SDK</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === "tenants" && (
              <>
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search name, domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background/60"
                  />
                </div>
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md border border-border/60">
                  <Button
                    variant={statusFilter === "all" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "active" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => setStatusFilter("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === "inactive" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => setStatusFilter("inactive")}
                  >
                    Inactive
                  </Button>
                </div>
              </>
            )}

            <Button
              onClick={() => setShowOnboardModal(true)}
              size="sm"
              className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground shadow-sm whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Onboard Tenant
            </Button>
          </div>
        </div>

        {/* TAB 1: Tenants List Table */}
        <TabsContent value="tenants" className="m-0 space-y-4">
          <Card className="border-border/70 overflow-hidden shadow-sm bg-card/60 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="text-xs">Tenant Site</TableHead>
                  <TableHead className="text-xs">Monthly Quota Consumption</TableHead>
                  <TableHead className="text-xs">Engine Models</TableHead>
                  <TableHead className="text-xs">Key Provisioning</TableHead>
                  <TableHead className="text-xs">Cluster Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                      No tenant sites match the active filter. Click "+ Onboard Tenant" to register one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => {
                    const usagePercent = Math.min(
                      100,
                      Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 100)) * 100)
                    );
                    const isExceeded = usagePercent >= 100;

                    return (
                      <TableRow key={profile.id} className="group hover:bg-muted/30">
                        {/* Site Name & Domain */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg border border-border/80">
                              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                                {profile.site_name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                {profile.site_name}
                                <a
                                  href={`https://${profile.domain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-muted-foreground hover:text-foreground inline-flex transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {profile.domain}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Quota Progress */}
                        <TableCell className="min-w-[170px]">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-muted-foreground font-mono">
                              {profile.used_quota || 0} / {profile.monthly_quota} posts
                            </span>
                            <span
                              className={`font-semibold font-mono ${
                                isExceeded ? "text-destructive" : usagePercent >= 80 ? "text-amber-400" : "text-foreground"
                              }`}
                            >
                              {usagePercent}%
                            </span>
                          </div>
                          <Progress
                            value={usagePercent}
                            indicatorClassName={
                              isExceeded ? "bg-destructive" : usagePercent >= 80 ? "bg-amber-500" : "bg-primary"
                            }
                            className="h-1.5"
                          />
                        </TableCell>

                        {/* Primary & Fallback Models */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="groq" className="text-[9px] py-0 px-1.5">
                                Groq 120B
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">→</span>
                              <Badge variant="gemini" className="text-[9px] py-0 px-1.5">
                                Gemini Flash
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* BYO-Key Badge */}
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground py-0.5 px-2">
                            Platform Pool
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                profile.is_active ? "bg-emerald-500 animate-pulse" : "bg-destructive"
                              }`}
                            />
                            <span className="text-xs font-medium text-foreground">
                              {profile.is_active ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Action Menu */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 text-xs">
                              <DropdownMenuLabel>Tenant Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => copyToClipboard(profile.id)}
                                className="gap-2 cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy Tenant ID
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyToClipboard(profile.key_prefix || "No key generated")}
                                className="gap-2 cursor-pointer"
                              >
                                <Key className="h-3.5 w-3.5" />
                                Copy Key Prefix
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(profile)}
                                className={`gap-2 cursor-pointer ${
                                  profile.is_active ? "text-destructive" : "text-emerald-400"
                                }`}
                              >
                                <Power className="h-3.5 w-3.5" />
                                {profile.is_active ? "Suspend Access" : "Re-activate Tenant"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: Observability Logs Stream */}
        <TabsContent value="logs" className="m-0 space-y-4">
          <Card className="border-border/70 overflow-hidden shadow-sm bg-card/60 backdrop-blur-sm">
            <div className="p-3 bg-muted/20 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-foreground">
                  Live Request &amp; Generation Stream
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Showing last {stats.recentLogs.length} events
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Tenant Site ID</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs">Engine Model</TableHead>
                  <TableHead className="text-xs">Latency</TableHead>
                  <TableHead className="text-xs">Tokens (P/C)</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                      No logs captured yet. Trigger blog generations via Studio or API to stream logs.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentLogs.map((log, idx) => (
                    <TableRow
                      key={log.id || idx}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "Recent"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground font-semibold">
                        {log.site_id ? log.site_id.slice(0, 8) + "..." : "System"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.provider_used === "groq"
                              ? "groq"
                              : log.provider_used === "gemini"
                              ? "gemini"
                              : "destructive"
                          }
                          className="text-[9px] py-0 px-1.5 uppercase"
                        >
                          {log.provider_used}
                          {log.fallback_triggered ? " (FB)" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.model.replace("openai/", "")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold font-mono ${
                            log.latency_ms > 5000 ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {log.latency_ms}ms
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.prompt_tokens || 0} / {log.completion_tokens || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "success" : "destructive"}>
                          {log.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 3: Async Queue Monitor */}
        <TabsContent value="queue" className="m-0 space-y-4">
          <Card className="border-border/70 p-6 bg-card/60 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Asynchronous Burst Smoothing Queue
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Protects upstream LLM rate limits by converting burst traffic into 202 Accepted background jobs.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRunQueueBatch}
                  disabled={isProcessingQueue}
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs border-border/80"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isProcessingQueue ? "animate-spin text-primary" : ""}`} />
                  {isProcessingQueue ? "Processing..." : "Process Next Batch Now"}
                </Button>
              </div>
            </div>

            {cronResult && (
              <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Batch processed successfully: <strong>{cronResult.processed || 0} jobs processed</strong>, {cronResult.successful || 0} succeeded.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Pending in Queue</div>
                <div className="text-2xl font-extrabold text-foreground mt-1">
                  {stats.pendingQueueJobs || 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Awaiting cron execution</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Cron Polling Interval</div>
                <div className="text-2xl font-extrabold text-primary mt-1">*/1 min</div>
                <p className="text-[11px] text-muted-foreground mt-1">Triggered by Vercel Cron or webhook</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Retry Policy</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">3 Retries</div>
                <p className="text-[11px] text-muted-foreground mt-1">With exponential backoff</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: Circuit Breaker & Health */}
        <TabsContent value="circuits" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Groq Card */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Groq Circuit Breaker</h4>
                    <p className="text-xs text-muted-foreground">Primary Fast Inference Engine</p>
                  </div>
                </div>
                <Badge variant="success" className="gap-1 font-mono text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  CLOSED (HEALTHY)
                </Badge>
              </div>

              <div className="space-y-2 text-xs border-t border-border/60 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current State:</span>
                  <span className="font-semibold text-emerald-400 font-mono">Passing Traffic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failure Threshold:</span>
                  <span className="font-mono text-foreground">3 consecutive 429/5xx</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cool-off Duration:</span>
                  <span className="font-mono text-foreground">60 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fallback Target:</span>
                  <span className="font-mono text-cyan-400">Gemini 2.0 Flash</span>
                </div>
              </div>
            </Card>

            {/* Gemini Card */}
            <Card className="border-border/70 bg-card/60 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Gemini Fallback Cluster</h4>
                    <p className="text-xs text-muted-foreground">Resilient High-Throughput Fallback</p>
                  </div>
                </div>
                <Badge variant="gemini" className="gap-1 font-mono text-[10px]">
                  STANDBY READY
                </Badge>
              </div>

              <div className="space-y-2 text-xs border-t border-border/60 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current State:</span>
                  <span className="font-semibold text-cyan-400 font-mono">Active Standby</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activation Trigger:</span>
                  <span className="font-mono text-foreground">Groq 429 or Circuit Open</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Name:</span>
                  <span className="font-mono text-foreground">gemini-2.5-flash-lite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schema Enforcement:</span>
                  <span className="font-mono text-emerald-400">Strict JSON Output</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: Developer API Keys & SDK Docs */}
        <TabsContent value="apikeys" className="m-0 space-y-4">
          <Card className="border-border/70 p-6 bg-card/60 backdrop-blur-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Developer Gateway Integration</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Integrate with your Next.js, Node.js, or Python apps via the centralized HTTP API.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">cURL API Call</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    copyToClipboard(`curl -X POST http://localhost:3000/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_YOUR_KEY" \\
  -d '{"topic": "Local SEO Optimization Strategies"}'`)
                  }
                >
                  <Copy className="h-3 w-3" />
                  Copy cURL
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 border border-border/60 text-emerald-400 font-mono text-xs overflow-x-auto">
{`curl -X POST http://localhost:3000/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_YOUR_KEY" \\
  -d '{"topic": "Local SEO Optimization Strategies", "async": false}'`}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">TypeScript Universal SDK</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    copyToClipboard(`import { BlogClient } from "@/lib/client/blogClient";
const client = new BlogClient({ apiKey: "gs_live_YOUR_KEY" });
const post = await client.generateBlog({ topic: "Local SEO" });`)
                  }
                >
                  <Copy className="h-3 w-3" />
                  Copy TypeScript
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 border border-border/60 text-cyan-300 font-mono text-xs overflow-x-auto">
{`import { BlogClient } from "@/lib/client/blogClient";

const client = new BlogClient({ apiKey: process.env.BLOG_API_KEY! });
const post = await client.generateBlog({ topic: "Local SEO Jaipur Foot Traffic" });

console.log(post.title);
console.log(post.content);`}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: Onboard New Site */}
      <Dialog open={showOnboardModal} onOpenChange={setShowOnboardModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Onboard New Tenant Site</DialogTitle>
            <DialogDescription>
              Configure isolated brand voice, canonical links, and optional dedicated BYO-keys.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Site Name</label>
                <Input
                  required
                  placeholder="e.g. Acme Tech Blog"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Domain</label>
                <Input
                  required
                  placeholder="e.g. blog.acme.io"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Brand Knowledge &amp; Context</label>
              <Textarea
                required
                rows={2}
                placeholder="Key offerings, positioning, and unique value proposition..."
                value={brandKnowledge}
                onChange={(e) => setBrandKnowledge(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Editorial Tone</label>
                <Input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Monthly Quota (Posts)</label>
                <Input
                  type="number"
                  min={1}
                  value={monthlyQuota}
                  onChange={(e) => setMonthlyQuota(Number(e.target.value))}
                />
              </div>
            </div>

            {/* BYO-Key Section */}
            <div className="rounded-lg border border-border/70 p-3 bg-muted/20 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                Dedicated Tenant BYO-Keys (Optional)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="BYO Groq Key (gsk_...)"
                  value={byoGroqKey}
                  onChange={(e) => setByoGroqKey(e.target.value)}
                  className="text-xs font-mono"
                />
                <Input
                  placeholder="BYO Gemini Key"
                  value={byoGeminiKey}
                  onChange={(e) => setByoGeminiKey(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Internal Links (JSON Schema)</label>
              <Textarea
                rows={3}
                value={internalLinksJson}
                onChange={(e) => setInternalLinksJson(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOnboardModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Provisioning..." : "Onboard & Generate API Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Secure API Key Reveal */}
      <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">API Key Generated for {newlyOnboardedSite}</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Save this key immediately. For security, only the cryptographic SHA-256 hash is saved in Supabase. It cannot be recovered.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-slate-950 p-3 font-mono text-xs text-emerald-400">
              <span className="flex-1 break-all select-all">{generatedKey}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => generatedKey && copyToClipboard(generatedKey)}
                className="h-8 w-8 text-slate-300 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && <p className="text-center text-xs font-medium text-emerald-400">Copied to clipboard!</p>}
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => setGeneratedKey(null)}>
              I Have Stored This Key Safely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHEET: Detailed Log Inspection Drawer */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Generation Telemetry Inspection
                </SheetTitle>
                <SheetDescription className="text-xs font-mono">
                  ID: {selectedLog.id || "N/A"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <span className="text-muted-foreground block">Status</span>
                    <span className="font-bold text-foreground mt-1 block">
                      {selectedLog.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <span className="text-muted-foreground block">Provider</span>
                    <span className="font-bold text-foreground mt-1 block">
                      {selectedLog.provider_used.toUpperCase()}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <span className="text-muted-foreground block">Latency</span>
                    <span className="font-bold text-emerald-400 mt-1 block">
                      {selectedLog.latency_ms}ms
                    </span>
                  </div>
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <span className="text-muted-foreground block">Tokens Total</span>
                    <span className="font-bold text-foreground mt-1 block">
                      {selectedLog.total_tokens || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Model Used:</span>
                  <div className="font-mono bg-muted/40 p-2 rounded border border-border/60">
                    {selectedLog.model}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">Tenant Site ID:</span>
                  <div className="font-mono bg-muted/40 p-2 rounded border border-border/60">
                    {selectedLog.site_id || "None"}
                  </div>
                </div>

                {selectedLog.error_message && (
                  <div className="space-y-1">
                    <span className="text-destructive font-semibold">Error Message:</span>
                    <div className="font-mono bg-destructive/10 text-destructive p-2.5 rounded border border-destructive/30">
                      {selectedLog.error_message}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
