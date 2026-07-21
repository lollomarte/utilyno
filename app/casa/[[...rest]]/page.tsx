import { redirect } from "next/navigation";

/** /casa è stato rinominato in /privato (stessa cosa, nome più coerente con "Privato" come
 * terzo ruolo reale della piattaforma insieme ad Agenzia e Amministratore): redirect pulito
 * invece di lasciare la vecchia route orfana. */
export default function CasaRedirect() {
  redirect("/privato");
}
