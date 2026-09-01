# Day 7 — nginx admin SPA + live CORS

**Goal:** Open `http://YOUR_EC2_PUBLIC_IP` in a browser and see the admin SPA. Login/API calls work (CORS + `VITE_API_URL`).

| In this repo | On the live EC2 |
|---|---|
| `nginx/admin.conf` / `admin-ip.conf` ready | Install/enable nginx site |
| CORS supports EC2 admin origin | Set `ADMIN_ORIGIN` on API `.env` |
| Rebuild notes for `VITE_API_URL` | Security group: **80** + **4000** open |

**Not Day 7** (stop before these): Route 53 / custom domain (**Day 8**), certbot HTTPS + Lighthouse (**Day 9**).

---

## 0. Prerequisites (from Day 6)

- [ ] SSH works with `.pem`
- [ ] `/var/www/admin/index.html` exists (FileZilla upload done)
- [ ] API can run on the box (`pm2` or `node`) on port **4000**

---

## 1. Rebuild admin against the live API IP

`VITE_API_URL` is baked in at **build time**. If the SPA still points at `localhost`, rebuild:

```bash
cd Frontend/admin-panel
copy .env.production.example .env.production
# Edit:
#   VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000

npm ci
npm run build
```

From repo root (optional zip):

```bash
npm run package:admin
```

Re-upload **`dist/` contents** to `/var/www/admin` (overwrite).

---

## 2. AWS security group

Inbound rules on the EC2 security group:

| Port | Source | Why |
|---|---|---|
| 22 | Your IP | SSH / SFTP |
| 80 | `0.0.0.0/0` (or office IP) | nginx → admin SPA |
| 4000 | `0.0.0.0/0` (or office IP) | Browser → API (Day 7; reverse-proxy optional later) |

Day 7 keeps the API on **:4000**. Do not wait for `api.` DNS.

---

## 3. Install nginx (once)

```bash
ssh -i ~/keys/ticketbox.pem ubuntu@YOUR_EC2_PUBLIC_IP

sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Enable admin site

Copy the repo file onto the server (SFTP the conf, or paste). Example if the repo lives at `~/ticketbox`:

```bash
sudo cp ~/ticketbox/deploy/nginx/admin-ip.conf /etc/nginx/sites-available/ticketbox-admin

# Disable Ubuntu default site (avoids competing for port 80)
sudo rm -f /etc/nginx/sites-enabled/default

sudo ln -sf /etc/nginx/sites-available/ticketbox-admin /etc/nginx/sites-enabled/ticketbox-admin

sudo nginx -t
sudo systemctl reload nginx
```

Or run the helper (after copying `deploy/` to the server):

```bash
bash ~/ticketbox/deploy/scripts/enable-admin-nginx.sh
```

---

## 5. API CORS for the nginx origin

Admin is served from **`http://YOUR_EC2_PUBLIC_IP`** (no `:5173`). The browser Origin header is that URL.

On the server, in `Backend/.env` (or wherever the API loads env):

```bash
ADMIN_ORIGIN=http://YOUR_EC2_PUBLIC_IP
# Optional extras (comma-separated):
# CORS_ORIGINS=http://127.0.0.1,http://localhost:5173
WEB_ORIGIN=http://YOUR_EC2_PUBLIC_IP:3000
API_PUBLIC_URL=http://YOUR_EC2_PUBLIC_IP:4000
```

Restart API:

```bash
# if using PM2:
pm2 restart ticketbox-api
# or:
# pm2 restart all
```

---

## 6. Verify

```bash
# On server
curl -I http://127.0.0.1/
# Expect 200 and text/html from /var/www/admin/index.html

curl -s http://127.0.0.1:4000/health
```

From your laptop browser:

1. `http://YOUR_EC2_PUBLIC_IP` → admin login UI
2. Log in → Network tab: API calls to `http://YOUR_EC2_PUBLIC_IP:4000` succeed (no CORS red errors)
3. Hard-refresh if an old `dist/` was cached

---

## Stop here

Day 7 ends when:

- nginx serves the SPA on **port 80**
- admin talks to the live API with working **CORS**
- you did **not** need a custom domain or HTTPS yet

Next: **Day 8** = Route 53 / hostnames · **Day 9** = certbot + HTTPS.

Day 8 guide: [`day-8.md`](./day-8.md)
