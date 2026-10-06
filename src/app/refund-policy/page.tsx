import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/legal-page-view";
import { REFUND_POLICY } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return <LegalPageView page={REFUND_POLICY} />;
}
