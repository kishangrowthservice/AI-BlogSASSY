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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground m-0">
              Terms of Service
            </h1>
            <p className="text-sm">
              <strong>Note:</strong> This is a boilerplate legal template provided for demonstration. 
              Before using this in production, consult a legal professional.
            </p>
            <p className="text-sm">Last Updated: October 2026</p>
          </div>

          <h2 className="text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the AI Blog SaaS API and platform (collectively, the &quot;Service&quot;), 
            you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using these particular services, you shall be subject to any posted 
            guidelines or rules applicable to such services.
          </p>

          <h2 className="text-foreground">2. Description of Service</h2>
          <p>
            AI Blog SaaS provides an autonomous AI-driven blog generation API, allowing developers 
            and businesses to programmatically generate search-optimized, brand-aligned content. 
            The Service includes API access, usage dashboards, and automated website crawlers.
          </p>

          <h2 className="text-foreground">3. API Usage and Rate Limiting</h2>
          <p>
            You agree to access the API only using the authentication credentials provided to you. 
            You are responsible for keeping your API key confidential. Your use of the API is subject 
            to rate limits and monthly quotas as determined by your subscription tier. We reserve 
            the right to throttle, suspend, or terminate your access if your usage constitutes 
            a Denial of Service, or otherwise disrupts the infrastructure for other tenants.
          </p>

          <h2 className="text-foreground">4. Acceptable Use Policy</h2>
          <p>
            You agree not to use the Service to generate, distribute, or promote:
          </p>
          <ul>
            <li>Spam, bulk unsolicited content, or SEO link-farming networks.</li>
            <li>Content that violates intellectual property rights.</li>
            <li>Defamatory, discriminatory, or illegal material.</li>
            <li>Malicious code or attempts to exploit vulnerabilities.</li>
          </ul>

          <h2 className="text-foreground">5. Billing and Payments</h2>
          <p>
            The Service is billed on a subscription basis. You will be billed in advance on a recurring 
            and periodic basis. In the event of a billing failure, your API access will be suspended 
            until payment is successfully processed. All fees are non-refundable unless otherwise 
            required by law.
          </p>

          <h2 className="text-foreground">6. Limitation of Liability</h2>
          <p>
            In no event shall AI Blog SaaS, nor its directors, employees, partners, agents, suppliers, 
            or affiliates, be liable for any indirect, incidental, special, consequential or punitive 
            damages, including without limitation, loss of profits, data, use, goodwill, or other 
            intangible losses, resulting from (i) your access to or use of or inability to access or 
            use the Service; (ii) any content obtained from the Service; and (iii) unauthorized access, 
            use or alteration of your transmissions or content.
          </p>

          <h2 className="text-foreground">7. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will try to provide at least 30 days&apos; notice prior to any 
            new terms taking effect.
          </p>

        </article>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
