import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheckBig } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbStructuredData, routeMetadata } from "@/lib/seo";

/**
 * /thank-you — the reference's payment-success interstitial, built at
 * the measured parity contract (Session 43 R1, research/adj-s43.mjs
 * A1/A2/A3 + adj2-s43.mjs).
 *
 * The live serves this page WORKING (36 words) — a bare-centered
 * interstitial: NO navbar, NO footer, NO landmarks (its own structure;
 * the dormant toaster shell is the registered D124/D126 live-side
 * family, never simulated). The clone 404'd this URL through Session
 * 42 (the registered "404-by-design" — the S14 rationale identified it
 * as the live's newsletter-success route), but the A2 probe disproved
 * that story: the live's newsletter form does NOT navigate here (the
 * submit stays at `/`, an inline fetch flow — exactly the clone's own
 * S14 inline-confirmation superset). The page is the CHECKOUT-success
 * destination, the counterpart of the live's soft-404'd /checkout
 * (D146). It was the ONLY route where the clone soft-404'd what the
 * live serves working — the mirror image of the D73/D146 record.
 * Post-build: every one of the live's 8 public routes works in the
 * clone, plus /demo — the strict functional superset.
 *
 * Every class below is the live's verbatim measured string (adj2-s43
 * B1): the wrapper `min-h-screen bg-background flex items-center
 * justify-center px-6`, the container `text-center max-w-md`, the
 * icon row `mb-6 flex justify-center` with the lucide circle-check-big
 * at `w-16 h-16 text-green-500` (rgb(34, 197, 94) — the pinned v3
 * hex #22c55e), the h1 `font-heading text-4xl md:text-5xl font-bold
 * text-white mb-4` ("Payment Successful!" at 48px/700, 36px below md),
 * p1 `text-white/50 font-body mb-8 text-lg`, p2 `text-white/40
 * font-body mb-8 text-sm`, and the CTA ANCHOR (not a button — the
 * focus walk's single stop) `inline-flex items-center gap-2 px-8 py-4
 * bg-white text-black rounded-full font-semibold hover:bg-white/90
 * transition-all` with the arrow-right child. The `--font-heading` /
 * `--font-body` / `--color-background` / `--color-green-500` tokens
 * are already pinned in `@theme` (globals.css), so the verbatim
 * classes compute to the live's exact rendered values.
 *
 * The head: `routeMetadata("Thank You", "/thank-you")` — the title
 * "Thank You | SAAS Company", the D117-truncated description (the
 * pageDescription seam reproduces the live's string byte-exactly —
 * verified), per-route canonical/og:url/twitter:url, the working
 * og-image replacement, and NO og:image:alt (the /login-only D121
 * record — measured on the live's /thank-you). The JSON-LD: the
 * sitewide pair mounts in the root layout; this route adds the
 * BreadcrumbList [Home, Thank You] the live itself ships.
 */
export const metadata: Metadata = routeMetadata("Thank You", "/thank-you");

export default function ThankYouPage() {
  return (
    <>
      {/* Session 43 R1: the BreadcrumbList — the live's own content-route
          pattern (Home → Thank You, absolute items — measured verbatim). */}
      <JsonLd data={breadcrumbStructuredData("Thank You", "/thank-you")} />
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <CircleCheckBig className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-white/50 font-body mb-8 text-lg">
            Thank you for upgrading to NovaAI. Your plan is now active and you
            can start automating right away.
          </p>
          <p className="text-white/40 font-body mb-8 text-sm">
            A confirmation email has been sent to your inbox with all the
            details.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-all"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
