"use client";

import React, { useState } from "react";
import {
  Key,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SafeSiteProfile } from "@/lib/sanitize";

interface DeveloperTabProps {
  profile: SafeSiteProfile;
  keyPrefix: string | null;
  apiOrigin: string;
  onGenerateKey: () => void;
  isGeneratingKey: boolean;
}

export function DeveloperTab({
  profile,
  keyPrefix,
  apiOrigin,
  onGenerateKey,
  isGeneratingKey,
}: DeveloperTabProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const activeKeySample = keyPrefix ? `${keyPrefix}••••••••••••••••••••••••` : "ak_live_your_secret_api_key";

  const curlSnippet = `curl -X POST "${apiOrigin}/api/generate-blog" \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "10 High-Impact Ways Modern Businesses Scale Organic Traffic",
    "targetKeywords": ["SEO growth", "content marketing", "b2b pipeline"],
    "wordCount": 1200,
    "sync": true
  }'`;

  const nodeSnippet = `import { BlogClient } from "@growthservice/blog-client";

const client = new BlogClient({
  apiKey: "${activeKeySample}",
  endpoint: "${apiOrigin}"
});

// Publishes SEO blog directly
const post = await client.generateBlog({
  topic: "10 High-Impact Ways Modern Businesses Scale Organic Traffic",
  targetKeywords: ["SEO growth", "content marketing"],
  wordCount: 1200
});

console.log("Published Title:", post.title);
console.log("Meta Description:", post.metaDescription);`;

  const pythonSnippet = `import requests

url = "${apiOrigin}/api/generate-blog"
headers = {
    "Authorization": "Bearer ${activeKeySample}",
    "Content-Type": "application/json"
}
payload = {
    "topic": "10 High-Impact Ways Modern Businesses Scale Organic Traffic",
    "targetKeywords": ["SEO growth", "content marketing"],
    "wordCount": 1200,
    "sync": True
}

response = requests.post(url, json=payload, headers=headers)
post = response.json()
print("Generated Article:", post["title"])`;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Key className="h-6 w-6 text-amber-400" />
            API Keys &amp; Developer Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Programmatically trigger article generation from your backend, CI/CD pipelines, or custom integrations.
          </p>
        </div>
      </div>

      {/* Website Connection Key Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Website Secret Connection Key</CardTitle>
                <CardDescription className="text-xs">
                  Authenticates generation requests and signs outgoing webhook payloads.
                </CardDescription>
              </div>
            </div>

            <Badge
              variant={keyPrefix ? "outline" : "secondary"}
              className={`text-xs ${
                keyPrefix
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                  : "text-muted-foreground"
              }`}
            >
              {keyPrefix ? "Key Active" : "No Key Generated"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {keyPrefix ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{keyPrefix}••••••••••••••••••••••••</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                  SHA-256 HASHED
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                For security, raw keys are never stored on the server. If you need a new secret credential, click regenerate below (replaces previous key immediately).
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center space-y-2">
              <Key className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <h4 className="text-xs font-semibold text-foreground">No Connection Key Generated Yet</h4>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                Generate your secret connection token to connect your CMS, plugin, or backend pipelines.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted with timing-safe constant hashing</span>
          </div>

          <Button
            size="sm"
            onClick={onGenerateKey}
            disabled={isGeneratingKey}
            className="text-xs font-semibold gap-1.5"
          >
            {isGeneratingKey ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : keyPrefix ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate Secret Key
              </>
            ) : (
              <>
                <Key className="h-3.5 w-3.5" />
                Generate Connection Key
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Interactive Code Playground Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-400" />
              <div>
                <CardTitle className="text-base font-bold">API Generation Endpoint</CardTitle>
                <CardDescription className="text-xs font-mono text-indigo-300">
                  POST {apiOrigin}/api/generate-blog
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <Tabs defaultValue="curl" className="w-full">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <TabsList className="bg-muted/40 h-8 p-0.5">
                <TabsTrigger value="curl" className="text-xs font-mono h-7 px-3">
                  cURL
                </TabsTrigger>
                <TabsTrigger value="node" className="text-xs font-mono h-7 px-3">
                  Node.js SDK
                </TabsTrigger>
                <TabsTrigger value="python" className="text-xs font-mono h-7 px-3">
                  Python
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="curl" className="pt-3">
              <div className="relative rounded-xl border border-border/70 bg-black/80 p-4 font-mono text-xs overflow-x-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(curlSnippet, "curl")}
                  className="absolute top-3 right-3 h-7 text-xs border-border/60 bg-muted/20"
                >
                  {copiedSnippet === "curl" ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </Button>
                <pre className="text-sky-300 leading-relaxed pr-24">{curlSnippet}</pre>
              </div>
            </TabsContent>

            <TabsContent value="node" className="pt-3">
              <div className="relative rounded-xl border border-border/70 bg-black/80 p-4 font-mono text-xs overflow-x-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(nodeSnippet, "node")}
                  className="absolute top-3 right-3 h-7 text-xs border-border/60 bg-muted/20"
                >
                  {copiedSnippet === "node" ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      <span>Copy Code</span>
                    </>
                  )}
                </Button>
                <pre className="text-emerald-300 leading-relaxed pr-24">{nodeSnippet}</pre>
              </div>
            </TabsContent>

            <TabsContent value="python" className="pt-3">
              <div className="relative rounded-xl border border-border/70 bg-black/80 p-4 font-mono text-xs overflow-x-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(pythonSnippet, "python")}
                  className="absolute top-3 right-3 h-7 text-xs border-border/60 bg-muted/20"
                >
                  {copiedSnippet === "python" ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      <span>Copy Python</span>
                    </>
                  )}
                </Button>
                <pre className="text-amber-300 leading-relaxed pr-24">{pythonSnippet}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
