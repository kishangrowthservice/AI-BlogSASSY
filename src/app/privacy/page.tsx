import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Blog SaaS",
  description: "How AI Blog SaaS collects, protects, and isolates tenant data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
              <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight">AI Blog SaaS</span>
          </Link>

          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/30">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Privacy &amp; Data Isolation
            </Badge>
            <span className="text-xs text-muted-foreground">Effective Date: September 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Transparency on data isolation, tenant security, and how your website information is handled.
          </p>
        </div>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">1</span>
                Information We Collect
              </h2>
              <p>We collect only the minimum information necessary to deliver automated publishing services:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">Account Information:</strong> Your email address and authentication credentials managed securely via Supabase Auth.</li>
                <li><strong className="text-foreground">Brand Configuration:</strong> Domain, site name, brand guidelines, tone preferences, and internal link catalogs that you configure for your articles.</li>
                <li><strong className="text-foreground">Generation Telemetry:</strong> Request latency, token counts, model identifiers, and generation status for billing and observability.</li>
                <li><strong className="text-foreground">BYO API Keys:</strong> If you provide your own Groq or Gemini keys, they are stored and used solely for your generation requests.</li>
              </ul>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">2</span>
                Multi-Tenant Data Isolation
              </h2>
              <p>
                Our architecture enforces strict logical data isolation between tenants. Each website profile is assigned a unique UUID bound directly to the authenticated account ID.
              </p>
              <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-2 text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Isolation Guarantees:
                </div>
                <p>Every database query, API route, and server action strictly verifies tenant ownership. One tenant can never access, view, or alter another tenant&apos;s brand knowledge, API keys, or article logs.</p>
              </div>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">3</span>
                LLM Provider Processing
              </h2>
              <p>
                To generate articles, prompts containing your topic, keywords, and brand guidelines are transmitted to LLM API providers (Groq and Google Gemini) via encrypted TLS connections.
              </p>
              <p>
                We do not sell, rent, or monetize your content or brand data. LLM providers process the prompts in stateless API mode to return generated text to your account.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">4</span>
                Data Retention and Control
              </h2>
              <p>
                You retain complete control over your content. Generated articles and site configuration remain in your account until you delete them or terminate your account. Upon account deletion, all site profiles, keys, and logs are permanently deleted.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">5</span>
                Contact Us
              </h2>
              <p>
                If you have questions or privacy requests regarding your data, please email us at <span className="font-mono text-xs text-foreground">privacy@growthservice.in</span>.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} AI Blog SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors font-medium text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
