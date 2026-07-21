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

export function nearestMonday(from = new Date()): string {
  const d = new Date(from);
  const day = d.getDay(); // 0 = domenica, 1 = lunedì
  const diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function nextMondayNight(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay();
  let diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 21, 0, 0, 0);
  if (diff === 0 && target.getTime() <= from.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}
