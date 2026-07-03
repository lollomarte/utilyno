import { prisma } from "@/lib/prisma";

export async function getInvitoDetail(token: string) {
  return prisma.invitoInquilino.findUnique({
    where: { token },
    include: {
      inquilino: { include: { user: true } },
      contratto: { include: { immobile: true, agenzia: true } },
    },
  });
}
