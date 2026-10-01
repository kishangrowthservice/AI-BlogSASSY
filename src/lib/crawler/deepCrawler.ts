/**
 * Deep Background Web Crawler for Tenant Onboarding
 * Discovers sitemaps, spiders internal navigation links, and extracts high-value page semantics.
 */

export interface CrawledPage {
  url: string;
  path: string;
  title: string;
  description: string;
  headings: string[];
  cleanText: string;
  internalAnchors: { href: string; label: string }[];
}

export interface DeepCrawlResult {
  origin: string;
  domain: string;
  siteTitle: string;
  pages: CrawledPage[];
  discoveredUrlsCount: number;
}

const STATIC_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "ico",
  "css", "js", "mjs", "pdf", "zip", "xml", "json", "txt",
  "woff", "woff2", "ttf", "eot", "mp4", "mp3", "webm"
]);

function normalizeUrl(input: string): { origin: string; domain: string } {
  let urlStr = input.trim();
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }
  const parsed = new URL(urlStr);
  return {
    origin: parsed.origin,
    domain: parsed.hostname.replace(/^www\./, "").toLowerCase(),
  };
}

/**
 * Parses XML sitemap text to extract <loc> URLs belonging to target origin.
 */
function parseSitemapUrls(xmlText: string, targetOrigin: string): string[] {
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
  const urls: string[] = [];
  let match;
  const parsedTarget = new URL(targetOrigin);

  while ((match = locRegex.exec(xmlText)) !== null) {
    const rawUrl = match[1].trim();
    try {
      const u = new URL(rawUrl);
      if (u.hostname === parsedTarget.hostname) {
        urls.push(u.origin + u.pathname);
      }
    } catch {}
  }
  return urls;
}

/**
 * Extracts links and clean text from raw HTML content.
 */
function parseHtmlPage(html: string, pageUrl: string, origin: string): {
  title: string;
  description: string;
  headings: string[];
  cleanText: string;
  internalAnchors: { href: string; label: string }[];
} {
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : "";

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = metaDescMatch ? metaDescMatch[1].trim() : "";

  // Headings
  const headings: string[] = [];
  const headingRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let hMatch;
  while ((hMatch = headingRegex.exec(html)) !== null) {
    const text = hMatch[1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");
    if (text && text.length > 2 && text.length < 120) {
      headings.push(text);
    }
  }

  // Internal anchors
  const internalAnchors: { href: string; label: string }[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let aMatch;
  const parsedOrigin = new URL(origin);

  while ((aMatch = anchorRegex.exec(html)) !== null) {
    const rawHref = aMatch[1].trim();
    const label = aMatch[2].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");

    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      continue;
    }

    try {
      const resolved = new URL(rawHref, pageUrl);
      if (resolved.hostname === parsedOrigin.hostname) {
        const ext = resolved.pathname.split(".").pop()?.toLowerCase();
        if (!ext || !STATIC_EXTENSIONS.has(ext)) {
          const path = resolved.pathname.replace(/\/+$/, "") || "/";
          if (label && label.length > 2 && label.length < 80) {
            internalAnchors.push({ href: path, label });
          }
        }
      }
    } catch {}
  }

  // Clean body text (strip script, style, nav, footer, tags)
  let clean = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Keep first 3000 chars for LLM synthesis budget
  clean = clean.slice(0, 3000);

  return { title, description, headings: headings.slice(0, 10), cleanText: clean, internalAnchors };
}

/**
 * Score URL priority: About, Services, Solutions, Products, Features, Pricing, Blog.
 */
function scoreUrl(urlPath: string): number {
  const p = urlPath.toLowerCase();
  if (p === "/" || p === "") return 100;
  if (/about|who-we-are|company|mission/i.test(p)) return 90;
  if (/service|solution|product|feature|capability|offer/i.test(p)) return 85;
  if (/pricing|plan|tier|cost/i.test(p)) return 80;
  if (/case-stud|portfolio|client|review|testimonial/i.test(p)) return 75;
  if (/blog|article|resource|guide|insight/i.test(p)) return 60;
  if (/contact|get-in-touch|book/i.test(p)) return 50;
  if (/term|privacy|legal|cookie|disclaimer/i.test(p)) return 10;
  return 40;
}

/**
 * Performs deep multi-page crawl of a target website up to maxPages (default 18).
 */
export async function deepCrawlWebsite(
  rawInputUrl: string,
  onProgress?: (progressPercent: number, statusMsg: string) => Promise<void> | void,
  maxPages = 18
): Promise<DeepCrawlResult> {
  const { origin, domain } = normalizeUrl(rawInputUrl);
  const update = async (pct: number, msg: string) => {
    if (onProgress) await onProgress(pct, msg);
  };

  await update(5, `Connecting to ${domain}...`);

  // Discovered URLs set
  const discoveredMap = new Map<string, number>(); // path -> score
  discoveredMap.set("/", 100);

  // 1. Check sitemaps
  try {
    await update(10, "Inspecting sitemap.xml...");
    const sitemapCandidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
    for (const smUrl of sitemapCandidates) {
      try {
        const smRes = await fetch(smUrl, {
          headers: { "User-Agent": "AIBlogSaaS-Bot/1.0 (+https://ai-blog-saas)" },
          signal: AbortSignal.timeout(4000),
        });
        if (smRes.ok) {
          const xml = await smRes.text();
          const smUrls = parseSitemapUrls(xml, origin);
          for (const u of smUrls) {
            const parsed = new URL(u);
            const path = parsed.pathname.replace(/\/+$/, "") || "/";
            const ext = path.split(".").pop()?.toLowerCase();
            if (!ext || !STATIC_EXTENSIONS.has(ext)) {
              discoveredMap.set(path, scoreUrl(path));
            }
          }
          if (smUrls.length > 0) break;
        }
      } catch {}
    }
  } catch {}

  // 2. Fetch Homepage to discover nav links & initial semantics
  await update(20, `Scanning homepage of ${domain}...`);
  let homepageTitle = domain;

  try {
    const homeRes = await fetch(origin, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (homeRes.ok) {
      const html = await homeRes.text();
      const parsedHome = parseHtmlPage(html, origin, origin);
      if (parsedHome.title) homepageTitle = parsedHome.title;

      for (const a of parsedHome.internalAnchors) {
        if (!discoveredMap.has(a.href)) {
          discoveredMap.set(a.href, scoreUrl(a.href));
        }
      }
    }
  } catch (err) {
    console.warn(`[deepCrawler] Homepage fetch warning for ${origin}:`, err);
  }

  // 3. Sort prioritized URLs up to maxPages
  const sortedPaths = Array.from(discoveredMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p)
    .slice(0, maxPages);

  const crawledPages: CrawledPage[] = [];
  const total = sortedPaths.length;

  // 4. Batch crawl pages with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < total; i += batchSize) {
    const batch = sortedPaths.slice(i, i + batchSize);
    const pct = Math.min(25 + Math.round(((i + 1) / total) * 55), 80);
    await update(pct, `Crawling pages (${Math.min(i + batchSize, total)}/${total})...`);

    const promises = batch.map(async (path) => {
      const fullUrl = path === "/" ? origin : `${origin}${path}`;
      try {
        const res = await fetch(fullUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            const html = await res.text();
            const parsed = parseHtmlPage(html, fullUrl, origin);
            return {
              url: fullUrl,
              path,
              title: parsed.title || path,
              description: parsed.description,
              headings: parsed.headings,
              cleanText: parsed.cleanText,
              internalAnchors: parsed.internalAnchors,
            } as CrawledPage;
          }
        }
      } catch {}
      return null;
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) crawledPages.push(r);
    }
  }

  await update(85, `Aggregating ${crawledPages.length} discovered site documents...`);

  return {
    origin,
    domain,
    siteTitle: homepageTitle,
    pages: crawledPages,
    discoveredUrlsCount: discoveredMap.size,
  };
}
