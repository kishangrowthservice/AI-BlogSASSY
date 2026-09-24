"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home, LayoutDashboard } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for client-side telemetry
    console.error("[Application Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-8 selection:bg-primary/20">
      <Card className="max-w-md w-full border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Something Went Wrong
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            An unexpected error occurred while rendering this view. Our telemetry has recorded this event.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 text-center">
          {error.message && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-mono break-all text-left">
              {error.message}
            </div>
          )}
          {error.digest && (
            <p className="text-[10px] text-muted-foreground font-mono">
              Error Digest: {error.digest}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-border/40 pt-4">
          <Button
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>

          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1.5">
            <Link href="/dashboard">
              <LayoutDashboard className="h-3.5 w-3.5" />
              My Dashboard
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto text-xs gap-1.5 text-muted-foreground">
            <Link href="/">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
