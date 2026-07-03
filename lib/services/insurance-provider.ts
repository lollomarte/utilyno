export interface ActivatePolicyInput {
  immobileId: string;
  tipo: string;
  premioAnnuale: number;
}

export interface ActivatePolicyResult {
  polizzaId: string;
  fornitore: string;
  dataAttivazione: Date;
  dataScadenza: Date;
  commissioneLoqo: number;
}

const COMMISSIONE_PERCENTUALE = 0.1;

/**
 * Astrazione verso un futuro partner assicurativo per l'attivazione di
 * polizze sugli immobili gestiti (Partner assicurativo nel piano). Da
 * sostituire con un'implementazione reale quando la partnership sarà
 * definita.
 */
export interface InsuranceProvider {
  activatePolicy(input: ActivatePolicyInput): Promise<ActivatePolicyResult>;
  calculateCommission(premioAnnuale: number): number;
}

class MockInsuranceProvider implements InsuranceProvider {
  async activatePolicy(input: ActivatePolicyInput): Promise<ActivatePolicyResult> {
    const dataAttivazione = new Date();
    const dataScadenza = new Date(dataAttivazione);
    dataScadenza.setFullYear(dataScadenza.getFullYear() + 1);

    return {
      polizzaId: `MOCK-POL-${input.immobileId.slice(0, 8).toUpperCase()}-${Date.now()}`,
      fornitore: "Mock Assicurazioni Spa",
      dataAttivazione,
      dataScadenza,
      commissioneLoqo: this.calculateCommission(input.premioAnnuale),
    };
  }

  calculateCommission(premioAnnuale: number): number {
    return Math.round(premioAnnuale * COMMISSIONE_PERCENTUALE * 100) / 100;
  }
}

export const insuranceProvider: InsuranceProvider = new MockInsuranceProvider();
