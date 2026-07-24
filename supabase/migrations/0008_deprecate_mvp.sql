-- La funzionalità MVP (Man of the Match) è stata rimossa dal prodotto: era una
-- valutazione soggettiva scelta a mano dall'admin, non un dato oggettivo di
-- gioco. Nessuna parte dell'app legge o scrive più questi oggetti; restano solo
-- per non perdere lo storico già accumulato. Le funzioni create_match/update_match
-- mantengono comunque il parametro p_mvp_player_id (viene sempre passato invariato
-- dal server, mai più impostabile da form).

comment on column matches.mvp_player_id is
  'Non più in uso: funzionalità MVP rimossa dal prodotto (valutazione soggettiva). Colonna mantenuta solo per non perdere lo storico già salvato.';

comment on view mvp_standings is
  'Deprecata: funzionalità MVP rimossa dal prodotto. Vista mantenuta per compatibilità con lo storico, non più letta dall''applicazione.';
