export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface BrandConfig {
  brandName: string;
  domain: string;
  tagline: string;
  logoUrl?: string;
  colors: BrandColors;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
}

/**
 * Default Theme Preset: Growth Service Brand Lock
 */
export const defaultBrandConfig: BrandConfig = {
  brandName: "Growth Service",
  domain: "growthservice.in",
  tagline: "ROI-driven Performance Marketing & Custom Engineering",
  colors: {
    primary: "#6A0DAD",    // Royal Purple
    secondary: "#FFD700",  // Vibrant Gold
    accent: "#6366F1",     // Indigo
    background: "#0A0D14", // Obsidian
    surface: "#111827",    // Slate Dark
    text: "#F8FAFC",       // High Contrast White
    muted: "#94A3B8",      // Slate Grey
    border: "rgba(255, 255, 255, 0.1)",
  },
  typography: {
    headingFont: "Inter, -apple-system, sans-serif",
    bodyFont: "Inter, -apple-system, sans-serif",
  },
  author: {
    name: "Growth Service Editorial Team",
    role: "SEO & Growth Practitioners",
  },
  cta: {
    title: "Ready to Scale Your Search Traffic?",
    description: "Get a complimentary, data-backed technical SEO audit from Growth Service practitioners.",
    buttonText: "Claim Your Free Audit",
    buttonUrl: "/free-audit",
  },
};
