# VasuPrint SEO playbook

Updated 4 November 2026.

## 1. Summary

**What was built.** The site now has every on-site piece of SEO in place:

- 13 new pages that answer what buyers actually search for: 7 buyer guides and 6 industry pages.
- Richer copy on every product.
- Structured data on every page, linked into one graph.
- Correct share cards on every page.
- A sitemap with real last-modified dates and image entries.
- Search engine verification tags.
- Instant re-crawl requests to Bing.
- A live SEO checklist in the admin editor.
- An `pnpm seo:audit` command that crawls the whole site and flags problems.

Lighthouse scores on mobile are 100 for SEO, 100 for accessibility and 93–97 for performance.

**Honest expectations.** No website can make every search land on it, and nobody can guarantee Google rankings. Rankings come from three things, in roughly this order:

1. **Relevance and quality of the pages.** This part is now done well.
2. **Trust signals from outside the site.** That means your Google Business Profile, reviews, directory listings and links from other sites. This is the part only you can do, and section 5 explains it.
3. **Time.** A new domain usually takes 3 to 6 months to rank for competitive terms like "mono carton box manufacturer". Specific searches like "pvc gumming sticker for appliances" can start bringing visitors within weeks.

**The five things that matter most, in order:**

1. Fill in the business details (address, phone, WhatsApp, email, GSTIN) in `src/config/business.ts`. Local search and structured data need them.
2. Create and verify a **Google Business Profile** with exactly the same name, address and phone. For "near me" and city searches, this is the biggest single factor.
3. Verify the site in **Google Search Console** and **Bing Webmaster Tools**, and submit the sitemap.
4. List VasuPrint on **IndiaMART, JustDial and TradeIndia**. Indian B2B buyers search there, and the listings link back to the site.
5. Ask every happy customer for a **Google review**. Aim for 20 or more in the first six months.

## 2. Launch checklist

Do these on launch day, after the site is live on https://vasuprint.com.

- [ ] **Search Console.** Go to search.google.com/search-console, add a **Domain** property for vasuprint.com and verify it with a DNS TXT record. This is the preferred method. Alternatively, paste the meta-tag token into the `GOOGLE_SITE_VERIFICATION` env var and rebuild.
- [ ] **Submit the sitemap.** In Search Console, go to Sitemaps and enter `https://vasuprint.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools.** Go to bing.com/webmasters and import from Search Console (one click). Otherwise, set `BING_SITE_VERIFICATION`. Bing also feeds ChatGPT search and Copilot answers.
- [ ] **IndexNow.** Set `INDEXNOW_KEY` to any random 32-character string. After that, every product or category you publish in the admin is reported to Bing within seconds.
- [ ] **Google Analytics.** Set `NEXT_PUBLIC_GA_ID` and mark the `generate_lead` event as a key event. Then link GA4 to Search Console.
- [ ] **Business details and profiles.** In `src/config/business.ts`, fill in the address, phone, opening hours, map pin (geo) and the `profiles` links: Google Business Profile, Instagram, LinkedIn, IndiaMART and so on. The structured data turns into a LocalBusiness automatically once the address is set.
- [ ] **One canonical host.** `https://vasuprint.com` should be the only live address. The server should permanently redirect http:// and www. to it. This is already in the deployment notes.
- [ ] **Staging copies.** Any staging copy should run with `SEO_NOINDEX=true`. A copy on another domain is also blocked automatically.
- [ ] **Run the audit.** Run `pnpm seo:audit https://vasuprint.com` and expect 0 errors.
- [ ] **Request indexing.** In Search Console, use URL Inspection → Request indexing on the home page, the five category pages and the guides hub.

## 3. Keyword map

Each page targets one main search, plus close variations. Don't make two pages compete for the same phrase.

| Page | Main search it targets | Also catches |
|---|---|---|
| Home | custom printing and packaging company | packaging and sticker printing India |
| /packaging-boxes | custom packaging boxes manufacturer | printed boxes, carton box printing |
| /mono-carton-boxes | mono carton boxes | mono carton manufacturer, pharma cartons |
| /sbs-boxes | SBS boxes | SBS board box, premium cosmetic box |
| /duplex-boxes | duplex boxes | duplex board box, grey back carton |
| /custom-stickers | custom printed stickers and labels | product labels printing |
| /paper-gumming-stickers | paper gumming stickers | paper labels, MRP stickers |
| /vinyl-gumming-stickers | vinyl gumming stickers | waterproof labels, bottle labels |
| /pvc-gumming-stickers | PVC gumming stickers | PVC labels, appliance labels |
| /die-cut-stickers | die-cut stickers | custom shape stickers, logo stickers |
| /dtf-stickers, /dtf-transfer-stickers | DTF transfer stickers | DTF gang sheet, DTF printing |
| /dtf-heat-transfer-stickers | DTF heat transfer stickers | ready-to-press logos, neck labels |
| /uv-dtf-stickers, /uv-dtf-sticker-printing | UV DTF stickers | UV DTF printing, UV DTF decals |
| /custom-uv-transfer-stickers | custom UV transfer stickers | cup wraps, tumbler logo stickers |
| /custom-tags, /custom-hang-tags | custom hang tags | garment tags, clothing tags |
| /plastic-tags | plastic tags | PVC tags, waterproof tags |
| /industries/cosmetic-packaging | cosmetic packaging boxes | skincare packaging, cosmetic labels |
| /industries/pharma-packaging | pharma packaging | pharmaceutical cartons, medicine box printing |
| /industries/food-packaging-labels | food packaging and labels | sweet box printing, jar labels |
| /industries/apparel-branding | garment branding | hang tags and DTF for clothing brands |
| /industries/fmcg-packaging | FMCG packaging | retail packaging boxes |
| /industries/corporate-gifting-branding | corporate gift branding | logo stickers for bottles and mugs |
| /guides/dtf-vs-uv-dtf-stickers | DTF vs UV DTF | difference between DTF and UV DTF |
| /guides/sbs-vs-duplex-board | SBS vs duplex | which board for boxes, GSM for cartons |
| /guides/paper-vs-vinyl-vs-pvc-stickers | paper vs vinyl vs PVC stickers | what is a gumming sticker |
| /guides/print-ready-artwork-guide | print-ready artwork | bleed, CMYK, dieline |
| /guides/packaging-finishes-guide | packaging finishes | spot UV, foil stamping, soft-touch |
| /guides/custom-box-price-factors | custom box price | mono carton box price, box cost |
| /guides/hang-tag-design-guide | hang tag design | hang tag size, GSM |

Product pages are where buyers convert. Guides bring in people earlier in their research and pass them on to the product pages through links.

## 4. What the site does automatically

- **Unique titles and descriptions** on every page. Tests fail if two pages share one. Titles stay within 60 characters and descriptions within 160.
- **Structured data (JSON-LD):**
  - Organization on every page. It becomes a LocalBusiness once the address is filled in.
  - WebSite on the home page.
  - Product, with specs and photos, on product pages.
  - CollectionPage on categories and hubs.
  - Article on guides.
  - Service on industry pages.
  - BreadcrumbList and FAQPage wherever they apply.
  - Placeholder values are never output.
- **Share cards.** A branded 1200×630 card for every page at a stable URL (/og/...). These are what WhatsApp, LinkedIn and Facebook show when someone shares a link.
- **Sitemap.** Covers every public page, with last-modified dates taken from the data (admin edits update them) and product photos listed as image entries.
- **robots.txt.** Blocks /admin, /api and the thank-you page. It blocks everything on staging hosts.
- **Canonical URLs.** Every page has one. Changing a slug creates a 301 redirect automatically, so old links keep their ranking.
- **Internal links.** Every product links to related guides and the industries that use it. Every guide links to its products. Categories, the header, the footer and search all link to guides and industries.
- **IndexNow.** Publishing in the admin notifies Bing, Yandex and others immediately. Google picks changes up from the sitemap.
- **Admin SEO checklist.** The product and category editors show a live score with 11 checks: title and description length, main phrase in the title, heading, URL and first paragraph, word count, internal links, FAQs and photo descriptions. Aim for 85 or higher before publishing.
- **Speed.** Pages are statically generated, images are optimised, fonts are self-hosted and analytics are deferred. Mobile Lighthouse scores are 93–97 for performance and 100 for SEO and accessibility.
- **`pnpm seo:audit [url]`.** Crawls the sitemap and checks status codes, titles, descriptions, canonicals, H1s, share images, structured data, image alt text and broken links.

## 5. Off-site work (the part that moves rankings)

**Google Business Profile** (business.google.com):

- Category: "Printing service" as the primary category. Add "Packaging supply store" and "Label printer" as secondary categories.
- Use exactly the same name, address and phone as the website.
- Add 10 or more real photos: the workspace, machines and finished products.
- Add products, with links to the matching product pages.
- Post an update or a new photo every week.
- Reply to every review.

**Directories.** Create complete listings on IndiaMART, JustDial, TradeIndia, ExportersIndia and Sulekha, plus LinkedIn and Instagram business pages. Use the same name, address and phone everywhere. Add each URL to `business.profiles` so the structured data links to it.

**Reviews.** After each delivery, send the WhatsApp "Dispatched" template followed by a review link. Google weighs how many reviews you have, how recent they are and how good they are.

**Links from other sites.** Honest ways to earn them:

- Suppliers and partners listing you as a vendor.
- Local business associations and trade bodies.
- Industry directories.
- Customers' "made by" credits.
- Guest articles on packaging and print blogs.
- Sharing guides in relevant LinkedIn and Facebook groups.

Avoid paid link schemes. They can get the site penalised.

## 6. Content plan

Publish one new guide or case study every two to four weeks. Good next topics:

- How to choose the right box style (tuck end vs crash-lock vs sleeve)
- How to apply DTF transfers: temperature, time and pressure
- Labels for the fridge and freezer: what works
- Barcodes on packaging: size, colour and quiet zone
- Case study: a real customer's box or label, with photos and their permission
- MOQ explained: why minimum order quantities exist for printing

Each new guide is an entry in `src/content/guides.ts` written in Markdown, with its related products listed. Tests check its links and length.

**Monthly routine (30 minutes):**

1. In Search Console → Performance, sort queries by impressions. Queries with high impressions and low clicks need a better title or description. Queries you rank 8–20 for need more content on that page.
2. Check Search Console → Pages for errors.
3. Run `pnpm seo:audit https://vasuprint.com`.
4. Add new photos and FAQs to the products that get the most impressions.

## 7. Measuring

| What | Where | Good sign in the first 3 months |
|---|---|---|
| Pages indexed | Search Console → Pages | All ~41 sitemap URLs indexed |
| Impressions and clicks | Search Console → Performance | Steady growth week on week |
| Average position for main phrases | Search Console → Performance → Queries | Moving from 30+ towards top 10 |
| Quote requests from search | GA4 → Key events (`generate_lead`) by source | First organic leads |
| Map views and calls | Google Business Profile → Performance | Growing calls and direction requests |
