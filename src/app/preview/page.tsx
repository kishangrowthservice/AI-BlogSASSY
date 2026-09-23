"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPostViewer } from "@/components/BlogPostViewer";
import type { GeneratedBlogPost } from "@/lib/types";
import { defaultBrandConfig } from "@/theme/brand.config";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Check,
  Clock,
  Code2,
  Copy,
  Eye,
  FileCode,
  Sparkles,
  Zap,
  AlertCircle,
} from "lucide-react";

export default function PreviewPlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [topic, setTopic] = useState("Why Performance SEO Outperforms Paid Ads in the Long Run");
  const [keywords, setKeywords] = useState("performance SEO, organic search ROI, Core Web Vitals");
  const [wordCount, setWordCount] = useState(800);
  const [isAsync, setIsAsync] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<GeneratedBlogPost | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQueueStatus(null);

    try {
      const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywordList,
          wordCount: Number(wordCount),
          async: isAsync,
        }),
      });

      const data = await res.json();

      if (res.status === 202) {
        // Async queue mode: Poll until completion
        setQueueStatus(`Job enqueued (${data.jobId.slice(0, 8)}...). Polling queue...`);
        let completed = false;
        const startTime = Date.now();

        while (!completed && Date.now() - startTime < 60000) {
          await new Promise((r) => setTimeout(r, 1500));
          const checkRes = await fetch(`/api/generate-blog/queue/${data.jobId}`, {
            headers: { "x-api-key": apiKey.trim() },
          });

          if (!checkRes.ok) {
            throw new Error(`Queue check failed: HTTP ${checkRes.status}`);
          }

          const job = await checkRes.json();
          if (job.status === "completed" && job.result) {
            setPost(job.result);
            setQueueStatus(null);
            completed = true;
          } else if (job.status === "failed") {
            throw new Error(job.error_message || "Async background generation job failed");
          } else {
            setQueueStatus(`Job status: ${job.status.toUpperCase()} (attempt ${job.attempts})...`);
          }
        }

        if (!completed) {
          throw new Error("Async job polling timed out after 60 seconds.");
        }
      } else if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to generate post`);
      } else {
        setPost(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setQueueStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const copyHtml = () => {
    if (!post) return;
    navigator.clipboard.writeText(post.content);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const copyJson = () => {
    if (!post) return;
    navigator.clipboard.writeText(JSON.stringify(post, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard">
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/">
                Home
              </Link>
            </Button>
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <span className="text-sm font-bold tracking-tight hidden sm:inline">Generation Studio &amp; Theme Preview</span>
          </div>

          {post && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyHtml} className="text-xs gap-1.5">
                {copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={copyJson} className="text-xs gap-1.5">
                {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileCode className="h-3.5 w-3.5" />}
                Copy JSON
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Controls */}
        <div className="lg:col-span-4">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generation Controls
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Engine Ready
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Trigger synchronous generation or asynchronous burst smoothing.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tenant x-api-key *</label>
                  <Input
                    type="password"
                    required
                    placeholder="gs_live_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Obtain your secret key from the Admin Dashboard.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Article Topic *</label>
                  <Textarea
                    required
                    rows={2}
                    placeholder="e.g. Scaling Next.js with Multi-Tenant Architecture"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">SEO Target Keywords</label>
                  <Input
                    type="text"
                    placeholder="comma-separated"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <label className="font-medium">Target Word Count</label>
                    <span className="font-mono text-foreground font-semibold">{wordCount} words</span>
                  </div>
                  <Input
                    type="number"
                    min={200}
                    max={3000}
                    step={100}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                  />
                </div>

                {/* Async Queue Switch */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-400" />
                      Async Queue Mode
                    </div>
                    <div className="text-[11px] text-muted-foreground">Smooth bursts with background queue (§8)</div>
                  </div>
                  <Switch checked={isAsync} onCheckedChange={setIsAsync} />
                </div>

                {/* Polling status banner */}
                {queueStatus && (
                  <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{queueStatus}</span>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full shadow-md">
                  {loading
                    ? isAsync
                      ? "Queueing & Polling..."
                      : "Generating Post..."
                    : isAsync
                    ? "Enqueue & Await Post (202)"
                    : "Generate Synchronous Post"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output Studio */}
        <div className="lg:col-span-8">
          <Card className="border-border/70 bg-card/60 backdrop-blur-xl min-h-[600px] flex flex-col">
            <Tabs defaultValue="visual" className="w-full flex-1 flex flex-col">
              <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border/60">
                <TabsList className="h-9">
                  <TabsTrigger value="visual" className="text-xs gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Visual Article View
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="text-xs gap-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    Raw JSON Contract
                  </TabsTrigger>
                </TabsList>

                {post && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {post.suggestedTags?.length || 0} Tags • Ready to Publish
                  </Badge>
                )}
              </div>

              <CardContent className="flex-1 p-6">
                {!post ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted/40 border border-border flex items-center justify-center text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="text-base font-semibold text-foreground">No Article Generated Yet</div>
                    <p className="text-xs max-w-sm text-muted-foreground leading-relaxed">
                      Enter your tenant API key and topic on the left to trigger the engine and inspect the rendered HTML or raw JSON contract.
                    </p>
                  </div>
                ) : (
                  <>
                    <TabsContent value="visual" className="m-0">
                      <BlogPostViewer post={post} brand={defaultBrandConfig} />
                    </TabsContent>

                    <TabsContent value="raw" className="m-0">
                      <div className="relative rounded-lg bg-black/80 border border-border p-4 font-mono text-xs text-sky-400 overflow-x-auto max-h-[600px]">
                        <pre>{JSON.stringify(post, null, 2)}</pre>
                      </div>
                    </TabsContent>
                  </>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}
