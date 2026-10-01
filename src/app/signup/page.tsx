"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { createClient } from "@/lib/supabase/client";
import { directSignUpAction } from "@/lib/serverActions";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = new URLSearchParams(window.location.search).get("plan");
      if (plan) setSelectedPlan(plan.toLowerCase());
    }

    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace("/dashboard");
        }
      } catch {
        // Session lookup fallback
      }
    }
    checkSession();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long for account security.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Direct user creation with auto-confirmed email (no verification email needed)
      const res = await directSignUpAction({
        email: cleanEmail,
        password,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Immediately log in user with active session without asking them to log in again
      const supabase = createClient();
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInErr) {
        setErrorMessage(signInErr.message);
        setIsLoading(false);
        return;
      }

      // 3. Check if user already has an onboarded site or needs to complete onboarding
      const userId = signInData.user?.id || res.userId;
      let targetPath = selectedPlan ? `/onboard?plan=${encodeURIComponent(selectedPlan)}` : "/onboard";

      if (userId) {
        try {
          const { data: existingSite } = await supabase
            .from("site_profiles")
            .select("id")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

          if (existingSite?.id) {
            targetPath = `/dashboard?siteId=${existingSite.id}`;
          }
        } catch {
          // Fall through to /onboard
        }
      }

      // 4. Directly transition user into app
      router.replace(targetPath);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav rightContent={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-semibold hover:underline ml-1">
            Sign In
          </Link>
        </>
      } />

      {/* Main Center Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold tracking-tight">Create Your Account</CardTitle>
                {selectedPlan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 border border-primary/30 text-primary capitalize">
                    <Sparkles className="h-3 w-3" />
                    {selectedPlan === "pro"
                      ? "Growth Pro ($79/mo)"
                      : selectedPlan === "agency"
                      ? "Agency Scale ($249/mo)"
                      : "Starter ($29/mo)"}
                  </span>
                )}
              </div>
              <CardDescription className="text-xs">
                {selectedPlan
                  ? "Start your 14-day free trial on your selected tier. Instant setup."
                  : "Start your free trial. Direct registration with instant access to your AI blog engine."}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" />
                    Work Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-background/50 border-border/80 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-indigo-400" />
                    Password (min 8 characters)
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-background/50 border-border/80 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-background/50 border-border/80 text-sm font-mono"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <Button type="submit" size="sm" disabled={isLoading} className="w-full text-xs font-semibold gap-1.5">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating Account &amp; Logging In...
                    </>
                  ) : (
                    <>
                      Create Account &amp; Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
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
