"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-md pt-16 pb-12 text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Platform Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-bold text-foreground text-base tracking-tight">AI Blog SaaS</span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Autonomous, high-authority organic content engine for modern online brands. Generates Google E-E-A-T compliant articles with canonical internal backlinks, dual-LLM fallback resilience, and instant CMS publishing.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 gap-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                99.98% System Uptime
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground py-0.5">
                SOC-2 &amp; GDPR Ready
              </Badge>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors">
                  Platform Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/preview" className="hover:text-foreground transition-colors text-purple-400 font-medium flex items-center gap-1">
                  Studio Sandbox
                  <Sparkles className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  API &amp; Developer Docs
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-foreground transition-colors">
                  Changelog &amp; Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Integrations</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  WordPress Webhook
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  Shopify Store Blog
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  Webflow CMS
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  Ghost Publishing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  Zapier &amp; Make
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Company &amp; Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service (Draft)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy (Draft)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-foreground transition-colors">
                  Internal Ops Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-border/60 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI Blog SaaS Platform. Built with Next.js, Groq, Gemini &amp; Supabase.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/preview" className="hover:text-foreground transition-colors">Interactive Playground</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
