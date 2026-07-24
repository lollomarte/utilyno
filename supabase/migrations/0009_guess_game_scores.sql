-- Punteggi del mini-gioco "Chi vale di più?": nessun login, il giocatore
-- inserisce solo un nickname libero per tracciare il proprio record. Prima
-- tabella del progetto con scrittura pubblica anonima (finora ogni scrittura
-- era riservata a authenticated o al service role): il gioco è pensato per
-- essere giocato da chiunque visiti il sito senza autenticarsi.
--
-- Una riga per partita giocata (non upsert per nickname): la classifica
-- calcola il massimo per nickname lato applicazione. Nessuna policy di
-- update/delete per anon/authenticated: i punteggi, una volta inseriti, sono
-- immutabili.

create table if not exists guess_game_scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(trim(nickname)) between 1 and 24),
  punteggio integer not null check (punteggio >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_guess_game_scores_punteggio on guess_game_scores(punteggio desc);

alter table guess_game_scores enable row level security;

drop policy if exists "guess_game_scores_public_read" on guess_game_scores;
create policy "guess_game_scores_public_read" on guess_game_scores
  for select to anon, authenticated using (true);

drop policy if exists "guess_game_scores_public_insert" on guess_game_scores;
create policy "guess_game_scores_public_insert" on guess_game_scores
  for insert to anon, authenticated
  with check (
    char_length(trim(nickname)) between 1 and 24
    and punteggio >= 0
  );
