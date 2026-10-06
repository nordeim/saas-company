import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/legal-page-view";
import { PRIVACY } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalPageView page={PRIVACY} />;
}
