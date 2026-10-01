"use client";

import React from "react";
import { BookOpen, Copy, Check, Terminal, Code2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ApiDocsTab({ apiOrigin }: { apiOrigin: string }) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [copiedBody, setCopiedBody] = React.useState(false);

  const endpointUrl = `${apiOrigin}/api/generate-blog`;
  const sampleBody = `{
  "topic": "Future of Artificial Intelligence",
  "wordCount": 800,
  "sync": true
}`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-400" />
          API Documentation
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl">
          Integrate AI blog generation directly into your application. Use this REST API to automatically write SEO-optimized content.
        </p>
      </div>

      {/* Authentication */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          Authentication
        </h2>
        <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Authenticate your requests by including your secret API key in the header. Do not share your API key in publicly accessible areas such as client-side code.
            </p>
            <div className="bg-background/80 p-4 rounded-lg border border-border/60 font-mono text-sm text-amber-200">
              x-api-key: gs_live_your_secret_key_here
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Endpoint */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Code2 className="h-5 w-5 text-indigo-400" />
          Generate Content Endpoint
        </h2>
        
        <Card className="bg-card/40 border-border/60 backdrop-blur-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 px-2 py-1 text-sm rounded">
                POST
              </Badge>
              <code className="text-sm font-mono text-foreground">{endpointUrl}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-8 text-muted-foreground"
                onClick={() => copyToClipboard(endpointUrl, setCopiedUrl)}
              >
                {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {/* Request Body parameters */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Request Body Parameters</h3>
              <div className="border border-border/60 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/60">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Parameter</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr className="bg-background/40">
                      <td className="px-4 py-3 font-mono text-indigo-300">topic <span className="text-rose-400 ml-1">*</span></td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">string</td>
                      <td className="px-4 py-3 text-muted-foreground">The subject matter of the blog post.</td>
                    </tr>
                    <tr className="bg-background/40">
                      <td className="px-4 py-3 font-mono text-indigo-300">wordCount</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">number</td>
                      <td className="px-4 py-3 text-muted-foreground">Approximate length. Default is 500.</td>
                    </tr>
                    <tr className="bg-background/40">
                      <td className="px-4 py-3 font-mono text-indigo-300">sync</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">boolean</td>
                      <td className="px-4 py-3 text-muted-foreground">If true, waits for generation to complete (up to 30s). If false, adds to background queue. Default is false.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example Request */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Example Request</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-muted-foreground"
                  onClick={() => copyToClipboard(sampleBody, setCopiedBody)}
                >
                  {copiedBody ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-[#0f111a] p-4 rounded-lg border border-border/60 font-mono text-sm text-emerald-400/90 overflow-x-auto">
                {sampleBody}
              </pre>
            </div>
            
            {/* Example Response */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Response Format</h3>
              <pre className="bg-[#0f111a] p-4 rounded-lg border border-border/60 font-mono text-sm text-indigo-300/90 overflow-x-auto">
{`{
  "post": {
    "title": "The Future of AI",
    "metaDescription": "Explore how artificial intelligence...",
    "content": "<h2>Introduction</h2><p>...",
    "suggestedTags": ["AI", "Technology", "Future"]
  },
  "telemetry": {
    "provider_used": "groq",
    "model": "llama-3.1-70b-versatile",
    "latency_ms": 1240,
    "total_tokens": 850
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
