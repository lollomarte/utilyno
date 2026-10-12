// Una stagione di calciotto va da luglio a giugno dell'anno successivo.

export function seasonOf(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth(); // 0-indexed: 6 = luglio
  const startYear = m >= 6 ? y : y - 1;
  return `${startYear}/${startYear + 1}`;
}

export function currentSeason(): string {
  return seasonOf(new Date().toISOString());
}

export function seasonsFromDates(dates: string[]): string[] {
  const set = new Set(dates.map(seasonOf));
  return Array.from(set).sort().reverse();
}

export function yearOf(dateStr: string): string {
  return String(new Date(dateStr).getUTCFullYear());
}

export function yearsFromDates(dates: string[]): string[] {
  const set = new Set(dates.map(yearOf));
  return Array.from(set).sort().reverse();
}

export function nearestMonday(from = new Date()): string {
  const d = new Date(from);
  const day = d.getDay(); // 0 = domenica, 1 = lunedì
  const diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Il server (Vercel) gira in UTC: date e orari delle partite vanno sempre
// interpretati nel fuso italiano.
export const MATCH_TIME_ZONE = "Europe/Rome";

function romeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MATCH_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    y: Number(get("year")),
    m: Number(get("month")),
    d: Number(get("day")),
    h: Number(get("hour")),
    min: Number(get("minute")),
    s: Number(get("second")),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
  };
}

/** Istante corrispondente a un'ora "da orologio" italiana (gestisce l'ora legale). */
function romeWallTime(y: number, m: number, d: number, h: number, min: number): Date {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = romeParts(new Date(guess));
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - guess;
  return new Date(guess - offset);
}

export function nextMondayNight(from = new Date()): Date {
  const { y, m, d, weekday } = romeParts(from);
  const diff = weekday === 1 ? 0 : weekday === 0 ? 1 : 8 - weekday;
  let target = romeWallTime(y, m, d + diff, 21, 0);
  if (target.getTime() <= from.getTime()) {
    target = romeWallTime(y, m, d + diff + 7, 21, 0);
  }
  return target;
}

// Dopo quanto dall'inizio una data impostata dall'admin si considera superata
// e si torna al default del lunedì.
const MATCH_GRACE_MS = 3 * 60 * 60 * 1000;

/**
 * Data/ora della prossima partita: usa quanto impostato dall'admin in
 * next_match_info se presente e non ancora passato, altrimenti il default
 * (prossimo lunedì alle 21:00). L'orario da Supabase arriva come "HH:MM:SS".
 */
export function resolveNextMatchTarget(
  data: string | null,
  orario: string | null,
  now = new Date(),
): { target: Date; isCustom: boolean } {
  if (data) {
    const [y, m, day] = data.split("-").map(Number);
    const [h, min] = (orario ?? "21:00").split(":").map(Number);
    const custom = romeWallTime(y, m, day, h, min);
    if (custom.getTime() + MATCH_GRACE_MS > now.getTime()) {
      return { target: custom, isCustom: true };
    }
  }
  return { target: nextMondayNight(now), isCustom: false };
}
