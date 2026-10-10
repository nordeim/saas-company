import { LegalPageView } from "@/components/site/legal-page-view";
import { JsonLd } from "@/components/site/json-ld";
import { ACCESSIBILITY } from "@/lib/legal-content";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "X | SAAS
// Company" title + "X on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("Accessibility", "/accessibility");

export default function AccessibilityPage() {
  return (
    <>
      {/* Session 30 R1 (D115): the BreadcrumbList — the live's redeployed
          content-route pattern (Home → Accessibility, absolute items). */}
      <JsonLd data={breadcrumbStructuredData("Accessibility", "/accessibility")} />
      <LegalPageView page={ACCESSIBILITY} />
    </>
  );
}
