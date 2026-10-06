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
};

export default nextConfig;
