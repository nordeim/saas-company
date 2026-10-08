# SAAS Company — production image (Session 17 F4, PAD §10 LOW closed)
#
# Multi-stage build over the Next.js standalone artifact:
#   deps   → full install (dev deps included — prisma generate needs them)
#   build  → next build (output: "standalone" produces .next/standalone)
#   runner → non-root user, runtime env, healthcheck — the deployable image
#
# Build:    docker build -t saas-company .
# Run:      docker run -p 3000:3000 -v saas-db:/app/db \
#             -e AUTH_SECRET="$(openssl rand -hex 32)" \
#             -e NEXT_PUBLIC_SITE_URL="https://your-domain" saas-company
#
# The SQLite database lives on a VOLUME (/app/db) so container replacement
# never drops the workspace. AUTH_SECRET is injected at RUNTIME — never
# baked into the image. See docs/DEPLOYMENT.md §7 for the full runbook.

# ---- deps ------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# prisma generate runs in the build stage — the devDependency tree is needed.
RUN npm ci

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# A throwaway DATABASE_URL: `next build` imports the Prisma client eagerly
# (src/lib/db.ts) — SQLite needs a resolvable path even though no query runs
# at build time. The runtime URL is injected per-deployment below.
ENV DATABASE_URL="file:/tmp/build-placeholder.db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ---- runner -----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Runtime database: an ABSOLUTE path on the mounted volume (docs/DEPLOYMENT.md
# §4 — absolute paths are the production recommendation; the relative
# file:../db/custom.db story is the local-dev default).
ENV DATABASE_URL="file:/app/db/custom.db"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user (Alpine's bundled node user).
USER node

# The standalone artifact: server.js + the traced node_modules (incl. the
# Prisma client + query engine) + the static chunks + public assets.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# The database volume mount point (created with node ownership so the
# non-root server can create its SQLite file on a fresh volume).
RUN mkdir -p /app/db && chown node:node /app/db
VOLUME /app/db

# The container contract: healthy = the health envelope answers.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000
CMD ["node", "server.js"]
