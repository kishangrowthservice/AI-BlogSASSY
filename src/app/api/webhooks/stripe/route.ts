import { NextResponse } from "next/server";
import { getDbClient, localSiteProfiles } from "@/lib/db";
import { updateTenantSubscription } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  let event: any;

  try {
    const rawBody = await request.text();

    if (webhookSecret && signature) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2025-02-24.acacia" as any,
      });

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // In local development or testing without webhook secrets
      event = JSON.parse(rawBody);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("[webhooks/stripe] Signature error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const siteId = session.client_reference_id || session.metadata?.siteId;
        const planId = session.metadata?.planId || "pro";
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (siteId) {
          console.log(`[webhooks/stripe] Upgrading tenant ${siteId} to ${planId}`);
          await updateTenantSubscription(siteId, planId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        if (status === "active") {
          // Identify tenant by stripe_customer_id
          const supabase = getDbClient();
          const { data } = await supabase
            .from("site_profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
            .single();

          if (data?.id) {
            console.log(`[webhooks/stripe] Active subscription renewed for site ${data.id}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Downgrade tenant to Starter (25 posts)
        try {
          const supabase = getDbClient();
          const { data } = await supabase
            .from("site_profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
            .single();

          if (data?.id) {
            console.log(`[webhooks/stripe] Subscription canceled: downgrading site ${data.id} to Starter`);
            await updateTenantSubscription(data.id, "starter");
          }
        } catch (err) {
          console.error("[webhooks/stripe] Downgrade error:", err);
        }
        break;
      }

      default:
        // Other events ignored gracefully
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("[webhooks/stripe] Execution error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
