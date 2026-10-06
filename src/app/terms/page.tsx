import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/legal-page-view";
import { TERMS } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <LegalPageView page={TERMS} />;
}
