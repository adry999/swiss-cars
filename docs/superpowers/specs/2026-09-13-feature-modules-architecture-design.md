# SwissCars.md — arhitectură pe feature-uri și plan de migrare incrementală

**Data:** 2026-09-13
**Branch pilot:** `refactor/feature-modules-pilot`
**Convenții înregistrate:** `.claude/skills/project-conventions/SKILL.md`
**Revizuiește:** non-goal-ul „No folder restructure to `features/`” din `2026-05-27-incremental-modular-refactor-design.md`. Pașii de dinainte de lansare de acolo sunt livrați. Site-ul e live, iar lipsa granițelor a produs deja duplicare (fluxul de lead implementat de două ori) și cod mort (`lib/utils/errors.ts`).

---

## 1. Starea actuală

### 1.1 Stack

| Zonă | Tehnologie |
|---|---|
| Framework | Next.js 16.3 App Router, React 19.2, `proxy.ts` în loc de middleware |
| Limbaj | TypeScript strict |
| Date | Supabase (Postgres, RLS, RPC `submit_lead`, Storage, Auth) prin `@supabase/ssr` |
| State | fără store global: citiri în Server Components, `useState` local, context React doar pentru Toast |
| Validare / formulare | Zod 4, react-hook-form (admin) |
| i18n | next-intl 4 — `ro` fără prefix, `ru`, `en` |
| Teste | Vitest 4 + Testing Library (jsdom), Playwright (nu rulează în CI) |
| Integrări | Vercel, Upstash Redis, Sentry, Resend, Telegram Bot API |
| CI | typecheck → test → lint → audit → build |

### 1.2 Ce respectă deja principiile

- Importuri pe alias: 199 cu `@/`, zero cu `../../`.
- Zero `export *`. Barrel-uri doar în `components/ui/` și `components/admin/`.
- Doar două fișiere peste 250 de linii: `app/admin/settings/SettingsForm.tsx` (562), `lib/supabase/queries.ts` (385).
- Securitate stratificată: `requireAuth()` în fiecare mutație, RLS, RPC pentru inserturi anonime, CSP și headere de securitate.
- Testele unitare stau lângă cod, cu nume orientate pe comportament.
- Comentariile existente explică de ce, nu ce.
- Setările publice sunt separate de credențiale (`getPublicSiteConfig`).

### 1.3 Ce nu respectă

| Principiu | Dovadă |
|---|---|
| Structură feature-driven | Un domeniu e împrăștiat în foldere tehnice. Leads: `lib/actions/leads.ts`, `lib/types/index.ts`, `components/cars/detail/CarLeadForm.tsx`, `components/contact/`, `app/admin/leads/`, `app/api/contact/route.ts`. |
| O responsabilitate per fișier | `lib/supabase/queries.ts` servește cinci domenii; `lib/types/index.ts` ține schemele tuturor; `SettingsForm.tsx` are 562 de linii. |
| Straturi separate | Pagini care interoghează Supabase direct (`app/admin/leads/page.tsx`, `app/[locale]/inventory/[slug]/page.tsx`) în paralel cu `queries.ts`. Componente client care importă acțiuni direct. |
| Izolare între module | `components/home → components/cars` (4 importuri), `components/layout → components/cars` (1). Nicio regulă de lint pe granițe. |
| Fără duplicare | Fluxul „rate limit → validare → RPC → notificări” scris de două ori, cu scheme și chei de rate limit diferite. |
| Model unic de erori | Trei convenții în `lib/actions/*`: throw, `{ success, error }`, `{ success: false }` fără mesaj. `AppError` nu e folosit nicăieri. Mesajele românești hardcodate pe server ajung și la utilizatorii ru/en. |
| Configurare pe mediu | `process.env` citit direct în 11 fișiere, fără validare. |
| Testare izolată | Patru fișiere de test unitar, nicio componentă de domeniu testată. Fără porturi injectabile, codul de server nu se poate testa fără mock-uri de modul. |
| Convenții Git | `GIT_WORKFLOW.md` nu impune un format; istoria amestecă `feat:` fără scope cu mesaje libere. |

### 1.4 Defecte găsite în analiză (reparate în pilot)

1. `lib/utils/requireAuth.ts` avea `'use server'`, deci `requireAuth` era un endpoint POST public.
2. Rate limiting-ul pe Upstash nu a funcționat. `@upstash/redis` deserializează JSON automat (`automaticDeserialization` e implicit activ), iar codul făcea `JSON.parse` pe obiectul primit. Asta arunca la fiecare cerere și ducea la fallback în memorie, separat pe fiecare instanță.
3. Escaping-ul MarkdownV2 pentru Telegram nu trata `\`, iar `)` din URL-ul linkului nu era escapat. Telegram respinge astfel de mesaje, deci alerta se pierdea.
4. Ora din alertă era afișată în UTC, fusul funcțiilor Vercel.

### 1.5 Tree actual (condensat)

```text
swiss-cars/
├── app/                          # rute App Router
│   ├── [locale]/                 # site public ro/ru/en: home, inventory, contact, leasing, favorites...
│   ├── admin/                    # dashboard; tabelele client (LeadsTable, CarsTable...) stau lângă pagini
│   ├── api/contact/              # POST formular contact (duplica fluxul de lead)
│   ├── api/seed-defaults/        # seed one-time
│   ├── auth/callback/, login/
│   └── layout.tsx, error.tsx, not-found.tsx, sitemap.ts, robots.ts
├── components/                   # UI grupat pe zone de pagină, nu pe domeniu
│   ├── admin/                    # formulare CRUD, homepage/, car-edit/, DataTable, ImageUploader
│   ├── cars/                     # list/, detail/ (inclusiv CarLeadForm), CarCard, favorite
│   ├── home/  layout/  contact/  leasing/  analytics/  SEO/
│   └── ui/                       # Pagination, Toast, EmptyState, LoadingSpinner...
├── lib/
│   ├── actions/                  # 7 fișiere 'use server', câte unul pe domeniu
│   ├── supabase/                 # clienți + queries.ts monolitic
│   ├── settings/                 # site_settings + credențiale notificări
│   ├── types/index.ts            # scheme Zod pentru toate domeniile
│   ├── utils/                    # errors (nefolosit), format, notifications, rateLimit, requireAuth, sanitize
│   └── styles/components.css
├── i18n/  messages/              # next-intl
├── database/  supabase/          # SQL, migrări, RPC
├── e2e/                          # Playwright
└── proxy.ts  next.config.ts  vitest.config.ts  eslint.config.mjs
```

---

## 2. Arhitectura țintă

### 2.1 Tree țintă

Actualizat pe 2026-09-13 la finalul migrării — acesta e tree-ul real din `refactor/feature-modules-pilot`, nu doar planul inițial.

```text
swiss-cars/
├── app/                                  # rutare + composition root
│   ├── _composition/                     # singurul cod care leagă feature-uri între ele
│   │   ├── lead-inquiry-submission.ts    # event bus, rate limiter, abonarea notificărilor
│   │   └── lead-inquiry-actions.ts       # Server Action public pentru formulare
│   ├── _shell/                           # Header, Footer, MobileMenu — compun feature-uri pentru site-ul public
│   ├── [locale]/…/page.tsx               # pagini subțiri: date prin @features/<x>/server, UI din @features/<x>
│   ├── admin/
│   │   ├── _shell/                       # AdminSidebar, AdminLayoutClient
│   │   ├── _dashboard/                   # dashboard-stats.ts (compunere pură), read-dashboard-stats.ts (citiri per feature)
│   │   └── …/page.tsx
│   └── api/…/route.ts                    # adaptoare HTTP peste use case-uri
├── features/
│   ├── auth/                             # login, callback, sign-in / sign-out
│   ├── inventory/                        # mașini (listare, filtre, detaliu, CRUD admin, imagini) + favorite
│   ├── leads/                            # formular mașină, trimitere, inbox admin
│   ├── leasing/                          # calculatorul public de leasing (fără server)
│   ├── notifications/                    # alerte Telegram și email
│   ├── partners/
│   ├── reviews/
│   ├── site-settings/                    # site_config, homepage_content, formulare admin
│   ├── subscribers/                      # newsletter (formular footer + admin)
│   └── translations/                     # editorul de mesaje i18n (eliminat ulterior, vezi §11 punctul 6)
├── shared/
│   ├── contracts/                        # domain-events.ts, action-result.ts, translated-field.ts
│   ├── session/                          # adminul curent, requireAdmin (shared kernel)
│   ├── ui/                                # Pagination, Toast, EmptyState, LoadingSpinner, Preloader, Reveal, WhatsAppFloat, admin/{DataTable,ImageUploader,AdminPageHeader,FormErrorMessage}, styles/components.css
│   ├── formatting/                       # format (formatPrice, formatNumber), sanitize
│   ├── seo/                               # StructuredData, structured-data
│   └── analytics/                        # GoogleAnalytics, GTMScript
├── core/
│   ├── events/event-bus.ts
│   ├── http/client-ip.ts
│   ├── rate-limit/                       # limiter + store Upstash
│   └── supabase/                         # clienți server, browser, sesiune proxy
├── config/
│   ├── server-environment.ts
│   └── public-environment.ts             # NEXT_PUBLIC_*, referite literal pentru inlining
├── i18n/  messages/                      # rămân (infrastructură next-intl)
├── e2e/                                  # Playwright, nerulat în CI — nu s-a mutat în tests/e2e/ (vezi §11)
├── database/  supabase/                  # rămân
└── proxy.ts  next.config.ts  …
```

Nu mai există `lib/`, `components/`, `tests/` sau feature-ul separat `features/favorites` (favoritele au rămas în `features/inventory`, vezi Decision log).

### 2.2 Rolul folderelor principale

| Folder | Rol | Nu conține |
|---|---|---|
| `app/` | URL-uri, metadata, layout-uri, `loading/error/not-found`; pagini care compun UI și citiri | reguli de business, query-uri Supabase |
| `app/_composition/` | leagă feature-uri: porturi, evenimente, `after()`, Server Actions cross-feature | UI, query-uri |
| `features/` | câte un folder per capabilitate de business, auto-conținut | cod folosit de alt feature |
| `shared/contracts/` | tipuri cunoscute de mai multe feature-uri | implementări |
| `shared/session/` | cine e utilizatorul curent și dacă e admin | UI de login |
| `shared/ui`, `shared/layout` | UI fără domeniu, shell-ul site-ului | importuri din `features/` |
| `core/` | infrastructură fără cunoștințe de domeniu | nume de tabele de business, texte |
| `config/` | citirea și validarea variabilelor de mediu | logică |
| `tests/` | E2E și fake-uri comune | teste unitare (acelea stau lângă cod) |

### 2.3 Direcția dependențelor

```text
app/  (rute, app/_composition)
  │   feature-uri doar prin @features/<x>, /server, /actions
  ▼
features/<x>   ──✗──  features/<y>
  │
  ▼
shared/  ──►  core/  ──►  config/
```

Aplicate de `eslint.config.mjs`:

| Fișiere | Interzis |
|---|---|
| `features/**` | `@features/**` (orice alt feature, inclusiv propriul feature prin alias), `@/app/**`, `../../*` |
| `core/**`, `shared/**`, `config/**` | `@features/**`, `@/app/**`, `@/components/**` |
| `app/**`, `components/**`, `lib/**` | `@features/<x>/<intern>` în afara `server` și `actions` |

Verificate cu importuri de probă prin `eslint --stdin` în pilot. `core → shared` și `config → core` nu sunt încă blocate; intră în regulă la pasul 10.

### 2.4 Anatomia unui feature (convenția Next.js)

```text
features/<feature>/
├── index.ts             # client-safe: componente, hook-uri, tipuri
├── server.ts            # import 'server-only': use case-uri, repository
├── actions.ts           # 'use server': Server Actions proprii
├── <feature>.types.ts
├── <feature>.schema.ts
├── model/               # reguli pure
├── server/              # I/O și use case-uri
├── ui/
├── test-support/
└── README.md
```

De ce trei puncte de intrare:

- `index.ts` e importat și de componente client. Dacă ar reexporta un repository, bundle-ul client ar trage `next/headers`.
- `server.ts` e marcat `server-only`, deci un import greșit dintr-un client component pică la build, nu în producție.
- `actions.ts` are `'use server'`: fiecare export devine endpoint POST public. Dacă ar sta în `server.ts`, și helper-ele ar deveni endpoint-uri (cazul `requireAuth`).

---

## 3. Modulul independent — `features/notifications`

**Scop:** transformă un lead salvat într-o alertă Telegram și/sau email.

```text
features/notifications/
├── index.ts                                # server-only: notifier, canale, tipuri
├── notifications.types.ts                  # LeadAlertChannel (port), LeadAlertDeliveryReport
├── model/lead-alert-message.ts (+ test)    # formatare pură: MarkdownV2, HTML, subiect, URL sigur, fus orar
├── server/lead-alert-notifier.ts (+ test)  # fișierul cheie: fan-out pe canale, nu aruncă
├── server/telegram-lead-alert-channel.ts   # adaptor Bot API
├── server/resend-lead-alert-channel.ts     # adaptor Resend
├── server/lead-alert-channels.test.ts
├── test-support/lead-inquiry-submitted.ts
└── README.md
```

**De ce e independent:**

- Nu importă niciun feature. Singura dependență de domeniu e tipul `LeadInquirySubmitted` din `shared/contracts/domain-events.ts`.
- Nu citește configurația. Credențialele intră ca argumente în `createTelegramLeadAlertChannel` și `createResendLeadAlertChannel`, iar `app/_composition` decide ce canale există.
- Nu se abonează singur la evenimente, deci poate fi apelat din orice alt flux (CRM, cron) fără modificări.
- `fetch` e injectabil, deci canalele se testează fără rețea.

---

## 4. Modulul dependent — `features/leads`

**Scop:** trimiterea unei cereri de la client (formularul unei mașini, pagina de contact, `/api/contact`) și inbox-ul din admin.

```text
features/leads/
├── index.ts                                   # client-safe: CarInquiryForm, useLeadInquirySubmission, tipuri
├── server.ts                                  # server-only: createSubmitLeadInquiry, supabaseLeadsRepository
├── actions.ts                                 # 'use server': acțiunile inbox-ului, toate cu requireAuth
├── leads.types.ts                             # LeadInquiryDraft, LeadsRepository (port), Lead, ActionResult-uri
├── leads.schema.ts                            # Zod, limite egale cu submit_lead()
├── server/submit-lead-inquiry.ts (+ test)     # fișierul cheie de server: rate limit → validare → salvare → eveniment
├── server/supabase-leads-repository.ts        # RPC submit_lead + citiri/mutații inbox
├── ui/use-lead-inquiry-submission.ts (+ test) # fișierul cheie de client: stare idle/submitting/succeeded/failed
├── ui/CarInquiryForm.tsx (+ css, test)
├── test-support/lead-inquiry-drafts.ts
└── README.md
```

**De ce depinde de alte module și cum rămâne decuplat:**

| Are nevoie de | Primește prin | Legat în |
|---|---|---|
| limitare pe IP | port `RateLimiter` (`@core/rate-limit`) | `app/_composition/lead-inquiry-submission.ts` |
| anunțarea altor module | port `EventPublisher<DomainEvents>` + contractul din `shared/contracts` | idem |
| alerte Telegram/email | nimic: `leads` nu știe că există notificări | abonare în composition root |
| persistență | port `LeadsRepository` (implementarea proprie) | idem |
| sesiune admin | `@/lib/utils/requireAuth` (tranzitoriu → `shared/session`) | — |

**Fluxul unei cereri:**

```text
CarInquiryForm (client)
  └─ prop submitLeadInquiry ◄── pagina Server Component pasează submitLeadInquiryAction
       ▼
app/_composition/lead-inquiry-actions.ts ('use server')
  └─ getSubmitLeadInquiry()  (compus o dată, la prima cerere)
       ▼
features/leads/server/submit-lead-inquiry.ts
  1. rateLimiter.consume('lead:<ip>')        → rejected: rate-limited
  2. LeadInquiryDraftSchema.safeParse         → rejected: invalid-input (+ invalidFields)
  3. leadsRepository.insertInquiry (RPC)      → rejected: unavailable
  4. eventPublisher.publish('leads.inquiry-submitted', payload)
       └─ subscriber din app/_composition → after(() => notifier.notifyLeadSubmitted(payload))
  5. succeeded
       ▼
useLeadInquirySubmission → errors.rate_limited | errors.invalid_input | errors.submit_error
```

Un consumator nou al unui lead (analytics, CRM) înseamnă o linie `eventBus.subscribe` în composition root. Nici `leads`, nici `notifications` nu se modifică.

---

## 5. Erori și stări de ecran

| Nivel | Pattern |
|---|---|
| Server, eroare așteptată | `ActionResult<Reason>` întors ca valoare (conform `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`) |
| Server, eroare neașteptată | excepție → `app/error.tsx`, `app/[locale]/error.tsx`, `app/admin/error.tsx` |
| Repository | `Error` cu `cause`; mesajul driverului rămâne în log |
| Route Handler | 400 invalid, 429 limită, 500 indisponibil; body `{ error, invalidFields? }` |
| Client, trimitere | `idle | submitting | succeeded | failed`, iar `failed` e `rejected` sau `unreachable` |
| Client, mesaje | chei `errors.*` în toate cele trei locale |
| Încărcare rută | `loading.tsx` per segment |
| Liste | `empty` e o stare distinctă de `failed` (repository-ul aruncă, nu întoarce `[]` la eroare) |

---

## 6. Strategia de testare

- Testele unitare și de integrare stau lângă cod: `x.test.ts(x)`.
- Codul de server rulează cu `// @vitest-environment node`; componentele rulează în jsdom.
- Fixture-urile unui feature stau în `<feature>/test-support/`, iar fake-urile comune în `tests/support/`.
- Porturile (`RateLimiter`, `EventPublisher`, `LeadsRepository`, `fetchImpl`) se injectează ca fake-uri. `vi.mock` rămâne pentru framework, în `test-setup.ts`.
- Fiecare garanție se testează în stratul care o oferă:
  - în `core`: limiter-ul și bus-ul;
  - în `model`: escaping-ul și formatarea;
  - în use case: ordinea rate limit → validare → salvare → eveniment;
  - în hook: tranzițiile de stare;
  - în E2E: formularul real pe preview.
- Aliasurile Vitest se generează din `tsconfig.json`, deci există o singură sursă de adevăr.

---

## 7. Configurare pe mediu

| Mediu | Unde stau valorile | Diferență |
|---|---|---|
| local | `.env.local` | integrările fără credențiale rămân dezactivate |
| staging | Vercel Preview (valori pe scope Preview) | Telegram poate trimite într-un chat de test |
| producție | Vercel Production | — |

- `config/server-environment.ts`:
  - e marcat server-only și validează cu Zod;
  - întoarce un obiect înghețat, citit leneș și memoizat;
  - credențialele parțiale înseamnă integrare dezactivată;
  - o valoare malformată aruncă o eroare cu numele variabilei, fără valoarea ei.
- `config/public-environment.ts` (pasul 2) va conține `NEXT_PUBLIC_*` referite literal, ca Next să le poată insera în bundle.
- Nu există ramuri `if (environment === 'staging')`.

---

## 8. Convenții Git

- Conventional Commits: `type(scope): subject`, la imperativ, în engleză. `scope` = feature sau strat.
- Fără referințe la AI sau agenți și fără `Co-Authored-By`.
- Mutările de fișiere și schimbările de comportament merg în commit-uri separate.

Commit-uri sugerate pentru pilot, în ordine:

```text
build(tooling): add layer aliases, import boundaries and server-only
feat(config): validate server environment variables in one module
refactor(core): extract event bus, client ip and rate limiter
fix(core): store rate-limit usage as objects in Upstash
fix(auth): stop exposing requireAuth as a server action
refactor(notifications): extract lead alerts into a feature module
refactor(leads): move lead submission and inbox into a feature module
feat(leads): translate lead form errors on the client
docs(architecture): record feature modules design and conventions
```

În pilot, două fișiere sunt deopotrivă mutate și modificate: `CarInquiryForm` (din `CarLeadForm`) și rate limiter-ul. La commit, mutarea se face întâi cu `git mv`, fără modificări de conținut.

---

## 9. Plan de migrare

Fiecare pas se termină cu `npm run verify`, `npm run build`, lista rutelor din build neschimbată și testul manual pe un Vercel Preview al fluxului atins. Fiecare pas e un PR separat.

| # | Pas | Ce se mută | Ce rămâne | Risc | Verificare specifică |
|---|---|---|---|---|---|
| 0 | Fundație ✅ | aliasuri, reguli ESLint, Vitest din tsconfig, `server-only`, `config/server-environment`, `core/{events,http,rate-limit}`, `shared/contracts` | tot restul | scăzut | probe ESLint, teste core/config |
| 1 | Pilot leads + notifications ✅ | `lib/actions/leads.ts`, `lib/utils/notifications.ts`, `lib/utils/rateLimit.ts`, `CarLeadForm`, citirile din `app/admin/leads/page.tsx`, `/api/contact` rescris | UI-ul inbox (`LeadsTable`) rămâne în `app/admin/leads` | **mediu–ridicat**: fluxul care aduce clienți | pe Preview: formular mașină, contact, test drive; alerta Telegram și emailul; inbox; al 6-lea submit/minut primește `rate_limited` |
| 1b | Inbox leads ✅ | `LeadsTable` → `features/leads/ui/LeadInbox` prin punctul de intrare nou `@features/leads/admin`; rollback per schimbare când `ActionResult` e `rejected` sau acțiunea aruncă | — | scăzut | `use-lead-inbox.test.ts` (6 teste) |
| 2 | `core/supabase` + `config/public-environment` ✅ | `lib/supabase/{server,client,middleware}.ts` → `core/supabase/{server-client,browser-client,proxy-session}.ts`; verificarea rolului de admin unificată în `shared/session/admin-role.ts` (proxy, layout admin, `requireAuth`) | `queries.ts` (se desface la pașii 4 și 6) | mediu: `proxy.ts` reîmprospătează sesiunea admin | teste `public-environment`, `admin-role`; verificare izolată pe commit |
| 3 | `shared/session` + `features/auth` ✅ | **Făcut:** `getUser` → `shared/session/current-user.ts` (`getCurrentUser`); login și `signIn`/`signOut` → `features/auth`; `signIn` validează pe server și întoarce `ActionResult`, fără să mai expună mesajul Supabase sau userul; `requireAuth` → `shared/session/require-admin.ts` (`requireAdmin`) | rutele `/login`, `/auth/callback` | **ridicat**: securitate | teste schema credențiale; E2E redirect neautentificat |
| 4 | `features/inventory` (include favoritele) ✅ | **Făcut:** mașinile, favoritele, `CarEditForm` + tab-uri și tabelul admin → `features/inventory`; componentele nefolosite (`CarList`, `CarFilters`, `ActiveFilters`) șterse; scrierile (`saveCar`, `deleteCar`, `duplicateCar`) mutate într-un repository și întorc `ActionResult` în loc să arunce spre client | URL-urile `/inventory/[slug]`, `generateStaticParams`, cheia `localStorage` `swisscars_favorites` | **ridicat**: SEO, prerender | lista de rute statice din build identică; sitemap identic; teste storage URL și favorite |
| 5 | ~~`features/favorites`~~ | inclus în pasul 4 (vezi Decision log din `project-conventions`) | — | — | — |
| 6 | `features/reviews`, `features/partners` ✅ | **Făcut:** ambele mutate ca feature-uri module; `listAllPartners` acum include partenerii ascunși în admin (puteau fi ascunși dar nu mai reafișați); `saveReview`/`deleteReview`/`savePartner`/`deletePartner` întorc `ActionResult` | — | scăzut | teste scheme mutate din `lib/types` |
| 7 | `features/subscribers` ✅ | **Făcut:** formularul din Footer și administrarea abonaților mutate în `features/subscribers`; `subscribe` rămâne public, fără rate limit (vezi §11) | — | scăzut | submit newsletter pe Preview |
| 8 | `features/site-settings` ✅ | **Făcut:** `site_config` și `homepage_content` (citiri și formulare) mutate în `features/site-settings/server`; fallback-ul de credențiale din DB rămâne activ (vezi §11) | — | mediu: credențiale | alertă Telegram cu doar variabile de mediu |
| 9 | `features/translations` ✅ | **Făcut:** editorul de mesaje mutat în `features/translations`; `saveLocaleMessages` întoarce `ActionResult` | — | scăzut | editare cheie pe Preview |
| 10 | `shared/ui`, `shared/layout`, `shared/formatting` ✅ | **Făcut:** restul din `lib/` și `components/` mutat în `shared/`, `app/_shell/` (Header, Footer, MobileMenu) și `app/admin/_shell/` (AdminSidebar); statisticile dashboard-ului compuse în `app/admin/_dashboard/` din citirile fiecărui feature, în loc de `queries.ts` (șters) | — | mediu: multe importuri | lint cu regulile `core → shared` blocate |
| 11 | Curățenie ✅ | **Făcut:** `lib/`, `components/`, aliasul `@/*` (înlocuit cu `@app`, `@i18n`) și `lib/utils/errors.ts` șterse; reguli de lint pe straturi pentru `core/`, `config/`, `shared/`; `e2e/` mutat în `tests/e2e/`; `CLAUDE.md`, `GIT_WORKFLOW.md`, README-urile și `project-conventions` actualizate. **Rămas deschis:** `Lead` și `Car` rămân tipuri scrise manual — generarea cu `supabase gen types` cere baza de date pornită (vezi §11) | — | scăzut | `npm run verify`, build, `playwright test --list` |

**Ce nu se schimbă în niciun pas:** URL-urile publice, schema bazei de date, RPC-urile și RLS, setup-ul next-intl (`i18n/`, `messages/`), CSS Modules, `proxy.ts` ca punct de intrare, headerele de securitate, pipeline-ul CI, Vitest și Playwright.

---

## 10. Schimbări de comportament introduse de pilot

1. **Alertele** Telegram și email pleacă după răspuns (`after`). Formularul răspunde mai repede, iar pe Vercel livrarea e ținută în viață de `waitUntil`.
2. **Rate limiting-ul** pe Upstash funcționează efectiv:
   - cheia nouă e `rate-limit:lead:<ip>`;
   - formularul de mașină, pagina de contact și `/api/contact` împart aceeași limită de 5 cereri pe minut per IP (înainte aveau găleți separate).
3. **Mesajele de eroare** ale formularelor vin din `messages/*.json` în limba paginii, nu din text românesc trimis de server.
4. **Pagina de contact** trimite prin Server Action. `/api/contact` păstrează body-ul și statusurile (429, 400, 500), iar la 400 adaugă `invalidFields`. O cerere cu `formType: 'inquiry'` fără mașină e acum respinsă.
5. **Textul alertei:**
   - „Data preferată” are rând propriu;
   - eticheta e „Mașină” sau „Solicitare”;
   - ora e în fusul `Europe/Chisinau`;
   - escaping-ul MarkdownV2 e complet;
   - subiectul emailului e text simplu, pe un singur rând.
6. **Inbox admin:** o eroare de bază de date la citire ajunge la `app/admin/error.tsx`, în loc să afișeze silențios o listă goală. Acțiunile validează UUID-ul și întorc `ActionResult`.
7. **`requireAuth`** nu mai e endpoint public.
8. **`getNotificationConfig`:** o pereche Telegram incompletă în variabilele de mediu nu se mai combină cu valori din DB; se folosește perechea din DB întreagă.
9. **`signIn`** nu mai întoarce userul — doar `ActionResult<'invalid-input' | 'invalid-credentials'>`; validarea are loc pe server, nu doar în formular.
10. **`getUser`, `getSubscribers` și `getI18nMessages`** nu mai sunt Server Actions. Sunt funcții server-only (`getCurrentUser` în `shared/session`, `listSubscribers` în `features/subscribers/server`, `readLocaleMessages` în `features/translations/server`) — un export dintr-un fișier `'use server'` e un endpoint POST public, iar acestea întorc date care nu trebuie expuse așa (lista de abonați, un fișier de mesaje protejat de `requireAdmin`).
11. **`/admin/partners`** listează acum și partenerii ascunși (`listAllPartners`), ca să poată fi făcuți din nou vizibili — înainte, un partener ascuns dispărea din admin.
12. **Eșecul numărătorilor de pe dashboard** ajunge la `app/admin/error.tsx` în loc să afișeze tăcut `0`.
13. **Tabelele de recenzii și parteneri din admin** afișează o alertă la un `delete` sau o schimbare de vizibilitate eșuate, în loc să eșueze silențios.
14. **Erorile la abonare** (`subscribe`) sunt traduse pe client din `errors.*`, nu text hardcodat.

---

## 11. Riscuri și decizii deschise

1. **`index.ts` cu mai multe componente client** — rezolvat: fiecare feature cu UI de admin are propriul punct de intrare `@features/<x>/admin`, ca UI-ul de admin să nu intre în manifestul client al paginilor publice.
2. **Rate limiter-ul nu e atomic** (citire, apoi scriere). Rafalele pot depăși puțin limita. Înlocuirea cu `@upstash/ratelimit` e un pas separat, pentru că adaugă o dependență. Fallback-ul în memorie crește fără limită pe instanțele Fluid Compute cu viață lungă.
3. **CSP-ul** permite `unsafe-eval` și `unsafe-inline`. Nu ține de arhitectură, dar e în registrul de riscuri.
4. ~~**`subscribe` (newsletter) nu are rate limit**~~ — rezolvat: `createSubscribeToNewsletter` (`features/subscribers/server/subscribe-to-newsletter.ts`) consumă 5 abonări la 10 minute per IP din limiterul comun `getRateLimiter()` (`core/rate-limit/shared-rate-limiter.ts`), folosit și de lead-uri.
5. ~~**`saveSettings(key, value)` acceptă orice cheie și orice valoare nevalidată**~~ — rezolvat: înlocuit de `saveSiteConfig` / `saveHomepageContent`, fiecare cu schema din `features/site-settings/site-settings.schema.ts`; cheile din afara `SiteConfigSchema` nu mai sunt scrise în rând.
6. ~~**Editorul de traduceri scrie pe sistemul de fișiere**~~ — rezolvat prin eliminare: `features/translations` și `/admin/translations` au fost șterse, pentru că pe Vercel sistemul de fișiere e read-only și nepersistent. Mesajele din `messages/*.json` se schimbă prin repository și deploy.
7. **Tipurile `Lead` și `Car`** rămân scrise manual, nu generate cu `supabase gen types`.
8. **Fallback-ul de credențiale din `site_config`** rămâne în `getNotificationConfig()` până când rândul e confirmat curat de credențiale.

---

## 12. Verificarea pilotului

Rulată pe 2026-09-13 în branch-ul `refactor/feature-modules-pilot`. Modificările nu sunt încă commit-uite.

| Verificare | Rezultat |
|---|---|
| `npx tsc --noEmit` | 0 erori |
| `npx vitest run` | 15 fișiere, 119 teste, toate trec |
| `npx eslint .` | 1 eroare, `lib/utils/structured-data.ts:1` (`no-explicit-any`), identică pe `main` și în afara pilotului; 0 erori în fișierele atinse. Warning-urile rămase (`getLocale` în `inventory/[slug]/page.tsx`, `LinkIcon` și `unreadCount` în `LeadsTable.tsx`) existau deja. |
| `npm run build` cu variabilele placeholder din CI | trece; 34 de rute în `.next/app-path-routes-manifest.json`, `app/_composition` nu apare ca rută, `/api/contact` există |
| Probe ESLint pe granițe | import între feature-uri, `../../`, import intern în feature din `app/` și `@features` din `core/`: toate respinse; `@features/leads`, `/server`, `/actions` din `app/`: permise |
| Flux real (Supabase, Telegram, Resend) | **neverificat**: baza de date e în pauză local. De făcut pe un Vercel Preview înainte de merge (pasul 1 din tabelul din secțiunea 9). |

### 12.1 Verificarea finală a migrării (2026-09-13)

Fiecare commit din `git log main..refactor/feature-modules-pilot` a fost verificat izolat, într-un worktree separat la acel commit: `tsc --noEmit`, `eslint . --quiet`, `vitest run`. Toate au trecut. Numărul de teste crește monoton de la 66 (primul commit) la 165.

Pe starea finală:

| Verificare | Rezultat |
|---|---|
| `npx tsc --noEmit` | 0 erori |
| `npx eslint . --quiet` | 0 erori (inclusiv eroarea `no-explicit-any` care exista pe `main`) |
| `npx vitest run` | 28 de fișiere, 165 de teste |
| `npm run build` cu variabilele placeholder din CI | trece; 34 de rute, niciun folder privat (`_composition`, `_shell`, `_dashboard`) expus ca rută |
| `npx playwright test --list` | 12 teste în `tests/e2e/` |
| Probe ESLint pe straturi | `core → @shared`, `config → @core`, `shared → @features`, `features → @app` și importul intern într-un feature din `app/` sunt respinse; `shared → @core` e permis |
| `lib/`, `components/`, `@/*` | nu mai există |
| Flux real în browser, cu bază de date | **neverificat** (bază de date în pauză) |
