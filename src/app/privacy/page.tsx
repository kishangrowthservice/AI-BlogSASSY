import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy (Draft) | AI Blog SaaS",
  description: "Privacy Policy draft placeholder pending legal review.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Navbar matching /login */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight">AI Blog SaaS</span>
        </Link>

        <div className="text-xs text-muted-foreground">
          <Link href="/login" className="text-foreground font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium w-fit mb-2">
                <AlertTriangle className="h-3 w-3" />
                Draft Placeholder — Pending Legal Review
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Privacy Policy</CardTitle>
              <CardDescription className="text-xs">
                Draft document for demonstration and link-resolution purposes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Legal Notice
                </p>
                <p>
                  This is a clearly-labeled draft placeholder page pending formal legal review by qualified privacy counsel. This text does not constitute legally binding privacy guarantees or representations yet.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm">Tenant Data Isolation Overview</h3>
                <p>
                  AI Blog SaaS implements strict logical data isolation between tenants. Website configurations, brand knowledge, API keys, and generation telemetry are scoped by unique tenant IDs. Formal privacy policies detailing data retention cycles, LLM processor data handling, and statutory privacy rights will be published here upon completion of review.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm">Contact Information</h3>
                <p>
                  For privacy requests, data deletion inquiries, or security questions, please reach out to <span className="font-mono text-foreground">privacy@growthservice.in</span>.
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between text-xs">
              <Link href="/" className="text-muted-foreground hover:underline">
                &larr; Back to Home
              </Link>
              <Link href="/terms" className="text-indigo-400 hover:underline">
                View Terms of Service (Draft) &rarr;
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer matching /login */}
      <footer className="border-t border-border/40 py-4 px-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Blog SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
}
