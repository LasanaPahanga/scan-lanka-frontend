# Hetzner one-VPS frontend deploy

Sadil08/scan-lanka-frontend `main` deploys the Next.js storefront onto the **same VPS** as Spring Boot.

| Process | Path / port |
|---|---|
| Backend (already live) | `/opt/scanlanka` · `127.0.0.1:8080` · `scanlanka.service` |
| Frontend (this) | `/opt/scanlanka-web` · `127.0.0.1:3000` · `scanlanka-web.service` |
| Public site | Nginx → `https://www.canvasboards.lk` |

GitHub Actions reuses the backend secrets: `HETZNER_HOST`, `HETZNER_USER`, `HETZNER_SSH_KEY`.

## One-time VPS setup

SSH in as the same user the backend deploy uses.

```bash
# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# App dir (same owner as backend if possible)
sudo mkdir -p /opt/scanlanka-web
sudo chown scanlanka:scanlanka /opt/scanlanka-web   # or your deploy user

# systemd
sudo cp /tmp/scanlanka-web.service /etc/systemd/system/scanlanka-web.service
# After the first GitHub deploy unpacks server.js, or copy from the repo:
# sudo cp deploy/scanlanka-web.service /etc/systemd/system/scanlanka-web.service
sudo systemctl daemon-reload
sudo systemctl enable scanlanka-web
```

Copy the service file from this repo onto the box:

```bash
# from your laptop, after cloning
scp -i ~/.ssh/hetzner.pem deploy/scanlanka-web.service USER@HOST:/tmp/
ssh USER@HOST 'sudo mv /tmp/scanlanka-web.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable scanlanka-web'
```

Nginx:

```bash
scp -i ~/.ssh/hetzner.pem deploy/nginx-canvasboards.conf USER@HOST:/tmp/
ssh USER@HOST 'sudo mv /tmp/nginx-canvasboards.conf /etc/nginx/sites-available/canvasboards && sudo ln -sf /etc/nginx/sites-available/canvasboards /etc/nginx/sites-enabled/canvasboards && sudo nginx -t'
```

TLS (after DNS points here):

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d www.canvasboards.lk -d canvasboards.lk
```

GitHub → Sadil08/scan-lanka-frontend → Settings → Secrets must already have:

- `HETZNER_HOST`
- `HETZNER_USER`
- `HETZNER_SSH_KEY`

They are the same values as `Sadil08/scan-lanka-backend`.

## DNS cutover (do last)

1. Confirm `curl -I http://127.0.0.1:3000` on the VPS returns 200.
2. Confirm Nginx + certs work via the VPS IP (hosts-file test).
3. Point `canvasboards.lk` and `www` **A records** from Vercel to the Hetzner IP.
4. Keep old Vercel project paused after 24–48h of healthy traffic.
5. In Google Search Console, request indexing of `https://www.canvasboards.lk/` once.

Do **not** leave both Vercel and Hetzner serving the same live domain.

## SEO

Canonical URL stays `https://www.canvasboards.lk`. No sitemap/title/schema change is required if DNS and HTTPS stay on that host.
