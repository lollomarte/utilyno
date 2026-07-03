# LOQO

Piattaforma di gestione affitti con 5 portali distinti per ruolo: **Admin**, **Agenzia**, **Amministratore di condominio**, **Proprietario**, **Inquilino**.

## Stack

- Next.js 15.5.20 (App Router) + TypeScript — **non Next.js 16**: la 16 rinomina `middleware.ts` in `proxy.ts` e cambia altre convenzioni che romperebbero i pattern documentati qui
- Tailwind CSS 4
- Prisma ORM 6.19.3 + PostgreSQL (Neon in produzione)
- Auth.js v5 (NextAuth) — Credentials provider, sessione JWT
- Zod + React Hook Form
- date-fns

## ⚠️ Punti critici da non dimenticare

Questi punti hanno causato deploy falliti su progetti precedenti. Sono già risolti nel codice attuale, ma vanno **mantenuti** ad ogni modifica:

1. **Separazione Edge/Node per l'auth.** `middleware.ts` gira su Edge Runtime, che non supporta Prisma Client né bcrypt.
   - `auth.config.ts` — solo `pages`/`callbacks`, **zero import** (nemmeno di tipo) da `@prisma/client` o `bcryptjs`. È l'unico modulo importato da `middleware.ts`.
   - `auth.ts` — configurazione completa con Credentials + Prisma + bcrypt, usata solo in API routes e server actions, mai nel middleware.
   - Verifica sempre con `npx vercel build` (non solo `npm run build`) prima di un commit importante: replica più fedelmente l'ambiente Edge di produzione ed è l'unico modo per scoprire in locale un "Edge Function referencing unsupported modules" prima del push.

2. **`vercel.json` deve dichiarare il framework esplicitamente**: `{"framework": "nextjs"}`. Senza questo, se il progetto Vercel era configurato in precedenza per un sito statico, Vercel non usa la pipeline di build Next.js e gli alias `@/...` non vengono risolti nel bundle del middleware.

3. **Matcher del middleware ridotto al minimo.** `middleware.ts` protegge *solo* i prefissi `/admin`, `/agenzia`, `/amministratore`, `/proprietario`, `/inquilino`. Non intercetta `/login`, `/register`, `/api`, asset statici: questo evita per costruzione il loop di redirect che si verifica se `auth()` fallisce silenziosamente (es. `AUTH_SECRET` mancante) e il middleware crede erroneamente che l'utente sia loggato. Il redirect "sei già loggato, vai al tuo portale" per chi visita `/login` da autenticato è gestito nella pagina stessa (Server Component, Node runtime), non nel middleware.

4. **Env vars obbligatorie anche su Vercel, non solo in `.env` locale.** `.env` è gitignored per design, quindi non arriva mai su Vercel automaticamente. Su **Vercel → Settings → Environment Variables**, per l'ambiente **Production** (e Preview se necessario), vanno aggiunte manualmente:
   - `AUTH_SECRET` — senza questo valore `auth()` lancia `MissingSecret` e l'app si comporta in modo imprevedibile, incluso un loop di redirect (perché la sessione risulta "loggata" anche senza esserlo).
   - `AUTH_URL` — puntata al **dominio reale di produzione** (es. `https://utilyno.it`), non `localhost`.
   - `DATABASE_URL` e `DIRECT_URL` (se non già presenti via un'integrazione Neon Marketplace).

5. **Connessione Neon.** Nella connection string *pooled* (host con `-pooler`) aggiungi `&pgbouncer=true&connection_limit=5` per evitare di esaurire il pool di connessioni lato Prisma. In `schema.prisma` sono configurati sia `url` (pooled, per l'app) sia `directUrl` (diretta, per le migration) — pattern standard Prisma + Neon.

## Setup locale

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Avvia PostgreSQL in locale (Docker)

```bash
docker compose up -d
```

Questo avvia un database Postgres su `localhost:5432` con utente/password/db `loqo`.

### 3. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Genera un `AUTH_SECRET` con:

```bash
npx auth secret
```

In produzione, sostituisci `DATABASE_URL`/`DIRECT_URL` con le connection string fornite da Neon.

### 4. Applica lo schema e popola il database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### 6. Verifica prima di ogni commit importante

```bash
npx vercel build
```

## Utenti di test (dopo il seed)

Tutti gli utenti hanno password `Password123!`.

| Ruolo         | Email                          |
| ------------- | ------------------------------- |
| Admin         | admin@loqo.it                   |
| Agenzia       | agenzia.milano@loqo.it          |
| Agenzia       | agenzia.roma@loqo.it            |
| Amministratore| amministratore.nord@loqo.it      |
| Amministratore| amministratore.sud@loqo.it       |
| Proprietario  | luca.verdi@example.com          |
| Inquilino     | elena.bruno@example.com         |

## Struttura del progetto

```
app/
  (auth)/login, (auth)/register   Pagine di autenticazione pubbliche
  admin/                          Portale ADMIN (protetto)
  agenzia/                        Portale AGENZIA (protetto)
  amministratore/                 Portale AMMINISTRATORE (protetto)
  proprietario/                   Portale PROPRIETARIO (protetto)
  inquilino/                      Portale INQUILINO (protetto)
  actions/                        Server actions (immobili, contratti, condomini, ticket, auth)
  api/auth, api/register          Route handler di Auth.js e registrazione
lib/
  data/                           Query Prisma raggruppate per portale
  services/                       Interfacce astratte + mock (payment, firma, AdE, assicurazioni)
  validations/                    Schemi Zod (con messaggi di errore per campo)
components/
  ui/                              Componenti riutilizzabili (tabelle, badge, card, modal, form)
  layout/                          Sidebar, header, shell del portale
prisma/
  schema.prisma, seed.ts
middleware.ts                     Protezione delle route in base al ruolo (matcher minimale)
auth.ts / auth.config.ts          Configurazione Auth.js (split Edge/Node)
```

## Servizi mock da sostituire in futuro

Questi moduli sono astratti dietro un'interfaccia con un'implementazione finta, pronti per essere collegati a un provider reale:

- `lib/services/payment-provider.ts` — istituto di pagamento
- `lib/services/digital-signature.ts` — firma digitale (es. Namirial, DocuSign)
- `lib/services/ade-registration.ts` — censimento e rinnovo annuale contratti all'Agenzia delle Entrate
- `lib/services/insurance-provider.ts` — attivazione polizze assicurative e calcolo commissioni

## Comandi utili

```bash
npm run dev            # server di sviluppo
npm run build           # build di produzione (Next.js)
npx vercel build         # build che replica l'ambiente Edge di Vercel
npx prisma studio       # esplora il database
npx prisma migrate dev  # applica una nuova migration
npx prisma db seed      # ripopola i dati di esempio
```
