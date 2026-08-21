# Day 8 — Domain + Route 53 + Elastic IP

**Goal:** Open the site by **hostname** over HTTP (no certbot yet).

| Hostname | Serves |
|---|---|
| `yourdomain.com` / `www.` | EJS public site (PM2 web :3000) |
| `api.yourdomain.com` | JSON API (PM2 api :4000) |
| `app.yourdomain.com` | React admin SPA (`/var/www/admin`) |

Canonical EC2 checklist (Ram): **[`../Backend/docs/DAY8_EC2.md`](../Backend/docs/DAY8_EC2.md)**  
Sahil tick-box: **[`dns-checklist.md`](./dns-checklist.md)**

**Not Day 8** (stop before these): certbot / HTTPS / live webhook URL (**Day 9**).

---

## 1. AWS + registrar (do first)

1. **Buy a domain** (cheap `.xyz` / `.in` is fine)
2. **Elastic IP** → allocate in `ap-south-1` → associate to the EC2 instance
3. **Route 53** hosted zone for the domain → copy 4 NS records → set at registrar
4. **A records** (all → Elastic IP):
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `api.yourdomain.com`
   - `app.yourdomain.com`
5. Verify:

```bash
nslookup yourdomain.com
nslookup api.yourdomain.com
nslookup app.yourdomain.com
# All should return the Elastic IP
```

---

## 2. Enable hostname nginx sites (on EC2)

Templates + script live under `Backend/infra/` (preferred):

```bash
cd ~/ticketbox/Backend
export DOMAIN=yourdomain.com
bash infra/scripts/07-enable-domain-nginx.sh
bash infra/scripts/08-print-domain-env.sh
```

Or from repo `deploy/` (same `__DOMAIN__` templates):

```bash
export DOMAIN=yourdomain.com
bash deploy/scripts/enable-domain-nginx.sh
```

This replaces Day 7’s IP `default_server` with Host-based vhosts.

---

## 3. API `.env` (HTTP — not HTTPS yet)

```bash
WEB_ORIGIN=http://yourdomain.com
ADMIN_ORIGIN=http://app.yourdomain.com
API_PUBLIC_URL=http://api.yourdomain.com
CORS_ORIGINS=http://www.yourdomain.com
```

```bash
pm2 restart all
pm2 save
```

---

## 4. Sahil — rebuild admin for `api.` host

```bash
cd Frontend/admin-panel
copy .env.production.example .env.production
# Edit:
#   VITE_API_URL=http://api.yourdomain.com

npm ci
npm run build
# Upload dist/ contents → /var/www/admin
```

From repo root: `npm run package:admin`

---

## 5. Security group cleanup

| Port | Day 8 |
|---|---|
| 22 | Keep |
| 80 | Keep |
| 443 | Optional until Day 9 (can open now) |
| **4000** | **Remove** public inbound — browsers hit `api.` via nginx :80 |

---

## 6. Verify

```bash
curl -sI -H "Host: yourdomain.com" http://127.0.0.1/
curl -s  -H "Host: api.yourdomain.com" http://127.0.0.1/health
curl -sI -H "Host: app.yourdomain.com" http://127.0.0.1/
```

Browser:

- `http://yourdomain.com` → EJS
- `http://api.yourdomain.com/health` → JSON
- `http://app.yourdomain.com` → admin login

---

## Stop here

Day 8 ends when all three hostnames resolve and work over **HTTP**.

**Day 9:** certbot HTTPS for all three + Razorpay webhook → `https://api.…/webhooks/razorpay`.

Day 9 guide: [`day-9.md`](./day-9.md)
