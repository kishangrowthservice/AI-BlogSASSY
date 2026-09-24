import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://growthservice.in"),
  title: {
    default: "AI Blog Generator | Automated SEO Blog Writing Platform",
    template: "%s | AI Blog SaaS",
  },
  description:
    "Generate and publish SEO-optimized blog posts automatically. AI Blog SaaS connects to WordPress, Shopify, Webflow, and custom websites with dual-LLM fallback.",
  keywords: [
    "AI blog generator",
    "automated SEO blog writing",
    "CMS webhook publishing",
    "WordPress AI blog plugin",
    "dual LLM fallback",
    "organic traffic generation",
  ],
  authors: [{ name: "Growth Service AI" }],
  creator: "Growth Service AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AI Blog SaaS",
    title: "AI Blog Generator | Automated SEO Blog Writing Platform",
    description:
      "Generate and publish SEO-optimized blog posts automatically with dual-LLM fallback (Groq + Gemini).",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Blog Generator | Automated SEO Blog Writing Platform",
    description:
      "Generate and publish SEO-optimized blog posts automatically with dual-LLM fallback (Groq + Gemini).",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        {children}
      </body>
    </html>
  );
}
