-- Ruolo di gioco del giocatore: campo anagrafico opzionale, nessun impatto
-- su partite, formazioni o calcolo del risultato.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ruolo_enum') then
    create type ruolo_enum as enum ('difensore', 'centrocampista', 'attaccante');
  end if;
end $$;

alter table players add column if not exists ruolo ruolo_enum;

-- Aggiunge ruolo in coda alla vista esistente (CREATE OR REPLACE VIEW non
-- permette di riordinare o rimuovere colonne già presenti).
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
  coalesce(max(pmr.gol), 0)::int as record_gol_partita,
  p.ruolo
from players p
left join player_match_results pmr on pmr.player_id = p.id
group by p.id, p.nome, p.cognome, p.foto_url, p.attivo, p.ruolo;
