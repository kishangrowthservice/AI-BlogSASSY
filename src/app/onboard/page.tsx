"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { startSiteOnboardUrlAction } from "@/lib/serverActions";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Loader2,
  AlertCircle,
  Network,
  Bot,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function OnboardPage() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = new URLSearchParams(window.location.search).get("plan");
      if (plan) setSelectedPlan(plan.toLowerCase());
    }

    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signup");
          return;
        }

        // If user already has an onboarded site, send to dashboard unless adding new site (?new=true)
        const isExplicitNew = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "true";
        if (!isExplicitNew) {
          const { data: existingSite } = await supabase
            .from("site_profiles")
            .select("id")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          if (existingSite?.id) {
            router.replace(`/dashboard?siteId=${existingSite.id}`);
          }
        }
      } catch {
        // Fallback
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = websiteUrl.trim();
    if (!clean) {
      setErrorMessage("Please enter your website URL.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await startSiteOnboardUrlAction({
        websiteUrl: clean,
        selectedPlan,
      });

      if (!res.success || !res.siteId) {
        setErrorMessage(res.error || "Failed to initialize site onboarding.");
        setIsLoading(false);
        return;
      }

      // Immediately route to dashboard with live crawling card running!
      router.replace(`/dashboard?siteId=${res.siteId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during onboarding.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav
        rightContent={
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Autonomous Crawler Ready
          </span>
        }
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              1-Step Intelligent Onboarding
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Connect Your Website
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Provide your website URL. Our autonomous crawler will deeply scan 15+ pages, extract your brand tone, map internal backlinks, and configure your custom AI publishing engine.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-400" />
                  Website URL
                </CardTitle>
                {selectedPlan && (
                  <Badge variant="outline" className="capitalize text-xs font-medium border-primary/30 text-primary">
                    {selectedPlan} Plan
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                We support any custom domain, WordPress, Webflow, Ghost, Shopify, or headless site.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    Your Site Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-xs font-mono text-muted-foreground select-none">
                      https://
                    </div>
                    <Input
                      type="text"
                      placeholder="yourbrand.com or company.io/blog"
                      value={websiteUrl.replace(/^https?:\/\//i, "")}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-20 bg-background/50 border-border/80 text-sm font-mono h-11"
                    />
                  </div>
                </div>

                {/* Live Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 flex items-start gap-2">
                    <Network className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-tight">
                      <div className="font-semibold text-foreground">15+ Page Spider</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">Sitemap &amp; nav deep scan</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 flex items-start gap-2">
                    <Bot className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-tight">
                      <div className="font-semibold text-foreground">Voice Synthesis</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">Custom editorial persona</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 flex items-start gap-2">
                    <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-tight">
                      <div className="font-semibold text-foreground">Internal Link Map</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">Automatic contextual SEO</div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full text-xs sm:text-sm font-semibold gap-2 h-11 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning Domain &amp; Launching Engine...
                    </>
                  ) : (
                    <>
                      Scan Website &amp; Generate AI Engine
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  By connecting your website, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                    Privacy Policy
                  </Link>.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
