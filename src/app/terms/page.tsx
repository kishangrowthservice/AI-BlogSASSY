import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | AI Blog SaaS",
  description: "Terms and conditions governing the use of AI Blog SaaS platform and services.",
};

export default function TermsOfServicePage() {
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
            <Badge variant="outline" className="text-[11px] text-indigo-400 border-indigo-500/30">
              <FileText className="h-3 w-3 mr-1" />
              Legal Agreement
            </Badge>
            <span className="text-xs text-muted-foreground">Effective Date: September 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Please read these terms carefully before accessing or using the AI Blog SaaS platform.
          </p>
        </div>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or using the Service, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and all guidelines incorporated by reference. If you are entering into these Terms on behalf of a company, agency, or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not agree, you may not access or use the Service.
              </p>
              <p>
                We may update these Terms periodically. When changes occur, we will notify registered accounts through the Service or by email. Your continued use of the platform after updates take effect represents your binding agreement to the updated Terms.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">2</span>
                User Accounts and API Key Security
              </h2>
              <p>
                You must provide accurate and verifiable account information during registration. You are solely responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All tenant API keys and secrets must remain strictly confidential and stored securely in backend server environments.</li>
                <li>Never expose API keys in client-side code, public GitHub repositories, or browser scripts.</li>
                <li>Each API key is designated exclusively for your own account and website profiles.</li>
                <li>Notify support immediately if you suspect unauthorized access or compromised API keys so they can be regenerated safely.</li>
              </ul>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">3</span>
                Content Ownership and Intellectual Property
              </h2>
              <p className="font-medium text-foreground">
                You retain 100% full ownership, title, and copyright to all blog posts, articles, and content generated through the Service for your website.
              </p>
              <p>
                In our isolated multi-tenant architecture, each tenant strictly owns the content produced for its profile. No other customer has access to, or rights in, your generated publications. You are solely responsible for reviewing and fact-checking generated content before publishing to your production domain.
              </p>
              <p>
                AI Blog SaaS retains all intellectual property in the underlying software, algorithms, brand assets, APIs, and multi-tenant infrastructure.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">4</span>
                Acceptable Use Policy
              </h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Generate deceptive, defamatory, unlawful, harassing, infringing, or malicious content.</li>
                <li>Engage in phishing scams, disinformation campaigns, or election manipulation.</li>
                <li>Attempt to bypass rate limits, break cross-tenant isolation, or reverse engineer platform endpoints.</li>
                <li>Resell, scrape, or sub-license the core platform infrastructure without explicit enterprise agreement.</li>
                <li>Interfere with platform stability, circuit breakers, or queue throughput.</li>
              </ul>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">5</span>
                Quotas, Subscriptions, and Billing
              </h2>
              <p>
                Service usage is metered according to your selected plan quota (number of articles per monthly cycle). Generation requests exceeding quota will be rejected until monthly reset or plan upgrade.
              </p>
              <p>
                Subscription plans renew automatically each billing period unless cancelled prior to renewal via the account dashboard. All paid fees are non-refundable except where mandated by applicable consumer protection laws.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">6</span>
                Disclaimers and Limitation of Liability
              </h2>
              <p className="uppercase text-xs tracking-wider font-semibold">
                The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not provide legal, financial, or medical advice.
              </p>
              <p>
                To the maximum extent permitted by law, AI Blog SaaS and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from service usage or generated content. Our maximum liability is limited to fees paid during the prior twelve (12) months.
              </p>
            </section>

            <Separator className="border-border/40" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-mono">7</span>
                Contact &amp; Support
              </h2>
              <p>
                For questions regarding these Terms or account security concerns, please contact our support team at <span className="font-mono text-xs text-foreground">support@growthservice.in</span>.
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
