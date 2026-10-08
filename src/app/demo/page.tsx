import { DemoView } from "@/components/demo/demo-view";
import { routeMetadata } from "@/lib/seo";

// No live counterpart (the live 404s /demo — pure superset, Session 14 F1)
// — follow the app-wide per-route head pattern (Session 6 F5).
export const metadata = routeMetadata("Book a Demo");

export default function DemoPage() {
  return <DemoView />;
}
