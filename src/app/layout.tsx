import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Playfair_Display } from "next/font/google";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { JsonLd } from "@/components/site/json-ld";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  organizationStructuredData,
  websiteStructuredData,
} from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const DESCRIPTION = DEFAULT_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_NAME,
    // The reference's title pattern: "FAQ | SAAS Company" (short page
    // name + pipe, measured from the live <title>s — Session 3).
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  // The reference's per-route head map (Session 6 F5): every route ships
  // og:url + a canonical URL resolving to itself. "./" resolves against
  // metadataBase per route when pages re-declare it.
  alternates: { canonical: "./" },
  appleWebApp: {
    title: SITE_NAME,
    // The reference emits the black status-bar style (Session 4 head audit).
    statusBarStyle: "black",
  },
  // The reference's Base44 PWA manifest (name/icons/start_url/display/
  // theme #000000/bg #ffffff) — self-hosted here (Session 6 F5).
  manifest: "/manifest.json",
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: "./",
    // The live declares og:image (a 1200×630 render of the four-petal
    // mark) but its URL 404s — the self-hosted asset is the working
    // superset (Session 6 F5/L2).
    images: [{ url: "/og-image.png", width: 1200, height: 630, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    // The live's login route links an apple-touch-icon whose URL is DEAD
    // (media.base44.com storage 404 — the same class as its favicon and
    // og:image). The WORKING self-hosted icon is the superset (Session 7
    // F8; the D30 working-asset pattern), emitted app-wide.
    apple: [{ url: "/favicon.svg" }],
  },
};

// The reference ships NEITHER viewport-fit NOR a theme-color meta
// (Session 6 F5 head audit) — its viewport is width=device-width,
// initial-scale=1 only.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSerif.variable}`}>
      {/* The reference's <body> carries NO classes — its stylesheet paints
          it (bg/color/font) and the wrapper div handles min-h/overflow
          (Session 6 F6). */}
      <body>
        {/* The reference's Lenis smooth scrolling (window.lenis on the live) */}
        <SmoothScroll />
        {/* Session 30 R1 (D115): the sitewide structured-data pair — the
            live was redeployed shipping a minimal WebSite + Organization
            script on EVERY route (the drift battery's JSON-LD column
            caught it). One mount here covers every page route; the @id
            anchors stay stable so the landing's SoftwareApplication
            publisher link resolves across scripts. Invisible to the
            word-parity battery (a script never renders into innerText). */}
        <JsonLd data={websiteStructuredData()} />
        <JsonLd data={organizationStructuredData()} />
        {children}
      </body>
    </html>
  );
}
