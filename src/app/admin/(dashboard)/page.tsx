import { listSiteProfiles, getObservabilityStats } from "@/lib/adminActions";
import { toSafeSiteProfile } from "@/lib/sanitize";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const revalidate = 0; // Dynamic real-time telemetry

export default async function AdminDashboardPage() {
  const [profiles, stats] = await Promise.all([
    listSiteProfiles(),
    getObservabilityStats(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tenant Management &amp; Observability
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Onboard sites, issue SHA-256 hashed API keys, monitor tenant quota consumption, and inspect live generation telemetry.
        </p>
      </div>

      <AdminDashboardClient
        initialProfiles={profiles.map(toSafeSiteProfile)}
        stats={stats}
      />
    </div>
  );
}
