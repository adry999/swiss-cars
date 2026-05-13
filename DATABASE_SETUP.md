# Database Setup & Switching Guide

## Setup bază de date nouă

Rulează fișierul de mai jos **o singură dată** în **Supabase SQL Editor** al proiectului nou:

```
database/SETUP_NEW_DB.sql
```

Acesta creează în ordine:
1. Toate tabelele (`cars`, `car_images`, `reviews`, `partners`, `site_settings`, `leads_inquiries`, `subscribers`)
2. Indexurile necesare
3. Row Level Security pe toate tabelele
4. Politicile de read (publice) și write (autentificat)
5. Storage bucket `car-images`
6. Date inițiale (`contact_info` în `site_settings`)

---

## Structura fișierelor de environment

```
swiss-next/
├── .env.local       ← folosit la `npm run dev` (local)
├── .env.production  ← folosit la build-ul de producție (Vercel)
```

Ambele fișiere conțin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Cum comuți între baze de date local

### Opțiunea 1 — Editezi direct `.env.local`

Schimbă `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY` cu valorile bazei de date dorite, apoi repornești serverul:

```bash
npm run dev
```

### Opțiunea 2 — Două fișiere separate (recomandat)

Păstrează credențialele fiecărei baze de date în fișiere separate:

```
.env.local          ← activ (cel folosit de Next.js)
.env.db-veche       ← backup baza veche
.env.db-noua        ← backup baza nouă
```

**Comutare rapidă:**
```bash
# Copiază credențialele bazei noi în .env.local
cp .env.db-noua .env.local

# Sau înapoi la baza veche
cp .env.db-veche .env.local
```

> **Important:** `.env.local` este exclus din git (prin `.gitignore`) — credențialele nu vor fi niciodată expuse.

---

## Unde găsești credențialele Supabase

În Supabase Dashboard → **Settings** → **API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Erori frecvente

### `Could not find the table 'public.site_settings'`
Baza de date nu are tabelele create. Rulează `database/SETUP_NEW_DB.sql`.

### `Invalid API key`
Credențialele din `.env.local` nu corespund cu baza de date activă. Verifică URL-ul și cheia anon.

### Modificările nu se reflectă după schimbarea `.env.local`
Repornește serverul de development (`Ctrl+C` → `npm run dev`).
