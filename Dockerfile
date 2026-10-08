# SAAS Company — production image (Session 17 F4; Session 18 R3 repair)
#
# Multi-stage build over the Next.js standalone artifact:
#   deps   → full install (dev deps included — prisma generate needs them)
#   build  → schema push into the image's db + next build
#   runner → non-root user, runtime env, healthcheck — the deployable image
#
# Build:    docker build -t saas-company .
# Run:      docker run -p 3000:3000 -v saas-db:/app/db \
#             -e AUTH_SECRET="$(openssl rand -hex 32)" \
#             -e NEXT_PUBLIC_SITE_URL="https://your-domain" saas-company
#
# Session 18 R3: the build stage pushes the SCHEMA into /app/db/custom.db
# and the runner COPYs it — a fresh NAMED volume seeds itself from the image
# on first mount (Docker's copy-on-first-mount semantics), so `docker run
# -v saas-db:/app/db` works with ZERO init commands. (Bind mounts shadow
# the image content — initialize those from a checkout; see
# docs/DEPLOYMENT.md §8.) The SQLite database lives on the VOLUME so
# container replacement never drops the workspace. AUTH_SECRET is injected
# at RUNTIME — never baked into the image (.dockerignore excludes .env).
# See docs/DEPLOYMENT.md §8 for the full runbook.

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
# Session 18 R3: push the schema into the image's own database BEFORE the
# Next build. The old recipe used a throwaway /tmp URL and the image shipped
# NO database at all — a fresh named volume then mounted EMPTY (every query
# 500s while /api/health said ok), and the runbook's one-off init command
# (`--entrypoint npx … prisma db push`) could not work: the runner stage
# ships neither the prisma CLI nor prisma/schema.prisma. With the schema
# pre-pushed here and COPYd below, a fresh named volume seeds itself.
# `next build` runs against the same initialized file — it needs only a
# resolvable SQLite path (no query runs at build time, the S17 design).
ENV DATABASE_URL="file:/app/db/custom.db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate \
  && npx prisma db push --skip-generate \
  && npm run build

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

# Session 18 R3: the schema-initialized EMPTY database (node-owned so the
# non-root server can write it). Docker copies this directory into a FRESH
# named volume on first mount — the zero-init first run. Empty by design:
# production starts with no users; register the operator account BEFORE
# closing registration (see docs/DEPLOYMENT.md §8).
COPY --from=build --chown=node:node /app/db ./db
VOLUME /app/db

# The container contract: healthy = the health envelope answers (liveness).
# Session 18 R1: the envelope's `db` field reports SQLite reachability
# ("up"/"down") — inspect it with
# `docker exec <container> node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"`.
# The status code deliberately stays 200 in both states (a broken volume DB
# is not repaired by a restart — restarting would only loop).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000
CMD ["node", "server.js"]
