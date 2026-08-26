# SwissCars.md — Full Project Audit

**Date:** 2026-08-26
**Branch:** `main` @ `c3af459`
**Scope:** whole repository — security, correctness, performance, code quality, docs, SEO, feature gaps

**Verification run during this audit:**

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint .` | **107 problems — 72 errors, 35 warnings** |
| `npx vitest run` | 44 tests pass, 4 files |
| `npm audit --omit=dev` | **11 vulnerabilities — 7 high, 3 moderate, 1 low** |

---

## 1. What this project is

**SwissCars.md** — a car dealership website. The business imports used cars from Switzerland and sells them in Moldova. Built on Next.js 16 App Router + Supabase (Database, Auth, Storage) + next-intl for Romanian / Russian / English.

Two halves:

- **Public site** — homepage (hero slider, stats, services, reviews, partners), inventory listing, car detail page, leasing page, contact page, favorites (localStorage).
- **Admin panel** (`/admin`) — cars CRUD with image upload, leads inbox, reviews, partners, homepage content editor, site settings, in-app i18n editor.

**What it should do at its best:** turn a browsing visitor into a phone lead. Every other feature exists to support that single conversion path. The audit below is prioritised against that goal.

---

## 2. CRITICAL — security

These are real and exploitable against the live site. Fix in this order.

### 2.1 Telegram bot token is publicly exposed — three independent paths

`site_settings.site_config` stores `telegram_bot_token`, `telegram_chat_id`, and `notification_email`
(`app/admin/settings/SettingsForm.tsx:522-554`).

**Path A — Row Level Security allows public reads.**
`database/SETUP_NEW_DB.sql` creates:

```sql
CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
```

The Supabase anon key is public by design — it ships in the browser bundle. Anyone can therefore call
`GET /rest/v1/site_settings?select=*` and read the bot token.

**Path B — the token is serialized into every public page's HTML.**
`app/[locale]/layout.tsx:94` passes the entire settings object to the footer:

```tsx
<Footer settings={settings} />
```

`components/layout/Footer.tsx:1` is `'use client'`. Server-to-client props are serialized into the RSC flight
payload embedded in the page HTML. The token is visible in view-source on every public page.

**Path C — `getSettings` is an unauthenticated public endpoint.**
`lib/actions/settings.ts:7` is exported from a `'use server'` file with no `requireAuth()`. Every export in a
`'use server'` module is a callable public POST endpoint. Anyone can invoke it with `key='site_config'`.

A leaked bot token lets an attacker read and send messages as your bot.

**Fix:**
1. Rotate the Telegram bot token immediately (BotFather → `/revoke`).
2. Move secrets out of the database into environment variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   (no `NEXT_PUBLIC_` prefix).
3. Narrow the RLS SELECT policy on `site_settings`, or split public presentation config into a separate row/table
   from secrets.
4. Pass only public fields to client components — `phone`, `whatsapp`, `email`, `address`, `logo_url` — never the
   whole blob.
5. Add `requireAuth()` to `getSettings`, or move it out of `'use server'` into a plain server module so it stops
   being an HTTP endpoint.

---

### 2.2 Unvalidated data reaches notifications, plus HTML injection into the admin email

`lib/actions/leads.ts:62-73` passes the raw `data` argument to the notification senders instead of the validated
`parsed.data`. Zod validation is bypassed entirely on that path.

`lib/utils/notifications.ts:84` then interpolates `lead.source_url` into the notification email HTML **unescaped**,
while every other field goes through `escapeHtml`:

```ts
${lead.source_url ? `<p><strong>Sursă:</strong> <a href="${lead.source_url}">${lead.source_url}</a></p>` : ''}
```

`source_url` is attacker-controlled. Result: HTML and link injection into the admin's inbox.

**Fix:** pass `validData` to both senders; run `escapeHtml()` on `source_url`; validate it starts with your own
origin before rendering it as a link.

---

### 2.3 The HTML sanitizer is bypassable

`lib/utils/sanitize.ts` is regex-based. Confirmed bypasses (verified by running the actual regexes):

| Input | Output |
|---|---|
| `<svg/onload=alert(1)>` | unchanged — passes through |
| `<img/onerror=alert(1) src=x>` | unchanged — passes through |
| `<a href="jav\tascript:alert(1)">x</a>` | unchanged — passes through |

Two root causes: the attribute regex requires `\s+` before the event handler, so a `/` separator defeats it; and
`svg` is not in the dangerous-tag list.

The output is rendered via `dangerouslySetInnerHTML` at
`app/[locale]/inventory/[slug]/page.tsx:188`. The CSP in `next.config.ts` does not provide a second line of defence
either — it allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`.

Input is currently admin-only, so this is defence-in-depth rather than remotely exploitable. However
**`isomorphic-dompurify` is already in `package.json` and imported nowhere in the codebase.** Swapping it in is a
three-line change.

**Fix:**

```ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html);
}
```

Then add `<svg/onload=...>` and `<img/onerror=...>` cases to `lib/utils/sanitize.test.ts` — the existing 11 tests
pass against the broken sanitizer because they never test these shapes.

---

### 2.4 Dangerous SQL scripts committed to the repository

- `database/dev_public_policies.sql` — grants **public INSERT / UPDATE / DELETE** on `cars`, `car_images`,
  `reviews`, `partners`, and `site_settings`.
- `database/storage_permissions_fix.sql` — grants **public upload and delete** on the `car-images` storage bucket.

If either was ever run against production, anyone can deface or wipe the site and upload arbitrary files to your
storage.

**Fix:** verify the live policy state before anything else:

```sql
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname IN ('public','storage')
ORDER BY tablename, policyname;
```

Then delete these two files, or rename them to `DO-NOT-RUN-*.sql.example` with a header comment.

---

### 2.5 Remaining security items

| Issue | Location | Note |
|---|---|---|
| GTM ID interpolated into an inline `<script>`, validated only by `startsWith('GTM-')` | `components/analytics/GTMScript.tsx:8` | Script injection via admin settings. Use `/^GTM-[A-Z0-9]+$/` |
| Google Maps iframe `src` unvalidated | `components/contact/ContactPageClient.tsx:218` | CSP `frame-src` partly mitigates. Require `https://www.google.com/maps/embed` prefix |
| Raw Postgres error text returned to end users | `lib/actions/leads.ts:53` | Internal schema disclosure + poor UX |
| PII (name, phone, email, message) written to server logs | `app/api/contact/route.ts:33,61` | Data-protection exposure |
| Rate-limit key taken from the first `x-forwarded-for` hop | `lib/utils/rateLimit.ts:80` | Client-spoofable; trust the platform-provided IP instead |
| No rate limit on login | `app/login/page.tsx` | Brute-force surface (Supabase has its own limits, but none of ours) |
| No rate limit on newsletter subscribe | `lib/actions/subscribers.ts:18` | Spam / email enumeration |
| `saveSettings(key, value)` accepts any key and unvalidated JSON | `lib/actions/settings.ts:22` | Admin-only, but no schema enforcement |
| `/api/seed-defaults` still present | `app/api/seed-defaults/route.ts` | CLAUDE.md says delete after first use |
| `auth/callback` uses the `next` query param in a redirect without validation | `app/auth/callback/route.ts:14` | Not exploitable as written (origin is fixed) — still worth asserting `next.startsWith('/')` |
| 11 npm vulnerabilities, 7 high (`ws`, `uuid`) | — | `npm audit fix` resolves them |

Note: tasks 3 and 4 of `docs/plans/2026-02-27-security-and-improvements.md` (strict GTM validation, maps embed
validation) were written but never implemented.

---

## 3. Bugs

### 3.1 Google Analytics never loads

`components/analytics/GoogleAnalytics.tsx:3` reads `process.env.NEXT_PUBLIC_GA_ID`.
`README.md:30`, `DEPLOYMENT.md:34`, and `CLAUDE.md:145` all document `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

Configure it per the docs and analytics stays silently dead. Pick one name and align all four files.

### 3.2 The translations editor cannot work in production

`lib/actions/translations.ts:31` writes with `fs.writeFile` into `process.cwd()/messages`. Serverless filesystems
are read-only outside `/tmp`, and any write would not persist across invocations anyway.

The feature works in local dev and fails on Vercel. Move message storage into Supabase or Vercel Blob, and have
`i18n/request.ts` read from there.

### 3.3 The Russian site renders raw translation keys

`messages/ru.json` is missing 11 keys that exist in `ro.json`:

```
cars.title
cars.total
cars.no_results_title
cars.no_results_text
cars.filters.title
cars.filters.search_placeholder
cars.filters.brand
cars.filters.all_brands
cars.filters.price_range
cars.filters.year_range
cars.filters.reset
```

`en.json` is complete (281 keys, matching `ro.json`); `ru.json` has 270.

### 3.4 The sitemap advertises URLs that do not exist

`i18n/routing.ts` sets `localePrefix: 'never'`, so `/ru/...` and `/en/...` are not real routes. But
`app/sitemap.ts:14` generates them for every static path and every car. The same broken prefix appears in the
JSON-LD `offers.url` at `app/[locale]/inventory/[slug]/page.tsx:116`.

### 3.5 `?page=abc` breaks the listings

```ts
const page = parseInt(resolvedParams.page || '1', 10);
```

`app/[locale]/inventory/page.tsx:30` and `app/admin/leads/page.tsx:47`. A non-numeric value gives `NaN`, which
flows into `.range(NaN, NaN)` and makes Supabase error out — the page renders empty. Negative and out-of-range
values are also unclamped (`page=0` produces a negative offset).

**Fix:** `const page = Math.max(1, Number.parseInt(raw ?? '1', 10) || 1);` and clamp to `totalPages`.

### 3.6 The main lead form is Romanian-only

`components/cars/detail/CarLeadForm.tsx` hardcodes Romanian at lines 82, 88, 97, 108, 119 — "Numele tău *",
"sau trimite o cerere", "Cerere trimisă cu succes!", "Numărul de telefon *", "Email (opțional)".

Russian and English visitors get Romanian text in the site's primary conversion form. Also
`components/cars/CarsGridPaginated.tsx:35` hardcodes English "No cars found".

### 3.7 Telegram messages render with visible backslashes

`lib/utils/notifications.ts:13` escapes the **MarkdownV2** character set (`.`, `!`, `-`, `=`, `|`, …) but
line 50 sends `parse_mode: 'Markdown'` — the legacy V1 parser, which does not unescape those characters. Names and
messages arrive looking like `Ion\-Marius`.

**Fix:** change `parse_mode` to `'MarkdownV2'`. Also escape `rawUrl` for the link-text half of
`[${rawUrl}](${rawUrl})` at line 29 — it is attacker-controlled and can break the parse.

### 3.8 Nested `<html>` and `<body>`

Three layouts each render a full document shell:

- `app/layout.tsx:53`
- `app/[locale]/layout.tsx:82`
- `app/admin/layout.tsx:22`

The root layout wraps the other two, producing nested `<html>` inside `<html>`. Browsers silently drop the inner
tags, which causes hydration mismatches.

**Fix:** make `app/layout.tsx` a passthrough that returns `children` (keeping its `metadata` export) — the pattern
next-intl documents for this exact setup.

### 3.9 The "already subscribed" path is dead code

`lib/actions/subscribers.ts:27` performs a SELECT as the `anon` role, but the only anon policy on `subscribers` is
INSERT. The lookup always returns nothing, so a duplicate signup falls through to the INSERT, hits the unique
constraint, and the user sees the generic "Failed to subscribe" instead of "Already subscribed".

### 3.10 `cars.updated_at` never updates

The column has `DEFAULT now()` and no trigger, and `saveCar` does not set it (it is not in `CAR_COLUMNS`). The
value always equals the creation timestamp.

**Fix:** add a `BEFORE UPDATE` trigger, or set `updated_at` explicitly in `saveCar`.

### 3.11 Sold cars are publicly reachable and indexed

`getCarBySlug` (`lib/supabase/queries.ts:129`) has no `is_available` filter. This may be intentional — the detail
page renders "Vândut" — but sold cars are also emitted into the sitemap by `getCars()`.

### 3.12 Storage leaks orphaned images

`ImageUploader.removeImage` (`components/admin/ImageUploader.tsx:63`) only drops the URL from a local array, and
`deleteCar` never touches the storage bucket. Every removed image and every deleted car leaves its files in
Supabase Storage permanently.

Related, same file: no file-size limit, no resize, no format conversion; uploads run sequentially in a `for` loop
(25 images = 25 serial round-trips); individual upload failures are swallowed by `continue` with no user feedback.

### 3.13 Session refresh does not run on public routes

`proxy.ts:12` calls `updateSession` only when the path starts with `/admin`. `CLAUDE.md` and `README.md` both claim
tokens refresh "on every request". In practice an admin session expires while browsing the public site.

Also `lib/supabase/middleware.ts:38` checks `pathname.includes('/admin')` where it means `startsWith`.

### 3.14 The admin inventory list runs on the anonymous client

`getAllCarsPaginated` delegates to `getCarsPaginated`, which uses `createStaticClient()` — no cookies, anon role.
It works only because RLS permits public SELECT on all cars, which also means unavailable and draft cars are
readable by anyone through the Supabase REST API.

---

## 4. Performance

### 4.1 The homepage fires ~12 Supabase queries to read 2 rows

`getSettings` is called independently by:

| Caller | Calls |
|---|---|
| `app/[locale]/layout.tsx` | 1 |
| `app/[locale]/page.tsx` — `generateMetadata` | 1 |
| `app/[locale]/page.tsx` — page body | 2 |
| `components/home/AboutSection.tsx` | 1 |
| `components/home/StatsSection.tsx` | 2 |
| `components/home/ServicesSection.tsx` | 1 |
| `components/home/ContactBanner.tsx` | 2 |
| `components/home/LeasingSection.tsx` | 1 |
| `components/home/WhyUsAccordion.tsx` | 1 |

Nothing memoizes. This is the single biggest available win.

**Fix:** move `getSettings` out of `'use server'` into a plain server module and wrap it:

```ts
import { cache } from 'react';

export const getSettings = cache(async (key: string) => { /* ... */ });
```

`React.cache` dedupes within a single request. Layer `'use cache'` + `cacheLife` on top for cross-request caching,
invalidated by the existing `revalidatePath` calls in `saveSettings`.

### 4.2 Other performance issues

| Issue | Location |
|---|---|
| `getDashboardStats` fetches **every** car row and **every** lead row to count them in JS (the comment claims it is "optimized") | `lib/supabase/queries.ts:264` |
| No `revalidate` or cache configuration anywhere — every page is fully dynamic | — |
| `dynamic(..., { ssr: true })` inside a Server Component is a no-op and provides no code-splitting | `app/[locale]/page.tsx:14-15` |
| `CarLeadForm` rendered three times on the car detail page (mobile card, desktop sidebar, bottom banner) — duplicated DOM, tripled client JS, and two `<h1>` elements on one page | `app/[locale]/inventory/[slug]/page.tsx:168,277,301` |
| Missing indexes for the hot listing query: `cars(is_available, created_at DESC)`, `cars(brand)`, `car_images(car_id)` | `database/SETUP_NEW_DB.sql` |
| `framer-motion` loaded for every homepage section via `Reveal` — heavy for what is mostly a fade-in | `components/ui/Reveal.tsx` |
| `.ilike('brand', input)` passes user input containing `%` straight into the pattern | `lib/supabase/queries.ts:35,91` |

---

## 5. Code quality

### 5.1 Lint is red

`npx eslint .` reports **72 errors and 35 warnings**. Breakdown:

- The overwhelming majority are `@typescript-eslint/no-explicit-any` — 59 `any` occurrences across `app/`,
  `components/`, and `lib/`. The `site_config` blob is untyped and cast with `as any` at every call site.
- The rest are unused imports and variables (`getLocale`, `useTranslations`, `SERVICES`, `ITEMS`, `getCars`,
  `LinkIcon`, `_oldId`, `options`, …).
- `coverage/` is not in the ESLint ignore list, so build artifacts get linted.

Any CI running `npm run lint` fails today.

**Fix:** define a `SiteConfig` interface in `lib/types/index.ts` and replace the `as any` casts; run
`eslint --fix` for the unused-directive warning; add `coverage/**` to `globalIgnores`.

### 5.2 Test coverage misses everything that matters

44 tests pass across 4 files: `sanitize`, `rateLimit`, `types`, and the `Pagination` component.

There are **no tests for Server Actions, `requireAuth`, the query layer, or any form**. The sanitize tests pass
against a sanitizer with confirmed bypasses, because they never exercise the bypass shapes — a false sense of
security that is worse than no tests.

Also `npm test` maps to `vitest` (watch mode), which hangs in CI. It should be `vitest run`, with a separate
`test:watch` script.

### 5.3 Dead code

| Item | Status |
|---|---|
| `components/cars/list/CarFilters.tsx` | zero references |
| `components/cars/list/ActiveFilters.tsx` | zero references |
| `components/cars/list/CarList.tsx` | zero references |
| `components/admin/AdminPageHeader.tsx` | exported in the barrel, consumed nowhere |
| `components/admin/FormErrorMessage.tsx` | exported in the barrel, consumed nowhere |
| `components/ui/LoadingSpinner.tsx` | exported in the barrel, consumed nowhere |
| `components/ui/EmptyState.tsx` | exported in the barrel, consumed nowhere |

The last four come from the incomplete refactor in commits `67e154e` and `33de0c3` — components created and
exported but never wired into any page.

The filter components matter more: see §7.

### 5.4 Dependencies

| Package | Issue |
|---|---|
| `isomorphic-dompurify` | installed, imported nowhere — either use it (§2.3) or drop it |
| `@types/uuid` | listed in `dependencies`, belongs in `devDependencies` |
| `uuid` | used once, for filenames — `crypto.randomUUID()` is built into Node and the browser |

### 5.5 Two parallel lead pipelines that have diverged

| | `app/api/contact/route.ts` | `submitLeadInquiry` (`lib/actions/leads.ts`) |
|---|---|---|
| Rate limit | 10 / min | 5 / min |
| Schema | inline `ContactSchema` | `LeadInquirySchema` |
| `car_id` | always `null` | required, `min(1)` |
| Notification payload | constructed `leadData` | raw `data` (see §2.2) |

Both insert into `leads_inquiries`. Two code paths, two sets of rules, one table. Consolidate onto the Server
Action and delete the API route, or vice versa.

### 5.6 Smaller items

- `alert()` used for save feedback in `app/admin/settings/SettingsForm.tsx:41` despite a `Toast` system existing.
- Empty `catch (e)` swallowing the error, same file line 45.
- `console.error` used as the sole error channel throughout — no error monitoring service.
- `components/cars/FavoriteButton.tsx` takes a `carSlug` prop it never uses.
- `lib/supabase/middleware.ts:18` drops the `options` argument when setting request cookies.

---

## 6. The SEO problem

`i18n/routing.ts` sets `localePrefix: 'never'`. All three languages therefore live at the **same URL**, selected by
cookie. Consequences:

1. Google can only ever index the Romanian version. **The Russian content — the majority language of the actual
   buyer market — is invisible to search engines.**
2. `hreflang` annotations are impossible without distinct URLs.
3. There is no `alternates.canonical` anywhere in the codebase.
4. The sitemap advertises `/ru/` and `/en/` URLs that do not resolve (§3.4).

For a trilingual dealership in Moldova this is plausibly the highest revenue-impact issue in this document after
the credential leak.

**Fix:** switch to `localePrefix: 'as-needed'` (Romanian bare, `/ru`, `/en`), add `alternates.languages` to
`generateMetadata` in the locale layout and the car detail page, and regenerate the sitemap from the real route
shape. Note this changes existing URLs — add redirects if anything is already indexed.

Also missing across the site: `alternates.canonical`, OG images per car (only the raw storage URL is used, with no
dimensions), and any `Organization`/`BreadcrumbList` JSON-LD beyond the two blocks that exist.

---

## 7. Documentation drift

`.gitignore:36` contains `*.md except README.md`, which is not gitignore syntax — it matches a file literally named
that, and is a no-op. Harmless, but misleading; delete the line.

| Claim | Reality |
|---|---|
| `README.md`: "middleware.ts (root) refreshes Supabase sessions" | the file is `proxy.ts`, and it refreshes only on `/admin*` |
| `README.md`: "Public pages are currently blank (client unpaid)" | the site is live; directly contradicts `CLAUDE.md` |
| `README.md`: `cp .env.example .env.local` | there is no `.env.example` in the repository |
| `CLAUDE.md`: "`/ru/` and `/en/` prefixes are used for other locales" | `localePrefix: 'never'`; contradicted two lines later in the same file |
| `CLAUDE.md`: "refreshes auth tokens on every request" | `/admin*` only |
| `CLAUDE.md`: "`getCarsPaginated()` — 12 per page" | the inventory page passes `limit: 15` |
| `CLAUDE.md`: "Public actions (no auth): `getSettings`" | documented as intentional — it is the credential leak in §2.1 |
| `CLAUDE.md`: "Delete or disable `/api/seed-defaults` after first use" | still present |

**Fix:** add a `.env.example`, and reconcile `README.md` / `CLAUDE.md` / `DEPLOYMENT.md` against the actual code in
one pass.

---

## 8. Feature gaps

### 8.1 Finish what is already written

`CarFilters`, `ActiveFilters`, and `CarList` are fully built and referenced by nothing. **The inventory page has no
search and no filters** — for a dealership site that is the missing feature, not a nice-to-have. The 11 missing
Russian translation keys (§3.3) are precisely the `cars.filters.*` keys, which is why: the work was abandoned
mid-way.

`docs/plans/2026-02-28-multiple-offices.md` is a complete, unimplemented plan for multi-office support.

### 8.2 High value, close to the business

1. **Moldova import cost calculator** — customs duty, excise, VAT, and registration derived from year, engine size,
   fuel type, and price. This is the genuine differentiator: nobody commits to a Swiss import without knowing the
   landed cost.
2. **Currency toggle** — EUR / MDL / CHF. Prices are EUR-only today; buyers think in MDL.
3. **A newsletter that actually sends something.** The `subscribers` table collects emails and nothing has ever
   been mailed to them. A new-arrivals digest, or saved-search alerts ("notify me when a BMW under €20k arrives"),
   is the highest-intent lead source currently going unused.
4. **Lead pipeline** — status (new / contacted / viewing booked / won / lost), assignee, notes, follow-up date.
   Today there are only `is_read` and `is_important` flags. Add search and CSV export to the leads and subscribers
   tables.
5. **Reservation / test-drive booking** with calendar slots. The schema already carries an unused `preferred_date`.
6. **Richer car records** — VIN, service history, accident and damage report, inspection PDF upload, previous
   owners. That is the trust story for an import business, and it is entirely absent.
7. **Compare cars** side by side; embed the leasing calculator on the car detail page (it currently exists only as
   a standalone page).
8. **Analytics events** on WhatsApp click, phone click, and form submit — right now there is no way to tell which
   cars generate leads. Fix the GA environment variable first (§3.1).
9. **Review collection flow** — reviews are typed in by an admin today, which reads as fabricated. Send a
   tokenised post-sale link instead.
10. **Bulk import** from CSV or Swiss listing sites into the admin panel — the biggest time saver for the operator.

### 8.3 Infrastructure

- Error monitoring (Sentry or equivalent) — `console.error` is the only channel today.
- GitHub Actions running `lint` + `tsc --noEmit` + `vitest run` on every PR.
- A `.env.example`.
- Image resize and WebP conversion on upload, plus a storage cleanup job for orphans (§3.12).
- GDPR/consent checkbox on the lead forms, and a privacy policy page — the site collects names, phone numbers, and
  emails from EU-adjacent visitors.
- Honeypot field or Turnstile on the lead forms — the rate limiter is in-memory and does not survive cold starts.

---

## 9. Recommended order of work

| # | Action | Rationale |
|---|---|---|
| 1 | Rotate the Telegram token; move secrets to env vars; stop passing the full config blob to client components | Live credential leak (§2.1) |
| 2 | Audit live RLS policies; delete `dev_public_policies.sql` and `storage_permissions_fix.sql` | Possible full public write access to the database (§2.4) |
| 3 | Add `requireAuth` to (or de-`'use server'`) `getSettings`; pass `validData` to notifications; escape `source_url` | Auth and validation bypass (§2.1, §2.2) |
| 4 | `npm audit fix` | 7 high-severity vulnerabilities, one command |
| 5 | Replace the sanitizer with `isomorphic-dompurify`; tighten GTM and maps-embed validation | XSS defence-in-depth (§2.3, §2.5) |
| 6 | Fix the GA env var, the Russian translations, `parseInt` clamping, the sitemap, and translate `CarLeadForm` | User-visible breakage (§3.1, §3.3, §3.4, §3.5, §3.6) |
| 7 | Wrap `getSettings` in `React.cache` | 12 queries per homepage render collapse to 1 (§4.1) |
| 8 | Switch `localePrefix` to `as-needed`; add hreflang and canonical tags | Two thirds of the target market are currently unindexed (§6) |
| 9 | Wire up the filter and search components | Missing core feature, code already written (§8.1) |
| 10 | Clear the 72 lint errors; add tests for the Server Actions; change `npm test` to `vitest run`; add CI | Stop the regression bleeding (§5.1, §5.2) |

---

*Generated by a full-repository read plus `tsc`, `eslint`, `vitest`, and `npm audit` runs on 2026-08-26.*
