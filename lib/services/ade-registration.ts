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

/**
 * Astrazione verso il futuro censimento all'Agenzia delle Entrate (servizio RLI / SISTER).
 * Da sostituire con un'implementazione reale quando sarà definita l'integrazione.
 */
export interface AdERegistrationProvider {
  registerContract(input: RegisterContractInput): Promise<RegisterContractResult>;
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
}

export const adeRegistrationProvider: AdERegistrationProvider = new MockAdERegistrationProvider();
