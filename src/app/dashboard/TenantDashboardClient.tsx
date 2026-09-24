"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  generateTenantApiKeyAction,
  updateTenantByoKeys,
  updateTenantBrandAction,
  updateTenantWebhookAction,
  generateDashboardBlogAction,
  type UserSiteSummary,
} from "@/lib/serverActions";
import { PLAN_TIERS, getPlanTier } from "@/lib/billing";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog, InternalLinkItem } from "@/lib/types";
import {
  Key,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Code2,
  Globe,
  Sliders,
  Database,
  BarChart3,
  CheckCircle2,
  Lock,
  Clock,
  AlertTriangle,
  Loader2,
  FileText,
  Share2,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronDown,
  Plus,
  Trash2,
  ExternalLink,
  CreditCard,
  Zap,
} from "lucide-react";

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
  const [apiOrigin, setApiOrigin] = useState("https://api.growthservice.in");

  // Upgrade Success Notification
  const [upgradeBanner, setUpgradeBanner] = useState<string | null>(null);

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      setApiOrigin(process.env.NEXT_PUBLIC_API_URL);
    } else if (typeof window !== "undefined" && window.location.origin) {
      setApiOrigin(window.location.origin);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgrade") === "success") {
        const plan = params.get("plan") || "pro";
        setUpgradeBanner(`Your subscription has been successfully upgraded to the ${plan.toUpperCase()} tier! New article quotas are active.`);
        setTimeout(() => setUpgradeBanner(null), 8000);
      }
    }
  }, []);

  // Key Generation State
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Upgrade Plan Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  // BYO Key State
  const [byoGroq, setByoGroq] = useState("");
  const [byoGemini, setByoGemini] = useState("");
  const [isSavingByo, setIsSavingByo] = useState(false);
  const [byoSuccess, setByoSuccess] = useState(false);
  const [byoError, setByoError] = useState<string | null>(null);

  // Brand DNA State
  const [brandKnowledge, setBrandKnowledge] = useState(initialProfile.brand_knowledge || "");
  const [tone, setTone] = useState(initialProfile.tone || "");
  const [targetAudience, setTargetAudience] = useState(initialProfile.target_audience || "");
  const [internalLinks, setInternalLinks] = useState<InternalLinkItem[]>(initialProfile.internal_links || []);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState("General");
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSuccess, setBrandSuccess] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Outbound CMS Webhook State
  const [webhookUrl, setWebhookUrl] = useState(initialProfile.webhook_url || "");
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // Generate Article Studio State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genKeywords, setGenKeywords] = useState("");
  const [genTargetWordCount, setGenTargetWordCount] = useState(1200);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generatedArticleResult, setGeneratedArticleResult] = useState<{
    title: string;
    metaDescription: string;
    content: string;
    suggestedTags: string[];
    telemetry?: any;
  } | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedGeneratedContent, setCopiedGeneratedContent] = useState(false);
  const [copiedGeneratedMeta, setCopiedGeneratedMeta] = useState(false);

  // Article History Modal State
  const [inspectedLog, setInspectedLog] = useState<GenerationLog | null>(null);
  const [copiedLogTitle, setCopiedLogTitle] = useState(false);
  const [copiedLogContent, setCopiedLogContent] = useState(false);
  const [copiedLogMeta, setCopiedLogMeta] = useState(false);
  const [logViewTab, setLogViewTab] = useState<"preview" | "html" | "telemetry">("preview");

  const handleGenerateArticle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!genTopic.trim()) return;
    setIsGeneratingArticle(true);
    setGenError(null);
    setGeneratedArticleResult(null);

    try {
      const keywordsArr = genKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await generateDashboardBlogAction(profile.id, {
        topic: genTopic.trim(),
        keywords: keywordsArr.length > 0 ? keywordsArr : undefined,
        wordCount: genTargetWordCount,
      });

      if (!res.success || !res.post) {
        setGenError(res.error || "Failed to generate blog post.");
        return;
      }

      setGeneratedArticleResult({
        title: res.post.title,
        metaDescription: res.post.metaDescription,
        content: res.post.content,
        suggestedTags: res.post.suggestedTags,
        telemetry: res.telemetry,
      });

      // Increment profile used quota
      setProfile((prev) => ({
        ...prev,
        used_quota: (prev.used_quota || 0) + 1,
      }));

      // Prepend to logs
      const newLog: GenerationLog = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        site_id: profile.id,
        model: res.telemetry?.model || "groq/llama-3.3-70b-versatile",
        provider_used: res.telemetry?.provider_used || "groq",
        latency_ms: res.telemetry?.latency_ms || 0,
        total_tokens: res.telemetry?.total_tokens || 0,
        fallback_triggered: Boolean(res.telemetry?.fallback_triggered),
        status: "success",
        title: res.post.title,
        content: res.post.content,
        meta_description: res.post.metaDescription,
        suggested_tags: res.post.suggestedTags,
        created_at: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setGenError(err?.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // Code Snippets Copy State
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);

  // Action: Generate or Regenerate API Key On-Demand
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

  const handleCopyKey = () => {
    if (revealedRawKey) {
      navigator.clipboard.writeText(revealedRawKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleSaveByoKeys = async () => {
    setIsSavingByo(true);
    setByoSuccess(false);
    setByoError(null);
    try {
      const ok = await updateTenantByoKeys(profile.id, byoGroq, byoGemini);
      if (ok) {
        setByoSuccess(true);
        setTimeout(() => setByoSuccess(false), 3000);
      } else {
        setByoError("Failed to save BYO keys. Access denied or invalid key configuration.");
        setTimeout(() => setByoError(null), 4000);
      }
    } catch (err: any) {
      setByoError(err?.message || "Failed to save BYO keys.");
      setTimeout(() => setByoError(null), 4000);
    } finally {
      setIsSavingByo(false);
    }
  };

  // Add Internal Link Item
  const handleAddInternalLink = () => {
    if (!newLinkUrl.trim() || !newLinkLabel.trim()) return;
    const cleanUrl = newLinkUrl.trim();
    const cleanLabel = newLinkLabel.trim();
    const cleanCategory = newLinkCategory.trim() || "General";

    setInternalLinks((prev) => [...prev, { url: cleanUrl, label: cleanLabel, category: cleanCategory }]);
    setNewLinkUrl("");
    setNewLinkLabel("");
  };

  const handleDeleteInternalLink = (index: number) => {
    setInternalLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveBrand = async () => {
    setIsSavingBrand(true);
    setBrandSuccess(false);
    setBrandError(null);
    try {
      const res = await updateTenantBrandAction(profile.id, {
        brand_knowledge: brandKnowledge,
        tone: tone,
        target_audience: targetAudience,
        internal_links: internalLinks,
      });
      if (res.success) {
        setProfile((prev) => ({ ...prev, internal_links: internalLinks }));
        setBrandSuccess(true);
        setTimeout(() => setBrandSuccess(false), 3000);
      } else {
        setBrandError(res.error || "Failed to update brand profile.");
        setTimeout(() => setBrandError(null), 4000);
      }
    } catch (err: any) {
      setBrandError(err?.message || "Failed to update brand profile.");
      setTimeout(() => setBrandError(null), 4000);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    setWebhookSuccess(false);
    setWebhookError(null);
    try {
      const res = await updateTenantWebhookAction(profile.id, webhookUrl);
      if (res.success) {
        setProfile((prev) => ({ ...prev, webhook_url: webhookUrl.trim() || null }));
        setWebhookSuccess(true);
        setTimeout(() => setWebhookSuccess(false), 3000);
      } else {
        setWebhookError(res.error || "Failed to update webhook URL.");
        setTimeout(() => setWebhookError(null), 4000);
      }
    } catch (err: any) {
      setWebhookError(err?.message || "Failed to update webhook URL.");
      setTimeout(() => setWebhookError(null), 4000);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: profile.id, planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate plan upgrade.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Error starting checkout session.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const activeKeySample = keyPrefix || "gs_live_YOUR_SECRET_KEY";

  const curlExample = `curl -X POST ${apiOrigin}/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeKeySample}" \\
  -d '{
    "topic": "Proven Strategies to Grow Website Authority in 2026",
    "keywords": ["SEO", "Organic Traffic"],
    "wordCount": 1000
  }'`;

  const sdkExample = `import { BlogClient } from "@growthservice/blog-client";

const client = new BlogClient({
  apiKey: "${activeKeySample}",
  endpoint: "${apiOrigin}"
});

// Publishes SEO blog directly
const post = await client.generateBlog({
  topic: "Proven Strategies to Grow Website Authority in 2026",
  wordCount: 1200
});

console.log("Ready:", post.title);`;

  const quotaPercent = Math.min(100, Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100));
  const currentPlan = getPlanTier(profile.plan_tier);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-bold tracking-tight text-base hidden sm:inline">AI Blog SaaS</span>
            </Link>

            <Separator orientation="vertical" className="h-4 bg-border/60 mx-1 hidden sm:block" />

            {/* MULTI-SITE SWITCHER DROPDOWN */}
            {userSites && userSites.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors text-left bg-background/50">
                    <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <div className="truncate max-w-[130px] sm:max-w-[200px]">
                      <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                        {profile.site_name}
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">{profile.domain}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-xl border-border/80">
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Your Websites ({userSites.length})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userSites.map((s) => (
                    <DropdownMenuItem key={s.id} asChild className="cursor-pointer">
                      <Link
                        href={`/dashboard?siteId=${s.id}`}
                        className={`flex items-center justify-between text-xs py-2 ${
                          s.id === profile.id ? "font-bold text-primary bg-primary/10" : "text-foreground"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate">{s.site_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">{s.domain}</div>
                        </div>
                        {s.id === profile.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/onboard?new=true"
                      className="flex items-center gap-2 text-xs text-indigo-400 py-1.5 font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add New Website
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{profile.site_name}</span>
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                  {profile.domain}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentUserEmail && (
              <span className="hidden md:inline-flex text-xs text-muted-foreground font-medium border border-border/40 px-2.5 py-1 rounded-full bg-muted/20">
                {currentUserEmail}
              </span>
            )}

            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {currentPlan.name}
            </Badge>

            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href={revealedRawKey ? `/preview?apiKey=${encodeURIComponent(revealedRawKey)}` : "/preview"}>
                <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                Live Studio
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/auth/signout">
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Success Upgrade Banner */}
        {upgradeBanner && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-300 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{upgradeBanner}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setUpgradeBanner(null)} className="h-7 text-xs text-emerald-300">
              Dismiss
            </Button>
          </div>
        )}

        {/* Header Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Client Content Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage website keys, brand DNA, SEO internal links, and automated publishing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => {
                setShowGenerateModal(true);
                setGenError(null);
                setGeneratedArticleResult(null);
              }}
              className="text-xs gap-1.5 font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Generate Article
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs gap-1.5 border-primary/40 hover:border-primary text-primary"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Upgrade Plan
            </Button>

            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              Site ID: {profile.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Top Grid: Website Key Management & Quota Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WEBSITE CONNECTION KEY CARD */}
          <Card className="lg:col-span-2 border-border/80 bg-card/60 backdrop-blur-xl relative shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Key className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Website Connection Key</CardTitle>
                    <CardDescription className="text-xs">
                      Connect your WordPress, Shopify, Webflow, or custom site to automatically receive published articles.
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={keyPrefix ? "outline" : "secondary"}
                  className={`text-[11px] font-medium ${
                    keyPrefix ? "text-emerald-400 border-emerald-500/30" : "text-muted-foreground"
                  }`}
                >
                  {keyPrefix ? "Key Ready" : "No Key Generated"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {keyPrefix ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 flex items-center justify-between font-mono text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{keyPrefix}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      SECURED &amp; PROTECTED
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your key is securely hashed. To rotate or generate a new secret credential, click regenerate below (replaces previous key).
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-5 text-center space-y-2">
                  <Key className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                  <h4 className="text-sm font-semibold text-foreground">No Connection Key Generated Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    To maintain strict privacy, your secret key is created only when you request it. Click below to generate your private connection token.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Enterprise grade security • 100% private</span>
              </div>

              <Button
                size="sm"
                onClick={handleGenerateKey}
                disabled={isGeneratingKey}
                className="text-xs font-semibold gap-1.5"
              >
                {isGeneratingKey ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating Key...
                  </>
                ) : keyPrefix ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate Key
                  </>
                ) : (
                  <>
                    <Key className="h-3.5 w-3.5" />
                    Generate Connection Key
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* QUOTA & USAGE CARD */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Monthly Articles</CardTitle>
                    <CardDescription className="text-xs">
                      Resets automatically every 30 days
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/40">
                  {currentPlan.name}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-foreground">
                  {profile.used_quota || 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {profile.monthly_quota} articles published
                </span>
              </div>

              <Progress value={quotaPercent} className="h-2 bg-muted/60" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{quotaPercent}% Used This Cycle</span>
                <span>{(profile.monthly_quota || 0) - (profile.used_quota || 0)} Remaining</span>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Need higher monthly volume?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-primary font-semibold hover:text-primary/80 h-7 px-2"
              >
                Upgrade Plan &rarr;
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Website Publishing & Quick Integration */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-indigo-400" />
                <CardTitle className="text-base font-bold">Publish to Your Website &amp; CMS</CardTitle>
              </div>
              <Badge variant="outline" className="text-[11px]">
                Direct Webhook &amp; API Ready
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Push published articles directly into your content management system or custom codebase.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 space-y-4">
            {/* Outbound Webhook Section */}
            <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    Automated CMS Outbound Webhook (Optional)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Whenever an article completes generation, we can instantly POST the full HTML payload to your endpoint.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://yourwebsite.com/api/webhooks/incoming-article"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-background/80 text-xs font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleSaveWebhook}
                  disabled={isSavingWebhook}
                  className="text-xs font-semibold shrink-0"
                >
                  {isSavingWebhook ? "Saving..." : "Save Webhook"}
                </Button>
              </div>

              {webhookSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Webhook URL updated successfully.
                </div>
              )}
              {webhookError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {webhookError}
                </div>
              )}
            </div>

            <Tabs defaultValue="guide" className="w-full">
              <TabsList className="bg-muted/40 p-1 mb-3">
                <TabsTrigger value="guide" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Quick Setup Guide
                </TabsTrigger>
                <TabsTrigger value="curl" className="text-xs font-mono gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  cURL Webhook
                </TabsTrigger>
                <TabsTrigger value="sdk" className="text-xs font-mono gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  Node.js / SDK
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guide" className="p-4 bg-muted/20 rounded-lg border border-border/40 space-y-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground text-sm">3 Easy Ways to Connect Your Blog:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-border/60 rounded-md p-3 bg-card/40">
                    <span className="font-bold text-foreground">1. WordPress Plugin</span>
                    <p className="mt-1 text-[11px]">Paste your Connection Key in your WordPress plugin settings for 100% automated post drafts.</p>
                  </div>
                  <div className="border border-border/60 rounded-md p-3 bg-card/40">
                    <span className="font-bold text-foreground">2. Shopify &amp; Webflow</span>
                    <p className="mt-1 text-[11px]">Connect via Zapier or Make using our standardized webhook endpoint to publish to any CMS.</p>
                  </div>
                  <div className="border border-border/60 rounded-md p-3 bg-card/40">
                    <span className="font-bold text-foreground">3. Custom Next.js / React</span>
                    <p className="mt-1 text-[11px]">Use our lightweight JavaScript SDK to query and render high-ranking SEO content directly.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="curl" className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-4 top-4 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(curlExample);
                    setCopiedCurl(true);
                    setTimeout(() => setCopiedCurl(false), 2000);
                  }}
                >
                  {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCurl ? "Copied" : "Copy"}
                </Button>
                <pre className="font-mono text-xs text-sky-300 bg-black/80 p-4 rounded-lg overflow-x-auto leading-relaxed border border-border/40">
                  {curlExample}
                </pre>
              </TabsContent>

              <TabsContent value="sdk" className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-4 top-4 h-7 text-xs bg-background/80 backdrop-blur gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(sdkExample);
                    setCopiedSdk(true);
                    setTimeout(() => setCopiedSdk(false), 2000);
                  }}
                >
                  {copiedSdk ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedSdk ? "Copied" : "Copy"}
                </Button>
                <pre className="font-mono text-xs text-emerald-300 bg-black/80 p-4 rounded-lg overflow-x-auto leading-relaxed border border-border/40">
                  {sdkExample}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Configuration: Brand Voice & Custom Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BRAND DNA & INTERNAL LINKS CARD */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Sliders className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Brand Voice &amp; SEO Internal Links</CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune vocabulary and manage canonical internal links injected into articles.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Business Overview &amp; Solutions</label>
                <Textarea
                  rows={2}
                  value={brandKnowledge}
                  onChange={(e) => setBrandKnowledge(e.target.value)}
                  className="bg-background/50 border-border/80 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tone of Voice</label>
                  <Input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-background/50 border-border/80 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Target Audience</label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-background/50 border-border/80 text-xs"
                  />
                </div>
              </div>

              {/* INTERACTIVE SEO INTERNAL LINKS MANAGER */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    Canonical Internal Backlinks ({internalLinks.length})
                  </label>
                  <span className="text-[10px] text-muted-foreground">Injected automatically into relevant 2-3 sections</span>
                </div>

                {/* Existing links list */}
                {internalLinks && internalLinks.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {internalLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-md border border-border/60 bg-background/50 text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-foreground">{link.label}</span>
                          <span className="text-muted-foreground font-mono text-[10px] ml-2 truncate">
                            {link.url}
                          </span>
                          {link.category && (
                            <Badge variant="outline" className="text-[9px] ml-2 py-0">
                              {link.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInternalLink(idx)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-md">
                    No internal links configured yet. Add your product, service, or pricing URLs below.
                  </div>
                )}

                {/* Add new link row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <Input
                    placeholder="Anchor Text (e.g. Dental Implants)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                  <Input
                    placeholder="URL (e.g. /services/implants)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="Category"
                      value={newLinkCategory}
                      onChange={(e) => setNewLinkCategory(e.target.value)}
                      className="bg-background/80 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddInternalLink}
                      className="h-9 px-2.5 text-xs shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {brandSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Brand settings and internal links updated successfully.
                </div>
              )}

              {brandError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {brandError}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveBrand}
                disabled={isSavingBrand}
                className="text-xs font-semibold"
              >
                {isSavingBrand ? "Saving..." : "Save Brand Settings"}
              </Button>
            </CardFooter>
          </Card>

          {/* CUSTOM AI ACCOUNTS (BYO KEY) */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Database className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Custom AI Accounts (BYO Keys)</CardTitle>
                  <CardDescription className="text-xs">
                    Connect your own Groq or Gemini AI keys for volume beyond included monthly limits.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Groq API Key (Optional)</label>
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={byoGroq}
                  onChange={(e) => setByoGroq(e.target.value)}
                  className="bg-background/50 border-border/80 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Google Gemini Key (Optional)</label>
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={byoGemini}
                  onChange={(e) => setByoGemini(e.target.value)}
                  className="bg-background/50 border-border/80 text-xs font-mono"
                />
              </div>

              {byoSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Custom account keys saved successfully.
                </div>
              )}

              {byoError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {byoError}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveByoKeys}
                disabled={isSavingByo}
                className="text-xs font-semibold"
              >
                {isSavingByo ? "Saving..." : "Save Custom Keys"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Published Articles */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Published Articles</CardTitle>
              <CardDescription className="text-xs">
                History of all articles generated and delivered for this website. Click any row to view full content, copy HTML, or inspect telemetry.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowGenerateModal(true);
                setGenError(null);
                setGeneratedArticleResult(null);
              }}
              className="text-xs gap-1.5 border-purple-500/40 text-purple-300 hover:text-purple-200 hover:border-purple-500"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              New Article
            </Button>
          </CardHeader>

          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="divide-y divide-border/40 text-xs">
                {logs.slice(0, 8).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    onClick={() => setInspectedLog(log)}
                    className="py-3 flex items-center justify-between hover:bg-muted/30 px-2 rounded-md transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate pr-4">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          log.status === "success" ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
                        {log.title || `Article #${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-[11px] shrink-0">
                      <span>{log.latency_ms ? `${Math.round(log.latency_ms / 1000)}s` : "< 2s"} generation</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        {log.status === "success" ? "Published" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No articles published yet. Connect your site using your key above or try the Live Studio to publish!
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ONE-TIME CONNECTION KEY REVEAL DIALOG */}
      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-md p-6">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <Key className="h-5 w-5 text-emerald-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Your Secret Connection Key
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Copy this secret key to connect your website or plugin. For your security, it will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="rounded-lg border border-border/80 bg-background/80 p-3 font-mono text-xs text-indigo-300 break-all select-all">
              {revealedRawKey}
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Please save this key securely. If you ever lose it, you can easily regenerate a new connection key anytime from this dashboard.
              </span>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowKeyModal(false)}
              className="text-xs"
            >
              I Have Saved It
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleCopyKey}
              className="text-xs font-semibold gap-1.5"
            >
              {copiedKey ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Connection Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPGRADE PLAN MODAL */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-2xl p-6">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Upgrade Your Monthly Article Plan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose the right publishing volume to accelerate your organic search rankings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {Object.values(PLAN_TIERS).map((plan) => {
              const isCurrent = (profile.plan_tier || "starter") === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 relative ${
                    plan.recommended
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border/70 bg-card/50"
                  }`}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-2.5 right-4 text-[10px] bg-primary text-primary-foreground font-semibold">
                      Popular
                    </Badge>
                  )}

                  <div>
                    <h3 className="font-bold text-sm text-foreground">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-extrabold text-foreground">${plan.priceMonthly}</span>
                      <span className="text-xs text-muted-foreground ml-1">/month</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{plan.description}</p>

                    <Separator className="my-3 bg-border/40" />

                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="sm"
                    disabled={isCurrent || upgradingPlan !== null}
                    onClick={() => handleUpgradePlan(plan.id)}
                    className="w-full text-xs font-semibold"
                    variant={isCurrent ? "secondary" : plan.recommended ? "default" : "outline"}
                  >
                    {upgradingPlan === plan.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCurrent ? (
                      "Active Plan"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <span>Cancel anytime directly from your dashboard.</span>
            <Button variant="ghost" size="sm" onClick={() => setShowUpgradeModal(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARTICLE LOG DETAILS DIALOG */}
      <Dialog open={Boolean(inspectedLog)} onOpenChange={(open) => !open && setInspectedLog(null)}>
        <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-3xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {inspectedLog?.title || "Article Details"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Generated {inspectedLog?.created_at ? new Date(inspectedLog.created_at).toLocaleDateString() : ""} via {inspectedLog?.provider_used} ({inspectedLog?.model})
                </DialogDescription>
              </div>
              <Badge variant="outline" className={`text-[10px] ${inspectedLog?.status === "success" ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"}`}>
                {inspectedLog?.status === "success" ? "PUBLISHED" : "FAILED"}
              </Badge>
            </div>
          </DialogHeader>

          {inspectedLog && (
            <div className="space-y-4 my-2 text-xs">
              {/* Meta Description */}
              {inspectedLog.meta_description && (
                <div className="p-3 bg-muted/20 border border-border/40 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">SEO Meta Description</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] gap-1 px-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(inspectedLog.meta_description || "");
                        setCopiedLogMeta(true);
                        setTimeout(() => setCopiedLogMeta(false), 2000);
                      }}
                    >
                      {copiedLogMeta ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedLogMeta ? "Copied" : "Copy Meta"}
                    </Button>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{inspectedLog.meta_description}</p>
                </div>
              )}

              {/* Suggested Tags */}
              {inspectedLog.suggested_tags && inspectedLog.suggested_tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Tags:</span>
                  {inspectedLog.suggested_tags.map((tag, tIdx) => (
                    <Badge key={tIdx} variant="secondary" className="text-[10px] py-0 px-2 bg-muted/40">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* If article has full content, show Preview / HTML tabs */}
              {inspectedLog.content ? (
                <Tabs value={logViewTab} onValueChange={(v: any) => setLogViewTab(v)} className="w-full">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1 mb-2">
                    <TabsList className="bg-muted/30 h-7 p-0.5">
                      <TabsTrigger value="preview" className="text-[11px] h-6 px-2.5">
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="html" className="text-[11px] h-6 px-2.5">
                        HTML Source
                      </TabsTrigger>
                      <TabsTrigger value="telemetry" className="text-[11px] h-6 px-2.5">
                        Telemetry
                      </TabsTrigger>
                    </TabsList>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(inspectedLog.content || "");
                        setCopiedLogContent(true);
                        setTimeout(() => setCopiedLogContent(false), 2000);
                      }}
                    >
                      {copiedLogContent ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedLogContent ? "Copied HTML" : "Copy HTML"}
                    </Button>
                  </div>

                  <TabsContent value="preview" className="m-0 max-h-[350px] overflow-y-auto p-4 rounded-lg bg-background/80 border border-border/60 prose prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: inspectedLog.content }} />
                  </TabsContent>

                  <TabsContent value="html" className="m-0 max-h-[350px] overflow-y-auto p-3 rounded-lg bg-black/80 border border-border/60 font-mono text-[11px] text-emerald-300 leading-relaxed whitespace-pre-wrap select-all">
                    {inspectedLog.content}
                  </TabsContent>

                  <TabsContent value="telemetry" className="m-0 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                        <span className="text-[10px] text-muted-foreground">Provider &amp; Model</span>
                        <p className="font-mono font-medium text-foreground truncate">{inspectedLog.provider_used} ({inspectedLog.model})</p>
                      </div>
                      <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                        <span className="text-[10px] text-muted-foreground">Total Latency</span>
                        <p className="font-mono font-medium text-foreground">{inspectedLog.latency_ms ? `${inspectedLog.latency_ms} ms` : "N/A"}</p>
                      </div>
                      <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                        <span className="text-[10px] text-muted-foreground">Token Consumption</span>
                        <p className="font-mono font-medium text-foreground">{inspectedLog.total_tokens || "N/A"} tokens</p>
                      </div>
                      <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                        <span className="text-[10px] text-muted-foreground">Status</span>
                        <Badge variant="outline" className={`mt-0.5 text-[10px] ${inspectedLog.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                          {inspectedLog.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                /* Legacy log telemetry display */
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Provider &amp; Model</span>
                    <p className="font-mono font-medium text-foreground">{inspectedLog.provider_used} ({inspectedLog.model})</p>
                  </div>
                  <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Total Latency</span>
                    <p className="font-mono font-medium text-foreground">{inspectedLog.latency_ms ? `${inspectedLog.latency_ms} ms` : "N/A"}</p>
                  </div>
                  <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Token Consumption</span>
                    <p className="font-mono font-medium text-foreground">{inspectedLog.total_tokens || "N/A"} tokens</p>
                  </div>
                  <div className="p-2.5 bg-muted/20 border border-border/40 rounded-md">
                    <span className="text-[10px] text-muted-foreground">Generation Status</span>
                    <Badge variant="outline" className={`mt-0.5 text-[10px] ${inspectedLog.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                      {inspectedLog.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}

              {inspectedLog.error_message && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-[11px]">
                  <span className="font-bold">Error: </span> {inspectedLog.error_message}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (inspectedLog?.title) {
                  navigator.clipboard.writeText(inspectedLog.title);
                  setCopiedLogTitle(true);
                  setTimeout(() => setCopiedLogTitle(false), 2000);
                }
              }}
              className="text-xs"
            >
              {copiedLogTitle ? "Copied Title" : "Copy Article Title"}
            </Button>
            <Button type="button" size="sm" onClick={() => setInspectedLog(null)} className="text-xs">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GENERATE ARTICLE STUDIO MODAL */}
      <Dialog open={showGenerateModal} onOpenChange={(open) => !open && setShowGenerateModal(false)}>
        <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Live Article Generation Studio
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate an SEO-optimized blog article with your brand voice, internal links, and automatic CMS webhook dispatch.
            </DialogDescription>
          </DialogHeader>

          {!generatedArticleResult ? (
            <form onSubmit={handleGenerateArticle} className="space-y-4 my-2 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Article Topic or Headline *</label>
                <Input
                  required
                  placeholder="e.g. 10 Proven SEO Strategies to Grow SaaS Organic Traffic in 2026"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="bg-background/80 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Primary &amp; Secondary Keywords (Optional)</label>
                <Input
                  placeholder="e.g. saas seo, organic traffic, b2b content marketing (comma-separated)"
                  value={genKeywords}
                  onChange={(e) => setGenKeywords(e.target.value)}
                  className="bg-background/80 text-xs"
                />
                <span className="text-[11px] text-muted-foreground">Separate keywords with commas.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Word Count</label>
                <select
                  value={genTargetWordCount}
                  onChange={(e) => setGenTargetWordCount(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={800}>~800 words (Quick Guide)</option>
                  <option value={1200}>~1,200 words (Standard Deep Dive - Recommended)</option>
                  <option value={1600}>~1,600 words (Comprehensive Pillar Post)</option>
                  <option value={2000}>~2,000 words (Ultimate Authority Guide)</option>
                </select>
              </div>

              {genError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{genError}</span>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGeneratingArticle}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isGeneratingArticle || !genTopic.trim()}
                  className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  {isGeneratingArticle ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating Article...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Generate Article Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 my-2 text-xs">
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-xs">Article Generated Successfully!</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  {generatedArticleResult.telemetry?.provider_used || "groq"} ({generatedArticleResult.telemetry?.latency_ms ? `${Math.round(generatedArticleResult.telemetry.latency_ms / 1000)}s` : "< 2s"})
                </Badge>
              </div>

              <div className="p-3 bg-background/80 border border-border/60 rounded-lg space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Title</span>
                <h4 className="text-sm font-bold text-foreground">{generatedArticleResult.title}</h4>
              </div>

              <div className="p-3 bg-muted/20 border border-border/40 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Meta Description</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] gap-1 px-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedArticleResult.metaDescription);
                      setCopiedGeneratedMeta(true);
                      setTimeout(() => setCopiedGeneratedMeta(false), 2000);
                    }}
                  >
                    {copiedGeneratedMeta ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedGeneratedMeta ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{generatedArticleResult.metaDescription}</p>
              </div>

              {generatedArticleResult.suggestedTags && generatedArticleResult.suggestedTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Tags:</span>
                  {generatedArticleResult.suggestedTags.map((tag, tIdx) => (
                    <Badge key={tIdx} variant="secondary" className="text-[10px] py-0 px-2 bg-muted/40">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Article Preview &amp; HTML</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedArticleResult.content);
                      setCopiedGeneratedContent(true);
                      setTimeout(() => setCopiedGeneratedContent(false), 2000);
                    }}
                  >
                    {copiedGeneratedContent ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedGeneratedContent ? "Copied Full HTML" : "Copy Full HTML"}
                  </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-4 rounded-lg bg-background/80 border border-border/60 prose prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: generatedArticleResult.content }} />
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedArticleResult(null);
                    setGenTopic("");
                    setGenKeywords("");
                  }}
                  className="text-xs"
                >
                  Generate Another
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowGenerateModal(false)}
                  className="text-xs"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
