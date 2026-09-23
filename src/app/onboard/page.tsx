"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { selfServeOnboardAction } from "@/lib/serverActions";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Building2,
  BookOpen,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signup");
        } else {
          setUserEmail(user.email || null);
          setUserId(user.id);
        }
      } catch {
        // Allow in development/testing
      }
    }
    checkAuth();
  }, [router]);

  // Form State
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [brandKnowledge, setBrandKnowledge] = useState("");
  const [tone, setTone] = useState("authoritative, actionable, conversion-focused");
  const [targetAudience, setTargetAudience] = useState("potential clients and industry professionals");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!siteName.trim()) {
      setErrorMessage("Please enter your business or website name.");
      setStep(1);
      return;
    }
    if (!domain.trim()) {
      setErrorMessage("Please enter your website domain (e.g., example.com).");
      setStep(1);
      return;
    }
    if (!brandKnowledge.trim()) {
      setErrorMessage("Please describe what your business does and the problems you solve.");
      setStep(2);
      return;
    }

    setIsLoading(true);

    try {
      const res = await selfServeOnboardAction({
        site_name: siteName,
        domain: domain,
        brand_knowledge: brandKnowledge,
        tone: tone,
        target_audience: targetAudience,
        user_id: userId || undefined,
      });

      if (!res.success || !res.siteId) {
        setErrorMessage(res.error || "Failed to create your brand account.");
        setIsLoading(false);
        return;
      }

      // Redirect to client dashboard where key is generated on-demand
      router.push(`/dashboard?siteId=${res.siteId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Minimal Nav */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight">AI Blog SaaS</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-[11px]">
                <CheckCircle2 className="h-3 w-3" />
                Verified: {userEmail}
              </span>
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                <Link href="/auth/signout">Sign Out</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Already have an account?</span>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium">Your Website</span>
            </div>

            <Separator className="w-16 bg-border/60" />

            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium">Your Brand Voice</span>
            </div>
          </div>

          {/* Onboarding Form Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {step === 1 ? "Connect Your Website" : "Set Your Brand Voice"}
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[11px]">
                  Step {step} of 2
                </Badge>
              </div>
              <CardDescription>
                {step === 1
                  ? "Tell us where your articles will be published to automatically link back to your business."
                  : "Help our system write with your exact expertise, terminology, and preferred tone."}
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

                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        Company or Business Name
                      </label>
                      <Input
                        placeholder="e.g. Bright Dental Studio, Peak Commerce, Acme Growth"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        required
                        className="bg-background/50 border-border/80 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-indigo-400" />
                        Your Website Address
                      </label>
                      <Input
                        placeholder="e.g. brightdental.com or peakcommerce.io"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                        className="bg-background/50 border-border/80 text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Your articles will naturally link back to this website to boost your Google search authority.
                      </p>
                    </div>

                    {/* Security notice */}
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground mt-4">
                      <Lock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">Private &amp; Secure Access</span>
                        <p className="mt-0.5 text-[11px] leading-relaxed">
                          Your secret publishing key will be safely generated on-demand inside your private dashboard, ensuring complete privacy for your website.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                        What does your business offer?
                      </label>
                      <Textarea
                        placeholder="Describe your core products, services, solutions, and what makes your business the best choice for clients..."
                        rows={4}
                        value={brandKnowledge}
                        onChange={(e) => setBrandKnowledge(e.target.value)}
                        required
                        className="bg-background/50 border-border/80 text-sm resize-none"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Our engine uses this background to write authoritative articles that highlight your real-world solutions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Preferred Writing Style</label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger className="bg-background/50 border-border/80 text-xs">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="authoritative, actionable, conversion-focused">
                              Authoritative &amp; Professional (Best for B2B)
                            </SelectItem>
                            <SelectItem value="engaging, conversational, relatable">
                              Friendly &amp; Relatable (Best for Brands)
                            </SelectItem>
                            <SelectItem value="technical, rigorous, developer-friendly">
                              In-Depth &amp; Tactical (Best for Services)
                            </SelectItem>
                            <SelectItem value="executive, data-driven, strategic">
                              Executive &amp; Strategic (Corporate)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          Target Audience
                        </label>
                        <Input
                          placeholder="e.g. Clinic owners, homeowners, SaaS buyers"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="bg-background/50 border-border/80 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4">
                {step === 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step === 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!siteName.trim() || !domain.trim()) {
                        setErrorMessage("Please enter both your business name and website address.");
                        return;
                      }
                      setErrorMessage(null);
                      setStep(2);
                    }}
                    className="text-xs gap-1.5"
                  >
                    Continue to Brand Voice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button type="submit" size="sm" disabled={isLoading} className="text-xs gap-1.5">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Setting Up Dashboard...
                      </>
                    ) : (
                      <>
                        Launch My Blog Portal
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Blog SaaS Platform. Professional Organic Publishing for Modern Businesses.
      </footer>
    </div>
  );
}
