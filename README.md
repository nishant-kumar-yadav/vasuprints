# VasuPrint website — v1 (frontend)

Premium, fully static website for VasuPrint: custom packaging boxes, stickers, DTF / UV DTF transfers and tags.
v1 focuses on UI/UX. There is no backend yet: quote and contact forms validate in the browser, then hand the
buyer a pre-filled WhatsApp message or email. See `PLAN-v1.md` (in the project folder) for scope and the v2 backlog.

## Run it

```bash
corepack enable          # once, provides pnpm
pnpm install
pnpm dev                 # http://localhost:3000
```

Production build: `pnpm build && pnpm start`. Every page is statically generated, so `.next` can be served by any Node host.

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`.

## Where things live

| What | Where |
|---|---|
| Business details (phone, WhatsApp, email, address, GSTIN…) | `src/config/business.ts` — placeholders show as "—" until filled |
| Product & category copy | `src/content/catalog-data.ts` (transcribed from docs/CONTENT.md) |
| Page copy | `src/content/pages/*.ts` |
| Policies | `src/content/policies-data.ts` (Markdown, rendered server-side) |
| SEO titles & descriptions | `src/content/seo-data.ts` |
| Design tokens | `src/styles/globals.css` (`@theme`) |
| Illustrations (stand-ins for photos) | `src/components/site/art/` |
| Quote form + WhatsApp/email hand-off | `src/components/quote/`, `src/lib/quote.ts` |

## Replacing illustrations with photos

Each product and category renders `<Art k="<slug>" />`. When real photos are ready, put them in
`public/images/products/<slug>/1.webp … 4.webp` (and `public/images/categories/<slug>.webp`) and swap the
`<Art>` usages in `Cards.tsx`, `Gallery.tsx`, `CategoryBento.tsx` and the hero sections for `next/image`.
