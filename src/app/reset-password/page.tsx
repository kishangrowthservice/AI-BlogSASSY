"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { MiniAuthNav, MiniAuthFooter } from "@/components/navigation/MiniAuthNav";
import {
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update account password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      <MiniAuthNav />

      {/* Main Center Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">
                Set New Password
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter your new account password below (minimum 8 characters).
              </CardDescription>
            </CardHeader>

            {isSuccess ? (
              <CardContent className="space-y-4 pt-2">
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Password Updated Successfully</span>
                  </div>
                  <p className="leading-relaxed">
                    Your password has been changed. Redirecting to your dashboard...
                  </p>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4 pt-2">
                  {errorMessage && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-background/50 border-border/80 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Updating Password...
                      </>
                    ) : (
                      <>
                        Update Password &amp; Proceed
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
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
