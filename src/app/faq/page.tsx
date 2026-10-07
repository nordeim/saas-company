import type { Metadata } from "next";
import { FaqView } from "@/components/site/faq-view";

/** Title measured from the live: "FAQ | SAAS Company" (Session 3). */
export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return <FaqView />;
}
