-- Calciotto: schema iniziale
-- players, matches, match_participants + viste statistiche + RLS + storage bucket foto

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabelle
-- ---------------------------------------------------------------------------

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cognome text not null,
  data_nascita date,
  foto_url text,
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  note text,
  mvp_player_id uuid references players(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'squadra_enum') then
    create type squadra_enum as enum ('bianca', 'nera');
  end if;
end $$;

create table if not exists match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  squadra squadra_enum not null,
  gol integer not null default 0 check (gol >= 0),
  unique (match_id, player_id)
);

create index if not exists idx_match_participants_match on match_participants(match_id);
create index if not exists idx_match_participants_player on match_participants(player_id);
create index if not exists idx_matches_data on matches(data desc);
create index if not exists idx_players_cognome on players(cognome, nome);

-- ---------------------------------------------------------------------------
-- Viste statistiche (security_invoker: rispettano le RLS del chiamante)
-- ---------------------------------------------------------------------------

create or replace view match_results
with (security_invoker = true) as
select
  m.id as match_id,
  m.data,
  m.note,
  m.mvp_player_id,
  coalesce(sum(mp.gol) filter (where mp.squadra = 'bianca'), 0)::int as gol_bianca,
  coalesce(sum(mp.gol) filter (where mp.squadra = 'nera'), 0)::int as gol_nera,
  count(mp.id)::int as num_partecipanti
from matches m
left join match_participants mp on mp.match_id = m.id
group by m.id, m.data, m.note, m.mvp_player_id;

create or replace view player_match_results
with (security_invoker = true) as
select
  mp.id,
  mp.match_id,
  mp.player_id,
  mp.squadra,
  mp.gol,
  mr.data,
  mr.gol_bianca,
  mr.gol_nera,
  case
    when mr.gol_bianca = mr.gol_nera then 'pareggio'
    when (mp.squadra = 'bianca' and mr.gol_bianca > mr.gol_nera)
      or (mp.squadra = 'nera' and mr.gol_nera > mr.gol_bianca) then 'vittoria'
    else 'sconfitta'
  end as esito
from match_participants mp
join match_results mr on mr.match_id = mp.match_id;

create or replace view player_career_stats
with (security_invoker = true) as
select
  p.id as player_id,
  p.nome,
  p.cognome,
  p.foto_url,
  p.attivo,
  count(pmr.id)::int as presenze,
  coalesce(sum(pmr.gol), 0)::int as gol_totali,
  case when count(pmr.id) > 0
    then round(coalesce(sum(pmr.gol), 0)::numeric / count(pmr.id), 2)
    else 0
  end as media_gol,
  count(*) filter (where pmr.esito = 'vittoria')::int as vittorie,
  count(*) filter (where pmr.esito = 'pareggio')::int as pareggi,
  count(*) filter (where pmr.esito = 'sconfitta')::int as sconfitte,
  coalesce(max(pmr.gol), 0)::int as record_gol_partita
from players p
left join player_match_results pmr on pmr.player_id = p.id
group by p.id, p.nome, p.cognome, p.foto_url, p.attivo;

create or replace view mvp_standings
with (security_invoker = true) as
select
  p.id as player_id,
  p.nome,
  p.cognome,
  p.foto_url,
  count(m.id)::int as mvp_count
from players p
join matches m on m.mvp_player_id = p.id
group by p.id, p.nome, p.cognome, p.foto_url;

-- ---------------------------------------------------------------------------
-- Row Level Security: lettura pubblica, scrittura solo utenti autenticati
-- (unico utente admin: nessuna ownership da verificare)
-- ---------------------------------------------------------------------------

alter table players enable row level security;
alter table matches enable row level security;
alter table match_participants enable row level security;

drop policy if exists "players_public_read" on players;
create policy "players_public_read" on players
  for select to anon, authenticated using (true);

drop policy if exists "players_admin_write" on players;
create policy "players_admin_write" on players
  for all to authenticated using (true) with check (true);

drop policy if exists "matches_public_read" on matches;
create policy "matches_public_read" on matches
  for select to anon, authenticated using (true);

drop policy if exists "matches_admin_write" on matches;
create policy "matches_admin_write" on matches
  for all to authenticated using (true) with check (true);

drop policy if exists "match_participants_public_read" on match_participants;
create policy "match_participants_public_read" on match_participants
  for select to anon, authenticated using (true);

drop policy if exists "match_participants_admin_write" on match_participants;
create policy "match_participants_admin_write" on match_participants
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: bucket foto giocatori, pubblico in lettura
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

drop policy if exists "player_photos_public_read" on storage.objects;
create policy "player_photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'player-photos');

drop policy if exists "player_photos_admin_write" on storage.objects;
create policy "player_photos_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'player-photos');

drop policy if exists "player_photos_admin_update" on storage.objects;
create policy "player_photos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'player-photos')
  with check (bucket_id = 'player-photos');

drop policy if exists "player_photos_admin_delete" on storage.objects;
create policy "player_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'player-photos');
