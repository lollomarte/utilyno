import { differenceInCalendarDays } from "date-fns";

/**
 * Tasso di interesse legale semplificato per la demo (0,5% annuo).
 * Non corrisponde al tasso legale reale pro-tempore vigente: è un valore
 * fisso scelto per rendere plausibile il calcolo, da sostituire con il
 * tasso ufficiale (e un eventuale calcolo per-periodo) quando servirà
 * precisione fiscale reale.
 */
const TASSO_INTERESSE_LEGALE_ANNUO = 0.005;

/**
 * Interessi legali maturati sul deposito cauzionale, calcolati pro-rata
 * sui giorni di durata del contratto (dataInizio -> dataFine):
 *   interessi = depositoImporto * tasso_annuo * (giorni_durata / 365)
 */
export function calcolaInteressiLegali(depositoImporto: number, dataInizio: Date, dataFine: Date): number {
  const giorniDurata = Math.max(0, differenceInCalendarDays(dataFine, dataInizio));
  const anni = giorniDurata / 365;
  const interessi = depositoImporto * TASSO_INTERESSE_LEGALE_ANNUO * anni;
  return Math.round(interessi * 100) / 100;
}
