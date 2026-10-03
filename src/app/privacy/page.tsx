import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Blog SaaS",
  description: "Privacy Policy for AI Blog SaaS API.",
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm">
              Effective Date: October 2026 · AI Blog SaaS Privacy Commitment
            </p>
          </div>

          <h2 className="text-foreground">1. Information We Collect</h2>
          <p>
            When you register for our API Service or Dashboard, we collect your name and email address. 
            Because AI Blog SaaS is operating as a <strong>100% Free Public Beta</strong>, we <strong>do not collect credit cards, bank accounts, or financial payment details</strong>. 
            We also store the website URLs and brand knowledge guidelines you submit to customize article tone and internal link structures.
          </p>

          <h2 className="text-foreground">2. API Usage Data & Operational Telemetry</h2>
          <p>
            When you make requests to our API endpoints (such as <code>/api/generate-blog</code>), we collect operational telemetry to guarantee service health:
          </p>
          <ul>
            <li>IP addresses and request user agents for security and noisy-neighbor rate limiting.</li>
            <li>Generation latency, model execution timings, and token consumption.</li>
            <li>Error codes, circuit breaker state, and retry telemetry.</li>
          </ul>
          <p>
            This data is used exclusively to enforce quota reservations, diagnose errors, and maintain platform stability. We do not sell or monetize user data.
          </p>

          <h2 className="text-foreground">3. Third-Party AI Inference & Non-Training Guarantees</h2>
          <p>
            To generate search-optimized articles, your blog topics and brand context are processed through our dual LLM inference layer powered by 
            <strong>Groq</strong> (Llama/Mixtral/GPT-OSS models) and <strong>Google Gemini</strong>. 
            We interact with these providers exclusively via enterprise API endpoints that are configured so that your prompt inputs and generated outputs are 
            <strong>not used to train their base foundation models</strong>.
          </p>

          <h2 className="text-foreground">4. API Key Protection & Cryptographic Security</h2>
          <p>
            Your API keys are protected using industry-grade SHA-256 cryptographic one-way hashing. 
            Raw API keys are never stored in plaintext within our database. Once shown to you upon creation, only the hash and a 4-character preview prefix 
            (e.g., <code>gs_live_••••1234</code>) are retained. All communications are encrypted in transit via TLS 1.3.
          </p>

          <h2 className="text-foreground">5. Data Ownership and Deletion Rights</h2>
          <p>
            You retain full ownership of your data and generated content. You can update or delete your brand knowledge, website profiles, and generated history 
            at any time directly from the client dashboard, or by contacting our team.
          </p>

          <h2 className="text-foreground">6. Contact Our Team</h2>
          <p>
            For privacy inquiries, security reports, or data export requests, please contact our support desk at <strong>support@growthservice.in</strong>.
          </p>
        </article>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
