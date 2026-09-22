import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbClient } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this user already has an onboarded site profile
      try {
        const adminDb = getDbClient();
        const { data: profile } = await adminDb
          .from("site_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (profile?.id) {
          // Returning user already has a site -> send to their dashboard
          return NextResponse.redirect(`${origin}/dashboard?siteId=${profile.id}`);
        }
      } catch {
        // Fall through to /onboard
      }

      // First-time verified user -> send to onboarding
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth exchange failed or invalid code -> redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_verification_failed`);
}
