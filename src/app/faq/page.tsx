import { FaqView } from "@/components/site/faq-view";
import { JsonLd } from "@/components/site/json-ld";
import { faqStructuredData, routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "FAQ | SAAS
// Company" title + "FAQ on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("FAQ");

export default function FaqPage() {
  return (
    <>
      {/* Session 29 R1 (D113): the FAQPage structured data — the entities
          derive VERBATIM from FAQ_ITEMS (content-as-code). */}
      <JsonLd data={faqStructuredData()} />
      <FaqView />
    </>
  );
}
