"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import {
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setCooldown(60);

      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav rightContent={
        <>
          Remember your password?{" "}
          <Link href="/login" className="text-foreground font-semibold hover:underline ml-1">
            Sign In
          </Link>
        </>
      } />

      {/* Main Center Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">
                Reset Account Password
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter your registered email and we&apos;ll send you a secure password recovery link.
              </CardDescription>
            </CardHeader>

            {isSuccess ? (
              <CardContent className="space-y-4 pt-2">
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Password Reset Link Dispatched</span>
                  </div>
                  <p className="leading-relaxed">
                    We&apos;ve sent an email to <strong className="text-foreground font-mono">{email}</strong> with instructions to reset your password.
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Didn&apos;t receive it? Check your spam folder or request another link below once the cooldown expires.
                </p>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={cooldown > 0 || isLoading}
                    onClick={handleResetRequest}
                    className="text-xs"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Reset Link"}
                  </Button>

                  <Button asChild size="sm" variant="ghost" className="text-xs">
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleResetRequest}>
                <CardContent className="space-y-4 pt-2">
                  {errorMessage && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Account Email Address
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
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t border-border/40 pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full text-xs font-semibold gap-1.5">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Recovery Link
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-xs text-muted-foreground hover:underline">
                      &larr; Return to Sign In
                    </Link>
                  </div>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </main>

      <MiniAuthFooter />
    </div>
  );
}
