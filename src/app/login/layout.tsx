import type { Metadata, Viewport } from "next";
import { routeMetadata } from "@/lib/seo";

/**
 * The login route's head, matched to the reference's /login (Session 6 F5):
 * the DEFAULT title ("SAAS Company" — no "Login |" prefix on the live) and
 * the DEFAULT description, but og:url + canonical still resolve to THIS
 * route. page.tsx is a client component, so the metadata lives here.
 *
 * Session 32 R2 (F2 — D121): the live's /login REDEPLOYED three head tags
 * (measured by the drift battery's seventh column — gotcha 7, the moving
 * target; the Session-6 "ships neither theme-color nor viewport-fit"
 * record was true at ITS measurement time, and the viewport-fit half
 * still holds):
 *   - `<meta name="theme-color" content="#000000">` — ONLY on /login
 *     (every other route ships none). The per-route viewport export is
 *     the Next emission path, scoped to this layout exactly like the
 *     live's own tag.
 *   - og:image:alt + twitter:image:alt "Base44 link preview" — the
 *     live's own boilerplate string, copied VERBATIM through
 *     routeMetadata's imageAlt option (the S31 exact-head precedent; an
 *     "improved" alt would be an invented string — the content-as-code
 *     law). The alts describe the og-image surface; the clone's image
 *     is the documented working replacement (the live's own URL is
 *     dead, re-verified this session).
 */
export const metadata: Metadata = routeMetadata(null, "/login", { imageAlt: "Base44 link preview" });

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
