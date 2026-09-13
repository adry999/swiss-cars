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

```text
swiss-cars/
├── app/                                  # rutare + composition root
│   ├── _composition/                     # singurul cod care leagă feature-uri între ele
│   │   ├── lead-inquiry-submission.ts    # ✅ event bus, rate limiter, abonarea notificărilor
│   │   └── lead-inquiry-actions.ts       # ✅ Server Action public pentru formulare
│   ├── [locale]/…/page.tsx               # pagini subțiri: date prin @features/<x>/server, UI din @features/<x>
│   ├── admin/…/page.tsx
│   └── api/…/route.ts                    # adaptoare HTTP peste use case-uri
├── features/
│   ├── leads/                            # ✅ pilot — formular mașină, trimitere, inbox admin
│   ├── notifications/                    # ✅ pilot — alerte Telegram și email
│   ├── inventory/                        # mașini: listare, filtre, detaliu, CRUD admin, imagini
│   ├── favorites/                        # favorite în localStorage (fără server)
│   ├── reviews/
│   ├── partners/
│   ├── subscribers/                      # newsletter (formular footer + admin)
│   ├── site-settings/                    # site_config, homepage_content, formulare admin
│   ├── translations/                     # editorul de mesaje i18n
│   └── auth/                             # login, callback, sign-in / sign-out
├── shared/
│   ├── contracts/                        # ✅ domain-events.ts, action-result.ts
│   ├── session/                          # adminul curent, requireAdmin (shared kernel)
│   ├── ui/                               # din components/ui + lib/styles/components.css
│   ├── layout/                           # Header, Footer, MobileMenu; primesc slot-uri, nu importă feature-uri
│   └── formatting/                       # formatPrice, formatNumber, sanitizeHtml, structured data
├── core/
│   ├── events/event-bus.ts               # ✅
│   ├── http/client-ip.ts                 # ✅
│   ├── rate-limit/                       # ✅ limiter + store Upstash
│   └── supabase/                         # din lib/supabase: clienți server, browser, static, sesiune
├── config/
│   ├── server-environment.ts             # ✅
│   └── public-environment.ts             # NEXT_PUBLIC_*, referite literal pentru inlining
├── i18n/  messages/                      # rămân (infrastructură next-intl)
├── tests/
│   ├── e2e/                              # din e2e/
│   └── support/                          # fake-uri reutilizabile între feature-uri
├── database/  supabase/                  # rămân
└── proxy.ts  next.config.ts  …
```

`✅` = există deja în branch-ul pilot.

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
| 1b | Inbox leads | `LeadsTable` → `features/leads/ui/LeadInbox`; rollback la optimistic update când `ActionResult` e `rejected` | — | scăzut | test hook inbox; verificarea chunk-urilor paginilor publice (vezi 11.1) |
| 2 | `core/supabase` + `config/public-environment` | `lib/supabase/{server,client,middleware}.ts` | `queries.ts` | mediu: `proxy.ts` reîmprospătează sesiunea admin | E2E admin login; build |
| 3 | `shared/session` + `features/auth` | `requireAuth` → `requireAdmin` în `shared/session`; `lib/actions/auth.ts`, `app/login` UI → `features/auth` | rutele `/login`, `/auth/callback` | **ridicat**: securitate | teste pe rol (`app_metadata.role`); E2E redirect neautentificat |
| 4 | `features/inventory` | funcțiile de mașini din `queries.ts`, `lib/actions/cars.ts`, `components/cars/*`, `CarEditForm`, `ImageUploader`, tabelul admin. Sub-pași: 4a citiri publice, 4b CRUD admin, 4c imagini | URL-urile `/inventory/[slug]`, `generateStaticParams` | **ridicat**: SEO, prerender | lista de rute statice din build identică; sitemap identic; E2E public |
| 5 | `features/favorites` | `FavoriteButton`, `FavoritesPageClient`, `FavoritesIcon`; cardul vine ca slot din pagină | — | scăzut | test localStorage |
| 6 | `features/reviews`, `features/partners` | `lib/actions/content.ts` împărțit, formulare, slider-e | — | scăzut | teste scheme mutate din `lib/types` |
| 7 | `features/subscribers` | `lib/actions/subscribers.ts`, formularul din Footer (acțiunea ajunge ca prop) | — | scăzut | submit newsletter pe Preview |
| 8 | `features/site-settings` | `lib/settings`, `SettingsForm` împărțit pe secțiuni, `HomepageForm`; eliminarea fallback-ului de credențiale din DB după confirmarea că rândul `site_config` e curat | — | mediu: credențiale | alertă Telegram cu doar variabile de mediu |
| 9 | `features/translations` | `lib/actions/translations.ts`, `TranslationsEditor` | — | scăzut | editare cheie pe Preview |
| 10 | `shared/ui`, `shared/layout`, `shared/formatting` | `components/ui`, `components/layout`, `lib/utils/{format,sanitize,structured-data}`, `lib/styles`; `getDashboardStats` în `app/admin` compus din citirile fiecărui feature | — | mediu: multe importuri | lint cu regulile `core → shared` blocate |
| 11 | Curățenie | ștergerea `lib/`, `components/`, a aliasului `@/*` și a `lib/utils/errors.ts`; `e2e/` → `tests/e2e/`; tipuri Supabase generate (`supabase gen types`) în loc de `Lead` scris manual; actualizare `CLAUDE.md`, `GIT_WORKFLOW.md` | — | scăzut | `npm run verify`, build, E2E |

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

---

## 11. Riscuri și decizii deschise

1. **`index.ts` cu mai multe componente client.** Un Server Component care importă un singur export poate include în manifestul client și celelalte componente reexportate. De măsurat la pasul 1b, pe chunk-urile paginilor publice. Dacă UI-ul de admin ajunge acolo, se adaugă punctul de intrare `@features/<x>/admin`.
2. **Rate limiter-ul nu e atomic** (citire, apoi scriere). Rafalele pot depăși puțin limita. Înlocuirea cu `@upstash/ratelimit` e un pas separat, pentru că adaugă o dependență. Fallback-ul în memorie crește fără limită pe instanțele Fluid Compute cu viață lungă.
3. **`vercel.json` fixează `nodeVersion: "18.x"`**, depreciat pe Vercel. Trebuie `24.x`, într-un PR separat de refactorizare.
4. **CSP-ul** permite `unsafe-eval` și `unsafe-inline`. Nu ține de arhitectură, dar e în registrul de riscuri.
5. **Tipul `Lead`** e scris manual. Se înlocuiește cu tipuri generate la pasul 11.
6. **Fallback-ul de credențiale din `site_config`** rămâne până la pasul 8.

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
