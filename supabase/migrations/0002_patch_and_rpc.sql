-- Patch: arricchisce player_match_results (append-only, compatibile con CREATE OR REPLACE VIEW)
-- Aggiunge funzioni RPC per creare/modificare una partita con le formazioni in un'unica transazione atomica.

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
  end as esito,
  mr.note,
  mr.num_partecipanti
from match_participants mp
join match_results mr on mr.match_id = mp.match_id;

-- ---------------------------------------------------------------------------
-- RPC: create_match / update_match
-- security invoker: le RLS del chiamante si applicano comunque agli insert/update
-- sulle tabelle sottostanti (solo utenti authenticated possono scrivere).
-- ---------------------------------------------------------------------------

create or replace function create_match(
  p_data date,
  p_note text,
  p_mvp_player_id uuid,
  p_participants jsonb
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_match_id uuid;
begin
  insert into matches (data, note, mvp_player_id)
  values (p_data, nullif(p_note, ''), p_mvp_player_id)
  returning id into v_match_id;

  insert into match_participants (match_id, player_id, squadra, gol)
  select v_match_id, (elem->>'player_id')::uuid, (elem->>'squadra')::squadra_enum, (elem->>'gol')::int
  from jsonb_array_elements(p_participants) as elem;

  return v_match_id;
end;
$$;

create or replace function update_match(
  p_match_id uuid,
  p_data date,
  p_note text,
  p_mvp_player_id uuid,
  p_participants jsonb
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update matches
  set data = p_data, note = nullif(p_note, ''), mvp_player_id = p_mvp_player_id
  where id = p_match_id;

  delete from match_participants where match_id = p_match_id;

  insert into match_participants (match_id, player_id, squadra, gol)
  select p_match_id, (elem->>'player_id')::uuid, (elem->>'squadra')::squadra_enum, (elem->>'gol')::int
  from jsonb_array_elements(p_participants) as elem;
end;
$$;

revoke all on function create_match(date, text, uuid, jsonb) from public;
grant execute on function create_match(date, text, uuid, jsonb) to authenticated;

revoke all on function update_match(uuid, date, text, uuid, jsonb) from public;
grant execute on function update_match(uuid, date, text, uuid, jsonb) to authenticated;
