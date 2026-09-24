import React from "react";
import type { Metadata } from "next";
import { IntegrationsClient } from "./IntegrationsClient";

export const metadata: Metadata = {
  title: "CMS & Platform Integrations | AI Blog SaaS",
  description:
    "Connect AI Blog SaaS with WordPress, Shopify, Webflow, Ghost, Zapier, and custom webhooks. 1-click automated blog publishing to any CMS.",
};

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
