"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Loader2,
  Code2,
  Copy,
  Check,
  Key,
  Eye,
  FileText,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Cpu,
  Clock,
  ExternalLink,
} from "lucide-react";
import { BlogPostViewer } from "@/components/BlogPostViewer";
import { generateDashboardBlogAction } from "@/lib/serverActions";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { GeneratedBlogPost, GenerationTelemetry } from "@/lib/types";

interface SamplePreset {
  name: string;
  topic: string;
  keywords: string;
  wordCount: number;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    name: "SaaS SEO Growth",
    topic: "Why Programmatic SEO and Editorial Rigor Outperform Paid Ads for B2B SaaS",
    keywords: "programmatic SEO, B2B pipeline, customer acquisition cost, organic growth",
    wordCount: 800,
  },
  {
    name: "AI Automation",
    topic: "How Modern Engineering Teams Deploy Autonomous Content Pipelines Safely",
    keywords: "AI blog automation, content workflows, webhook publishing, dual-LLM fallback",
    wordCount: 750,
  },
  {
    name: "High-Conviction Voice",
    topic: "The Hidden Cost of Category Creep in Modern Organic Search Strategy",
    keywords: "category creep, search intent, topical authority, technical SEO",
    wordCount: 850,
  },
];

export function ApiPlaygroundTab({
  profile,
  apiOrigin,
  keyPrefix,
}: {
  profile: SafeSiteProfile;
  apiOrigin: string;
  keyPrefix: string | null;
}) {
  const [topic, setTopic] = useState("Why Programmatic SEO and Editorial Rigor Outperform Paid Ads for B2B SaaS");
  const [keywords, setKeywords] = useState("programmatic SEO, B2B pipeline, organic search ROI");
  const [wordCount, setWordCount] = useState(800);
  const [authMode, setAuthMode] = useState<"session" | "apikey">("session");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [postResult, setPostResult] = useState<GeneratedBlogPost | null>(null);
  const [telemetryResult, setTelemetryResult] = useState<GenerationTelemetry | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const applyPreset = (preset: SamplePreset) => {
    setTopic(preset.topic);
    setKeywords(preset.keywords);
    setWordCount(preset.wordCount);
  };

  const handleTestCall = async () => {
    if (!topic.trim()) {
      setErrorMessage("Field 'topic' is required to execute a generation request.");
      return;
    }

    setLoading(true);
    setPostResult(null);
    setTelemetryResult(null);
    setRawResponse(null);
    setErrorMessage(null);
    setStatusCode(null);

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      topic: topic.trim(),
      keywords: keywordList,
      wordCount: Number(wordCount),
    };

    try {
      if (authMode === "session") {
        // Direct authenticated dashboard execution (no API key required)
        const res = await generateDashboardBlogAction(profile.id, payload);

        if (res.success && res.post) {
          setStatusCode(200);
          setPostResult(res.post);
          if (res.telemetry) setTelemetryResult(res.telemetry);
          setRawResponse({
            status: "success",
            post: res.post,
            telemetry: res.telemetry,
            usedQuota: res.usedQuota,
            monthlyQuota: res.monthlyQuota,
          });
        } else {
          setStatusCode(400);
          setErrorMessage(res.error || "Generation action returned unsuccessful status.");
          setRawResponse({ error: res.error });
        }
      } else {
        // Direct HTTP API endpoint verification using x-api-key header
        if (!apiKey.trim()) {
          setStatusCode(401);
          setErrorMessage("API key is required in API Key Mode. Paste your raw secret key or switch to Session Auth.");
          return;
        }

        const endpoint = "/api/generate-blog";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey.trim(),
          },
          body: JSON.stringify({ ...payload, async: false }),
        });

        setStatusCode(res.status);
        const data = await res.json();
        setRawResponse(data);

        if (!res.ok) {
          setErrorMessage(data?.error || `API returned status ${res.status}`);
          return;
        }

        // Support both direct post payload and wrapped post payload
        const postData = data.post || (data.title && data.content ? data : null);
        if (postData) {
          setPostResult(postData);
          if (data.telemetry) setTelemetryResult(data.telemetry);
        } else {
          setErrorMessage("API returned successful status but no article post payload was parsed.");
        }
      }
    } catch (err: any) {
      setStatusCode(500);
      const msg = err?.message || "Execution failed. Check server connectivity.";
      setErrorMessage(msg);
      setRawResponse({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (contentToCopy?: string) => {
    const text = contentToCopy || JSON.stringify(rawResponse, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-indigo-400" />
            API Interactive Playground
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test real-time generation against your brand profile (<strong>{profile.site_name}</strong>) with live preview and telemetry.
          </p>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAuthMode("session")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              authMode === "session"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Session Auth (Direct)
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("apikey")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              authMode === "apikey"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            API Key Header
          </button>
        </div>
      </div>

      {/* Preset Quick Fill */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Quick Samples:
        </span>
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-2.5 py-1 rounded-lg border border-border/60 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-[11px]"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Request Panel */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xl flex flex-col justify-between shadow-sm">
          <div>
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground">Request Configuration</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono font-medium">
                  {authMode === "session" ? "Mode: Direct Server Action" : "Mode: HTTP POST /api/generate-blog"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {authMode === "session"
                  ? "Uses your authenticated session. No secret key needed."
                  : "Simulates an external developer calling the HTTP endpoint."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Endpoint Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Target Method &amp; Route
                </label>
                <div className="p-2.5 bg-muted/40 border border-border/50 rounded-lg text-xs font-mono text-indigo-300 select-all flex items-center justify-between">
                  <span>POST /api/generate-blog</span>
                  <span className="text-[10px] text-muted-foreground font-sans">JSON Body</span>
                </div>
              </div>

              {/* API Key Input (if in apikey mode) */}
              {authMode === "apikey" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <Key className="h-3.5 w-3.5 text-amber-400" /> Raw API Key
                    </label>
                    {keyPrefix && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Active Prefix: <span className="text-foreground">{keyPrefix}</span>
                      </span>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="gs_live_... (Paste your raw secret token)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-background/80 border-border/70 font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Sent via the <code className="text-amber-300">x-api-key</code> HTTP header.
                  </p>
                </div>
              )}

              {/* Article Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Article Topic</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Required</span>
                </label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 10 High-Impact Ways Modern Businesses Scale Organic Traffic"
                  rows={2}
                  className="bg-background/60 border-border/70 text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Target Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Keywords (Comma Separated)</label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="SEO growth, content marketing, b2b pipeline"
                  className="bg-background/60 border-border/70 text-xs"
                />
              </div>

              {/* Target Word Count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Target Word Count</label>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">{wordCount} words</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={2500}
                  step={50}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>300 (Brief)</span>
                  <span>1,000 (Standard)</span>
                  <span>2,500 (Deep Guide)</span>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-4 border-t border-border/40">
            <Button
              onClick={handleTestCall}
              disabled={loading || !topic.trim()}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md h-10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Blog Post with Dual-LLM Pipeline...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute Playground Call
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Response Panel */}
        <Card className="border-border/60 bg-[#0b0c13] text-slate-300 flex flex-col justify-between shadow-xl min-h-[500px]">
          <div>
            <CardHeader className="border-b border-white/10 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div>
                  <CardTitle className="text-base text-slate-100 font-bold">Execution Output</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    {loading ? "Generating in real-time..." : statusCode ? `HTTP Status ${statusCode}` : "Awaiting execution"}
                  </CardDescription>
                </div>
                {statusCode && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${
                      statusCode >= 200 && statusCode < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
              </div>

              {rawResponse && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy()}
                  className="h-8 text-xs text-slate-400 hover:text-white hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-4 relative min-h-[400px]">
              {loading && (
                <div className="absolute inset-0 z-10 bg-[#0b0c13]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3.5">
                  <div className="relative">
                    <Loader2 className="h-9 w-9 text-indigo-400 animate-spin" />
                    <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-200 font-semibold">Synthesizing Content with AI Engine...</p>
                    <p className="text-[11px] text-slate-400">Calibrating brand voice and weaving canonical links</p>
                  </div>
                </div>
              )}

              {postResult ? (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="bg-white/5 h-8 p-1 border border-white/10 mb-3.5">
                    <TabsTrigger value="preview" className="text-xs gap-1.5 h-6 text-slate-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <Eye className="h-3.5 w-3.5 text-indigo-400" />
                      Rendered Article
                    </TabsTrigger>
                    <TabsTrigger value="html" className="text-xs gap-1.5 h-6 text-slate-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                      HTML Content
                    </TabsTrigger>
                    <TabsTrigger value="json" className="text-xs gap-1.5 h-6 text-slate-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <FileText className="h-3.5 w-3.5 text-amber-400" />
                      Raw JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="m-0">
                    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 max-h-[420px] overflow-y-auto custom-scrollbar">
                      <BlogPostViewer post={postResult} />
                    </div>
                  </TabsContent>

                  <TabsContent value="html" className="m-0">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopy(postResult.content)}
                        className="absolute top-2 right-2 h-7 text-[11px] gap-1 bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Copy className="h-3 w-3" />
                        Copy HTML
                      </Button>
                      <pre className="p-3.5 text-xs font-mono overflow-auto max-h-[420px] custom-scrollbar text-indigo-200 whitespace-pre-wrap break-all rounded-xl bg-black/60 border border-white/10 leading-relaxed">
                        {postResult.content}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="m-0">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopy(JSON.stringify(rawResponse, null, 2))}
                        className="absolute top-2 right-2 h-7 text-[11px] gap-1 bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Copy className="h-3 w-3" />
                        Copy JSON
                      </Button>
                      <pre className="p-3.5 text-xs font-mono overflow-auto max-h-[420px] custom-scrollbar text-emerald-300 whitespace-pre-wrap break-all rounded-xl bg-black/60 border border-white/10">
                        {JSON.stringify(rawResponse, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : errorMessage ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-200">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Generation Failed</span>
                  </div>
                  <p className="leading-relaxed font-mono text-[11px] text-rose-300/90 pl-6">
                    {errorMessage}
                  </p>
                  {errorMessage.toLowerCase().includes("quota") && (
                    <div className="pt-2 pl-6">
                      <a
                        href="/dashboard?tab=billing"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Upgrade Monthly Quota <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-slate-500 font-mono space-y-3 my-12">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="max-w-xs text-slate-400">
                    Configure your parameters on the left and click <strong className="text-slate-200">Execute Playground Call</strong> to generate a post.
                  </p>
                </div>
              )}
            </CardContent>
          </div>

          {/* Telemetry Strip */}
          {telemetryResult && (
            <CardFooter className="border-t border-white/10 py-3 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Provider: <span className="text-white font-semibold">{telemetryResult.provider_used}</span> ({telemetryResult.model})
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Latency: <span className="text-white font-semibold">{(telemetryResult.latency_ms / 1000).toFixed(2)}s</span>
                {" • "}
                Tokens: <span className="text-white font-semibold">{telemetryResult.total_tokens || 0}</span>
              </span>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
