# VasuPrint v1 — Frontend-first plan

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

## v2 backlog (from original docs)

Quote API + Mongo leads + artwork uploads (≤3 × 100 MB) + emails + Turnstile; admin panel (leads, products, categories, SEO); catalog from Mongo with revalidation; real/AI photography; GA4 + Search Console; VPS deploy (PM2, Nginx, backups); placeholder build gate.

## Needed from the owner

Kept current in `NEEDED-FROM-OWNER.md` next to this file.
