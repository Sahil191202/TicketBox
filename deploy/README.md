# TicketBox — Week 2 Deploy

## Day 6 scope (this checkpoint)

**Goal:** You can SSH and SFTP into the EC2 box without help, and you have uploaded the admin `dist/` once.

| Done in this repo | Done on the live EC2 |
|---|---|
| Production build + package scripts | FileZilla SFTP with `.pem` |
| Upload path documented (`/var/www/admin`) | First manual `dist/` upload |
| Permission checklist | `chmod` / `chown` verified |
| SSH/SFTP command cheat sheet | Independent SSH (Sahil + Ram) |

**Not Day 6** (leave for later): nginx SPA config enable (**Day 7**), Route 53 (**Day 8**), certbot/HTTPS + Lighthouse (**Day 9**).

---

## 1. Build the admin SPA (local)

```bash
cd Frontend/admin-panel

# Day 6: build against EC2 API IP (or leave blank only for local proxy testing)
copy .env.production.example .env.production
# Edit VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000

npm ci
npm run build
# Output: Frontend/admin-panel/dist/

# Optional zip for FileZilla (Windows PowerShell from repo root):
npm run package:admin
# Creates: deploy/artifacts/admin-dist.zip
```

`VITE_API_URL` is baked in at **build time**. Rebuild after changing it.

---

## 2. SSH (OpenSSH)

```bash
# On your laptop — key must not be world-readable
chmod 400 ~/keys/ticketbox.pem          # macOS / Linux / Git Bash
# Windows PowerShell (if OpenSSH complains about permissions):
#   icacls ticketbox.pem /inheritance:r
#   icacls ticketbox.pem /grant:r "$env:USERNAME:(R)"

ssh -i ~/keys/ticketbox.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

First connect: type `yes` for host key. Then:

```bash
whoami
pwd
ls /var/www
```

---

## 3. FileZilla SFTP

| Field | Value |
|---|---|
| Protocol | **SFTP** — SSH File Transfer Protocol |
| Host | `YOUR_EC2_PUBLIC_IP` |
| Port | `22` |
| Logon Type | Key file |
| User | `ubuntu` (or your AMI user) |
| Key file | `ticketbox.pem` |

Remote path for admin SPA: **`/var/www/admin`**

---

## 4. First-time server folders (SSH once)

```bash
sudo mkdir -p /var/www/admin
sudo chown -R ubuntu:ubuntu /var/www/admin
sudo chmod -R u+rwX,go+rX /var/www/admin
ls -la /var/www/admin
```

Upload the **contents** of `dist/` (or unzip `admin-dist.zip`) into `/var/www/admin` so you see:

```
/var/www/admin/index.html
/var/www/admin/assets/...
```

Not `/var/www/admin/dist/index.html`.

---

## 5. Verify permissions after upload

```bash
ls -la /var/www/admin
test -f /var/www/admin/index.html && echo "index.html OK"
# nginx (Day 7) will need read access — go+rX on dirs/files is enough
```

Optional Day 6 report artifact (PRD §2.3.1):

```bash
# After nginx exists (often Day 7+), download via FileZilla:
#   /var/log/nginx/error.log
```

---

## 6. Files in this folder

| Path | Purpose |
|---|---|
| `README.md` | This guide (Day 6) |
| `sftp-checklist.md` | Tick-box Day 6 checklist |
| `day-7.md` | nginx SPA + CORS on EC2 IP |
| `nginx-checklist.md` | Tick-box Day 7 checklist |
| `scripts/enable-admin-nginx.sh` | One-shot enable admin nginx site |
| `nginx/admin.conf` | SPA site (**enable on Day 7**) |
| `nginx/api.conf` | API reverse-proxy stub (**Day 7+ / Day 8**) |
| `nginx/web.conf` | Public EJS reverse-proxy stub (**Day 7+ / Day 8**) |
| `pm2/ecosystem.config.cjs` | API + web process file (Ram / paired) |
| `artifacts/` | Built zip output (gitignored) |

---

## Day 7 preview (do not block Day 6)

Full guide: **[`day-7.md`](./day-7.md)** · checklist: **[`nginx-checklist.md`](./nginx-checklist.md)**

1. Rebuild admin with `VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000` and re-upload `dist/`
2. Open SG ports **80** + **4000**
3. Copy `nginx/admin.conf` → sites-available, disable default site, `nginx -t` + reload
4. Set `ADMIN_ORIGIN=http://YOUR_EC2_PUBLIC_IP` on API and restart
5. Open `http://YOUR_EC2_PUBLIC_IP` — admin SPA + working login

**Day 7 stop:** SPA on port 80 + CORS OK. No DNS, no certbot yet.
