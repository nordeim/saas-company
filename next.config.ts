import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Keep the dev-tools indicator out of the viewport (parity screenshots).
  devIndicators: false,
  // The app is a conventional multi-route Next.js site (/, /login, /faq,
  // /privacy, /terms, /accessibility, /refund-policy, /dashboard). No SPA
  // view rewrites are needed; unknown paths fall through to not-found.tsx.
  // Security headers — the reference (Base44/Cloudflare) ships this exact
  // set (measured via curl -I, Session 9 F6); the standalone server must
  // match. HSTS is a no-op over plain http locally — it activates behind
  // TLS like the live's deployment. No CSP: the app's inline route styles
  // (login theme swap) and Next's hydration need stylescripts a strict
  // policy would break; revisit only with nonce-based CSP tooling.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
      {
        // Public assets ship the live's CDN caching value (Session 10 F4:
        // the 1.9MB hero video re-validated on every load at max-age=0;
        // the live's static assets serve public, max-age=604800). The
        // hashed /_next/static/* chunks keep Next's immutable headers.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/favicon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/og-image.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
