import React from "react";
import type { Metadata } from "next";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing Plans | Transparent AI Blog Publishing Tiers",
  description:
    "Transparent pricing for autonomous AI blog publishing. Compare Starter, Growth Pro, and Agency Scale plans with annual discounts and no hidden overages.",
};

export default function PricingPage() {
  return <PricingClient />;
}
