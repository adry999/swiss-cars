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
2. **Supabase session refresh** — `refreshSupabaseSession()` (`core/supabase/proxy-session.ts`) refreshes auth tokens on `/admin*` requests only
3. **Admin edge protection** — `hasAdminRole()` (`shared/session/admin-role.ts`) redirects visitors without the admin role from `/admin*` to `/login`; `/api`, `/login` and `/auth` bypass both intl and auth; `/sitemap.xml` and `/robots.txt` bypass intl only

The second layer of admin protection is the `app/admin/layout.tsx` server component, which calls `getCurrentUser()` and `hasAdminRole()` and redirects if the visitor is signed in but not an admin — being signed in is not being an admin.

### Authentication

- **Login page**: `/login` — Email/password authentication (`features/auth`)
- **Admin routes**: Protected by middleware edge redirect + `hasAdminRole()` check in admin layout
- **Session helpers**: `shared/session/current-user.ts` (`getCurrentUser()`), `shared/session/admin-role.ts` (`hasAdminRole()`), `shared/session/require-admin.ts` (`requireAdmin()`) — every admin feature reads these directly instead of importing `features/auth`, so the auth feature stays swappable
- **Auth actions**: `features/auth/actions.ts` — `signIn(credentials)` (validates with Zod, returns `ActionResult`, never echoes the Supabase error or the user object), `signOut()`
- **Auth callback**: `/auth/callback` — Handles Supabase auth redirects (a thin route, not part of `features/auth`)

### Security Model

Every admin mutation Server Action calls `requireAdmin()` (`@shared/session/require-admin`) at the top before touching the database. This prevents direct HTTP POST attacks on `/_next/action` endpoints. `requireAdmin()` itself lives in `shared/`, not in a `'use server'` file, so it can never become a callable endpoint.

Protected actions (feature — action):
- `features/inventory` — `saveCar`, `deleteCar`, `duplicateCar`
- `features/reviews` — `saveReview`, `deleteReview`
- `features/partners` — `savePartner`, `deletePartner`
- `features/subscribers` — `deleteSubscriber`, `toggleSubscriberStatus`
- `features/leads` — `markLeadRead`, `markLeadImportant`, `deleteLead`, `markAllLeadsRead`
- `features/site-settings` — `saveSiteConfig`, `saveHomepageContent` (each validated by its own Zod schema in `site-settings.schema.ts`)

Public actions (no auth): `submitLeadInquiryAction` (`app/_composition/lead-inquiry-actions.ts` — rate-limited, Zod-validated), `subscribe` (`features/subscribers` — rate-limited, Zod-validated), `signIn` (`features/auth` — validates the credentials with Zod on the server before calling Supabase Auth).

`getCurrentUser` and `listSubscribers` are **not** Server Actions — every export of a `'use server'` file is a public POST endpoint, so a reader that returns the full subscriber list or a settings row must live in a plain server-only module (`server.ts`) and call `requireAdmin()` itself instead. This is also why the old `getSubscribers` action was replaced by `listSubscribers()` (`features/subscribers/server`).

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
- `core/supabase/server-client.ts` — Server-side client (uses cookies) via `createServerSupabaseClient()`; also exports `createStaticSupabaseClient()` for build-time/anon queries without cookies
- `core/supabase/browser-client.ts` — Browser client
- `core/supabase/proxy-session.ts` — Session refresh used by `proxy.ts`
- Each feature's `server/*-repository.ts` — Read/write queries for that feature's tables, exposed through `server.ts` (reads) and `actions.ts` (writes, behind `requireAdmin()`)

### Project Structure

The codebase is organized as feature modules rather than technical folders (no `lib/`, no `components/`). Design and migration history: `docs/superpowers/specs/2026-09-13-feature-modules-architecture-design.md`. Recorded conventions and import boundaries: `.claude/skills/project-conventions/SKILL.md`.

```
app/
├── _composition/     # the only code that wires features together (ports, domain events, after())
├── _shell/           # Header, Footer, MobileMenu — compose features for the public site
├── [locale]/          # public routes (ro/ru/en); ContactPageClient.tsx is route UI, not a feature
├── admin/
│   ├── _shell/        # AdminSidebar, AdminLayoutClient — compose features for the admin dashboard
│   ├── _dashboard/    # dashboard-stats.ts (pure composition), read-dashboard-stats.ts (per-feature counts)
│   └── <section>/     # thin admin pages per feature
├── login/, auth/callback/, api/
features/<name>/       # index.ts (client-safe), admin.ts (admin UI, optional), server.ts (server-only), actions.ts ('use server')
  auth, inventory, leads, leasing, notifications, partners, reviews, site-settings, subscribers
shared/
├── contracts/        # cross-feature types: domain events, ActionResult, translated-field
├── session/          # current-user, admin-role, require-admin — read by every admin feature
├── ui/                # Pagination, Toast, Preloader, Reveal, WhatsAppFloat, admin/{DataTable,ImageUploader}, styles/components.css
├── formatting/       # format (formatPrice), sanitize, pick-translation
└── analytics/        # GoogleAnalytics, GTMScript
core/
├── events/           # event-bus
├── http/             # client-ip
├── rate-limit/       # rate-limiter (in-memory + fallback), upstash-rate-limiter, shared-rate-limiter
└── supabase/         # server-client, browser-client, proxy-session
config/                # server-environment.ts, public-environment.ts — the only readers of env vars
i18n/, messages/        # next-intl
```

- ESLint `no-restricted-imports` (`eslint.config.mjs`) enforces the layer boundaries: a feature may not import another feature or `@app`; `shared/` may not import `features/` or `@app`; `core/` may only import `@config`; `config/` imports nothing from the project; `app/`, `proxy.ts` and `i18n/` may only reach a feature through its public entry points (`@features/<x>`, `/admin`, `/server`, `/actions`).
- A Server Action that needs more than one feature lives in `app/_composition/` and reaches client components as a prop (see `submitLeadInquiryAction`).
- Cross-cutting UI that composes several features (site header/footer, admin sidebar, dashboard stats) lives in `app/_shell` or `app/admin/_shell`/`app/admin/_dashboard`, not in `shared/` — `shared/` itself must not depend on any feature.

### Security Features

- **Auth guards**: `shared/session/require-admin.ts` (`requireAdmin()`, `server-only`, deliberately not a Server Action) — called at the top of every admin mutation; checks `app_metadata.role === 'admin'`, not merely a signed-in account
- **XSS Protection**: `shared/formatting/sanitize.ts` — wraps `isomorphic-dompurify`. The previous regex implementation was bypassed by `<svg/onload=…>` and `<img/onerror=…>`; those payloads are now regression-tested
- **Rate Limiting**: `core/rate-limit/` — fixed window, 5 lead submissions per minute per IP, shared by the car form, the contact page and `/api/contact`. Newsletter signups (`subscribe`) are limited to 5 per 10 minutes per IP in their own `subscribe:` bucket. Counted atomically in Upstash Redis through `@upstash/ratelimit` when configured (`UPSTASH_REDIS_REST_URL`/`_TOKEN`), otherwise in per-instance memory; a Redis error or a check slower than 1 s also falls back to memory instead of letting the request through unlimited. Both share the one limiter from `getRateLimiter()` (`core/rate-limit/shared-rate-limiter.ts`).
- **CSP + Security Headers**: configured in `next.config.ts` — includes Content-Security-Policy (`unsafe-eval` only in development, where React needs it for server error stacks; `unsafe-inline` stays because a nonce would force every static page to render dynamically), HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **Error Handling**: expected Server Action failures are returned as `ActionResult` values (`shared/contracts/action-result.ts`) and translated on the client via `errors.*` messages; unexpected errors throw to the error boundaries at global, locale, and admin levels — including dashboard count failures, which now reach `app/admin/error.tsx` instead of silently showing 0

### Notification credentials

Telegram and email credentials are **environment variables** (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFICATION_EMAIL`, `RESEND_API_KEY`), validated by `config/server-environment.ts` (`getServerEnvironment()`) and resolved by `getNotificationConfig()` in `features/site-settings/server`. A Telegram pair from the environment is used whole; it is never merged with a partial pair from the database. They previously lived in the anon-readable `site_settings` row and were also serialized into every public page's RSC payload. The database fallback for a still-incomplete environment stays in `getNotificationConfig()` until the `site_config` row is confirmed clean; see `database/2026-08-26_security_hardening.sql`.

Alerts are sent by `features/notifications`. `app/_composition/lead-inquiry-submission.ts` subscribes it to the `leads.inquiry-submitted` event and delivers inside `after()`, so the form response does not wait for Telegram or Resend.

### Maintenance Mode

The site is **live** — maintenance mode has been removed. The full layout (Header, Footer, providers) is active in `app/[locale]/layout.tsx`.

### Pagination

- `readCatalogPage()` (`@features/inventory/server`) — Public cars listing (15 per page on `/inventory`) and admin cars listing (20 per page, `app/admin/inventory`)
- `readReviewsAdminPage()` (`@features/reviews/server`) — Admin reviews listing (20 per page)
- `supabaseLeadsRepository.readInboxPage()` (`@features/leads/server`) — Leads inbox (20 per page, `LEADS_PER_PAGE` in `app/admin/leads/page.tsx`)
- `listSubscribers()` (`@features/subscribers/server`) and `listAllPartners()` (`@features/partners/server`) are not paginated — both admin lists are read in full

### Types

Each feature defines its own Zod schemas and types next to its code: `inventory.schema.ts`/`inventory.types.ts` (`CarSchema`), `reviews.schema.ts`/`reviews.types.ts` (`ReviewSchema`), `partners.schema.ts`/`partners.types.ts` (`PartnerSchema`), `leads.schema.ts`/`leads.types.ts`, `subscribers.schema.ts`/`subscribers.types.ts`, `auth.schema.ts`. Cross-feature types live in `shared/contracts/` (`ActionResult`, domain events, `TranslatedField`). Used for both form validation and runtime type enforcement in Server Actions. `Lead` and `Car` are still hand-written rather than generated from the Supabase schema (`supabase gen types`).

### Testing

- **Framework**: Vitest with React Testing Library
- **Config**: `vitest.config.ts` — aliases are generated from `tsconfig.json` paths; add new aliases only there
- **Setup**: `test-setup.ts` (mocks for next-intl, next/navigation, next/image, framer-motion — framework only)
- **Tests**: Located alongside source files (`*.test.ts`, `*.test.tsx`); server-side tests start with `// @vitest-environment node`; feature fixtures live in `<feature>/test-support/`; ports are replaced by injected fakes instead of `vi.mock`
- E2E (Playwright, not run in CI) lives in `tests/e2e/` (`playwright.config.ts` → `testDir: './tests/e2e'`)
- Current coverage: sanitize, admin-role, Pagination, i18n routing, message parity, core (event bus, rate limiter, client IP), config, auth, inventory (favorites, similar cars, image storage), leads, notifications, partners, site-settings schemas, subscribers, admin dashboard-stats composition

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

Configured in `tsconfig.json`: `@app/*`, `@i18n/*`, `@features/*`, `@shared/*`, `@core/*`, `@config/*`. The old `@/*` (project root) alias has been removed — every import goes through one of the layer aliases above.

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

## One-Time Setup

A fresh database gets its default `site_config` and `homepage_content` rows from `database/seed_defaults.mjs` (see `database/README.md`). The admin homepage editor also fills any missing section from `features/site-settings/model/default-homepage-content.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
