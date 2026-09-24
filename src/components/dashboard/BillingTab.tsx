"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Zap,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SafeSiteProfile } from "@/lib/sanitize";
import { PLAN_TIERS, getPlanTier } from "@/lib/billing";

interface BillingTabProps {
  profile: SafeSiteProfile;
}

export function BillingTab({ profile }: BillingTabProps) {
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const currentPlan = getPlanTier(profile.plan_tier);
  const quotaPercent = Math.min(
    100,
    Math.round(((profile.used_quota || 0) / (profile.monthly_quota || 1)) * 100)
  );

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: profile.id, planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Upgrade checkout failed:", err);
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: profile.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Customer portal launch failed:", err);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" />
            Billing &amp; Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your monthly article capacity, upgrade tier, or view invoices via Stripe.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleOpenPortal}
          disabled={isLoadingPortal}
          className="text-xs font-semibold gap-1.5 h-9 border-border/80"
        >
          {isLoadingPortal ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span>Stripe Billing Portal</span>
        </Button>
      </div>

      {/* Current Plan Overview Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">Current Subscription: {currentPlan.name}</CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                  ● ACTIVE
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Your plan includes up to {profile.monthly_quota} articles per 30-day billing cycle.
              </CardDescription>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground font-mono">
                ${currentPlan.priceMonthly}
              </span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cycle Generation Usage</span>
              <span className="font-mono font-semibold text-foreground">
                {profile.used_quota || 0} of {profile.monthly_quota} articles used ({quotaPercent}%)
              </span>
            </div>
            <Progress value={quotaPercent} className="h-2 bg-muted/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-muted-foreground text-[11px] block">Quota Remaining</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {(profile.monthly_quota || 0) - (profile.used_quota || 0)} posts
              </span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-muted-foreground text-[11px] block">Reset Cycle</span>
              <span className="font-mono font-bold text-foreground text-sm">Every 30 Days</span>
            </div>
            <div className="p-3 rounded-lg border border-border/50 bg-background/50">
              <span className="text-muted-foreground text-[11px] block">Invoices &amp; Receipts</span>
              <span className="font-semibold text-primary text-sm cursor-pointer hover:underline" onClick={handleOpenPortal}>
                View on Stripe &rarr;
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Comparison Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Available Plan Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(PLAN_TIERS).map((plan) => {
            const isCurrent = (profile.plan_tier || "starter") === plan.id;
            const isUpgrading = upgradingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between relative backdrop-blur-xl transition-all ${
                  plan.id === "pro"
                    ? "border-indigo-500/60 bg-card/80 shadow-xl shadow-indigo-500/10"
                    : "border-border/70 bg-card/40 shadow-sm"
                }`}
              >
                {plan.id === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-[10px] px-3 font-semibold">
                      RECOMMENDED FOR GROWTH
                    </Badge>
                  </div>
                )}

                <CardHeader className={plan.id === "pro" ? "pt-7" : "pt-6"}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs min-h-[30px]">{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-foreground font-mono">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs text-muted-foreground">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={fIdx === 0 ? "font-semibold text-foreground" : ""}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="border-t border-border/40 pt-4">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full text-xs font-semibold cursor-default"
                    >
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={Boolean(upgradingPlan)}
                      className={`w-full text-xs font-semibold ${
                        plan.id === "pro"
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : ""
                      }`}
                      variant={plan.id === "pro" ? "default" : "outline"}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          Redirecting to Stripe...
                        </>
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
