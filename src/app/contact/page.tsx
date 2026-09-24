import React from "react";
import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Sales & Support | AI Blog SaaS",
  description:
    "Get in touch with the AI Blog SaaS team for enterprise volume inquiries, custom CMS integration assistance, or platform support.",
};

export default function ContactPage() {
  return <ContactClient />;
}
