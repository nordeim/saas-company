import { FaqView } from "@/components/site/faq-view";
import { routeMetadata } from "@/lib/seo";

// The reference's per-route head pattern (Session 6 F5): "FAQ | SAAS
// Company" title + "FAQ on SAAS Company. …" description + og:url/canonical.
export const metadata = routeMetadata("FAQ");

export default function FaqPage() {
  return <FaqView />;
}
