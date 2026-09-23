import type { SiteProfile } from "./types";

export type SafeSiteProfile = Omit<
  SiteProfile,
  "byo_groq_api_key" | "byo_gemini_api_key" | "api_key_hash"
>;

export function toSafeSiteProfile(profile: SiteProfile): SafeSiteProfile {
  const { byo_groq_api_key, byo_gemini_api_key, api_key_hash, ...safe } = profile;
  return safe;
}
