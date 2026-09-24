import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { getDbClient, localSiteProfiles } from "@/lib/db";
import { verifySiteOwnership } from "@/lib/serverActions";
import { isStripeConfigured } from "@/lib/billing";
import type { SiteProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { siteId } = body || {};

    if (!siteId || typeof siteId !== "string") {
      return NextResponse.json({ error: "Field 'siteId' is required." }, { status: 400 });
    }

    // 2. Verify site ownership
    const isOwner = await verifySiteOwnership(siteId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access denied. You do not own this website profile." },
        { status: 403 }
      );
    }

    // 3. Retrieve site profile
    let profile: SiteProfile | null = null;
    try {
      const db = getDbClient();
      const { data } = await db.from("site_profiles").select("*").eq("id", siteId).single();
      if (data) profile = data as SiteProfile;
    } catch {
      // Local fallback
    }
    if (!profile) profile = localSiteProfiles.get(siteId) || null;

    const origin = request.headers.get("origin") || "http://localhost:3000";

    if (!isStripeConfigured() || !profile?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "No active Stripe customer found for this website. Subscribe to a plan first.",
        },
        { status: 400 }
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard?siteId=${siteId}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to open billing portal";
    console.error("[billing/portal] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
