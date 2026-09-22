import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Code2,
  Terminal,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 selection:bg-primary/10">
      {/* Background subtle mesh effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Card */}
        <Card className="border-border/80 bg-card/60 shadow-xl backdrop-blur-2xl text-center p-6 sm:p-10 relative overflow-hidden">
          {/* Top Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-3.5 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>MULTI-TENANT ENGINE • DUAL LLM FAILOVER • SHADCN UI</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Autonomous AI Blog Generation Platform
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Centralized content generation gateway. Dynamic brand persona, canonical link injection,
            token-bucket burst protection, and asynchronous burst smoothing for multi-tenant SaaS clients.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button asChild size="lg" className="shadow-xs gap-2">
              <Link href="/admin">
                Admin Command Center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/preview">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Live Studio &amp; Preview
              </Link>
            </Button>
          </div>

          <Separator className="my-6 bg-border/60" />

          {/* Architecture Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
            <div className="rounded-lg border border-border/50 bg-background/40 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                Primary Engine
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="groq">Groq</Badge>
                <span className="text-sm font-semibold text-foreground">openai/gpt-oss-120b</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-background/40 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <Cpu className="h-3.5 w-3.5 text-blue-400" />
                Resilient Fallback
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="gemini">Gemini</Badge>
                <span className="text-sm font-semibold text-foreground">gemini-2.0-flash</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-background/40 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Noisy-Neighbor Capping
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">Active</Badge>
                <span className="text-sm font-semibold text-foreground">5 RPM Sliding Bucket</span>
              </div>
            </div>
          </div>
        </Card>

        {/* API Gateway Quick Spec Card */}
        <Card className="border-border/80 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">Gateway Integration Contract</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[11px]">
                POST /api/generate-blog
              </Badge>
            </div>
            <CardDescription>
              Universal REST endpoint consumable by Next.js, Vite, React, WordPress, or any backend client.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="relative rounded-lg bg-black/70 border border-border/60 p-4 font-mono text-xs text-sky-400 overflow-x-auto">
              <pre className="leading-relaxed">
{`curl -X POST https://api.growthservice.in/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_9a7b...4c21" \\
  -d '{
    "topic": "Why Performance SEO Outperforms Paid Ads in the Long Run",
    "keywords": ["organic SEO", "Core Web Vitals", "ROI"],
    "wordCount": 1000,
    "async": false
  }'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
