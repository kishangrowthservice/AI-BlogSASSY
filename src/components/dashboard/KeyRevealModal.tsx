"use client";

import React, { useState } from "react";
import {
  Key,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
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

interface KeyRevealModalProps {
  rawKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyRevealModal({
  rawKey,
  open,
  onOpenChange,
}: KeyRevealModalProps) {
  const [copied, setCopied] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [activeFormat, setActiveFormat] = useState<"raw" | "env" | "curl">("raw");

  if (!rawKey) return null;

  const getFormattedContent = () => {
    switch (activeFormat) {
      case "env":
        return `AI_BLOG_API_KEY=${rawKey}`;
      case "curl":
        return `-H "x-api-key: ${rawKey}"`;
      case "raw":
      default:
        return rawKey;
    }
  };

  const currentContent = getFormattedContent();
  const maskedContent = isMasked
    ? rawKey.startsWith("gs_live_")
      ? `gs_live_••••••••••••••••••••••••${rawKey.slice(-4)}`
      : `••••••••••••••••${rawKey.slice(-4)}`
    : currentContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-5 sm:p-7 border border-amber-500/25 bg-gradient-to-b from-card/98 via-card/95 to-background shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Key className="h-5 w-5 text-amber-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SECRET GENERATED
                </span>
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-0.5">
                  Secret Connection Key Generated
                </DialogTitle>
              </div>
            </div>
          </div>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Copy and store this cryptographic key securely in your environment variables or key vault. For your security, it will not be displayed in full again.
          </DialogDescription>
        </DialogHeader>

        {/* Format Selector Pills */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveFormat("raw")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeFormat === "raw"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Raw Token
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat("env")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeFormat === "env"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              .env Format
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat("curl")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeFormat === "curl"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              cURL Header
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
            title={isMasked ? "Reveal full key" : "Mask key for privacy"}
          >
            {isMasked ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reveal</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mask</span>
              </>
            )}
          </button>
        </div>

        {/* Key Display Card */}
        <div className="relative group rounded-xl border border-amber-500/25 bg-black/60 p-3.5 sm:p-4 shadow-inner transition-all hover:border-amber-500/40">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-xs sm:text-[13px] text-amber-300 break-all select-all leading-relaxed">
              {maskedContent}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2 font-mono">
            <span>Length: {rawKey.length} characters</span>
            <span className="text-emerald-400/90 font-sans font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> SHA-256 Hashed in Database
            </span>
          </div>
        </div>

        {/* Security Warning Callout */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/90 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <span className="leading-snug">
            Never commit this key to public Git repositories. If you ever lose or expose it, you can instantly revoke and regenerate a replacement token directly from this tab.
          </span>
        </div>

        {/* Responsive Dialog Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 rounded-xl border-border/70 hover:bg-muted/60"
          >
            I&apos;ve Saved My Key
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className={`text-xs h-9 font-semibold gap-1.5 rounded-xl transition-all shadow-md ${
              copied
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-200" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Secret Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
