# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwissCars.md is a multilingual car dealership website built with Next.js 16 and Supabase. Supports Romanian, Russian, and English — Romanian is the default locale (no URL prefix).

## Commands

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm test              # Run tests with Vitest
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Architecture

### Route Structure

The app uses Next.js App Router with three main route groups:

- **`app/[locale]/`** — Public-facing pages with i18n support (ro/ru/en)
- **`app/admin/`** — Admin dashboard (protected, requires authentication)
- **`app/login/`** — Authentication page (no i18n)

The default locale (ro) has no URL prefix; `/ru/` and `/en/` prefixes are used for the other locales (`localePrefix: 'as-needed'`).

### Middleware

`proxy.ts` at the project root handles two concerns (Next.js 16 uses `proxy.ts` instead of `middleware.ts`):
1. **next-intl locale routing** — detects locale and routes accordingly
2. **Supabase session refresh** — refreshes auth tokens on `/admin*` requests only
3. **Admin edge protection** — redirects unauthenticated users from `/admin*` to `/login`

The second layer of admin protection is the `app/admin/layout.tsx` server component, which calls `getUser()` and redirects if no session exists.

### Authentication

- **Login page**: `/login` — Email/password authentication
- **Admin routes**: Protected by middleware edge redirect + `getUser()` check in admin layout
- **Auth helper**: `lib/utils/requireAuth.ts` — requires `app_metadata.role === 'admin'`, not merely a signed-in account
- **Auth actions**: `lib/actions/auth.ts` — `signIn()`, `signOut()`, `getUser()`
- **Auth callback**: `/auth/callback` — Handles Supabase auth redirects

### Security Model

Every mutation Server Action calls `requireAuth()` at the top before touching the database. This prevents direct HTTP POST attacks on `/_next/action` endpoints.

Protected actions: `saveCar`, `deleteCar`, `duplicateCar`, `saveReview`, `savePartner`, `deleteReview`, `deletePartner`, `saveSettings`, `updateI18nMessages`, `getI18nMessages`, `getSubscribers`, `deleteSubscriber`, `toggleSubscriberStatus`, `markLeadRead`, `markLeadImportant`, `deleteLead`, `markAllLeadsRead`.

Public actions (no auth): `submitLeadInquiryAction` (`app/_composition/lead-inquiry-actions.ts` — rate-limited, Zod-validated), `subscribe`.

Settings **reads** are not Server Actions at all — they live in `lib/settings/` as a plain module. Every export of a `use server` file is a public POST endpoint, so exporting a settings reader there made the whole `site_config` row fetchable by anyone.

### Internationalization

- **next-intl** handles i18n with configuration in `i18n/`
- Translation files live in `messages/{locale}.json`
- `i18n/routing.ts` — locale config with `localePrefix: 'as-needed'`, plus `localeUrl()` and `localeAlternates()` helpers used by the sitemap and page metadata
- `i18n/navigation.ts` — typed navigation helpers
- Content (car descriptions, features) stored as JSON objects: `{ ro: "...", ru: "...", en: "..." }`

### Data Layer

**Supabase** is used for:
- Database (cars, car_images, reviews, partners, leads_inquiries, site_settings, subscribers)
- Storage (car images in `car-images` bucket)
- Auth (admin access)

Key patterns:
- `lib/supabase/server.ts` — Server-side client (uses cookies); also exports `createStaticClient()` for build-time queries without auth
- `lib/supabase/client.ts` — Browser client
- `lib/supabase/queries.ts` — Read-only queries with pagination support
- `lib/actions/*.ts` — Server Actions for mutations (all protected by `requireAuth()`)

### Feature Modules (incremental migration)

The codebase is moving from technical folders (`components/`, `lib/`) to feature modules. Design and migration order: `docs/superpowers/specs/2026-09-13-feature-modules-architecture-design.md`. Recorded conventions: `.claude/skills/project-conventions/SKILL.md`.

```
app/_composition/   # the only code that wires features together (ports, domain events, after())
features/<name>/    # index.ts (client-safe), server.ts (server-only), actions.ts ('use server')
shared/contracts/   # cross-feature types: domain events, ActionResult
core/               # domain-free infrastructure: event bus, client IP, rate limiter
config/             # server-environment.ts — the only reader of server-side env vars
```

- Migrated so far: `features/leads`, `features/notifications`. Everything else still lives in `components/` and `lib/`; new code goes into `features/`.
- ESLint `no-restricted-imports` blocks feature-to-feature imports and imports that bypass a feature's entry points.
- A Server Action that needs more than one feature lives in `app/_composition/` and reaches client components as a prop.

### Security Features

- **Auth guards**: `lib/utils/requireAuth.ts` (`server-only`, deliberately not a Server Action) — called at the top of every admin mutation
- **XSS Protection**: `lib/utils/sanitize.ts` — wraps `isomorphic-dompurify`. The previous regex implementation was bypassed by `<svg/onload=…>` and `<img/onerror=…>`; those payloads are now regression-tested
- **Rate Limiting**: `core/rate-limit/` — fixed window, 5 lead submissions per minute per IP, shared by the car form, the contact page and `/api/contact`. Stored in Upstash Redis when configured, otherwise in per-instance memory.
- **CSP + Security Headers**: configured in `next.config.ts` — includes Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **Error Handling**: expected Server Action failures are returned as `ActionResult` values (`shared/contracts/action-result.ts`) and translated on the client via `errors.*` messages; unexpected errors throw to the error boundaries at global, locale, and admin levels

### Notification credentials

Telegram and email credentials are **environment variables** (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFICATION_EMAIL`, `RESEND_API_KEY`), validated by `config/server-environment.ts` and resolved by `getNotificationConfig()` in `lib/settings/`. They previously lived in the anon-readable `site_settings` row and were also serialized into every public page's RSC payload. See `database/2026-08-26_security_hardening.sql`.

Alerts are sent by `features/notifications`. `app/_composition/lead-inquiry-submission.ts` subscribes it to the `leads.inquiry-submitted` event and delivers inside `after()`, so the form response does not wait for Telegram or Resend.

### Maintenance Mode

The site is **live** — maintenance mode has been removed. The full layout (Header, Footer, providers) is active in `app/[locale]/layout.tsx`.

### Pagination

- `getCarsPaginated()` — Public cars listing (15 per page on /inventory)
- `getAllCarsPaginated()` — Admin cars listing (20 per page)
- `getAllReviewsPaginated()` — Admin reviews listing (20 per page)
- Leads inbox: `supabaseLeadsRepository.readInboxPage()` from `@features/leads/server` (20 per page)

### Types

Zod schemas in `lib/types/index.ts` define `CarSchema`, `ReviewSchema`, `PartnerSchema`. Lead schemas and types live in `features/leads/` (`leads.schema.ts`, `leads.types.ts`). Used for both form validation and runtime type enforcement in Server Actions.

### Component Organization

```
components/
├── admin/          # Admin forms and tables (CarEditForm, ReviewForm, etc.)
├── analytics/      # Google Analytics, GTM
├── cars/           # Car listing, detail, filters (the car lead form is features/leads/ui/CarInquiryForm.tsx)
├── contact/        # Contact page; submits through useLeadInquirySubmission from @features/leads
├── home/           # Homepage sections (Hero, CarsGrid, ReviewsSlider)
├── layout/         # Header, Footer, MobileMenu
└── ui/             # Shared UI (Pagination, Preloader, WhatsAppFloat, Toast)
```

### Utilities

```
lib/utils/
├── errors.ts       # AppError class — unused, removed at the end of the migration
├── format.ts       # formatPrice(), formatNumber()
├── requireAuth.ts  # Admin guard for Server Actions (server-only)
├── sanitize.ts     # HTML XSS sanitizer
└── structured-data.ts
```

### Testing

- **Framework**: Vitest with React Testing Library
- **Config**: `vitest.config.ts` — aliases are generated from `tsconfig.json` paths; add new aliases only there
- **Setup**: `test-setup.ts` (mocks for next-intl, next/navigation, next/image, framer-motion — framework only)
- **Tests**: Located alongside source files (`*.test.ts`, `*.test.tsx`); server-side tests start with `// @vitest-environment node`; feature fixtures live in `<feature>/test-support/`; ports are replaced by injected fakes instead of `vi.mock`
- Current coverage: types, sanitize, Pagination, i18n routing, message parity, core (event bus, rate limiter, client IP), config, leads, notifications

### Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
TELEGRAM_BOT_TOKEN=xxxx
TELEGRAM_CHAT_ID=xxxx
NOTIFICATION_EMAIL=sales@example.md
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Server-side optional variables are read only through `getServerEnvironment()` (`config/server-environment.ts`). An integration with incomplete credentials stays disabled; a malformed value throws with the variable name. Without `RESEND_API_KEY` the email channel is disabled — Telegram still works.

### Path Aliases

Configured in `tsconfig.json`: `@features/*`, `@shared/*`, `@core/*`, `@config/*`, plus the transitional `@/*` (project root) that goes away at the end of the migration.

## Database Schema

### Tables
- `cars` — Vehicle listings with multilingual descriptions and features
- `car_images` — Image URLs linked to cars (with `is_primary` flag)
- `reviews` — Customer reviews (multilingual: `content_ro`, `content_ru`, `content_en`)
- `partners` — Partner logos and links
- `leads_inquiries` — Contact and inquiry form submissions
- `site_settings` — JSON key-value store (keys: `site_config`, `homepage_content`)
- `subscribers` — Newsletter subscribers

### Storage Buckets
- `car-images` — Public bucket for vehicle photos

## Admin Access

1. Navigate to `/login`
2. Sign in with admin credentials (configured in Supabase Auth)
3. Access admin dashboard at `/admin`

Admin sections:
- **Inventory** — Cars CRUD, image upload, duplication
- **Leads** — Contact/inquiry inbox with read/important flags
- **Reviews** — Customer review management
- **Partners** — Partner logo management
- **Homepage** — Homepage content and slider settings
- **Settings** — Site config, social links, contact info, Telegram/email notifications
- **Translations** — In-app i18n file editor

## One-Time Setup

The `/api/seed-defaults` endpoint seeds default `site_config` and `homepage_content` into Supabase. It requires authentication and must be called via **POST** (not GET). Delete or disable this endpoint after first use.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
