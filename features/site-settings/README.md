# features/site-settings

## Scop

Tot ce e ținut în tabela `site_settings`: rândul `site_config` (editat în `/admin/settings`) și
rândul `homepage_content` (editat în `/admin/homepage`), plus secțiunile publice de pe homepage
care le citesc.

## Public API

`@features/site-settings` (client-safe):
- `HeroSlider`, `DualCTABanner` — secțiuni publice fără citire de settings.

`@features/site-settings/server` (server-only):
- `getSiteConfig(): Promise<SiteConfig>` — rândul `site_config` complet, inclusiv credențiale; doar pentru cod de server.
- `getPublicSiteConfig(): Promise<PublicSiteConfig>` — `site_config` cu credențialele scoase; singura variantă sigură de trimis către browser.
- `getHomepageContent(): Promise<Partial<HomepageContent>>` — rândul `homepage_content`.
- `getNotificationConfig(): Promise<NotificationConfig>` — credențialele Telegram/email; mediul are prioritate față de `site_config` (vezi „De urmat”).
- `AboutSection`, `StatsSection`, `ServicesSection`, `WhyUsAccordion`, `ContactBanner`,
  `LeasingSection` — Server Components ce citesc `homepage_content` / `site_config`.

`@features/site-settings/admin` (client-safe, doar UI de admin):
- `SiteConfigForm` — formularul `site_config` (câte o secțiune per bloc din pagina de admin).
- `HomepageContentForm` — formularul `homepage_content`.

`@features/site-settings/actions` (Server Actions, protejate de `requireAdmin`):
- `saveSettings(key, value)`.

## Dependențe

Poate importa `@core/*`, `@shared/*` și `@config/*`:
- `@core/supabase/server-client` (`createServerSupabaseClient`, `createStaticSupabaseClient`) în `actions.ts` și `server/site-settings-repository.ts`.
- `@config/server-environment` (`getServerEnvironment`) în `server/site-settings-repository.ts`, pentru `getNotificationConfig`.
- `@shared/session/require-admin` (`requireAdmin`) în `actions.ts`.
- `@shared/contracts/translated-field` pentru conținutul multilingv al homepage-ului.
- `@shared/ui/admin/ImageUploader`, `@shared/ui/Toast/ToastContext`.

Nu importă alt feature.

## Structură

```
site-settings.types.ts — SiteConfig, PublicSiteConfig, HomepageContent, HeroSlide, NotificationConfig
index.ts / admin.ts / server.ts / actions.ts
server/
  site-settings-repository.ts — getSiteConfig, getPublicSiteConfig, getHomepageContent, getNotificationConfig (cache pe request cu React.cache)
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
- `getNotificationConfig()` mai citește `telegram_bot_token`/`telegram_chat_id`/`notification_email` din `site_config` când mediul nu are perechea Telegram completă — fallback-ul rămâne până când rândul din bază e confirmat curat de credențiale, apoi se elimină.

## Testare

Fără teste proprii încă — formularele nu au logică netrivială, iar `site-settings-repository.ts` e
o înfășurare subțire peste Supabase. Rulare izolată: `npx vitest run features/site-settings`
