export type SignatureStatus = "PENDING" | "SIGNED" | "REJECTED";

export interface RequestSignatureInput {
  documentoId: string;
  firmatari: { nome: string; email: string }[];
}

export interface RequestSignatureResult {
  envelopeId: string;
  status: SignatureStatus;
}

/**
 * Astrazione verso un futuro provider di firma digitale (es. Namirial,
 * InfoCert, DocuSign). Da sostituire con un'implementazione reale quando la
 * partnership sarà definita.
 */
export interface SignatureProvider {
  requestSignature(input: RequestSignatureInput): Promise<RequestSignatureResult>;
  getSignatureStatus(envelopeId: string): Promise<SignatureStatus>;
}

class MockSignatureProvider implements SignatureProvider {
  async requestSignature(input: RequestSignatureInput): Promise<RequestSignatureResult> {
    const envelopeId = `MOCK-ENV-${input.documentoId}-${Date.now()}`;
    return {
      envelopeId,
      status: "PENDING",
    };
  }

  async getSignatureStatus(envelopeId: string): Promise<SignatureStatus> {
    void envelopeId;
    return "SIGNED";
  }
}

export const signatureProvider: SignatureProvider = new MockSignatureProvider();
