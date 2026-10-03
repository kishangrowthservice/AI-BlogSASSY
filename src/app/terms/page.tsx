import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";

export const metadata: Metadata = {
  title: "Terms of Service | AI Blog SaaS",
  description: "Terms of Service for AI Blog SaaS API.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav rightContent={
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Sign In
        </Link>
      } />

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 lg:p-12">
        <article className="prose prose-sm sm:prose-base prose-invert max-w-none text-muted-foreground">
          <div className="mb-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Public Beta · 100% Free in Production
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground m-0">
              Terms of Service
            </h1>
            <p className="text-sm">
              Effective Date: October 2026 · AI Blog SaaS Public Beta Agreement
            </p>
          </div>

          <h2 className="text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the AI Blog SaaS API, web dashboards, and related syndication tools (collectively, the &quot;Service&quot;), 
            you accept and agree to be bound by these terms. If you do not agree to these terms, please discontinue use of the platform.
          </p>

          <h2 className="text-foreground">2. Free Public Beta Access</h2>
          <p>
            AI Blog SaaS is currently operating as a <strong>100% Free Public Beta in production</strong>. During this beta phase:
          </p>
          <ul>
            <li>All platform features, generation engines, and developer APIs are available at <strong>no cost</strong>.</li>
            <li>No credit card or billing details are required to sign up, generate articles, or access the REST API.</li>
            <li>Generous monthly quota reservations are provided across tiers to allow comprehensive testing and integration.</li>
          </ul>

          <h2 className="text-foreground">3. Dual LLM Architecture & Provider Resilience</h2>
          <p>
            AI Blog SaaS generates content using a redundant <strong>dual LLM architecture</strong> combining Groq and Google Gemini. 
            The system automatically routes requests across these providers to ensure high availability. By using the Service, 
            you acknowledge that generation prompts may be processed by either engine according to system load and circuit breaker health.
          </p>

          <h2 className="text-foreground">4. API Usage and Fair Use Policy</h2>
          <p>
            You agree to access the API only using authentication credentials provided to you. You are responsible for keeping your API key confidential. 
            Usage is governed by an automated fair use policy and rate limiting to prevent infrastructure abuse and ensure equal access for all tenants.
          </p>

          <h2 className="text-foreground">5. Intellectual Property & Content Ownership</h2>
          <p>
            <strong>You retain 100% intellectual property ownership</strong> of all articles, outlines, and outputs generated through your account. 
            AI Blog SaaS claims no ownership over your generated content. You are free to publish, syndicate, modify, or commercially license all output.
          </p>

          <h2 className="text-foreground">6. Acceptable Use Policy</h2>
          <p>
            You agree not to use the Service to generate, distribute, or promote:
          </p>
          <ul>
            <li>Spam, automated link-farming networks, or malicious SEO manipulations.</li>
            <li>Content that infringes third-party intellectual property rights.</li>
            <li>Defamatory, fraudulent, harassing, or unlawful material.</li>
            <li>Denial of Service attacks or attempts to exploit backend endpoints.</li>
          </ul>

          <h2 className="text-foreground">7. No Fees During Beta & Future Pricing Notice</h2>
          <p>
            All services are completely free during the current production release. If paid commercial tiers or paid add-ons are introduced in the future, 
            existing users will receive advance notification, and no charges will ever occur without explicit user consent.
          </p>

          <h2 className="text-foreground">8. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; during the public beta. AI Blog SaaS shall not be liable for any indirect, 
            incidental, or consequential damages resulting from platform downtime or AI-generated outputs.
          </p>

        </article>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
