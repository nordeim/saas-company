import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/legal-page-view";
import { ACCESSIBILITY } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return <LegalPageView page={ACCESSIBILITY} />;
}
