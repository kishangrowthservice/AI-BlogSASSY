import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { FileText, AlertTriangle, ScrollText, Scale, Ban, CreditCard, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service (Draft) | AI Blog SaaS",
  description: "Terms of Service draft placeholder for AI Blog SaaS. Pending formal legal review — not yet enforceable.",
};

const SECTIONS = [
  {
    icon: <ScrollText className="h-4 w-4 text-indigo-400" />,
    title: "1. Acceptance of Terms",
    body: "By creating an account on AI Blog SaaS, you acknowledge that you have read, understood, and agree to be bound by the final published version of these terms once they are formally approved and released. Until then, usage of the platform during any early-access or beta period is governed solely by any explicit agreement made at sign-up.",
  },
  {
    icon: <Scale className="h-4 w-4 text-purple-400" />,
    title: "2. Permitted Use & License",
    body: "AI Blog SaaS grants you a limited, non-exclusive, non-transferable license to access and use the platform for your legitimate business content operations. The platform may not be used to generate spam, disinformation, CSAM, or content that violates applicable law. API keys and platform credentials are personal to your account and must not be shared.",
  },
  {
    icon: <Ban className="h-4 w-4 text-rose-400" />,
    title: "3. Prohibited Activities",
    body: "You may not reverse-engineer, resell, or sublicense access to the platform. Automated scraping or abuse of the generation API outside documented rate limits is prohibited. Violation of these rules may result in account suspension without refund.",
  },
  {
    icon: <CreditCard className="h-4 w-4 text-amber-400" />,
    title: "4. Billing & Quotas",
    body: "Subscription plans are subject to monthly generation quotas documented on the pricing page. Overages are not currently charged but may be throttled. Billing terms, refund policies, and plan cancellation procedures will be fully specified in the final version of these terms.",
  },
  {
    icon: <ShieldAlert className="h-4 w-4 text-orange-400" />,
    title: "5. Limitation of Liability",
    body: "The platform is provided \"as-is\" during early access. AI Blog SaaS makes no warranties regarding uninterrupted availability or content accuracy. Specific liability limitations, indemnification clauses, and governing law jurisdiction will be articulated in the final terms pending legal review.",
  },
];

export default function TermsPage() {
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
              This document is for link-resolution purposes only. Final Terms of Service are pending qualified legal review and have not yet been published. By using the platform now you acknowledge this limitation.
            </p>
          </div>

          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-400" />
                Terms of Service
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

              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Questions?</strong> Contact us at{" "}
                <span className="font-mono text-foreground">support@growthservice.in</span> for any legal
                inquiries or service questions during the interim period.
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="text-indigo-400 hover:underline">
                View Privacy Policy (Draft) →
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
