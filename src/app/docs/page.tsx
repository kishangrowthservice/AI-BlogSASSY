import React from "react";
import type { Metadata } from "next";
import { DocsClient } from "./DocsClient";

export const metadata: Metadata = {
  title: "API Documentation & Developer Quickstart | AI Blog SaaS",
  description:
    "Complete developer reference for the AI Blog SaaS REST API. Endpoints, x-api-key authentication, request payloads, async queue polling, and CMS webhook HMAC verification.",
};

export default function DocsPage() {
  return <DocsClient />;
}
