"use client";

import React, { useState } from "react";
import {
  List,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  Bot,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Code2,
  FileText,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPostViewer } from "@/components/BlogPostViewer";
import type { GenerationLog, GeneratedBlogPost } from "@/lib/types";

export function RequestLogsTab({ logs }: { logs: GenerationLog[] }) {
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  };

  const getStatusBadge = (status: string, fallback: boolean) => {
    if (status === "success") {
      if (fallback) {
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 gap-1 rounded-sm text-[11px]">
            <AlertCircle className="h-3 w-3" /> Fallback
          </Badge>
        );
      }
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 gap-1 rounded-sm text-[11px]">
          <CheckCircle2 className="h-3 w-3" /> 200 OK
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 gap-1 rounded-sm text-[11px]">
        <XCircle className="h-3 w-3" /> 500 Error
      </Badge>
    );
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const selectedPost: GeneratedBlogPost | null =
    selectedLog && selectedLog.status === "success"
      ? {
          title: selectedLog.title || "Untitled Generated Article",
          metaDescription: selectedLog.meta_description || "",
          content: selectedLog.content || "<p>No content recorded.</p>",
          suggestedTags: selectedLog.suggested_tags || [],
        }
      : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <List className="h-6 w-6 text-indigo-400" />
          Request Logs &amp; Generation History
        </h1>
        <p className="text-sm text-muted-foreground">
          Historical record of your API generation requests with full article preview and latency diagnostics.
        </p>
      </div>

      <div className="bg-card/40 border border-border/60 rounded-xl backdrop-blur-xl overflow-hidden flex flex-col shadow-sm">
        {/* Table Header with Responsive Visibility */}
        <div className="grid grid-cols-12 gap-2 sm:gap-4 p-4 border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-3">Timestamp</div>
          <div className="col-span-4 sm:col-span-2">Status</div>
          <div className="col-span-3 sm:col-span-3">Model</div>
          <div className="hidden sm:block sm:col-span-2">Latency</div>
          <div className="hidden md:block md:col-span-1">Tokens</div>
          <div className="hidden sm:block sm:col-span-1 text-right">View</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/40 overflow-y-auto max-h-[600px] custom-scrollbar">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground space-y-2">
              <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="font-semibold text-foreground">No API requests recorded yet</p>
              <p className="text-xs">Trigger an article via the API Playground or your secret API key to populate logs.</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={log.id || i}
                onClick={() => setSelectedLog(log)}
                className="grid grid-cols-12 gap-2 sm:gap-4 p-4 items-center hover:bg-muted/30 cursor-pointer transition-colors text-xs sm:text-sm group"
              >
                {/* Timestamp */}
                <div className="col-span-5 sm:col-span-3 text-muted-foreground font-mono text-[11px] sm:text-xs truncate">
                  {formatDate(log.created_at)}
                </div>

                {/* Status */}
                <div className="col-span-4 sm:col-span-2 flex items-center">
                  {getStatusBadge(log.status, log.fallback_triggered)}
                </div>

                {/* Model */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5 truncate">
                  {log.provider_used === "groq" ? (
                    <Bot className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  ) : log.provider_used === "gemini" ? (
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full bg-muted shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px] sm:text-xs" title={log.model}>
                    {log.model?.replace("openai/", "").replace("google/", "") || "Default"}
                  </span>
                </div>

                {/* Latency */}
                <div className="hidden sm:flex sm:col-span-2 font-mono text-xs text-muted-foreground items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground/70" />
                  <span>{(log.latency_ms / 1000).toFixed(2)}s</span>
                </div>

                {/* Tokens */}
                <div className="hidden md:block md:col-span-1 font-mono text-xs text-muted-foreground truncate">
                  {log.total_tokens ? log.total_tokens.toLocaleString() : "--"}
                </div>

                {/* Action arrow */}
                <div className="hidden sm:flex sm:col-span-1 text-right justify-end">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative bg-card border border-border/70 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-foreground">Generation Request Inspection</h2>
                {getStatusBadge(selectedLog.status, selectedLog.fallback_triggered)}
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 border-b border-border/50 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Timestamp</div>
                <div className="font-mono text-foreground font-medium mt-0.5">{formatDate(selectedLog.created_at)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Engine &amp; Model</div>
                <div className="font-mono text-foreground font-medium mt-0.5 truncate">{selectedLog.model}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Latency</div>
                <div className="font-mono text-foreground font-medium mt-0.5">{(selectedLog.latency_ms / 1000).toFixed(2)}s</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tokens (P/C)</div>
                <div className="font-mono text-foreground font-medium mt-0.5">
                  {selectedLog.prompt_tokens || 0} / {selectedLog.completion_tokens || 0}
                </div>
              </div>
            </div>

            {/* Content Area with Multi-Tab Viewer */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {selectedLog.error_message && (
                <div className="bg-rose-500/10 text-rose-300 border border-rose-500/20 p-3.5 rounded-xl text-xs font-mono break-all flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-200">Execution Error:</div>
                    <div className="mt-1">{selectedLog.error_message}</div>
                  </div>
                </div>
              )}

              {selectedPost ? (
                <Tabs defaultValue="preview" className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <TabsList className="bg-muted/40 h-8 p-0.5">
                      <TabsTrigger value="preview" className="text-xs gap-1.5 h-7">
                        <Eye className="h-3.5 w-3.5" />
                        Article Preview
                      </TabsTrigger>
                      <TabsTrigger value="html" className="text-xs gap-1.5 h-7">
                        <Code2 className="h-3.5 w-3.5" />
                        HTML Output
                      </TabsTrigger>
                      <TabsTrigger value="json" className="text-xs gap-1.5 h-7">
                        <FileText className="h-3.5 w-3.5" />
                        Full JSON
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(selectedPost.content, "html")}
                        className="h-7 text-xs gap-1.5"
                      >
                        {copiedType === "html" ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied HTML</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy HTML</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Tab 1: Rendered Post View */}
                  <TabsContent value="preview" className="pt-4">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4 sm:p-6 shadow-inner">
                      <BlogPostViewer post={selectedPost} />
                    </div>
                  </TabsContent>

                  {/* Tab 2: HTML Source Code View */}
                  <TabsContent value="html" className="pt-4">
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-[#0f111a] border border-border/70 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[400px] leading-relaxed whitespace-pre-wrap break-all">
                        {selectedPost.content}
                      </pre>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Complete Payload JSON View */}
                  <TabsContent value="json" className="pt-4">
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-[#0f111a] border border-border/70 text-indigo-300 font-mono text-xs overflow-x-auto max-h-[400px]">
                        {JSON.stringify(
                          {
                            post: selectedPost,
                            telemetry: {
                              provider_used: selectedLog.provider_used,
                              model: selectedLog.model,
                              prompt_tokens: selectedLog.prompt_tokens,
                              completion_tokens: selectedLog.completion_tokens,
                              total_tokens: selectedLog.total_tokens,
                              latency_ms: selectedLog.latency_ms,
                              fallback_triggered: selectedLog.fallback_triggered,
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="rounded-xl border border-border/60 bg-background/60 p-6 text-center text-xs text-muted-foreground">
                  No blog content payload generated for this request.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
