# VasuPrint — plan (v1 frontend + v2 backend)

> **Status (4 Nov 2026):** v1 (frontend) and v2 (backend, admin, hardening) are built and tested locally. Not pushed, not deployed. The v2 section below records what changed from the original docs and why.

**Goal of v1:** an excellent, premium, fully responsive website. No backend. Everything the docs call P1 ("Showcase"), built fresh, plus the UI polish the quality bar asks for. P2–P4 (MongoDB, uploads, emails, admin, VPS deploy) move to v2.

Source specs: `vasuprint-docs/` (PRD, UI-UX, DESIGN-SYSTEM, CONTENT, SEO). Where this plan differs from them, this plan wins for v1.

## What changes from the original plan

| Area | Original | v1 decision | Why |
|---|---|---|---|
| Data | Catalog repo with static + Mongo implementations | Static typed content only (`src/content`), one small `catalog.ts` lookup module | No DB in v1; easy to swap for a repository in v2 |
| Quote form | Server endpoint, uploads, Turnstile | Client-side form with full validation → **hand-off panel** that opens WhatsApp or email pre-filled with the whole spec (UI-UX §4.5). Artwork picker lists files locally and tells the buyer to attach them in WhatsApp/email | No enquiry is lost without a backend |
| Contact form | Compact QuoteForm posting to API | Same compact form, same WhatsApp/email hand-off | Same reason |
| Thank-you page | Shows server reference | Kept as a page (noindex) reached after hand-off; no reference number | No server to issue one |
| Admin, API routes, emails, auth, Mongo, PM2/Nginx | P2–P3 | **Deferred to v2** | Owner's priority is UI/UX |
| Images | AI-generated photos via ASSET-PROMPTS | Can't generate photos here, so v1 ships **brand-styled SVG illustrations** (dieline style, navy/teal) for every category and product, with image slots wired so real/AI photos can drop in at `public/images/...` later | Consistent, fast, no fake-looking stock |
| Logo | AI concept or SVG spec | SVG wordmark built from ASSET-PROMPTS §2.2 spec | Replaceable |
| UI kit | shadcn/ui + Radix + react-hook-form | Hand-built primitives on the same tokens; native `<details>`, `<dialog>` and plain React state + zod | Less JS on public pages, fewer deps |
| Tests | Vitest + Playwright + axe in CI | Vitest for lib logic (WhatsApp text, phone format, validation) + Playwright screenshot pass at 360/768/1280 | Enough to keep quality honest |
| Git | One PR per task on GitHub | Local git repo, local commits only, **nothing pushed**. Snapshots copied to `vasuprint-v1/` in project files | Owner instruction |

## Stack (v1)

Next.js 16 (App Router, static generation) · React 19 · TypeScript strict · Tailwind CSS 4 with the DESIGN-SYSTEM tokens · lucide-react · zod · marked (policies, server-side only) · Vitest · Playwright (local checks).

## Pages (all statically generated)

- `/` Home: hero, intro, bento categories, why-choose, process, featured products, capabilities, CTA band
- 5 category pages and 13 product pages via `[slug]`
- `/about`, `/contact`, `/get-a-quote`, `/get-a-quote/thank-you`
- 4 policy pages with sticky table of contents
- 404, `sitemap.xml`, `robots.txt`, metadata + JSON-LD (Organization, Breadcrumb, Product, FAQPage)

Global: sticky condensing header, Products mega-menu, mobile sheet menu, mobile bottom action bar on category/product pages, floating WhatsApp button (desktop), footer, skip link, reveal-on-scroll (reduced-motion safe).

## Milestones

1. **Foundation**: scaffold, tokens, fonts, business config with placeholders, content transcription from CONTENT.md, catalog helpers.
2. **Shell**: header + mega-menu + mobile menu, footer, buttons, cards, motifs, illustrations.
3. **Pages**: home → category → product → quote (+ hand-off) → about → contact → policies → 404/thank-you.
4. **Polish**: responsive pass at 360/768/1024/1280/1440, a11y pass, SEO metadata, screenshots.
5. **Handover**: zip + source copy in `vasuprint-v1/`, README with run instructions, list of details needed from the owner.

## v2 — backend, admin, hardening (built)

Everything from the original P2/P3 scope except deployment, built on the v1 frontend.

| Area | What was built | Changes from the original docs, and why |
|---|---|---|
| Catalog | `src/lib/catalog/`: one `CatalogView` over a static source (content files) or MongoDB, chosen by `CATALOG_SOURCE`. Mongo reads are cached under the `catalog` tag and revalidated on every admin save | If MongoDB is unreachable the site serves the built-in catalog instead of erroring, so a DB outage never takes the shop window down |
| Quote API | `POST /api/quotes`, `POST /api/uploads`, `DELETE /api/uploads/:id`, `GET /api/form-token`, `GET /api/health` | Uploads go up as soon as files are picked (progress bar, retry, remove), so pressing Submit is instant. When the API returns 5xx or the network fails, the form falls back to the v1 WhatsApp/email hand-off, so no enquiry is lost |
| References | `VP-2026-000001`, atomic yearly counter (IST year) | — |
| Contact form | Same API with `kind: "message"` (no delivery fields) | One inbox for quotes and messages; the admin labels them |
| Emails | Team notification + customer acknowledgement (HTML + text), sent after the response with `after()`; delivery status stored on the lead with a Resend button in the admin | Without SMTP in development, emails are written as `.eml` files to `storage/mail` |
| Spam/abuse | Origin check, per-IP rate limits, honeypot + 3 s minimum fill time (signed token) → silent fake success, Turnstile (skipped without keys in dev), content sniffing, 100 MB cap, 2 concurrent uploads per IP, disk-full guard | Client IP is taken from `X-Forwarded-For` only with `TRUST_PROXY=true`; otherwise headers are ignored so they can't be spoofed to dodge limits |
| Admin | `/admin`: dashboard (stats, latest leads, drafts), leads (status tabs with counts, search, pagination, CSV export), lead detail (spec, files, source/UTM, call/WhatsApp/email, status with history, notes, email resend, delete with typed confirmation), products (grouped by category, reorder, editor), categories (reorder, editor) | Reordering uses up/down buttons instead of drag-and-drop: works on phones and with a keyboard, no extra library |
| Product editor | All sections from UI-UX §5 incl. icon picker, chips, FAQs, photos (first = cover, alt text required), quote hints, SEO counters with a Google snippet preview, unsaved-changes guard | Drafts save with relaxed validation; publishing enforces the full schema. Renaming a published URL creates a 308 redirect and updates other products' related lists; deleting a product redirects its URL to its category |
| Photos | `POST /api/admin/media`: Cloudinary when configured, otherwise local `MEDIA_DIR` served from `/media/…` | Lets the owner add real photos before choosing an image host |
| Auth | argon2id (env hash), jose HS256 cookie `vp_session` (12 h, sliding), `SESSION_VERSION` revocation, rate-limited login with constant-time checks; `src/proxy.ts` redirects to login, and every action/route re-checks | — |
| Headers | CSP, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options DENY, COOP; admin + API noindex | CSP allows inline scripts instead of using nonces: nonces force every page to render per request and lose static generation. All other directives are as specified |
| Env | zod-validated at boot (`src/instrumentation.ts`), no secret fallbacks in production; `LOCAL_PREVIEW=true` allows a production build on localhost only | Next.js expands `$` in `.env` files, so `pnpm admin:hash` prints the hash with escaped `\$` and boot fails with a clear message if it got mangled |
| Scripts | `db:seed`, `admin:hash`, `uploads:cleanup`, `check:placeholders`, `db:dev` (Docker Compose: MongoDB + Mailpit) | — |
| Tests | 51 Vitest tests; integration tests run against a real MongoDB (in-memory server): quote flow, references, honeypot, origin, operator injection, foreign upload ids, file sniffing, rate limits, login lockout, every admin action rejected without a session, admin routes 401, slug redirects, CSV formula injection | Browser checks (Playwright + axe) were run by hand: quote → thank-you, contact → thank-you, admin login → edit product → public page updated; axe clean on all admin pages and forms; no overflow at phone width |

### Still to do (needs the owner or a server)

- Deployment: VPS, Nginx (HSTS, `X-Forwarded-For`, body size 110 MB), PM2, Atlas, backups, cron for `uploads:cleanup` (docs/DEPLOYMENT.md). Not started, as instructed.
- Real values: business details, SMTP account, Turnstile keys, admin email, Cloudinary (optional). See `NEEDED-FROM-OWNER.md`.
- GA4 + Search Console after the domain is live.
- Product photography (upload through the admin when ready).

## Needed from the owner

Kept current in `NEEDED-FROM-OWNER.md` next to this file.
