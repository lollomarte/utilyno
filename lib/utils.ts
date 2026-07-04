import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export class TimeoutError extends Error {
  constructor(message = "Timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Da usare attorno a ogni invocazione client-side di una server action:
 * senza, un'eccezione non gestita (es. connessione DB caduta a metà) lascia
 * lo stato "isSubmitting" bloccato per sempre, perché il codice dopo l'await
 * non viene mai raggiunto. Con questo helper l'operazione fallisce sempre
 * entro `ms`, non importa cosa succede lato server.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
