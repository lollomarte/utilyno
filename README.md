# WERENT

Piattaforma di gestione affitti con 4 portali distinti per ruolo: **Admin**, **Agenzia**, **Proprietario**, **Inquilino**.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Prisma ORM + PostgreSQL
- Auth.js v5 (NextAuth) — Credentials provider, sessione JWT
- Zod + React Hook Form
- date-fns

## Setup locale

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Avvia PostgreSQL in locale (Docker)

```bash
docker compose up -d
```

Questo avvia un database Postgres su `localhost:5432` con utente/password/db `werent`.

### 3. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Genera un `AUTH_SECRET` con:

```bash
npx auth secret
```

In produzione, sostituisci `DATABASE_URL` con la connection string di [Neon](https://neon.tech) o [Supabase](https://supabase.com).

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

## Utenti di test (dopo il seed)

Tutti gli utenti hanno password `Password123!`.

| Ruolo        | Email                        |
| ------------ | ---------------------------- |
| Admin        | admin@werent.it              |
| Agenzia      | agenzia.milano@werent.it     |
| Agenzia      | agenzia.roma@werent.it       |
| Proprietario | luca.verdi@example.com       |
| Inquilino    | elena.bruno@example.com      |

## Struttura del progetto

```
app/
  (auth)/login, (auth)/register   Pagine di autenticazione pubbliche
  admin/                          Portale ADMIN (protetto)
  agenzia/                        Portale AGENZIA (protetto)
  proprietario/                   Portale PROPRIETARIO (protetto)
  inquilino/                      Portale INQUILINO (protetto)
  actions/                        Server actions (contratti, ticket, auth)
  api/auth, api/register          Route handler di Auth.js e registrazione
lib/
  data/                           Query Prisma raggruppate per portale
  services/                       Interfacce astratte + mock (payment, firma, AdE)
  validations/                    Schemi Zod
components/
  ui/                              Componenti riutilizzabili (tabelle, badge, card, form)
  layout/                          Sidebar, header, shell del portale
prisma/
  schema.prisma, seed.ts
middleware.ts                     Protezione delle route in base al ruolo
auth.ts / auth.config.ts          Configurazione Auth.js
```

## Servizi mock da sostituire in futuro

Questi moduli sono astratti dietro un'interfaccia con un'implementazione finta, pronti per essere collegati a un provider reale:

- `lib/services/payment-provider.ts` — istituto di pagamento (es. Nexi, Stripe)
- `lib/services/digital-signature.ts` — firma digitale (es. Namirial, DocuSign)
- `lib/services/ade-registration.ts` — censimento contratti all'Agenzia delle Entrate

## Comandi utili

```bash
npm run dev            # server di sviluppo
npm run build           # build di produzione
npx prisma studio       # esplora il database
npx prisma migrate dev  # applica una nuova migration
npx prisma db seed      # ripopola i dati di esempio
```
