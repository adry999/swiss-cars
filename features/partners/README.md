# features/partners

## Scop

Partenerii afișați pe homepage și pe pagina de leasing, plus administrarea lor (CRUD, vizibilitate).

## Public API

`@features/partners` (client-safe):
- `PartnersSlider` — banda de logo-uri de pe homepage și leasing.
- Tip: `Partner`.

`@features/partners/admin` (client-safe, doar UI de admin):
- `PartnerForm` — formularul de creare/editare.
- `PartnersTable` — tabelul de parteneri din admin.

`@features/partners/server` (server-only):
- `listVisiblePartners`, `findPartnerForEditing` — citiri din tabela `partners`.

`@features/partners/actions` (Server Actions, protejate de `requireAuth`):
- `savePartner(data)`, `deletePartner(id)`.

## Dependențe

Poate importa `@core/*` și, tranzitoriu, `@/lib/*` și `@/components/ui`:
- `@core/supabase/server-client` în `server/partners-repository.ts` și `actions.ts`.
- `@/lib/utils/requireAuth`.
- `@/components/admin/ImageUploader`, `@/components/admin/DataTable`.

Nu importă alt feature.

## Structură

```
partners.schema.ts / .test.ts  — PartnerSchema
partners.types.ts              — Partner
index.ts / admin.ts / server.ts / actions.ts
server/
  partners-repository.ts        — listVisiblePartners, findPartnerForEditing
ui/
  PartnersSlider (+ css), PartnerForm, PartnersTable (+ css)
```

## Testare

Citirea publică (`listVisiblePartners`) logează eroarea și întoarce listă goală; `actions.ts` aruncă.
Testele stau lângă sursă. Rulare izolată: `npx vitest run features/partners`

## De urmat

`/admin/partners` listează partenerii prin `listVisiblePartners`, deci un partener ascuns dispare
din lista de admin și nu mai poate fi reactivat de acolo (bug cunoscut, se repară într-un pas separat).
