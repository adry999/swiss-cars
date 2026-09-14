# Audit cod — swiss-cars (2026-09-14)

**Ce s-a auditat:** branch `fix/rate-limit-eviction`, commit `378152f` (main `7ca5b27` + 3 commit-uri locale).

**Punct de pornire:** tsc 0 erori · eslint 0 erori / 27 warning-uri · vitest 174/174 · build OK.

**Metodă:**
- 4 agenți de citire: amprentă AI în `features/`, amprentă AI în `app/`+`shared/`+`core/`, cod mort (knip + eslint), structură.
- Toate constatările critice și importante le-am verificat manual în cod. Falsurile pozitive sunt eliminate.

**Legendă:**
- Severitate: 🔴 critic · 🟠 important · 🟢 minor.
- **Auto** = remedierea e safe-to-automate (mecanică, fără schimbare de comportament). **Manual** = cere decizie sau review.

## Rezumat

| Categorie | 🔴 | 🟠 | 🟢 |
|---|---|---|---|
| 1. Amprentă AI | 0 | 5 | 14 |
| 2. Cod nefolosit | 1 | 7 | 18 |
| 3. Structură | 0 | 6 | 4 |

**Pe scurt:** arhitectura de straturi e respectată (0 încălcări de graniță, 0 `../../`, teste colocate). Amprenta AI e concentrată în `site-settings` (UI de admin copiat) și în `app/[locale]` (metadata duplicată). Codul mort e mic, dar există un endpoint periculos și o integrare Sentry care pare activă și nu rulează.

**Priorități de remediere:**
1. 🔴 `app/api/seed-defaults/route.ts`: ștergere (orice cont logat poate rescrie homepage-ul).
2. 🟠 `database/archive/` cu scripturile SQL nesigure și dublura `supabase/migrations/`: curățare și o singură sursă de migrații.
3. 🟠 Sentry: decizie între integrare reală și ștergere; plus `tsx` lipsă din `package.json`.
4. 🟠 Duplicări mecanice (auto): `pickTranslation`, `buildLocalizedMetadata`, `DEFAULT_CONTENT` mutat în `model/`.
5. 🟠 `site-settings`: UI fără acces direct la date, `ui/` separat public/admin, `TranslatedFieldInputs` pentru cele 7 formulare.
6. 🟠 `app/[locale]/inventory/[slug]/page.tsx`: împărțire.
7. 🟠 Documentație învechită (`README.md`, `ACCESSIBILITY.md`, `ANALYTICS.md`).
8. 🟢 Cod mort mecanic (auto): 4 componente orfane, `shared/seo`, exporturi, importuri nefolosite, `favicon.png`, `@types/uuid`.
9. 🟢 Restul (limba admin-ului, stiluri inline, `LeadInbox`, tipizarea gărzii de admin).

---

## 1. Amprentă de AI

### 1.1 Cod defensiv / tipuri ocolite
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `shared/session/admin-role.ts:7` + `shared/session/require-admin.ts:35-36` | `hasAdminRole` e declarat type predicate (`user is User`). Pe ramura `false` TS îl îngustează greșit la `null`, iar `require-admin` compensează cu `user as User` și un comentariu fals („narrowed by the negative type guard”). | 🟢 | Garda să întoarcă `boolean` sau să verifice `!user` întâi; scoate cast-ul și comentariul. | Manual |
| `features/site-settings/server/site-settings-repository.ts:60-61` | `eslint-disable` + `(publicConfig as any)[key]` pentru o atribuire cu cheie dinamică. | 🟢 | Construiește obiectul cu `Object.fromEntries` peste `PUBLIC_KEYS` tipat. | Auto |

### 1.2 Over-engineering / wrapper-e fără rost
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `features/leads/ui/LeadInbox.tsx:34,36,48` | `toggleReadState`, `toggleImportance` și `markEveryLeadRead` doar pasează argumentele către funcțiile hook-ului. | 🟢 | Apelează direct `setReadState` / `setImportance` / `markAllRead`. | Auto |
| `features/leads/ui/LeadInbox.tsx:184` | Ternar cu ambele ramuri identice (`'action-btn action-btn-delete'`), deci logică moartă. | 🟢 | Păstrează un singur string sau o clasă distinctă pentru starea de confirmare. | Auto |
| `features/leads/ui/LeadInbox.tsx:41` | `setTimeout(() => setConfirmDelete(null), 3000)` fără cleanup: rulează după unmount, iar la click repetat se suprapun mai multe timere. | 🟢 | Ține timerul într-un `ref` și curăță-l în `useEffect`. | Manual |

### 1.3 Logică duplicată
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `features/site-settings/ui/AboutSection.tsx:12`, `ContactBanner.tsx:15`, `LeasingSection.tsx:12`, `StatsSection.tsx:14`, `WhyUsAccordion.tsx:12`, `ServicesSection.tsx:30`, `HeroSlider.tsx:56` | Helper-ul `getText(translations, fallback)` e rescris de 7 ori, cu variații mici. | 🟠 | Un singur `pickTranslation(field, locale)` în `shared/` (lângă `TranslatedField`). | Auto |
| `features/site-settings/ui/Homepage*Form.tsx` (7 fișiere) | Blocul de input RO/RU/EN e copiat cu același `style={{ width: '100%', padding: '8px', … }}` de **71 de ori**. | 🟠 | Componentă `TranslatedFieldInputs` + clasă CSS. | Manual (risc vizual) |
| `app/[locale]/layout.tsx:23-58`, `about/page.tsx`, `services/page.tsx`, `inventory/page.tsx`, `leasing/page.tsx`, `contact/page.tsx`, `inventory/[slug]/page.tsx` | Harta `{ro,ru,en}` de titlu/descriere, apoi `meta[locale] \|\| meta.ro`, apoi `localeAlternates` / `localeOpenGraph` / `localeTwitter`, repetat în 7 fișiere. | 🟠 | Helper `buildLocalizedMetadata(locale, path, copyByLocale)` în `i18n/`. | Auto |
| `features/inventory/ui/InventoryTable.tsx:33,43`, `PartnersTable.tsx:15`, `ReviewsTable.tsx:28`, `SubscribersTable.tsx:22` (+10× `alert(` în `features/*/ui`) | Același flux „`confirm()`, apoi action, apoi `alert` / refresh” copiat în 4 tabele. | 🟠 | Hook `useConfirmedAdminAction` care folosește Toast în loc de `alert`. | Manual |
| `app/[locale]/inventory/[slug]/page.tsx` (3× `<CarInquiryForm …>`) | Același bloc de props repetat de 3 ori: mobil, sidebar, banner. | 🟢 | Obiect de props comun sau un wrapper local. | Auto |
| `app/api/seed-defaults/route.ts:8-27` ↔ `app/admin/settings/page.tsx:5-18` | Valorile implicite ale `site_config` (telefon, email, titlu) sunt duplicate. | 🟢 | O singură constantă. Dispare oricum dacă ruta seed e ștearsă (vezi 2.5). | Auto |
| `features/partners/ui/PartnerForm.tsx:47-69` ↔ `features/reviews/ui/ReviewForm.tsx:49-71` | Același obiect de stil inline pentru banner-ul de eroare. Între timp există și `shared/ui/admin/FormErrorMessage.tsx`, nefolosit. | 🟢 | Folosește `FormErrorMessage` sau o clasă CSS. | Auto |

### 1.4 Comentarii naive / care povestesc istoria
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `i18n/routing.ts:44-49, 72-74` | JSDoc cu „Confirmed live: … og:url was simply absent…”, adică narațiune de investigație. | 🟢 | Păstrează doar regula (Next înlocuiește `openGraph` per segment). | Auto |
| `app/[locale]/inventory/[slug]/page.tsx:49-53` | Comentariu despre un bug trecut („The previous openGraph object…”). | 🟢 | O linie cu regula, fără istorie. | Auto |
| `app/[locale]/contact/page.tsx:11` = `app/[locale]/leasing/page.tsx:12` | Același TODO copiat identic în două fișiere. | 🟢 | Un singur item în backlog; rezolvă-l prin helper-ul de metadata. | Auto |
| `shared/seo/structured-data.ts:15,28` | Placeholder-e „Update with actual number” / „Street Address Here” / linkuri sociale false. | 🟢 | Dispar odată cu modulul (vezi 2.1). | Auto |

### 1.5 Denumiri, fișiere monolitice, stringuri amestecate
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `app/[locale]/inventory/[slug]/page.tsx` (359 linii, singurul fișier > 250) | Amestecă fetch de date, 2 scheme JSON-LD construite inline, rezolvarea descrierii pe limbă și markup duplicat. | 🟠 | Extrage schemele JSON-LD și rezolvarea descrierii în `features/inventory`; pagina rămâne compoziție. | Manual |
| `features/partners/ui/PartnerForm.tsx` (EN) ↔ `features/reviews/ui/ReviewForm.tsx` (RO); `SubscribersTable.tsx:107,125`; `SiteConfig*Section.tsx` | Admin-ul amestecă engleza cu româna, uneori în aceeași componentă. | 🟢 | Decizie de produs: o singură limbă pentru admin. | Manual |
| `features/inventory/ui/FavoriteCarsPage.tsx`, `SimilarCars.tsx:21-38`, `SubscribersTable.tsx`, `SiteConfig*Section.tsx`, `Homepage*Form.tsx` | Layout-uri întregi făcute cu `style={{…}}` inline, în timp ce componentele surori folosesc CSS Modules. | 🟢 | Migrare treptată la CSS Modules. | Manual (risc vizual) |

**Scor AI per zonă (0–10):** auth 0 · leasing 0 · notifications 0 · core 1 · config 1 · inventory 1 · i18n 2 · leads 2 · subscribers 2 · partners 3 · reviews 3 · shared 5 · site-settings 5 · app 6.

---

## 2. Cod și fișiere nefolosite

### 2.1 Fișiere orfane (verificat: zero importuri)
| Fișier | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `sentry.config.ts` + dependența `@sentry/nextjs` | Nu există niciun `instrumentation.ts` care să încarce config-ul, deci **Sentry nu rulează deloc**, deși pare configurat. | 🟠 | Decizie: integrare corectă (`instrumentation.ts` + `instrumentation-client.ts`) sau ștergerea fișierului și a dependenței. | Manual |
| `shared/seo/StructuredData.tsx` + `shared/seo/structured-data.ts` | Modul SEO nefolosit, cu date false. Paginile își construiesc JSON-LD-ul inline. | 🟠 | Șterge-l, sau mută schemele reale (din `page.tsx` / `[slug]/page.tsx`) aici și folosește-le. | Manual |
| `shared/ui/EmptyState.tsx`, `shared/ui/LoadingSpinner.tsx`, `shared/ui/admin/AdminPageHeader.tsx`, `shared/ui/admin/FormErrorMessage.tsx` | Componente fără niciun consumator. Le listează doar `CLAUDE.md`. | 🟢 | Șterge-le (sau folosește `FormErrorMessage` în 1.3) și actualizează `CLAUDE.md`. | Auto |
| `public/media/general/favicon.png` | Nereferențiat: favicon-ul vine din `app/icon.png` / `app/apple-icon.png`. | 🟢 | Șterge-l. | Auto |

### 2.2 Exporturi nefolosite
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `shared/formatting/format.ts:13` | `formatNumber` nu are niciun import. | 🟢 | Șterge funcția. | Auto |
| `features/inventory/server.ts:7` | `findSimilarCars` e exportat, dar singurul consumator (`ui/SimilarCars.tsx:2`) îl importă direct din repository. | 🟢 | Scoate-l din `server.ts`. | Auto |
| `features/inventory/index.ts:1` | `CarCard` e reexportat, dar toți consumatorii îl importă relativ, din interiorul feature-ului. | 🟢 | Scoate-l din `index.ts`. | Auto |
| `i18n/navigation.ts:4` | `redirect`, `useRouter`, `getPathname` nu sunt folosite (se folosesc doar `Link` și `usePathname`). | 🟢 | Destructurează doar ce e folosit. | Auto |
| `features/notifications/model/lead-alert-message.ts:15,24` | `escapeHtml`, `escapeTelegramMarkdown` sunt folosite doar intern. | 🟢 | Scoate `export`, dacă testele nu le importă. | Auto |
| Tipuri reexportate prin intrările publice: `features/leads/index.ts`, `notifications/index.ts`, `site-settings/index.ts`, `subscribers/admin.ts`, `inventory/index.ts` (`Car`, `PaginatedCars`, `CarCatalogFilters`, `HeroSlide`, `SiteConfig`, `NotificationConfig`, `LeadInbox*`, …) | Tipuri publice fără consumator extern. | 🟢 | Taie tipurile fără consumator; intrarea publică expune doar ce folosește `app/`. | Manual (convenție) |

### 2.3 Dependențe
| Pachet | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `@sentry/nextjs` | Folosit doar de `sentry.config.ts`, care e orfan (vezi 2.1). | 🟠 | Vezi 2.1. | Manual |
| `tsx` (lipsă) | `npm run seed` rulează `tsx`, dar pachetul nu apare în `package.json`. | 🟠 | Adaugă `tsx` în devDependencies sau șterge scriptul. | Manual |
| `@types/uuid` | Redundant: `uuid@13` are propriile tipuri. | 🟢 | Șterge devDependency-ul. | Auto |

### 2.4 Importuri și variabile nefolosite (eslint, 27 warning-uri)
| Fișier:linie | Problemă | Sev. | Auto? |
|---|---|---|---|
| `app/[locale]/about/page.tsx:5` | Iconițele `Search`, `ClipboardCheck`, `Truck` | 🟢 | Auto |
| `app/[locale]/page.tsx:1,22` · `app/[locale]/inventory/[slug]/page.tsx:1` | `getLocale` și `locale` | 🟢 | Auto |
| `app/admin/_shell/AdminLayoutClient.tsx:10` | `Image` | 🟢 | Auto |
| `features/site-settings/ui/ServicesSectionClient.tsx:4,8-15` | `useTranslations` + constanta moartă `SERVICES` (8 linii) | 🟢 | Auto |
| `features/site-settings/ui/WhyUsAccordionClient.tsx:7` | Constanta `ITEMS` | 🟢 | Auto |
| `features/inventory/ui/CarCard.tsx:16` · `FavoriteButton.tsx:16` | `locale`, parametrul `carSlug` | 🟢 | Auto |
| `features/inventory/actions.ts:30` · `features/reviews/actions.ts:29` · `features/inventory/server/car-admin-repository.ts:84` | Câmpuri destructurate doar ca să fie excluse (`created_at`, `updated_at`, `_sourceId`) | 🟢 | Manual (omit explicit) |
| `shared/ui/admin/ImageUploader.tsx:5,37` | `ImageIcon`, `data` | 🟢 | Auto |

### 2.5 Endpoint-uri, scripturi și fișiere rămase
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `app/api/seed-defaults/route.ts:1-219` | Endpoint marcat „ONE-TIME … DELETE AFTER USE”, încă activ. Verifică **doar că userul e logat** (`getUser`), nu rolul de admin. Face `upsert` necondiționat peste `homepage_content`, deci orice cont logat rescrie conținutul homepage-ului. Conține și ~180 de linii de conținut hardcodat. | 🔴 | Șterge ruta (a fost deja rulată: rândurile există în bază), sau cel puțin `requireAdmin()`. | Manual |
| `database/archive/*.sql` (10 fișiere) | Include `dev_public_policies.sql` și `storage_permissions_fix.sql`, care dau scriere publică pe tabele și pe bucket. Rulate din greșeală, anulează hardening-ul. | 🟠 | Șterge-le din repo (istoria rămâne în git). | Manual |
| `supabase/migrations/` (2 fișiere vechi) ↔ `database/*.sql` | Două surse de adevăr pentru schemă, neconsistente. | 🟠 | Consolidare pe migrații Supabase CLI (cerută oricum de `supabase gen types`). | Manual |
| `README.md:60-71,84,88` · `ACCESSIBILITY.md:93,154-170` · `ANALYTICS.md:47` | Descriu `lib/` și `components/`, care nu mai există. | 🟠 | Rescrie secțiunile de arhitectură după `CLAUDE.md`. | Manual |
| `app/[locale]/contact/page.tsx:11`, `leasing/page.tsx:12` | TODO: titlul și descrierea nu sunt localizate. | 🟢 | Se rezolvă prin helper-ul de metadata (1.3). | Manual |

Nu există blocuri mari de cod comentat.

---

## 3. Structură și modularitate

### 3.1 Straturile din feature-uri
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `features/site-settings/ui/AboutSection.tsx:2`, `ContactBanner.tsx:2`, `LeasingSection.tsx:2`, `ServicesSection.tsx:2`, `StatsSection.tsx:2`, `WhyUsAccordion.tsx:2`; `features/inventory/ui/SimilarCars.tsx:2` | Server Components din `ui/` citesc direct din `../server/*-repository`, deci stratul de UI face acces la date. | 🟠 | Componenta de UI primește datele ca props, iar citirea se face în pagină sau într-un modul `server/`. Alternativ, mută componentele în `server/` și documentează excepția. | Manual |
| `features/site-settings/ui/` (17 fișiere) | Același folder conține secțiunile publice de homepage și 11 formulare de admin (`SiteConfig*`, `Homepage*Form`). | 🟠 | `ui/public/` și `ui/admin/` (intrarea `admin.ts` există deja). | Manual (mutări) |
| `features/site-settings/server.ts:5-10` | Intrarea `server.ts` exportă și citirile din repository, și 6 componente de UI. | 🟢 | Rezolvat împreună cu primul rând din tabel. | Manual |
| `features/site-settings/ui/HomepageContentForm.tsx:17-85` | Un `DEFAULT_CONTENT` de 70 de linii, cu text de marketing, stă în componenta de formular. | 🟠 | Mută-l în `features/site-settings/model/default-homepage-content.ts`. Poate înlocui și copia din `seed-defaults` (2.5). | Auto |
| `features/leads/server.ts:5` + `app/admin/page.tsx:2,11`, `app/admin/leads/page.tsx:5,19`, `app/admin/_dashboard/read-dashboard-stats.ts:3,11` | Rutele de admin apelează direct metodele obiectului `supabaseLeadsRepository`. Celelalte feature-uri expun funcții de citire cu nume (`countCars`, `listAllPartners`). Folosirea ca port în `app/_composition` e corectă. | 🟢 | Exportă `listRecentLeads`, `readInboxPage` și `countLeads` ca funcții, iar repository-ul rămâne doar pentru compunere. | Manual |

### 3.2 Fișiere de împărțit
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `app/[locale]/inventory/[slug]/page.tsx:1-359` | Metadata, JSON-LD (93-149), rezolvarea descrierii pe limbă (77-91) și cardul de preț cu formular, repetat de 3 ori (180-211, 288-322, 328-347). | 🟠 | Schemele SEO și rezolvarea descrierii merg în `features/inventory/model`; cardul devine o componentă `CarPurchaseCard`. | Manual |
| `features/inventory/ui/CarGallery.tsx` (223 linii) | Lightbox, focus trap, navigare din tastatură și carusel, toate în aceeași componentă. | 🟢 | Hook-uri `useFocusTrap` / `useGalleryKeyboard`. | Manual |

### 3.3 Fragmentare de unificat
| Fișier:linie | Problemă | Sev. | Recomandare | Auto? |
|---|---|---|---|---|
| `features/site-settings/ui/Homepage{Hero,About,Stats,Services,Leasing,ContactBanner,WhyUs}Form.tsx` | 7 formulare cu aceeași structură (secțiune + câmpuri RO/RU/EN cu stiluri inline copiate). | 🟠 | Un renderer de câmpuri pornind de la o listă declarativă, sau cel puțin `TranslatedFieldInputs` + CSS module (vezi 1.3). | Manual |
| `features/site-settings/ui/*Section.tsx` (`getText`) | Vezi 1.3: același helper de 7 ori. | 🟠 | `pickTranslation` în `shared/contracts/translated-field.ts`. | Auto |

### 3.4 Coupling, aliasuri, API public, teste
- **Coupling între feature-uri:** 0 încălcări. `eslint no-restricted-imports` e verde și niciun import `@features/<x>/(ui|server|model)/` nu apare din afara feature-ului.
- **Aliasuri:** zero importuri `../../`, inclusiv în teste și CSS. Garda pentru `@/` în importuri dinamice e activă.
- **API public:** `app/_shell` și `app/admin/_shell` compun corect intrările publice ale feature-urilor. Tipurile nefolosite din intrările publice sunt la 2.2.
- **Teste:** toate colocate, cu pragma `node` pe cele de server și fixture-uri doar în `test-support/`. Fără încălcări.
- **Eficiență (minor):** `ContactBanner.tsx:9-10` și `StatsSection.tsx:9-10` așteaptă secvențial două citiri independente; merg în paralel cu `Promise.all`.

---

## Falsuri pozitive eliminate la verificare
- „`shared/ui/admin/DataTable.tsx` nu e folosit”: **fals**, e importat de cele 4 tabele de admin.
- „`seed-defaults` e protejat de rolul de admin”: **fals**, verifică doar `getUser()`.
- „`LeadInbox.tsx:184` e un bug critic”: e doar un ternar mort, fără efect vizibil (trecut la minor).

## Stare remediere

Faza 1 (`docs/superpowers/plans/2026-09-14-audit-remediation-phase-1.md`), finalizată pe branch-ul `refactor/audit-remediation-phase-1`:

| Audit | Remediere |
|---|---|
| 2.5 | seed-defaults șters, database/archive șters |
| 2.3 | tsx adăugat, @types/uuid scos |
| 1.3 | getText înlocuit de pickTranslation, metadata unificată prin localizedPageMetadata (+ RU/EN pentru leasing și contact) |
| 3.1 | DEFAULT_CONTENT mutat în model |
| 2.1 | componente orfane, shared/seo și favicon.png șterse |
| 2.2 | exporturile nefolosite eliminate |
| 2.4 | warning-urile no-unused-vars eliminate |
| 1.2 | LeadInbox: wrapper-ele pass-through, ternarul mort și timer-ul fără cleanup rezolvate |
| 1.4 | comentariile care povesteau bug-uri trecute rescrise ca reguli |

Notă la 2.4: warning-ul `no-unused-vars` din `sentry.config.ts` (`SENTRY_AUTH_TOKEN`) rămâne — vezi follow-up A.

Rămân pentru planurile următoare: A–F de mai jos.
