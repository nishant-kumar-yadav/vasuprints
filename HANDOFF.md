# VasuPrint: handoff

This folder (`D:\PROJECTS\vasuprints`) is the complete VasuPrint website: source code plus the full git history
(branch `main`). It contains no secrets. `.env.example` lists every setting; you create `.env.local` for your
computer, and `/srv/vasuprint/shared/.env` on the server.

**To deploy, follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).** It covers GitHub, the Hostinger VPS, GoDaddy DNS,
SSL, secrets, GitHub Actions, backups and the pre-launch checklist. If you use a coding agent, paste
[`DEPLOY-AGENT-PROMPT.md`](DEPLOY-AGENT-PROMPT.md) into it.

## 1. Check the folder

```bash
cd D:\PROJECTS\vasuprints
git log --oneline     # the project history, newest first
git status            # uncommitted work shows here (e.g. the photo import in progress)
git remote -v         # where `git push` goes
```

## 2. Your own GitHub repository

The code must be pushed to **your** GitHub account (not the one used to build it).

- If `git remote -v` already shows your own repository, keep it.
- Otherwise create a new **empty, private** repository on GitHub (no README, .gitignore or licence) and run:

```bash
git remote set-url origin https://github.com/<your-account>/<repo-name>.git
git push -u origin main
```

The earlier commits were made under the author name "Claude". To have new commits under your name:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

## 3. Run it on your computer

You need **Node.js 22.9 or newer** and **pnpm 10** (`npm install -g pnpm@10`).

**Quick look, no database.** The site uses the content files; the quote form hands off to WhatsApp or email:

```bash
pnpm install
pnpm dev              # open http://localhost:3000
```

**Full stack: quotes, uploads, admin and emails.** You also need Docker (for MongoDB and Mailpit) or any MongoDB 7+.

```bash
cp .env.example .env.local     # then fill in the values; README.md → "Full stack locally" explains each one
pnpm db:dev                    # starts MongoDB and Mailpit (Docker)
pnpm admin:hash                # prints ADMIN_PASSWORD_HASH for your admin password; paste the line into .env.local
pnpm db:seed                   # loads the launch categories and products into MongoDB
pnpm dev                       # site: http://localhost:3000, admin: /admin, mail: http://localhost:8025
```

## 4. Checks before you deploy

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm build && pnpm start        # production build on http://localhost:3000 (set LOCAL_PREVIEW=true in .env.local
                                # if you haven't filled in SMTP/Turnstile/admin secrets)
pnpm seo:audit                  # in a second terminal, with the production build running: expect 0 errors
pnpm check:placeholders         # lists business details still missing
```

## 5. What is still needed before launch

- **Business details:** legal name, phone, WhatsApp number, email, address, Google Maps link, GSTIN, hours,
  jurisdiction city and founding year, all in `src/config/business.ts`. The full list is in
  `docs/NEEDED-FROM-OWNER.md`. The site works with placeholders (they show as "—") but they should be filled in
  before launch.
- **Domain:** `business.siteUrl` in `src/config/business.ts` is `https://vasuprint.com`. If your domain is different,
  change it, or every page will be marked noindex.
- **Product photos (optional):** see `docs/PHOTO-PROMPTS.md` and `docs/PHOTO-AGENT-PROMPT.md`. Until photos are added,
  each page shows its brand illustration.
- **Production services:** MongoDB Atlas, an SMTP email account, Cloudflare Turnstile and (recommended) Cloudinary.
  How to get each one is in `docs/DEPLOYMENT.md` §3.
- **Hosting:** your existing Hostinger VPS (VasuPrint runs next to the website already on it, with its own user, port
  and Nginx block) and access to the domain's DNS at GoDaddy. `docs/DEPLOYMENT.md` §2, §4 and §5.
- **SEO launch steps:** Search Console, Bing, the sitemap and a Google Business Profile. See `docs/SEO-PLAYBOOK.md`.

## Where to read more

| File | What it covers |
|---|---|
| `docs/DEPLOYMENT.md` | Full deployment runbook and pre-launch checklist |
| `DEPLOY-AGENT-PROMPT.md` | A prompt to paste into a coding agent that will do the deployment |
| `README.md` | Commands, feature flags, project layout, photos, security notes |
| `docs/NEEDED-FROM-OWNER.md` | Everything still needed from you before launch |
| `docs/SEO-PLAYBOOK.md` | Launch checklist, keyword map and content plan |
| `docs/PHOTO-PROMPTS.md` | Photo list and prompts for every product |
| `PLAN-v1.md` | Original plan and design decisions |
