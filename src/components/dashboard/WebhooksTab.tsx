"use client";

import React, { useState } from "react";
import { Webhook, Save, Globe, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWebhookUrlAction } from "@/lib/serverActions";
import type { SafeSiteProfile } from "@/lib/sanitize";

export function WebhooksTab({ profile }: { profile: SafeSiteProfile }) {
  const [webhookUrl, setWebhookUrl] = useState(profile.webhook_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [copiedPayload, setCopiedPayload] = useState(false);

  const sampleWebhookPayload = `{
  "event": "generation.completed",
  "site_id": "${profile.id}",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "title": "The Future of AI",
    "metaDescription": "Explore how artificial intelligence...",
    "content": "<h2>Introduction</h2><p>...",
    "suggestedTags": ["AI", "Technology", "Future"]
  },
  "telemetry": {
    "provider_used": "groq",
    "latency_ms": 1240,
    "total_tokens": 850
  }
}`;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      // Basic URL validation
      if (webhookUrl && !webhookUrl.startsWith("http")) {
        setSaveStatus("error");
        setIsSaving(false);
        return;
      }

      const success = await updateWebhookUrlAction(profile.id, webhookUrl || null);
      if (success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleWebhookPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Webhook className="h-6 w-6 text-fuchsia-400" />
          Webhooks
        </h1>
        <p className="text-sm text-muted-foreground">
          Receive real-time HTTP HTTP POST notifications when your async background generations complete.
        </p>
      </div>

      <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-indigo-400" />
            Endpoint Configuration
          </CardTitle>
          <CardDescription>
            We will send a POST request to this URL every time an asynchronous API request finishes successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Webhook Endpoint URL</label>
            <Input 
              placeholder="https://your-server.com/api/webhooks/blog"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="bg-background/50 border-border/60 font-mono text-sm h-11"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be a valid HTTPS URL. Leave blank to disable webhooks.
            </p>
          </div>

          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              Webhook configuration saved successfully.
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              Failed to save webhook URL. Please ensure it is a valid HTTP/HTTPS URL.
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/10 border-t border-border/40 py-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
          >
            {isSaving ? "Saving..." : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Endpoint
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Event Payload</CardTitle>
              <CardDescription>
                This is the JSON body that will be sent via POST to your endpoint when an event triggers.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 border-border/60">
              {copiedPayload ? (
                <span className="flex items-center gap-2 text-emerald-400"><Check className="h-4 w-4" /> Copied</span>
              ) : (
                <span className="flex items-center gap-2"><Copy className="h-4 w-4" /> Copy JSON</span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-[#0f111a] p-4 rounded-lg border border-border/60 font-mono text-xs md:text-sm text-indigo-300/90 overflow-x-auto">
            <pre>
              {sampleWebhookPayload}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
