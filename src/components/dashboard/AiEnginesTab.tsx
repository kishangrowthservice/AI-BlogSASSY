"use client";

import React, { useState } from "react";
import {
  Cpu,
  Zap,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { updateTenantByoKeys } from "@/lib/serverActions";

interface AiEnginesTabProps {
  profile: SafeSiteProfile;
}

export function AiEnginesTab({ profile }: AiEnginesTabProps) {
  const [byoGroq, setByoGroq] = useState("");
  const [byoGemini, setByoGemini] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveByo = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const ok = await updateTenantByoKeys(profile.id, byoGroq, byoGemini);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError("Failed to update BYO keys. Verify permissions or key format.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400" />
            AI Providers &amp; Private BYO Keys
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Understand our dual-engine failover architecture or bring your private Groq and Gemini credentials for infinite custom volume.
          </p>
        </div>
      </div>

      {/* Dual Engine Architecture Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groq Card */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-[10px] font-mono">
                PRIMARY PIPELINE
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                ● 1.2s Latency
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-2">Groq Llama 3.3 70B Versatile</CardTitle>
            <CardDescription className="text-xs">
              Specialized LPUs producing structured JSON blog posts with human editorial depth at 300+ tokens per second.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Full JSON schema response enforcement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Default included with all monthly subscription quotas</span>
            </div>
          </CardContent>
        </Card>

        {/* Gemini Card */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-500/20 text-purple-300 border-0 text-[10px] font-mono">
                AUTOMATED FAILOVER
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                ● Hot Standby
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-2">Google Gemini 2.0 Flash</CardTitle>
            <CardDescription className="text-xs">
              Google DeepMind's low-latency model, standing by as automated fallback if the primary provider ever experiences spikes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automatic circuit breaker triggering after 3 errors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Identical JSON contract guaranteeing zero schema breakages</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BYO Keys Form Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            Bring Your Own API Keys (BYO Keys)
          </CardTitle>
          <CardDescription className="text-xs">
            Optional: If you already have your own Groq or Gemini API credentials, enter them below. Your requests will route through your private provider quotas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1 max-w-2xl">
          {/* Groq Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Groq API Key (Optional)</label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Get Groq Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                type={showGroqKey ? "text" : "password"}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                value={byoGroq}
                onChange={(e) => setByoGroq(e.target.value)}
                className="bg-background/80 font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGroqKey(!showGroqKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGroqKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Gemini Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Google Gemini API Key (Optional)</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Get Gemini Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                type={showGeminiKey ? "text" : "password"}
                placeholder="AIzaSy••••••••••••••••••••••••••••••"
                value={byoGemini}
                onChange={(e) => setByoGemini(e.target.value)}
                className="bg-background/80 font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGeminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Private credentials saved securely. Future generation will prioritize your private keys.</span>
            </div>
          )}

          {saveError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">
            Keys are strictly private and never exposed to the client browser.
          </span>
          <Button
            size="sm"
            onClick={handleSaveByo}
            disabled={isSaving}
            className="text-xs font-semibold px-4"
          >
            {isSaving ? "Saving..." : "Save Custom Keys"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
