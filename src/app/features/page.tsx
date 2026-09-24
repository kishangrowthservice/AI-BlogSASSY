import React from "react";
import type { Metadata } from "next";
import { FeaturesClient } from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Platform Features & Capabilities | AI Blog SaaS",
  description:
    "Explore the technical and content capabilities of AI Blog SaaS: Dual-LLM resilience, Google E-E-A-T optimization, canonical internal backlinking, and instant CMS publishing webhooks.",
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
