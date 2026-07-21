import { redirect } from "next/navigation";

/** /proprietario/* è stato consolidato in /privato/* (Proprietario e Inquilino condividono ora
 * lo stesso portale, con il ruolo per-immobile invece che per-account): redirect pulito invece
 * di lasciare la vecchia route orfana. */
export default function ProprietarioRedirect() {
  redirect("/privato");
}
