import { PrismaClient } from "@prisma/client";

/**
 * `passwordHash` è omesso di default da ogni query su User: molte pagine includono
 * `user: true` (o relazioni dirette come `creatoDa`) per nome/cognome/email e passano il
 * risultato a componenti client, dove finirebbe altrimenti serializzato nel payload React
 * inviato al browser. L'unico punto che deve leggerlo davvero (verifica password in
 * auth.ts) lo richiede esplicitamente con `omit: { passwordHash: false }`.
 */
function createPrismaClient() {
  return new PrismaClient({ omit: { user: { passwordHash: true } } });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
