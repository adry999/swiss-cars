# SwissCars — Incremental Modular Refactor Design

**Date:** 2026-05-27  
**Approach:** Option B — Safe pre-launch structural fixes, then post-launch hooks and tests  
**Scope:** Code organization only. Zero logic changes, zero feature changes, zero database changes.

---

## Context

The app is a production-ready Next.js 16 + Supabase multilingual car dealership site (RO/RU/EN). The client is about to pay and the site goes live shortly. The public site is currently in maintenance mode (blank layout). Admin at `/admin` and login at `/login` are unaffected.

**Primary pain points identified in audit:**
- Files too large (`HomepageForm.tsx` at 530 lines manages 6 unrelated sections)
- Duplicated code (form error display, loading states, page headers written inline per page)
- Unclear structure (no shared admin components, no hooks layer)
- TypeScript gaps (`any` in 3 places, `LeadInquiry` schema duplicated outside `lib/types/`)

**Non-goals:**
- No global state store (Zustand/Jotai) — not needed at current scale
- No service layer — direct Supabase calls via `lib/supabase/queries.ts` are sufficient
- No feature additions — current feature set is enough for launch
- No folder restructure to `features/` — incremental improvement only

---

## Pre-Launch Changes (Steps 1–6)

All pre-launch changes are code moves and type annotations. No mutations to business logic.

### Step 1 — Restore Public Site

**File:** `app/[locale]/layout.tsx`  
**Change:** Replace the blank `<html lang={locale}><body /></html>` with the full layout body (Header, Footer, locale providers, analytics). Admin and login routes are unaffected.  
**Time:** ~5 minutes.

---

### Step 2 — Split HomepageForm (530 lines → orchestrator + 6 sub-forms)

**Orchestrator stays at:** `components/admin/HomepageForm.tsx` (no import path change for existing consumers)  
**New sub-forms in:** `components/admin/homepage/`

| File | Responsibility |
|---|---|
| `components/admin/HomepageForm.tsx` | Orchestrator — renders the 6 sub-forms, holds the single save handler, stays under 80 lines |
| `components/admin/homepage/HeroForm.tsx` | Hero slider slides array (`useFieldArray`) |
| `components/admin/homepage/AboutForm.tsx` | About section text + image URL |
| `components/admin/homepage/StatsForm.tsx` | Stat counters (number + label pairs) |
| `components/admin/homepage/ServicesForm.tsx` | Services list items |
| `components/admin/homepage/WhyUsForm.tsx` | Why-us accordion items |

**Interface contract:** Each sub-form receives its own typed data slice and a `control` + `register` from the parent's `react-hook-form` instance. No sub-form calls save — the orchestrator owns that.

**Type:** Create `HomepageContent` type in `lib/types/index.ts` to replace `initialData?: any`.

---

### Step 3 — Split CarEditForm (300 lines → orchestrator + 3 tab components)

**Orchestrator stays at:** `components/admin/CarEditForm.tsx` (no import path change for existing consumers)  
**New tab components in:** `components/admin/car-edit/`

| File | Responsibility |
|---|---|
| `components/admin/CarEditForm.tsx` | Orchestrator — tab switcher + save/delete logic, stays under 80 lines |
| `components/admin/car-edit/GeneralInfoTab.tsx` | Title, price, description, multilingual fields |
| `components/admin/car-edit/SpecsTab.tsx` | Year, mileage, fuel type, gearbox, body type |
| `components/admin/car-edit/ImagesTab.tsx` | Image upload, reorder, primary image selection |

**Interface contract:** Each tab receives `control` and `register` from the parent's `react-hook-form` instance plus its own typed field subset.

---

### Step 4 — TypeScript Cleanup

Three targeted fixes:

1. **`HomepageForm.tsx`** — `initialData?: any` → `initialData?: HomepageContent` (type defined in Step 2)
2. **`HeroSlider.tsx`** — `slides?: any[]` → `slides?: HeroSlide[]` (new interface: `{ image: string; title: TranslatedField; subtitle: TranslatedField }`)
3. **`lib/actions/leads.ts`** — move the inline `LeadInquiry` Zod schema to `lib/types/index.ts`, import it back in `leads.ts`

---

### Step 5 — Shared Admin Components

**Directory:** `components/admin/`  
**4 new components:**

**`AdminPageHeader`**
```tsx
interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}
```
Replaces inline title + button markup duplicated across inventory, leads, reviews, partners, subscribers, and settings pages.

**`FormErrorMessage`**
```tsx
interface FormErrorMessageProps {
  message?: string
}
```
Renders a consistent red error block with icon. Replaces the slightly different error UI in each form.

**`LoadingSpinner`**
```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}
```
Single spinner. Replaces the mix of inline spinner divs and Preloader usage across forms and tables.

**`EmptyState`**
```tsx
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}
```
Centered icon + message for empty lists. Replaces the different empty-state patterns across admin tables and the favorites page.

---

### Step 6 — Barrel Exports

Add `index.ts` to each major component folder:

**`components/ui/index.ts`**
```ts
export { Pagination } from './Pagination'
export { useToast } from './Toast'
export { Toast } from './Toast/ToastContext'
export { LoadingSpinner } from './LoadingSpinner'
export { EmptyState } from './EmptyState'
export { Reveal } from './Reveal'
```

**`components/admin/index.ts`**
```ts
export { AdminPageHeader } from './AdminPageHeader'
export { FormErrorMessage } from './FormErrorMessage'
export { DataTable } from './DataTable'
export { AdminSidebar } from './AdminSidebar'
export { AdminLayoutClient } from './AdminLayoutClient'
```

**`lib/types/index.ts`** — already exports all schemas. Add `LeadInquiry` export after Step 4.

Import paths project-wide change from `../../components/ui/Pagination` to `@/components/ui`.

---

## Post-Launch Changes (Steps 7–9)

These are done after go-live, when there is no shipping pressure.

### Step 7 — Custom Hooks Layer

**Directory:** `lib/hooks/`

**`useCarFilters.ts`**  
Manages filter state (make, body type, fuel type, price range) and syncs with URL `searchParams`. Returns `{ filters, setFilter, resetFilters }`. Replaces scattered filter state in `CarsGridPaginated` and `CarFilters`.

**`usePagination.ts`**  
```ts
function usePagination(total: number, perPage: number): {
  page: number
  setPage: (p: number) => void
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```
Replaces inline pagination math in 3+ admin table components.

**`useImageUpload.ts`**  
Wraps Supabase storage upload with progress tracking, error handling, and retry on failure. Decouples `ImageUploader.tsx` from the Supabase storage API. Returns `{ upload, uploading, progress, error }`.

**`useAdminTable.ts`**  
```ts
function useAdminTable<T>(): {
  sortKey: keyof T | null
  sortDir: 'asc' | 'desc'
  toggleSort: (key: keyof T) => void
  search: string
  setSearch: (q: string) => void
}
```
Generic hook for all 5 admin tables. Replaces duplicated sort/search state.

---

### Step 8 — Improved Error Boundaries

**Files:** `app/[locale]/error.tsx`, `app/admin/error.tsx`

**Admin errors:** Add "Go back to dashboard" navigation link. Log error with page context to `console.error`.  
**Public errors:** Branded error page matching the site design, with "Return to homepage" CTA and translated copy (RO/RU/EN).

No new error boundary components needed — the existing Next.js `error.tsx` files are upgraded in place.

---

### Step 9 — Component Tests

**Framework:** Vitest + React Testing Library (already configured)

**High priority (test first):**
- `CarCard` — renders with full props, handles missing primary image gracefully
- `Pagination` — next/prev click handlers, disabled state at first/last page
- `FavoriteButton` — toggles state, persists to localStorage, handles SSR (no window)

**Medium priority:**
- `ContactPageClient` — required field validation messages shown on submit
- `Toast` — show/dismiss lifecycle

**Lower priority (after the above):**
- Admin form field presence and submit-disabled-when-invalid behavior

Test files co-located with source: `CarCard.test.tsx` next to `CarCard.tsx`.

---

## File Change Summary

### Pre-launch files created
```
components/admin/AdminPageHeader.tsx
components/admin/FormErrorMessage.tsx
components/admin/homepage/HeroForm.tsx
components/admin/homepage/AboutForm.tsx
components/admin/homepage/StatsForm.tsx
components/admin/homepage/ServicesForm.tsx
components/admin/homepage/WhyUsForm.tsx
components/admin/car-edit/GeneralInfoTab.tsx
components/admin/car-edit/SpecsTab.tsx
components/admin/car-edit/ImagesTab.tsx
components/ui/LoadingSpinner.tsx
components/ui/EmptyState.tsx
components/ui/index.ts
components/admin/index.ts
```

### Pre-launch files modified
```
app/[locale]/layout.tsx          — restore full layout body
components/admin/HomepageForm.tsx — becomes orchestrator (~80 lines)
components/admin/CarEditForm.tsx  — becomes orchestrator (~80 lines)
components/home/HeroSlider.tsx    — fix slides?: any[] type
lib/types/index.ts                — add HomepageContent, HeroSlide, LeadInquiry
lib/actions/leads.ts              — remove inline schema, import from lib/types
```

### Post-launch files created
```
lib/hooks/useCarFilters.ts
lib/hooks/usePagination.ts
lib/hooks/useImageUpload.ts
lib/hooks/useAdminTable.ts
components/cars/CarCard.test.tsx
components/ui/Pagination.test.tsx  (already exists — extend)
components/cars/FavoriteButton.test.tsx
components/contact/ContactPageClient.test.tsx
components/ui/Toast/Toast.test.tsx
```

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| HomepageForm split breaks save logic | Orchestrator owns all `useForm` state; sub-forms receive `control` + `setValue` only. No data flows up. |
| CarEditForm split breaks image upload | ImagesTab is self-contained; only the Supabase upload call moves. |
| Barrel exports break existing imports | Add barrel exports as additive — existing direct imports still work. Update imports file-by-file. |
| Type changes cause TypeScript errors | Fix errors at the point of definition, not with `as any`. All pre-launch TypeScript changes are non-breaking. |
