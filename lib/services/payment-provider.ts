export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface InitiatePaymentInput {
  pagamentoId: string;
  importo: number;
  descrizione: string;
}

export interface InitiatePaymentResult {
  externalPaymentId: string;
  status: PaymentStatus;
  checkoutUrl: string;
}

/**
 * Astrazione verso un futuro istituto di pagamento reale (es. Nexi, Stripe, SIA).
 * Da sostituire con un'implementazione reale quando sarà definita la partnership.
 */
export interface PaymentProvider {
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  getPaymentStatus(externalPaymentId: string): Promise<PaymentStatus>;
}

class MockPaymentProvider implements PaymentProvider {
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const externalPaymentId = `MOCK-PAY-${input.pagamentoId}-${Date.now()}`;
    return {
      externalPaymentId,
      status: "PENDING",
      checkoutUrl: `https://mock-payment-provider.werent.it/checkout/${externalPaymentId}`,
    };
  }

  async getPaymentStatus(externalPaymentId: string): Promise<PaymentStatus> {
    void externalPaymentId;
    return "COMPLETED";
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
