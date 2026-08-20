# TicketBox Admin Panel

React + Vite admin SPA (Sahil).

## Local

```bash
npm install
npm run dev
# http://localhost:5173 — API via Vite proxy → :4000
```

## Production build (Day 6+)

```bash
copy .env.production.example .env.production
# Set VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:4000  (or https://api.yourdomain.com later)

npm run build
# → dist/

# From repo root — build + zip for FileZilla:
# npm run package:admin
```

Upload **`dist/` contents** to EC2 path **`/var/www/admin`**.

- Day 6 SSH/SFTP: [`../../deploy/README.md`](../../deploy/README.md)
- Day 7 nginx + CORS: [`../../deploy/day-7.md`](../../deploy/day-7.md)
- Day 8 domain + DNS: [`../../deploy/day-8.md`](../../deploy/day-8.md)
