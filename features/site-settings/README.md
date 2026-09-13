# features/site-settings

## Scop

Tot ce e ținut în tabela `site_settings`: rândul `site_config` (editat în `/admin/settings`) și
rândul `homepage_content` (editat în `/admin/homepage`), plus secțiunile publice de pe homepage
care le citesc.

## Public API

`@features/site-settings` (client-safe):
- `HeroSlider`, `DualCTABanner` — secțiuni publice fără citire de settings.

`@features/site-settings/server` (server-only):
- `AboutSection`, `StatsSection`, `ServicesSection`, `WhyUsAccordion`, `ContactBanner`,
  `LeasingSection` — Server Components ce citesc `homepage_content` / `site_config`.

`@features/site-settings/admin` (client-safe, doar UI de admin):
- `SiteConfigForm` — formularul `site_config` (câte o secțiune per bloc din pagina de admin).
- `HomepageContentForm` — formularul `homepage_content`.

`@features/site-settings/actions` (Server Actions, protejate de `requireAuth`):
- `saveSettings(key, value)`.

Citirile (`getSiteConfig`, `getPublicSiteConfig`, `getHomepageContent`, `getNotificationConfig`)
rămân în `lib/settings/index.ts`, nu în acest feature — vezi „De urmat”.

## Dependențe

Poate importa `@core/*` și, tranzitoriu, `@/lib/*` și `@/components/ui`, `@/components/admin`:
- `@core/supabase/server-client` în `actions.ts`.
- `@/lib/utils/requireAuth`, `@/lib/settings` (tipuri `SiteConfig`, `PublicSiteConfig`), `@/lib/types` (`HomepageContent`).
- `@/components/admin/ImageUploader`, `@/components/ui/Toast`.

Nu importă alt feature.

## Structură

```
index.ts / admin.ts / server.ts / actions.ts
ui/
  SiteConfigForm (+ .module.css), SiteConfigGeneralSection, SiteConfigLogoSection,
  SiteConfigContactSection, SiteConfigSocialSection, SiteConfigTagManagerSection, SiteConfigNotificationsSection
  HomepageContentForm, HomepageHeroForm, HomepageAboutForm, HomepageStatsForm,
  HomepageServicesForm, HomepageLeasingForm, HomepageContactBannerForm, HomepageWhyUsForm
  HeroSlider, DualCTABanner (+ css)
  AboutSection, StatsSection (+ StatsSectionClient), ServicesSection (+ ServicesSectionClient),
  WhyUsAccordion (+ WhyUsAccordionClient), ContactBanner, LeasingSection (+ css)
```

## De urmat

- `saveSettings(key, value)` acceptă orice cheie și valoare nevalidată — de despărțit în
  `saveSiteConfig` / `saveHomepageContent`, fiecare cu schema Zod proprie.
- `lib/settings/index.ts` se mută în `server.ts` al feature-ului într-o fază viitoare.

## Testare

Fără teste proprii încă — formularele nu au logică netrivială, iar secțiunile publice depind de
`lib/settings`. Rulare izolată: `npx vitest run features/site-settings`
