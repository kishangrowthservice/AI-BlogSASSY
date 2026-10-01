"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, Code2, Copy, Check, Key } from "lucide-react";
import type { SafeSiteProfile } from "@/lib/sanitize";

export function ApiPlaygroundTab({ 
  profile, 
  apiOrigin,
  keyPrefix 
}: { 
  profile: SafeSiteProfile; 
  apiOrigin: string;
  keyPrefix: string | null;
}) {
  const [topic, setTopic] = useState("AI in Modern Development");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  
  const handleTestCall = async () => {
    if (!apiKey.trim()) {
      setResponse({ error: "Please enter your API Key to test the endpoint." });
      setStatusCode(401);
      return;
    }

    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    
    try {
      const payload = {
        topic,
        wordCount: 500,
        sync: true, // test synchronous API
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
      setResponse({ error: err.message || "Network Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Code2 className="h-6 w-6 text-indigo-400" />
          API Playground
        </h1>
        <p className="text-sm text-muted-foreground">
          Test your content generation API directly from the browser. This will make a real request and consume your quota.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Request parameters</CardTitle>
            <CardDescription>Configure the payload for /api/generate-blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Endpoint</label>
              <div className="p-2.5 bg-muted/30 border border-border/50 rounded-md text-xs font-mono text-indigo-300">
                POST {apiOrigin}/api/generate-blog
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-2">
                <Key className="h-3 w-3" /> API Key (Required)
              </label>
              <Input 
                type="password"
                placeholder={keyPrefix ? `${keyPrefix}... (Paste your generated key here)` : "gs_live_..."}
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)}
                className="bg-background/50 border-border/60 font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Topic</label>
              <Input 
                value={topic} 
                onChange={e => setTopic(e.target.value)}
                className="bg-background/50 border-border/60 font-mono text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Request Body (JSON)</label>
              <Textarea 
                value={JSON.stringify({ topic, wordCount: 500, sync: true }, null, 2)}
                readOnly
                className="h-32 font-mono text-xs bg-muted/20 border-border/60 resize-none text-emerald-400/80"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestCall} disabled={loading} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Send Test Request
            </Button>
          </CardFooter>
        </Card>

        {/* Response Panel */}
        <Card className="border-border/60 bg-[#0f111a] text-slate-300">
          <CardHeader className="border-b border-white/10 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg text-slate-100">Response</CardTitle>
                <CardDescription className="text-slate-400">JSON output from the API</CardDescription>
              </div>
              {statusCode && (
                <span className={`text-xs font-mono px-2 py-1 rounded ${statusCode >= 200 && statusCode < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {statusCode}
                </span>
              )}
            </div>
            {response && (
              <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8 text-slate-400 hover:text-white">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-[#0f111a]/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
              </div>
            )}
            <pre className="p-4 text-xs font-mono overflow-auto h-[350px] custom-scrollbar text-amber-200/90 whitespace-pre-wrap break-all">
              {response ? JSON.stringify(response, null, 2) : "// Enter your API key and click Send Test Request"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
