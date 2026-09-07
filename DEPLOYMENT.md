# Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account (https://vercel.com)
2. GitHub repository linked to Vercel
3. Upstash Redis instance (free tier available)
4. Supabase project (already configured locally)

### Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

**Required (Public):**
- `NEXT_PUBLIC_SUPABASE_URL` — Copy from .env.local
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Copy from .env.local

**Required (Serverless Rate Limiting):**
- `UPSTASH_REDIS_REST_URL` — From https://console.upstash.com/redis
- `UPSTASH_REDIS_REST_TOKEN` — From https://console.upstash.com/redis

**Optional (Notifications):**
- `TELEGRAM_BOT_TOKEN` — Telegram bot token for alerts
- `TELEGRAM_CHAT_ID` — Target chat ID for notifications
- `NOTIFICATION_EMAIL` — Email to receive lead forms
- `RESEND_API_KEY` — https://resend.com (email notifications)

**Optional (Analytics):**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Google Analytics ID (e.g., G-XXXXXXXXXX)

### Deploy Steps

1. **Push to main:**
   ```bash
   git push origin main
   ```

2. **Vercel auto-deploys** — No action needed, it watches main branch

3. **Monitor deployment:**
   - Vercel Dashboard → Deployments
   - Watch build logs for errors
   - Preview deployment before promoting to production

### Automatic Preview Deployments

Every pull request gets a preview URL automatically.

### Rollback

If deployed version breaks:
1. Vercel Dashboard → Deployments
2. Click "Redeploy" on a previous successful deployment
3. Or revert commit on main + auto-redeploy

### Local Testing Before Deploy

```bash
npm run build
npm run start
```

## Known Limitations

- **Rate Limit:** In-memory fallback when Redis unavailable. Use Upstash for production.
- **Emails:** Without RESEND_API_KEY, email notifications silently fail. Telegram still works.

## Monitoring

After deployment, check:
1. Health: `curl https://your-deployment.vercel.app/`
2. Logs: Vercel Dashboard → Functions
3. Admin: https://your-deployment.vercel.app/admin (requires auth)
4. Rate Limit: Test /contact form — should rate limit at 5 req/min

## Monitoring with Sentry

### Setup

1. Create Sentry account: https://sentry.io
2. Create new Next.js project
3. Copy DSN: Settings → Client Keys (DSN)
4. Set in Vercel:
   - `NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id`
   - `SENTRY_AUTH_TOKEN=sntrys_...` (for releases)

### What Gets Tracked

- Unhandled exceptions (frontend + backend)
- Server errors (API routes, Server Actions)
- Performance metrics (10% sample rate)
- Session replays (on errors)
- Release tracking (Vercel commit SHA)

### Dashboard

Visit sentry.io → Issues to:
- View errors grouped by type
- See stack traces
- Replay session when error occurred
- Track error trends over time

## Performance Monitoring

### Vercel Speed Insights

After deployment, check:
1. Vercel Dashboard → Project → Analytics → Speed Insights
2. Monitors Core Web Vitals in production
3. Compares vs. previous deployments

### Local Testing

```bash
npm run build
npm run start

# Open DevTools → Lighthouse
# Run audit on http://localhost:3000
```

### Key Metrics

- **LCP** (Largest Contentful Paint): < 2.5s — images, fonts
- **CLS** (Cumulative Layout Shift): < 0.1 — prevent layout thrashing
- **FID** (First Input Delay): < 100ms — JS execution

### Optimization Checklist

- ✓ Next.js Image optimization enabled
- ✓ CSS-in-JS (zero runtime CSS)
- ✓ Dynamic imports for admin pages
- ✓ React Suspense boundaries
- ✗ TODO: Lazy-load carousel images on homepage
- ✗ TODO: Reduce bundle size (analyze with `next/bundle-analyzer`)
