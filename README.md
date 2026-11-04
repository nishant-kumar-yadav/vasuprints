# VasuPrint website

Website, quote pipeline and admin panel for VasuPrint: custom packaging boxes, stickers, DTF / UV DTF
transfers and tags. Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · MongoDB (Mongoose) · Nodemailer.

Scope, decisions and what changed from the original docs: `PLAN-v1.md`.

## Quick start (no database)

The public site works on its own: the catalog comes from `src/content`, and the quote form hands the
buyer a pre-filled WhatsApp message or email.

```bash
corepack enable          # once, provides pnpm
pnpm install
pnpm dev                 # http://localhost:3000
```

## Full stack locally (quotes, uploads, emails, admin)

You need MongoDB. Pick one:

- **Docker:** `pnpm db:dev` starts MongoDB on `127.0.0.1:27017` and Mailpit (a fake inbox) on
  http://localhost:8025.
- **Any MongoDB 7+** you already have (local `mongod`, or a free Atlas cluster).

Then:

```bash
cp .env.example .env.local
# edit .env.local:
#   MONGODB_URI=mongodb://127.0.0.1:27017/vasuprint
#   QUOTE_BACKEND=on
#   CATALOG_SOURCE=mongo
#   IP_HASH_SALT=<openssl rand -hex 32>
#   ADMIN_EMAIL=you@example.com
#   SESSION_SECRET=<openssl rand -base64 48>
#   SMTP_HOST=127.0.0.1  SMTP_PORT=1025   (Mailpit; leave SMTP_HOST empty to write .eml files to storage/mail)
pnpm admin:hash          # type a 14+ character password, paste the printed ADMIN_PASSWORD_HASH line into .env.local
pnpm db:seed             # imports the 5 categories and 13 products into MongoDB
pnpm dev
```

- Site: http://localhost:3000 · Admin: http://localhost:3000/admin
- Artwork uploads are stored in `storage/uploads` (outside `public/`), product photos in `storage/media`.
- Without Turnstile keys, bot verification is skipped in development (the honeypot and timing checks still run).

### Production build on your machine

`pnpm build && pnpm start`. Production refuses to start without SMTP, Turnstile and admin secrets. To try a
production build on localhost without them, set `LOCAL_PREVIEW=true` (rejected for any non-localhost `SITE_URL`).

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm lint` · `pnpm typecheck` | ESLint · TypeScript |
| `pnpm test` | Unit + integration tests (starts an in-memory MongoDB; set `MONGOMS_SYSTEM_BINARY` to use an installed `mongod`) |
| `pnpm db:dev` | MongoDB + Mailpit via Docker Compose |
| `pnpm db:seed [--force]` | Import the content files into MongoDB (`--force` overwrites edited documents) |
| `pnpm admin:hash` | Generate `ADMIN_PASSWORD_HASH` |
| `pnpm uploads:cleanup` | Delete artwork uploads never attached to a quote (> 24 h). Run hourly from cron in production |
| `pnpm check:placeholders` | Lists business details still missing; exits 1 if any (use before launch) |

## Feature flags

| Variable | Values | Effect |
|---|---|---|
| `CATALOG_SOURCE` | `static` (default) · `mongo` | Where public pages read products from. If MongoDB is down, `mongo` falls back to the built-in catalog instead of failing |
| `QUOTE_BACKEND` | `off` (default) · `on` | `on`: forms save leads, upload artwork and send emails. If the API is unreachable, the form falls back to the WhatsApp/email hand-off |

Static pages read these at build time, so rebuild after changing them.

## Where things live

| What | Where |
|---|---|
| Business details (phone, WhatsApp, email, address, GSTIN…) | `src/config/business.ts` (placeholders show as "—") |
| Environment validation | `src/config/env.ts` |
| Launch catalog copy | `src/content/catalog-data.ts` (seeded into MongoDB by `pnpm db:seed`) |
| Page copy, policies, SEO | `src/content/` |
| Catalog access (static or Mongo) | `src/lib/catalog/` |
| Quote API, uploads, emails | `src/app/api/`, `src/lib/quotes/`, `src/lib/uploads/`, `src/lib/email/` |
| Security (rate limits, origin, Turnstile, IP hashing) | `src/lib/security/` |
| Admin auth | `src/lib/auth/`, `src/proxy.ts` |
| Admin pages and actions | `src/app/admin/`, `src/components/admin/` |
| Mongoose models · zod schemas | `src/models/` · `src/schemas/` |
| Design tokens | `src/styles/globals.css` |
| Illustrations (used until photos are uploaded) | `src/components/site/art/` |

## Photos

Upload product photos in the admin (Products → a product → Images). The first photo becomes the cover;
without photos each page shows its brand illustration. With `CLOUDINARY_*` set, photos go to Cloudinary;
otherwise they are stored in `MEDIA_DIR` and served from `/media/...`.

## Security notes

- Admin: single account from env (argon2id hash), 12 h JWT cookie (`HttpOnly`, `SameSite=Strict`), 5 login
  attempts per 15 min per IP, and sign-in locks for the rest of the day after 20 failed attempts. Every admin action and route checks
  the session itself; bump `SESSION_VERSION` to sign everyone out.
- Quotes and uploads: same-origin check, rate limits, honeypot, minimum fill time, Turnstile, content sniffing,
  files stored outside the web root and downloaded only as attachments by the admin.
- Set `TRUST_PROXY=true` only behind Nginx (it must overwrite `X-Forwarded-For`); otherwise all visitors share
  one rate-limit bucket.
- CSP and security headers are in `next.config.ts`. Inline scripts are allowed so pages can stay statically
  generated (a nonce-based CSP would make every page dynamic); HSTS is set in Nginx.
