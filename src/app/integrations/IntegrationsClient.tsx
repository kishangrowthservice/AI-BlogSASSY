"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Globe,
  Share2,
  Workflow,
  Code2,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Check,
  Copy,
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  category: "cms" | "ecommerce" | "headless" | "automation";
  categoryLabel: string;
  logoText: string;
  logoBg: string;
  shortDesc: string;
  setupTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  steps: string[];
  webhookSample?: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "wordpress",
    name: "WordPress",
    category: "cms",
    categoryLabel: "Content Management",
    logoText: "WP",
    logoBg: "bg-blue-600",
    shortDesc: "Automatically publish draft or live blog posts to your self-hosted WordPress site.",
    setupTime: "2 mins",
    difficulty: "Easy",
    steps: [
      "Open your WordPress Admin dashboard and navigate to Settings > Webhooks (or install our lightweight helper plugin).",
      "Copy your AI Blog SaaS Outbound Webhook endpoint from your dashboard.",
      "Enter your WordPress Application Password or webhook auth secret in AI Blog SaaS.",
      "Articles are now pushed as formatted native WordPress posts with tags and categories automatically.",
    ],
    webhookSample: `POST https://yourdomain.com/wp-json/wp/v2/posts
Header: Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=`,
  },
  {
    id: "shopify",
    name: "Shopify Store Blog",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    logoText: "SH",
    logoBg: "bg-emerald-600",
    shortDesc: "Drive organic search shoppers directly to your Shopify products with automated blog articles.",
    setupTime: "3 mins",
    difficulty: "Easy",
    steps: [
      "In your Shopify Admin, create a Custom App under Settings > Apps and Sales Channels.",
      "Grant read/write permissions for Online Store Articles.",
      "Paste your Shopify Store URL and Admin Access Token into your AI Blog SaaS webhook settings.",
      "Generated articles automatically appear in your designated Shopify Blog feed.",
    ],
    webhookSample: `POST https://your-store.myshopify.com/admin/api/2026-01/articles.json
Header: X-Shopify-Access-Token: shpat_xxxx`,
  },
  {
    id: "webflow",
    name: "Webflow CMS",
    category: "cms",
    categoryLabel: "Content Management",
    logoText: "WF",
    logoBg: "bg-sky-500",
    shortDesc: "Sync rich formatted SEO articles into your Webflow CMS collection with custom fields.",
    setupTime: "4 mins",
    difficulty: "Medium",
    steps: [
      "Generate an API Token from your Webflow Site Settings > Integrations.",
      "Map your Webflow CMS Collection fields (Title, Body, Slug, Meta Description, Main Image).",
      "Provide your Webflow collection ID in your AI Blog SaaS dashboard.",
      "New articles are staged as drafts or published directly to your live Webflow domain.",
    ],
  },
  {
    id: "ghost",
    name: "Ghost Publishing",
    category: "headless",
    categoryLabel: "Headless CMS",
    logoText: "GH",
    logoBg: "bg-purple-600",
    shortDesc: "Lightweight, markdown-native article publishing to self-hosted or Ghost(Pro) sites.",
    setupTime: "3 mins",
    difficulty: "Easy",
    steps: [
      "Under Ghost Admin > Settings > Integrations, create a Custom Integration.",
      "Copy your Ghost Admin API Key and API URL.",
      "Save credentials in AI Blog SaaS dashboard under CMS Webhooks.",
      "Articles publish as native Lexical or HTML Ghost posts with featured tags.",
    ],
  },
  {
    id: "zapier",
    name: "Zapier & Make",
    category: "automation",
    categoryLabel: "Automation",
    logoText: "ZP",
    logoBg: "bg-orange-500",
    shortDesc: "Trigger multi-app publishing pipelines, social syndication, and email newsletters.",
    setupTime: "2 mins",
    difficulty: "Easy",
    steps: [
      "Create a Catch Hook in Zapier or a Custom Webhook in Make.com.",
      "Paste the generated Webhook URL into your AI Blog SaaS dashboard.",
      "Whenever a post generates, your Zap triggers to distribute content to Twitter, LinkedIn, Slack, or Notion.",
    ],
  },
  {
    id: "custom-api",
    name: "Custom REST API & SDK",
    category: "headless",
    categoryLabel: "Developer API",
    logoText: "JS",
    logoBg: "bg-indigo-600",
    shortDesc: "Integrate directly into Next.js, Nuxt, Astro, or custom backend services via HTTP or Node SDK.",
    setupTime: "5 mins",
    difficulty: "Advanced",
    steps: [
      "Generate your secret API key from the client dashboard.",
      "Import @growthservice/blog-client into your Node.js or Python backend.",
      "Call client.generateBlog() synchronously or asynchronously with burst queue buffering.",
      "Render clean semantic HTML or structured JSON into your custom frontend template.",
    ],
  },
];

export function IntegrationsClient() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);

  const filteredItems = activeCategory === "all"
    ? INTEGRATIONS
    : INTEGRATIONS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1">
            ECOSYSTEM &amp; CONNECTIVITY
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Connect Your Favorite{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CMS &amp; Publishing Tools
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Publish generated articles directly into your content management system, store blog, or automated marketing workflows with zero manual copy-pasting.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: "all", label: "All Integrations" },
              { id: "cms", label: "CMS Platforms" },
              { id: "ecommerce", label: "E-Commerce" },
              { id: "headless", label: "Headless & APIs" },
              { id: "automation", label: "Automation" },
            ].map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className="text-xs font-semibold h-8 px-3 rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full border-border/70 bg-card/50 backdrop-blur-xl flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-11 w-11 rounded-xl ${item.logoBg} text-white font-bold font-mono text-sm flex items-center justify-center shadow-md`}>
                      {item.logoText}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.setupTime} setup
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                  <div className="text-[11px] text-indigo-400 font-medium mb-2">{item.categoryLabel}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.shortDesc}
                  </p>
                </div>

                <div className="pt-6 border-t border-border/40 mt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-semibold gap-1.5 w-full"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    View Setup Guide
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Request Integration Banner */}
        <Card className="border-border/80 bg-gradient-to-r from-indigo-950/40 via-card/80 to-background/80 p-8 rounded-2xl shadow-xl backdrop-blur-xl max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Don&apos;t see your CMS or custom stack?</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                We support any system capable of receiving an HTTP POST webhook. Let our integrations team know what platform you need.
              </p>
            </div>
            <Button asChild size="sm" className="text-xs font-semibold shrink-0 gap-1.5">
              <Link href="/contact">
                Request Custom Integration &rarr;
              </Link>
            </Button>
          </div>
        </Card>
      </main>

      {/* Setup Guide Modal */}
      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="border-border/80 bg-card/95 backdrop-blur-2xl max-w-xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-xl ${selectedItem?.logoBg} text-white font-bold font-mono text-sm flex items-center justify-center`}>
                {selectedItem?.logoText}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Connect {selectedItem?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Follow these steps to enable automated blog publishing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="space-y-3">
              {selectedItem?.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg border border-border/50 bg-background/50">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            {selectedItem?.webhookSample && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sample Webhook Endpoint
                </span>
                <pre className="p-3 rounded-lg border border-border/60 bg-black/80 font-mono text-[11px] text-sky-300 overflow-x-auto leading-relaxed">
                  {selectedItem.webhookSample}
                </pre>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-muted-foreground">Need dedicated setup support?</span>
            <Button size="sm" onClick={() => setSelectedItem(null)} className="text-xs">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
