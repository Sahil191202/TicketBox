# Day 6 checklist — SSH + SFTP

Checkpoint: **You can SSH and SFTP into the server without help.** (Paired with Ram)

## Local prep

- [ ] EC2 public IPv4 written down
- [ ] `.pem` key saved outside the git repo (never commit it)
- [ ] Key permissions locked (`chmod 400` or Windows `icacls`)
- [ ] Admin built: `cd Frontend/admin-panel && npm run build`
- [ ] Optional zip: from repo root `npm run package:admin` → `deploy/artifacts/admin-dist.zip`

## SSH

- [ ] `ssh -i yourkey.pem ubuntu@EC2_IP` works
- [ ] Sahil can SSH without Ram driving
- [ ] Ram can SSH independently

## Server dirs

- [ ] `/var/www/admin` exists
- [ ] Owned by deploy user (`ubuntu:ubuntu` or agreed user)
- [ ] Writable for SFTP uploads

## FileZilla

- [ ] Protocol **SFTP**, port **22**, key auth
- [ ] Connected successfully
- [ ] Uploaded `dist/` **contents** to `/var/www/admin`
- [ ] Confirmed `/var/www/admin/index.html` exists via SFTP or `ls`

## Permissions check

- [ ] `ls -la /var/www/admin` looks sane (readable)
- [ ] No world-writable secrets uploaded (no `.env` with live keys in `/var/www/admin`)

## Stop here

Day 6 ends when SSH + SFTP + one successful `dist/` upload are proven.  
Do **not** wait for nginx SPA routing, DNS, or HTTPS — those are Days 7–9.
