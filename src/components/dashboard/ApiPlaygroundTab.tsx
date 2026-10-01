"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2, Code2, Copy, Check, Key, Eye, FileText, AlertCircle } from "lucide-react";
import { BlogPostViewer } from "@/components/BlogPostViewer";
import type { SafeSiteProfile } from "@/lib/sanitize";

export function ApiPlaygroundTab({
  profile,
  apiOrigin,
  keyPrefix,
}: {
  profile: SafeSiteProfile;
  apiOrigin: string;
  keyPrefix: string | null;
}) {
  const [topic, setTopic] = useState("Why Performance SEO Outperforms Paid Ads in the Long Run");
  const [keywords, setKeywords] = useState("performance SEO, organic search ROI, Core Web Vitals");
  const [wordCount, setWordCount] = useState(800);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const handleTestCall = async () => {
    if (!apiKey.trim()) {
      setResponse({
        error: "API key is required. Paste your generated secret key to execute a live test against your site profile.",
      });
      setStatusCode(401);
      return;
    }

    setLoading(true);
    setResponse(null);
    setStatusCode(null);

    try {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        topic: topic.trim(),
        keywords: keywordList,
        wordCount: Number(wordCount),
        async: false,
      };

      const res = await fetch(`${apiOrigin}/api/generate-blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
        },
        body: JSON.stringify(payload),
      });

      setStatusCode(res.status);
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setStatusCode(500);
      setResponse({ error: err.message || "Network request failed. Verify your server connection." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (contentToCopy?: string) => {
    const text = contentToCopy || JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Code2 className="h-6 w-6 text-indigo-400" />
          API Interactive Playground
        </h1>
        <p className="text-sm text-muted-foreground">
          Execute live generation requests against your website profile, test your brand voice injection, and preview formatted outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xl flex flex-col justify-between shadow-sm">
          <div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Request Parameters</CardTitle>
              <CardDescription className="text-xs">Configure payload for POST /api/generate-blog</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Endpoint
                </label>
                <div className="p-2.5 bg-muted/40 border border-border/50 rounded-lg text-xs font-mono text-indigo-300 select-all">
                  POST {apiOrigin}/api/generate-blog
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Key className="h-3.5 w-3.5 text-amber-400" /> API Key
                  </label>
                  {keyPrefix && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Prefix: <span className="text-foreground">{keyPrefix}</span>
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder={keyPrefix ? `${keyPrefix}... (Paste secret key)` : "gs_live_..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-background/60 border-border/70 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Article Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 10 High-Impact Ways Modern Businesses Scale Organic Traffic"
                  className="bg-background/60 border-border/70 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Keywords (Comma Separated)</label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="SEO growth, content marketing, b2b pipeline"
                  className="bg-background/60 border-border/70 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Word Count</label>
                <Input
                  type="number"
                  min={300}
                  max={2500}
                  step={100}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="bg-background/60 border-border/70 text-xs font-mono"
                />
              </div>
            </CardContent>
          </div>

          <CardFooter className="pt-2 border-t border-border/40">
            <Button
              onClick={handleTestCall}
              disabled={loading || !topic.trim()}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Blog Post with AI...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute API Call
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Response Panel */}
        <Card className="border-border/60 bg-[#0c0d14] text-slate-300 flex flex-col justify-between shadow-lg">
          <div>
            <CardHeader className="border-b border-white/10 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div>
                  <CardTitle className="text-base text-slate-100 font-bold">API Response</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Output payload from orchestrator</CardDescription>
                </div>
                {statusCode && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      statusCode >= 200 && statusCode < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
              </div>

              {response && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy()}
                  className="h-8 text-xs text-slate-400 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-4 relative min-h-[380px]">
              {loading && (
                <div className="absolute inset-0 z-10 bg-[#0c0d14]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">Synthesizing content with dual-LLM pipeline...</p>
                </div>
              )}

              {response?.post ? (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="bg-white/5 h-7 p-0.5 border border-white/10 mb-3">
                    <TabsTrigger value="preview" className="text-xs gap-1.5 h-6 text-slate-300 data-[state=active]:text-white">
                      <Eye className="h-3 w-3" />
                      Rendered Article
                    </TabsTrigger>
                    <TabsTrigger value="json" className="text-xs gap-1.5 h-6 text-slate-300 data-[state=active]:text-white">
                      <FileText className="h-3 w-3" />
                      Raw JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="m-0">
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4 max-h-[380px] overflow-y-auto custom-scrollbar">
                      <BlogPostViewer post={response.post} />
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="m-0">
                    <pre className="p-3 text-xs font-mono overflow-auto max-h-[380px] custom-scrollbar text-emerald-300/90 whitespace-pre-wrap break-all rounded-lg bg-black/40 border border-white/10">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              ) : response?.error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-200">Error Occurred:</div>
                    <div className="mt-1">{response.error}</div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-2 mt-12">
                  <Code2 className="h-8 w-8 mx-auto text-slate-600" />
                  <p>Configure parameters on the left and click "Execute API Call" to test generation.</p>
                </div>
              )}
            </CardContent>
          </div>

          {response?.telemetry && (
            <CardFooter className="border-t border-white/10 py-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Provider: {response.telemetry.provider_used} ({response.telemetry.model})</span>
              <span>{(response.telemetry.latency_ms / 1000).toFixed(2)}s • {response.telemetry.total_tokens || 0} tokens</span>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
