"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  Cpu,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      {/* Background orb */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI Blog Generation Platform
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            CLUSTER ACTIVE • DUAL LLM FAILOVER
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-2xl shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Secure Access
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Enter your admin password to access the console
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                SHA-256 Verified
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Admin Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter admin password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 font-mono text-sm"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Access Admin Console
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Client login escape */}
        <div className="text-center text-xs text-muted-foreground">
          Looking for your client dashboard?{" "}
          <Link href="/login" className="text-foreground hover:underline font-medium">
            Client Sign In &rarr;
          </Link>
        </div>

        {/* Provider status strip */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-orange-400" />
            <span>Groq Primary</span>
          </div>
          <span className="text-muted-foreground/40">→</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-blue-400" />
            <span>Gemini Fallback</span>
          </div>
        </div>
      </div>
    </div>
  );
}
