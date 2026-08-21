# Day 9 checklist — HTTPS + live payment

Checkpoint: **`https://` works on apex / api / app**, webhook is live, and a **full test payment** completes.

## Prereqs

- [ ] Day 8 hostnames work over HTTP
- [ ] SG inbound **80** + **443** open
- [ ] SG inbound **4000** removed
- [ ] DNS still points at Elastic IP

## Certbot

- [ ] `export DOMAIN=…` and `CERTBOT_EMAIL=…`
- [ ] Ran `09-certbot-ssl.sh` (or `deploy/scripts/certbot-ssl.sh`)
- [ ] `https://yourdomain.com` loads with padlock
- [ ] `https://api.yourdomain.com/health` OK
- [ ] `https://app.yourdomain.com` loads admin
- [ ] `sudo certbot renew --dry-run` passes

## App config

- [ ] `.env` uses `https://` for `WEB_ORIGIN`, `ADMIN_ORIGIN`, `API_PUBLIC_URL`
- [ ] `CORS_ORIGINS` includes `https://www.…` if needed
- [ ] `pm2 restart all` + `pm2 save`

## Sahil — admin SPA

- [ ] `VITE_API_URL=https://api.yourdomain.com`
- [ ] Fresh `npm run build` + upload to `/var/www/admin`
- [ ] No mixed-content / CORS errors in DevTools

## Razorpay

- [ ] Webhook URL: `https://api.yourdomain.com/webhooks/razorpay`
- [ ] Events: `payment.captured`, `payment.failed`
- [ ] Old cloudflared/ngrok webhook removed
- [ ] `RAZORPAY_WEBHOOK_SECRET` matches dashboard

## Proof

- [ ] Book + pay on `https://yourdomain.com` (card `4111…`)
- [ ] Confirmation / ticket page shows paid booking
- [ ] Admin bookings list shows it
- [ ] Optional: mid-flow close tab → webhook still marks `paid`
- [ ] Optional: Lighthouse mobile note for report

## Stop here

Do **not** start Day 10 (auto-stop Lambda, backups, cost teardown) until this checklist is green.
