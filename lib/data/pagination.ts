// Supabase/PostgREST limita ogni singola risposta a un numero massimo di righe
// (in questo progetto 1000, configurato lato server) anche quando la query non
// ha un .limit() esplicito: superata quella soglia i risultati vengono troncati
// in silenzio, senza errore. match_participants ha superato le 1000 righe, quindi
// ogni query non filtrata su quella tabella va paginata con .range() per non
// perdere silenziosamente le righe più "in fondo" al risultato (in pratica le
// partite più recenti, con effetti a cascata su tutte le statistiche derivate).
const PAGE_SIZE = 1000;

export async function fetchAllPages<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}
