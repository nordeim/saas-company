import { LegalPageView } from "@/components/site/legal-page-view";
import { JsonLd } from "@/components/site/json-ld";
import { REFUND_POLICY } from "@/lib/legal-content";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "X | SAAS
// Company" title + "X on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("Refund Policy", "/refund-policy");

export default function RefundPolicyPage() {
  return (
    <>
      {/* Session 30 R1 (D115): the BreadcrumbList — the live's redeployed
          content-route pattern (Home → Refund Policy, absolute items). */}
      <JsonLd data={breadcrumbStructuredData("Refund Policy", "/refund-policy")} />
      <LegalPageView page={REFUND_POLICY} />
    </>
  );
}
