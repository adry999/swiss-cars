# features/translations

## Scop

Oferă interfață de editare pentru mesajele de traducere (i18n) din `messages/*.json` fără a accesa direct fișierele.

## Public API

`@features/translations/server` (server-only):
- `readLocaleMessages(locale: string): Promise<MessagesTree | null>` — citește și parse-ază fișierul JSON pentru o locală (protejat de `requireAdmin`).
- Tip: `MessagesTree`.

`@features/translations/actions` (Server Actions, protejate de `requireAdmin`):
- `saveLocaleMessages(locale: string, messages: unknown): Promise<ActionResult<'invalid-locale' | 'invalid-input' | 'unavailable'>>` — scrie mesajele și revalidează layout-ul.

`@features/translations/admin` (client-safe, doar UI de admin):
- `TranslationsEditor` — componentă React de editare.
- Tip: `MessagesTree`.

Feature-ul nu are `index.ts`: editorul e folosit doar în admin, prin `admin.ts`.

## Dependențe

- `@shared/session/require-admin` (`requireAdmin`) în `server.ts` și `actions.ts`.
- `@i18n/routing` pentru lista localelor, în `server/locale-messages-file.ts`.
- `@shared/contracts/action-result` pentru `ActionResult`.

Localele sunt verificate față de `routing.locales` înainte să intre într-o cale de fișier, așa că un argument ca `../ro` nu poate ieși din `messages/`.

## Evenimente

Niciun eveniment publicat.

## Limitare

Editorul scrie mesajele în directorul `messages/` pe serverul local, care este read-only și nepersistent pe Vercel. Modificările funcționează doar în dezvoltare locală.

## Structură

```
translations.types.ts       — MessagesTree
server.ts                   — readLocaleMessages
actions.ts                  — saveLocaleMessages
admin.ts                    — punct de intrare UI de admin
ui/
  TranslationsEditor.tsx    — componenta de editare
README.md                   — această documentație
```
