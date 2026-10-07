import { LegalPageView } from "@/components/site/legal-page-view";
import { REFUND_POLICY } from "@/lib/legal-content";
import { routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "X | SAAS
// Company" title + "X on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("Refund Policy");

export default function RefundPolicyPage() {
  return <LegalPageView page={REFUND_POLICY} />;
}
