# Day 9 — HTTPS (certbot) + live payments

**Goal:** SSL on all 3 hostnames; Razorpay webhook on live `api.`; full **test payment** completes over HTTPS.

| Hostname | Serves (HTTPS) |
|---|---|
| `https://yourdomain.com` / `www.` | EJS public site |
| `https://api.yourdomain.com` | JSON API |
| `https://app.yourdomain.com` | Admin SPA |

Canonical EC2 checklist (Ram): **[`../Backend/docs/DAY9_EC2.md`](../Backend/docs/DAY9_EC2.md)**  
Sahil tick-box: **[`https-checklist.md`](./https-checklist.md)**

**Not Day 9** (stop before these): Lambda auto-stop, backups, cost report, teardown (**Day 10**).

---

## Prereqs (Day 8 done)

- Elastic IP + Route 53 A records resolve
- `http://` apex / api / app already work
- Security group: **80 + 443** open; **4000** closed publicly

---

## 1. Issue certificates (on EC2)

```bash
cd ~/ticketbox/Backend
export DOMAIN=yourdomain.com
export CERTBOT_EMAIL=you@example.com
bash infra/scripts/09-certbot-ssl.sh
```

Or from monorepo `deploy/`:

```bash
export DOMAIN=yourdomain.com
export CERTBOT_EMAIL=you@example.com
bash deploy/scripts/certbot-ssl.sh
```

Certbot installs itself, obtains Let's Encrypt certs for apex / www / api / app, enables HTTPS + HTTP→HTTPS redirect, and dry-runs renewal.

---

## 2. Switch app config to HTTPS

```bash
bash infra/scripts/10-print-https-env.sh
# or: bash deploy/scripts/print-https-env.sh
```

Paste into `Backend/.env`:

```bash
WEB_ORIGIN=https://yourdomain.com
ADMIN_ORIGIN=https://app.yourdomain.com
API_PUBLIC_URL=https://api.yourdomain.com
CORS_ORIGINS=https://www.yourdomain.com
```

```bash
pm2 restart all
pm2 save
```

---

## 3. Sahil — rebuild admin for HTTPS API

```bash
cd Frontend/admin-panel
copy .env.production.example .env.production
# Edit:
#   VITE_API_URL=https://api.yourdomain.com

npm ci
npm run build
# Upload dist/ contents → /var/www/admin
```

From repo root: `npm run package:admin`

Hard-refresh the browser (old `http://` bundle causes mixed-content errors).

---

## 4. Razorpay webhook (live HTTPS)

1. Razorpay Dashboard → Settings → Webhooks  
2. URL: `https://api.yourdomain.com/webhooks/razorpay`  
3. Events: `payment.captured`, `payment.failed`  
4. Secret → `RAZORPAY_WEBHOOK_SECRET` in `.env` if changed  
5. **Remove** old cloudflared / ngrok webhook  
6. `pm2 restart ticketbox-api` (or `pm2 restart all`)

---

## 5. Live checks

- S3: admin banner upload still works via `https://api.…`  
- Full payment on `https://yourdomain.com` with test card `4111 1111 1111 1111`  
- Optional: close tab mid-pay → webhook still marks booking `paid`  
- Admin at `https://app.yourdomain.com` shows the booking  

Optional Lighthouse (mobile) on `https://yourdomain.com` — note score for the Week 2 report; do not block the Day 9 payment checkpoint on a perfect score.

---

## 6. Verify

```bash
curl -sI https://yourdomain.com | head
curl -s https://api.yourdomain.com/health
curl -sI https://app.yourdomain.com | head
sudo certbot renew --dry-run
```

No mixed-content warnings in DevTools.

---

## Stop here

Day 9 ends when HTTPS works on all three hosts and a **full test payment** succeeds with the live webhook.

**Day 10:** Lambda auto-stop, pg_dump cron, budget proof, architecture diagram, cost report, teardown.
