import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Blog SaaS | Publish SEO Articles on Autopilot",
  description: "Grow your website traffic with AI-written, SEO-optimized blog posts. Publish in 2 minutes. Trusted by growing brands and digital agencies.",
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
