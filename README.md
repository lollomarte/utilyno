# Calciotto di Pippi

Sito per gestire le statistiche del gruppo di calciotto amatoriale: giocatori, partite, classifiche marcatori/presenze e record.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS + Framer Motion, deploy su **Vercel**
- **Supabase**: Postgres (players, matches, match_participants + viste statistiche), Auth (singolo utente admin), Storage (foto giocatori)
- PWA installabile (manifest + icone), tema scuro nativo, animazioni rispettose di `prefers-reduced-motion`

## Sviluppo locale

```bash
npm install
vercel env pull --yes   # sincronizza .env.local dal progetto Vercel/Supabase collegato
npm run dev
```

## Database

Le migration SQL si trovano in `supabase/migrations/`. Per applicarle su un nuovo ambiente:

```bash
node scripts/migrate.mjs supabase/migrations/0001_init.sql
node scripts/migrate.mjs supabase/migrations/0002_patch_and_rpc.sql
```

Per creare l'utente admin (unico utente autorizzato a scrivere):

```bash
node scripts/create-admin.mjs email@esempio.it
```

## Modello dati

- `players`: id, nome, cognome, data_nascita, foto_url, attivo, created_at
- `matches`: id, data, note, mvp_player_id (non più in uso: funzionalità MVP rimossa, colonna mantenuta solo per non perdere lo storico), created_at
- `match_participants`: id, match_id, player_id, squadra (`bianca`|`nera`), gol, portiere (flag per singola partita, non è il ruolo anagrafico: incide solo sul bonus/penalità nel valore di mercato)
- `next_match_info`: riga singola con data/orario/campo della prossima partita in programma (non è una partita giocata, resta fuori dallo storico)

Il risultato di ogni partita è sempre calcolato come somma di `match_participants.gol` per squadra (vista `match_results`), non è un campo salvato a parte.

## Pagine

- `/` — home con ultima partita, top marcatori, top presenze
- `/classifiche/{marcatori,presenze,vittorie,gol-squadra}` — classifiche pubbliche
- `/record` — record e curiosità del gruppo
- `/risultati` e `/risultati/[id]` — storico partite e dettaglio formazioni
- `/giocatori/[id]` — scheda giocatore
- `/admin` — area riservata (login Supabase Auth) per gestire giocatori e partite
