# features/inventory

## Scop

Catalogul public de mașini (listare, pagină de detaliu, favorite) și administrarea lui (CRUD, imagini).

## Public API

`@features/inventory` (client-safe):
- `CarCard`, `InventoryGrid`, `FeaturedCarsGrid` — listarea publică a mașinilor.
- `CarGallery`, `CarSpecsGrid` — pagina de detaliu a unei mașini.
- `FavoriteButton`, `FavoritesIcon`, `FavoriteCarsPage` — favorite ținute în `localStorage`.
- Tipuri: `Car`, `PaginatedCars`, `CarCatalogFilters`.

`@features/inventory/admin` (client-safe, doar UI de admin):
- `CarEditForm` — formularul de creare/editare.
- `InventoryTable` — tabelul de mașini din admin.

`@features/inventory/server` (server-only):
- `listAvailableCars`, `readCatalogPage`, `findCarBySlug`, `findSimilarCars`, `listFeaturedCars`,
  `listCarSlugs`, `findCarForEditing` — citiri din catalog.
- `SimilarCars` — Server Component, randează mașini similare; nu e exportat din `index.ts`.

`@features/inventory/actions` (Server Actions, protejate de `requireAuth`):
- `saveCar(carData)`, `deleteCar(id)`, `duplicateCar(id)`.

## Dependențe

Poate importa `@core/*` și, tranzitoriu, `@/lib/*` și `@/components/ui`:
- `@core/supabase/server-client` în `server/car-catalog-repository.ts`, `server/car-image-storage.ts` și `actions.ts`.
- `@/lib/utils/requireAuth`, `@/lib/utils/format`, `@/lib/utils/sanitize` (folosit de paginile publice, nu de feature).
- `@/components/admin/ImageUploader`, `@/components/admin/DataTable`, `@/components/ui/Pagination`, `@/components/ui/Toast`.

Nu importă alt feature.

## Structură

```
inventory.schema.ts / .test.ts   — CarSchema
inventory.types.ts               — Car, PaginatedCars, CarCatalogFilters
index.ts / admin.ts / server.ts / actions.ts
model/
  favorite-car-ids.ts / .test.ts — localStorage: readFavoriteCarIds, writeFavoriteCarIds
server/
  car-catalog-repository.ts      — citiri publice și de admin din tabela cars
  car-image-storage.ts / .test.ts — storagePathFromUrl, deleteStorageObjects
ui/
  CarCard, InventoryGrid, FeaturedCarsGrid, CarGallery, CarSpecsGrid, SimilarCars
  FavoriteButton, FavoritesIcon, FavoriteCarsPage
  CarEditForm (+ CarEditGeneralTab, CarEditSpecsTab, CarEditImagesTab), InventoryTable
```

## Testare

Citirile publice din catalog logează eroarea și întorc listă goală; `actions.ts` aruncă. Testele
stau lângă sursă. Rulare izolată: `npx vitest run features/inventory`
