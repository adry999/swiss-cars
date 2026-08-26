# SwissCars Project Audit

**Audit date:** August 26, 2026  
**Project:** SwissCars.md  
**Stack:** Next.js 16, React 19, Supabase, next-intl, Zod, Vitest, Framer Motion  
**Audit type:** Architecture, code quality, security, database, reliability, SEO, UX, testing, deployment, and product review

## Executive summary

SwissCars is a multilingual car-dealership and lead-generation platform for Swiss-imported vehicles sold in Moldova. It includes:

- A Romanian, Russian, and English public website.
- A vehicle inventory with detail pages and favorites.
- Contact, test-drive, and vehicle-inquiry forms.
- A leasing calculator.
- Reviews, partners, homepage content, and site configuration.
- An authenticated administration panel for inventory, leads, subscribers, reviews, partners, settings, and translations.
- Supabase database, authentication, and image storage.

The project has a useful commercial foundation and a clear visual direction. TypeScript compilation and the production build complete, and all existing tests pass. However, the application is not yet production-safe. The most urgent problems are publicly readable notification secrets, insufficient administrator authorization, vulnerable dependencies, bypassable anti-spam controls, unreliable database error handling, and contradictory multilingual URL behavior.

Production readiness should be considered **low until the critical and high-priority findings are resolved**.

No application source files were modified as part of this audit.

## What the project should do at its best

SwissCars should become more than a basic listing website. Its strongest product position would be a transparent, trustworthy platform for purchasing and importing verified vehicles from Switzerland.

At its best, it should:

- Present an accurate, fast, searchable, multilingual inventory.
- Prove vehicle quality with VIN information, mileage verification, inspection evidence, service history, documents, and damage disclosures.
- Convert visitors through phone, WhatsApp, appointments, leasing requests, trade-ins, and import-to-order requests.
- Explain the complete import process and expected costs clearly.
- Let staff manage the entire sales pipeline through a reliable CMS and CRM.
- Track lead source, ownership, status, follow-ups, and conversion.
- Rank well in Romanian, Russian, and English search results.
- Protect customer data, administrator access, and third-party credentials.

The best commercial differentiator is **trust through evidence**: verified mileage, transparent history, inspection reports, predictable import costs, and visible delivery progress.

## Audit scope and checks performed

The audit covered:

- Repository structure and documentation.
- Public routes and components.
- Admin routes, forms, and server actions.
- Supabase clients, queries, schema, migrations, RLS, and storage policies.
- Authentication and authorization.
- Lead, contact, subscriber, and notification flows.
- Internationalization, metadata, sitemap, and robots configuration.
- Image handling and storage lifecycle.
- Dependency health.
- Unit tests, TypeScript, ESLint, coverage, production build, and local runtime behavior.

Checks executed:

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed |
| `npm run build` | Completed, but with many suppressed Supabase failures |
| `npm test -- --run` | 44 tests passed across 4 test files |
| `npm run test:coverage -- --run` | Passed; reported coverage is limited to the small tested/imported scope |
| `npm run lint` | Failed with 106 findings: 72 errors and 34 warnings |
| `npm audit` | 20 total vulnerabilities: 3 critical, 11 high, 3 moderate, 3 low |
| `npm audit --omit=dev` | 11 production vulnerabilities: 7 high, 3 moderate, 1 low |
| Local route probes | Confirmed locale redirects, invalid pagination acceptance, missing placeholder, and admin redirect |

The configured Supabase hostname could not be reached from the audit environment. Therefore, live database contents and the currently deployed RLS state were not verified. Database findings are based on the repository's SQL setup and migration files, which are the declared source of truth for new deployments.

## Priority overview

| Priority | Finding | Impact |
|---|---|---|
| Critical | Public settings can expose Telegram credentials | Bot takeover and information leakage |
| Critical | Every authenticated Supabase account is treated as an administrator | Unauthorized modification or deletion |
| Critical | Known vulnerable dependencies are installed | Exploitable framework and tooling weaknesses |
| High | Anonymous database inserts bypass application validation and rate limiting | Spam, abuse, and data pollution |
| High | Multilingual routing conflicts with sitemap and structured data | Invalid international SEO architecture |
| High | Backend failures are suppressed or produce runtime errors | Empty pages and unreliable deployments |
| High | Car and image mutations are not transactional | Partial or inconsistent database state |
| High | Newsletter resubscription flow conflicts with RLS | Existing subscribers cannot be handled correctly |
| High | Hidden reviews/partners may become inaccessible to administrators | Content cannot be restored from the admin UI |
| Medium | Translation editing writes to runtime files | Fails or loses data on serverless deployments |
| Medium | Image deletion does not clean Supabase storage | Orphaned files and increasing storage cost |
| Medium | Notification delivery is fire-and-forget | Lost Telegram/email alerts |
| Medium | Inventory filters are implemented but disconnected | Missing core catalog functionality |
| Medium | Accessibility and localization are incomplete | Poor experience for keyboard and non-Romanian users |

## Critical security findings

### 1. Public settings can expose Telegram secrets

The `site_config` JSON contains fields for:

- `telegram_bot_token`
- `telegram_chat_id`
- notification email and public configuration

The database setup grants public `SELECT` access to the complete `site_settings` table:

```sql
CREATE POLICY "Allow public read on site_settings"
ON site_settings FOR SELECT USING (true);
```

Because the public Supabase URL and anonymous key are intentionally available to browsers, a visitor can query the complete row directly, even if the Next.js UI only displays selected fields.

#### Required fix

1. Rotate the Telegram bot token immediately if a real token has ever been stored in `site_config`.
2. Move secrets to server-only environment variables or a private table with no anonymous policy.
3. Split configuration into explicit public and private records.
4. Return an allowlisted public settings shape rather than arbitrary JSON.
5. Add a migration that removes anonymous access to private settings.

### 2. Authentication is incorrectly treated as administrator authorization

`requireAuth()` only calls `supabase.auth.getUser()` and accepts any existing user. The RLS policies similarly use only `auth.role() = 'authenticated'`.

This means any Supabase account is effectively an administrator with permission to change or delete:

- Cars and car images.
- Reviews and partners.
- Site settings and notification configuration.
- Leads and subscribers.
- Storage objects.

This becomes critical if public signup is enabled, a test account exists, or a non-administrator account is compromised.

#### Required fix

- Disable public signup.
- Create an `admin_users` table or use signed `app_metadata.role` claims.
- Check the administrator role in `requireAuth()`.
- Enforce the same role in every RLS and storage policy.
- Require MFA for administrators.
- Add administrator audit logs.
- Add login throttling and account lockout/alerting.

### 3. Known vulnerable dependencies

The dependency audit on August 26, 2026 found:

- 20 vulnerabilities across all installed dependencies.
- 3 critical vulnerabilities, primarily in the Vitest UI/tooling chain.
- 11 high-severity vulnerabilities overall.
- 11 production vulnerabilities, including 7 high-severity findings.

Directly affected or outdated packages include:

- Next.js 16.1.6.
- next-intl 4.8.3.
- uuid 13.0.0.
- Vitest 4.0.18 and related packages.
- isomorphic-dompurify 3.0.0.

Transitive findings affect packages such as PostCSS, Sharp, Undici, WebSocket libraries, DOMPurify, Nano ID, and Picomatch.

#### Required fix

- Upgrade Next.js and `eslint-config-next` together.
- Upgrade next-intl and retest locale navigation.
- Upgrade Vitest, `@vitest/ui`, and coverage packages.
- Upgrade `uuid`, or replace its only use with `crypto.randomUUID()`.
- Upgrade or remove `isomorphic-dompurify`; it is installed but not used by the application sanitizer.
- Run the complete test/build suite after each upgrade group.
- Do not use `npm audit fix --force` without reviewing breaking changes.

## High-priority application and database findings

### 4. Public lead inserts bypass validation and rate limiting

The application validates lead data and applies an in-memory IP rate limiter. However, the RLS policy allows anonymous clients to insert directly into `leads_inquiries` with `WITH CHECK (true)`.

An attacker can use the public Supabase credentials to bypass:

- Zod validation.
- IP limiting.
- Application logging rules.
- CAPTCHA or UI restrictions.
- Notification flow.

The in-memory limiter is also ineffective across multiple serverless instances and resets after cold starts or deployments.

#### Required fix

- Remove unrestricted anonymous table inserts.
- Accept submissions through one controlled server endpoint or narrowly scoped database RPC.
- Use Redis/Upstash or another durable distributed rate limiter.
- Add Cloudflare Turnstile or an equivalent CAPTCHA.
- Add request-body size limits, honeypots, and spam scoring.
- Normalize and validate phone numbers, dates, URLs, and form types.

The committed `database/dev_public_policies.sql` is also dangerous because executing it makes core tables publicly writable. Remove it from normal deployment paths or add explicit safeguards and warnings.

### 5. Internationalization, sitemap, and URL behavior conflict

The router specifies:

```ts
localePrefix: 'never'
```

This means all languages share the same visible URL and locale selection is cookie/browser based. In contrast:

- The sitemap publishes `/ru` and `/en` URLs.
- Runtime testing confirmed `/ru` and `/en` redirect to `/`.
- Car structured data emits `/{locale}/inventory/{slug}` for every locale, including Romanian.
- Documentation sometimes says languages have prefixes and sometimes says they do not.

This produces redirecting sitemap entries, invalid structured-data URLs, unstable crawler language selection, and no durable per-language pages.

#### Recommended fix

Use `localePrefix: 'as-needed'`:

- Romanian: `/`, `/inventory`, `/contact`
- Russian: `/ru`, `/ru/inventory`, `/ru/contact`
- English: `/en`, `/en/inventory`, `/en/contact`

Then add:

- Canonical URLs.
- `hreflang` alternates.
- Locale-aware Open Graph values.
- Correct sitemap URLs.
- Locale-aware structured data.
- Localized page descriptions.

### 6. Database failures can publish empty or broken pages

Most query functions catch Supabase errors and return empty arrays or zero counts. During the audit, the production build emitted many `ENOTFOUND` errors for Supabase but still completed successfully.

Consequences:

- CI can publish an empty catalog while reporting a successful build.
- A backend outage appears as “no cars found,” which is misleading.
- Monitoring may not detect the deployment problem.
- Static pages may be generated without required content.

The homepage also accesses `siteConfig.site_title` after `getSettings()` may return `null`. Runtime probing produced `Cannot read properties of null (reading 'site_title')` when Supabase was unavailable.

#### Required fix

- Decide which data is required for a successful build and fail clearly when it is unavailable.
- Distinguish “no records” from “backend unavailable.”
- Add explicit request timeouts and a circuit breaker.
- Add user-friendly error states and retry behavior.
- Add health/readiness checks.
- Add error monitoring such as Sentry.
- Avoid build-time calls to production data unless intentional and reliable.

### 7. Excessive repeated settings queries

The homepage fetches cars, reviews, partners, homepage content, and site configuration. Individual homepage components then fetch the same settings rows again.

Repeated callers include:

- About section.
- Statistics section.
- Services section.
- Leasing section.
- Contact banner.
- Why-us section.
- Header/footer layout.
- Page metadata.

This increases latency, backend load, build noise, and failure surface.

#### Recommended fix

- Fetch settings once per request.
- Validate them with a typed Zod schema.
- Pass the relevant content to child components.
- Use React `cache()` or Next caching with a clear revalidation strategy.
- Revalidate settings by tag after admin updates.

### 8. Car and image operations are not transactional

When saving a car, the code:

1. Saves the car record.
2. Deletes every existing image record.
3. Inserts the new image records.

If the last step fails, the car remains saved without images. Creating or duplicating a car can likewise leave partially created records.

#### Required fix

- Implement the mutation in a PostgreSQL function/transaction.
- Validate all image URLs and ordering before mutation.
- Roll back the complete operation on any failure.
- Add a database constraint ensuring at most one primary image per car.
- Preserve and use `sort_order` consistently.

### 9. Storage objects are not managed with database lifecycle

Images are uploaded immediately from the browser before the car form is saved. Removing an image only removes its URL from form state. Deleting a car deletes database rows through cascading foreign keys but not Supabase storage objects.

Orphaned files occur when:

- An administrator uploads and cancels the form.
- An image is removed before saving.
- Saving the car fails.
- A car is deleted.
- An image is replaced.

#### Required fix

- Upload to a temporary path and finalize only after save.
- Delete storage objects when images or cars are removed.
- Add a scheduled orphan-cleanup job.
- Validate MIME type, decoded image type, dimensions, and file size server-side.
- Restrict storage paths by administrator identity or role.

### 10. Newsletter resubscription conflicts with RLS

The anonymous `subscribe()` flow first selects an existing subscriber and may update an inactive record. Anonymous users only have an insert policy, so select and update are denied.

Consequences:

- Existing active subscriptions are reported as a generic insert failure.
- Inactive users cannot resubscribe.
- Error handling ignores the select error.

#### Required fix

- Move subscription logic into a secure server endpoint or database function.
- Make subscription responses non-enumerating to protect email privacy.
- Add confirmation emails and double opt-in.
- Add signed unsubscribe links.
- Record consent timestamp, source, locale, and policy version.

### 11. Hidden reviews and partners may disappear from admin

Public RLS policies only allow selecting visible reviews and partners. There is no separate authenticated select-all policy. The admin list queries use an authenticated session but may still only see rows matching the public visibility rule.

An administrator who hides a record may be unable to retrieve and restore it.

#### Required fix

Add administrator policies that allow approved admins to select all records, while anonymous users can only select visible records.

## Functional bugs and incomplete behavior

### Inventory filters are disconnected

`CarFilters`, `ActiveFilters`, and `CarList` exist but are not used by the public inventory page. The inventory page reads only `page`, even though the query layer supports some brand, price, and year filters.

Missing or incomplete behavior:

- Text search does nothing.
- Brand filtering is not rendered.
- Price filtering is not rendered.
- Year filtering is incomplete.
- Brands are hardcoded rather than generated from data.
- No fuel, transmission, body, drive, mileage, or availability filters.
- No sorting.

### Invalid pagination is accepted

Inputs such as `?page=-1` and `?page=abc` return HTTP 200. Page parameters should be parsed, clamped, and redirected to a canonical valid value.

This applies to public inventory and admin pagination.

### Missing image fallback

Car cards and favorites reference:

```text
/media/content/b-goods/placeholder.jpg
```

The file does not exist. Runtime probing confirmed a 404. Cars without images therefore show broken media instead of a placeholder.

### Lead administration only filters the current page

Lead filters operate on the currently loaded 20 records, not the complete result set. Counts displayed in the table refer to the current page, while “mark all read” mutates every record in the database. The user experience is therefore inconsistent.

Filtering should happen in the query and preserve pagination/counts.

### Optimistic admin mutations ignore failure

Lead read, important, and delete actions update client state immediately but do not restore it if the server mutation fails. The UI may show a successful action that was never stored.

### Translation editor is not deployable on common serverless hosts

The admin translation editor writes directly to `messages/{locale}.json` at runtime. On Vercel and similar platforms:

- The deployed filesystem is read-only or ephemeral.
- Changes do not survive a deployment.
- Changes do not synchronize across instances.
- Git/source files are not updated.

Translations should be stored in the database/CMS or modified through a source-controlled deployment workflow.

### Notifications may be lost

Telegram and email notifications are started with `void` and are not awaited. A serverless function may finish before those requests complete.

Use:

- An awaited notification when acceptable.
- Platform `waitUntil` support.
- A durable queue and worker for reliable delivery.

The raw `source_url` is also inserted into Telegram Markdown and email HTML without complete context-aware escaping. Restrict URLs to approved HTTP/HTTPS origins and escape them correctly.

### Privacy-sensitive data is logged

Contact requests and validation failures log complete request bodies, including names, phone numbers, emails, messages, and source URLs. Production logs should minimize or redact PII.

### Duplicate and conflicting database setup paths

The repository contains multiple overlapping schema and migration files under `database/` and `supabase/migrations/`. They define different table shapes and policies.

Examples:

- `contact_messages` exists in a migration but is unused by the application.
- Different lead scripts omit fields required by the current application.
- Several scripts recreate or modify similarly named RLS policies.
- `SETUP_NEW_DB.sql` is treated as canonical, but it is not part of a formal migration chain.

Consolidate these into ordered, versioned Supabase migrations and test them against an empty database and an upgraded existing database.

## Database design improvements

### Schema constraints

Add or improve:

- A maximum reasonable vehicle year.
- Safe, normalized slug validation.
- URL validation for images, partners, avatars, maps, and social links.
- A proper UUID foreign key from leads to cars where applicable.
- A check constraint for allowed `form_type` values.
- Proper date/time types for appointments.
- A unique partial index allowing only one primary image per car.
- Non-null constraints where business rules require them.
- Normalized/uniquely indexed lowercase subscriber emails.

### Missing indexes

Consider indexes for:

- `cars(is_available, created_at)`.
- `cars(is_featured, is_available, created_at)`.
- `car_images(car_id, sort_order)`.
- `reviews(is_visible, created_at)`.
- `partners(is_visible, sort_order)`.
- `leads_inquiries(is_read, created_at)`.
- `leads_inquiries(is_important, created_at)`.

### Timestamp behavior

`cars.updated_at` and `site_settings.updated_at` are not maintained automatically. Add an update trigger and use `updated_at` in sitemap and cache invalidation logic.

### Settings validation and concurrency

`saveSettings()` accepts an arbitrary key and unknown JSON. Settings should have per-key Zod schemas. Saving a whole JSON blob can also overwrite concurrent changes; consider versioning or separate typed records.

### Storage policies

Storage policies currently trust any authenticated account and use generic policy names such as `Public Access`. Restrict them to approved administrators and the expected bucket/path. Avoid dropping policies with generic names that might belong to another application sharing the Supabase project.

## Security hardening improvements

### HTML and structured-data safety

The custom sanitizer is regex-based. Regex sanitizers are difficult to make safe against malformed markup, SVG, namespaced attributes, CSS payloads, and browser parsing differences.

Use an updated, configured HTML sanitizer with an explicit allowlist. Prefer storing plain text or a structured editor format when rich HTML is not necessary.

JSON-LD scripts use `JSON.stringify()` directly. Escape `<` as `\u003c` before inserting JSON into a script element to prevent closing-script injection from stored content.

### Content Security Policy

The CSP includes both:

- `'unsafe-inline'`
- `'unsafe-eval'`

This significantly weakens script protection. Move toward nonce- or hash-based scripts and remove `unsafe-eval` from production. Also consider explicit `frame-ancestors`, `form-action`, and `upgrade-insecure-requests` directives.

### URL handling

Only allow `https:` and other explicitly required schemes for external URLs. Validate:

- Social links.
- Partner websites.
- Source URLs.
- Logo and image URLs.
- Map embeds.
- Notification links.

### Seed endpoint

`/api/seed-defaults` remains deployed and can be called by any authenticated account. Remove it after initial setup or make seeding a controlled deployment command.

### Error disclosure

Public APIs return database and validation details in some failure messages. Return a generic public message and log a sanitized internal error with a trace ID.

## Internationalization and SEO review

### Incomplete localization

Several public UI sections contain hardcoded Romanian or English, including:

- Car lead form labels and success messages.
- Similar cars heading.
- Inventory empty state.
- Some leasing/navigation labels.
- Missing-setting warnings.

Russian is missing 11 inventory/filter translation keys. English and Romanian currently have matching key counts.

Add an automated test that asserts identical translation-key sets across locales.

### Metadata issues

- Inventory descriptions are Romanian for every locale.
- Structured car URLs conflict with actual routing.
- Canonical and language alternate metadata are absent.
- Static sitemap entries use the current time as `lastModified` on every request.
- Car sitemap dates use creation rather than real update time.
- Login/admin routes should explicitly use `noindex`; robots rules are not a substitute for metadata and access control.

### Documentation mismatch

The README:

- References a missing `.env.example`.
- Documents `NEXT_PUBLIC_GA_MEASUREMENT_ID`, while code reads `NEXT_PUBLIC_GA_ID`.
- Refers to `middleware.ts` rather than the actual root `proxy.ts`.
- Says public pages are blank due to maintenance mode, which contradicts the current application.
- Is inconsistent about locale prefixes.

The documentation should be corrected after the routing and deployment choices are finalized.

## UX and accessibility findings

### Forms

Many public inputs rely only on placeholders. Add visible or visually hidden labels, field-level errors, `aria-describedby`, appropriate autocomplete attributes, and focus movement after submission errors.

Phone inputs should support international normalization and clearly communicate accepted formats.

### Mobile menu

The menu lacks:

- Dialog semantics.
- `aria-expanded`/`aria-controls` on the opener.
- Focus trapping.
- Escape-key closing.
- Focus restoration.
- Reliable navigation using the framework link component.

### Image lightbox

The lightbox needs:

- `role="dialog"` and `aria-modal="true"`.
- Focus trapping/restoration.
- A descriptive accessible name.
- Better image-specific alt text.
- Hidden navigation controls for a single image.

### Motion

The site uses multiple reveal animations, an automatic hero slider, and animated grids. Respect `prefers-reduced-motion`, provide a carousel pause control, and avoid hiding content until JavaScript animation begins.

### Language consistency

Russian and English pages should not contain Romanian form text. Admin language can remain Romanian or English if intentional, but public content must be consistently localized.

### Error and empty states

Differentiate:

- No vehicles match the filters.
- No vehicles have been published.
- The backend is temporarily unavailable.
- A page number is invalid.

## Performance and reliability improvements

### Images

Large bundled assets include hero images around 1.5–1.7 MB and a logo around 1.4 MB. Hero images are loaded as CSS backgrounds, bypassing Next Image optimization.

Recommended changes:

- Convert hero assets to AVIF/WebP.
- Use responsive image sizes and preload only the first slide.
- Reduce the source logo dimensions and file weight.
- Add the missing local placeholder.
- Avoid `unoptimized` full-resolution lightbox images unless required.
- Enforce upload compression and maximum dimensions.

### Similar cars

The similar-car section loads the complete public inventory and filters in application memory. Replace it with a limited database query based on brand and price range.

### Dashboard counts

Dashboard statistics fetch all car and lead status rows and count them in memory. Use database count queries or a view/RPC.

### Request timeout and observability

Database requests have no explicit application timeout. Local requests took a long time when Supabase DNS failed.

Add:

- Bounded timeouts.
- Structured logs.
- Request IDs.
- Error monitoring.
- Backend latency metrics.
- Notification-delivery metrics.
- Synthetic checks for homepage, inventory, car detail, contact form, and admin login.

### Preloader

The preloader always blocks the page for approximately 600 ms regardless of readiness. This delays perceived interaction and can harm usability. Remove it or tie it to meaningful route/loading state.

## Code quality and maintainability

### ESLint

The lint run reports 106 findings:

- 72 errors.
- 34 warnings.

Common issues include:

- Widespread explicit `any`.
- Unused imports and variables.
- Raw `<a>` navigation for internal pages.
- Raw `<img>` tags instead of optimized images.
- State updates inside effects.
- Unescaped JSX text.

Lint should be made a required CI check.

### Type safety

Although TypeScript passes, `any` is used heavily for:

- Settings.
- Supabase records.
- Form resolver integration.
- Multilingual fields.
- Images.
- Notifications.

Generate Supabase database types and define typed schemas for settings and homepage content. Do not cast around form validation errors.

### Component structure

Some components, particularly the settings form, are very large and difficult to test. Split settings into typed sections and reusable controlled inputs.

### Error handling

Admin actions mix thrown exceptions, boolean results, alerts, and console messages. Introduce a consistent result type and shared toast/error behavior.

### Dead or unused code

Examples include:

- Unused catalog filter/list components.
- Installed but unused `isomorphic-dompurify`.
- Unused imports and component props.
- The unused `contact_messages` table.

Remove obsolete code or finish and integrate it.

## Testing and CI recommendations

### Current test reality

The 44 current tests cover:

- Car/review/partner schemas.
- Regex sanitizer.
- In-memory rate limiter.
- Pagination component.

The coverage report shows approximately 93.5% line coverage only because coverage is collected from the small set of imported files. It does not represent the complete project.

### Required test additions

Add unit and integration tests for:

- Authentication and administrator authorization.
- Every protected server action.
- Public contact and lead validation.
- Subscriber first signup, duplicate signup, unsubscribe, and resubscribe.
- Settings schema validation.
- Car save/duplicate/delete and image transaction behavior.
- Locale routing, canonical URLs, and sitemap entries.
- Backend-unavailable behavior.
- Translation-key parity.
- Notification escaping and failure behavior.
- Pagination parameter validation.
- RLS policies against anonymous, ordinary authenticated, and administrator roles.

Add Playwright end-to-end tests for:

- Browsing and filtering inventory.
- Opening a car and sending a lead.
- Contact/test-drive submission.
- Language switching.
- Favorites.
- Admin login/logout.
- Car creation/editing/deletion.
- Image upload/removal.
- Lead status changes.
- Settings and homepage editing.

Add automated accessibility tests with Axe and keyboard-focused manual test cases.

### CI pipeline

No CI workflow is present. Add a required workflow that runs:

1. Clean dependency installation.
2. Dependency/security audit with an agreed severity threshold.
3. ESLint.
4. TypeScript.
5. Unit/integration tests with meaningful source inclusion.
6. Production build.
7. Migration validation against an empty database.
8. RLS tests.
9. Playwright smoke tests against a preview environment.

## Legal, privacy, and operational needs

Because the site collects names, phone numbers, email addresses, messages, appointments, newsletter subscriptions, and analytics data, it should include:

- Privacy policy.
- Cookie/analytics consent where required.
- Terms of service.
- Data retention and deletion rules.
- Newsletter consent evidence and unsubscribe.
- Access controls for lead/subscriber exports.
- Log redaction.
- Backup and recovery procedures.
- Incident response and secret rotation procedures.

The leasing calculator should clearly state that results are estimates and not a binding financial offer. Actual rates, eligibility, fees, and partner terms should be displayed when available.

## Recommended remediation plan

### Phase 0: Immediate security response

1. Rotate the Telegram token if populated.
2. Split private and public settings.
3. Remove anonymous reads from private settings.
4. Implement real administrator roles in server actions and RLS.
5. Disable public Supabase signup and require MFA.
6. Remove or guard public-write development policies.
7. Upgrade security-sensitive dependencies.

### Phase 1: Data integrity and abuse prevention

1. Close unrestricted anonymous lead/subscriber inserts.
2. Add durable rate limiting and CAPTCHA.
3. Consolidate and version database migrations.
4. Add missing RLS policies and schema constraints.
5. Make car/image mutations transactional.
6. Implement storage cleanup.
7. Fix subscriber subscription/resubscription/unsubscribe.
8. Replace runtime translation file writes.

### Phase 2: Reliability and observability

1. Add request timeouts and backend health checks.
2. Stop hiding backend errors as empty results.
3. Cache and deduplicate settings queries.
4. Add structured logging, metrics, and error monitoring.
5. Make notification delivery durable.
6. Add clear public error states.

### Phase 3: SEO, localization, and catalog completion

1. Adopt `as-needed` locale URLs.
2. Correct sitemap, canonical, `hreflang`, metadata, and JSON-LD.
3. Complete translations and remove hardcoded public strings.
4. Integrate full inventory filtering/search/sorting.
5. Fix pagination canonicalization.
6. Add optimized images and the missing placeholder.

### Phase 4: Engineering quality

1. Resolve all lint errors and warnings.
2. Remove `any` from data boundaries.
3. Generate Supabase types.
4. Add CI and database policy tests.
5. Add Playwright and accessibility coverage.
6. Refactor large forms and standardize error handling.
7. Correct README, environment documentation, and deployment instructions.

## Recommended feature roadmap

Features should be added after the security and reliability phases.

### Highest-value customer features

- Complete search, filters, and sorting.
- Vehicle comparison.
- Saved searches and price alerts.
- VIN and vehicle-history presentation.
- Inspection checklist and downloadable report.
- Service history, damage disclosure, and document gallery.
- Import-to-order request wizard by budget, brand, model, year, and delivery date.
- Trade-in valuation request.
- Appointment/test-drive calendar with available time slots.
- Price history and reduced-price badges.
- Reservation/deposit request.
- Customer accounts with synchronized favorites and requests.

### Import transparency features

- Vehicle sourcing stage.
- Inspection stage and media.
- Purchase confirmation.
- Export/customs stage.
- Transport tracking.
- Moldova arrival and registration stage.
- Estimated and final cost breakdown.
- Customer status notifications.

### Leasing improvements

- Use actual partner rates and fee structures.
- Pre-fill the calculator from a car detail page.
- Save the selected calculation into the lead.
- Add eligibility questions and document checklist.
- Add a prominent non-binding estimate disclaimer.

### CRM and admin features

- Lead pipeline statuses such as new, contacted, qualified, appointment, negotiating, won, and lost.
- Staff assignment.
- Notes and activity history.
- Follow-up reminders.
- Search and server-side filters.
- UTM/referrer/campaign attribution.
- CSV export with permission controls.
- Duplicate-lead detection.
- Lead response-time and conversion reports.
- Notification-delivery status and retry.
- Role-based staff permissions.
- Multi-office support and office-specific inventory/contact information.

### Marketing and SEO features

- Vehicle schema with verified data.
- Breadcrumb schema.
- Local business/auto dealer schema.
- Language-specific landing pages.
- Educational content about importing, customs, inspections, and leasing.
- Social sharing images generated per vehicle.
- Price-drop and newly-arrived campaigns.
- Consent-aware analytics and conversion tracking.

## Final assessment

SwissCars has a good foundation for a dealership website and internal content-management system. The existing product already demonstrates meaningful work: multilingual pages, inventory, admin CRUD, image upload, leads, reviews, partners, favorites, and a leasing calculator.

The current risks are concentrated in the security boundary and data layer rather than the general product concept. The immediate goal should not be adding more surface area. It should be making the existing system trustworthy:

1. Protect secrets and administrator privileges.
2. Prevent abuse and guarantee data integrity.
3. Make backend failures visible and recoverable.
4. Establish correct multilingual URLs and SEO.
5. Add meaningful automated coverage and CI.

Once those foundations are stable, the best growth path is transparent vehicle evidence, a complete catalog search experience, import-to-order workflows, and a real CRM pipeline. Those features would turn the project from a dealership brochure into a strong end-to-end sales platform.
