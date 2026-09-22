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
  generateTenantApiKeyAction,
  updateTenantByoKeys,
  updateTenantBrandAction,
} from "@/lib/serverActions";
import type { SiteProfile } from "@/lib/types";
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
} from "lucide-react";

interface TenantDashboardProps {
  initialProfile: SiteProfile;
  initialKeyPrefix: string | null;
  initialLogs: any[];
}

export function TenantDashboardClient({
  initialProfile,
  initialKeyPrefix,
  initialLogs,
}: TenantDashboardProps) {
  const [profile, setProfile] = useState<SiteProfile>(initialProfile);
  const [keyPrefix, setKeyPrefix] = useState<string | null>(initialKeyPrefix);
  const [logs, setLogs] = useState<any[]>(initialLogs);

  // Key Generation State
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // BYO Key State
  const [byoGroq, setByoGroq] = useState(initialProfile.byo_groq_api_key || "");
  const [byoGemini, setByoGemini] = useState(initialProfile.byo_gemini_api_key || "");
  const [isSavingByo, setIsSavingByo] = useState(false);
  const [byoSuccess, setByoSuccess] = useState(false);

  // Brand DNA State
  const [brandKnowledge, setBrandKnowledge] = useState(initialProfile.brand_knowledge || "");
  const [tone, setTone] = useState(initialProfile.tone || "");
  const [targetAudience, setTargetAudience] = useState(initialProfile.target_audience || "");
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSuccess, setBrandSuccess] = useState(false);

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
    try {
      await updateTenantByoKeys(profile.id, byoGroq, byoGemini);
      setByoSuccess(true);
      setTimeout(() => setByoSuccess(false), 3000);
    } finally {
      setIsSavingByo(false);
    }
  };

  const handleSaveBrand = async () => {
    setIsSavingBrand(true);
    setBrandSuccess(false);
    try {
      await updateTenantBrandAction(profile.id, {
        brand_knowledge: brandKnowledge,
        tone: tone,
        target_audience: targetAudience,
        internal_links: profile.internal_links,
      });
      setBrandSuccess(true);
      setTimeout(() => setBrandSuccess(false), 3000);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const activeKeySample = keyPrefix || "gs_live_YOUR_SECRET_KEY";

  const curlExample = `curl -X POST https://api.growthservice.in/api/generate-blog \\
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
  endpoint: "https://api.growthservice.in"
});

// Publishes SEO blog directly
const post = await client.generateBlog({
  topic: "Proven Strategies to Grow Website Authority in 2026",
  wordCount: 1200
});

console.log("Ready:", post.title);`;

  const quotaPercent = Math.min(100, Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100));

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
              <span className="font-bold tracking-tight text-base">AI Blog SaaS</span>
            </Link>

            <Separator orientation="vertical" className="h-4 bg-border/60 mx-1" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{profile.site_name}</span>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {profile.domain}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Site Active
            </Badge>

            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/preview">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                Live Studio
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Client Content Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your website connection key, brand voice, monthly articles, and publishing settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              Account ID: {profile.id.slice(0, 8)}...
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
                    Your key is securely encrypted. To rotate or generate a new secret credential, click regenerate below (will replace previous connection).
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
                <Badge variant="outline" className="text-[10px]">
                  Starter Plan
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

            <CardFooter className="border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
              Need higher monthly volume? Upgrade your plan or connect custom accounts anytime.
            </CardFooter>
          </Card>
        </div>

        {/* Website Publishing & Quick Integration */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-indigo-400" />
                <CardTitle className="text-base font-bold">Publish to Your Website</CardTitle>
              </div>
              <Badge variant="outline" className="text-[11px]">
                Direct Webhook &amp; API Ready
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Push published articles directly into your content management system or custom codebase.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
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
          {/* BRAND DNA CARD */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Sliders className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Brand Voice &amp; Messaging</CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune the vocabulary and unique expertise woven into your published articles.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
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

              {brandSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Brand settings updated successfully.
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
                  <CardTitle className="text-base font-bold">Custom AI Accounts (Optional)</CardTitle>
                  <CardDescription className="text-xs">
                    Connect your own Groq or Gemini AI keys for unlimited volume beyond plan limits.
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Recent Published Articles</CardTitle>
            <CardDescription className="text-xs">
              History of all articles generated and delivered for this website.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="divide-y divide-border/40 text-xs">
                {logs.slice(0, 5).map((log, idx) => (
                  <div key={log.id || idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          log.status === "success" ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span className="font-medium text-foreground">Article #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                      <span>{log.latency_ms ? `${Math.round(log.latency_ms / 1000)}s` : "< 2s"} generation</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        {log.status === "success" ? "Ready & Published" : "Processing"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No articles published yet. Connect your site using your key above to start publishing!
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
    </div>
  );
}
