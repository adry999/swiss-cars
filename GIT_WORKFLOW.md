# Git Workflow — SwissCars

## Branches

| Branch | Scop |
|--------|------|
| `dev`  | Dezvoltare zilnică — aici lucrezi |
| `main` | Producție — Vercel deployează din main |

> Pe Vercel: **Settings → Git → Production Branch → main**

## Workflow zilnic (pe dev)

```bash
# 1. Asigură-te că ești pe dev
git checkout dev

# 2. Vezi ce fișiere s-au modificat
git status

# 3. Adaugă fișierele modificate
git add .

# 4. Fă commit
git commit -m "Descriere scurtă a modificării"

# 5. Trimite pe GitHub
git push origin dev
```

## Deploy în producție (dev → main)

```bash
git checkout main
git merge dev
git push origin main

# Înapoi pe dev
git checkout dev
```

## Comenzi utile

```bash
# Diferențele față de ultimul commit
git diff

# Istoricul commiturilor
git log --oneline

# Anulează modificările unui fișier (înainte de git add)
git checkout -- cale/catre/fisier.tsx

# Scoate un fișier din staging (după git add, înainte de commit)
git reset cale/catre/fisier.tsx
```

## Branch nou pentru o funcționalitate

```bash
# 1. Pornești de pe dev actualizat
git checkout dev
git pull origin dev

# 2. Creezi branch nou
git checkout -b feature/nume-functionalitate

# 3. Lucrezi, commit-uri normale...

# 4. Trimiți pe GitHub
git push -u origin feature/nume-functionalitate

# 5. Integrezi în dev (sau faci PR pe GitHub)
git checkout dev
git merge feature/nume-functionalitate
git push origin dev
```

## Mesaje de commit

Format [Conventional Commits](https://www.conventionalcommits.org/), în engleză, la imperativ, maximum 72 de caractere:

```text
type(scope): subject
```

| type | când |
|------|------|
| `feat` | funcționalitate nouă |
| `fix` | corectarea unui bug |
| `refactor` | restructurare fără schimbare de comportament |
| `test` | teste noi sau corectate |
| `docs` | documentație |
| `build` | dependențe, configurare build/lint/TypeScript |
| `perf` | performanță |
| `chore` | întreținere care nu intră în categoriile de mai sus |

`scope` = feature-ul sau stratul atins: `auth`, `inventory`, `leads`, `leasing`, `notifications`, `partners`, `reviews`, `site-settings`, `subscribers`, `translations`, `shared`, `core`, `config`, `admin`, `content`, `tooling`, `i18n`.

```bash
git commit -m "feat(leads): translate lead form errors on the client"
git commit -m "fix(core): store rate-limit usage as objects in Upstash"
git commit -m "refactor(inventory): move car queries into the feature module"
```

Reguli:

- Un commit = un singur pas logic, cu `npm run verify` trecut.
- Mutările de fișiere (`git mv`) și schimbările de comportament merg în commit-uri separate.
- Fără mențiuni despre AI sau agenți și fără trailer `Co-Authored-By`.

## Remote

- **GitHub:** `https://github.com/adry999/swiss-cars`
- **Branch dev:** `dev` (lucru curent)
- **Branch producție:** `main` (Vercel)

## Important

- `.env.local` și `.env.production` sunt excluse prin `.gitignore` — credențialele nu vor fi niciodată în git
- Rulează comenzile din directorul root al proiectului (unde se află `.git`)
- Nu face `git push` direct pe `main` fără să testezi pe `dev` mai întâi
