import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Home, LayoutDashboard, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-8 selection:bg-primary/20">
      <Card className="max-w-md w-full border-border/80 bg-card/60 backdrop-blur-2xl shadow-2xl text-center">
        <CardHeader className="pb-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <span className="font-mono text-3xl font-extrabold text-foreground">404</span>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground mt-1">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            The destination page you requested does not exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-border/40 pt-4 mt-2">
          <Button asChild size="sm" className="w-full sm:w-auto text-xs font-semibold gap-1.5">
            <Link href="/dashboard">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1.5">
            <Link href="/">
              <Home className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
