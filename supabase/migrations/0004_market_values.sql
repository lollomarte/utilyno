-- Quotazioni di mercato: snapshot mensile del valore calcolato per giocatore,
-- necessario per il trend "rispetto a un mese fa". Scrittura riservata al
-- service role (job di snapshot lato server), lettura pubblica.

create table if not exists market_values (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  valore numeric(5,1) not null check (valore >= 0),
  data_calcolo date not null,
  created_at timestamptz not null default now(),
  unique (player_id, data_calcolo)
);

create index if not exists idx_market_values_player on market_values(player_id);
create index if not exists idx_market_values_data on market_values(data_calcolo desc);

alter table market_values enable row level security;

drop policy if exists "market_values_public_read" on market_values;
create policy "market_values_public_read" on market_values
  for select to anon, authenticated using (true);

-- Nessuna policy di scrittura per anon/authenticated: gli snapshot vengono
-- inseriti esclusivamente lato server con la service role key, che bypassa RLS.
