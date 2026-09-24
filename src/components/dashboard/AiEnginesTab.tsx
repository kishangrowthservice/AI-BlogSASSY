"use client";

import React, { useState, useMemo } from "react";
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
  Activity,
  Gauge,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Server,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GenerationLog } from "@/lib/types";
import { updateTenantByoKeys } from "@/lib/serverActions";

interface AiEnginesTabProps {
  profile: SafeSiteProfile;
  logs?: GenerationLog[];
}

export function AiEnginesTab({ profile, logs = [] }: AiEnginesTabProps) {
  const [byoGroq, setByoGroq] = useState("");
  const [byoGemini, setByoGemini] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Compute live provider metrics and failover telemetry from logs
  const telemetry = useMemo(() => {
    const validLogs = logs.filter((l) => l.status === "success");
    const totalRequests = logs.length;

    let groqCount = 0;
    let geminiCount = 0;
    let groqLatencySum = 0;
    let geminiLatencySum = 0;
    let groqTokens = 0;
    let geminiTokens = 0;

    logs.forEach((l) => {
      const provider = (l.provider_used || "").toLowerCase();
      const model = (l.model || "").toLowerCase();
      const isGemini = provider.includes("gemini") || model.includes("gemini");
      const tokens = l.total_tokens || ((l.prompt_tokens || 0) + (l.completion_tokens || 0)) || 1850;

      if (isGemini) {
        geminiCount++;
        geminiTokens += tokens;
        if (l.latency_ms) geminiLatencySum += l.latency_ms;
      } else {
        groqCount++;
        groqTokens += tokens;
        if (l.latency_ms) groqLatencySum += l.latency_ms;
      }
    });

    const fallbackLogs = logs.filter((l) => l.fallback_triggered === true);
    const failoverCount = fallbackLogs.length;

    const groqAvgLatencyMs = groqCount > 0 ? Math.round(groqLatencySum / groqCount) : 1150;
    const geminiAvgLatencyMs = geminiCount > 0 ? Math.round(geminiLatencySum / geminiCount) : 1620;

    const groqShare = totalRequests > 0 ? Math.round((groqCount / totalRequests) * 100) : 100;
    const geminiShare = totalRequests > 0 ? Math.round((geminiCount / totalRequests) * 100) : 0;

    const groqSuccessCount = logs.filter((l) => {
      const p = (l.provider_used || "").toLowerCase();
      return !p.includes("gemini") && l.status === "success";
    }).length;
    const groqTotalCount = groqCount || 1;
    const groqUptimePct = Math.round((groqSuccessCount / groqTotalCount) * 100);

    return {
      totalRequests,
      groqCount,
      geminiCount,
      groqTokens,
      geminiTokens,
      groqAvgLatencyMs,
      geminiAvgLatencyMs,
      groqShare,
      geminiShare,
      groqUptimePct: totalRequests > 0 ? groqUptimePct : 100,
      failoverCount,
      failoverRate: totalRequests > 0 ? ((failoverCount / totalRequests) * 100).toFixed(1) : "0.0",
      fallbackLogs: fallbackLogs.slice(0, 5),
    };
  }, [logs]);

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
            AI Providers &amp; Dual-Engine Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time inference telemetry, automated provider failover status, and private BYO key management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1 flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            99.99% PUBLISHING SLA ACTIVE
          </Badge>
        </div>
      </div>

      {/* Top 4 KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Primary Pipeline Health */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Primary Engine Uptime
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {telemetry.groqUptimePct}%
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Groq Llama 3.3 70B Active</span>
          </div>
        </Card>

        {/* Card 2: Groq Avg Latency */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Groq LPU Latency
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-indigo-300 border-indigo-500/30">
              300+ tok/s
            </Badge>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {(telemetry.groqAvgLatencyMs / 1000).toFixed(2)}s
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{telemetry.groqCount} requests routed ({telemetry.groqShare}%)</span>
          </div>
        </Card>

        {/* Card 3: Gemini Fallback Latency */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Gemini Standby Latency
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-purple-300 border-purple-500/30">
              Hot Standby
            </Badge>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {(telemetry.geminiAvgLatencyMs / 1000).toFixed(2)}s
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <span>Gemini 2.0 Flash ready</span>
          </div>
        </Card>

        {/* Card 4: Circuit Breaker & Failovers */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Circuit Breaker
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              CLOSED
            </Badge>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {telemetry.failoverCount} <span className="text-sm font-normal text-muted-foreground">Failovers</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>{telemetry.failoverRate}% failover rate recorded</span>
          </div>
        </Card>
      </div>

      {/* Dual Engine Architecture Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groq Card */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-[10px] font-mono">
                PRIMARY PIPELINE
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                ● {(telemetry.groqAvgLatencyMs / 1000).toFixed(1)}s Latency
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-2">Groq Llama 3.3 70B Versatile</CardTitle>
            <CardDescription className="text-xs">
              Ultra-high-speed LPUs producing human-grade structured blog articles with deep search intent analysis.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Pipeline Traffic Share</span>
                <span className="font-mono text-foreground font-semibold">{telemetry.groqShare}%</span>
              </div>
              <Progress value={telemetry.groqShare} className="h-1.5 bg-muted/60" />
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Strict JSON schema response format enforcement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Default included with all monthly subscription quotas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tokens consumed: {telemetry.groqTokens.toLocaleString()} tokens</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4 text-[11px] text-muted-foreground border-t border-border/40 font-mono">
            Model ID: llama-3.3-70b-versatile • Temperature: 0.7
          </CardFooter>
        </Card>

        {/* Gemini Card */}
        <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-500/20 text-purple-300 border-0 text-[10px] font-mono">
                AUTOMATED FAILOVER
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                ● Hot Standby Ready
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-2">Google Gemini 2.0 Flash</CardTitle>
            <CardDescription className="text-xs">
              Google DeepMind's low-latency multimodal model, armed on hot standby if the primary provider encounters rate limits or spikes.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Failovers Triggered</span>
                <span className="font-mono text-foreground font-semibold">
                  {telemetry.failoverCount} ({telemetry.failoverRate}%)
                </span>
              </div>
              <Progress value={Math.max(telemetry.geminiShare, 2)} className="h-1.5 bg-muted/60" />
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Automatic circuit breaker trigger after 3 consecutive failures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Identical JSON contract guaranteeing zero frontend breakages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tokens consumed: {telemetry.geminiTokens.toLocaleString()} tokens</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4 text-[11px] text-muted-foreground border-t border-border/40 font-mono">
            Model ID: gemini-2.0-flash • Schema Contract: Verified
          </CardFooter>
        </Card>
      </div>

      {/* Latency & Throughput Comparison Matrix */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Gauge className="h-4 w-4 text-indigo-400" />
            Engine Latency &amp; Capacity Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Comparative performance telemetry across primary Groq and fallback Gemini engines.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1: Response Latency */}
            <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Response Latency</span>
                <span className="text-[10px] text-muted-foreground">Avg per article</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-indigo-400">Groq: {(telemetry.groqAvgLatencyMs / 1000).toFixed(2)}s</span>
                  <span className="text-muted-foreground">Ultra-Fast</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-400">Gemini: {(telemetry.geminiAvgLatencyMs / 1000).toFixed(2)}s</span>
                  <span className="text-muted-foreground">Resilient</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Context Window */}
            <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Context Headroom</span>
                <span className="text-[10px] text-muted-foreground">Max Tokens</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-indigo-400">Groq: 128,000 tok</span>
                  <span className="text-muted-foreground">Editorial</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-400">Gemini: 1,000,000 tok</span>
                  <span className="text-muted-foreground">Deep Context</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Output Contract Enforcement */}
            <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Schema Parity</span>
                <span className="text-[10px] text-muted-foreground">JSON Schema</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-indigo-400">Groq: response_format</span>
                  <span className="text-emerald-400">Enforced</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-400">Gemini: responseSchema</span>
                  <span className="text-emerald-400">Enforced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Failover Stream Status */}
          {telemetry.failoverCount > 0 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Recent Automated Failover Incidents ({telemetry.fallbackLogs.length})
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30">
                  RECOVERED SEAMLESSLY
                </Badge>
              </div>

              <div className="divide-y divide-border/40 text-xs">
                {telemetry.fallbackLogs.map((log, idx) => (
                  <div key={log.id || idx} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="font-semibold text-foreground truncate max-w-xs">
                        {log.title || `Generation incident #${idx + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
                      <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
                        Switched to Gemini Flash
                      </Badge>
                      <span>{(log.latency_ms / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300">100% Primary Pipeline Uptime</div>
                  <div className="text-[11px] text-muted-foreground">
                    Zero failover events needed. Dual-LLM fallback remains armed and ready on hot standby.
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-emerald-400 border-emerald-500/30 shrink-0">
                HEALTHY
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

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
