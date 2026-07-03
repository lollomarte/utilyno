export interface RegisterContractInput {
  contrattoId: string;
  canoneMensile: number;
  dataInizio: Date;
  dataFine: Date;
}

export interface RegisterContractResult {
  protocollo: string;
  dataRegistrazione: Date;
}

export interface RenewRegistrationInput {
  contrattoId: string;
  protocolloOriginale?: string;
}

export interface RenewRegistrationResult {
  protocolloRinnovo: string;
  dataRinnovo: Date;
}

/**
 * Astrazione verso il futuro censimento all'Agenzia delle Entrate (servizio
 * RLI / SISTER), inclusa la gestione del rinnovo annuale obbligatorio dei
 * contratti a canone libero. Da sostituire con un'implementazione reale
 * quando l'integrazione sarà definita.
 */
export interface AdERegistrationProvider {
  registerContract(input: RegisterContractInput): Promise<RegisterContractResult>;
  renewRegistration(input: RenewRegistrationInput): Promise<RenewRegistrationResult>;
}

class MockAdERegistrationProvider implements AdERegistrationProvider {
  async registerContract(input: RegisterContractInput): Promise<RegisterContractResult> {
    const dataRegistrazione = new Date();
    const protocollo = `MOCK-ADE-${dataRegistrazione.getFullYear()}-${input.contrattoId.slice(0, 8).toUpperCase()}`;
    return {
      protocollo,
      dataRegistrazione,
    };
  }

  async renewRegistration(input: RenewRegistrationInput): Promise<RenewRegistrationResult> {
    const dataRinnovo = new Date();
    const protocolloRinnovo = `MOCK-ADE-RINNOVO-${dataRinnovo.getFullYear()}-${input.contrattoId.slice(0, 8).toUpperCase()}`;
    return {
      protocolloRinnovo,
      dataRinnovo,
    };
  }
}

export const adeRegistrationProvider: AdERegistrationProvider = new MockAdERegistrationProvider();
