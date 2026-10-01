import { NextResponse } from "next/server";
import { runFullSiteCrawlAndSynthesis } from "@/lib/crawler/brandSynthesizer";
import { getDbClient } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, websiteUrl } = body || {};

    if (!siteId || !websiteUrl) {
      return NextResponse.json(
        { error: "siteId and websiteUrl are required." },
        { status: 400 }
      );
    }

    // Verify site exists
    const db = getDbClient();
    const { data: site, error } = await db
      .from("site_profiles")
      .select("id")
      .eq("id", siteId)
      .single();

    if (error || !site) {
      return NextResponse.json({ error: "Site profile not found." }, { status: 404 });
    }

    // Execute crawl asynchronously without blocking HTTP response
    runFullSiteCrawlAndSynthesis(siteId, websiteUrl).catch((err) => {
      console.error(`[api/crawl] Background crawl failure for ${siteId}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: "Deep crawl and AI brand synthesis initiated.",
      siteId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId query param required" }, { status: 400 });
  }

  const db = getDbClient();
  const { data: site, error } = await db
    .from("site_profiles")
    .select("id, site_name, domain, crawl_status, crawl_progress, crawl_page_count, crawl_error, internal_links, tone, target_audience")
    .eq("id", siteId)
    .single();

  if (error || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, site });
}
