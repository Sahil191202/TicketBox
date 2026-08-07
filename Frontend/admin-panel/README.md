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

Full Day 6 SSH/SFTP checklist: [`../../deploy/README.md`](../../deploy/README.md)
