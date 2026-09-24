"use client";

import React, { useState } from "react";
import {
  Share2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Code2,
  RefreshCw,
  ExternalLink,
  Check,
  ArrowRight,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { updateTenantWebhookAction, testWebhookPingAction } from "@/lib/serverActions";
import { CmsConnectorModal, type CmsPlatformId } from "./CmsConnectorModal";

interface AutomationsTabProps {
  profile: SafeSiteProfile;
  keyPrefix: string | null;
  onProfileUpdated: (updated: Partial<SafeSiteProfile>) => void;
}

interface PlatformItem {
  id: CmsPlatformId;
  name: string;
  desc: string;
  badge: string;
  color: string;
  matchPattern: string;
}

const SUPPORTED_PLATFORMS: PlatformItem[] = [
  {
    id: "wordpress",
    name: "WordPress",
    desc: "Auto-publishes to wp-json/wp/v2/posts as formatted draft or published article.",
    badge: "Most Popular",
    color: "bg-blue-600/10 text-blue-400 border-blue-500/20",
    matchPattern: "wp-json",
  },
  {
    id: "shopify",
    name: "Shopify Blog",
    desc: "Delivers posts straight to your Shopify online store blog handles.",
    badge: "eCommerce",
    color: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
    matchPattern: "myshopify",
  },
  {
    id: "webflow",
    name: "Webflow CMS",
    desc: "Injects articles into your Webflow CMS Collection with live slugging.",
    badge: "Design-first",
    color: "bg-indigo-600/10 text-indigo-400 border-indigo-500/20",
    matchPattern: "webflow",
  },
  {
    id: "ghost",
    name: "Ghost CMS",
    desc: "Direct push to Ghost Admin API v5 with full HTML and mobiledoc support.",
    badge: "Fast & Clean",
    color: "bg-purple-600/10 text-purple-400 border-purple-500/20",
    matchPattern: "ghost",
  },
];

export function AutomationsTab({ profile, keyPrefix, onProfileUpdated }: AutomationsTabProps) {
  const [webhookUrl, setWebhookUrl] = useState(profile.webhook_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1-Click Platform Wizard Modal State
  const [selectedPlatform, setSelectedPlatform] = useState<CmsPlatformId | null>(null);
  const [showConnectorModal, setShowConnectorModal] = useState(false);

  // Test Webhook Real Ping State
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    message: string;
  } | null>(null);

  const handleOpenPlatformWizard = (platId: CmsPlatformId) => {
    setSelectedPlatform(platId);
    setShowConnectorModal(true);
  };

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await updateTenantWebhookAction(profile.id, webhookUrl);
      if (res.success) {
        onProfileUpdated({ webhook_url: webhookUrl.trim() || null });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.error || "Failed to save webhook URL.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPing = async () => {
    if (!webhookUrl.trim()) {
      setPingResult({ success: false, message: "Please enter a valid webhook URL first." });
      return;
    }

    setIsTestingPing(true);
    setPingResult(null);

    try {
      const res = await testWebhookPingAction(profile.id, webhookUrl);
      setPingResult(res);
      setTimeout(() => setPingResult(null), 8000);
    } catch (err: any) {
      setPingResult({
        success: false,
        message: err?.message || "Failed to contact webhook endpoint.",
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const activePlatform = SUPPORTED_PLATFORMS.find((p) =>
    profile.webhook_url?.toLowerCase().includes(p.matchPattern)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Share2 className="h-6 w-6 text-indigo-400" />
            CMS Automations &amp; Webhooks
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automatically dispatch finished articles to WordPress, Shopify, Webflow, Ghost, or your custom API endpoint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePlatform && (
            <Badge variant="outline" className={`text-xs px-2.5 py-1 ${activePlatform.color}`}>
              {activePlatform.name} Connected
            </Badge>
          )}
          <Badge
            variant={profile.webhook_url ? "outline" : "secondary"}
            className={`text-xs px-2.5 py-1 ${
              profile.webhook_url
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                : "text-muted-foreground"
            }`}
          >
            {profile.webhook_url ? "● Webhook Active" : "No Webhook Set"}
          </Badge>
        </div>
      </div>

      {/* 1-Click Connectors Platform Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            1-Click CMS Publishing Connectors
          </span>
          <span className="text-[11px] text-muted-foreground">
            Click any platform to launch guided setup wizard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORTED_PLATFORMS.map((plat) => {
            const isCurrentlyActive = Boolean(
              profile.webhook_url?.toLowerCase().includes(plat.matchPattern)
            );

            return (
              <Card
                key={plat.id}
                onClick={() => handleOpenPlatformWizard(plat.id)}
                className={`border-border/70 bg-card/60 backdrop-blur-xl p-4 space-y-3 cursor-pointer hover:border-primary/50 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden ${
                  isCurrentlyActive ? "ring-1 ring-emerald-500/40 border-emerald-500/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {plat.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isCurrentlyActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <Badge variant="outline" className={`text-[9px] ${plat.color}`}>
                      {plat.badge}
                    </Badge>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {plat.desc}
                </p>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-primary font-medium">
                  <span>{isCurrentlyActive ? "Manage Integration" : "Setup Wizard"}</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Webhook Configuration Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            Outbound Delivery Endpoint
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the HTTP POST destination where our backend should deliver finished articles immediately after generation.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="https://yourwebsite.com/api/webhooks/incoming-article"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-xs bg-background/80 flex-1 h-9"
            />
            <Button
              onClick={handleSaveWebhook}
              disabled={isSaving}
              className="text-xs font-semibold px-4 h-9 shrink-0"
            >
              {isSaving ? "Saving..." : "Save Endpoint"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestPing}
              disabled={isTestingPing || !webhookUrl}
              className="text-xs font-semibold px-3 h-9 shrink-0 border-border/80"
            >
              {isTestingPing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                  Send Test Ping
                </>
              )}
            </Button>
          </div>

          {saveSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Webhook endpoint saved! Future generated articles will dispatch to this URL.</span>
            </div>
          )}

          {saveError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {pingResult && (
            <div
              className={`rounded-lg border p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200 ${
                pingResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {pingResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{pingResult.message}</span>
              </div>
              {pingResult.latencyMs && (
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  {pingResult.latencyMs}ms
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Payload Security & Verification Guide */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            Cryptographic Payload Signature Verification
          </CardTitle>
          <CardDescription className="text-xs">
            Every webhook request carries a cryptographic HMAC-SHA256 signature in the <code className="font-mono text-indigo-300">x-saas-signature</code> header to guarantee origin authenticity.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="rounded-xl border border-border/70 bg-black/80 p-4 font-mono text-xs overflow-x-auto">
            <div className="text-[10px] text-muted-foreground pb-2 border-b border-border/40 mb-3 flex items-center justify-between">
              <span>Node.js / Express Webhook Receiver Handler</span>
              <span>HMAC-SHA256</span>
            </div>
            <pre className="text-emerald-300 leading-relaxed text-[11px]">
{`app.post("/api/webhooks/incoming-article", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-saas-signature"]; // sha256=<hex_hash>
  const secretKey = process.env.AI_BLOG_SECRET_KEY || "${profile.id}";

  const expected = "sha256=" + crypto
    .createHmac("sha256", secretKey)
    .update(req.body)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(req.body);
  console.log("Published article received:", payload.article.title);
  // Auto-post to your CMS database or storage...
  res.status(200).json({ received: true });
});`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Platform Setup Wizard Modal */}
      <CmsConnectorModal
        platform={selectedPlatform}
        open={showConnectorModal}
        onOpenChange={setShowConnectorModal}
        profile={profile}
        onEndpointSaved={(newUrl) => {
          setWebhookUrl(newUrl);
          onProfileUpdated({ webhook_url: newUrl });
        }}
      />
    </div>
  );
}
