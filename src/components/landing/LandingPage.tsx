"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
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
  ChevronDown,
  Workflow,
  Search,
  BookOpen,
  Award,
  Users,
  Target,
  FileText,
  DollarSign,
  Calculator,
  HelpCircle,
} from "lucide-react";

interface LandingPageProps {
  currentUserEmail?: string | null;
}

const FAQ_ITEMS = [
  {
    q: "Is AI-generated content penalized by Google?",
    a: "No. Google's official search guidance is explicit: content quality and helpfulness matter, not how content is produced. Google rewards original, people-first content that answers user search intent, and penalizes thin or manipulative spam regardless of whether a human or AI wrote it. Our platform structures high-quality drafts adhering to Google E-E-A-T principles with authoritative headings and semantic metadata."
  },
  {
    q: "How does the automated CMS webhook publishing work?",
    a: "Whenever an article finishes generation, our platform can immediately dispatch the complete semantic HTML article directly to your endpoint via HTTP POST. It comes pre-formatted with titles, meta descriptions, image suggestions, and internal links ready for WordPress, Shopify, Webflow, Ghost, or your custom API, protected with cryptographic HMAC-SHA256 signatures."
  },
  {
    q: "What is dual-LLM fallback and why is it important?",
    a: "Third-party AI providers experience traffic spikes and occasional rate limits. AI Blog SaaS uses Groq as the ultra-fast primary engine and automatically fails over to Google Gemini Flash if Groq is degraded. Your scheduled and queued posts continue without drops or delays."
  },
  {
    q: "Can I bring my own AI keys (BYO Keys)?",
    a: "Yes! If you already have Groq or Google Gemini API accounts with free tier headroom or custom quotas, you can enter your keys securely in your client dashboard. The platform will route your generation through your private credentials while maintaining all brand voice and publishing automations."
  },
  {
    q: "How does canonical internal link injection work?",
    a: "You provide your key destination URLs (such as your services, pricing, or case study pages). When generating articles, our engine analyzes the context and naturally weaves 2–3 relevant contextual backlinks into the article body, directing organic readers toward your revenue pages and boosting site authority."
  },
  {
    q: "Can I change plans or cancel at any time?",
    a: "Absolutely. All plans are month-to-month with no contracts. You can upgrade, downgrade, or cancel anytime directly from your dashboard's Stripe billing portal with a single click."
  }
];

export function LandingPage({ currentUserEmail }: LandingPageProps = {}) {
  const [userEmail, setUserEmail] = useState<string | null>(currentUserEmail || null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [calculatorArticles, setCalculatorArticles] = useState(50);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  React.useEffect(() => {
    try {
      const supabase = createClient();
      if (!currentUserEmail) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.email) {
            setUserEmail(user.email);
          }
        }).catch(() => {});
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Browser fallback
    }
  }, [currentUserEmail]);

  const integrationSnippet = `// 1-Click Publishing to Your Website
const article = await blogEngine.publish({
  topic: "10 High-Impact Ways Modern Businesses Scale Organic Traffic",
  category: "Growth & Marketing"
});

console.log("Published:", article.title, article.url);`;

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
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                AUTONOMOUS ORGANIC GROWTH
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#calculator" className="hover:text-foreground transition-colors">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions & Health Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>Publishing 24/7 Active</span>
            </div>

            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              <Link href="/preview">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                Interactive Studio
              </Link>
            </Button>

            {userEmail ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex text-xs text-muted-foreground font-medium border border-border/40 px-2.5 py-1 rounded-full bg-muted/20">
                  {userEmail}
                </span>

                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium text-xs">
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/auth/signout">
                    Sign Out
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>

                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium text-xs">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </>
            )}
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
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-foreground font-semibold">Autonomous Content Engine</span>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <span className="text-muted-foreground">Rank on Google &amp; Convert Readers to Clients</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground leading-[1.1] mb-6"
        >
          Turn Your Blog Into a 24/7{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Customer Magnet
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Publish human-grade, SEO-optimized articles that match your authentic brand voice and convert readers into paying clients — without spending 20+ hours a week writing.
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold shadow-lg shadow-primary/10 gap-2 group">
            <Link href={userEmail ? "/dashboard" : "/signup"}>
              {userEmail ? "Go to Your Dashboard" : "Start Free Trial"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-semibold border-border/80 bg-card/40 backdrop-blur hover:bg-accent/40 gap-2">
            <Link href="/preview">
              <Sparkles className="h-4 w-4 text-purple-400" />
              See Live Sample Article
            </Link>
          </Button>
        </motion.div>

        {/* Quick Value Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl w-full border-y border-border/40 py-6"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              100%
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Authentic Brand Voice
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">
              Top #1-3
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Google SEO Focus
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              99.99%
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Publishing Reliability
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
              2 Mins
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Fast Setup Time
            </span>
          </div>
        </motion.div>
      </section>

      {/* Interactive Live Article Preview Section */}
      <section id="sample-preview" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            SEE WHAT YOUR AUDIENCE SEES
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            In-Depth, High-Converting Content
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-2">
            No robotic clichés or generic summaries. Every article is written with real authority, tailored keywords, and clear calls-to-action.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  YourWebsite.com/blog/how-to-scale-organic-revenue
                </span>
              </div>
              <Badge variant="secondary" className="font-medium text-[11px] text-emerald-400 border border-emerald-500/20">
                SEO Score: 98/100
              </Badge>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="article" className="w-full">
              <div className="flex items-center justify-between px-4 pt-3 border-b border-border/40">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="article" className="text-xs gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Published Article Sample
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs gap-1.5">
                    <Search className="h-3.5 w-3.5 text-indigo-400" />
                    Google SEO &amp; Linking
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="text-xs gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-purple-400" />
                    Brand Voice Matching
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Article Preview */}
              <TabsContent value="article" className="p-6 m-0 bg-background/40 space-y-4">
                <div className="border border-border/60 rounded-xl p-6 bg-card/60 backdrop-blur space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Growth Insights</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 4 min read
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[11px] text-purple-400 border-purple-500/30">
                      Target Audience: Business Founders
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    How Modern Companies Generate High-Intent Leads Without Paid Ads
                  </h3>

                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">
                    Meta Description: Discover how programmatic organic content outperforms costly PPC campaigns in sustainable lead generation and domain authority.
                  </p>

                  <div className="text-sm text-foreground/80 leading-relaxed space-y-3 pt-2">
                    <p>
                      For years, businesses assumed that the fastest route to acquiring high-value clients was pouring thousands of dollars into Facebook and Google ads. But as customer acquisition costs climb every quarter, industry leaders are shifting toward durable, organic content assets that compound over time...
                    </p>
                    <p>
                      When a prospective client searches for a solution to their core bottleneck, arriving at an in-depth, authoritative guide creates instant trust. Instead of feeling sold to, the reader recognizes your company as the obvious market expert...
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                    <div>
                      <div className="text-xs font-bold text-foreground">Need help scaling your organic pipeline?</div>
                      <div className="text-xs text-muted-foreground">Speak with our strategy team today.</div>
                    </div>
                    <Button size="sm" className="text-xs font-semibold">
                      Schedule a Consultation
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: SEO Breakdown */}
              <TabsContent value="seo" className="p-6 m-0 bg-background/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">KEYWORD TARGETING</div>
                    <div className="text-lg font-bold text-foreground">Organic B2B Growth</div>
                    <p className="text-xs text-muted-foreground mt-1">Naturally distributed across titles, subheadings, and paragraphs.</p>
                  </div>

                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">SMART INTERNAL LINKS</div>
                    <div className="text-lg font-bold text-indigo-400">Automatic Linking</div>
                    <p className="text-xs text-muted-foreground mt-1">Connects readers directly to your services and pricing pages.</p>
                  </div>

                  <div className="border border-border/60 rounded-lg p-4 bg-card/40">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">HUMAN TONE GUARANTEE</div>
                    <div className="text-lg font-bold text-emerald-400">Zero AI Clichés</div>
                    <p className="text-xs text-muted-foreground mt-1">Strict quality filters ensure natural rhythm and compelling hooks.</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Brand Voice */}
              <TabsContent value="voice" className="p-6 m-0 bg-background/40 space-y-4">
                <div className="border border-border/60 rounded-xl p-5 bg-card/50 space-y-3">
                  <h4 className="text-sm font-bold text-foreground">How We Match Your Company Tone</h4>
                  <p className="text-xs text-muted-foreground">
                    During onboarding, you share a brief overview of what makes your business unique. Our system trains every article to mirror your exact vocabulary, brand values, and preferred tone of voice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-md border border-border/50 bg-background/50 p-3 text-xs">
                      <span className="font-semibold text-foreground">Authoritative</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">High-conviction, professional guidance for industry executives.</p>
                    </div>
                    <div className="rounded-md border border-border/50 bg-background/50 p-3 text-xs">
                      <span className="font-semibold text-foreground">Conversational</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Warm, relatable, and approachable style for consumer audiences.</p>
                    </div>
                    <div className="rounded-md border border-border/50 bg-background/50 p-3 text-xs">
                      <span className="font-semibold text-foreground">Expert &amp; Detailed</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">Data-backed and tactical insights for technical readers.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </section>

      {/* How It Works (Client-Friendly 4 Steps) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            SIMPLE 4-STEP PROCESS
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How It Works for Your Business
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            No complex setups or coding required. You can have your blog publishing engine running in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-indigo-400 mb-2">STEP 01</div>
            <h4 className="font-bold text-foreground text-base mb-1">Add Your Website</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your website domain and a brief description of what your business offers.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-purple-400 mb-2">STEP 02</div>
            <h4 className="font-bold text-foreground text-base mb-1">Set Your Tone</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose your ideal style: Authoritative, Friendly, or Technical. We tailor every sentence.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-orange-400 mb-2">STEP 03</div>
            <h4 className="font-bold text-foreground text-base mb-1">Generate On-Demand</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate full, ready-to-rank articles complete with SEO titles, meta tags, and internal links.
            </p>
          </Card>

          <Card className="border-border/60 bg-card/50 p-5 backdrop-blur relative">
            <div className="font-mono text-xs font-bold text-emerald-400 mb-2">STEP 04</div>
            <h4 className="font-bold text-foreground text-base mb-1">Publish &amp; Rank</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Publish directly to WordPress, Shopify, Webflow, or your custom website with 1 click.
            </p>
          </Card>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            WHY CLIENTS CHOOSE US
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Everything You Need to Dominate Organic Search
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-3">
            Built from the ground up to give growing brands and digital agencies an unfair organic advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Brand Voice */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                </div>
                <CardTitle className="text-lg">Authentic Brand Voice</CardTitle>
                <CardDescription>
                  Learns your company story, product features, and target audience. Writes like a seasoned industry expert, never a generic bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Customizable tone presets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Zero repetitive robotic phrasing</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Google Rankings */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Google SEO Optimization</CardTitle>
                <CardDescription>
                  Automatically creates keyword-rich titles, semantic headings, and search-optimized meta descriptions tailored for Google.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Rank for high-intent search keywords</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Includes structured tags and summaries</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Smart Internal Linking */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <CardTitle className="text-lg">Smart Internal Linking</CardTitle>
                <CardDescription>
                  Automatically inserts relevant links to your key service and pricing pages, boosting your overall website authority.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Distributes SEO authority across your site</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Guides readers straight to your checkout</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Never Down */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <CardTitle className="text-lg">Always-On Reliability</CardTitle>
                <CardDescription>
                  Powered by redundant enterprise AI engines. Even during global AI traffic spikes, your publishing schedule never stumbles.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>99.99% publishing uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Instant failover with zero dropped jobs</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: Multi-Site Agency Ready */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2">
                  <Globe className="h-5 w-5 text-sky-400" />
                </div>
                <CardTitle className="text-lg">Multi-Site &amp; Agency Ready</CardTitle>
                <CardDescription>
                  Run 1 brand or 20 client websites from one organized portal. Each site maintains its own brand tone, audience, and links.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dedicated brand profiles per client</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Isolated keys and publishing limits</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 6: Easy Publishing */}
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full border-border/70 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors" />
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-pink-400" />
                </div>
                <CardTitle className="text-lg">1-Click Website Publishing</CardTitle>
                <CardDescription>
                  Seamlessly push published articles into WordPress, Shopify, Webflow, Ghost, or custom platforms with zero friction.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Clean semantic HTML ready for CMS paste</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Automated publishing hooks available</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Interactive ROI & Content Savings Calculator */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            <Calculator className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
            ROI &amp; MARGIN CALCULATOR
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Calculate Your Content Production Savings
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            See how much time and budget you reclaim compared to traditional copywriters and content agencies.
          </p>
        </div>

        <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Control */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">
                    Target Publishing Volume:
                  </label>
                  <span className="text-2xl font-extrabold text-primary font-mono">
                    {calculatorArticles} <span className="text-xs font-normal text-muted-foreground">articles / month</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={calculatorArticles}
                  onChange={(e) => setCalculatorArticles(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>10 posts (Solopreneur)</span>
                  <span>100 posts (Growth Brand)</span>
                  <span>300 posts (Digital Agency)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Traditional Agency / Freelance
                  </span>
                  <div className="text-2xl font-extrabold text-foreground font-mono">
                    ${(calculatorArticles * 120).toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Based on standard rate of ~$120/article with proofreading
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 space-y-1">
                  <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">
                    AI Blog SaaS Engine
                  </span>
                  <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                    ${(calculatorArticles <= 25 ? (billingCycle === "annual" ? 24 : 29) : calculatorArticles <= 100 ? (billingCycle === "annual" ? 64 : 79) : (billingCycle === "annual" ? 199 : 249)).toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Includes automated SEO, brand voice, and CMS webhooks
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Callout Card */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-background/80 border border-indigo-500/30 p-6 flex flex-col justify-between text-center sm:text-left space-y-4 shadow-xl">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px] mb-2 font-semibold">
                  ESTIMATED SAVINGS
                </Badge>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  ${((calculatorArticles * 120) - (calculatorArticles <= 25 ? (billingCycle === "annual" ? 24 : 29) : calculatorArticles <= 100 ? (billingCycle === "annual" ? 64 : 79) : (billingCycle === "annual" ? 199 : 249))).toLocaleString()}
                  <span className="text-xs text-muted-foreground font-normal ml-1">/ month saved</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Plus an estimated <strong className="text-foreground font-semibold">{Math.round(calculatorArticles * 3.5)} hours</strong> of manual drafting and formatting returned to your team every month.
                </p>
              </div>

              <Button asChild size="sm" className="w-full bg-primary text-primary-foreground font-semibold shadow-md">
                <Link href={userEmail ? "/dashboard" : "/signup"}>
                  Claim Your Savings Now &rarr;
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Pricing / Tiers Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            SIMPLE, TRANSPARENT PLANS
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Invest in Traffic That Keeps Compounding
          </h2>
          <p className="text-muted-foreground text-base mt-2">
            No surprise overage charges. Choose the plan that matches your monthly publishing goals.
          </p>

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-medium ${billingCycle === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === "annual"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
              aria-label="Toggle billing cycle"
            />
            <span className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === "annual" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              Annual
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 px-1.5 py-0 font-semibold">
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
              <CardDescription>Perfect for founders and independent websites.</CardDescription>
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
                <span className="text-foreground font-semibold">25 SEO Articles per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1 Connected Website</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Automated Google SEO Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Smart Internal Link Injection</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Dual-LLM (Groq + Gemini) Failover</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full text-xs font-semibold">
                <Link href={userEmail ? "/dashboard" : "/signup?plan=starter"}>
                  {userEmail ? "Go to Dashboard" : "Start Free Trial"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan (Highlighted) */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-indigo-500/50 bg-card/80 backdrop-blur-xl relative shadow-xl shadow-indigo-500/10 flex flex-col justify-between h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-[11px] px-3 font-semibold">
                  MOST POPULAR FOR GROWTH
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-xl">Growth Pro</CardTitle>
                <CardDescription>For ambitious brands, e-commerce stores, and digital teams.</CardDescription>
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
                  <span className="text-foreground font-semibold">100 SEO Articles per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-foreground font-semibold">Up to 5 Connected Websites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Custom Brand Voice Tuning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Smart Internal Link Building</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Outbound CMS Webhooks (WordPress/Shopify)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Priority Generation Speed</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                  <Link href={userEmail ? "/dashboard" : "/signup?plan=pro"}>
                    {userEmail ? "Go to Dashboard" : "Start 14-Day Free Trial"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Scale Plan */}
          <Card className="border-border/70 bg-card/40 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Agency Scale</CardTitle>
              <CardDescription>For digital marketing agencies managing client portfolios.</CardDescription>
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
                <span className="text-foreground font-semibold">500 SEO Articles per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-foreground font-semibold">Unlimited Connected Websites</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Dedicated Brand Profiles per Client</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Full Webhook &amp; REST API Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>BYO Custom API Keys Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>99.99% Uptime SLA</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full text-xs font-semibold">
                <Link href={userEmail ? "/dashboard" : "/signup?plan=agency"}>
                  {userEmail ? "Go to Dashboard" : "Get Started"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 font-mono text-xs px-3 py-1">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
            FREQUENTLY ASKED QUESTIONS
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Everything You Need to Know
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Clear, transparent answers on AI content quality, Google guidelines, CMS webhooks, and billing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-card/50 backdrop-blur-md overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-foreground leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <Card className="border-border/80 bg-gradient-to-b from-card/80 to-background/90 p-8 sm:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Ready to Put Your Organic Growth on Autopilot?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Set up your brand blog in under 2 minutes. Start publishing Google-dominating articles today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/20">
              <Link href={userEmail ? "/dashboard" : "/signup"}>
                {userEmail ? "Go to Client Dashboard" : "Start Your Free Trial"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/preview">Explore Sample Article</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Enterprise Multi-Column SaaS Footer */}
      <footer className="border-t border-border/40 bg-background/80 py-16 px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                </div>
                <span className="font-bold text-foreground text-base tracking-tight">AI Blog SaaS</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Autonomous organic traffic engine for growing brands and digital agencies. Powered by dual-LLM resilience, Brand DNA tuning, and direct CMS webhook publishing.
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational (99.99%)</span>
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Core Features</a></li>
                <li><a href="#calculator" className="hover:text-foreground transition-colors">ROI Calculator</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Plans &amp; Pricing</a></li>
                <li><Link href="/preview" className="hover:text-foreground transition-colors">Interactive Studio</Link></li>
              </ul>
            </div>

            {/* Column 2: Integrations */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Integrations</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-muted-foreground">WordPress Plugin</span></li>
                <li><span className="text-muted-foreground">Shopify Blog API</span></li>
                <li><span className="text-muted-foreground">Webflow Webhook</span></li>
                <li><span className="text-muted-foreground">Zapier &amp; Make Hooks</span></li>
                <li><span className="text-muted-foreground">Lightweight Node SDK</span></li>
              </ul>
            </div>

            {/* Column 3: Legal & Account */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Legal &amp; Access</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Client Login</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Create Free Account</Link></li>
                <li><Link href="/admin/login" className="hover:text-foreground transition-colors text-muted-foreground/60">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-border/40" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>&copy; {new Date().getFullYear()} GrowthService Inc. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <span>•</span>
              <span>Built with Dual-LLM Resilience</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
