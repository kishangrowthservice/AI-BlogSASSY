import React from "react";
import type { GeneratedBlogPost } from "@/lib/types";
import { defaultBrandConfig, type BrandConfig } from "@/theme/brand.config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
import "@/theme/theme.css";

interface Props {
  post: GeneratedBlogPost;
  brand?: BrandConfig;
  publishDate?: string;
}

/**
 * Pure XSS Sanitizer: Strips scripts, iframes, and executable event handlers (§9 Security).
 */
function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<(script|style|iframe|object|embed|applet|meta|form|input|button|svg|base|link)\b[^>]*>([\s\S]*?<\/\1>)?/gi, "")
    .replace(/<\/?(script|style|iframe|object|embed|applet|meta|form|input|button|svg|base|link)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
}

export function BlogPostViewer({
  post,
  brand = defaultBrandConfig,
  publishDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
}: Props) {
  // Sanitize content against stored XSS
  const safeContent = sanitizeHtml(post.content);

  // Estimate reading time (~200 wpm)
  const plainText = safeContent.replace(/<[^>]+>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article
      className="blog-post-container"
      style={
        {
          "--color-primary": brand.colors.primary,
          "--color-accent": brand.colors.accent,
          "--color-heading": brand.colors.text,
          "--color-text": brand.colors.text,
          "--color-muted": brand.colors.muted,
          "--color-border": brand.colors.border,
        } as React.CSSProperties
      }
    >
      {/* Header Section */}
      <header className="blog-post-header space-y-4">
        <h1 className="blog-post-title text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="h-3.5 w-3.5" />
            {brand.author.name}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {publishDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-primary">
            <Clock className="h-3.5 w-3.5" />
            {readTimeMinutes} min read ({wordCount} words)
          </span>
        </div>

        {post.metaDescription && (
          <p className="blog-post-lead text-base sm:text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/50 pl-4 italic">
            {post.metaDescription}
          </p>
        )}

        {post.suggestedTags && post.suggestedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.suggestedTags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-medium">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Semantic HTML Body Render (XSS Sanitized) */}
      <div
        className="blog-post-content prose prose-invert max-w-none pt-4"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />

      {/* Brand CTA Block */}
      {brand.cta && (
        <section className="blog-post-cta rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 mt-8">
          <h4 className="text-lg font-bold text-foreground mb-1">{brand.cta.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{brand.cta.description}</p>
          <Button asChild size="sm" className="gap-2 shadow-xs">
            <a href={brand.cta.buttonUrl}>
              {brand.cta.buttonText}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </section>
      )}
    </article>
  );
}
