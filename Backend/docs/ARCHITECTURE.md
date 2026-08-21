# TicketBox architecture (Week 2)

```mermaid
flowchart TB
  subgraph Clients
    Browser["Public browser"]
    AdminBrowser["Admin browser"]
    Razorpay["Razorpay"]
  end

  subgraph DNS["Route 53"]
    Apex["yourdomain.com / www"]
    ApiHost["api.yourdomain.com"]
    AppHost["app.yourdomain.com"]
  end

  subgraph EC2["EC2 + Elastic IP"]
    Nginx["nginx :80/:443"]
    Web["PM2 ticketbox-web :3000<br/>EJS public site"]
    Api["PM2 ticketbox-api :4000<br/>Express JSON API"]
    PG[("PostgreSQL")]
    Nginx --> Web
    Nginx --> Api
    Web --> Api
    Api --> PG
  end

  subgraph AWSExtras["AWS around the box"]
    S3Banners["S3 banners"]
    S3Backups["S3 DB dumps"]
    Lambda["Lambda EC2 schedule<br/>stop / start"]
    EB["EventBridge cron"]
  end

  Browser --> Apex
  AdminBrowser --> AppHost
  Browser --> ApiHost
  AdminBrowser --> ApiHost
  Razorpay -->|"webhook HTTPS"| ApiHost

  Apex --> Nginx
  AppHost --> Nginx
  ApiHost --> Nginx

  Api --> S3Banners
  Cron["cron pg_dump"] --> PG
  Cron --> S3Backups
  EB --> Lambda
  Lambda -->|"stop/start"| EC2
```

## Request paths

| URL | nginx | Upstream |
|---|---|---|
| `https://yourdomain.com` | `ticketbox-web` | `127.0.0.1:3000` |
| `https://api.yourdomain.com` | `ticketbox-api` | `127.0.0.1:4000` |
| `https://app.yourdomain.com` | static `/var/www/admin` | Vite `dist/` |

Admin SPA calls the API via baked-in `VITE_API_URL` (HTTPS on Day 9). CORS allows `WEB_ORIGIN` / `ADMIN_ORIGIN`.

## Money / safety controls (Day 10)

- EventBridge → Lambda stops EC2 overnight; Elastic IP keeps DNS stable
- Nightly `pg_dump` to local disk + optional S3 backup bucket
- Security group: 22 (restricted) / 80 / 443 only — never public 3000/4000
