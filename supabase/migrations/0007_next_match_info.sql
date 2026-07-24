-- Informazioni sulla prossima partita in programma (data/ora/campo),
-- indipendenti dallo storico partite già giocate (tabella matches):
-- servono solo a comunicare dove/quando si gioca prima che i risultati
-- vengano inseriti. Riga singola sempre aggiornata in place: il trucco
-- "id boolean primary key default true check (id)" impedisce a livello di
-- schema che esista più di una riga (id può valere solo true).

create table if not exists next_match_info (
  id boolean primary key default true check (id),
  data date,
  orario time,
  campo text,
  updated_at timestamptz not null default now()
);

insert into next_match_info (id) values (true) on conflict (id) do nothing;

alter table next_match_info enable row level security;

drop policy if exists "next_match_info_public_read" on next_match_info;
create policy "next_match_info_public_read" on next_match_info
  for select to anon, authenticated using (true);

drop policy if exists "next_match_info_admin_write" on next_match_info;
create policy "next_match_info_admin_write" on next_match_info
  for update to authenticated using (id) with check (id);
