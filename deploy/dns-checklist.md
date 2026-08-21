# Day 8 checklist — DNS + hostnames (HTTP)

Checkpoint: **`http://yourdomain.com`**, **`http://api.yourdomain.com/health`**, and **`http://app.yourdomain.com`** all work. No HTTPS yet.

## AWS / registrar

- [ ] Domain purchased (keep receipt)
- [ ] Elastic IP allocated + associated to EC2
- [ ] Route 53 hosted zone created
- [ ] Registrar nameservers → Route 53 NS (4 records)
- [ ] A records: apex, `www`, `api`, `app` → Elastic IP
- [ ] `nslookup` / `dig` returns Elastic IP for all three

## Server — nginx hostnames

- [ ] `export DOMAIN=yourdomain.com`
- [ ] Ran `Backend/infra/scripts/07-enable-domain-nginx.sh` (or `deploy/scripts/enable-domain-nginx.sh`)
- [ ] `sudo nginx -t` OK + reloaded
- [ ] Day 7 IP-only default site no longer stealing Host routing

## API / CORS

- [ ] `WEB_ORIGIN=http://yourdomain.com`
- [ ] `ADMIN_ORIGIN=http://app.yourdomain.com`
- [ ] `API_PUBLIC_URL=http://api.yourdomain.com`
- [ ] `CORS_ORIGINS=http://www.yourdomain.com` (optional but recommended)
- [ ] `pm2 restart all`

## Sahil — admin SPA

- [ ] `.env.production` → `VITE_API_URL=http://api.yourdomain.com`
- [ ] Fresh `npm run build`
- [ ] Uploaded `dist/` contents to `/var/www/admin`
- [ ] `http://app.yourdomain.com` shows login; Network calls go to `api.` (no `:4000`)

## Security group

- [ ] Port **80** open
- [ ] Port **4000** public inbound **removed** (nginx proxies API)
- [ ] Port **22** still open for you

## Browser proof

- [ ] `http://yourdomain.com` → public EJS
- [ ] `http://api.yourdomain.com/health` → OK JSON
- [ ] `http://app.yourdomain.com` → admin login works

## Stop here

Do **not** run certbot or switch origins to `https://` — that is **Day 9**.
