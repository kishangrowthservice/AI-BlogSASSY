"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowResend(false);
    setResendSuccess(false);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Your email has not been verified yet. Please check your inbox or resend the link below.");
          setShowResend(true);
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Check where to route the user
      if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred during sign in.");
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    setErrorMessage(null);

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
        setResendSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend confirmation email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight">AI Blog SaaS</span>
        </Link>

        <div className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground font-semibold hover:underline">
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Main Center Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-xs">
                Welcome back. Access your website publishing dashboard.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {resendSuccess && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                    A new verification link has been sent to your email.
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
                    Password
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

                {showResend && (
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className="w-full text-xs gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                      Resend Verification Email
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <Button type="submit" size="sm" disabled={isLoading} className="w-full text-xs font-semibold gap-1.5">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs text-muted-foreground w-full pt-1">
                  <Link href="/" className="hover:underline text-[11px] text-muted-foreground">
                    &larr; Back to Home
                  </Link>
                  <Link href="/signup" className="text-foreground hover:underline text-[11px] font-medium">
                    Create new account &rarr;
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Blog SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
}
