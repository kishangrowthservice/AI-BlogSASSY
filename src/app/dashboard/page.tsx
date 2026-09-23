import { redirect } from "next/navigation";
import Link from "next/link";
import { getTenantDashboardData, getUserPrimarySiteId } from "@/lib/serverActions";
import { toSafeSiteProfile } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import { TenantDashboardClient } from "./TenantDashboardClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, PlusCircle } from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{ siteId?: string }>;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  let siteId = params.siteId;
  let currentUserEmail: string | null = null;
  let shouldRedirectToOnboard = false;
  let shouldRedirectToLogin = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      currentUserEmail = user.email || null;
      if (!siteId) {
        const primarySiteId = await getUserPrimarySiteId();
        if (primarySiteId) {
          siteId = primarySiteId;
        } else {
          shouldRedirectToOnboard = true;
        }
      }
    } else {
      if (!siteId) {
        shouldRedirectToLogin = true;
      }
    }
  } catch {
    // Session lookup fallback
  }

  if (shouldRedirectToOnboard) {
    redirect("/onboard");
  }

  if (shouldRedirectToLogin) {
    redirect("/login");
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 bg-card/60 backdrop-blur-xl text-center p-6 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>

          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold">No Site Selected</CardTitle>
            <CardDescription className="text-xs">
              To view your client dashboard, please register a website or access via your dedicated client link.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2 space-y-3">
            <Button asChild className="w-full text-xs gap-2">
              <Link href="/onboard">
                <PlusCircle className="h-4 w-4" />
                Register New Site Profile
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = await getTenantDashboardData(siteId);

  if (!result.success || !result.profile) {
    // If current authenticated user has an active primary site, auto-recover to it
    if (currentUserEmail) {
      const primarySiteId = await getUserPrimarySiteId();
      if (primarySiteId && primarySiteId !== siteId) {
        redirect(`/dashboard?siteId=${primarySiteId}`);
      }
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 bg-card/60 backdrop-blur-xl text-center p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold">Website Profile Not Found</CardTitle>
            <CardDescription className="text-xs">
              We couldn&apos;t locate this website profile in our records.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2 space-y-3">
            <Button asChild className="w-full text-xs gap-2">
              <Link href="/onboard">
                <PlusCircle className="h-4 w-4" />
                Register Site Profile
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TenantDashboardClient
      initialProfile={toSafeSiteProfile(result.profile)}
      initialKeyPrefix={result.keyPrefix || null}
      initialLogs={result.recentLogs || []}
      currentUserEmail={currentUserEmail}
    />
  );
}
