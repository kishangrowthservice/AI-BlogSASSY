import React from "react";
import type { Metadata } from "next";
import { ChangelogClient } from "./ChangelogClient";

export const metadata: Metadata = {
  title: "Product Changelog & Release Notes | AI Blog SaaS",
  description:
    "Follow our continuous engineering progress. See new features, performance optimizations, and infrastructure upgrades across the AI Blog SaaS platform.",
};

export default function ChangelogPage() {
  return <ChangelogClient />;
}
