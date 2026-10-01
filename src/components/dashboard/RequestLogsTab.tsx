"use client";

import React, { useState } from "react";
import { List, CheckCircle2, XCircle, Clock, ChevronRight, X, Bot, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GenerationLog } from "@/lib/types";

export function RequestLogsTab({ logs }: { logs: GenerationLog[] }) {
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(d);
  };

  const getStatusBadge = (status: string, fallback: boolean) => {
    if (status === "success") {
      if (fallback) {
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 gap-1 rounded-sm">
            <AlertCircle className="h-3 w-3" /> Fallback
          </Badge>
        );
      }
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 gap-1 rounded-sm">
          <CheckCircle2 className="h-3 w-3" /> 200 OK
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 gap-1 rounded-sm">
        <XCircle className="h-3 w-3" /> 500 Error
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <List className="h-6 w-6 text-indigo-400" />
          Request Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Historical record of your API requests for debugging and monitoring.
        </p>
      </div>

      <div className="bg-card/40 border border-border/60 rounded-xl backdrop-blur-xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Model</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Tokens</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/40 overflow-y-auto max-h-[600px] custom-scrollbar">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No API requests found in your history yet.
            </div>
          ) : (
            logs.map((log, i) => (
              <div 
                key={log.id || i}
                onClick={() => setSelectedLog(log)}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 cursor-pointer transition-colors text-sm group"
              >
                <div className="col-span-3 text-muted-foreground font-mono text-xs">
                  {formatDate(log.created_at)}
                </div>
                <div className="col-span-2 flex items-center">
                  {getStatusBadge(log.status, log.fallback_triggered)}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {log.provider_used === "groq" ? (
                    <Bot className="h-4 w-4 text-orange-500" />
                  ) : log.provider_used === "gemini" ? (
                    <Sparkles className="h-4 w-4 text-blue-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-muted" />
                  )}
                  <span className="truncate max-w-[100px]" title={log.model}>{log.model}</span>
                </div>
                <div className="col-span-2 font-mono text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {(log.latency_ms / 1000).toFixed(2)}s
                </div>
                <div className="col-span-2 font-mono text-xs text-muted-foreground">
                  {log.total_tokens ? log.total_tokens.toLocaleString() : "--"}
                </div>
                <div className="col-span-1 text-right flex justify-end">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Detail Modal (Simple Overlay) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-card border border-border/60 rounded-xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">Request Details</h2>
                {getStatusBadge(selectedLog.status, selectedLog.fallback_triggered)}
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-lg border border-border/40">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Timestamp</div>
                  <div className="text-sm font-mono">{formatDate(selectedLog.created_at)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Model</div>
                  <div className="text-sm">{selectedLog.model}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Duration</div>
                  <div className="text-sm font-mono">{(selectedLog.latency_ms / 1000).toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Tokens</div>
                  <div className="text-sm font-mono">{selectedLog.total_tokens || 0}</div>
                </div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Error Message</h3>
                  <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-3 rounded-lg text-sm font-mono break-all">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Response JSON</h3>
                <div className="bg-[#0f111a] border border-border/60 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-indigo-300">
{JSON.stringify({
  post: selectedLog.status === "success" ? {
    title: selectedLog.title,
    metaDescription: selectedLog.meta_description,
    content: selectedLog.content ? selectedLog.content.substring(0, 150) + "..." : null,
    suggestedTags: selectedLog.suggested_tags
  } : null,
  telemetry: {
    provider_used: selectedLog.provider_used,
    model: selectedLog.model,
    prompt_tokens: selectedLog.prompt_tokens,
    completion_tokens: selectedLog.completion_tokens,
    total_tokens: selectedLog.total_tokens,
    latency_ms: selectedLog.latency_ms,
    fallback_triggered: selectedLog.fallback_triggered
  }
}, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
