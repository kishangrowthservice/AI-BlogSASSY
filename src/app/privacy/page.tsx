import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { ShieldCheck, AlertTriangle, Database, Cookie, Share2, Mail, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy (Draft) | AI Blog SaaS",
  description: "Privacy Policy draft placeholder for AI Blog SaaS. Pending formal legal review — not yet enforceable.",
};

const SECTIONS = [
  {
    icon: <Database className="h-4 w-4 text-indigo-400" />,
    title: "1. Data We Collect",
    body: "We collect your email address and account credentials during signup, your website and brand configuration settings stored in your tenant profile, and AI generation telemetry (counts, timestamps, provider used) for quota enforcement and analytics. We do not collect payment card information directly — billing is handled by a compliant third-party processor.",
  },
  {
    icon: <Lock className="h-4 w-4 text-purple-400" />,
    title: "2. Tenant Data Isolation",
    body: "AI Blog SaaS implements strict multi-tenant isolation via Row Level Security (RLS) policies in Supabase. Your website configurations, API keys, brand knowledge, and generation logs are logically isolated from all other tenants. Only your authenticated session can access your tenant data through production endpoints.",
  },
  {
    icon: <Share2 className="h-4 w-4 text-emerald-400" />,
    title: "3. Third-Party Processors",
    body: "Blog content is generated using third-party LLM providers (Groq, Google Gemini) via server-side API calls. Your website brand context may be included in these prompts to provide context-aware output. These providers have their own data handling policies. We do not sell or rent your personal data to third parties for marketing purposes.",
  },
  {
    icon: <Cookie className="h-4 w-4 text-amber-400" />,
    title: "4. Cookies & Session Data",
    body: "We use strictly necessary session cookies for authentication purposes only. We do not use third-party advertising cookies or behavioral tracking cookies. Analytics data (if enabled) is aggregated and anonymized.",
  },
  {
    icon: <Mail className="h-4 w-4 text-rose-400" />,
    title: "5. Your Rights & Data Deletion",
    body: "You may request deletion of your account and all associated data by emailing privacy@growthservice.in. Full statutory rights (GDPR, CCPA, etc.) applicable to your jurisdiction will be comprehensively documented in the final version of this policy pending legal review.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav rightContent={
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Sign In
        </Link>
      } />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl space-y-4">

          {/* Draft Banner */}
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              <strong className="text-amber-200">Draft Placeholder — Not Yet Enforceable.</strong>{" "}
              This document is for link-resolution purposes only. Final Privacy Policy is pending qualified legal review and has not yet been published.
            </p>
          </div>

          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                Privacy Policy
              </CardTitle>
              <CardDescription className="text-xs">
                Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })} (Draft — Pending Legal Review)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1.5 border-b border-border/40 last:border-0 pb-4 last:pb-0">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    {section.icon}
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {section.body}
                  </p>
                </div>
              ))}

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Privacy Inquiries:</strong> Contact us at{" "}
                <span className="font-mono text-foreground">privacy@growthservice.in</span> for data
                deletion requests, access requests, or security disclosures.
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Home
              </Link>
              <Link href="/terms" className="text-indigo-400 hover:underline">
                View Terms of Service (Draft) →
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
