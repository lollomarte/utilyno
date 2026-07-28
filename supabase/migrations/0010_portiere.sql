-- Flag "portiere" per singola partita: non è un ruolo anagrafico (players.ruolo
-- resta invariato), ma indica che in quella specifica partita il giocatore ha
-- giocato in porta. Usato solo per il bonus/penalità nel valore di mercato,
-- nessun impatto sulle classifiche esistenti (marcatori, presenze, vittorie,
-- gol squadra), che continuano a leggere le stesse colonne di sempre.

alter table match_participants
  add column if not exists portiere boolean not null default false;

-- portiere va in coda (CREATE OR REPLACE VIEW non permette di riordinare o
-- rimuovere colonne già presenti).
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
  mr.num_partecipanti,
  mp.portiere
from match_participants mp
join match_results mr on mr.match_id = mp.match_id;

-- ---------------------------------------------------------------------------
-- RPC: create_match / update_match — stessa firma (p_participants resta jsonb),
-- basta rimpiazzare il corpo per leggere il campo "portiere" dal payload.
-- ---------------------------------------------------------------------------

create or replace function create_match(
  p_data date,
  p_note text,
  p_mvp_player_id uuid,
  p_participants jsonb,
  p_risultato_modificato_manualmente boolean default false,
  p_gol_bianca_finale integer default null,
  p_gol_nera_finale integer default null
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_match_id uuid;
  v_manuale boolean := coalesce(p_risultato_modificato_manualmente, false);
begin
  insert into matches (
    data, note, mvp_player_id,
    risultato_modificato_manualmente, gol_bianca_finale, gol_nera_finale
  )
  values (
    p_data,
    nullif(p_note, ''),
    p_mvp_player_id,
    v_manuale,
    case when v_manuale then p_gol_bianca_finale else null end,
    case when v_manuale then p_gol_nera_finale else null end
  )
  returning id into v_match_id;

  insert into match_participants (match_id, player_id, squadra, gol, portiere)
  select
    v_match_id,
    (elem->>'player_id')::uuid,
    (elem->>'squadra')::squadra_enum,
    (elem->>'gol')::int,
    coalesce((elem->>'portiere')::boolean, false)
  from jsonb_array_elements(p_participants) as elem;

  return v_match_id;
end;
$$;

create or replace function update_match(
  p_match_id uuid,
  p_data date,
  p_note text,
  p_mvp_player_id uuid,
  p_participants jsonb,
  p_risultato_modificato_manualmente boolean default false,
  p_gol_bianca_finale integer default null,
  p_gol_nera_finale integer default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_manuale boolean := coalesce(p_risultato_modificato_manualmente, false);
begin
  update matches
  set data = p_data,
      note = nullif(p_note, ''),
      mvp_player_id = p_mvp_player_id,
      risultato_modificato_manualmente = v_manuale,
      gol_bianca_finale = case when v_manuale then p_gol_bianca_finale else null end,
      gol_nera_finale = case when v_manuale then p_gol_nera_finale else null end
  where id = p_match_id;

  delete from match_participants where match_id = p_match_id;

  insert into match_participants (match_id, player_id, squadra, gol, portiere)
  select
    p_match_id,
    (elem->>'player_id')::uuid,
    (elem->>'squadra')::squadra_enum,
    (elem->>'gol')::int,
    coalesce((elem->>'portiere')::boolean, false)
  from jsonb_array_elements(p_participants) as elem;
end;
$$;
