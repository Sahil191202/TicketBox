# commands.md — personal command log

Written as I go. Day 1 onward.

## Day 1

```bash
# Project init
npm init -y
npm install express knex pg pino pino-pretty dotenv bcrypt joi
npm install -D nodemon

# Postgres (Windows) — create app DB + user (run as superuser)
# Adjust password to match .env DATABASE_URL
psql -U postgres -h localhost
CREATE USER appuser WITH PASSWORD 'yourpassword';
CREATE DATABASE ticketbox OWNER appuser;
\q

# Migrations + seeds
npm run migrate
npm run seed

# Start processes
npm run start:api
npm run start:web
```

## Day 2

```bash
npm install jsonwebtoken
npm run start:api

# Smoke tests (PowerShell)
Invoke-RestMethod http://localhost:4000/health
$login = Invoke-RestMethod -Method Post -Uri http://localhost:4000/auth/login -ContentType 'application/json' -Body '{"email":"admin@ticketbox.local","password":"Admin@12345"}'
$login.token
Invoke-RestMethod -Uri http://localhost:4000/auth/me -Headers @{ Authorization = "Bearer $($login.token)" }
# Expect 401 without token:
try { Invoke-WebRequest -Uri http://localhost:4000/admin/events } catch { $_.Exception.Response.StatusCode }
```

## Day 3

```bash
npm install ejs express-ejs-layouts
npm run start:web

# Browser
# http://localhost:3000          → published events from DB
# http://localhost:3000/events/intro-to-nodejs
```

## Day 4

```bash
npm install razorpay cors

# Put Razorpay TEST keys in .env (never live keys), then restart API.
# If password has @, URL-encode it in DATABASE_URL (e.g. @ -> %40).
# API_PUBLIC_URL=http://localhost:4000
# WEB_ORIGIN=http://localhost:3000

npm run start:api
npm run start:web
# or: npm run dev:api / npm run dev:web (watches .env too)


# Browser flow:
# Event page → Continue to checkout → Pay with Razorpay
# Test card: 4111 1111 1111 1111, any future expiry, any CVV
```

## Day 5

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 1) cloudflared tunnel (webhook reaches localhost)
cloudflared tunnel --url http://localhost:4000
# Copy https://xxxx.trycloudflare.com

# 2) Razorpay Dashboard → Settings → Webhooks → Add
# URL: https://xxxx.trycloudflare.com/webhooks/razorpay
# Events: payment.captured, payment.failed
# Copy webhook secret → RAZORPAY_WEBHOOK_SECRET in .env → restart API

# 3) AWS (for upload-url only on Day 5)
# - Create S3 bucket in ap-south-1 (e.g. ticketbox-banners)
# - Block public access OFF for banners OR use CloudFront later
# - IAM user with s3:PutObject on arn:aws:s3:::ticketbox-banners/banners/*
# - Put AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / S3_BUCKET_NAME in .env
# - Optional: S3_PUBLIC_BASE_URL=... (not required for EJS; web uses /media proxy)
# - IAM also needs s3:GetObject on banners/* so the EJS /media proxy can serve images

# 4) Optional S3 bucket CORS (only if using browser → S3 presigned PUT)
# Admin SPA uses POST /admin/upload instead, so CORS is usually not needed.
# npm run s3:cors

# Demo proof: start payment, close browser tab mid-flow → booking still becomes paid via webhook
```

## Day 6 (Week 2) — SSH / SFTP / first dist upload

```bash
# --- Local: build admin for EC2 ---
cd Frontend/admin-panel
copy .env.production.example .env.production
# Edit VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000
npm ci
npm run build
# dist/ → upload contents to /var/www/admin

# From repo root (Windows) — build + zip for FileZilla
npm run package:admin
# → deploy/artifacts/admin-dist.zip

# --- Key permissions (required) ---
chmod 400 ~/keys/ticketbox.pem
# Windows OpenSSH:
#   icacls ticketbox.pem /inheritance:r
#   icacls ticketbox.pem /grant:r "%USERNAME%:R"

# --- SSH ---
ssh -i ~/keys/ticketbox.pem ubuntu@YOUR_EC2_PUBLIC_IP

# --- First-time dirs on server ---
sudo mkdir -p /var/www/admin
sudo chown -R ubuntu:ubuntu /var/www/admin
sudo chmod -R u+rwX,go+rX /var/www/admin

# --- FileZilla ---
# Protocol: SFTP | Host: EC2_IP | Port: 22 | Key file: ticketbox.pem | User: ubuntu
# Remote: /var/www/admin  ← upload dist/ CONTENTS (index.html at top level)

# --- Verify ---
ls -la /var/www/admin
test -f /var/www/admin/index.html && echo OK

# Checkpoint: Sahil + Ram can both SSH/SFTP without help.
# Day 7 = enable deploy/nginx/admin.conf + fix VITE_API_URL/CORS on live IP.
```

See also: `deploy/README.md`, `deploy/sftp-checklist.md`.

## Day 7 (Week 2) — nginx admin SPA + CORS on EC2 IP

```bash
# --- Local: rebuild SPA against live API ---
cd Frontend/admin-panel
copy .env.production.example .env.production
# VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000
npm ci
npm run build
# Re-upload dist/ contents → /var/www/admin (FileZilla)

# --- EC2 security group ---
# Inbound: 22, 80, 4000

# --- On server ---
sudo apt update && sudo apt install -y nginx
# Copy deploy/nginx/admin.conf → /etc/nginx/sites-available/ticketbox-admin
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ticketbox-admin /etc/nginx/sites-enabled/ticketbox-admin
sudo nginx -t && sudo systemctl reload nginx

# Or:
# bash deploy/scripts/enable-admin-nginx.sh

# --- API .env on server ---
# ADMIN_ORIGIN=http://YOUR_EC2_PUBLIC_IP
# API_PUBLIC_URL=http://YOUR_EC2_PUBLIC_IP:4000
pm2 restart ticketbox-api

# Browser: http://YOUR_EC2_PUBLIC_IP  → admin login, no CORS errors
# Checkpoint: SPA on :80 + API CORS OK. Stop before Route 53 / HTTPS (Days 8–9).
```

See also: `deploy/day-7.md`, `deploy/nginx-checklist.md`.

