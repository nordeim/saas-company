# Deployment Guide

SAAS Company ships as a single Next.js **standalone** build with a SQLite
file database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
npm install
npm run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the marketing/legal pages (statically prerendered), the
session-gated dashboard, and the 11 API route handlers, then copies
`.next/static` and `public/` into `.next/standalone/` (see the `build`
script in `package.json`). `next.config.ts` pins `outputFileTracingRoot` to
the repo root — keep it; the standalone trace depends on it.

## 2. Run

```bash
npm run start          # NODE_ENV=production node .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the npm script — the script guarantees the working
directory that the SQLite path resolution and the standalone trace rely on.
Behind a reverse proxy, forward `X-Forwarded-Proto` so cookie attributes
derive the right scheme, and `X-Forwarded-For` so the auth rate limiter sees
real client IPs.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. An insecure dev constant is used when unset — never ship that. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin, used for metadata URLs and `sitemap.xml` (e.g. `https://novaai.example.com`). |
| `ALLOW_REGISTRATION` | Optional | Set to the exact string `false` to close registration (Session 17 F3): `POST /api/auth/register` returns `403 REGISTRATION_CLOSED` and the login card shows "Registration is currently closed." Every other value (or unset) keeps registration OPEN — the default preserves the demo workspace story. Login stays open on a closed deployment — closing registration never locks out existing users. |
| `AUTH_RATE_LIMIT_MAX` | Optional | Auth attempts (login + register) per IP per 15 minutes. Default 10; raise behind shared egress IPs. |
| `GENERATE_RATE_LIMIT_MAX` | Optional | AI-composer generations per user per 15 minutes. Default 10. |

## 4. Database location

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build`, and the running server alike, regardless of the process
   working directory. (`src/lib/db-path.ts` implements the runtime half of
   the rule; `tests/db-path.test.ts` pins the contract.)

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/saas-company/custom.db"
   ```
   Absolute paths pass through untouched — ideal when the database lives
   outside the deployment tree (a mounted volume, a backup-able location).

3. **PostgreSQL (hosted deploys).** Change `provider = "postgresql"` in
   `prisma/schema.prisma`, set a PostgreSQL connection string, then
   `npm run db:push && npm run db:seed`.

**The exported-variable trap:** a shell-exported absolute `DATABASE_URL`
overrides `.env` for the Prisma CLI and the Next runtime alike — the server
silently opens a foreign database file. Either `unset DATABASE_URL` in the
deploy shell or always pass the value explicitly per command (the discipline
`scripts/smoke-test.sh` and `playwright.config.ts` already follow).

## 5. Initialize the database

```bash
npm run db:push         # create/refresh the schema (accept-data-loss)
npm run db:seed         # idempotent demo workspace (demo@novaai.app / Demo1234!)
```

The seed wipes the domain tables (User, Workflow, Subscriber, DemoRequest)
and reinserts the canonical demo data. For a production workspace, seed
once, then sign up real accounts through `/login` — or skip the seed
entirely and register the first user directly.

## 6. Verify

```bash
curl https://<host>/api/health
# {"ok":true,"data":{"status":"ok","app":"saas-company","ts":"…"}}

./scripts/smoke-test.sh     # 38 checks against a local production build
```

## 7. Updating

```bash
git pull
npm install
npx prisma generate        # after any schema change
npm run db:push
npm run build
# restart the server process (systemd / pm2 / container restart)
```

Sessions survive restarts as long as `AUTH_SECRET` is stable — rotating it
invalidates every session cookie by design.

## 8. Docker deployment

The repo ships a production `Dockerfile` (Session 17 F4) — a multi-stage
build over the Next.js **standalone artifact**: a `deps` stage (full install,
dev deps included — `prisma generate` needs them), a `build` stage (`next
build` with a throwaway `DATABASE_URL` — the client imports eagerly but no
query runs at build time), and a `runner` stage (non-root `node` user, the
traced standalone `node_modules` incl. the Prisma query engine, a
`/app/db` **volume** for SQLite, and a `HEALTHCHECK` against
`/api/health`). The `.dockerignore` keeps the build context lean — the
`skills/` tree, screenshots, and test artifacts never enter the image.

```bash
# Build the image
docker build -t saas-company .

# Run with a persistent database volume + a real secret
docker run -d -p 3000:3000 -v saas-db:/app/db \
  -e AUTH_SECRET="$(openssl rand -hex 32)" \
  -e NEXT_PUBLIC_SITE_URL="https://your-domain.example" \
  -e ALLOW_REGISTRATION=false \
  saas-company

# Initialize the database inside the volume (first boot only — one-off)
docker run --rm -v saas-db:/app/db \
  -e DATABASE_URL="file:/app/db/custom.db" \
  --entrypoint npx saas-company prisma db push
```

Notes:

- The image's default `DATABASE_URL` is the **absolute**
  `file:/app/db/custom.db` (§4 form 2 — the production recommendation); the
  volume keeps the workspace across container replacement.
- `AUTH_SECRET` is injected at **runtime** — never baked into the image.
- Closing registration for a public deployment is one env var:
  `-e ALLOW_REGISTRATION=false` (§3).
- **Honest labeling:** the Dockerfile follows the standalone-artifact
  pattern this repo's gate has verified end-to-end (build → standalone
  server → health envelope), but the image itself was **not build-tested
  in the authoring environment** (no Docker daemon available there). The
  local quality gate (`lint → typecheck → test → build → smoke → e2e`)
  remains the only gate; treat the first `docker build` on your infra as
  the image's own verification step and report deviations upstream.

## 9. Pushing the repository

Commits go to `main` over SSH with an externally supplied deploy key via the
wrapper runbook: see
[`how-to-git-push-using-ssh-wrapper_SKILL.md`](./how-to-git-push-using-ssh-wrapper_SKILL.md).
