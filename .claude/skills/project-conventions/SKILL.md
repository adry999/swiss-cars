---
name: project-conventions
description: Convențiile înregistrate ale SwissCars.md (Next.js 16 App Router + Supabase + next-intl) - straturile features/ core/ shared/ config/ app/_composition, cele trei puncte de intrare ale unui feature, Server Actions, erori, configurare pe mediu, evenimente, teste, i18n și commit-uri. Folosește la orice cod nou din acest repo, la Server Actions, Route Handlers, repository-uri Supabase, formulare și teste, și când decizi unde stă un fișier nou (feature, shared/ui sau app/_composition).
---

# SwissCars.md — Project Conventions

## Scop

Înregistrează deciziile de arhitectură ale acestui repo, ca feature-urile noi și pașii de migrare să le aplice fără să le redecidă. Designul complet, tree-urile și planul de migrare stau în `docs/superpowers/specs/2026-09-13-feature-modules-architecture-design.md`. Regulile generale vin din skill-ul global `senior-architecture`; aici stau doar alegerile concrete ale proiectului. Când cele două se contrazic, câștigă acest fișier.

## Triggers

- Cod nou sau mutat în `features/`, `core/`, `shared/`, `config/` sau `app/_composition/`.
- Un Server Action, un Route Handler, un repository Supabase sau un formular public.
- Un test nou sau o fixture.
- Un fișier nou care nu știi imediat unde intră (feature, `shared/`, `app/_composition/` sau `app/_shell/`).
- Redactarea unui mesaj de commit.

## Reguli concrete

### Straturi și importuri

| Folder | Conține | Poate importa |
|---|---|---|
| `app/` | rute, pagini subțiri, Route Handlers | orice; un feature doar prin `@features/<x>`, `@features/<x>/admin`, `@features/<x>/server`, `@features/<x>/actions` |
| `app/_composition/` | leagă feature-urile: porturi, abonări la evenimente, `after()` | tot ce poate `app/` |
| `app/_shell/` | Header, Footer, MobileMenu — compun feature-urile pentru site-ul public | tot ce poate `app/` |
| `app/admin/_shell/` | AdminSidebar, AdminLayoutClient — compun feature-urile pentru shell-ul de admin | tot ce poate `app/` |
| `app/admin/_dashboard/` | statisticile dashboard-ului, compuse din numărătorile fiecărui feature | tot ce poate `app/` |
| `features/<x>/` | o capabilitate de business | propriul feature (relativ, cel mult un `../`), `@core/*`, `@shared/*`, `@config/*`, `@i18n/*` |
| `shared/` | UI, sesiune, formatare și tipuri fără domeniu, folosite de mai multe feature-uri | `@core/*`, `@config/*`; niciodată `@features/*` sau `@app/*` |
| `core/` | infrastructură fără domeniu: event bus, rate limit, IP client, clienți Supabase | `@config/*` |
| `config/` | citirea și validarea variabilelor de mediu | — |

Granițele sunt aplicate de `eslint.config.mjs` (`no-restricted-imports`). Nu dezactiva regula; mută codul sau exportă prin punctul de intrare.

### Anatomia unui feature

```text
features/<feature>/
├── index.ts             # client-safe: componente publice, hook-uri, tipuri
├── admin.ts             # client-safe, doar UI de admin (opțional)
├── server.ts            # import 'server-only': use case-uri, repository
├── actions.ts           # 'use server': Server Actions ale feature-ului
├── <feature>.types.ts   # contracte, porturi
├── <feature>.schema.ts  # Zod la graniță
├── model/               # reguli pure
├── server/              # I/O: repository, canale externe, use case-uri
├── ui/                  # componente și hook-uri client (+ .module.css)
├── test-support/        # fixture-uri ale feature-ului
└── README.md            # scop, public API, dependențe, evenimente
```

- `index.ts` nu importă nimic server-only. `server.ts` începe cu `import 'server-only'`.
- Fiecare export din `actions.ts` e un endpoint POST public: `requireAdmin()` (`@shared/session/require-admin`) când e acțiune de admin, validare Zod pe fiecare argument, rezultat `ActionResult`.
- Un Server Action care are nevoie de alt feature (evenimente, porturi) stă în `app/_composition/<flux>-actions.ts` și ajunge la componenta client **ca prop** din pagină.
- Fără barrel-uri în subfoldere și fără `export *`.

### Server Actions și Route Handlers

- Erorile așteptate se întorc ca `ActionResult<Reason>` (`shared/contracts/action-result.ts`). Motivele sunt kebab-case: `rate-limited`, `invalid-input`, `unavailable`.
- Excepțiile neașteptate se aruncă și ajung la `error.tsx` (`app/`, `app/[locale]/`, `app/admin/`).
- Repository-urile aruncă `Error` cu `cause`. Use case-ul decide dacă eșecul devine `unavailable`; driverul nu ajunge la client.
- Un Route Handler e un adaptor subțire peste același use case: 400 invalid, 429 limită, 500 indisponibil. Contractul body-ului public nu se schimbă la refactorizare.
- Inserturile anonime trec doar prin RPC (`submit_lead`), niciodată prin `.insert()` cu cheia anon.

### Client: stări și mesaje

- Trimiterea asincronă expune `idle | submitting | succeeded | failed`. `failed` poartă `kind: 'rejected'` (decizia serverului) sau `'unreachable'` (stare necunoscută, se poate relua).
- Serverul nu trimite text afișabil. Clientul mapează motivul pe `errors.<cheie>` din `messages/*.json`. O cheie nouă intră în toate cele trei locale (`messages/parity.test.ts` o verifică).
- Dublul submit se blochează cu `useRef`, nu doar prin butonul dezactivat.

### Configurare pe mediu

- Codul de server citește variabilele doar prin `getServerEnvironment()` din `@config/server-environment`. `process.env` direct e interzis în cod nou.
- O integrare cu credențiale incomplete e dezactivată. O valoare malformată aruncă o eroare care numește variabila, fără valoarea ei.
- Compunerea care folosește secrete e leneșă (`get…()` memoizat), ca `next build` să ruleze fără ele.
- Staging = Vercel Preview, cu valori proprii setate în Vercel. Nu există ramuri de cod `if (staging)`.

### Evenimente de domeniu

- Nume `<feature>.<fapt-la-trecut>` (`leads.inquiry-submitted`). Payload-ul e tipat în `shared/contracts/domain-events.ts`.
- Se publică după ce datele sunt salvate. `publish` nu aruncă; subscriber-ul care eșuează e logat.
- Abonările se fac doar în `app/_composition/`. Efectele externe (Telegram, email) rulează în `after()`.

### Testare

- `x.test.ts(x)` stă lângă `x.ts(x)`. Testele de cod server încep cu `// @vitest-environment node`.
- Fixture-urile stau în `<feature>/test-support/`. Porturile se înlocuiesc cu fake-uri injectate, nu cu `vi.mock` pe module proprii. `test-setup.ts` mock-uiește doar framework-ul (next-intl, next/navigation, next/image, framer-motion).
- Aliasurile Vitest se generează din `tsconfig.json`. Un alias nou se adaugă doar în `tsconfig.json`.
- Numele testului descrie comportamentul: `throttles per client IP and stores nothing once the limit is reached`.

### Stil

- Cod și identificatori în engleză, cu nume de domeniu (`submitLeadInquiry`, `readInboxPage`). Fără `handleSubmit`, `data`, `item`, `utils`.
- Comentariu doar pentru un DE CE neevident. Istoria stă în mesajul de commit.

### Structură finală

Migrarea s-a încheiat pe 2026-09-13: nu mai există `lib/` sau `components/`, iar aliasul `@/*` a
fost eliminat din `tsconfig.json`. Codul nou intră direct într-un feature (`features/<x>/`); UI fără
domeniu intră în `shared/ui/`; legarea mai multor feature-uri intră în `app/_composition/` (Server
Actions cross-feature, evenimente) sau în `app/_shell/` / `app/admin/_shell/` (Header, Footer,
AdminSidebar — compun UI din mai multe feature-uri, dar nu ating baza de date).

### Git

- Conventional Commits, în engleză: `type(scope): subject` la imperativ, maximum 72 de caractere. `scope` = feature sau strat (`leads`, `notifications`, `core`, `config`, `tooling`).
- Fără referințe la AI sau agenți și fără trailer `Co-Authored-By`.
- Mutările de fișiere și schimbările de comportament merg în commit-uri separate.
- Înainte de commit: `npm run verify`. Înainte de merge în `main`: și `npm run build`.

## Exemplu minimal

```ts
// app/_composition/lead-inquiry-actions.ts — singurul loc care vede mai multe feature-uri
'use server';

export async function submitLeadInquiryAction(draft: LeadInquiryDraft): Promise<LeadSubmissionResult> {
    return getSubmitLeadInquiry()(draft, { clientIp: readClientIp(await headers()) });
}
```

```tsx
// app/[locale]/inventory/[slug]/page.tsx — Server Component: acțiunea ajunge ca prop
<CarInquiryForm carId={car.id} carTitle={carTitle} carPrice={car.price} submitLeadInquiry={submitLeadInquiryAction} />
```

```tsx
// features/leads/ui/CarInquiryForm.tsx — nu știe de composition root sau de notificări
const { state, submit } = useLeadInquirySubmission(submitLeadInquiry);
```

```text
refactor(leads): move lead submission and inbox into a feature module
```

## Decision log

| Data | Decizie | Motiv |
|---|---|---|
| 2026-09-13 | Straturile stau la rădăcină (`features/`, `core/`, `shared/`, `config/`), nu în `src/` | mutarea `app/` în `src/` atinge toate rutele deodată; se poate face după ultimul pas |
| 2026-09-13 | Trei puncte de intrare per feature: `index.ts`, `server.ts`, `actions.ts` | graful client, codul server-only și endpoint-urile `'use server'` au reguli de bundling diferite |
| 2026-09-13 | Composition root în `app/_composition/` | folder privat Next (nu devine rută); feature-urile nu au voie să importe `app/` |
| 2026-09-13 | Server Action cross-feature pasat ca prop | componenta din feature rămâne independentă de composition root |
| 2026-09-13 | Event bus in-process, efecte externe în `after()` | serverless, fără proces persistent; pe Vercel `after` e ținut în viață de `waitUntil` |
| 2026-09-13 | Erori așteptate ca valori `ActionResult`, neașteptate ca excepții | recomandarea din `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`; mesajele se traduc pe client |
| 2026-09-13 | Rate limit fix-window cu store Upstash și fallback în memorie | păstrează comportamentul existent; înlocuirea cu `@upstash/ratelimit` e un pas separat |
| 2026-09-13 | Contextul de sesiune (adminul curent) stă în `shared/session/`, nu în `features/auth/` | toate feature-urile de admin îl citesc fără să importe feature-ul de autentificare |
| 2026-09-13 | Punct de intrare opțional `admin.ts` pentru UI-ul de admin al unui feature | `index.ts` e importat de paginile publice; UI-ul de admin reexportat acolo ar putea intra în manifestul client al acestora |
| 2026-09-13 | Clienții Supabase stau în `core/supabase/`, iar variabilele `NEXT_PUBLIC_*` se citesc prin `config/public-environment.ts` | Next inserează `NEXT_PUBLIC_*` în bundle doar pentru expresii `process.env.NUME` literale, deci citirea stă într-un singur loc |
| 2026-09-13 | Favoritele fac parte din `features/inventory`, nu din feature separat | `CarCard` include butonul de favorite și e randat de componente client care nu pot primi funcții (render props) din Server Components; favoritele nu au altă logică decât lista din `localStorage` |
| 2026-09-13 | Citirile publice din catalog (`inventory/server`) logează eroarea și întorc listă goală; citirile de admin aruncă | build-ul CI și prerender-ul rulează fără bază de date; paginile publice trebuie să se genereze și atunci, iar adminul trebuie să vadă eșecul |
| 2026-09-13 | Node 24 (`engines.node` în `package.json`, CI pe 24) | `nodeVersion` din `vercel.json` fixa Node 18, depreciat; `engines` e mecanismul documentat de Vercel |
| 2026-09-13 | Aliasurile `@app/*`, `@i18n/*` înlocuiesc `@/*` | `@/*` amesteca rute, feature-uri și straturi sub un singur prefix; câte un alias per strat face granița vizibilă la import |
| 2026-09-13 | `requireAdmin` stă în `shared/session/`, nu în `features/auth/` | e chemat din `actions.ts` al fiecărui feature de admin; dacă ar sta în `auth`, fiecare feature ar importa un alt feature |
| 2026-09-13 | Header, Footer, MobileMenu, AdminSidebar stau în `app/_shell/` / `app/admin/_shell/`, nu în `shared/` | compun UI din mai multe feature-uri (ex. `NewsletterSignupForm`, `PartnersSlider`); `shared/` nu are voie să importe `features/` |
| 2026-09-13 | Calculatorul de leasing e propriul feature (`features/leasing`) | randează pe pagina publică `/leasing` fără citiri din backend; nu depinde de `site-settings` sau `partners` |
| 2026-09-13 | Statisticile dashboard-ului se compun în `app/admin/_dashboard/` din numărătorile fiecărui feature (`countCars`, `countReviews`, `countPartners`, `supabaseLeadsRepository.countLeads()`) | dashboard-ul nu are propriul feature; el doar agregă citiri expuse deja de `inventory`, `reviews`, `partners` și `leads` |
| 2026-09-13 | Reguli de import pe `core/`, `config/` și `shared/` în `eslint.config.mjs` | `core/` doar `@config/*`; `config/` nimic din proiect; `shared/` nici `@features/*`, nici `@app/*` — încheie granițele descrise în tabelul de mai sus |
