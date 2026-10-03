import { getDbClient, localSiteProfiles, invalidateProfileCache } from "./db";
import type { SiteProfile } from "./types";

export interface PlanTierConfig {
  id: "starter" | "pro" | "agency";
  name: string;
  monthlyQuota: number;
  priceMonthly: number;
  stripePriceId?: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export const PLAN_TIERS: Record<string, PlanTierConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyQuota: 25,
    priceMonthly: 0,
    description: "Ideal for personal blogs and testing automated SEO publishing.",
    features: [
      "25 SEO Articles / month",
      "Dual LLM Engine (Groq + Gemini)",
      "Standard Queue Processing",
      "Automatic Internal Link Injection",
      "Live Content Studio Preview",
      "Standard Community Support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Growth",
    monthlyQuota: 100,
    priceMonthly: 49,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    description: "For scaling businesses wanting consistent high-ranking organic traffic.",
    features: [
      "100 SEO Articles / month",
      "Priority Groq Token Processing",
      "Instant Queue Burst Smoothing",
      "Automated CMS Webhooks",
      "Interactive Article History Viewer",
      "Dedicated Brand Tone Calibration",
    ],
    recommended: true,
  },
  agency: {
    id: "agency",
    name: "Agency Scale",
    monthlyQuota: 500,
    priceMonthly: 199,
    stripePriceId: process.env.STRIPE_PRICE_ID_AGENCY,
    description: "Designed for content agencies and multi-brand operators.",
    features: [
      "500 SEO Articles / month",
      "Multi-Domain Site Switcher",
      "Custom AI Accounts (BYO Keys)",
      "Automated CMS Webhooks & API",
      "Highest Queue Worker Priority",
      "Dedicated Technical SLA Support",
    ],
  },
};

/**
 * Returns configuration for a specified plan tier, defaulting to starter.
 */
export function getPlanTier(tierId?: string | null): PlanTierConfig {
  if (tierId && tierId in PLAN_TIERS) {
    return PLAN_TIERS[tierId];
  }
  return PLAN_TIERS.starter;
}

/**
 * Checks whether live Stripe credentials are configured in the environment.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_"));
}

/**
 * Updates a tenant site's subscription status and monthly quota atomically.
 */
export async function updateTenantSubscription(
  siteId: string,
  planId: "starter" | "pro" | "agency" | string,
  options?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
): Promise<{ success: boolean; newQuota: number; error?: string }> {
  const plan = getPlanTier(planId);
  const newQuota = plan.monthlyQuota;

  const updatePayload: Partial<SiteProfile> = {
    plan_tier: plan.id,
    monthly_quota: newQuota,
  };

  if (options?.stripeCustomerId) {
    updatePayload.stripe_customer_id = options.stripeCustomerId;
  }
  if (options?.stripeSubscriptionId !== undefined) {
    updatePayload.stripe_subscription_id = options.stripeSubscriptionId;
  }

  try {
    const supabase = getDbClient();
    const { error } = await supabase
      .from("site_profiles")
      .update(updatePayload)
      .eq("id", siteId);

    if (error) {
      console.warn("[billing] Database update error (falling back to memory):", error.message);
    }
  } catch (err: any) {
    console.warn("[billing] DB connection error during subscription update:", err?.message);
  }

  // Update in-memory profile store
  const local = localSiteProfiles.get(siteId);
  if (local) {
    local.plan_tier = plan.id;
    local.monthly_quota = newQuota;
    if (options?.stripeCustomerId) local.stripe_customer_id = options.stripeCustomerId;
    if (options?.stripeSubscriptionId !== undefined) local.stripe_subscription_id = options.stripeSubscriptionId;
  }

  // Invalidate any cached profile reads
  invalidateProfileCache(siteId);

  return { success: true, newQuota };
}
