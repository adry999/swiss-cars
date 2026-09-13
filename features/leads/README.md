# features/leads

## Scop

Colectează cererile de contact/inquiry/test-drive trimise din site-ul public și le expune ca inbox
pentru admin (citire, marcare citit/important, ștergere).

## Public API

`@features/leads` (client-safe):
- `CarInquiryForm` — formularul de cerere de pe pagina unei mașini; primește Server Action-ul ca prop `submitLeadInquiry`.
- `useLeadInquirySubmission(submitLeadInquiry)` — starea trimiterii (idle/submitting/succeeded/failed) plus `reset()`; folosit și de `components/contact/ContactPageClient.tsx`.
- `leadInquiryFailureMessageKey(failure)` — mapează eșecul la o cheie din namespace-ul de mesaje `errors`.
- Tipuri: `Lead`, `LeadInboxPage`, `LeadInboxChangeResult`, `LeadInquiryDraft`, `LeadSubmissionRejection`, `LeadSubmissionResult`.

`@features/leads/admin` (client-safe, doar UI de admin — ține componentele de admin în afara grafului de bundling al paginilor publice):
- `LeadInbox` — inbox-ul de admin; primește leadurile paginii curente și acțiunile ca props (`initialLeads`, `inboxActions`).
- Tip: `LeadInboxActions`.

`@features/leads/server` (server-only):
- `createSubmitLeadInquiry(deps)` — construiește use-case-ul de trimitere a unui lead (validare, rate limit, salvare, publicare eveniment).
- `supabaseLeadsRepository` — implementarea `LeadsRepository` peste Supabase, inclusiv `countLeads()`
  (total + necitite) și `listRecentLeads(limit)`, folosite de dashboard-ul de admin (aruncă la eroare).
- Tipuri: `LeadInquiryRequester`, `SubmitLeadInquiry`.

`@features/leads/actions` (Server Actions pentru inbox-ul din admin, toate protejate de `requireAuth`; formează `LeadInboxActions`):
- `markLeadRead(leadId, isRead)`
- `markLeadImportant(leadId, isImportant)`
- `deleteLead(leadId)`
- `markAllLeadsRead()`

`LeadInbox` aplică fiecare schimbare optimist prin `useLeadInbox` (`ui/use-lead-inbox.ts`), apoi trimite
acțiunea corespunzătoare. Dacă serverul refuză schimbarea sau acțiunea aruncă, se anulează *doar acea*
schimbare (starea anterioară a leadului, sau poziția lui originală la ștergere) — o schimbare respinsă
pe un lead nu afectează o schimbare reușită pe alt lead făcută în același timp — și se cheamă
`onChangeRejected`, care arată un toast de eroare.

## Dependențe

Poate importa `@core/*`, `@shared/contracts/*` și, tranzitoriu, `@/lib/*`:
- `@core/supabase/server-client` (`createServerSupabaseClient`) în `server/supabase-leads-repository.ts`.
- `@/lib/utils/requireAuth` în `actions.ts`.
- `@/lib/utils/format` (`formatPrice`) în `ui/CarInquiryForm.tsx`.
- `@/components/ui/Toast` (`useOptionalToast`) în `ui/LeadInbox.tsx`, pentru mesajul de eroare la o schimbare respinsă.

Server Action-ul public de trimitere nu stă în feature: îl compune `app/_composition/lead-inquiry-actions.ts`, pentru că leagă și rate limiter-ul, și notificările.

Nu importă alt feature.

## Evenimente

La succes, `submitLeadInquiry` publică `leads.inquiry-submitted` (payload `LeadInquirySubmitted`,
definit în `shared/contracts/domain-events.ts`) printr-un `EventPublisher` injectat — modulul nu
deține el însuși un bus de evenimente. `features/notifications` nu se abonează singur: compunerea
și abonarea au loc în `app/_composition/lead-inquiry-submission.ts`, care rulează livrarea alertelor
în interiorul unui `after()` din Next.

## Structură

```
leads.schema.ts                        — LeadInquiryDraftSchema (validare Zod a formularului)
leads.types.ts                         — tipuri publice: Lead, LeadsRepository, LeadInboxActions, rezultate de acțiune
index.ts                               — punct de intrare client-safe (public)
admin.ts                               — punct de intrare client-safe, doar UI de admin
server.ts                              — punct de intrare server-only ('server-only')
actions.ts                             — Server Actions ale inbox-ului admin ('use server')
server/
  submit-lead-inquiry.ts               — use-case: rate limit + validare + salvare + eveniment
  submit-lead-inquiry.test.ts          — teste ale use-case-ului (repository, rate limiter și publisher falși)
  supabase-leads-repository.ts         — LeadsRepository peste tabela leads_inquiries (RPC submit_lead),
                                          plus countLeads/listRecentLeads pentru dashboard-ul de admin
ui/
  use-lead-inquiry-submission.ts       — hook de stare client pentru formular
  use-lead-inquiry-submission.test.ts  — teste ale hook-ului
  CarInquiryForm.tsx (+ .module.css)   — formularul de pe pagina mașinii
  CarInquiryForm.test.tsx              — validare locală, draft trimis, succes, mesaj de eroare
  use-lead-inbox.ts                    — hook de stare client pentru inbox: schimbări optimiste cu rollback per-lead
  use-lead-inbox.test.ts               — teste ale hook-ului (rollback pe eșec, izolare între leaduri)
  LeadInbox.tsx (+ .module.css)        — inbox-ul de admin (filtre, marcare citit/important, ștergere)
test-support/
  lead-inquiry-drafts.ts               — draft-uri de test (inquiry, testdrive)
```

## Testare

Testele stau lângă sursă (`*.test.ts`/`*.test.tsx`). Cele din `server/` rulează cu
`// @vitest-environment node`; cele din `ui/` folosesc environment-ul implicit (jsdom) prin
React Testing Library. Fixture-urile comune sunt în `test-support/`.

Rulare izolată: `npx vitest run features/leads`
