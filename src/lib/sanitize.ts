import type { SiteProfile } from "./types";

export type SafeSiteProfile = Omit<
  SiteProfile,
  "byo_groq_api_key" | "byo_gemini_api_key" | "api_key_hash"
> & {
  has_byo_groq?: boolean;
  has_byo_gemini?: boolean;
};

export function toSafeSiteProfile(profile: SiteProfile): SafeSiteProfile {
  const { byo_groq_api_key, byo_gemini_api_key, api_key_hash, ...safe } = profile;
  return {
    ...safe,
    has_byo_groq: Boolean(byo_groq_api_key && byo_groq_api_key.trim().length > 0),
    has_byo_gemini: Boolean(byo_gemini_api_key && byo_gemini_api_key.trim().length > 0),
  };
}
