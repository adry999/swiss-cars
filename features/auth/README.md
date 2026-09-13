# features/auth

## Scop

Autentifică adminul: formularul de login și acțiunile de sign in/sign out. Nu deține sesiunea
curentă și nu decide cine e admin — acelea stau în afara feature-ului, ca să le poată citi orice
feature de admin fără să importe `auth`.

## Public API

`@features/auth` (client-safe):
- `LoginForm` — formularul de la `/login`; validează local cu `AdminCredentialsSchema`, apoi cheamă `signIn`.

`@features/auth/actions` (Server Actions, `'use server'`):
- `signIn(credentials)` → `ActionResult<'invalid-input' | 'invalid-credentials'>`. Nu întoarce niciodată mesajul Supabase și nici userul.
- `signOut()` — deloghează și redirecționează la `/login`.

## Dependențe

Poate importa `@core/*` și `@shared/contracts/*`:
- `@core/supabase/server-client` (`createServerSupabaseClient`) în `actions.ts`.

Nu importă alt feature. Sesiunea curentă (`getCurrentUser`) stă în `@shared/session/current-user`,
iar verificarea rolului de admin (`hasAdminRole`) în `@shared/session/admin-role` — orice feature de
admin le citește direct din `shared/`, nu prin `auth`. `app/auth/callback/route.ts` rămâne o rută
subțire (schimbă codul Supabase pe sesiune) și nu face parte din acest feature.

## Evenimente

Niciunul.

## Structură

```
auth.schema.ts        — AdminCredentialsSchema (validare Zod a formularului)
auth.schema.test.ts   — teste ale schemei
index.ts              — punct de intrare client-safe (public)
actions.ts            — Server Actions ('use server')
ui/
  LoginForm.tsx (+ .module.css) — formularul de login
```

## Testare

Testele stau lângă sursă. `auth.schema.test.ts` rulează cu `// @vitest-environment node`.

Rulare izolată: `npx vitest run features/auth`
