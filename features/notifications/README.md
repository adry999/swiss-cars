# features/notifications

## Scop

Formatează și livrează alerte despre lead-uri noi către canale externe (Telegram, email prin
Resend). Nu se abonează singur la niciun eveniment — expune doar construcția canalelor și a
notifier-ului.

## Public API

`@features/notifications` (server-only, singurul punct de intrare):
- `createLeadAlertNotifier({ channels })` — trimite un `LeadInquirySubmitted` pe toate canalele
  primite, în paralel; o livrare eșuată e logată și raportată, nu aruncată.
- `createTelegramLeadAlertChannel({ botToken, chatId, fetchImpl? })` — canal Telegram (MarkdownV2).
- `createResendLeadAlertChannel({ apiKey, recipient, sender?, fetchImpl? })` — canal email prin API-ul Resend.
- Tipuri: `LeadAlertNotifier`, `LeadAlertChannel`, `LeadAlertDeliveryReport`.

## Dependențe

Poate importa `@core/*`, `@shared/contracts/*` și, tranzitoriu, `@/lib/*`. În prezent nu
importă din `@/lib/*` — doar `@shared/contracts/domain-events` pentru tipul `LeadInquirySubmitted`.
Nu importă alt feature.

## Evenimente

Modulul nu se abonează singur la `leads.inquiry-submitted`. Abonarea și livrarea sunt compuse în
`app/_composition/lead-inquiry-submission.ts`: la publicarea evenimentului de către
`features/leads`, acesta construiește canalele (după configurația din `lib/settings`) și rulează
`notifyLeadSubmitted` în interiorul unui `after()` din Next, ca să nu întârzie răspunsul HTTP.

## Structură

```
notifications.types.ts                — LeadAlertChannel, LeadAlertDeliveryReport
index.ts                               — punct de intrare server-only ('server-only')
model/
  lead-alert-message.ts                — formatare pură: Telegram MarkdownV2, HTML email, subiect, URL sigur, fus orar
  lead-alert-message.test.ts           — teste de formatare și escapare pe payload-uri de injecție
server/
  lead-alert-notifier.ts               — fan-out către canale, Promise.allSettled
  lead-alert-notifier.test.ts          — teste ale notifier-ului (canale false)
  telegram-lead-alert-channel.ts       — canal Telegram (fetch către api.telegram.org)
  resend-lead-alert-channel.ts         — canal email (fetch către api.resend.com)
  lead-alert-channels.test.ts          — teste ale celor două canale (fetchImpl injectat)
test-support/
  lead-inquiry-submitted.ts            — builder de payload LeadInquirySubmitted pentru teste
```

## Testare

Testele stau lângă sursă și rulează toate cu `// @vitest-environment node` (nu ating DOM-ul).
Fixture-ul comun este `test-support/lead-inquiry-submitted.ts` (`buildLeadInquirySubmitted`).

Rulare izolată: `npx vitest run features/notifications`
