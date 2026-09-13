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
- `listVisiblePartners` — partenerii vizibili, pentru paginile publice (la eroare logează și întoarce listă goală).
- `listAllPartners` — toți partenerii, inclusiv cei ascunși, pentru `/admin/partners` (aruncă la eroare).
- `findPartnerForEditing` — un partener după id, pentru formularul de editare.

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
  partners-repository.ts        — listVisiblePartners, listAllPartners, findPartnerForEditing
ui/
  PartnersSlider (+ css), PartnerForm, PartnersTable (+ css)
```

## Testare

Citirea publică (`listVisiblePartners`) logează eroarea și întoarce listă goală; `actions.ts` aruncă.
Testele stau lângă sursă. Rulare izolată: `npx vitest run features/partners`
