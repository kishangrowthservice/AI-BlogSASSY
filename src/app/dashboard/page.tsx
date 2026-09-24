import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getTenantDashboardData,
  getUserPrimarySiteId,
  verifySiteOwnership,
  getUserSitesAction,
} from "@/lib/serverActions";
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
  const requestedSiteId = params.siteId;

  // 1. Unconditionally require authenticated user session
  let currentUserEmail: string | null = null;
  let currentUserId: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    currentUserEmail = user.email || null;
    currentUserId = user.id;
  } catch {
    redirect("/login");
  }

  // 2. Resolve user's primary site from session
  const primarySiteId = await getUserPrimarySiteId();
  if (!primarySiteId) {
    redirect("/onboard");
  }

  // 3. Resolve active siteId: if requestedSiteId is provided, strictly verify user owns it
  let activeSiteId = primarySiteId;
  if (requestedSiteId && requestedSiteId !== primarySiteId) {
    const isOwner = await verifySiteOwnership(requestedSiteId, currentUserId);
    if (isOwner) {
      activeSiteId = requestedSiteId;
    }
  }

  // 4. Fetch dashboard data for the verified site
  const [result, userSites] = await Promise.all([
    getTenantDashboardData(activeSiteId),
    getUserSitesAction(),
  ]);

  if (!result.success || !result.profile) {
    redirect("/onboard");
  }

  return (
    <TenantDashboardClient
      initialProfile={toSafeSiteProfile(result.profile)}
      initialKeyPrefix={result.keyPrefix || null}
      initialLogs={result.recentLogs || []}
      currentUserEmail={currentUserEmail}
      initialUserSites={userSites || []}
    />
  );
}
