# What I need from you (VasuPrint)

The site works without these, but they show as "—" or fall back gracefully until filled in.
All of them go into one file: `src/config/business.ts`.

## Business details (needed before going live)
1. **Phone number** (display format and the number itself) — enables the Call buttons
2. **WhatsApp number** — right now WhatsApp buttons open WhatsApp with the message ready but no recipient
3. **Business email** — where "Send by email" quote requests go
4. **Full address** (line 1, city, state, PIN) and a **Google Maps link** (plus an embed link if you want the map on the Contact page)
5. **GSTIN**
6. **Legal entity name** (proprietorship / Pvt Ltd name) — used in the Privacy Policy and Terms
7. **Business hours** (e.g. Mon–Sat, 10:00–19:00 IST)
8. **City for legal jurisdiction** (Terms §13)

## Please confirm (from CONTENT.md §9, currently shown on the site as written)
- Quotation valid 15 days; advance payment 100 % for DTF/UV DTF, 50 % for others
- Quantity tolerance ±5 %
- Production times (2–4 / 4–7 / 5–8 / 8–15 business days) and transit times
- Defect window 48 h; transit damage 24 h with unboxing video
- Refund start 3 business days; claim response 2 business days
- "Usually within one business day" reply promise (thank-you page)
- "Pan-India dispatch", food-grade SBS, Pantone matching, self-pickup by appointment
- The materials / GSM ranges / finishes listed on each product page

## Brand and imagery
- **Logo**: v1 uses an SVG logo built from the spec (navy square, folded teal corner, white V). Approve it or send your own.
- **Photos**: generate them with PHOTO-PROMPTS.md (59 prompts with exact filenames), zip the folder and send it. Until then the site shows its brand illustrations.

## For the backend and admin (v2 is built; these switch it on)
1. **Admin login email**: you'll pick the password yourself with `pnpm admin:hash` (14+ characters).
2. **Email sending account** (SMTP host, user, password, from-address), e.g. Zoho Mail, Google Workspace, Amazon SES or Brevo. It sends the team alert and the customer's confirmation.
3. **Where quote alerts should go** (one or more email addresses).
4. **Cloudflare Turnstile keys** (free, invisible bot check on the forms). A Cloudflare account is enough.
5. **MongoDB**: a free MongoDB Atlas cluster in Mumbai, or the database on your own server.
6. **Cloudinary (recommended)**: a free Cloudinary account (cloud name, API key, API secret) for photos uploaded in the admin. Without it they are stored on the server, which then needs backups.

## Decisions still open
- Hosting (VPS per the docs) and access to the domain's DNS. Deployment hasn't been started, as instructed.
- Lead retention: the policy says leads and artwork are kept for repeat orders and deleted on request. The admin can delete a lead and its files.

## For search (see SEO-PLAYBOOK.md)

- Google Business Profile created and verified, with the same name, address and phone as the site, and its link.
- Links to the business's Instagram, LinkedIn, Facebook, IndiaMART, JustDial and TradeIndia pages (create the ones that don't exist yet).
- Opening hours and the map pin (or the Google Maps link) for the workshop.
- The year the business started.
- After launch: verify in Google Search Console (DNS TXT record) and Bing Webmaster Tools.
- A review of the 7 guides and 6 industry pages to confirm they match what VasuPrint really offers.
