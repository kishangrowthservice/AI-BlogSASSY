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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground m-0">
              Privacy Policy
            </h1>
            <p className="text-sm">
              <strong>Note:</strong> This is a boilerplate legal template provided for demonstration. 
              Before using this in production, consult a legal professional.
            </p>
            <p className="text-sm">Last Updated: October 2026</p>
          </div>

          <h2 className="text-foreground">1. Information We Collect</h2>
          <p>
            When you register for our API Service, we collect personal information such as your name, 
            email address, and billing details. We also collect the URLs of the websites you onboard 
            into our system to provide our crawling and tuning services.
          </p>

          <h2 className="text-foreground">2. API Usage Data and Telemetry</h2>
          <p>
            We collect diagnostic and telemetry data automatically when you interact with our API. 
            This includes:
          </p>
          <ul>
            <li>IP addresses and user agents of API requests.</li>
            <li>Request latency, token usage, and payload sizes.</li>
            <li>Error logs and stack traces.</li>
          </ul>
          <p>
            This data is used strictly to enforce rate limits, calculate billing, and ensure the 
            stability of the Service.
          </p>

          <h2 className="text-foreground">3. Third-Party AI Providers</h2>
          <p>
            In order to generate content, the data you send to our API (such as blog topics, keywords, 
            and crawled website context) is processed by third-party Large Language Model providers 
            (including Google and Groq). We configure these integrations such that your data is 
            not used to train their base models; however, their respective privacy policies also apply 
            to data processed through their endpoints.
          </p>

          <h2 className="text-foreground">4. Data Security</h2>
          <p>
            We implement robust security measures to protect your data. API keys are hashed in our 
            database and are never stored in plaintext. We utilize industry-standard encryption for 
            data at rest and in transit. However, no method of transmission over the Internet is 100% 
            secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-foreground">5. Your Data Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to request access to, correction of, 
            or deletion of your personal data. You may also have the right to export your API usage 
            logs. To exercise these rights, please contact our support team.
          </p>

          <h2 className="text-foreground">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at legal@growthservice.in.
          </p>
        </article>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
