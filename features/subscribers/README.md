# features/subscribers

## Scop

Gestionează abonații la newsletter: formularul public de abonare din footer și lista de admin
(activare/dezactivare, ștergere).

## Public API

`@features/subscribers` (client-safe):
- `NewsletterSignupForm` — formularul de abonare din `Footer`; nu primește nimic ca prop, apelează
  direct Server Action-ul public `subscribe`.

`@features/subscribers/admin` (client-safe, doar UI de admin):
- `SubscribersTable` — tabelul de admin; primește `subscribers` ca prop.
- Tip: `Subscriber`.

`@features/subscribers/server` (server-only):
- `listSubscribers()` — citește toți abonații; cere `requireAdmin()`. Nu e un Server Action: un
  export dintr-un fișier `'use server'` e un endpoint POST public, ceea ce ar fi expus lista
  completă de email-uri oricui o cerea, protejată doar de `requireAdmin()` la momentul apelului.

`@features/subscribers/actions` (Server Actions):
- `subscribe(email)` — public, fără `requireAdmin()`; compune `createSubscribeToNewsletter` la prima
  folosire: rate limit de 5 abonări la 10 minute per IP (cheia `subscribe:<ip>`), apoi validare Zod pe server.
- `deleteSubscriber(subscriberId)` — admin.
- `toggleSubscriberStatus(subscriberId, isActive)` — admin.

## Dependențe

Poate importa `@core/*` și `@shared/*`:
- `@core/supabase/server-client` (`createServerSupabaseClient`) în `server/supabase-subscribers-repository.ts`.
- `@core/rate-limit/shared-rate-limiter` (`getRateLimiter`) și `@core/http/client-ip` (`readClientIp`) în `actions.ts`.
- `@shared/session/require-admin` (`requireAdmin`) în `server.ts` și `actions.ts`.
- `@shared/contracts/action-result`.
- `@shared/ui/Toast/ToastContext` (`useOptionalToast`, `useToast`) în `ui/NewsletterSignupForm.tsx` și `ui/SubscribersTable.tsx`.
- `@shared/ui/admin/DataTable` în `ui/SubscribersTable.tsx`.

Inserturile anonime trec doar prin RPC-ul `subscribe_email()`
(`database/2026-08-26_lead_subscriber_rpc.sql`), care face și verificarea de duplicat — anon nu are
SELECT pe tabelă, așa că un `.insert()` direct nu poate distinge un abonat existent de unul nou.

Nu importă alt feature.

## Structură

```text
subscribers.types.ts                   — Subscriber, SubscribersRepository, rezultate de acțiune
subscribers.schema.ts                  — SubscriberEmailSchema
subscribers.schema.test.ts             — teste ale schemei
index.ts / admin.ts / server.ts / actions.ts — punctele de intrare
server/
  supabase-subscribers-repository.ts   — SubscribersRepository peste tabela subscribers
  subscribe-to-newsletter.ts (+ .test.ts) — use case-ul abonării: rate limit, validare, repository
ui/
  NewsletterSignupForm.tsx (+ .module.css) — formularul din footer
  subscribe-failure-message.ts (+ .test.ts) — mapare motiv → cheie de mesaj
  SubscribersTable.tsx                 — tabelul de admin
```
