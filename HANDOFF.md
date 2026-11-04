# VasuPrint: handoff

This folder is the complete VasuPrint website: source code plus the full git history (branch `main`). It contains no secrets. `.env.example` lists every setting, and you create your own `.env.local` (for your computer) or set environment variables on the server.

## 1. Unzip and check

```bash
unzip vasuprint-final.zip
cd vasuprint
git log --oneline     # the project history, newest first
git status            # should say "nothing to commit, working tree clean"
```

## 2. Push to your own GitHub repository

1. On GitHub, create a new **empty** repository (no README, no .gitignore, no licence). Private is recommended.
2. In this folder, run:

```bash
git remote add origin https://github.com/<your-account>/<repo-name>.git
git push -u origin main
```

The commits were made under the author name "Claude". If you would rather have new commits under your name, set it once before you continue working:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

## 3. Run it on your computer

You need **Node.js 22.9 or newer** and **pnpm** (`npm install -g pnpm` or `corepack enable`).

**Quick look, no database.** The site uses the content files and the quote form is shown but not saved:

```bash
pnpm install
pnpm dev              # open http://localhost:3000
```

**Full stack: quotes, uploads, admin and emails.** You also need Docker for MongoDB and Mailpit.

```bash
cp .env.example .env.local     # then fill in the values; README.md → "Full stack locally" explains each one
pnpm db:dev                    # starts MongoDB and Mailpit
pnpm db:seed                   # loads products, categories and pages into MongoDB
pnpm admin:hash                # prints ADMIN_PASSWORD_HASH for your admin password; paste it into .env.local
pnpm dev                       # site: http://localhost:3000, admin: http://localhost:3000/admin, mail: http://localhost:8025
```

## 4. Checks before you deploy

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm build && pnpm start        # production build on http://localhost:3000
pnpm seo:audit                  # with the production build running: expect 0 errors
pnpm check:placeholders         # lists business details still missing
```

## 5. What is still needed

- **Business details:** address, phone, WhatsApp number, email and GSTIN in `src/config/business.ts`. The full list is in `docs/NEEDED-FROM-OWNER.md`.
- **Product photos:** see `docs/PHOTO-PROMPTS.md`.
- **Production services:** MongoDB Atlas, SMTP email, Cloudflare Turnstile and Cloudinary for images. Each one is an environment variable listed in `.env.example`.
- **SEO launch steps:** Search Console, Bing, the sitemap and a Google Business Profile. See `docs/SEO-PLAYBOOK.md`.

Deployment is the next step, and we will do it together.

## Where to read more

| File | What it covers |
|---|---|
| `README.md` | Commands, feature flags, project layout, photos, security notes |
| `docs/SEO-PLAYBOOK.md` | Launch checklist, keyword map and content plan |
| `docs/PHOTO-PROMPTS.md` | Photo list and prompts for every product |
| `docs/NEEDED-FROM-OWNER.md` | Everything still needed from you before launch |
| `PLAN-v1.md` | Original plan and design decisions |
