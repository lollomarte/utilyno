-- Flag scherzoso "Clown": sovrascrive solo l'etichetta della fascia di
-- valore di mercato nel badge (vedi lib/format.ts). Nessun impatto sul
-- valore numerico, sulla formula di calcolo o su altre pagine/classifiche.

alter table players add column if not exists is_clown boolean not null default false;
