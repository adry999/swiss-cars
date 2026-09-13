# features/leasing

## Scop

Calculatorul de leasing afișat pe pagina publică `/leasing` — estimează rata lunară dintr-un
preț, avans, durată și dobândă anuală, fără să citească date din backend.

## Public API

`@features/leasing` (client-safe):
- `LeasingCalculator` — componentă client, fără props.

## Dependențe

Doar `next-intl` (traduceri) și `@/i18n/navigation` (link către `/contact`).

## Structură

```text
features/leasing/
├── index.ts
└── ui/
    ├── LeasingCalculator.tsx
    └── LeasingCalculator.module.css
```
