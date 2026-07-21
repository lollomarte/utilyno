export function playerName(p: { nome: string; cognome: string }): string {
  return `${p.nome} ${p.cognome}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(p: { nome: string; cognome: string }): string {
  return `${p.nome[0] ?? ""}${p.cognome[0] ?? ""}`.toUpperCase();
}

export function age(dataNascita: string): number {
  const birth = new Date(dataNascita);
  const today = new Date();
  let years = today.getUTCFullYear() - birth.getUTCFullYear();
  const hasHadBirthdayThisYear =
    today.getUTCMonth() > birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate());
  if (!hasHadBirthdayThisYear) years -= 1;
  return years;
}
