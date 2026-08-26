# SwissCars.md

Multilingual car dealership website — Swiss-imported vehicles sold in Moldova. Built with Next.js 16, Supabase, and next-intl.

**Languages:** Romanian (default), Russian, English  
**Stack:** Next.js 16 App Router · Supabase (DB + Auth + Storage) · next-intl · Zod · Vitest · Framer Motion

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin) (requires Supabase Auth user)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token for lead notifications — server-side only, no `NEXT_PUBLIC_` prefix |
| `TELEGRAM_CHAT_ID` | No | Telegram chat/channel ID to notify |
| `NOTIFICATION_EMAIL` | No | Address that receives new-lead emails (requires `RESEND_API_KEY`) |
| `RESEND_API_KEY` | No | Resend API key for email notifications |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID |

---

## Commands

```bash
npm run dev           # Development server (http://localhost:3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm test              # Vitest (single run)
npm run test:ui       # Vitest with browser UI
npm run test:coverage # Coverage report
```

---

## Project Structure

```
app/
├── [locale]/         # Public routes (ro unprefixed, /ru and /en prefixed)
├── admin/            # Admin dashboard (auth-protected)
├── login/            # Login page
└── api/              # API routes (contact form, seed)

components/
├── admin/            # Admin forms and tables
├── cars/             # Car listing, detail, filters
├── home/             # Homepage sections
├── layout/           # Header, Footer, MobileMenu
└── ui/               # Shared components

lib/
├── actions/          # Server Actions (all mutations require auth)
├── supabase/         # DB clients and queries
├── types/            # Zod schemas (Car, Review, Partner)
└── utils/            # Auth guard, sanitizer, rate limiter, etc.

messages/             # i18n translation files (ro.json, ru.json, en.json)
i18n/                 # next-intl routing and request config
```

---

## Architecture Notes

### Authentication & Security

- All mutation Server Actions call `requireAuth()` (`lib/utils/requireAuth.ts`) before any DB access
- `proxy.ts` (root; Next.js 16 renamed `middleware.ts`) protects `/admin*` at the edge and refreshes the Supabase session on those routes
- Admin layout (`app/admin/layout.tsx`) has a second auth check as defense-in-depth
- Security headers (CSP, HSTS, X-Frame-Options) configured in `next.config.ts`
- IP-based rate limiting on contact/lead submissions (`lib/utils/rateLimit.ts`)

### Internationalization

- `localePrefix: 'as-needed'` — Romanian is unprefixed (`/inventory`), Russian and English are prefixed (`/ru/inventory`, `/en/inventory`). Each language has its own indexable URL, with canonical and hreflang emitted from `i18n/routing.ts`
- Content stored per-locale: `{ ro: "...", ru: "...", en: "..." }` in DB columns
- Admin translations editor at `/admin/translations`

### Notification credentials

Telegram and email credentials are **environment variables** (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFICATION_EMAIL`) — see `.env.example`. They previously lived in the `site_settings` table, which is readable by anyone holding the public anon key. See `database/2026-08-26_security_hardening.sql`.

### Admin access

Being signed in is not enough. A user needs `{"role": "admin"}` in their Supabase `app_metadata` (Dashboard → Authentication → Users). `app_metadata` is signed into the JWT and cannot be edited by the user; `user_metadata` can, so it must not be used for this.

---

## Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for the schema, and
[database/README.md](./database/README.md) for the exact run order.

Three files, run in order, in the Supabase SQL Editor:
`SETUP_NEW_DB.sql` → `2026-08-26_security_hardening.sql` →
`2026-08-26_lead_subscriber_rpc.sql`. The last two aren't optional — without
them the database still allows any authenticated account admin write access
and anonymous direct inserts into leads/subscribers. `database/archive/`
holds superseded and (in two cases) actively insecure historical scripts;
don't run those against a hardened database.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, VPS, Docker, and manual deployment guides.
