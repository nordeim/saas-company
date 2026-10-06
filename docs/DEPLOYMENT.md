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

## 8. Pushing the repository

Commits go to `main` over SSH with an externally supplied deploy key via the
wrapper runbook: see
[`how-to-git-push-using-ssh-wrapper_SKILL.md`](./how-to-git-push-using-ssh-wrapper_SKILL.md).
