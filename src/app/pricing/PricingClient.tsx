"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Building2,
  Lock,
} from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  articlesCount: number;
  sitesCount: number;
  highlighted?: boolean;
  badge?: string;
  features: string[];
}

const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential organic growth for independent founders and solo creators.",
    monthlyPrice: 29,
    annualPrice: 24,
    articlesCount: 25,
    sitesCount: 1,
    features: [
      "25 Google E-E-A-T articles / mo",
      "1 Connected Website",
      "Standard Keyword Targeting",
      "Automated Title & Meta Tags",
      "Canonical Internal Backlinks (Up to 5)",
      "Dual-LLM (Groq + Gemini) Failover",
      "Web & Studio Dashboard Access",
      "Email Support",
    ],
  },
  {
    id: "pro",
    name: "Growth Pro",
    tagline: "High-velocity content engine for growing businesses and online stores.",
    monthlyPrice: 79,
    annualPrice: 64,
    articlesCount: 100,
    sitesCount: 5,
    highlighted: true,
    badge: "MOST POPULAR",
    features: [
      "100 Google E-E-A-T articles / mo",
      "Up to 5 Connected Websites",
      "Custom Brand DNA Voice Modeling",
      "Unlimited Canonical Internal Backlinks",
      "Automated CMS Outbound Webhooks",
      "WordPress, Shopify & Webflow Sync",
      "Dual-LLM Failover + Zero Dropped Jobs",
      "Priority API Gateway Headroom",
      "Priority Support Response (< 4 hrs)",
    ],
  },
  {
    id: "agency",
    name: "Agency Scale",
    tagline: "Multi-client content factory for digital marketing agencies.",
    monthlyPrice: 249,
    annualPrice: 199,
    articlesCount: 300,
    sitesCount: 20,
    badge: "MAX CAPACITY",
    features: [
      "300 Google E-E-A-T articles / mo",
      "Up to 20 Connected Websites",
      "Isolated Brand Voice per Client Site",
      "Custom BYO AI Keys (Groq & Gemini)",
      "High-Throughput Burst Queue (202)",
      "Dedicated REST API Keys per Site",
      "Custom Webhook Payload Formatting",
      "99.99% Publishing Uptime SLA",
      "Dedicated Slack Support Channel",
    ],
  },
];

interface FeatureRow {
  category: string;
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  agency: string | boolean;
}

const FEATURE_MATRIX: FeatureRow[] = [
  // Publishing Capacity
  { category: "Publishing Capacity", name: "Monthly Articles Included", starter: "25 posts", pro: "100 posts", agency: "300 posts" },
  { category: "Publishing Capacity", name: "Connected Websites / Brands", starter: "1 site", pro: "5 sites", agency: "20 sites" },
  { category: "Publishing Capacity", name: "Additional Overage Handling", starter: "Hard cap (no billing surprise)", pro: "Hard cap (no billing surprise)", agency: "Custom burst headroom" },
  { category: "Publishing Capacity", name: "Article Word Count Range", starter: "800 – 1,200 words", pro: "800 – 2,500 words", agency: "800 – 3,500 words" },

  // SEO & Quality
  { category: "SEO & Content Quality", name: "Google E-E-A-T Optimization", starter: true, pro: true, agency: true },
  { category: "SEO & Content Quality", name: "Semantic Heading & Structure", starter: true, pro: true, agency: true },
  { category: "SEO & Content Quality", name: "Canonical Internal Link Injection", starter: "Up to 5 URLs", pro: "Unlimited URLs", agency: "Unlimited URLs" },
  { category: "SEO & Content Quality", name: "Brand Voice Customization", starter: "Standard Presets", pro: "Custom Vocabulary & Tone", agency: "Dedicated Voice per Site" },
  { category: "SEO & Content Quality", name: "Clean Semantic HTML Formatting", starter: true, pro: true, agency: true },

  // Integrations & API
  { category: "Integrations & API", name: "CMS Outbound Webhooks (HTTP POST)", starter: false, pro: true, agency: true },
  { category: "Integrations & API", name: "WordPress & Shopify Webhooks", starter: false, pro: true, agency: true },
  { category: "Integrations & API", name: "HMAC Cryptographic Signatures", starter: false, pro: true, agency: true },
  { category: "Integrations & API", name: "Direct REST API Access", starter: true, pro: true, agency: true },
  { category: "Integrations & API", name: "Custom BYO AI Keys (Groq / Gemini)", starter: false, pro: false, agency: true },

  // Infrastructure & Reliability
  { category: "Infrastructure & Reliability", name: "Dual-LLM Circuit Breaker Failover", starter: true, pro: true, agency: true },
  { category: "Infrastructure & Reliability", name: "Async Burst Smoothing Queue", starter: true, pro: true, agency: true },
  { category: "Infrastructure & Reliability", name: "Atomic Quota Reservation", starter: true, pro: true, agency: true },
  { category: "Infrastructure & Reliability", name: "Uptime SLA Guarantee", starter: "99.9%", pro: "99.95%", agency: "99.99%" },
  { category: "Infrastructure & Reliability", name: "Support Level", starter: "Standard Email", pro: "Priority Email (< 4h)", agency: "Dedicated Slack Channel" },
];

const PRICING_FAQS = [
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes. You can switch plans anytime directly from your dashboard billing portal. If you upgrade mid-cycle, the new quota is immediately applied and your payment is prorated.",
  },
  {
    q: "What happens if I hit my monthly article limit?",
    a: "We never charge unexpected surprise overages. When you reach your monthly quota, generation pauses until your next billing reset, or you can instantly upgrade to a higher tier or connect your own BYO AI key.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes! All plans include a 14-day free trial. You can test live article generation and publish directly to your CMS before your subscription starts.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 100% money-back guarantee within the first 14 days of your initial payment if you are not fully satisfied with your publishing results.",
  },
  {
    q: "Can I connect multiple client sites to one account?",
    a: "Yes. Growth Pro supports up to 5 distinct websites and Agency Scale supports up to 20 sites. Each website has its own isolated brand DNA, internal links, API keys, and webhooks.",
  },
];

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
        {/* Header & Billing Cycle Switch */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1">
            TRANSPARENT VALUE • NO SURPRISES
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Simple Pricing for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Compounding Traffic
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Choose the publishing capacity tailored to your growth goals. Every plan includes our core E-E-A-T SEO engine and dual-LLM fallback resilience.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly Billing
            </span>
            <Switch
              checked={billingCycle === "annual"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
              aria-label="Toggle annual billing discount"
            />
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
              Annual Billing
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 px-1.5 py-0 font-bold">
                SAVE 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className="h-full transition-all duration-300 hover:-translate-y-1"
              >
                <Card
                  className={`h-full flex flex-col justify-between relative backdrop-blur-xl ${
                    plan.highlighted
                      ? "border-indigo-500/60 bg-card/80 shadow-2xl shadow-indigo-500/10"
                      : "border-border/70 bg-card/40 shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className={`text-[10px] px-3 font-semibold ${
                          plan.highlighted
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                            : "bg-muted text-foreground border-border"
                        }`}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={plan.badge ? "pt-8" : "pt-6"}>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-xs min-h-[32px]">{plan.tagline}</CardDescription>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-black text-foreground font-mono">
                        ${price}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1.5">/ month</span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-[11px] text-emerald-400 font-medium">Billed annually (${price * 12}/yr)</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    <Separator className="bg-border/40" />
                    <div className="space-y-2.5 text-xs text-muted-foreground">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={idx === 0 ? "font-semibold text-foreground" : ""}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/40 pt-4">
                    <Button
                      asChild
                      className={`w-full text-xs font-semibold ${
                        plan.highlighted
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link href={`/signup?plan=${plan.id}`}>
                        Start 14-Day Free Trial
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout Banner */}
        <Card className="border-border/80 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-background/80 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/40 uppercase">
                  Custom High Volume
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Need more than 300 articles per month?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                We provision custom dedicated infrastructure, high-throughput rate limit allocations, white-label client portals, and SLA-backed engineering support for large publishing portfolios.
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="border-border/80 text-xs font-semibold shrink-0 gap-2">
              <Link href="/contact">
                Talk to Enterprise Sales
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Full Feature Comparison Matrix */}
        <div className="space-y-6 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Detailed Plan Comparison
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A side-by-side look at everything included in each tier.
            </p>
          </div>

          <Card className="border-border/70 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-transparent">
                  <TableHead className="w-[40%] text-xs font-bold text-foreground">Feature Capability</TableHead>
                  <TableHead className="w-[20%] text-center text-xs font-bold text-foreground">Starter</TableHead>
                  <TableHead className="w-[20%] text-center text-xs font-bold text-indigo-400">Growth Pro</TableHead>
                  <TableHead className="w-[20%] text-center text-xs font-bold text-purple-400">Agency Scale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURE_MATRIX.map((row, idx) => {
                  const isFirstInCategory = idx === 0 || FEATURE_MATRIX[idx - 1].category !== row.category;
                  return (
                    <React.Fragment key={idx}>
                      {isFirstInCategory && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={4} className="py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {row.category}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="text-xs text-foreground font-medium py-3">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground py-3">
                          {typeof row.starter === "boolean" ? (
                            row.starter ? (
                              <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            row.starter
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs text-foreground font-semibold py-3">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            row.pro
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs text-foreground font-semibold py-3">
                          {typeof row.agency === "boolean" ? (
                            row.agency ? (
                              <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            row.agency
                          )}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="font-mono text-xs px-3 py-1">
              FREQUENTLY ASKED QUESTIONS
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Billing &amp; Subscription Questions
            </h2>
          </div>

          <div className="space-y-3">
            {PRICING_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card
                  key={idx}
                  className="border-border/60 bg-card/40 backdrop-blur cursor-pointer transition-all hover:border-border"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? "rotate-180 text-foreground" : ""
                      }`}
                    />
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="px-4 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Final Conversion Banner */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-2xl p-8 sm:p-12 text-center space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Start Your 14-Day Free Trial Today
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Experience fully autonomous, high-ranking SEO content tailored to your brand voice. No credit card required to test the studio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-11 px-6 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
              <Link href="/signup">
                Get Started Free &rarr;
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-xs font-semibold border-border/80">
              <Link href="/preview">
                Explore Sample Article
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
