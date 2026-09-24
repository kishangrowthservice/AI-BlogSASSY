"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Verification Sent State
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long for account and API key security.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // If user created, show verification screen
      setIsVerificationSent(true);
      setResendCooldown(60);

      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend confirmation email.");
    } finally {
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
          {isVerificationSent ? (
            /* EMAIL VERIFICATION SENT STATE */
            <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl text-center p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6 text-indigo-400 animate-bounce" />
              </div>

              <CardHeader className="p-0">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                  Check Your Inbox
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  We sent a secure verification link to:
                  <div className="font-mono font-medium text-foreground text-sm mt-1">{email}</div>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Click the link in the email to <strong>automatically log in</strong> and set up your brand blog. You won&apos;t need to re-enter your password!
                </p>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground text-left">
                  💡 <span className="font-semibold text-foreground">Tip:</span> If you don&apos;t see the email within 1 minute, check your Spam or Promotions folder.
                </div>
              </CardContent>

              <CardFooter className="p-0 pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="w-full text-xs gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend Verification Link"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVerificationSent(false)}
                  className="text-xs text-muted-foreground"
                >
                  Use a different email address
                </Button>
              </CardFooter>
            </Card>
          ) : (
            /* SIGNUP FORM */
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
                    ? "Start your 14-day free trial on your selected tier. No charge until trial completes."
                    : "Start your free trial. We'll verify your email before setting up your website."}
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
                      className="bg-background/50 border-border/80 text-sm font-mono"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t border-border/40 pt-4">
                  <Button type="submit" size="sm" disabled={isLoading} className="w-full text-xs font-semibold gap-1.5">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account &amp; Send Verification Link
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
          )}
        </div>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
