import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAgenzia() {
  const session = await auth();
  if (!session?.user || session.user.role !== "AGENZIA") redirect("/login");

  const agenzia = await prisma.agenzia.findUnique({ where: { userId: session.user.id } });
  if (!agenzia) redirect("/non-autorizzato");

  return { session, agenzia };
}

export async function requireProprietario() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPRIETARIO") redirect("/login");

  const proprietario = await prisma.proprietario.findUnique({ where: { userId: session.user.id } });
  if (!proprietario) redirect("/non-autorizzato");

  return { session, proprietario };
}

export async function requireInquilino() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INQUILINO") redirect("/login");

  const inquilino = await prisma.inquilino.findUnique({ where: { userId: session.user.id } });
  if (!inquilino) redirect("/non-autorizzato");

  return { session, inquilino };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return { session };
}
