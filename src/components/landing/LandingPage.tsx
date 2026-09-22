"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Check,
  Copy,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Lock,
  RefreshCw,
  Server,
  Clock,
  Globe,
  Database,
  Sliders,
  ChevronRight,
  Workflow,
  ShieldAlert,
} from "lucide-react";

export function LandingPage() {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const curlCode = `curl -X POST https://api.growthservice.in/api/generate-blog \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: gs_live_9a7b...4c21" \\
  -d '{
    "topic": "Why High-Concurrency Headless Architectures Win in 2026",
    "keywords": ["distributed systems", "edge compute", "latency"],
    "wordCount": 1200,
    "async": false
  }'`;

  const sdkCode = `import { BlogClient } from "@growthservice/blog-client";

const client = new BlogClient({
  apiKey: process.env.BLOG_API_KEY!,
  endpoint: "https://api.growthservice.in"
});

// Generate SEO-grade blog in <800ms
const post = await client.generateBlog({
  topic: "Next.js 15 Serverless Optimization",
  keywords: ["SSR", "Next.js 15", "Caching"],
  wordCount: 1500
});

console.log(post.title, post.content);`;

  const handleCopy = (text: string, type: "curl" | "sdk") => {
    navigator.clipboard.writeText(text);
    if (type === "curl") {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedSdk(true);
      setTimeout(() => setCopiedSdk(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Background Animated Glow Meshes */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -50, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[-10%] w-[550px] h-[450px] bg-blue-600/20 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Modern SaaS Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-base leading-none">
                AI Blog SaaS
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                GROWTH ENGINE • 10K READY
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Interactive Demo
            </a>
            <a href="#benchmarks" className="hover:text-foreground transition-colors">
              Benchmarks
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          {/* Actions & Health Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>Cluster 99.99%</span>
            </div>

            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              <Link href="/preview">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                Studio
              </Link>
            </Button>

            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium text-xs">
              <Link href="/admin">
                Admin Console
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Shimmer Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md mb-8 hover:border-primary/50 transition-colors cursor-default"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-foreground font-semibold">Dual-LLM Circuit Failover</span>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <span className="text-muted-foreground">Hardened for 10,000+ Concurrent Requests</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground leading-[1.1] mb-6"
        >
          Enterprise AI Blog Generation at{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Uncapped Scale
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Zero-downtime content generation gateway. Groq Llama 3.3 70B primary with instant Gemini 2.0 Flash failover, multi-tenant prompt injection boundaries, and sub-800ms generation.
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold shadow-lg shadow-primary/10 gap-2 group">
            <Link href="/onboard">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-semibold border-border/80 bg-card/40 backdrop-blur hover:bg-accent/40 gap-2">
            <Link href="/preview">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Test Live Preview Studio
            </Link>
          </Button>
        </motion.div>

        {/* Quick Metric Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl w-full border-y border-border/40 py-6"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              &lt; 800ms
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Avg Groq Latency
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">
              10,000+
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Concurrent Capacity
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              99.98%
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Dual-LLM Uptime
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
              100%
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Anti-AI SEO Score
            </span>
          </div>
        </motion.div>
      </section>

      {/* Interactive Terminal & Live Spec Demo Section */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            DEVELOPER FIRST CONTRACT
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Plug Into Any Stack in 60 Seconds
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-2">
            REST endpoint or type-safe SDK. Returns fully structured semantic HTML with clean JSON metadata.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  gateway.growthservice.in — api/generate-blog
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-[11px] text-muted-foreground">
                POST 200 OK • 742ms
              </Badge>
            </div>

            {/* Tabs for cURL vs SDK vs Response Preview */}
            <Tabs defaultValue="curl" className="w-full">
              <div className="flex items-center justify-between px-4 pt-3 border-b border-border/40">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="curl" className="text-xs font-mono gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    cURL Request
                  </TabsTrigger>
                  <TabsTrigger value="sdk" className="text-xs font-mono gap-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    TypeScript SDK
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs font-mono gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    Generated Output Preview
                  </TabsTrigger>
                  <TabsTrigger value="telemetry" className="text-xs font-mono gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    Circuit &amp; Telemetry
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* cURL Tab */}
              <TabsContent value="curl" className="p-4 m-0 relative">
                <div className="absolute right-6 top-6 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs bg-background/80 backdrop-blur"
                    onClick={() => handleCopy(curlCode, "curl")}
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy cURL
                      </>
                    )}
                  </Button>
                </div>
                <pre className="font-mono text-xs text-indigo-300 bg-black/80 p-5 rounded-lg overflow-x-auto leading-relaxed border border-border/40">
                  {curlCode}
                </pre>
              </TabsContent>

              {/* SDK Tab */}
              <TabsContent value="sdk" className="p-4 m-0 relative">
                <div className="absolute right-6 top-6 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs bg-background/80 backdrop-blur"
                    onClick={() => handleCopy(sdkCode, "sdk")}
                  >
                    {copiedSdk ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy SDK
                      </>
                    )}
                  </Button>
                </div>
                <pre className="font-mono text-xs text-emerald-300 bg-black/80 p-5 rounded-lg overflow-x-auto leading-relaxed border border-border/40">
                  {sdkCode}
                </pre>
              </TabsContent>

              {/* Output Preview Tab */}
              <TabsContent value="preview" className="p-6 m-0 bg-background/40 space-y-4">
                <div className="border border-border/60 rounded-xl p-5 bg-card/60 backdrop-blur space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                      SEO Score: 98/100
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5" /> 4 min read • 1,180 words
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    Why High-Concurrency Headless Architectures Win in 2026
                  </h3>

                  <p className="text-xs text-muted-foreground italic">
                    Meta Description: Discover why distributed edge gateways with dual LLM failover outperform legacy synchronous backends. A practical blueprint for high-traffic SaaS builders.
                  </p>

                  <div className="text-sm text-foreground/80 leading-relaxed border-t border-border/40 pt-3 space-y-2">
                    <p>
                      Modern programmatic content generation demands predictable sub-second latency and zero-tolerance for third-party provider downtime. When handling thousands of concurrent users, traditional single-threaded LLM wrappers quickly buckle under rate limits and connection exhaustion...
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Distributed Systems", "Edge Compute", "Latency", "SaaS Scale"].map((tag) => (
                      <span key={tag} className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Telemetry Tab */}
              <TabsContent value="telemetry" className="p-6 m-0 bg-background/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-semibold">GROQ CIRCUIT STATE</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-foreground">CLOSED (Healthy)</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Llama 3.3 70B • 742ms latency</p>
                  </div>

                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-semibold">GEMINI FALLBACK</span>
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-foreground">STANDBY (Hot)</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Gemini 2.0 Flash • 0ms cold start</p>
                  </div>

                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-semibold">ATOMIC CANARY LEASE</span>
                      <span className="h-2 w-2 rounded-full bg-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-foreground">ACTIVE (1 Lease)</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Thundering Herd Prevention</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </section>

      {/* Feature Bento Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            CORE CAPABILITIES
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Engineered for Concurrency, Not Toy Demos
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-3">
            Every layer from database locks to token decoders was built to survive massive traffic surges without data loss or noisy-neighbor starvation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dual LLM Failover */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <CardTitle className="text-lg">Dual-LLM Circuit Canary</CardTitle>
                <CardDescription>
                  Sub-800ms Groq primary with atomic canary leases. Automatically diverts to Google Gemini 2.0 Flash upon 3 consecutive faults without dropping requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>30-second atomic cooldown lock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Zero thundering herd on recovery</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Prompt Shield */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
                <CardTitle className="text-lg">Prompt Shield &amp; Brand DNA</CardTitle>
                <CardDescription>
                  Isolates all untrusted tenant parameters within strict XML boundaries. Dynamically injects brand voice, target audience, and canonical internal links.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Prompt injection immunity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Automatic link equity distribution</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Sliding Rate Limiter */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <Lock className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Noisy-Neighbor Quarantine</CardTitle>
                <CardDescription>
                  Distributed PostgreSQL atomic token-bucket counters. Rejects burst abusers with HTTP 429 at the edge so rogue tenants cannot starve shared quotas.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Atomic RPC increment with row locks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Standardized Retry-After headers</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Asynchronous Queue */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
                  <Workflow className="h-5 w-5 text-purple-400" />
                </div>
                <CardTitle className="text-lg">Asynchronous Queue &amp; Jitter</CardTitle>
                <CardDescription>
                  For heavy bursts, pass ?async=true to get HTTP 202 in 25ms. Background cron processes jobs with exponential backoff and randomized jitter.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>SKIP LOCKED concurrency safety</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Client SDK auto-polling helpers</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: BYO-Key Isolation */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2">
                  <Database className="h-5 w-5 text-sky-400" />
                </div>
                <CardTitle className="text-lg">Dedicated BYO-Key Support</CardTitle>
                <CardDescription>
                  Tenants can plug their private Groq or Gemini API keys. Dedicated quota pools with zero risk of shared platform rate limit exhaustion.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Per-tenant key encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Unlimited monthly generations</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 6: Observability & Telemetry */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5 text-pink-400" />
                </div>
                <CardTitle className="text-lg">Deep Observability Stream</CardTitle>
                <CardDescription>
                  Tracks token consumption, prompt/completion ratios, exact millisecond generation latency, finish reasons, and per-tenant margin metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Granular generation_logs audit trail</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Admin live telemetry visualization</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            REQUEST LIFECYCLE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How 10,000+ Concurrent Requests Flow
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Every step is protected by atomic leases, row-level locks, and strict anti-injection schemas.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-indigo-400 mb-2">STEP 01</div>
            <h4 className="font-bold text-foreground text-base mb-1">Gateway Auth &amp; Capping</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SHA-256 API key verified against site_profiles. Atomic token bucket checked in Postgres.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-purple-400 mb-2">STEP 02</div>
            <h4 className="font-bold text-foreground text-base mb-1">Prompt Isolation Engine</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Untrusted topic wrapped in XML tags. Injects internal links, brand tone, and schema constraints.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-orange-400 mb-2">STEP 03</div>
            <h4 className="font-bold text-foreground text-base mb-1">Dual-LLM Circuit Canary</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sub-800ms Groq execution. If degraded, 1 request leases canary probe while remaining traffic shifts to Gemini.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-emerald-400 mb-2">STEP 04</div>
            <h4 className="font-bold text-foreground text-base mb-1">Semantic Output &amp; Logs</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Decoded JSON schema validated with Zod. Audit telemetry logged asynchronously to database.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            TRANSPARENT PRICING
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Simple Plans for Scaling Teams
          </h2>
          <p className="text-muted-foreground text-base mt-2">
            No surprise token charges. Unlimited client websites and guaranteed uptime.
          </p>

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-medium ${billingCycle === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-secondary transition-colors duration-200 ease-in-out focus:outline-hidden"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
                  billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1 ${billingCycle === "annual" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Annual
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 px-1.5 py-0">
                SAVE 20%
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="border-border/70 bg-card/40 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <CardDescription>Ideal for indie hackers and solo creators.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">
                  ${billingCycle === "annual" ? "24" : "29"}
                </span>
                <span className="text-muted-foreground text-xs ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>50 AI Blogs per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1 Tenant site profile</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Dual LLM (Groq + Gemini) failover</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Standard REST API access</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full text-xs">
                <Link href="/onboard">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan (Highlighted) */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-indigo-500/50 bg-card/80 backdrop-blur-xl relative shadow-xl shadow-indigo-500/10 flex flex-col justify-between h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-[11px] px-3">
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-xl">Growth Pro</CardTitle>
                <CardDescription>For growing agencies and scalable SaaS startups.</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">
                    ${billingCycle === "annual" ? "64" : "79"}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-foreground font-medium">300 AI Blogs per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-foreground font-medium">5 Tenant site profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Bring-Your-Own-Key (BYO-Key) mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Asynchronous burst queue &amp; SDK polling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dynamic internal link injection</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                  <Link href="/onboard">Start 14-Day Free Trial</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Scale Plan */}
          <Card className="border-border/70 bg-card/40 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise Scale</CardTitle>
              <CardDescription>For multi-site portfolios with 10k+ daily visitors.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">
                  ${billingCycle === "annual" ? "199" : "249"}
                </span>
                <span className="text-muted-foreground text-xs ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Unlimited AI Blogs (BYO Key)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Unlimited Tenant site profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Dedicated circuit canary probe</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>99.99% High-Availability SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Custom fine-tuned tone models</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full text-xs">
                <Link href="/onboard">Contact Sales</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <Card className="border-border/80 bg-gradient-to-b from-card/80 to-background/90 p-8 sm:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Ready to Automate Your Blog Machine?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Get your tenant API key and start publishing SEO-dominating content in under 2 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/20">
              <Link href="/onboard">
                Create Account &amp; Register Site
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/preview">Live Studio Preview</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Modern SaaS Footer */}
      <footer className="border-t border-border/40 bg-background/80 py-10 px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-indigo-400" />
            </div>
            <span className="font-semibold text-foreground">AI Blog SaaS Platform</span>
            <span>• 10,000+ Concurrency Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <Link href="/preview" className="hover:text-foreground transition-colors">
              Studio
            </Link>
            <a href="https://github.com/kishangrowthservice/AI-BlogSASSY" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} GrowthService Inc. Enterprise Grade.
          </div>
        </div>
      </footer>
    </div>
  );
}
