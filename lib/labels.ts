export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Amministratore LOQO",
  AGENZIA: "Agenzia",
  AMMINISTRATORE: "Amministratore di condominio",
  PROPRIETARIO: "Proprietario",
  INQUILINO: "Inquilino",
  PRIVATO: "Privato",
};

/** Etichetta di ruolo per la sezione unificata /casa, dove un utente può avere 0, 1 o
 * entrambi i profili Proprietario/Inquilino (0 = registrato come PRIVATO, non ancora attivato). */
export function roleLabelPrivato(profili: ("PROPRIETARIO" | "INQUILINO")[]): string {
  if (profili.length === 2) return "Proprietario e Inquilino";
  if (profili[0] === "PROPRIETARIO") return "Proprietario";
  if (profili[0] === "INQUILINO") return "Inquilino";
  return "Privato";
}

export const TIPO_CONTRATTO_LABELS: Record<string, string> = {
  QUATTRO_PIU_QUATTRO: "4+4",
  TRE_PIU_DUE: "3+2",
  TRANSITORIO: "Transitorio",
  STUDENTI: "Studenti",
  CONCORDATO: "Concordato",
};

export const REGIME_FISCALE_LABELS: Record<string, string> = {
  CEDOLARE_SECCA: "Cedolare secca",
  ORDINARIO: "Ordinario",
};

export const STATO_CONTRATTO_LABELS: Record<string, string> = {
  BOZZA: "Bozza",
  ATTIVO: "Attivo",
  SCADUTO: "Scaduto",
  RISOLTO: "Risolto",
};

export const STATO_DEPOSITO_LABELS: Record<string, string> = {
  NON_VERSATO: "Non versato",
  VERSATO: "Versato",
  IN_CONTESTAZIONE: "In contestazione",
  RESTITUITO: "Restituito",
};

export const STATO_PAGAMENTO_LABELS: Record<string, string> = {
  PROGRAMMATO: "Programmato",
  PAGATO: "Pagato",
  IN_RITARDO: "In ritardo",
  INSOLUTO: "Insoluto",
};

export const TIPO_IMMOBILE_LABELS: Record<string, string> = {
  RESIDENZIALE: "Residenziale",
  COMMERCIALE: "Commerciale",
};

export const STATO_IMMOBILE_LABELS: Record<string, string> = {
  BOZZA_PROPRIETARIO: "Bozza",
  IN_GESTIONE_AGENZIA: "In gestione all'agenzia",
  ATTIVO: "Attivo",
};

export const STATO_RICHIESTA_GESTIONE_LABELS: Record<string, string> = {
  IN_ATTESA: "In attesa di risposta",
  ACCETTATA: "Accettata",
  RIFIUTATA: "Rifiutata",
};

export const TIPO_UTENZA_LABELS: Record<string, string> = {
  LUCE: "Luce",
  GAS: "Gas",
  ACQUA: "Acqua",
  INTERNET: "Internet",
};

export const STATO_UTENZA_LABELS: Record<string, string> = {
  DA_ATTIVARE: "Da attivare",
  ATTIVA: "Attiva",
  DISDETTA: "Disdetta",
};

export const STATO_ASSICURAZIONE_LABELS: Record<string, string> = {
  ATTIVA: "Attiva",
  SCADUTA: "Scaduta",
  DA_RINNOVARE: "Da rinnovare",
};

export const TIPO_CHECKLIST_LABELS: Record<string, string> = {
  INGRESSO: "Ingresso",
  USCITA: "Uscita",
};

export const STATO_SEGNALAZIONE_LABELS: Record<string, string> = {
  APERTA: "Aperta",
  IN_LAVORAZIONE: "In lavorazione",
  RISOLTA: "Risolta",
};

export const CATEGORIA_SEGNALAZIONE_LABELS: Record<string, string> = {
  PROBLEMA_UNITA: "Problema nell'unità",
  PROBLEMA_CONDOMINIALE: "Problema condominiale",
  PROBLEMA_MISTO: "Problema misto (unità/condominio)",
  PROBLEMA_CONTRATTUALE: "Questione contrattuale",
};

export const CATEGORIA_INTERVENTO_LABELS: Record<string, string> = {
  IDRAULICO: "Idraulico",
  ELETTRICISTA: "Elettricista",
  CALDAIA_CLIMATIZZAZIONE: "Caldaia e climatizzazione",
  MANUTENZIONE_GENERICA: "Manutenzione generica",
  UTENZE_LUCE_GAS: "Utenze (luce e gas)",
  ASSICURAZIONE: "Assicurazione",
  ALTRO: "Altro",
};

export const STATO_RICHIESTA_PREVENTIVO_LABELS: Record<string, string> = {
  INVIATA: "Inviata",
  CONTATTATO: "Contattato",
  PREVENTIVO_RICEVUTO: "Preventivo ricevuto",
  CHIUSA_CONVERTITA: "Chiusa (convertita)",
  CHIUSA_NON_CONVERTITA: "Chiusa (non convertita)",
};

export const METODO_PAGAMENTO_LABELS: Record<string, string> = {
  BONIFICO: "Bonifico",
  CARTA: "Carta",
};

export const CONDIZIONE_IMMOBILE_LABELS: Record<string, string> = {
  NUOVO: "Nuovo",
  RISTRUTTURATO: "Ristrutturato",
  DA_RISTRUTTURARE: "Da ristrutturare",
};

export const TIPO_RISCALDAMENTO_LABELS: Record<string, string> = {
  AUTONOMO: "Autonomo",
  CENTRALIZZATO: "Centralizzato",
};

export const CATEGORIA_DOCUMENTO_LABELS: Record<string, string> = {
  CONTRATTO: "Contratto",
  APE: "APE",
  PLANIMETRIA: "Planimetria",
  CARTA_IDENTITA: "Carta d'identità",
  VISURA_CATASTALE: "Visura catastale",
  POLIZZA: "Polizza assicurativa",
  ALTRO: "Altro",
};
