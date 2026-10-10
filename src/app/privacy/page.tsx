import { LegalPageView } from "@/components/site/legal-page-view";
import { JsonLd } from "@/components/site/json-ld";
import { PRIVACY } from "@/lib/legal-content";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "X | SAAS
// Company" title + "X on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("Privacy");

export default function PrivacyPage() {
  return (
    <>
      {/* Session 30 R1 (D115): the BreadcrumbList — the live's redeployed
          content-route pattern (Home → Privacy, absolute items). */}
      <JsonLd data={breadcrumbStructuredData("Privacy", "/privacy")} />
      <LegalPageView page={PRIVACY} />
    </>
  );
}
