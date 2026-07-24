-- Aggiunge "esterno" ai ruoli selezionabili: campo anagrafico opzionale,
-- nessun impatto su partite, formazioni o calcolo del risultato.

alter type ruolo_enum add value if not exists 'esterno';
