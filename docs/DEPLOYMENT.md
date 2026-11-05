# VasuPrint: deployment runbook (Hostinger VPS + GoDaddy DNS)

This is the single source of truth for putting the site live. It is written so a coding agent (or a person) can
follow it top to bottom. Every command was checked against this repository: `package.json` scripts,
`.env.example`, `src/config/env.ts`, `next.config.ts` and the code in `src/lib/`.

**Target:** one Next.js 16 process (`next start`) under its own PM2 daemon and Linux user, behind Nginx with a
Let's Encrypt certificate, on the owner's existing Hostinger VPS, **next to the website that already runs there**
(§2 explains how to stay out of its way). MongoDB on MongoDB Atlas. Deploys run from GitHub Actions over SSH on
every push to `main`.

Steps marked **OWNER** need the owner (a login, a password, a payment or a decision). An agent should ask for
them, wait, and never guess.

---

## 0. Facts about this codebase that shape the deploy

| Fact | Where | Consequence |
|---|---|---|
| No `output: 'standalone'` in `next.config.ts` | `next.config.ts` | Each release is a full checkout with `node_modules`, started with `next start`. Do not copy `.next/standalone`. |
| No `.github/`, no `ecosystem.config.cjs`, no deploy script in the repo | repo root | You create them from §6 and §7 of this file. |
| Next.js reads `.env` from the working directory at **build** and at **start** | Next.js | The server `.env` is symlinked into every release **before** `pnpm build`. |
| `CATALOG_SOURCE`, `QUOTE_BACKEND` and every `NEXT_PUBLIC_*` value are baked in at build time | README "Feature flags" | After changing any of them, run a new deploy (rebuild), not just a restart. |
| `ADMIN_PASSWORD_HASH` must have every `$` written as `\$` | `scripts/admin-hash.ts`, `src/config/env.ts` | Paste the line `pnpm admin:hash` prints exactly. Never pass the `.env` to `node --env-file` for the web app, and never `source` it in bash (both mishandle `\$`). |
| Production refuses to boot when secrets are missing | `src/config/env.ts`, `src/instrumentation.ts` | With `QUOTE_BACKEND=on`: SMTP_*, MAIL_FROM, QUOTE_NOTIFY_TO, both Turnstile keys, IP_HASH_SALT, MONGODB_URI are required. With `CATALOG_SOURCE=mongo`: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET (32+ chars), MONGODB_URI. `LOCAL_PREVIEW=true` is refused on a real domain. |
| Rate limits are in memory | `src/lib/security/rate-limit.ts` | Run exactly **one** process (PM2 fork mode, `instances: 1`). |
| `next start` binds the port passed with `-p` | `deploy.sh` (§6) | Any free localhost port works; the existing site keeps its own. Set once as `APP_PORT`. |
| Client IP comes from `X-Forwarded-For` only when `TRUST_PROXY=true` | `src/lib/security/ip.ts` | Set `TRUST_PROXY=true` and have Nginx overwrite the header with `$remote_addr` (§5). |
| Artwork uploads up to **100 MB** (`/api/uploads`), admin images up to **8 MB** (`/api/admin/media`), server actions 1 MB | `src/app/api/uploads/route.ts`, `src/lib/media/store.ts`, `next.config.ts` | Nginx body limits in §5 match these. |
| Admin images go to Cloudinary when all three `CLOUDINARY_*` are set, otherwise to `MEDIA_DIR`, served at `/media/...` | `src/lib/media/store.ts` | Without Cloudinary, `MEDIA_DIR` must be in the backups. |
| Artwork is stored in `UPLOAD_DIR` (`tmp/` while pending, `leads/<reference>/` once attached) and never served publicly | `src/lib/uploads/store.ts` | `UPLOAD_DIR/leads` is in the backups; pending files are cleaned hourly by `pnpm uploads:cleanup`. |
| `GET /api/health` returns 200 `{status:"ok"}`, or 503 when MongoDB is needed and down | `src/app/api/health/route.ts` | Used by the deploy health check, rollback and uptime monitor. `APP_VERSION` env is shown as `version`. |
| The canonical domain is hard-coded as `business.siteUrl = 'https://vasuprint.com'` | `src/config/business.ts`, `src/lib/seo-env.ts` | If `SITE_URL` is any other host, every page is marked **noindex** (treated as staging). If the real domain is different, change `siteUrl` in `business.ts` first. |
| `pnpm db:seed` imports the launch categories and products; without `--force` it never overwrites edits but it **re-creates** deleted items | `scripts/seed.ts` | Run it once before the first build with `CATALOG_SOURCE=mongo`, then only on purpose (§6 `RUN_SEED=1`). |
| `mongodb-memory-server` (dev dependency) downloads a MongoDB binary on install | `package.json` | The deploy script sets `MONGOMS_DISABLE_POSTINSTALL=1` on the VPS. CI is fine without it. |
| `pnpm-lock.yaml` is lockfile v9 | repo root | Use pnpm 10 everywhere (`--frozen-lockfile`). Node **22.9+** (`engines`). |
| There is no Playwright config yet | repo root | Do not run `pnpm test:e2e` in CI. |

### Two ways to launch

- **Full launch (recommended):** `CATALOG_SOURCE=mongo`, `QUOTE_BACKEND=on`. Quotes are saved, artwork uploads work,
  emails go out, the admin panel works. Needs Atlas, SMTP, Turnstile and admin secrets (§3).
- **Minimal launch (fallback if the owner doesn't have the services yet):** `CATALOG_SOURCE=static`,
  `QUOTE_BACKEND=off`. No database or secrets needed; the quote form hands the buyer a pre-filled WhatsApp message
  or email. Switch to full later by editing `.env` and redeploying. The health check reports `db: "disabled"`.

---

## 1. Push the code to the owner's GitHub (OWNER + agent)

The code must live in a repository on **the owner's own GitHub account**. Never push to `ScRocXx` or any account the
owner hasn't named.

```bash
cd D:\PROJECTS\vasuprints          # PowerShell or Git Bash on Windows
git status                         # see note on uncommitted work below
git remote -v                      # currently: https://github.com/nishant-kumar-yadav/vasuprints.git
gh auth status                     # which GitHub account the CLI is signed in as
```

1. **OWNER:** confirm which GitHub account and repository to use. If `origin` already points to the owner's own
   repository, keep it. Otherwise the owner creates a new **empty, private** repository on github.com (no README,
   .gitignore or licence) and the agent runs:
   ```bash
   git remote set-url origin https://github.com/<owner-account>/<repo>.git
   ```
2. Uncommitted work: at the time of writing, `git status` shows the photo import in progress
   (`public/images/**`, `src/content/images-manifest.ts`, `docs/PHOTO-AGENT-PROMPT.md`, changes under
   `vasuprint-photos/`). Ask the owner whether to commit it before the first deploy. Photos are optional: without
   them each page shows its brand illustration. Never commit `.env`, `.env.local` or `storage/` (already in `.gitignore`).
3. Optional: `git config user.name "<Owner Name>"` and `git config user.email "<owner email>"` so new commits are theirs.
4. Run the local checks before pushing (they also run in CI, §7):
   ```bash
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test
   pnpm build
   ```
5. `git push -u origin main`

---

## 2. Hostinger VPS: add VasuPrint next to the existing website

**This VPS already runs another live website.** VasuPrint is added alongside it and must not change anything that
site depends on. Rules for this whole runbook:

- **Never** reinstall the OS, run `apt upgrade` / `apt full-upgrade`, change the system timezone, or replace the
  system Node.js, PM2 or Nginx version.
- **Never** edit or remove another site's Nginx files, the Nginx `default` site, `nginx.conf`, or another domain's
  certificates. VasuPrint gets its own files only.
- **Ask the owner first** before changing `sshd_config`, `ufw`/firewall rules, fail2ban, swap, or installing any apt
  package. Adding new packages with `apt install` is usually harmless, but list them and get a yes.
- Everything VasuPrint needs lives in its own places: user `vasuprint`, `/srv/vasuprint/`, `/opt/node22/`, its own
  PM2 daemon, its own port, `/etc/nginx/sites-available/vasuprint.conf` and its own certificate.
- Before and after every server change, check that the existing site still answers (`curl -sI https://<existing-domain>`).

### 2.0 Inspect the server first (read-only, as root or a sudo user)

```bash
ssh root@<VPS_IP>                    # or the user the owner already uses
lsb_release -ds; uname -m            # Ubuntu version and CPU (x86_64 / aarch64)
free -h; nproc; df -h /              # RAM, CPUs, disk
sudo ss -tlnp                        # every listening port and which program owns it
systemctl list-units --type=service --state=running | grep -Ei 'nginx|apache|httpd|lsws|litespeed|caddy|pm2|node|docker|mongo|mysql|maria|cloudpanel|cyberpanel|plesk|cpanel'
ls -la /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null
sudo nginx -T 2>/dev/null | grep -nE 'server_name|listen|default_server|limit_req_zone|upstream' | head -80
nginx -v 2>&1
which node && node -v; which pm2 && pm2 -v; which certbot && sudo certbot certificates
getent passwd | awk -F: '$3>=1000{print $1, $6}'      # existing users (is "vasuprint" free?)
sudo ufw status verbose
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|port '
docker ps 2>/dev/null
swapon --show
```

Report to the owner, in plain words: what the existing site runs on (Nginx / Apache / OpenLiteSpeed / a control
panel / Docker), which domains and ports it uses, the Node/PM2 setup if any, free RAM and disk, firewall and SSH
settings. Then decide with the owner:

| Finding | What to do |
|---|---|
| Nginx serves the existing site (plain Ubuntu, no panel) | Follow this runbook as written: add one more Nginx server block (§5). |
| A control panel (CloudPanel, CyberPanel, Plesk, cPanel, aaPanel, Hostinger's own panel template) | **Stop and ask.** Create VasuPrint through the panel's "Node.js / reverse proxy site" feature instead of editing Nginx by hand, so the panel doesn't overwrite it. Keep §3, §6–§10. |
| Apache, OpenLiteSpeed or Caddy owns ports 80/443 | **Stop and ask.** Use that server's reverse-proxy config to forward `vasuprint.com` to `127.0.0.1:<APP_PORT>` instead of §5. |
| Docker/Traefik owns 80/443 | **Stop and ask.** Route VasuPrint through the existing proxy. |
| Free RAM (`free -h`, "available" + swap) under ~2 GB | Building Next.js on the VPS could starve the other site. Ask the owner about adding swap (§2.2) or a bigger plan. `deploy.sh` refuses to build with less than 1.5 GB available. |

**Pick the app port.** VasuPrint listens only on `127.0.0.1`. Use `3000` if `ss -tlnp` shows nothing on it,
otherwise the first free one of `3100`, `3200`, ... Write it down as `APP_PORT`; it is used in §5 (Nginx) and §6
(`deploy.sh`). Example check: `sudo ss -tlnp | grep -q ':3000 ' && echo taken || echo free`.

### 2.1 Hostinger hPanel (OWNER, only if needed)

Don't change the OS. From hPanel → VPS → the server you only need: the **IPv4 address** (overview page), and, if
hPanel's VPS **Firewall** is enabled, confirm TCP 80 and 443 are already allowed (they will be, for the existing
site). Optional: hPanel → VPS → **Backups / Snapshots**: take a snapshot before starting, so the whole server can
be restored if anything goes wrong.

### 2.2 Packages, swap, Node (ask before each apt install)

```bash
# Only the missing ones; no `apt upgrade`. Check first with: dpkg -l git curl rclone nginx certbot
sudo apt update
sudo apt -y install git curl rclone          # nginx and certbot are normally there already for the other site
```

Swap, only if `swapon --show` is empty, RAM is under 4 GB, and the owner agrees (it affects the whole server, but
only positively):

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**A private Node.js 22 for VasuPrint** in `/opt/node22`, so the system Node (if the other site uses one) is
untouched. Pick the archive for the CPU from `uname -m` (`x64` for x86_64, `arm64` for aarch64) and the newest
22.x from https://nodejs.org/dist/latest-v22.x/:

```bash
cd /tmp
V=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/ | grep -oE 'node-v22\.[0-9]+\.[0-9]+-linux-x64\.tar\.xz' | head -1)   # arm64 servers: linux-arm64
curl -fsSLO "https://nodejs.org/dist/latest-v22.x/$V"
sudo mkdir -p /opt/node22 && sudo tar -xJf "$V" -C /opt/node22 --strip-components=1
sudo env PATH=/opt/node22/bin:$PATH npm install -g pnpm@10 pm2   # installs into /opt/node22 only
/opt/node22/bin/node -v && /opt/node22/bin/pnpm -v && /opt/node22/bin/pm2 -v      # node >= 22.9
```

From here on, every VasuPrint command runs with `export PATH=/opt/node22/bin:$PATH` (the `vasuprint` user gets it
in its profile, §2.3; `deploy.sh` and cron set it themselves).

**MongoDB Database Tools** (`mongodump`) for backups, if `which mongodump` finds nothing. Download the `.tgz` for
this Ubuntu version and CPU from https://www.mongodb.com/try/download/database-tools and unpack it into
`/opt/mongodb-tools` (no apt repo needed):

```bash
sudo mkdir -p /opt/mongodb-tools && sudo tar -xzf mongodb-database-tools-*.tgz -C /opt/mongodb-tools --strip-components=1
/opt/mongodb-tools/bin/mongodump --version
```

### 2.3 The `vasuprint` user

A separate user keeps VasuPrint's files, PM2 daemon and cron apart from the existing site. If the name is taken
(see §2.0), pick another and use it everywhere this runbook says `vasuprint` as a user.

```bash
sudo adduser --disabled-password --gecos "" vasuprint
sudo mkdir -p /home/vasuprint/.ssh && sudo chmod 700 /home/vasuprint/.ssh
sudo cp ~/.ssh/authorized_keys /home/vasuprint/.ssh/authorized_keys     # the owner's key
sudo chmod 600 /home/vasuprint/.ssh/authorized_keys && sudo chown -R vasuprint:vasuprint /home/vasuprint/.ssh
echo 'export PATH=/opt/node22/bin:/opt/mongodb-tools/bin:$PATH' | sudo tee -a /home/vasuprint/.profile
```

Confirm `ssh vasuprint@<VPS_IP>` works from the owner's PC. Do not give this user sudo.

**SSH and firewall:** leave `sshd_config`, `ufw` and fail2ban as they are; the existing site's setup already allows
22/80/443. If §2.0 showed something risky (password login on for root, ufw inactive, no fail2ban), tell the owner
and suggest the change, but make it only with their explicit go-ahead, and keep a root session open while testing
a new SSH login. Never run `ufw enable` on a server whose rules you haven't checked: it can cut off the other
site's ports.

### 2.4 Directories

```
/srv/vasuprint/
├── bin/               deploy.sh, backup.sh (§6, §8)
├── repo/              mirror clone of the GitHub repo
├── releases/<stamp>/  one full checkout per deploy, last 5 kept
├── current ->         symlink to the live release
└── shared/
    ├── .env           production settings (chmod 600)
    ├── uploads/       UPLOAD_DIR: customer artwork (tmp/, leads/)
    ├── media/         MEDIA_DIR: admin images when Cloudinary is not used
    ├── mail/          MAIL_DIR (only used if SMTP is missing; stays empty in production)
    └── logs/
/var/backups/vasuprint/  local backup copies
/var/www/vasuprint-acme/ Let's Encrypt challenge files for this domain only
```

```bash
sudo mkdir -p /srv/vasuprint/{bin,releases,shared/uploads/tmp,shared/uploads/leads,shared/media,shared/mail,shared/logs} /var/backups/vasuprint /var/www/vasuprint-acme
sudo chown -R vasuprint:vasuprint /srv/vasuprint /var/backups/vasuprint
sudo chmod 700 /srv/vasuprint/shared/uploads /var/backups/vasuprint
```

### 2.5 Read access to the GitHub repo (as vasuprint)

```bash
sudo -iu vasuprint
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "vasuprint-vps"
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh-keyscan github.com >> ~/.ssh/known_hosts
cat ~/.ssh/github_deploy.pub
```

Add that public key to the repo as a **read-only deploy key**: GitHub → repo → Settings → Deploy keys → Add
(leave "Allow write access" off), or from the owner's machine:
`gh repo deploy-key add github_deploy.pub --repo <owner>/<repo> --title vasuprint-vps`.

```bash
git clone --mirror git@github.com:<owner>/<repo>.git /srv/vasuprint/repo
```

### 2.6 PM2 at boot (as vasuprint, then one sudo command)

This is a second, separate PM2 daemon owned by `vasuprint` (its state is in `/home/vasuprint/.pm2`). It doesn't
see or touch any PM2 processes of the existing site.

```bash
pm2 install pm2-logrotate && pm2 set pm2-logrotate:retain 14
pm2 startup systemd -u vasuprint --hp /home/vasuprint
# It prints a `sudo env PATH=... pm2 startup ...` line. Run that line as root/sudo.
# It creates the systemd unit pm2-vasuprint.service; it must not replace an existing pm2-<other-user>.service.
```

---

## 3. Services and secrets

Collect these from the OWNER (or create them with the owner watching). Secrets go only into
`/srv/vasuprint/shared/.env` on the server and into GitHub Actions secrets. Never commit them, never put them in a
doc, and don't echo them back in chat more than needed.

### 3.1 MongoDB Atlas (full launch)

1. cloud.mongodb.com → new project "VasuPrint" → create a free **M0** cluster, AWS **Mumbai (ap-south-1)**.
2. Database Access → user `vasuprint_app`, generated password, role **readWrite** on database `vasuprint`.
3. Network Access → add the **VPS IPv4 only**. (Add the owner's IP temporarily only if seeding from their PC; remove it after.)
4. Connect → Drivers → copy the `mongodb+srv://...` string, put the password in, and add `/vasuprint` before the `?`:
   `mongodb+srv://vasuprint_app:<pw>@<cluster>.mongodb.net/vasuprint?retryWrites=true&w=majority`.
   URL-encode special characters in the password.

### 3.2 Email (SMTP) (full launch)

Any provider works (Zoho Mail, Google Workspace, Hostinger Email, Brevo, Amazon SES). Needed: host, port (465 =
TLS, 587 = STARTTLS; the code picks automatically), user, password. `MAIL_FROM` must be an address on a domain the
provider is authorised to send for, e.g. `"VasuPrint <quotes@vasuprint.com>"`. `QUOTE_NOTIFY_TO` is where new
quote alerts go (comma-separated allowed). Add the provider's **SPF, DKIM and DMARC** records in GoDaddy DNS (§4).

### 3.3 Cloudflare Turnstile (full launch)

dash.cloudflare.com → Turnstile → Add widget → hostnames `vasuprint.com` and `www.vasuprint.com`, mode Managed →
copy the **site key** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and **secret key** (`TURNSTILE_SECRET_KEY`). A free
Cloudflare account is enough; the domain does not need to move to Cloudflare.

### 3.4 Admin login (full launch)

- `ADMIN_EMAIL`: the owner's login email.
- `ADMIN_PASSWORD_HASH`: the **OWNER** types the password themself (14+ characters) on their PC:
  `cd D:\PROJECTS\vasuprints && pnpm admin:hash`. It prints `ADMIN_PASSWORD_HASH=\$argon2id\$...`. Use that line as
  printed. The agent never sees or chooses the password.
- `SESSION_SECRET`: `openssl rand -base64 48` (run on the VPS).
- `SESSION_VERSION=1` (bump it later to sign everyone out).

### 3.5 Cloudinary (optional, recommended)

cloudinary.com free account → Dashboard → Product environment: **cloud name, API key, API secret**. If skipped,
admin photos are written to `/srv/vasuprint/shared/media` (backed up in §8).

### 3.6 Optional

`NEXT_PUBLIC_GA_ID` (GA4 `G-...`), `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` (content value of the meta
tag only), `INDEXNOW_KEY` (8–128 letters/digits/dashes, e.g. `openssl rand -hex 16`).

### 3.7 Write `/srv/vasuprint/shared/.env` (as vasuprint)

```bash
umask 077 && nano /srv/vasuprint/shared/.env && chmod 600 /srv/vasuprint/shared/.env
```

```dotenv
# ── Site ──
SITE_URL=https://vasuprint.com
CATALOG_SOURCE=mongo            # minimal launch: static
QUOTE_BACKEND=on                # minimal launch: off
TRUST_PROXY=true
LOCAL_PREVIEW=false
SEO_NOINDEX=false
LOG_LEVEL=info

# ── Database ──
MONGODB_URI=mongodb+srv://vasuprint_app:<pw>@<cluster>.mongodb.net/vasuprint?retryWrites=true&w=majority

# ── Storage (absolute paths) ──
UPLOAD_DIR=/srv/vasuprint/shared/uploads
MEDIA_DIR=/srv/vasuprint/shared/media
MAIL_DIR=/srv/vasuprint/shared/mail

# ── Email ──
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM="VasuPrint <quotes@vasuprint.com>"
QUOTE_NOTIFY_TO=

# ── Spam protection ──
IP_HASH_SALT=                   # openssl rand -hex 32
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# ── Admin ──
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=            # paste the whole line from `pnpm admin:hash`, \$ escapes included
SESSION_SECRET=                 # openssl rand -base64 48
SESSION_VERSION=1

# ── Product images (optional) ──
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Analytics / search (optional) ──
NEXT_PUBLIC_GA_ID=
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
INDEXNOW_KEY=
```

Do **not** put `NODE_ENV` in this file (Next sets it; with `NODE_ENV=production` during install pnpm would skip the
dev dependencies the build needs). Wrap values containing spaces, `#` or `<>` in double quotes. Don't put inline
comments after a value in the real file; the comments above are for reading.

---

## 4. GoDaddy DNS (OWNER, in the GoDaddy account)

Do this as soon as the VPS IP is known; propagation can take from minutes to a few hours, and the certificate (§5)
can't be issued until it has.

1. Sign in at godaddy.com → **My Products** → **Domains** → `vasuprint.com` → **DNS** (Manage DNS).
2. Check **Nameservers** first. If they are GoDaddy's (`nsXX.domaincontrol.com`), continue here. If they point
   somewhere else (e.g. Cloudflare), make the same records at that provider instead.
3. **Remove the parked record.** In DNS Records, find the `A` record with Name `@` whose value is **"Parked"** (or a
   GoDaddy parking/website-builder IP). Delete it (or edit it into the record below). There must be only one `A @`.
4. **Add** `A` · Name `@` · Value `<VPS_IP>` · TTL 600 seconds (or the lowest offered).
5. **www:** make sure there is exactly one `CNAME` · Name `www` · Value `@` · TTL 1 hour. GoDaddy often has one
   already; if it points anywhere else, edit it to `@`. Delete any `A` record named `www`.
6. Delete any `AAAA` record for `@` or `www` unless IPv6 has been set up on the VPS and in Nginx.
7. **Forwarding:** on the domain's page, open **Forwarding** and make sure no domain or subdomain forwarding is set
   (it overrides the records above). Also unpublish any GoDaddy Website Builder site attached to the domain.
8. Leave `NS`, `SOA`, `MX` and existing email `TXT` records alone. Add the SPF/DKIM/DMARC records from the SMTP
   provider (§3.2). If an SPF `TXT` (`v=spf1 ...`) already exists, merge into it; a domain may have only one SPF record.

Verify (from any terminal):

```bash
nslookup vasuprint.com 8.8.8.8          # → <VPS_IP>
nslookup www.vasuprint.com 8.8.8.8      # → vasuprint.com → <VPS_IP>
```

Later (§10): a `TXT` record for Google Search Console verification goes here too.

---

## 5. Nginx and SSL (sudo), alongside the existing site

This assumes §2.0 found plain Nginx. VasuPrint adds **one file**, `/etc/nginx/sites-available/vasuprint.conf`,
and a certificate for `vasuprint.com` + `www.vasuprint.com` only. Don't touch the `default` site, `nginx.conf`
or the other site's files, and don't add `default_server` anywhere (the existing setup already has one, and a
second makes `nginx -t` fail). Names used here (`vasuprint_app`, `vasuprint_pages`) must not already appear in
`nginx -T` output; rename them if they do. Replace `<APP_PORT>` with the port from §2.0.

Back up first, so you can return to the exact previous state:

```bash
sudo tar -czf /root/nginx-before-vasuprint-$(date +%F).tar.gz /etc/nginx
sudo nginx -t                                   # must already pass before you change anything
```

### 5.1 Bootstrap HTTP and get the certificate

DNS from §4 must resolve to the VPS first.

```bash
sudo tee /etc/nginx/sites-available/vasuprint.conf >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name vasuprint.com www.vasuprint.com;
    location /.well-known/acme-challenge/ { root /var/www/vasuprint-acme; }
    location / { return 404; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/vasuprint.conf /etc/nginx/sites-enabled/vasuprint.conf
sudo nginx -t && sudo systemctl reload nginx     # if -t fails: remove the symlink, reload, and investigate
curl -sI https://<existing-domain> | head -1     # the other site still answers
```

(If the existing site has no `listen [::]:80` anywhere and Nginx complains about IPv6, drop that line.)

Use certbot only for these two names. `certonly --webroot` doesn't edit any Nginx file. If certbot isn't installed,
ask before `sudo apt -y install certbot`.

```bash
sudo certbot certonly --webroot -w /var/www/vasuprint-acme -d vasuprint.com -d www.vasuprint.com \
  --cert-name vasuprint.com --agree-tos -m <owner email> --no-eff-email
sudo certbot certificates                        # the other site's certificates are unchanged

# Reload Nginx after renewals (skip if an identical hook already exists in this folder)
ls /etc/letsencrypt/renewal-hooks/deploy/ 2>/dev/null
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
systemctl list-timers | grep certbot             # renewal timer must be listed
sudo certbot renew --dry-run --cert-name vasuprint.com
```

### 5.2 Final config

Check the Nginx version from §2.0: on 1.25.1 or newer you may write `listen 443 ssl;` plus `http2 on;`; on older
versions (Ubuntu 22.04/24.04 ship 1.18/1.24) use `listen 443 ssl http2;` as below. Match whatever style the existing
site's file uses, because mixing the two on the same port can produce warnings.

```bash
sudo tee /etc/nginx/sites-available/vasuprint.conf >/dev/null <<'EOF'
limit_req_zone $binary_remote_addr zone=vasuprint_pages:10m rate=20r/s;
upstream vasuprint_app { server 127.0.0.1:<APP_PORT>; keepalive 32; }

# HTTP → HTTPS (and ACME renewals)
server {
    listen 80;
    listen [::]:80;
    server_name vasuprint.com www.vasuprint.com;
    location /.well-known/acme-challenge/ { root /var/www/vasuprint-acme; }
    location / { return 301 https://vasuprint.com$request_uri; }
}

# www → apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.vasuprint.com;
    ssl_certificate     /etc/letsencrypt/live/vasuprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vasuprint.com/privkey.pem;
    return 301 https://vasuprint.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vasuprint.com;

    ssl_certificate     /etc/letsencrypt/live/vasuprint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vasuprint.com/privkey.pem;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

    client_max_body_size 1m;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;

    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;   # overwrite, single trusted hop (TRUST_PROXY=true)
    proxy_set_header X-Forwarded-Proto $scheme;

    location /_next/static/ {
        alias /srv/vasuprint/current/.next/static/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Customer artwork: up to 100 MB, streamed to the app
    location = /api/uploads {
        client_max_body_size 101m;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        client_body_timeout 600s;
        proxy_pass http://vasuprint_app;
    }

    # Admin product/category images: up to 8 MB
    location = /api/admin/media {
        client_max_body_size 9m;
        proxy_pass http://vasuprint_app;
    }

    location / {
        limit_req zone=vasuprint_pages burst=40 nodelay;
        proxy_pass http://vasuprint_app;
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://<existing-domain> | head -1     # the other site still answers
```

`ssl_protocols`, `server_tokens` and similar settings are server-wide in `nginx.conf`, so they're left as the
existing setup has them. Nginx must be able to read `/srv/vasuprint/current/.next/static/` (the default
`www-data` user can, since those folders are world-readable; check with
`sudo -u www-data ls /srv/vasuprint/current/.next/static` after the first deploy).

**Undo** (removes VasuPrint from Nginx only): `sudo rm /etc/nginx/sites-enabled/vasuprint.conf && sudo nginx -t && sudo systemctl reload nginx`.

Until the first deploy (§6) the site answers 502; that's expected.

---

## 6. Deploy script on the VPS (as vasuprint)

`/srv/vasuprint/bin/deploy.sh` builds a release from a commit, switches `current` to it, restarts PM2, checks
`/api/health` and rolls back automatically if it fails. It lives outside the releases so a bad release can't
break the deployer. Optionally also commit a copy to the repo as `deploy/deploy.sh` for reference.

```bash
cat > /srv/vasuprint/bin/deploy.sh <<'EOF'
#!/usr/bin/env bash
# Usage: deploy.sh <commit-sha|branch>      RUN_SEED=1 deploy.sh <sha>  also runs `pnpm db:seed` before the build
set -euo pipefail
REF="${1:-main}"
ROOT=/srv/vasuprint
APP_PORT=3000                       # the free port chosen in §2.0; must match the Nginx upstream (§5.2)
export PATH=/opt/node22/bin:$PATH   # VasuPrint's own Node, not the system one
export MONGOMS_DISABLE_POSTINSTALL=1 CI=true

# Don't starve the existing site: need ~1.5 GB of available RAM + swap to build
AVAIL_MB=$(awk '/MemAvailable/{m=$2} /SwapFree/{s=$2} END{print int((m+s)/1024)}' /proc/meminfo)
if [ "$AVAIL_MB" -lt 1536 ]; then echo "Only ${AVAIL_MB} MB available; refusing to build (see §2.2 swap)"; exit 1; fi

git --git-dir="$ROOT/repo" fetch --prune --quiet
SHA="$(git --git-dir="$ROOT/repo" rev-parse --verify "$REF^{commit}")"
REL="$ROOT/releases/$(date +%Y%m%d-%H%M%S)-${SHA:0:7}"
PREV="$(readlink -f "$ROOT/current" 2>/dev/null || true)"

mkdir -p "$REL"
trap 'echo "Build failed, removing $REL"; rm -rf "$REL"' ERR
git --git-dir="$ROOT/repo" archive "$SHA" | tar -x -C "$REL"
ln -s "$ROOT/shared/.env" "$REL/.env"           # read by next build, next start and the pnpm scripts
cd "$REL"
pnpm install --frozen-lockfile
if [ "${RUN_SEED:-0}" = "1" ]; then pnpm db:seed; fi
nice -n 10 pnpm build                 # lower priority than the existing site

cat > "$REL/ecosystem.config.cjs" <<PM2
module.exports = { apps: [{
  name: 'vasuprint',
  cwd: '$REL',
  script: 'node_modules/next/dist/bin/next',
  args: 'start -p $APP_PORT -H 127.0.0.1',
  exec_mode: 'fork',
  instances: 1,
  env: { NODE_ENV: 'production', APP_VERSION: '${SHA:0:7}' },
  max_memory_restart: '700M',
  kill_timeout: 10000,
  out_file: '$ROOT/shared/logs/out.log',
  error_file: '$ROOT/shared/logs/error.log',
  time: true,
}] };
PM2
trap - ERR

start() { pm2 delete vasuprint >/dev/null 2>&1 || true; pm2 start "$1/ecosystem.config.cjs"; pm2 save --force >/dev/null; }

ln -sfn "$REL" "$ROOT/current"
start "$REL"

for i in $(seq 1 30); do
  if curl -fsS -m 5 "http://127.0.0.1:$APP_PORT/api/health" >/dev/null; then
    echo "Deployed ${SHA:0:7} ($REL)"
    ls -1dt "$ROOT"/releases/*/ | tail -n +6 | xargs -r rm -rf     # keep the 5 newest
    exit 0
  fi
  sleep 2
done

echo "Health check failed for ${SHA:0:7}"
pm2 logs vasuprint --lines 40 --nostream || true
if [ -n "$PREV" ] && [ -d "$PREV" ]; then
  echo "Rolling back to $PREV"
  ln -sfn "$PREV" "$ROOT/current"
  start "$PREV"
fi
exit 1
EOF
chmod +x /srv/vasuprint/bin/deploy.sh
```

The PM2 process is started from the real release path (not the `current` symlink), so each deploy is a clean
`delete` + `start`: a few seconds of downtime, no stale code. `pm2 delete vasuprint` acts only on the
`vasuprint` user's own PM2 daemon, never on the existing site's processes.

### 6.1 First deploy (manual)

```bash
# Full launch: seed the empty database first, in the same run as the first build
RUN_SEED=1 /srv/vasuprint/bin/deploy.sh main
# Minimal launch (CATALOG_SOURCE=static): no seed
/srv/vasuprint/bin/deploy.sh main

curl -s http://127.0.0.1:<APP_PORT>/api/health    # {"status":"ok","db":"ok",...}
curl -sI https://vasuprint.com | head -20          # 200, HSTS, CSP, nosniff
```

If the app doesn't start, `pm2 logs vasuprint` shows the exact missing variable (`Missing required environment
variables: ...`).

### 6.2 Rollback by hand

```bash
ls -1dt /srv/vasuprint/releases/*/
ln -sfn /srv/vasuprint/releases/<previous> /srv/vasuprint/current
export PATH=/opt/node22/bin:$PATH
pm2 delete vasuprint; pm2 start /srv/vasuprint/releases/<previous>/ecosystem.config.cjs; pm2 save
```

### 6.3 After changing `.env`

Flags and `NEXT_PUBLIC_*` values are built in, so rebuild: `/srv/vasuprint/bin/deploy.sh main` (or run the
workflow manually, §7). A plain `pm2 restart vasuprint` only picks up server-only secrets such as SMTP passwords.

---

## 7. GitHub Actions (create in the repo, commit, push)

### 7.1 SSH key for Actions

On the owner's PC (Windows has `ssh-keygen` built in):

```bash
ssh-keygen -t ed25519 -f gha_deploy -N "" -C "github-actions-vasuprint"
```

- Append `gha_deploy.pub` to `/home/vasuprint/.ssh/authorized_keys` on the VPS (not root's, not the other site's user).
- Save the private key as repo secrets (GitHub → repo → Settings → Secrets and variables → Actions, or `gh`):
  ```bash
  gh secret set VPS_SSH_KEY < gha_deploy --repo <owner>/<repo>
  gh secret set VPS_HOST --body "<VPS_IP>" --repo <owner>/<repo>
  ```
- Delete the local `gha_deploy` private key file afterwards.
- Optional: repo Settings → Environments → `production` → Required reviewers, to approve each deploy by hand.

### 7.2 `.github/workflows/deploy.yml`

```yaml
name: CI and deploy
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

concurrency:
  group: ${{ github.event_name == 'pull_request' && format('ci-{0}', github.ref) || 'deploy-production' }}
  cancel-in-progress: false

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build          # defaults: static catalog, quotes off, no secrets needed

  deploy:
    needs: check
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Build and release on the VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: vasuprint
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          command_timeout: 30m
          script: /srv/vasuprint/bin/deploy.sh ${{ github.sha }}
```

Commit it (`git add .github/workflows/deploy.yml && git commit -m "Add CI and deploy workflow"`), push, and watch
the run (`gh run watch`). A failed health check makes the job fail and the VPS rolls back by itself.

---

## 8. Backups and scheduled jobs

### 8.1 Off-site target (OWNER decides)

Configure rclone as the vasuprint user (`rclone config`; its config stays in `/home/vasuprint/.config/rclone`) with a base remote, e.g. Google Drive or Cloudflare R2 (10 GB free),
then a **crypt** remote named `vasuprint-crypt` on top of it. The owner stores the crypt passwords in their
password manager; without them the backups can't be restored. If the owner wants no off-site copy yet, the script
still keeps 14 days locally, plus Hostinger's own VPS backups/snapshots (hPanel → VPS → Backups).

### 8.2 `/srv/vasuprint/bin/backup.sh`

```bash
cat > /srv/vasuprint/bin/backup.sh <<'EOF'
#!/usr/bin/env bash
# Nightly: MongoDB dump + artwork + local media + .env, kept 14 days locally and 90 days off-site (encrypted).
set -euo pipefail
umask 077
export PATH=/opt/mongodb-tools/bin:/opt/node22/bin:$PATH
ROOT=/srv/vasuprint
OUT=/var/backups/vasuprint
STAMP="$(date +%Y%m%d-%H%M)"
getenv() { grep -E "^$1=" "$ROOT/shared/.env" | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

URI="$(getenv MONGODB_URI)"
if [ -n "$URI" ]; then
  mongodump --uri="$URI" --archive="$OUT/db-$STAMP.archive.gz" --gzip --quiet
fi
tar -czf "$OUT/files-$STAMP.tar.gz" -C "$ROOT/shared" uploads/leads media .env
find "$OUT" -type f -mtime +14 -delete

if rclone listremotes | grep -qx 'vasuprint-crypt:'; then
  rclone copy "$OUT" vasuprint-crypt:backups --max-age 25h
  rclone delete vasuprint-crypt:backups --min-age 90d
fi
PING="$(getenv BACKUP_PING_URL)"
if [ -n "$PING" ]; then curl -fsS -m 10 "$PING" >/dev/null || true; fi
echo "Backup $STAMP done"
EOF
chmod +x /srv/vasuprint/bin/backup.sh
/srv/vasuprint/bin/backup.sh && ls -lh /var/backups/vasuprint
```

(`BACKUP_PING_URL` is optional: a healthchecks.io URL you may add to `.env`; the app ignores it.)

### 8.3 Cron (as vasuprint: `crontab -e`)

This is the `vasuprint` user's own crontab; the existing site's cron jobs are untouched. `CRON_TZ` makes the
times IST without changing the server's timezone.

```cron
CRON_TZ=Asia/Kolkata
PATH=/opt/node22/bin:/opt/mongodb-tools/bin:/usr/local/bin:/usr/bin:/bin
# Delete artwork uploads never attached to a quote (> 24 h)
15 * * * * cd /srv/vasuprint/current && pnpm -s uploads:cleanup >> /srv/vasuprint/shared/logs/cron.log 2>&1
# Nightly backup at 02:30 IST
30 2 * * * /srv/vasuprint/bin/backup.sh >> /srv/vasuprint/shared/logs/backup.log 2>&1
```

Skip the cleanup line on a minimal launch (`QUOTE_BACKEND=off`): it needs `MONGODB_URI`.

### 8.4 Restore drill (once before launch, then every quarter)

```bash
ls /var/backups/vasuprint                     # or: rclone copy vasuprint-crypt:backups/<file> /tmp/restore/
mongorestore --uri="<a test cluster or local mongo URI>" --archive=/var/backups/vasuprint/db-<stamp>.archive.gz --gzip \
  --nsFrom='vasuprint.*' --nsTo='vasuprint_restore.*'
tar -tzf /var/backups/vasuprint/files-<stamp>.tar.gz | head
```

Never restore over the live `vasuprint` database without the owner's go-ahead.

---

## 9. Monitoring

| What | Tool (free) | Setting |
|---|---|---|
| Uptime | UptimeRobot | `https://vasuprint.com/api/health` every 5 min, keyword `"ok"`, alert to the owner |
| TLS expiry | UptimeRobot SSL monitor | alert 14 days before |
| Backups ran | healthchecks.io | daily check; put its ping URL in `BACKUP_PING_URL` |
| Errors | `pm2 logs vasuprint --err` | review weekly |
| Disk | `df -h /srv` | keep under 70 %; artwork can be up to 100 MB per file, and the disk is shared with the other site |
| Existing site | UptimeRobot | add a monitor for it too, so you notice if anything here affects it |

---

## 10. Pre-launch checklist

**Business details (OWNER supplies, agent edits `src/config/business.ts`, commits, deploys)**
- [ ] `pnpm check:placeholders` prints "All business details are set." Fields: legal name, owner names, phone
      (display + E.164), WhatsApp (digits only), email, address (line 1, city, state, PIN), Google Maps link and
      embed link, GSTIN, business hours, jurisdiction city, founding year. Full list: `docs/NEEDED-FROM-OWNER.md`.
      The site can go live with placeholders (they show as "—"), but buttons that need them are hidden.
- [ ] `business.siteUrl` matches the real domain and `SITE_URL` in `.env` (otherwise pages are noindexed).
- [ ] Owner has confirmed the policy terms listed in `docs/NEEDED-FROM-OWNER.md` ("Please confirm").

**Photos (optional)**
- [ ] Either photos are committed under `public/images/` with `src/content/images-manifest.ts` (`pnpm images <folder>`,
      see `docs/PHOTO-PROMPTS.md`; with `CATALOG_SOURCE=mongo` run one `RUN_SEED=1` deploy afterwards to copy them
      into products that have none), or the site launches with its illustrations.

**Server and security**
- [ ] `.env` complete, `chmod 600`, `LOCAL_PREVIEW=false`, `TRUST_PROXY=true`, `SEO_NOINDEX=false`.
- [ ] `curl https://vasuprint.com/api/health` → `{"status":"ok","db":"ok"}` (or `"disabled"` on a minimal launch).
- [ ] `http://vasuprint.com`, `http://www.vasuprint.com` and `https://www.vasuprint.com` all 301 to `https://vasuprint.com/`.
- [ ] `curl -sI https://vasuprint.com` shows `strict-transport-security`, `content-security-policy`, `x-content-type-options: nosniff`.
- [ ] `certbot renew --dry-run` passes.
- [ ] Atlas Network Access lists only the VPS IP.
- [ ] From outside, VasuPrint added no open ports (its app listens on 127.0.0.1 only); compare with §2.0 (`nmap <VPS_IP>` or an online port checker).
- [ ] `ssh vasuprint@<VPS_IP>` works with a key; SSH, firewall and fail2ban settings unchanged unless the owner approved a change.
- [ ] **The existing website still works**: its pages load over HTTPS, its certificate is unchanged (`sudo certbot certificates`), `sudo nginx -t` passes, and its own processes are running.

**Quotes, email, admin (full launch)**
- [ ] A test quote with an artwork file arrives at `QUOTE_NOTIFY_TO`, and the customer acknowledgement arrives too.
- [ ] mail-tester.com score ≥ 9/10 (SPF, DKIM, DMARC pass).
- [ ] Turnstile widget appears on the form on the live domain.
- [ ] `/admin` login works; the test lead shows up; its artwork downloads.
- [ ] An image uploaded in the admin shows on the product page (Cloudinary URL, or `/media/...`).
- [ ] Upload limits: a file over 100 MB is rejected; a large file under 100 MB succeeds.
- [ ] Delete the test lead in the admin.

**Operations**
- [ ] A push to `main` deploys through GitHub Actions and the health check passes.
- [ ] Nightly backup ran (files in `/var/backups/vasuprint`, and off-site if configured); restore drill done.
- [ ] Cron jobs installed (`crontab -l`).
- [ ] Uptime and TLS monitors active.

**Search (after the site is live; details in `docs/SEO-PLAYBOOK.md`)**
- [ ] `pnpm seo:audit https://vasuprint.com` (from the owner's PC) reports 0 errors.
- [ ] Google Search Console: Domain property verified with a GoDaddy `TXT` record; `https://vasuprint.com/sitemap.xml` submitted.
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] Google Business Profile with the same name, address and phone as the site.
