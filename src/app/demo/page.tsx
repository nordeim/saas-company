import { DemoView } from "@/components/demo/demo-view";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

// No live counterpart (the live 404s /demo — pure superset, Session 14 F1)
// — follow the app-wide per-route head pattern (Session 6 F5).
export const metadata = routeMetadata("Book a Demo", "/demo");

export default function DemoPage() {
  return (
    <>
      {/* Session 30 R1 (D115): the BreadcrumbList — the content-route
          pattern applied to the superset route for consistency (no
          parity constraint: the live has no /demo). */}
      <JsonLd data={breadcrumbStructuredData("Book a Demo", "/demo")} />
      <DemoView />
    </>
  );
}
