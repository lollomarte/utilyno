-- Risultato finale modificabile manualmente, per i casi in cui non si è
-- tenuto traccia di tutti i marcatori durante la partita. Il risultato
-- "ufficiale" (gol_bianca/gol_nera esposti da match_results) resta di
-- default la somma dei marcatori inseriti, ma può essere sovrascritto.
--
-- Le classifiche marcatori/presenze continuano a leggere direttamente da
-- match_participants (invariate); la classifica vittorie e player_match_results
-- derivano invece da match_results, quindi seguono automaticamente il
-- risultato manuale quando presente.

alter table matches
  add column if not exists gol_bianca_finale integer,
  add column if not exists gol_nera_finale integer,
  add column if not exists risultato_modificato_manualmente boolean not null default false;

alter table matches drop constraint if exists matches_gol_finale_check;
alter table matches add constraint matches_gol_finale_check check (
  (risultato_modificato_manualmente = false and gol_bianca_finale is null and gol_nera_finale is null)
  or
  (risultato_modificato_manualmente = true
    and gol_bianca_finale is not null and gol_bianca_finale >= 0
    and gol_nera_finale is not null and gol_nera_finale >= 0)
);

-- risultato_modificato_manualmente va in coda (CREATE OR REPLACE VIEW non
-- permette di riordinare o rimuovere colonne già presenti in match_results,
-- da cui dipende player_match_results).
create or replace view match_results
with (security_invoker = true) as
select
  m.id as match_id,
  m.data,
  m.note,
  m.mvp_player_id,
  case when m.risultato_modificato_manualmente then m.gol_bianca_finale
    else coalesce(sum(mp.gol) filter (where mp.squadra = 'bianca'), 0)::int
  end as gol_bianca,
  case when m.risultato_modificato_manualmente then m.gol_nera_finale
    else coalesce(sum(mp.gol) filter (where mp.squadra = 'nera'), 0)::int
  end as gol_nera,
  count(mp.id)::int as num_partecipanti,
  m.risultato_modificato_manualmente
from matches m
left join match_participants mp on mp.match_id = m.id
group by m.id, m.data, m.note, m.mvp_player_id, m.risultato_modificato_manualmente, m.gol_bianca_finale, m.gol_nera_finale;

-- ---------------------------------------------------------------------------
-- RPC: create_match / update_match — firma estesa con il risultato manuale.
-- Vanno droppate prima di ricrearle: cambiare la lista parametri con
-- CREATE OR REPLACE creerebbe un overload invece di sostituire la funzione.
-- ---------------------------------------------------------------------------

drop function if exists create_match(date, text, uuid, jsonb);

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

  insert into match_participants (match_id, player_id, squadra, gol)
  select v_match_id, (elem->>'player_id')::uuid, (elem->>'squadra')::squadra_enum, (elem->>'gol')::int
  from jsonb_array_elements(p_participants) as elem;

  return v_match_id;
end;
$$;

drop function if exists update_match(uuid, date, text, uuid, jsonb);

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

  insert into match_participants (match_id, player_id, squadra, gol)
  select p_match_id, (elem->>'player_id')::uuid, (elem->>'squadra')::squadra_enum, (elem->>'gol')::int
  from jsonb_array_elements(p_participants) as elem;
end;
$$;

revoke all on function create_match(date, text, uuid, jsonb, boolean, integer, integer) from public;
grant execute on function create_match(date, text, uuid, jsonb, boolean, integer, integer) to authenticated;

revoke all on function update_match(uuid, date, text, uuid, jsonb, boolean, integer, integer) from public;
grant execute on function update_match(uuid, date, text, uuid, jsonb, boolean, integer, integer) to authenticated;
