"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import { createClient } from "@/lib/supabase/client";
import { autoConfirmUserAction } from "@/lib/serverActions";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      // If user had unconfirmed email from a legacy signup, automatically confirm and retry
      if (error && error.message.toLowerCase().includes("email not confirmed")) {
        const autoConfirm = await autoConfirmUserAction(cleanEmail);
        if (autoConfirm.success) {
          const retryRes = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });
          data = retryRes.data;
          error = retryRes.error;
        }
      }

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Route user to their existing site dashboard or onboarding if first time
        try {
          const { data: existingSite } = await supabase
            .from("site_profiles")
            .select("id")
            .eq("user_id", data.user.id)
            .limit(1)
            .maybeSingle();

          if (existingSite?.id) {
            router.replace(`/dashboard?siteId=${existingSite.id}`);
          } else {
            router.replace("/onboard");
          }
        } catch {
          router.replace("/dashboard");
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred during sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav rightContent={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground font-semibold hover:underline ml-1">
            Sign Up Free
          </Link>
        </>
      } />

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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-indigo-400" />
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] text-muted-foreground hover:text-indigo-400 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
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

      <MiniAuthFooter />
    </div>
  );
}
