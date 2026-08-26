# SwissCars.md — Follow-up Project Audit

**Audit date:** August 27, 2026  
**Baseline:** `c3af459` (the commit reviewed by the August 26 audits)  
**Current revision:** `831c2ad`  
**Change set:** 4 commits, 59 files, 3,830 insertions, 1,213 deletions  
**Previous reports:** `PROJECT_AUDIT.md` and `docs/2026-08-26-full-project-audit.md`

## Executive summary

The four new commits make meaningful progress. The most dangerous application-level credential leak is closed, administrator mutations now check a real role, the regex sanitizer has been replaced, notification content is safer, translation parity is tested, the invalid page-number bug is fixed, and the project now has a basic CI workflow. Automated results also improved: tests increased from 44 to 54, source lint errors fell from 72 to 55, and production dependency findings fell from 11 to 3.

The project is still not release-ready. Several security fixes exist only as manually executed SQL files while the documented fresh-database setup still creates the insecure policies. A new car-image save order conflicts with the new unique-primary-image index and can make normal car edits fail. The new multilingual URLs are reachable, but the sitemap is 404, desktop navigation loses the selected language, most localized pages publish the wrong canonical URL, and the outer document language remains Romanian. The installed Next.js version also has current high-severity advisories.

The practical assessment is **improved but still medium-low production readiness**. Do not deploy the current four commits without fixing the release blockers and verifying the actual Supabase policies and migrations.

## Scope and limitations

This follow-up examined the repository changes between `c3af459` and `831c2ad`, reviewed all four commits, reran the automated checks, and started the production build locally for route-level validation.

The production Supabase dashboard and deployed site were not available. SQL files prove intended database changes, not that those changes are active in production. The Supabase hostname configured in the local environment did not resolve during this audit, so live queries and database policy behavior could not be exercised.

## Change overview

| Commit | Intent | Assessment |
|---|---|---|
| `d38d6a5` | Credential isolation, admin roles, sanitizer and notification hardening | Strong application changes; database protection still depends on manual deployment |
| `e070518` | GA, translations, SEO, storage cleanup, CI, dependencies | Useful progress; SEO has several regressions and dependencies remain vulnerable |
| `73e26b2` | Replace anonymous table inserts with RPCs | Direct arbitrary inserts are reduced if deployed, but direct RPC abuse and migration drift remain |
| `831c2ad` | Dialog semantics, focus management, reduced motion | Mostly beneficial; the gallery introduces focus stealing and still lacks a focus trap |

## Verification results

| Check | Current result | Previous result | Assessment |
|---|---:|---:|---|
| `npm run typecheck` | Passed | Passed | Stable |
| `npm test` | 54 tests / 5 files passed | 44 tests / 4 files | Improved |
| `npm run test:coverage` | 93.44% lines over imported files | About 93.5% over imported files | Still misleadingly narrow |
| `npm run lint` | Failed: 55 errors, 33 warnings including generated coverage | Failed: 72 errors, 34 source warnings | Improved, still failing |
| Source-only lint | 55 errors, 32 warnings across 37 files | 72 errors, 34 warnings | 17 errors and 2 warnings removed |
| `npm audit --omit=dev` | 3 high findings | 11 findings: 7 high, 3 moderate, 1 low | Improved, still a release blocker |
| `npm run build` | Passed, 43 routes | Passed | Build hides data-source failure |

Coverage currently includes only `Pagination.tsx`, `lib/types`, and `rateLimit.ts` in its report. The percentage is not whole-project coverage.

### Runtime route checks

- `/`, `/ru`, `/en`, and all seven checked public pages per locale returned 200.
- `/admin` redirected unauthenticated traffic to `/login`.
- `/sitemap.xml` returned 404 after being rewritten to `/ro/sitemap.xml`.
- `/robots.txt` returned 404.
- `/ru/about` contained an outer `<html lang="ro">`, a second nested `<html lang="ru">`, and two `<body>` elements.
- `/ru/about` published `https://swisscars.md/ru` as its HTML canonical instead of `/ru/about`.
- The Russian desktop header linked Inventory to `/inventory`; the mobile header correctly linked to `/ru/inventory`.
- Rendering every About page logged `MISSING_MESSAGE: about.contact_label`, even though the new locale-parity test passed.
- Database-backed pages returned 200 with empty content while repeatedly logging DNS failures for the configured Supabase hostname.

## Release blockers

### 1. The documented database setup still installs the insecure policies

**Severity: Critical until the deployed database is verified**

The new hardening is in:

- `database/2026-08-26_security_hardening.sql`
- `database/2026-08-26_lead_subscriber_rpc.sql`

However, `README.md:107` still tells a new operator to run only `database/SETUP_NEW_DB.sql`. That setup file still creates:

- write access for every authenticated user on cars and other admin tables;
- anonymous direct inserts into leads and subscribers;
- public storage uploads;
- a public read policy over complete settings rows.

Several other legacy SQL files also recreate insecure policies, including `database/dev_public_policies.sql`, `database/storage_fix.sql`, `database/storage_permissions_fix.sql`, `database/default_content_seed.sql`, and `database/fix_missing_tables.sql`.

Consequences:

- A fresh deployment following the README remains vulnerable.
- The live site remains vulnerable if the two new SQL files were not manually executed.
- A future operator can accidentally undo the hardening by running an older “fix” script.
- Source code and documentation can claim security that the database does not enforce.

Required fix:

1. Create one canonical, ordered migration path.
2. Integrate both hardening migrations into fresh setup.
3. Move dangerous historical/development scripts into a clearly quarantined archive or delete them after preserving history in Git.
4. Add a database verification script that fails if unexpected policies or grants exist.
5. Query `pg_policies`, function grants, storage policies, and admin JWT behavior against the real Supabase project before deployment.

### 2. Editing a car can violate the new one-primary-image constraint

**Severity: High functional regression**

`lib/actions/cars.ts:91-121` now inserts all replacement image rows before deleting the existing rows. The goal was to preserve old images if the insert fails. At the same time, `database/2026-08-26_security_hardening.sql:264` adds a unique partial index allowing one `is_primary = true` row per car.

For an existing car that already has a primary image, inserting its replacement primary image occurs while the old primary row still exists. PostgreSQL rejects the insert with a unique constraint violation. This can block routine edits even when the image list did not meaningfully change.

The operation also remains non-transactional: a new car can be created without its images, and failures after inserting new image rows can leave duplicates or partial state.

Required fix:

- Move car and image persistence into a PostgreSQL function/transaction.
- Update existing image rows by ID where possible.
- If replacing the full set, temporarily clear/delete the old primary within the same transaction before inserting the new primary.
- Add integration tests for create, edit without image changes, primary-image replacement, image removal, duplicate car, insert failure, and storage-cleanup failure.

### 3. Production dependencies still contain three high-severity findings

**Severity: High**

The current production tree reports high findings through:

- `next@16.1.6`
- Next's bundled `postcss@8.4.31`
- Next's bundled `sharp@0.34.5`

The current audit data includes Next.js middleware/proxy bypass, SSRF, denial-of-service, and related advisories. The reported non-major resolution is Next.js `16.3.3`.

The previous package update was worthwhile—DOMPurify and several tools were upgraded, reducing the production count from 11 to 3—but it did not upgrade Next itself.

Required fix:

- Upgrade `next` and `eslint-config-next` together to a patched compatible release.
- Reinstall from a clean lockfile state with `npm ci`.
- Run typecheck, all tests, lint, build, route smoke tests, image optimization tests, admin authentication tests, and Server Action tests.
- Do not treat the CI audit as protective while it uses `--audit-level=critical`; current high findings do not fail that step.

### 4. The configured Supabase endpoint does not resolve

**Severity: High operational risk; environment-specific**

Both build-time and runtime queries failed DNS resolution for the Supabase hostname configured in the local environment. Direct DNS resolution failed while the base `supabase.co` domain resolved normally.

The application catches these errors and returns empty arrays/objects. Therefore:

- the build passes;
- every checked public route returns 200;
- inventory, settings, partners, reviews, and homepage content can silently disappear;
- CI with placeholder credentials also exercises only the fallback behavior, not a real database contract.

Required fix:

- Verify the project reference and deployment environment values.
- Add a dedicated environment/health check that distinguishes “empty table” from “database unreachable.”
- Fail deployment or emit a visible operational alarm when the production database cannot be reached.
- Run a staging build against a real disposable Supabase project with the migrations applied.

## High and medium findings introduced or exposed by the changes

### 5. The repaired sitemap is unreachable

**Severity: High SEO regression**

`app/sitemap.ts` now generates locale-aware entries correctly, but `proxy.ts:30` sends `.xml` requests through next-intl. Runtime evidence:

```text
GET /sitemap.xml -> rewrite /ro/sitemap.xml -> 404
```

The sitemap improvement therefore has no effect for crawlers. `robots.txt` is also absent/404.

Fix the matcher or add an early bypass for `/sitemap.xml`, `/robots.txt`, and other nonlocalized metadata routes. Add a smoke test that asserts status, content type, and representative URLs.

### 6. Desktop navigation exits Russian and English

**Severity: High conversion/UX regression**

Changing `localePrefix` from `never` to `as-needed` makes locale-aware navigation mandatory. Mobile navigation uses the next-intl `Link`, but `components/layout/Header.tsx:73-78` still uses a plain `<a href={link.href}>`.

On `/ru/about`, the desktop Inventory link is `/inventory`, which switches the visitor back to Romanian. Mobile correctly emits `/ru/inventory`.

Replace the desktop anchor with the imported next-intl `Link` and add locale navigation tests for every header/footer link.

### 7. Nested document elements keep the visible document language Romanian

**Severity: Medium-high accessibility and SEO**

The prior audit's nested-layout issue remains:

- `app/layout.tsx` renders `<html lang="ro"><body>`.
- `app/[locale]/layout.tsx` renders another `<html lang={locale}><body>`.
- `app/admin/layout.tsx` renders another document shell.

Runtime source for `/ru/about` contains two HTML and two body elements. The outer, effective document starts with `lang="ro"`, so Russian and English pages are announced as Romanian to assistive technology and language detection.

Keep one root document shell per route tree. Either let `app/layout.tsx` own it and make nested layouts return providers/fragments, or reorganize route groups so each route tree has one valid root layout.

### 8. Canonical, hreflang, Open Graph, and Twitter metadata disagree

**Severity: Medium-high SEO**

The locale layout calls `localeAlternates(locale)` with no page path. Child pages such as About, Services, Leasing, Contact, and Favorites do not override alternates. Consequently `/ru/about` emits a canonical for `/ru`, not `/ru/about`.

The middleware's HTTP `Link` header did include `/ru/about`, so the HTTP and HTML signals conflict. The root Open Graph URL and Romanian Twitter metadata are also inherited on several Russian/English pages.

Inventory and car detail pages provide path-specific alternates and are better. Apply the same pattern to every indexable page and test the generated HTML rather than only helper functions.

### 9. RPCs close arbitrary table inserts but remain directly abuseable

**Severity: Medium-high**

The new `submit_lead()` and `subscribe_email()` functions are a useful improvement when deployed. They validate essential fields and permit removal of blanket anonymous insert policies.

They are still granted directly to `anon`, so callers can bypass the application's in-memory IP limiter and invoke them without limit. Newsletter subscription has no application rate limit either. The SQL file acknowledges this gap.

There is also validation drift:

- `/api/contact` accepts messages up to 5,000 characters.
- `submit_lead()` rejects messages over 2,000.

A 2,001–5,000 character contact message therefore passes Zod and fails as a 500 database error. The database RPC also does not validate `source_url` as an HTTP(S) URL and does not bound every text input consistently.

Use one shared contract, add durable rate limiting or Turnstile, and test direct anonymous RPC invocation.

### 10. The settings RLS policy cannot filter secrets inside a JSON value

**Severity: Medium security hardening gap**

`getPublicSiteConfig()` correctly strips non-public fields before serializing settings into client components. Removing `getSettings()` from the Server Action file also closes the unauthenticated action path.

The SQL comment claiming that the policy exposes only allowlisted settings keys is misleading. `USING (key IN (...))` filters table rows; it cannot filter fields inside the `value` JSON object. If a future save accidentally puts `telegram_bot_token` back into the public `site_config` value, an anonymous REST query can read it.

The migration's one-time deletion is necessary but is the only database-side protection. Prefer separate public and secret tables/columns, revoke anonymous access to the full JSON row, or expose a tightly controlled public view/RPC.

### 11. CI can pass with lint failure and high dependency vulnerabilities

**Severity: Medium**

The new workflow is a good start, but:

- lint has `continue-on-error: true` while 55 source errors remain;
- dependency audit uses `--audit-level=critical`, so the three high findings pass;
- the build uses placeholder Supabase credentials and validates fallback rendering rather than database compatibility;
- there are no migration checks, E2E tests, route smoke tests, or accessibility tests.

Keep the workflow, add a ratchet that prevents new lint findings immediately, then make lint fully blocking. Block high production advisories unless a reviewed exception exists.

### 12. Admin routing checks authentication, not the administrator role

**Severity: Medium defense-in-depth/UX**

Mutation actions now correctly call `requireAuth()` and check `app_metadata.role === 'admin'`. Intended RLS policies repeat the check. However, `proxy.ts` and `app/admin/layout.tsx` admit any authenticated user because the layout calls `getUser()`, not `isAdmin()`.

With the database migration applied, a non-admin should see empty/error states rather than mutate data, but they can still enter the admin shell and trigger protected queries. Redirect non-admin users to a forbidden/login page and test all three states: anonymous, authenticated non-admin, and admin.

### 13. Gallery focus management introduces focus stealing

**Severity: Medium accessibility regression**

`components/cars/detail/CarGallery.tsx:44-50` focuses the expand button whenever `isOpen` is false. Effects run after the initial mount, so opening a car page can unexpectedly move keyboard focus into the gallery.

The lightbox also moves focus to the close button but does not trap Tab inside the modal or make the background inert. The mobile menu implementation does include a focus trap and is substantially better.

Track whether the dialog was previously open before restoring focus, and implement a complete dialog pattern or use a tested dialog primitive.

### 14. Translation parity passes while runtime translation use is broken

**Severity: Medium**

The new parity test correctly ensures that all three JSON files contain identical key sets. It does not check whether code references keys that exist.

`app/[locale]/about/page.tsx:154` requests `about.contact_label`, but `contact_label` exists under `car_detail`, not `about`. Every locale logs `MISSING_MESSAGE`, and the supplied `defaultValue` option is not a valid fallback in this usage. The About hero subtitle is also still hardcoded in Romanian.

Add a static usage check where feasible and route rendering tests for every locale. At minimum, smoke-render all public pages and fail on next-intl missing-message errors.

### 15. New critical paths have no tests

**Severity: Medium**

The ten added tests cover sanitizer bypasses and locale key parity. There are still no tests for the riskiest new behavior:

- public/private settings separation;
- administrator role enforcement;
- RLS and SQL function grants;
- lead/subscriber RPC behavior and validation parity;
- car/image save ordering and storage cleanup;
- localized navigation and metadata;
- sitemap and robots routes;
- gallery/mobile-menu keyboard behavior;
- notification Markdown and email rendering.

The high coverage percentage should not be used as a release metric until coverage includes the application rather than only imported test targets.

## Confirmed improvements

The following changes are valuable and should be retained:

### Security

- Public components now receive a `PublicSiteConfig` allowlist rather than the full settings object.
- Settings reads were removed from the `use server` action module.
- Notification credentials moved to server environment variables in the UI and application design.
- All privileged Server Actions now use an administrator-role check.
- Proposed RLS policies use signed `app_metadata`, not editable `user_metadata`.
- DOMPurify replaces the bypassable handwritten sanitizer, with regression tests for the known payloads.
- Notification functions receive validated lead data rather than the raw request object.
- Email notification fields and URLs are escaped/validated.
- Telegram now uses the MarkdownV2 mode matching its escape function.
- GTM and GA identifiers are validated before script interpolation.
- Database driver details are no longer returned to lead-form clients.

### Correctness and localization

- GA reads the documented environment variable.
- Russian now has the same JSON key set as Romanian and English.
- Car lead-form copy and similar-car headings are translated.
- Invalid, zero, and negative inventory page numbers are clamped.
- Missing car images render a deliberate fallback instead of a nonexistent asset.
- Notification requests are awaited rather than left as floating promises.
- The duplicate newsletter lookup is moved into a database function.

### Performance and maintainability

- Repeated settings reads can deduplicate within a React request.
- Dashboard statistics use database counts instead of downloading all rows.
- Similar cars are queried in the database rather than filtering the entire inventory in memory.
- Storage cleanup checks remaining references before removing objects.
- Proposed indexes and `updated_at` triggers address real database gaps.
- `npm test` is now deterministic and `typecheck`, watch, coverage, and verify scripts exist.
- A GitHub Actions workflow now exercises typecheck, tests, lint, audit, and build.

### Accessibility

- Mobile-menu semantics, Escape handling, focus trapping, focus restoration, and inert hidden content are improved.
- The gallery has dialog semantics, Escape support, conditional controls, and better image labels.
- The hero has a pause control and stops autoplay for reduced-motion users.
- Global Framer Motion configuration respects the user's reduced-motion preference.

## Original audit status

| Original area | Status after changes |
|---|---|
| Telegram token serialized into public React payload | Fixed in application code |
| Unauthenticated settings Server Action | Fixed |
| Any authenticated user can call admin mutations | Fixed in actions; database depends on migration; admin shell still admits non-admins |
| Regex sanitizer bypasses | Fixed with upgraded DOMPurify and tests |
| Notifications use unvalidated input | Fixed |
| Telegram Markdown mode mismatch | Fixed, but notification formatting lacks dedicated tests |
| Direct anonymous lead/subscriber table inserts | Partially fixed; requires migration and RPC remains unlimited |
| Public storage writes | Proposed migration fixes it; canonical setup still reintroduces it |
| Invalid inventory page parsing | Fixed |
| Russian missing JSON keys | Fixed for parity; runtime code still requests a nonexistent namespace key |
| GA environment mismatch | Fixed |
| Sitemap locale URLs | Generator improved, but route currently returns 404 |
| Multilingual indexable URLs | Added, with navigation/document/canonical regressions |
| Car storage orphan cleanup | Improved |
| Car/image atomicity | Not fixed; new save order conflicts with unique index |
| Dashboard full-table counts | Fixed |
| Repeated settings queries | Improved per request, no durable cache/revalidation strategy |
| Nested `<html>/<body>` | Not fixed |
| Production translation file writes | Not fixed |
| Distributed rate limiting/CAPTCHA | Not fixed |
| Login and newsletter rate limiting | Not fixed |
| Public seed route | Not explicitly gated; relies on RLS |
| Lint debt | Reduced but still 55 errors |
| Meaningful integration/E2E coverage | Not fixed |
| Vulnerable dependencies | Reduced but still 3 high production findings |

## Documentation inconsistencies

- `README.md:53` still says the localized route has “no URL prefix,” while the later i18n section correctly documents `as-needed` prefixes.
- The environment-variable table omits `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `NOTIFICATION_EMAIL`, despite later calling them environment-only configuration.
- Documentation calls notification credentials environment-only, but `getNotificationConfig()` still has a temporary database fallback.
- README database setup does not instruct operators to run the two new hardening migrations.
- `requireAuth.ts` comments refer to `database/2026-08-26_admin_role.sql`, which does not exist; the role policy is in `2026-08-26_security_hardening.sql`.

## Recommended remediation order

### Before the next deployment

1. Fix `saveCar()` image persistence and make the operation transactional.
2. Upgrade Next.js and `eslint-config-next` to a patched compatible version.
3. Consolidate database setup/migrations and verify the actual production policies and function grants.
4. Verify/repair the Supabase deployment endpoint and add a real health check.
5. Exclude sitemap/robots from locale middleware; add `robots.ts`; verify both routes return the correct content types.
6. Replace desktop internal anchors with locale-aware links.
7. Remove nested document shells so locale pages emit one correct `<html lang>`.
8. Add path-specific canonical/hreflang/OG/Twitter metadata for every public page.
9. Align API and RPC lead schemas and add durable abuse protection.

### Next stabilization pass

10. Redirect authenticated non-admins out of the admin application.
11. Fix `about.contact_label`, remove remaining hardcoded Romanian public copy, and route-smoke-test every locale.
12. Correct gallery focus restoration and add complete lightbox focus containment.
13. Add tests for settings isolation, authentication/authorization, car transactions, RPCs, metadata, sitemap, and navigation.
14. Reduce lint findings with a no-regression CI ratchet, then make lint blocking.
15. Make high production dependency advisories fail CI.

### Structural work still required

16. Replace runtime translation-file writes with persistent storage or a deployment-backed content workflow.
17. Replace in-memory rate limiting with a durable distributed mechanism and add bot protection.
18. Add database constraints for core car and lead fields and make migrations repeatable and observable.
19. Add staging E2E tests for the lead conversion path and the full admin inventory lifecycle.
20. Add error monitoring, database health monitoring, notification delivery monitoring, and privacy-safe analytics events.

## Final assessment

The changes address many of the right problems and show a clear improvement over the August 26 baseline. The security work is strongest at the TypeScript/application layer. The weakest point is deployment truth: the repository now contains secure migration intentions and insecure canonical setup instructions at the same time.

The next iteration should focus less on adding more fixes and more on making the existing fixes coherent, transactional, deployed, and tested. Once the database setup is canonical, the car-image regression is fixed, Next is patched, and the multilingual runtime output is corrected, the project will be much closer to a dependable production dealership platform.

---

*Generated from repository diff review, TypeScript, ESLint, Vitest, coverage, npm audit, production build, DNS validation, and local production-route smoke tests on August 27, 2026.*
