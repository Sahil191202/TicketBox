# Day 7 checklist — nginx + CORS

Checkpoint: **`http://EC2_PUBLIC_IP` loads the admin SPA and API calls are not blocked by CORS.**

## Local / rebuild

- [ ] `Frontend/admin-panel/.env.production` has `VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000`
- [ ] Fresh `npm run build` (or `npm run package:admin`)
- [ ] Re-uploaded `dist/` **contents** to `/var/www/admin`
- [ ] Confirmed `/var/www/admin/index.html` on server

## AWS

- [ ] Security group: inbound **80** open
- [ ] Security group: inbound **4000** open (API for Day 7)
- [ ] Security group: inbound **22** still open for you

## Server — nginx

- [ ] `nginx` installed and running
- [ ] `deploy/nginx/admin.conf` → `/etc/nginx/sites-available/ticketbox-admin`
- [ ] Default site disabled (`sites-enabled/default` removed)
- [ ] Symlink in `sites-enabled/`
- [ ] `sudo nginx -t` passes
- [ ] `sudo systemctl reload nginx`
- [ ] `curl -I http://127.0.0.1/` returns 200

## Server — API CORS

- [ ] `ADMIN_ORIGIN=http://YOUR_EC2_PUBLIC_IP` (no port, no trailing slash)
- [ ] `API_PUBLIC_URL=http://YOUR_EC2_PUBLIC_IP:4000`
- [ ] API restarted (`pm2 restart ticketbox-api` or equivalent)
- [ ] `curl http://127.0.0.1:4000/health` OK

## Browser proof

- [ ] `http://YOUR_EC2_PUBLIC_IP` shows TicketBox admin
- [ ] Login works
- [ ] DevTools → Network: no CORS failures to `:4000`

## Stop here

Do **not** start Route 53, custom domains, or certbot — those are Days 8–9.
