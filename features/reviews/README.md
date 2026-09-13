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

`@features/reviews/actions` (Server Actions, protejate de `requireAuth`):
- `saveReview(data)`, `deleteReview(id)`.

## Dependențe

Poate importa `@core/*` și, tranzitoriu, `@/lib/*` și `@/components/ui`:
- `@core/supabase/server-client` în `server/reviews-repository.ts` și `actions.ts`.
- `@/lib/utils/requireAuth`.
- `@/components/admin/ImageUploader`, `@/components/admin/DataTable`, `@/components/ui/Pagination`.

Nu importă alt feature.

## Structură

```
reviews.schema.ts / .test.ts   — ReviewSchema
reviews.types.ts               — Review, PaginatedReviews
index.ts / admin.ts / server.ts / actions.ts
server/
  reviews-repository.ts         — listVisibleReviews, readReviewsAdminPage, findReviewForEditing
ui/
  ReviewsSlider (+ css), ReviewForm (+ css), ReviewsTable (+ css)
```

## Testare

Citirea publică (`listVisibleReviews`) logează eroarea și întoarce listă goală; citirile de admin și
`actions.ts` aruncă. Testele stau lângă sursă. Rulare izolată: `npx vitest run features/reviews`
