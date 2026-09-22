import { redirect } from "next/navigation";
import Link from "next/link";
import { getTenantDashboardData } from "@/lib/serverActions";
import { TenantDashboardClient } from "./TenantDashboardClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, PlusCircle } from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{ siteId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const siteId = params.siteId;

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
              To view your tenant dashboard, please register a site profile or access via your dedicated tenant link.
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
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 bg-card/60 backdrop-blur-xl text-center p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold text-destructive">Site Not Found</CardTitle>
            <CardDescription className="text-xs">
              The site ID &quot;{siteId}&quot; could not be located in our database.
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
      initialProfile={result.profile}
      initialKeyPrefix={result.keyPrefix || null}
      initialLogs={result.recentLogs || []}
    />
  );
}
