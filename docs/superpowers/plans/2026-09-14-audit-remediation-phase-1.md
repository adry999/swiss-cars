# Audit Remediation — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every audit finding that needs no product decision: close the critical seed endpoint, remove unsafe and dead files, unify the duplicated translation and metadata logic, and clear the unused-code warnings.

**Architecture:** Changes stay inside the existing layers. Pure helpers are added where their consumers already reach: `shared/formatting/` for translated-field text, `i18n/routing.ts` for page metadata, and `features/site-settings/model/` for homepage defaults. Each task is one logical step with its own commit and leaves the app shippable.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript strict, next-intl 4, Zod 4, Vitest 4, ESLint 9 flat config, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-14-code-audit-report.md` (the audit report; section numbers such as “1.3” below refer to it). Conventions: `.claude/skills/project-conventions/SKILL.md`, `CLAUDE.md`.

## Global Constraints

- **Branch:** work on `refactor/audit-remediation-phase-1`, created from `fix/rate-limit-eviction` (HEAD `378152f`). Never push or merge without the user's explicit approval; merging to `main` deploys production.
- **Commits:** Conventional Commits `type(scope): subject`, imperative, ≤ 72 characters. No mention of AI or agents and no `Co-Authored-By` trailer. Scopes: `auth`, `inventory`, `leads`, `leasing`, `notifications`, `partners`, `reviews`, `site-settings`, `subscribers`, `shared`, `core`, `config`, `admin`, `content`, `tooling`, `i18n`, `database`.
- **Separate commits:** file moves/deletions and behaviour changes never share a commit.
- **Quality gate after every task:** `npx tsc --noEmit -p tsconfig.json` has 0 errors, `npx eslint .` has 0 errors, `npx vitest run` passes. After the last task `npm run build` must also pass.
- **Import boundaries** (enforced by `eslint.config.mjs`):
  - a feature never imports another feature or `@app`;
  - `shared/` never imports `@features` or `@app`;
  - `core/` imports only `@config`;
  - no `../../` imports and no `@/` alias.
- **Tests:** colocated `x.test.ts` next to `x.ts`. Server-only code starts with `// @vitest-environment node`. Test names describe observable behaviour.
- **Comments:** only a non-obvious WHY, 1–2 lines. Never narrate history (“previously”, “used to”, “confirmed live”).
- **Shell:** the environment is Windows PowerShell 5.1 (no `&&`). Paths containing `[locale]` or `[slug]` need `-LiteralPath` in PowerShell cmdlets. Git accepts them quoted.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `app/api/seed-defaults/route.ts` | Delete | One-time seed endpoint with non-admin auth (audit 2.5, critical) |
| `database/archive/*.sql` | Delete | Superseded and insecure SQL scripts (2.5) |
| `database/README.md`, `README.md`, `CLAUDE.md` | Modify | Drop references to the deleted endpoint, archive and dead files |
| `package.json`, `package-lock.json` | Modify | Add `tsx` (used by `npm run seed`), remove `@types/uuid` |
| `shared/formatting/pick-translation.ts` (+ `.test.ts`) | Create | Resolve a `TranslatedField` for a locale with Romanian fallback |
| `features/site-settings/ui/{About,ContactBanner,Leasing,Stats,Services}Section.tsx`, `WhyUsAccordion.tsx`, `HeroSlider.tsx` | Modify | Use `pickTranslation` instead of 7 local `getText` copies |
| `i18n/routing.ts` (+ `routing.test.ts`) | Modify | Add `localizedPageMetadata()` |
| `app/[locale]/{about,services,inventory,leasing,contact}/page.tsx` | Modify | Use `localizedPageMetadata()`; leasing/contact get RU/EN copy |
| `features/site-settings/model/default-homepage-content.ts` (+ `.test.ts`) | Create | Homepage editor defaults as data |
| `features/site-settings/ui/HomepageContentForm.tsx` | Modify | Import the defaults |
| `shared/ui/{EmptyState,LoadingSpinner}.*`, `shared/ui/admin/{AdminPageHeader,FormErrorMessage}.*`, `shared/seo/*`, `public/media/general/favicon.png` | Delete | Orphans (2.1) |
| `shared/formatting/format.ts`, `i18n/navigation.ts`, `features/inventory/{index,server}.ts`, `features/notifications/model/lead-alert-message.ts` | Modify | Drop unused exports (2.2) |
| `eslint.config.mjs` + 9 source files | Modify | `ignoreRestSiblings`, remove unused imports/variables (2.4) |
| `features/leads/ui/LeadInbox.tsx` | Modify | Remove pass-through wrappers and the dead ternary, clear the confirm timer (1.2) |

---

### Task 0: Create the working branch and record the baseline

**Files:** none.

- [ ] **Step 1: Create the branch**

```powershell
git switch fix/rate-limit-eviction
git switch -c refactor/audit-remediation-phase-1
git status --short
```
Expected: branch `refactor/audit-remediation-phase-1`. The status is clean apart from the untracked `docs/superpowers/specs/2026-09-14-code-audit-report.md` and this plan.

- [ ] **Step 2: Commit the audit report and this plan**

```powershell
git add -- docs/superpowers/specs/2026-09-14-code-audit-report.md docs/superpowers/plans/2026-09-14-audit-remediation-phase-1.md
git commit -m "docs(tooling): record the code audit and phase 1 remediation plan"
```

- [ ] **Step 3: Record the baseline**

```powershell
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint . 2>&1 | Select-Object -Last 2
npx vitest run 2>&1 | Select-Object -Last 4
```
Expected: tsc exit 0; `✖ 27 problems (0 errors, 27 warnings)`; `Tests  174 passed (174)`.

---

### Task 1: Delete the one-time seed endpoint (audit 2.5, critical)

`app/api/seed-defaults/route.ts` only checks `supabase.auth.getUser()`, so any signed-in account can overwrite `homepage_content`. The rows it seeds (`site_config`, `homepage_content`) already exist in the database. The admin homepage editor now fills missing sections from its own defaults, and `database/seed_defaults.mjs` remains for fresh installs.

**Files:**
- Delete: `app/api/seed-defaults/route.ts`
- Modify: `CLAUDE.md` (section `## One-Time Setup`)
- Modify: `database/README.md:23-24`

- [ ] **Step 1: Confirm nothing in code calls the endpoint**

```powershell
git grep -n "seed-defaults" -- app features shared core
```
Expected: only `app/api/seed-defaults/route.ts` itself (or no output).

- [ ] **Step 2: Delete the route**

```powershell
git rm -q -- app/api/seed-defaults/route.ts
```

- [ ] **Step 3: Replace the `## One-Time Setup` section in `CLAUDE.md`**

Replace this paragraph:
```markdown
The `/api/seed-defaults` endpoint seeds default `site_config` and `homepage_content` into Supabase. It requires authentication and must be called via **POST** (not GET). Delete or disable this endpoint after first use.
```
with:
```markdown
A fresh database gets its default `site_config` and `homepage_content` rows from `database/seed_defaults.mjs` (see `database/README.md`). The admin homepage editor also fills any missing section from `features/site-settings/model/default-homepage-content.ts`.
```

- [ ] **Step 4: Update `database/README.md`**

Replace:
```markdown
Run `seed_defaults.mjs` (or hit the authenticated `/api/seed-defaults`
route once) afterward if you want the default homepage copy.
```
with:
```markdown
Run `seed_defaults.mjs` afterward if you want the default homepage copy.
```

- [ ] **Step 5: Verify**

```powershell
git grep -n "api/seed-defaults" -- . ":!docs"
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
```
Expected: no grep output; tsc exit 0.

- [ ] **Step 6: Commit**

```powershell
git add -- CLAUDE.md database/README.md
git commit -m "fix(content): remove the one-time seed endpoint open to any signed-in user"
```

---

### Task 2: Delete the archived SQL scripts (audit 2.5)

`database/archive/` contains `dev_public_policies.sql` and `storage_permissions_fix.sql`. Both grant public write access and would undo the hardening if run. Git history keeps them.

**Files:**
- Delete: `database/archive/` (10 files)
- Modify: `database/README.md` (section `## \`archive/\``)
- Modify: `README.md:115-117`

- [ ] **Step 1: Delete the folder**

```powershell
git rm -q -r -- database/archive
```

- [ ] **Step 2: Remove the archive section from `database/README.md`**

Delete this block, which runs from its heading to the end of the file:
```markdown
## `archive/`

Superseded incremental migrations and, in two cases, actively insecure
scripts kept only for history — **do not run these against a database
`2026-08-26_security_hardening.sql` has already been applied to**, they
will undo it:

- `dev_public_policies.sql`, `storage_permissions_fix.sql` — grant public
  write access to every table and the storage bucket. Written for
  frictionless local development before Supabase Auth was wired up. If you
  need that for local dev today, point at a disposable local/branch
  Supabase project, never a shared one.
- everything else in `archive/` — earlier incremental versions of what
  `SETUP_NEW_DB.sql` now creates in one pass (schema, policies, the
  `source_url` column, the `is_important` column, storage policies,
  homepage content seed). Superseded, not required for a fresh install.
```
The file then ends with the `## Existing database` section.

- [ ] **Step 3: Update `README.md`**

Replace:
```markdown
them the database still allows any authenticated account admin write access
and anonymous direct inserts into leads/subscribers. `database/archive/`
holds superseded and (in two cases) actively insecure historical scripts;
don't run those against a hardened database.
```
with:
```markdown
them the database still allows any authenticated account admin write access
and anonymous direct inserts into leads/subscribers.
```

- [ ] **Step 4: Verify and commit**

```powershell
git grep -n "database/archive\|archive/" -- README.md database CLAUDE.md
git add -- database/README.md README.md
git commit -m "chore(database): delete superseded and insecure archived SQL scripts"
```
Expected: no grep output before the commit.

---

### Task 3: Fix development dependencies (audit 2.3)

`npm run seed` runs `tsx`, which is not declared. `@types/uuid` is redundant because `uuid@13` ships its own types.

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Add `tsx` and remove `@types/uuid`**

```powershell
npm install --save-dev tsx
npm uninstall @types/uuid
```

- [ ] **Step 2: Verify**

```powershell
npx tsx --version
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
```
Expected: a `tsx` version prints; tsc exit 0 (the `uuid` import in `shared/ui/admin/ImageUploader.tsx` still type-checks).

- [ ] **Step 3: Commit**

```powershell
git add -- package.json package-lock.json
git commit -m "build(tooling): declare tsx for the seed script and drop redundant uuid types"
```

---

### Task 4: One helper for translated fields (audit 1.3)

Seven components re-implement “value for this locale, else Romanian, else fallback”.

**Files:**
- Create: `shared/formatting/pick-translation.ts`
- Test: `shared/formatting/pick-translation.test.ts`
- Modify: `features/site-settings/ui/AboutSection.tsx:12-20`, `ContactBanner.tsx:15-24`, `LeasingSection.tsx:12-20`, `StatsSection.tsx:14-18` (+ its `getText` call sites), `WhyUsAccordion.tsx:12-30`, `ServicesSection.tsx:29-55`, `HeroSlider.tsx:56` (+ its call sites)

**Interfaces:**
- Produces: `pickTranslation(field: TranslatedText, locale: string): string | undefined`, where `type TranslatedText = Partial<Record<string, string | undefined>> | string | null | undefined`. It returns the locale value, else the Romanian value, else a non-empty plain string, else `undefined`.

- [ ] **Step 1: Write the failing test** — `shared/formatting/pick-translation.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { pickTranslation } from './pick-translation';

describe('pickTranslation', () => {
    it('returns the value for the requested locale', () => {
        expect(pickTranslation({ ro: 'Despre noi', ru: 'О нас', en: 'About us' }, 'en')).toBe('About us');
    });

    it('falls back to Romanian when the locale is missing or empty', () => {
        expect(pickTranslation({ ro: 'Despre noi', en: '' }, 'en')).toBe('Despre noi');
        expect(pickTranslation({ ro: 'Despre noi' }, 'ru')).toBe('Despre noi');
    });

    it('accepts a plain string stored by older homepage rows', () => {
        expect(pickTranslation('Servicii', 'en')).toBe('Servicii');
    });

    it('returns undefined when nothing usable is stored', () => {
        expect(pickTranslation(undefined, 'ro')).toBeUndefined();
        expect(pickTranslation(null, 'ro')).toBeUndefined();
        expect(pickTranslation({ ro: '', en: '' }, 'en')).toBeUndefined();
        expect(pickTranslation('', 'ro')).toBeUndefined();
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run shared/formatting/pick-translation.test.ts`
Expected: FAIL — `Failed to resolve import "./pick-translation"`.

- [ ] **Step 3: Implement** — `shared/formatting/pick-translation.ts`

```ts
export type TranslatedText = Partial<Record<string, string | undefined>> | string | null | undefined;

/** Romanian is the fallback because every admin-edited field requires it. */
export function pickTranslation(field: TranslatedText, locale: string): string | undefined {
    if (typeof field === 'string') return field || undefined;
    return field?.[locale] || field?.ro || undefined;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run shared/formatting/pick-translation.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Replace the copy in `AboutSection.tsx`**

Add `import { pickTranslation } from '@shared/formatting/pick-translation';` after line 2, then replace lines 12-20:
```tsx
    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const subtitle = getText(aboutData?.subtitle, 'subtitle');
    const title = getText(aboutData?.title, 'title');
    const text = getText(aboutData?.text, 'text');
```
with:
```tsx
    const subtitle = pickTranslation(aboutData?.subtitle, locale) ?? t('subtitle');
    const title = pickTranslation(aboutData?.title, locale) ?? t('title');
    const text = pickTranslation(aboutData?.text, locale) ?? t('text');
```

- [ ] **Step 6: Replace the copy in `ContactBanner.tsx`**

Add the same import after line 2, then replace lines 15-24:
```tsx
    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const title = getText(data?.title, 'title');
    const text = getText(data?.text, 'text');
    const cta = getText(data?.cta, 'cta');
    const question = getText(data?.question, 'question');
```
with:
```tsx
    const title = pickTranslation(data?.title, locale) ?? t('title');
    const text = pickTranslation(data?.text, locale) ?? t('text');
    const cta = pickTranslation(data?.cta, locale) ?? t('cta');
    const question = pickTranslation(data?.question, locale) ?? t('question');
```

- [ ] **Step 7: Replace the copy in `LeasingSection.tsx`**

Add the import after line 2, then replace lines 12-20:
```tsx
    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const title = getText(data?.title, 'title');
    const text1 = getText(data?.text1, 'text1');
    const text2 = getText(data?.text2, 'text2');
```
with:
```tsx
    const title = pickTranslation(data?.title, locale) ?? t('title');
    const text1 = pickTranslation(data?.text1, locale) ?? t('text1');
    const text2 = pickTranslation(data?.text2, locale) ?? t('text2');
```

- [ ] **Step 8: Replace the copy in `StatsSection.tsx`**

Add the import after line 2 and delete lines 14-18 (the `getText` closure). Then replace lines 34-45:
```tsx
    const finalStats = stats.map((stat) => ({
        count: stat.count,
        suffix: stat.suffix,
        label: getText(stat.label)
    }));

    const finalPartnerships = {
        title: getText(partnerships.title),
        count: partnerships.count,
        suffix: getText(partnerships.suffix),
        text: getText(partnerships.text)
    };
```
with:
```tsx
    const finalStats = stats.map((stat) => ({
        count: stat.count,
        suffix: stat.suffix,
        label: pickTranslation(stat.label, locale) ?? ''
    }));

    const finalPartnerships = {
        title: pickTranslation(partnerships.title, locale) ?? '',
        count: partnerships.count,
        suffix: pickTranslation(partnerships.suffix, locale) ?? '',
        text: pickTranslation(partnerships.text, locale) ?? ''
    };
```

- [ ] **Step 9: Replace the copy in `WhyUsAccordion.tsx`**

Add the import after line 2, then replace lines 12-18:
```tsx
    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const title = getText(data?.title, 'title');
```
with:
```tsx
    const title = pickTranslation(data?.title, locale) ?? t('title');
```
and replace the item mapping:
```tsx
            title: getText(item.title),
            text: getText(item.text)
```
with:
```tsx
            title: pickTranslation(item.title, locale) ?? '',
            text: pickTranslation(item.text, locale) ?? ''
```

- [ ] **Step 10: Replace the copy in `ServicesSection.tsx`**

The old helper swallowed a missing i18n key with `try/catch`. `t.has(key)` expresses the same intent without an exception. First confirm next-intl exposes it:
```powershell
Select-String -Path node_modules/next-intl/dist/types/core/createTranslator.d.ts, node_modules/use-intl/dist/types/core/createTranslator.d.ts -Pattern 'has\(' -ErrorAction SilentlyContinue | Select-Object -First 2
```
Expected: at least one `has(` declaration. If none prints, keep `t(key)` without the check and note it in the commit body.

Add the import after line 3, then replace lines 29-40:
```tsx
    // Helper: get translated value from object or fall back to i18n key
    const getText = (translations?: Record<string, string> | null, fallbackKey?: string): string => {
        if (translations && typeof translations === 'object') {
            if (translations[locale]) return translations[locale];
            if (translations['ro']) return translations['ro'];
        }
        if (typeof translations === 'string' && (translations as string).length > 0) return translations as string;
        if (fallbackKey) {
            try { return t(fallbackKey); } catch { return ''; }
        }
        return '';
    };

    const title = getText(servicesData?.title, 'title');
```
with:
```tsx
    const textOrMessage = (field: TranslatedText, messageKey: string) =>
        pickTranslation(field, locale) ?? (t.has(messageKey) ? t(messageKey) : '');

    const title = textOrMessage(servicesData?.title, 'title');
```
Change the import to `import { pickTranslation, type TranslatedText } from '@shared/formatting/pick-translation';` and in the `services` mapping replace `getText(` with `textOrMessage(` (3 occurrences: name, short, full).

- [ ] **Step 11: Replace the copy in `HeroSlider.tsx`**

Add `import { pickTranslation } from '@shared/formatting/pick-translation';` after line 7, delete line 56:
```tsx
    const getText = (field: Record<string, string | undefined>) => field[locale] || field['ro'] || '';
```
Then replace the three JSX calls:
- line 93: `{getText(slide.slogan)}` becomes `{pickTranslation(slide.slogan, locale) ?? ''}`;
- line 101: `{getText(slide.title)}` becomes `{pickTranslation(slide.title, locale) ?? ''}`;
- line 111: `{getText(slide.cta)}` becomes `{pickTranslation(slide.cta, locale) ?? ''}`.

- [ ] **Step 12: Verify no copy remains and the gate passes**

```powershell
git grep -n "getText" -- features app shared
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint features/site-settings shared/formatting
npx vitest run
```
Expected: no grep output; tsc exit 0; eslint 0 errors; all tests pass (178).

- [ ] **Step 13: Commit**

```powershell
git add -- shared/formatting/pick-translation.ts shared/formatting/pick-translation.test.ts features/site-settings/ui
git commit -m "refactor(site-settings): resolve translated homepage fields through one helper"
```

---

### Task 5: One metadata builder for the static public pages (audit 1.3, TODOs in 2.5)

Five pages hand-build the same localized metadata. `leasing` and `contact` are Romanian-only, which is what their TODOs say.

**Files:**
- Modify: `i18n/routing.ts` (append the helper)
- Test: `i18n/routing.test.ts` (append a `describe`)
- Modify: `app/[locale]/about/page.tsx:13-28`, `app/[locale]/services/page.tsx:11-26`, `app/[locale]/inventory/page.tsx:13-38`, `app/[locale]/leasing/page.tsx:12-25`, `app/[locale]/contact/page.tsx:11-24`

**Interfaces:**
- Consumes: `localeAlternates(locale, path)`, `localeOpenGraph({ locale, path, title, description })`, `localeTwitter({ title, description })`, `routing` from `i18n/routing.ts`.
- Produces:
  - `type PageCopy = { title: string; description: string }`;
  - `localizedPageMetadata({ locale, path, copyByLocale }: { locale: string; path: string; copyByLocale: Record<'ro' | 'ru' | 'en', PageCopy> }): { title; description; alternates; openGraph; twitter }`;
  - the title is used verbatim, so each page keeps its current suffix.

- [ ] **Step 1: Write the failing test** — append to `i18n/routing.test.ts`

Add `localizedPageMetadata` to the import on line 2, then append:
```ts
describe('localizedPageMetadata', () => {
    const copyByLocale = {
        ro: { title: 'Despre Noi | SwissCars.md', description: 'Despre noi.' },
        ru: { title: 'О нас | SwissCars.md', description: 'О нас.' },
        en: { title: 'About Us | SwissCars.md', description: 'About us.' },
    };

    it('uses the copy of the requested locale everywhere', () => {
        const metadata = localizedPageMetadata({ locale: 'ru', path: '/about', copyByLocale });

        expect(metadata.title).toBe('О нас | SwissCars.md');
        expect(metadata.description).toBe('О нас.');
        expect(metadata.openGraph.title).toBe('О нас | SwissCars.md');
        expect(metadata.twitter.description).toBe('О нас.');
        expect(metadata.alternates.canonical).toBe(`${BASE_URL}/ru/about`);
    });

    it('falls back to the Romanian copy for an unknown locale', () => {
        const metadata = localizedPageMetadata({ locale: 'de', path: '/about', copyByLocale });

        expect(metadata.title).toBe('Despre Noi | SwissCars.md');
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run i18n/routing.test.ts`
Expected: FAIL — `localizedPageMetadata is not a function` (or the import is undefined).

- [ ] **Step 3: Implement** — append to `i18n/routing.ts`

```ts
export type PageCopy = { title: string; description: string };

/** Title, description, canonical/hreflang, Open Graph and Twitter for a static page, from one copy table. */
export function localizedPageMetadata({
    locale,
    path,
    copyByLocale,
}: {
    locale: string;
    path: string;
    copyByLocale: Record<(typeof routing.locales)[number], PageCopy>;
}) {
    const { title, description } =
        copyByLocale[locale as (typeof routing.locales)[number]] ?? copyByLocale[routing.defaultLocale];

    return {
        title,
        description,
        alternates: localeAlternates(locale, path),
        openGraph: localeOpenGraph({ locale, path, title, description }),
        twitter: localeTwitter({ title, description }),
    };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run i18n/routing.test.ts`
Expected: PASS.

- [ ] **Step 5: Use it in `app/[locale]/about/page.tsx`**

Replace line 6 `import { localeAlternates, localeOpenGraph, localeTwitter } from '@i18n/routing';` with `import { localizedPageMetadata } from '@i18n/routing';`, and replace lines 13-28 (the whole `generateMetadata`) with:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/about',
        copyByLocale: {
            ro: { title: 'Despre Noi | SwissCars.md', description: 'Află mai multe despre misiunea noastră și experiența în importul auto din Elveția.' },
            ru: { title: 'О нас | SwissCars.md', description: 'Узнайте больше о нашей миссии и опыте импорта автомобилей из Швейцарии.' },
            en: { title: 'About Us | SwissCars.md', description: 'Learn more about our mission and experience in importing cars from Switzerland.' },
        },
    });
}
```

- [ ] **Step 6: Use it in `app/[locale]/services/page.tsx`**

Replace line 4 with `import { localizedPageMetadata } from '@i18n/routing';` and lines 11-26 with:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/services',
        copyByLocale: {
            ro: { title: 'Servicii | SwissCars.md', description: 'Servicii complete de import auto din Elveția, devamare, transport și mentenanță.' },
            ru: { title: 'Услуги | SwissCars.md', description: 'Полный спектр услуг по импорту автомобилей из Швейцарии, растаможке, транспортировке и обслуживанию.' },
            en: { title: 'Services | SwissCars.md', description: 'Complete car import services from Switzerland, customs clearance, transport and maintenance.' },
        },
    });
}
```

- [ ] **Step 7: Use it in `app/[locale]/inventory/page.tsx`**

Replace line 2 with `import { localizedPageMetadata } from '@i18n/routing';` and lines 13-38 with:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/inventory',
        copyByLocale: {
            ro: { title: 'Mașini în Stoc | SwissCars', description: 'Vezi toate mașinile disponibile la SwissCars.' },
            ru: { title: 'Автомобили в Наличии | SwissCars', description: 'Все автомобили, доступные в наличии у SwissCars.' },
            en: { title: 'Cars in Stock | SwissCars', description: 'Browse every car currently available at SwissCars.' },
        },
    });
}
```

- [ ] **Step 8: Use it in `app/[locale]/leasing/page.tsx` (adds RU/EN, removes the TODO)**

Replace line 5 with `import { localizedPageMetadata } from '@i18n/routing';` and lines 12-25 (TODO comment included) with:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/leasing',
        copyByLocale: {
            ro: { title: 'Leasing Auto | SwissCars.md', description: 'Află opțiunile de finanțare și leasing pentru mașinile importate din Elveția.' },
            ru: { title: 'Автолизинг | SwissCars.md', description: 'Узнайте варианты финансирования и лизинга автомобилей, импортированных из Швейцарии.' },
            en: { title: 'Car Leasing | SwissCars.md', description: 'Explore financing and leasing options for cars imported from Switzerland.' },
        },
    });
}
```

- [ ] **Step 9: Use it in `app/[locale]/contact/page.tsx` (adds RU/EN, removes the TODO)**

Replace line 4 with `import { localizedPageMetadata } from '@i18n/routing';` and lines 11-24 (TODO comment included) with:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/contact',
        copyByLocale: {
            ro: { title: 'Contact | SwissCars.md', description: 'Contactează SwissCars pentru orice informație legată de importul sau vânzarea auto din Elveția.' },
            ru: { title: 'Контакты | SwissCars.md', description: 'Свяжитесь со SwissCars по любым вопросам об импорте или продаже автомобилей из Швейцарии.' },
            en: { title: 'Contact | SwissCars.md', description: 'Contact SwissCars about importing or buying a car from Switzerland.' },
        },
    });
}
```

- [ ] **Step 10: Verify**

```powershell
git grep -n "TODO: title/description" -- app
foreach ($page in 'app\[locale]\about\page.tsx', 'app\[locale]\services\page.tsx', 'app\[locale]\inventory\page.tsx', 'app\[locale]\leasing\page.tsx', 'app\[locale]\contact\page.tsx') {
    Get-Content -LiteralPath $page | Select-String -Pattern 'localeOpenGraph\(|localeTwitter\(|localeAlternates\(' | ForEach-Object { "${page}: $($_.Line.Trim())" }
}
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint app i18n
npx vitest run
```
Expected: both greps print nothing; tsc exit 0; eslint 0 errors; all tests pass.

- [ ] **Step 11: Commit**

```powershell
git add -- i18n/routing.ts i18n/routing.test.ts "app/[locale]/about/page.tsx" "app/[locale]/services/page.tsx" "app/[locale]/inventory/page.tsx" "app/[locale]/leasing/page.tsx" "app/[locale]/contact/page.tsx"
git commit -m "feat(i18n): build static page metadata from one copy table per locale"
```

---

### Task 6: Move the homepage editor defaults into a data module (audit 3.1)

`HomepageContentForm.tsx:17-85` holds 70 lines of marketing copy.

**Files:**
- Create: `features/site-settings/model/default-homepage-content.ts`
- Test: `features/site-settings/model/default-homepage-content.test.ts`
- Modify: `features/site-settings/ui/HomepageContentForm.tsx:17-85`
- Modify: `features/site-settings/README.md` (the `## Structură` block)

**Interfaces:**
- Consumes: `HomepageContent` (`features/site-settings/site-settings.types.ts`), `HomepageContentSchema` (`features/site-settings/site-settings.schema.ts`).
- Produces: `export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent`.

- [ ] **Step 1: Write the failing test** — `features/site-settings/model/default-homepage-content.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { HomepageContentSchema } from '../site-settings.schema';
import { DEFAULT_HOMEPAGE_CONTENT } from './default-homepage-content';

describe('DEFAULT_HOMEPAGE_CONTENT', () => {
    it('is a homepage the save action accepts', () => {
        expect(HomepageContentSchema.safeParse(DEFAULT_HOMEPAGE_CONTENT).success).toBe(true);
    });

    it('offers at least one hero slide so a fresh homepage is not empty', () => {
        expect(DEFAULT_HOMEPAGE_CONTENT.hero_slides.length).toBeGreaterThan(0);
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run features/site-settings/model/default-homepage-content.test.ts`
Expected: FAIL — cannot resolve `./default-homepage-content`.

- [ ] **Step 3: Create the module by moving the constant**

Create `features/site-settings/model/default-homepage-content.ts`:
- first line: `import type { HomepageContent } from '../site-settings.types';`;
- then paste lines 17-85 of `HomepageContentForm.tsx` unchanged, renaming `const DEFAULT_CONTENT: HomepageContent = {` to `export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {`.

Then in `HomepageContentForm.tsx`:
- delete lines 17-85;
- keep `import type { HomepageContent } from '../site-settings.types';` (the form still types `useForm<HomepageContent>`), and add below it `import { DEFAULT_HOMEPAGE_CONTENT } from '../model/default-homepage-content';`;
- replace `{ ...DEFAULT_CONTENT, ...initialData }` with `{ ...DEFAULT_HOMEPAGE_CONTENT, ...initialData }`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run features/site-settings`
Expected: PASS (schema tests + 2 new tests).

- [ ] **Step 5: Update `features/site-settings/README.md`**

In the `## Structură` code block, after the `site-settings.types.ts` line add:
```
model/
  default-homepage-content.ts — DEFAULT_HOMEPAGE_CONTENT, valorile editorului de homepage (+ .test.ts)
```

- [ ] **Step 6: Gate and commit**

```powershell
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint features/site-settings
git add -- features/site-settings/model features/site-settings/ui/HomepageContentForm.tsx features/site-settings/README.md
git commit -m "refactor(site-settings): keep homepage editor defaults in a data module"
```

---

### Task 7: Delete orphan files (audit 2.1)

Each file below has zero importers. The audit verified this with Grep over the whole repo; re-check in Step 1.

**Files:**
- Delete: `shared/ui/EmptyState.*`, `shared/ui/LoadingSpinner.*`, `shared/ui/admin/AdminPageHeader.*`, `shared/ui/admin/FormErrorMessage.*`, `shared/seo/` (whole folder), `public/media/general/favicon.png`
- Modify: `CLAUDE.md:106-108` (Project Structure tree)

- [ ] **Step 1: Re-verify there are no importers**

```powershell
git grep -n -E "EmptyState|LoadingSpinner|AdminPageHeader|FormErrorMessage|@shared/seo|favicon\.png" -- app features shared core i18n
```
Expected: matches only inside the files being deleted (their own definitions). Stop and report if any other file matches.

- [ ] **Step 2: Delete**

```powershell
git rm -q -- "shared/ui/EmptyState.*" "shared/ui/LoadingSpinner.*" "shared/ui/admin/AdminPageHeader.*" "shared/ui/admin/FormErrorMessage.*" public/media/general/favicon.png
git rm -q -r -- shared/seo
git status --short
```
Expected: only `D` entries for those paths.

- [ ] **Step 3: Update the tree in `CLAUDE.md`**

Replace:
```
├── ui/                # Pagination, Toast, EmptyState, LoadingSpinner, Preloader, Reveal, WhatsAppFloat, admin/{DataTable,ImageUploader,AdminPageHeader,FormErrorMessage}, styles/components.css
├── formatting/       # format (formatPrice, formatNumber), sanitize
├── seo/               # StructuredData, structured-data
```
with:
```
├── ui/                # Pagination, Toast, Preloader, Reveal, WhatsAppFloat, admin/{DataTable,ImageUploader}, styles/components.css
├── formatting/       # format (formatPrice), sanitize, pick-translation
```

- [ ] **Step 4: Gate and commit**

```powershell
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx vitest run 2>&1 | Select-Object -Last 4
git add -- CLAUDE.md
git commit -m "chore(shared): delete components and SEO helpers nothing imports"
```

---

### Task 8: Trim unused exports (audit 2.2)

**Files:**
- Modify: `shared/formatting/format.ts:9-15`
- Modify: `i18n/navigation.ts:4-5`
- Modify: `features/inventory/index.ts:1`
- Modify: `features/inventory/server.ts:7`
- Modify: `features/notifications/model/lead-alert-message.ts:15,24`

- [ ] **Step 1: Delete `formatNumber` from `shared/formatting/format.ts`**

Remove lines 9-15:
```ts
/**
 * Format a number with space separator (European style)
 * Example: 15000 -> "15 000"
 */
export function formatNumber(value: number): string {
    return Math.round(value).toLocaleString('fr-FR');
}
```

- [ ] **Step 2: Export only the navigation helpers in use**

Replace `i18n/navigation.ts:4-5`:
```ts
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
```
with:
```ts
export const { Link, usePathname } = createNavigation(routing);
```

- [ ] **Step 3: Drop unused re-exports from the inventory entries**

- In `features/inventory/index.ts`, delete line 1 `export { default as CarCard } from './ui/CarCard';`.
- In `features/inventory/server.ts`, delete line 7 `    findSimilarCars,`.

- [ ] **Step 4: Make the escaping helpers module-private**

In `features/notifications/model/lead-alert-message.ts`:
- line 15: `export function escapeHtml(` becomes `function escapeHtml(`;
- line 24: `export function escapeTelegramMarkdown(` becomes `function escapeTelegramMarkdown(`.

The test imports only `formatEmailLeadAlert`, `formatTelegramLeadAlert` and `toSafeHttpUrl`.

- [ ] **Step 5: Verify nothing imported the removed exports and commit**

```powershell
git grep -n -E "formatNumber|useRouter|getPathname|\bredirect\b.*@i18n/navigation|CarCard.*from '@features/inventory'|findSimilarCars.*@features/inventory/server|escapeHtml|escapeTelegramMarkdown" -- app features shared core i18n ":!features/notifications/model/lead-alert-message.ts" ":!features/inventory/server/car-catalog-repository.ts" ":!features/inventory/ui/SimilarCars.tsx"
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx vitest run 2>&1 | Select-Object -Last 4
git add -- shared/formatting/format.ts i18n/navigation.ts features/inventory/index.ts features/inventory/server.ts features/notifications/model/lead-alert-message.ts
git commit -m "refactor(shared): stop exporting helpers no module imports"
```
Expected: the grep prints nothing; tsc exit 0; tests pass.

---

### Task 9: Clear the unused-code warnings (audit 2.4)

**Files:**
- Modify: `eslint.config.mjs` (base rule block)
- Modify:
  - `app/[locale]/about/page.tsx:5`
  - `app/[locale]/inventory/[slug]/page.tsx:1`, plus lines 187 and 297
  - `app/[locale]/page.tsx:1,21-22`
  - `app/admin/_shell/AdminLayoutClient.tsx:9-10`
  - `features/inventory/ui/CarCard.tsx:3,16,47`
  - `features/inventory/ui/FavoriteButton.tsx:12,16`
  - `features/site-settings/ui/ServicesSectionClient.tsx:4,8-15`
  - `features/site-settings/ui/WhyUsAccordionClient.tsx:7`
  - `shared/ui/admin/ImageUploader.tsx:5,37`
  - `features/inventory/server/car-admin-repository.ts:84`

- [ ] **Step 1: Let rest-sibling omission count as intentional**

`const { created_at, ...car } = parsed.data` strips a field on purpose, as in `features/inventory/actions.ts:30`, `features/reviews/actions.ts:29` and `features/inventory/server/car-admin-repository.ts:84`. In `eslint.config.mjs`, add this object as the first entry after `...nextTs,`:
```js
  {
    rules: {
      // Destructuring a field away (`const { created_at, ...car } = row`) is how rows are stripped before a write.
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
    },
  },
```
Then in `features/inventory/server/car-admin-repository.ts:84` rename `id: _sourceId` to `id` only if that does not shadow a name. The function parameter is `carId`, so `const { id, created_at, updated_at, car_images, ...carData } = car;` is safe.

- [ ] **Step 2: Remove unused imports and variables**

| File | Edit |
|---|---|
| `app/[locale]/about/page.tsx:5` | `import { ShieldCheck, Zap, Globe, Search, ClipboardCheck, Truck, ChevronRight } from 'lucide-react';` becomes `import { ShieldCheck, Zap, Globe, ChevronRight } from 'lucide-react';` |
| `app/[locale]/inventory/[slug]/page.tsx:1` | `import { getLocale, getTranslations } from 'next-intl/server';` becomes `import { getTranslations } from 'next-intl/server';` |
| `app/[locale]/page.tsx:1` | Delete `import { getLocale } from 'next-intl/server';` |
| `app/[locale]/page.tsx:21-22` | `export async function generateMetadata({ params }: Props): Promise<Metadata> {` + `    const { locale } = await params;` become `export async function generateMetadata(): Promise<Metadata> {` (delete the `locale` line). Keep `type Props`: `HomePage({ params }: Props)` at line 33 still uses it. |
| `app/admin/_shell/AdminLayoutClient.tsx:9-10` | Delete the blank line 9 and `import Image from 'next/image';` |
| `features/inventory/ui/CarCard.tsx:3` | `import { useTranslations, useLocale } from 'next-intl';` becomes `import { useTranslations } from 'next-intl';`; delete line 16 `    const locale = useLocale();` |
| `features/inventory/ui/FavoriteButton.tsx:12,16` | Delete `    carSlug: string;`; `({ carId, carSlug, carName }: Props)` becomes `({ carId, carName }: Props)` |
| Callers of `FavoriteButton` | Remove ` carSlug={car.slug}` in `features/inventory/ui/CarCard.tsx:47` and `app/[locale]/inventory/[slug]/page.tsx:187,297` |
| `features/site-settings/ui/ServicesSectionClient.tsx` | Delete line 4 `import { useTranslations } from 'next-intl';` and lines 8-15 (`const SERVICES = [ … ];` plus the following blank line) |
| `features/site-settings/ui/WhyUsAccordionClient.tsx:7` | Delete `const ITEMS = ['q1', 'q2', 'q3', 'q4'] as const;` and the blank line after it |
| `shared/ui/admin/ImageUploader.tsx:5` | `import { Image as ImageIcon, X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';` becomes `import { X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';` |
| `shared/ui/admin/ImageUploader.tsx:37` | `const { data, error } = await supabase.storage` becomes `const { error } = await supabase.storage` |

- [ ] **Step 3: Verify the unused-vars warnings are gone**

```powershell
npx eslint . 2>&1 | Select-String -Pattern 'no-unused-vars'
npx eslint . 2>&1 | Select-Object -Last 2
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx vitest run 2>&1 | Select-Object -Last 4
```
Expected:
- the first command lists only `sentry.config.ts` (`SENTRY_AUTH_TOKEN`), which stays until the Sentry decision (follow-up plan A);
- 0 errors, about 8 warnings (the `<img>` ones, `react-hooks/incompatible-library`, `coverage/` and the Sentry one);
- tsc exit 0;
- all tests pass.

- [ ] **Step 4: Commit**

```powershell
git add -- eslint.config.mjs "app/[locale]/about/page.tsx" "app/[locale]/inventory/[slug]/page.tsx" "app/[locale]/page.tsx" app/admin/_shell/AdminLayoutClient.tsx features/inventory/ui/CarCard.tsx features/inventory/ui/FavoriteButton.tsx features/site-settings/ui/ServicesSectionClient.tsx features/site-settings/ui/WhyUsAccordionClient.tsx shared/ui/admin/ImageUploader.tsx features/inventory/server/car-admin-repository.ts
git commit -m "chore(tooling): remove unused imports, props and constants"
```

---

### Task 10: Tidy the lead inbox confirm flow (audit 1.2)

Three pass-through wrappers, a ternary with identical branches, and a confirm timer that is never cleared (it fires after unmount, and repeated clicks stack timers).

**Files:**
- Modify: `features/leads/ui/LeadInbox.tsx:3` (imports), `:24`, `:34-48`, and the JSX at `:171`, `:178`, `:184`, plus the `markEveryLeadRead` usage

- [ ] **Step 1: Find every usage of the names being changed**

```powershell
Select-String -Path features/leads/ui/LeadInbox.tsx -Pattern 'toggleReadState|toggleImportance|markEveryLeadRead|confirmDelete|useState|useEffect|useRef' | ForEach-Object { "$($_.LineNumber): $($_.Line.Trim())" }
```

- [ ] **Step 2: Replace the wrappers and the timer**

- Make sure the React import includes `useEffect` and `useRef`, e.g. `import { useEffect, useRef, useState } from 'react';`.
- Replace lines 34-48:
```tsx
    const toggleReadState = (id: string, is_read: boolean) => setReadState(id, is_read);

    const toggleImportance = (id: string, is_important: boolean) => setImportance(id, is_important);

    const confirmAndRemoveLead = (id: string) => {
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000);
            return;
        }
        setConfirmDelete(null);
        removeLead(id);
    };

    const markEveryLeadRead = () => markAllRead();
```
with:
```tsx
    const confirmResetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(confirmResetTimer.current), []);

    // Delete needs a second click within 3 seconds.
    const confirmAndRemoveLead = (id: string) => {
        clearTimeout(confirmResetTimer.current);
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            confirmResetTimer.current = setTimeout(() => setConfirmDelete(null), 3000);
            return;
        }
        setConfirmDelete(null);
        removeLead(id);
    };
```
- In the JSX:
  - `toggleReadState(` becomes `setReadState(`;
  - `toggleImportance(` becomes `setImportance(`;
  - `markEveryLeadRead` becomes `markAllRead`;
  - at line 184, `className={confirmDelete === lead.id ? 'action-btn action-btn-delete' : 'action-btn action-btn-delete'}` becomes `className="action-btn action-btn-delete"`.

- [ ] **Step 3: Verify**

```powershell
Select-String -Path features/leads/ui/LeadInbox.tsx -Pattern 'toggleReadState|toggleImportance|markEveryLeadRead'
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint features/leads
npx vitest run features/leads
```
Expected: no `Select-String` output; tsc exit 0; eslint 0 errors; leads tests pass.

- [ ] **Step 4: Commit**

```powershell
git add -- features/leads/ui/LeadInbox.tsx
git commit -m "refactor(leads): drop inbox pass-through handlers and clear the delete confirm timer"
```

---

### Task 11: Rewrite comments that narrate past bugs (audit 1.4)

Comments state the current rule; the bug history already lives in git.

**Files:**
- Modify: `i18n/routing.ts` (JSDoc of `localeOpenGraph` and `localeTwitter`)
- Modify: `i18n/routing.test.ts:30-33, 51-53, 81-83`
- Modify: `app/[locale]/inventory/[slug]/page.tsx:49-53`

- [ ] **Step 1: `i18n/routing.ts` — `localeOpenGraph` JSDoc**

Replace:
```ts
/**
 * `openGraph` for Next metadata, locale- and path-aware.
 *
 * Next replaces a segment's whole `openGraph` object rather than
 * deep-merging it with an ancestor's — a page that defines its own
 * `openGraph` loses whatever the layout set (siteName, url, type, …)
 * unless it's repeated here. Confirmed live: pages that didn't override this
 * inherited the locale layout's openGraph object, which never set `url` at
 * all, so `og:url` was simply absent on every page under [locale].
 */
```
with:
```ts
/**
 * `openGraph` for Next metadata, locale- and path-aware.
 * Next replaces a segment's whole `openGraph` object instead of merging it, so every field is set here.
 */
```

- [ ] **Step 2: `i18n/routing.ts` — `localeTwitter` JSDoc**

Replace:
```ts
/**
 * `twitter` for Next metadata, locale-aware.
 *
 * Confirmed live: pages under [locale] never defined their own `twitter`
 * block, so every locale — Russian and English included — inherited the
 * root layout's hardcoded Romanian title/description.
 */
```
with:
```ts
/** `twitter` for Next metadata; each page sets it, otherwise the root layout's Romanian card is inherited. */
```

- [ ] **Step 3: `i18n/routing.test.ts` — drop the three history comments**

- Delete lines 30-33 (`// This was the actual bug: …` through `// path, and this locks the shape in.`).
- Delete lines 51-53 (`// Confirmed live: omitting \`url\` here …` through `// openGraph object rather than merging it with an ancestor's.`).
- Delete lines 81-83 (`// Confirmed live: pages under [locale] …` through `// inherited the root layout's hardcoded Romanian title/description.`).

The test names already state the behaviour.

- [ ] **Step 4: `app/[locale]/inventory/[slug]/page.tsx:49-53`**

Replace:
```tsx
        // The previous openGraph object here only set url/images — since a
        // page's openGraph fully replaces the layout's rather than merging,
        // og:title and og:description were silently absent on every car
        // page, and there was no twitter block at all (inherited the root
        // layout's hardcoded Romanian one, same bug as every other page).
```
with:
```tsx
        // A page's openGraph replaces the layout's instead of merging, so title and description are set here too.
```

- [ ] **Step 5: Verify and commit**

```powershell
git grep -n -E "Confirmed live|This was the actual bug|The previous openGraph" -- i18n app
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx vitest run i18n
git add -- i18n/routing.ts i18n/routing.test.ts "app/[locale]/inventory/[slug]/page.tsx"
git commit -m "docs(i18n): state metadata rules instead of narrating past bugs"
```
Expected: the grep prints nothing; tsc exit 0; i18n tests pass.

---

### Task 12: Final verification and bookkeeping

**Files:**
- Modify: `docs/superpowers/specs/2026-09-14-code-audit-report.md` (append a status section)

- [ ] **Step 1: Full gate**

```powershell
npx tsc --noEmit -p tsconfig.json; "tsc exit: $LASTEXITCODE"
npx eslint . 2>&1 | Select-Object -Last 2
npx vitest run 2>&1 | Select-Object -Last 4
npm run build 2>&1 | Select-String -Pattern 'seed-defaults|error|Compiled' | Select-Object -First 5
```
Expected:
- tsc exit 0;
- eslint 0 errors;
- all tests pass: 174 + 4 (pick-translation) + 2 (routing metadata) + 2 (defaults) = 182;
- build compiles, and the route list has no `/api/seed-defaults`.

- [ ] **Step 2: Append to the audit report**

```markdown
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

Rămân pentru planurile următoare: A–F de mai jos.
```

- [ ] **Step 3: Commit**

```powershell
git add -- docs/superpowers/specs/2026-09-14-code-audit-report.md
git commit -m "docs(tooling): record phase 1 audit remediation status"
```

---

## Follow-up plans (need a decision first — not part of this plan)

| Plan | Audit | Decision needed |
|---|---|---|
| **A. Sentry** | 2.1, 2.3 | Integrate properly (`instrumentation.ts` + `instrumentation-client.ts`, DSN in env), or delete `sentry.config.ts` and `@sentry/nextjs`. |
| **B. Database migrations** | 2.5 | Move `database/*.sql` into Supabase CLI migrations (`supabase/migrations/`), delete the two stale files there, then `supabase gen types` for `Lead`/`Car`. Needs the Supabase project linked. |
| **C. site-settings structure** | 3.1, 3.3, 1.3, 1.5 | Sections receive data as props (no repository access from `ui/`); split `ui/` into public and admin; one `TranslatedFieldInputs` for the 7 `Homepage*Form`; CSS modules instead of inline styles. Needs visual review. |
| **D. Car detail page** | 1.5, 3.2 | Extract JSON-LD builders and description resolution into `features/inventory/model`; one `CarPurchaseCard` for the 3 repeated blocks; `useFocusTrap`/`useGalleryKeyboard` hooks out of `CarGallery.tsx`. |
| **E. Admin UX consistency** | 1.3, 1.5, 2.2 | One admin language (RO or EN); `useConfirmedAdminAction` with Toast instead of `confirm`/`alert` in 4 tables; one error banner component for `PartnerForm`/`ReviewForm`; `features/leads/server.ts` exposes named reads instead of the repository object; trim public-entry type exports nobody imports. |
| **F. Documentation** | 2.5 | Rewrite the architecture sections of `README.md`, `ACCESSIBILITY.md`, `ANALYTICS.md` from `CLAUDE.md`. |
| **G. Small typing fixes** | 1.1 | `hasAdminRole` returns `boolean` and `requireAdmin` checks `!user` first (drops the cast); `getPublicSiteConfig` builds the object without `as any`; parallel reads in `ContactBanner`/`StatsSection`. |
