"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GenerationLog } from "@/lib/types";

interface ArticlesTabProps {
  logs: GenerationLog[];
  onOpenGenerateModal: () => void;
  onInspectLog: (log: GenerationLog) => void;
}

export function ArticlesTab({
  logs,
  onOpenGenerateModal,
  onInspectLog,
}: ArticlesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (log.title && log.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.meta_description && log.meta_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.suggested_tags && log.suggested_tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" && log.status === "success") ||
        (statusFilter === "failed" && log.status !== "success");

      return matchesSearch && matchesStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  const handleCopyHtml = (e: React.MouseEvent, log: GenerationLog) => {
    e.stopPropagation();
    if (log.content) {
      navigator.clipboard.writeText(log.content);
      if (log.id) {
        setCopiedId(log.id);
      } else {
        setCopiedId("copied");
      }
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            Content &amp; Article Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse, preview, and export all generated articles. Click any article to view formatted HTML and SEO tags.
          </p>
        </div>

        <Button
          onClick={onOpenGenerateModal}
          className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Generate New Article
        </Button>
      </div>

      {/* Filter & Search Bar Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by article title, keywords, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="flex items-center border border-border/70 rounded-lg p-0.5 bg-background/60 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setStatusFilter("success")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "success"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Published ({logs.filter((l) => l.status === "success").length})
              </button>
              <button
                onClick={() => setStatusFilter("failed")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "failed"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Failed ({logs.filter((l) => l.status !== "success").length})
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Articles Content Table */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-10 text-xs">Status</TableHead>
                  <TableHead className="text-xs">Article Title &amp; SEO Intent</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Tags &amp; Keywords</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Engine &amp; Telemetry</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Published Date</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, idx) => {
                  const isSuccess = log.status === "success";
                  const words = log.content ? log.content.split(/\s+/).length : "~1,200";

                  return (
                    <TableRow
                      key={log.id || idx}
                      onClick={() => onInspectLog(log)}
                      className="border-border/40 hover:bg-muted/40 cursor-pointer transition-colors group"
                    >
                      {/* Status Icon */}
                      <TableCell className="py-3.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full block ${
                            isSuccess ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-red-400"
                          }`}
                          title={isSuccess ? "Published Successfully" : "Generation Failed"}
                        />
                      </TableCell>

                      {/* Title & Description */}
                      <TableCell className="py-3.5 max-w-sm sm:max-w-md">
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {log.title || `Article #${idx + 1}`}
                        </div>
                        {log.meta_description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                            {log.meta_description}
                          </p>
                        )}
                      </TableCell>

                      {/* Suggested Tags */}
                      <TableCell className="py-3.5 hidden md:table-cell">
                        {log.suggested_tags && log.suggested_tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {log.suggested_tags.slice(0, 3).map((tag, tIdx) => (
                              <Badge
                                key={tIdx}
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground border-border/60"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {log.suggested_tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground self-center">
                                +{log.suggested_tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">None</span>
                        )}
                      </TableCell>

                      {/* Engine & Speed */}
                      <TableCell className="py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <Badge
                            variant="secondary"
                            className="text-[10px] text-indigo-300 bg-indigo-500/10 border-0"
                          >
                            {log.model ? log.model.split("/").pop() : "groq-70b"}
                          </Badge>
                          <span className="text-muted-foreground">
                            {log.latency_ms ? `${(log.latency_ms / 1000).toFixed(1)}s` : "< 2s"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 hidden sm:table-cell text-[11px] text-muted-foreground whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : "Recent"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onInspectLog(log)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="Preview Article"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>

                          {log.content && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleCopyHtml(e, log)}
                              className="h-7 px-2 text-xs border-border/70 hover:border-primary/50"
                              title="Copy HTML to clipboard"
                            >
                              {copiedId === log.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400 mr-1" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  <span>HTML</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No matching articles found" : "No articles published yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or clear your status filters."
                : "Generate your first human-grade SEO post with our interactive AI Studio."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onOpenGenerateModal}
                className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Generate First Article
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
