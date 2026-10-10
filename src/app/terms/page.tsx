import { LegalPageView } from "@/components/site/legal-page-view";
import { JsonLd } from "@/components/site/json-ld";
import { TERMS } from "@/lib/legal-content";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "X | SAAS
// Company" title + "X on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("Terms");

export default function TermsPage() {
  return (
    <>
      {/* Session 30 R1 (D115): the BreadcrumbList — the live's redeployed
          content-route pattern (Home → Terms, absolute items). */}
      <JsonLd data={breadcrumbStructuredData("Terms", "/terms")} />
      <LegalPageView page={TERMS} />
    </>
  );
}
