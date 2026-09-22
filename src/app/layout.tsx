import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Blog Engine | Multi-Tenant Content Generation Platform",
  description: "Stateless, multi-tenant AI blog generation gateway with instant fallback and noisy-neighbor protection.",
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
