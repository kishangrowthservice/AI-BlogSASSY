import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { getDbClient, localSiteProfiles } from "@/lib/db";
import { verifySiteOwnership } from "@/lib/serverActions";
import { getPlanTier, isStripeConfigured, updateTenantSubscription } from "@/lib/billing";
import type { SiteProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Authenticate calling user session
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { siteId, planId } = body || {};

    if (!siteId || typeof siteId !== "string") {
      return NextResponse.json({ error: "Field 'siteId' is required." }, { status: 400 });
    }

    if (!planId || !["pro", "agency"].includes(planId)) {
      return NextResponse.json({ error: "Invalid planId. Must be 'pro' or 'agency'." }, { status: 400 });
    }

    // 3. Strictly verify site ownership
    const isOwner = await verifySiteOwnership(siteId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access denied. You do not own this website profile." },
        { status: 403 }
      );
    }

    // 4. Retrieve current site profile
    let profile: SiteProfile | null = null;
    try {
      const db = getDbClient();
      const { data } = await db.from("site_profiles").select("*").eq("id", siteId).single();
      if (data) profile = data as SiteProfile;
    } catch {
      // Fallback to local store
    }
    if (!profile) profile = localSiteProfiles.get(siteId) || null;

    const plan = getPlanTier(planId);
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // 5. If Stripe keys are configured, generate real Stripe Checkout Session
    if (isStripeConfigured()) {
      // Dynamic import to avoid runtime crash if stripe package is optional
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2025-02-24.acacia" as any,
      });

      const lineItems = plan.stripePriceId
        ? [{ price: plan.stripePriceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `AI Blog SaaS - ${plan.name} Plan`,
                  description: `${plan.monthlyQuota} SEO Articles per month with priority generation`,
                },
                unit_amount: plan.priceMonthly * 100,
                recurring: { interval: "month" as const },
              },
              quantity: 1,
            },
          ];

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: profile?.stripe_customer_id ? undefined : user.email,
        customer: profile?.stripe_customer_id || undefined,
        client_reference_id: siteId,
        metadata: {
          siteId,
          planId: plan.id,
          userId: user.id,
        },
        line_items: lineItems,
        success_url: `${origin}/dashboard?siteId=${siteId}&upgrade=success&plan=${plan.id}`,
        cancel_url: `${origin}/dashboard?siteId=${siteId}&upgrade=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    // 6. Test / Demo Simulation Mode (when STRIPE_SECRET_KEY is not yet configured)
    await updateTenantSubscription(siteId, plan.id);
    return NextResponse.json({
      url: `${origin}/dashboard?siteId=${siteId}&upgrade=success&plan=${plan.id}`,
      simulated: true,
      message: `Upgraded to ${plan.name} plan (${plan.monthlyQuota} articles/mo) in Test Mode.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initialize checkout session";
    console.error("[billing/checkout] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
