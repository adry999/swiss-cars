# SwissCars Security & Improvements Plan

> **Status:** BATCH 1 (Critical Security) and most of BATCH 2 (Input Validation) completed as of 2026-05-13.

**Goal:** Fix security vulnerabilities, critical bugs, i18n gaps, and performance issues found in the full codebase audit.

**Tech Stack:** Next.js 16 App Router, Supabase (SSR), next-intl, Zod, TypeScript, Vitest

---

## BATCH 1 — Critical Infrastructure & Security ✅ COMPLETED

### Task 1: Create root middleware.ts ✅ DONE

`middleware.ts` was missing from the project root entirely (the helper in `lib/supabase/middleware.ts` was never wired up). Created `middleware.ts` at the project root that:
- Runs next-intl locale routing
- Refreshes Supabase auth session on every request
- Redirects unauthenticated users from `/admin*` to `/login` at the edge

---

### Task 2: Add auth guards to all mutation Server Actions ✅ DONE

Created `lib/utils/requireAuth.ts` — shared auth check used at the top of every mutation action.

Protected: `saveCar`, `deleteCar`, `duplicateCar`, `saveReview`, `savePartner`, `deleteReview`, `deletePartner`, `saveSettings`, `updateI18nMessages`, `getI18nMessages`, `getSubscribers`, `deleteSubscriber`, `toggleSubscriberStatus`, `markLeadRead`, `markLeadImportant`, `deleteLead`, `markAllLeadsRead`.

---

### Task 3: Strict GTM ID validation

**File:** `components/analytics/GTMScript.tsx`

Change line 8 (and the same check in `GTMNoscript`) from:
```ts
if (!gtmId || !gtmId.startsWith('GTM-')) return null;
```
to:
```ts
if (!gtmId || !/^GTM-[A-Z0-9]+$/.test(gtmId)) return null;
```

---

### Task 4: Validate Google Maps embed URL

**File:** `components/contact/ContactPageClient.tsx`

Change the iframe rendering to:
```tsx
{googleMapsEmbed && googleMapsEmbed.startsWith('https://www.google.com/maps/embed') && (
    <iframe src={googleMapsEmbed} ... />
)}
```

---

## BATCH 2 — Input Validation

### Task 5: submitLeadInquiry validation ✅ DONE

Already had Zod validation with `LeadInquirySchema`. Rate limiting switched from phone-based to IP-based. Auth added to admin lead mutations.

---

### Task 6: saveReview and savePartner validation ✅ DONE

Both functions now validate against `ReviewSchema` and `PartnerSchema` from `lib/types/index.ts`. No more `data: any`.

---

### Task 7: Subscriber email validation ✅ DONE

`subscribe()` now uses `z.string().email()` instead of `.includes('@')`.

---

## BATCH 3 — Bug Fixes

### Task 8: Fix "View on site" link in admin inventory table

**File:** `app/admin/inventory/CarsTable.tsx` (around line 70)

Change:
```tsx
<Link href={`/en/inventory/${car.slug}`} target="_blank" ...>
```
to:
```tsx
<Link href={`/inventory/${car.slug}`} target="_blank" ...>
```

---

### Task 9: Revalidate homepage when a car is saved

**File:** `lib/actions/cars.ts`

In `saveCar`, add `revalidatePath('/', 'layout')` alongside the existing revalidations.

---

### Task 10: Add `is_available` filter to getCarBySlug

**File:** `lib/supabase/queries.ts`

In `getCarBySlug`, add `.eq('is_available', true)` so sold cars return a 404.

---

### Task 11: Add `lpg` option to CarEditForm fuel type select

**File:** `components/admin/CarEditForm.tsx`

Add `<option value="lpg">LPG</option>` to the fuel type select.

---

## BATCH 4 — Performance

### Task 12: Optimize SimilarCars with a targeted DB query

**Files:** `lib/supabase/queries.ts`, `components/cars/detail/SimilarCars.tsx`

Replace the full `getCars()` call in SimilarCars with a targeted `getSimilarCars(brand, currentCarId, limit)` query.

---

### Task 13: Optimize getDashboardStats with server-side counting

**File:** `lib/supabase/queries.ts`

Replace fetching all rows with `select('*', { count: 'exact', head: true })` queries.

---

### Task 14: Optimize sitemap query

**File:** `app/sitemap.ts`

Replace `getCars()` with a targeted `select('slug, updated_at')` query.

---

## BATCH 5 — i18n & SEO

### Task 15: Fix hardcoded strings in inventory page

**Files:** `app/[locale]/inventory/page.tsx`, `messages/*.json`

Add `cars_available` translation key and replace the hardcoded car count text.

---

### Task 16: Fix hardcoded Romanian strings in car detail page

**Files:** `app/[locale]/inventory/[slug]/page.tsx`, `components/cars/detail/CarLeadForm.tsx`, `messages/*.json`

Replace Romanian hardcoded strings with translation keys.

---

### Task 17: Fix root layout lang attribute

**File:** `app/layout.tsx`

The `app/[locale]/layout.tsx` already sets `lang={locale}`. Verify `app/layout.tsx` doesn't override with hardcoded `lang="ro"`.

---

## BATCH 6 — Inventory Filters Feature

### Task 18: Wire CarFilters to the inventory page backend

**Files:** `lib/supabase/queries.ts`, `app/[locale]/inventory/page.tsx`

Extend `getCarsPaginated` to accept `brand`, `minPrice`, `maxPrice`, `minYear`, `maxYear`, `q` filters. Read URL params in the inventory page and pass to the query. Render `<CarFilters />` above the car grid.

---

## Summary

| Batch | Tasks | Status |
|-------|-------|--------|
| 1 — Critical Security | 1-4 | Tasks 1, 2 done. Tasks 3, 4 pending. |
| 2 — Input Validation | 5-7 | All done. |
| 3 — Bug Fixes | 8-11 | All pending. |
| 4 — Performance | 12-14 | All pending. |
| 5 — i18n & SEO | 15-17 | All pending. |
| 6 — Features | 18 | Pending. |
