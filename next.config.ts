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
    ];
  },
};

export default nextConfig;
