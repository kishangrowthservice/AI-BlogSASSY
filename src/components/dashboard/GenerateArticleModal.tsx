"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateDashboardBlogAction } from "@/lib/serverActions";
import type { GeneratedBlogPost, GenerationTelemetry, GenerationLog } from "@/lib/types";

interface GenerateArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  onArticleGenerated: (post: GeneratedBlogPost, telemetry: GenerationTelemetry, newLog: GenerationLog) => void;
}

export function GenerateArticleModal({
  open,
  onOpenChange,
  siteId,
  onArticleGenerated,
}: GenerateArticleModalProps) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [wordCount, setWordCount] = useState(1200);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedBlogPost | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGenStep("Grounding in authentic Brand DNA...");

    const targetKeywords = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      setTimeout(() => {
        setGenStep("Structuring semantic H1-H3 outline...");
      }, 700);

      setTimeout(() => {
        setGenStep("Weaving canonical internal backlinks...");
      }, 1500);

      const res = await generateDashboardBlogAction(siteId, {
        topic: topic.trim(),
        keywords: targetKeywords.length > 0 ? targetKeywords : undefined,
        wordCount,
      });

      if (!res.success || !res.post) {
        throw new Error(res.error || "Generation failed. Please try again.");
      }

      setResult(res.post);

      const newLog: GenerationLog = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        site_id: siteId,
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

      onArticleGenerated(res.post, res.telemetry!, newLog);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
      setGenStep(null);
    }
  };

  const handleCopyHtml = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog animation completes
    setTimeout(() => {
      setResult(null);
      setError(null);
      setTopic("");
      setKeywords("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5">
              <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Autonomous Article Generation Studio
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate an in-depth, human-grade SEO post grounded in your Brand DNA and canonical internal links.
          </DialogDescription>
        </DialogHeader>

        {/* If result is ready, show preview */}
        {result ? (
          <div className="space-y-4 my-2 animate-in fade-in duration-300">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Article Generated &amp; Saved Successfully!</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                1 Credit Used
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-base font-bold text-foreground">{result.title}</div>
              <p className="text-xs text-muted-foreground italic">{result.metaDescription}</p>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-lg border border-border/70 bg-background/60 p-4 text-xs font-mono text-muted-foreground leading-relaxed">
              <div
                className="prose prose-invert prose-xs max-w-none font-sans text-foreground/90"
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
            </div>

            <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
                Done / Close
              </Button>

              <Button
                size="sm"
                onClick={handleCopyHtml}
                className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
              >
                {copiedHtml ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied Full HTML!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Clean HTML
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Article Topic or Headline <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. 10 High-Impact Ways Modern Businesses Scale Organic Traffic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                className="bg-background/80 text-xs"
              />
            </div>

            {/* Target Keywords */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Target SEO Keywords (Comma Separated)
              </label>
              <Input
                placeholder="e.g. organic traffic, b2b SEO, growth marketing"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isGenerating}
                className="bg-background/80 text-xs"
              />
            </div>

            {/* Target Word Count Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Word Count</label>
              <div className="grid grid-cols-4 gap-2">
                {[800, 1200, 1800, 2500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setWordCount(count)}
                    disabled={isGenerating}
                    className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      wordCount === count
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/70 bg-background/50 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    ~{count} words
                  </button>
                ))}
              </div>
            </div>

            {/* Live Generation Progress State */}
            {isGenerating && (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>{genStep || "Generating article with ultra-low latency Groq Llama 3.3..."}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Formatting headings, injecting canonical internal links, and verifying Google E-E-A-T structure.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isGenerating}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating Post...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Start Generation
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
