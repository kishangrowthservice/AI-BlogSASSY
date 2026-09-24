"use client";

import React, { useState } from "react";
import {
  Key,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
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

  if (!rawKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-md p-6">
        <DialogHeader>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
            <Key className="h-5 w-5 text-amber-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Secret Connection Key Generated
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Copy and store this secret key securely. For your security, it will not be displayed in full again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 font-mono text-xs text-amber-300 break-all select-all shadow-inner">
            {rawKey}
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              If you ever lose or expose this key, you can regenerate a new secret token anytime directly from the API &amp; Developers tab.
            </span>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            I Saved It
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Copied Key!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Secret Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
