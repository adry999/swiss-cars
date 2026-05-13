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
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID |
| `RESEND_API_KEY` | No | Resend API key for email notifications |

---

## Commands

```bash
npm run dev           # Development server (http://localhost:3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm test              # Vitest (watch mode)
npm run test:ui       # Vitest with browser UI
npm run test:coverage # Coverage report
```

---

## Project Structure

```
app/
├── [locale]/         # Public routes (ro/ru/en, no URL prefix)
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
- `middleware.ts` (root) refreshes Supabase sessions and protects `/admin*` routes at the edge
- Admin layout (`app/admin/layout.tsx`) has a second auth check as defense-in-depth
- Security headers (CSP, HSTS, X-Frame-Options) configured in `next.config.ts`
- IP-based rate limiting on contact/lead submissions (`lib/utils/rateLimit.ts`)

### Internationalization

- `localePrefix: 'never'` — no URL prefix for any locale; locale is detected from browser/cookie
- Content stored per-locale: `{ ro: "...", ru: "...", en: "..." }` in DB columns
- Admin translations editor at `/admin/translations`

### Maintenance Mode

Public pages are currently blank (client unpaid). To restore the site, revert the render in `app/[locale]/layout.tsx`. The admin panel is unaffected.

---

## Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full schema setup instructions.

Run `database/SETUP_NEW_DB.sql` once in the Supabase SQL Editor to create all tables, RLS policies, and the storage bucket.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, VPS, Docker, and manual deployment guides.
