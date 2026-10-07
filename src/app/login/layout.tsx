import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

/**
 * The login route's head, matched to the reference's /login (Session 6 F5):
 * the DEFAULT title ("SAAS Company" — no "Login |" prefix on the live) and
 * the DEFAULT description, but og:url + canonical still resolve to THIS
 * route. page.tsx is a client component, so the metadata lives here.
 */
export const metadata: Metadata = routeMetadata(null);

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
