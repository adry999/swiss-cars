# SwissCars Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
   - [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
   - [Option 2: VPS with SSH + PM2](#option-2-vps-with-ssh--pm2)
   - [Option 3: Manual VPS (File Manager)](#option-3-manual-vps-file-manager)
   - [Option 4: Docker](#option-4-docker)
4. [Post-Deployment Checklist](#post-deployment-checklist)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended; Node.js 24 LTS for Vercel)
- Supabase project with:
  - All tables created (run `database/SETUP_NEW_DB.sql`)
  - Storage bucket `car-images` configured as public
  - At least one Auth user for admin access
- Domain name (optional but recommended)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 ID (`G-XXXXXXXXXX`) |
| `RESEND_API_KEY` | No | Resend API key for email notifications |

> The `NEXT_PUBLIC_` prefix exposes these to the browser. The anon key is safe to expose — it has limited permissions enforced by Supabase RLS.

> If `RESEND_API_KEY` is not set, email notifications silently fail. Telegram notifications (configured in admin Settings) still work independently.

---

## Deployment Options

### Option 1: Vercel (Recommended)

Automatic builds, SSL, CDN, and serverless scaling at zero config.

```bash
# 1. Push to GitHub
git add .
git commit -m "deploy"
git push origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) and import the repository
2. Framework preset: **Next.js** (auto-detected)
3. Add environment variables (all 4 from the table above)
4. Deploy

Vercel handles SSL, CDN, edge middleware, and serverless functions automatically.

**Supabase Auth redirect** — set in Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/auth/callback`

---

### Option 2: VPS with SSH + PM2

```bash
# Connect
ssh user@your-server-ip

# Install Node.js 20+ (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Clone and build
git clone https://github.com/adry999/swiss-cars.git swisscars
cd swisscars
npm install
```

Create `.env.production`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_xxxxxxxxxxxx
```

```bash
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "swisscars" -- start
pm2 save
pm2 startup
```

**Nginx reverse proxy:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/swisscars /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option 3: Manual VPS (File Manager)

For cPanel/DirectAdmin hosting without SSH.

**1. Build locally:**

```bash
npm install
npm run build
```

**2. Package for upload:**

```bash
zip -r swisscars-deploy.zip \
  .next \
  public \
  package.json \
  package-lock.json \
  next.config.ts \
  proxy.ts \
  i18n \
  messages \
  .env.production \
  -x "*.git*" -x "*.DS_Store"
```

**3. Upload and extract** via File Manager into your site directory.

**4. Install dependencies** (if panel has Terminal):
```bash
npm install --production
```

Or include `node_modules/` in the zip (adds ~200MB).

**5. Configure Node.js app** in cPanel Node.js Selector:
- Node.js version: 18+
- Application mode: Production
- Startup file: `node_modules/next/dist/bin/next`
- Arguments: `start`

---

### Option 4: Docker

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Add `output: 'standalone'` to `next.config.ts`, then:

```bash
docker build -t swisscars .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  swisscars
```

---

## Post-Deployment Checklist

- [ ] Supabase Auth redirect URLs configured (site URL + `/auth/callback`)
- [ ] All environment variables set
- [ ] Admin login works at `/login`
- [ ] Contact form submits and appears in admin Leads inbox
- [ ] Car images load (Supabase Storage bucket is public)
- [ ] Language switching works (RO/RU/EN)
- [ ] Seed defaults endpoint called once via **POST** to `/api/seed-defaults` (requires auth)

### Seed Defaults

After first deploy, seed the initial `site_config` and `homepage_content`:

```bash
# Must be logged in as admin first, then:
curl -X POST https://your-domain.com/api/seed-defaults \
  -H "Cookie: your-auth-cookie"
```

Or call it from the browser after logging into the admin panel (via DevTools console with a POST fetch).

### Maintenance Mode

Currently the public site renders blank pages (maintenance mode — client not paid). To activate the site, restore the full component body in `app/[locale]/layout.tsx`. Admin panel works regardless.

---

## Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### 500 on production
- Check environment variables are set correctly
- Verify Supabase credentials match the project
- Check logs: `pm2 logs swisscars` (VPS) or Vercel function logs

### Images not loading
- Verify `car-images` Supabase Storage bucket is **public**
- Check `next.config.ts` remote pattern matches your Supabase hostname

### Admin login not working
- Verify the user exists in Supabase Auth
- Check redirect URLs in Supabase Dashboard → Authentication → URL Configuration

### Contact form rate limited
Rate limit is 5 submissions/minute per IP. Wait 1 minute or restart the dev server.

### Logs (PM2)
```bash
pm2 logs swisscars
pm2 monit
pm2 restart swisscars
```
