# features/reviews

## Scop

Recenziile clienților afișate pe homepage și administrarea lor (CRUD, vizibilitate).

## Public API

`@features/reviews` (client-safe):
- `ReviewsSlider` — slider-ul de recenzii de pe homepage.
- Tip: `Review`.

`@features/reviews/admin` (client-safe, doar UI de admin):
- `ReviewForm` — formularul de creare/editare.
- `ReviewsTable` — tabelul de recenzii din admin.

`@features/reviews/server` (server-only):
- `listVisibleReviews`, `readReviewsAdminPage`, `findReviewForEditing` — citiri din tabela `reviews`.
- `countReviews(): Promise<number>` — folosit de dashboard-ul de admin (aruncă la eroare).

Scrierile (`saveReviewRecord`, `deleteReviewRecord`) stau doar în `server/reviews-repository.ts`, fără
export din `server.ts` — sunt accesibile doar prin `actions.ts`, care aplică `requireAdmin()`.

`@features/reviews/actions` (Server Actions, protejate de `requireAdmin`):
- `saveReview(data): Promise<ReviewSaveResult>`, `deleteReview(reviewId): Promise<ReviewRemovalResult>`.
  Intrare invalidă (Zod) → `invalid-input` cu `invalidFields`; eroare din repository → logată și întoarsă ca `unavailable`.

## Dependențe

Poate importa `@core/*` și `@shared/*`:
- `@core/supabase/server-client` în `server/reviews-repository.ts`.
- `@shared/session/require-admin` (`requireAdmin`).
- `@shared/contracts/action-result`.
- `@shared/ui/admin/ImageUploader`, `@shared/ui/admin/DataTable`, `@shared/ui/Pagination`.

Nu importă alt feature.

## Structură

```
reviews.schema.ts / .test.ts   — ReviewSchema
reviews.types.ts               — Review, ReviewRecord, PaginatedReviews, ReviewSaveResult, ReviewRemovalResult
index.ts / admin.ts / server.ts / actions.ts
server/
  reviews-repository.ts         — listVisibleReviews, readReviewsAdminPage, findReviewForEditing, countReviews, saveReviewRecord, deleteReviewRecord
ui/
  ReviewsSlider (+ css), ReviewForm (+ css), ReviewsTable (+ css)
```

## Testare

Citirea publică (`listVisibleReviews`) logează eroarea și întoarce listă goală; citirile de admin
aruncă. Scrierile din `server/reviews-repository.ts` aruncă `Error` cu `cause`; `actions.ts` le prinde
și le întoarce ca `ActionResult`. Testele stau lângă sursă. Rulare izolată: `npx vitest run features/reviews`
