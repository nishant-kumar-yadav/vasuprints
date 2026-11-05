# Prompt for a deployment agent

Paste everything below the line into your coding agent (for example Claude Code), started in `D:\PROJECTS\vasuprints`.

---

You are deploying the VasuPrint website (Next.js 16, MongoDB, Nodemailer) from this folder to production.

**Read first, in this order:** `HANDOFF.md`, then `docs/DEPLOYMENT.md` (the runbook; follow it section by section),
then `.env.example` and `src/config/env.ts` (which variables are required). `AGENTS.md` notes that this Next.js
version differs from what you may know; don't change application code unless I ask.

**Target:**
- Code on **my own GitHub account**. Ask me which account and repository before any push. Never push to `ScRocXx`.
- My Hostinger VPS, reached over SSH from this Windows PC. **It already runs another live website.** VasuPrint
  must be added next to it without affecting it: its own Linux user, its own Node in `/opt/node22`, its own PM2
  daemon, a free localhost port, its own Nginx server block and a certificate for `vasuprint.com` only
  (`docs/DEPLOYMENT.md` §2 and §5).
- Domain `vasuprint.com` with DNS at GoDaddy: an `A` record `@` → the VPS IP, a `CNAME` `www` → `@`, and the
  parked `A` record removed. I make the GoDaddy changes; you give me exact steps and verify with `nslookup`.
- Let's Encrypt SSL, Nginx, PM2, GitHub Actions deploy on push to `main`, nightly backups, uptime monitoring.

**How to work:**
1. Start by running `git status`, `git remote -v` and `gh auth status`, and read the docs above. Then, once I give
   you SSH access, run the **read-only** server inspection in `docs/DEPLOYMENT.md` §2.0 and report: what serves
   the existing site (Nginx, Apache, a control panel, Docker), its domains and ports, Node/PM2 versions, free RAM
   and disk, firewall and SSH settings, and the port you propose for VasuPrint. If it isn't plain Nginx, stop and
   ask how to proceed. Then give me one short list of everything you need from me (VPS IP and SSH access, GitHub account, Atlas, SMTP, Turnstile,
   Cloudinary, admin email, business details) and say whether we're doing the full or the minimal launch
   (`docs/DEPLOYMENT.md` §0). Recommend full.
2. Work through `docs/DEPLOYMENT.md` §1 to §9 in order. Show me each command that changes the server before
   running it, and stop at every step marked OWNER.
3. Secrets go only into `/srv/vasuprint/shared/.env` on the server and into GitHub Actions secrets. Never commit
   them or write them into files in this repo. Generate random secrets on the VPS with `openssl`. I type the admin
   password myself with `pnpm admin:hash`; you only receive the printed hash line.
4. Protect the existing website. Never reinstall the OS, run `apt upgrade`, change the server timezone, or replace
   the system Node, PM2 or Nginx. Never edit or remove the other site's Nginx files, the `default` site,
   `nginx.conf` or its certificates. Ask me before changing `sshd_config`, ufw/firewall, fail2ban or swap, and before
   any `apt install`. Back up `/etc/nginx` before your first Nginx change, run `nginx -t` before every reload, and
   check that the other site still loads after each server change.
5. Also ask before anything else that can't be undone: deleting DNS records, deleting files or releases by hand,
   restoring over the live database, force-pushing.
6. Commit only what the runbook says to add (the workflow file, optionally `deploy/deploy.sh`, business details,
   photos if I approve them), with clear messages, and push to my repository.
7. Finish with the pre-launch checklist in `docs/DEPLOYMENT.md` §10: tick what passes, and list what's left for me.
   Business details should be filled in before launch; photos are optional. Confirm the existing website still works.

If something in the runbook doesn't match what you see on the server or in the code, stop, tell me what differs,
and propose the fix before continuing.
