"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Eye,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GenerationLog } from "@/lib/types";

interface ArticlePreviewModalProps {
  log: GenerationLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticlePreviewModal({
  log,
  open,
  onOpenChange,
}: ArticlePreviewModalProps) {
  const [copiedType, setCopiedType] = useState<"html" | "meta" | "title" | null>(null);

  if (!log) return null;

  const handleCopy = (text: string, type: "html" | "meta" | "title") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-3xl p-6 max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  log.status === "success" ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {log.model ? log.model.split("/").pop() : "groq-70b"}
              </Badge>
              {log.latency_ms ? (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {(log.latency_ms / 1000).toFixed(1)}s generation
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(log.title || "Article", "title")}
                className="h-7 text-xs border-border/70"
              >
                {copiedType === "title" ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-400" />
                    <span>Copied Title</span>
                  </>
                ) : (
                  <span>Copy Title</span>
                )}
              </Button>

              {log.meta_description && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(log.meta_description!, "meta")}
                  className="h-7 text-xs border-border/70"
                >
                  {copiedType === "meta" ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-400" />
                      <span>Copied Meta</span>
                    </>
                  ) : (
                    <span>Copy Meta</span>
                  )}
                </Button>
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground leading-snug">
            {log.title || "Generated Article"}
          </DialogTitle>

          {log.meta_description && (
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              <span className="font-semibold text-foreground/80">Meta Description: </span>
              {log.meta_description}
            </DialogDescription>
          )}

          {/* Tags */}
          {log.suggested_tags && log.suggested_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {log.suggested_tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] py-0 px-2 font-mono text-indigo-300 bg-indigo-500/10"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Content Body with Tabs: Visual HTML vs Raw Code */}
        <div className="flex-1 overflow-hidden my-3">
          <Tabs defaultValue="visual" className="h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 shrink-0">
              <TabsList className="bg-muted/40 h-8 p-0.5">
                <TabsTrigger value="visual" className="text-xs font-medium h-7 px-3">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Formatted Preview
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs font-medium h-7 px-3">
                  <Code2 className="h-3.5 w-3.5 mr-1.5" />
                  Raw Semantic HTML
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="visual"
              className="flex-1 overflow-y-auto rounded-xl border border-border/70 bg-background/60 p-5 mt-2 text-foreground/90 leading-relaxed text-xs sm:text-sm"
            >
              {log.content ? (
                <div
                  className="prose prose-invert prose-indigo max-w-none text-foreground/90 space-y-4"
                  dangerouslySetInnerHTML={{ __html: log.content }}
                />
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Content preview is not available for this record.
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="raw"
              className="flex-1 overflow-y-auto rounded-xl border border-border/70 bg-black/80 p-4 mt-2 font-mono text-xs text-emerald-300 leading-relaxed"
            >
              <pre className="whitespace-pre-wrap select-all">{log.content || "<!-- No content -->"}</pre>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 shrink-0 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>

          {log.content && (
            <Button
              size="sm"
              onClick={() => handleCopy(log.content!, "html")}
              className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            >
              {copiedType === "html" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied Full HTML!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Full HTML
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
