import Link from "next/link";
import {
  Building2,
  Home as HomeIcon,
  KeyRound,
  Users,
  ShieldCheck,
  Wrench,
  Link2,
  Handshake,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoqoSeal } from "@/components/brand/loqo-seal";
import { Reveal } from "@/components/brand/reveal";

/**
 * Contatti/demo non hanno ancora un form o un CRM dietro: link segnaposto
 * finché non esiste una vera destinazione, da sostituire quando pronta.
 */
const CTA_CONTATTO_HREF = "#";

const RUOLI = [
  {
    icon: Building2,
    titolo: "Per le agenzie",
    testo:
      "Crea contratti in pochi passaggi, tieni sotto controllo l'intero portfolio, sai sempre chi paga in ritardo e quando un contratto sta per scadere. Meno tempo su Excel, più tempo a chiudere nuovi affitti.",
  },
  {
    icon: HomeIcon,
    titolo: "Per i proprietari",
    testo:
      "Vedi i tuoi immobili, gli incassi previsti, lo stato del deposito cauzionale e le scadenze importanti — tutto in una dashboard, senza dover chiamare l'agenzia per sapere se l'inquilino ha pagato.",
  },
  {
    icon: KeyRound,
    titolo: "Per gli inquilini",
    testo:
      "Paghi il canone, controlli le scadenze, attivi le utenze e segnali un problema in pochi tap — sempre sapendo a chi arriva la tua richiesta, senza dover capire prima chi chiamare.",
  },
  {
    icon: Users,
    titolo: "Per gli amministratori di condominio",
    testo:
      "Gestisci le segnalazioni di ogni condominio, comunichi con tutti i condomini in un colpo solo, e hai visibilità su cosa succede in ogni unità che amministri — senza fogli di calcolo o gruppi WhatsApp infiniti.",
  },
];

const PERCHE = [
  {
    icon: Link2,
    titolo: "Tutto collegato",
    testo:
      "Contratto, pagamenti, deposito, utenze, manutenzioni: non cinque strumenti diversi, un solo ecosistema dove ogni parte coinvolta vede quello che le serve.",
  },
  {
    icon: Handshake,
    titolo: "Nessuno resta escluso",
    testo:
      "Agenzia, proprietario, inquilino e amministratore di condominio: LOQO è l'unica piattaforma pensata per farli lavorare insieme, non solo per digitalizzare il lavoro di uno di loro.",
  },
  {
    icon: Landmark,
    titolo: "Pensato per l'Italia",
    testo:
      "Contratti a canone concordato, cedolare secca, registrazione all'Agenzia delle Entrate: LOQO conosce le regole del mercato italiano, non è un adattamento di un prodotto pensato altrove.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-white/10 bg-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-2">
            <LoqoSeal size={24} color="#ffffff" ring={false} />
            <span className="font-display text-xl font-semibold tracking-tight text-white">LOQO</span>
          </span>
          <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white">
            Accedi
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-primary px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <LoqoSeal size={56} color="#ffffff" className="animate-seal-in mx-auto mb-6 opacity-90" />
          <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" aria-hidden="true" />
            La piattaforma per chi gestisce affitti in Italia
          </p>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Un contratto d&apos;affitto ha cinque persone intorno. LOQO le mette nello stesso posto.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Agenzia, proprietario, inquilino, amministratore di condominio. Oggi si parlano per email, telefono e
            fogli Excel sparsi. Con LOQO, contratto, pagamenti, deposito e manutenzioni vivono in un solo posto — e
            ognuno vede solo quello che gli serve.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CTA_CONTATTO_HREF}
              className="touch-target inline-flex items-center justify-center gap-2 rounded-control bg-white px-5 py-2.5 text-sm font-medium text-primary transition-all duration-150 ease-out hover:bg-white/90 active:scale-[0.98]"
            >
              Richiedi una demo
            </a>
            <Link
              href="/login"
              className="touch-target inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/30 transition-all duration-150 ease-out hover:bg-white/10 active:scale-[0.98]"
            >
              Accedi
            </Link>
          </div>
        </div>
      </section>

      {/* IL PROBLEMA */}
      <section className="bg-surface-muted px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Gestire un affitto oggi significa rincorrere
          </h2>
          <p className="mt-5 text-base text-slate-600">
            Un&apos;agenzia tiene traccia dei contratti su un gestionale, parla con l&apos;amministratore di
            condominio su WhatsApp, aspetta il bonifico del canone per email, e scopre un problema di manutenzione
            solo quando qualcuno si lamenta. Ogni passaggio è un&apos;occasione per perdere tempo — o perdere un
            cliente.
          </p>
          <p className="mt-6 text-lg font-medium text-ink">
            LOQO non aggiunge un altro strumento alla pila. Sostituisce la pila.
          </p>
        </Reveal>
      </section>

      {/* COME FUNZIONA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display text-center text-2xl font-semibold text-ink sm:text-3xl">
              Un posto, cinque punti di vista
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {RUOLI.map((ruolo, i) => (
              <Reveal key={ruolo.titolo} delayMs={i * 80}>
                <Card className="p-7">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                    <ruolo.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{ruolo.titolo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{ruolo.testo}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOSITO PROTETTO */}
      <section className="bg-primary/5 px-6 py-20">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Il deposito cauzionale, senza pensieri
          </h2>
          <p className="max-w-2xl text-base text-slate-600">
            Niente più contanti fermi per anni, niente dubbi su chi deve restituire cosa a fine contratto. LOQO
            tiene traccia del deposito per tutta la durata dell&apos;affitto — importo, interessi maturati, stato —
            e gestisce la restituzione (o l&apos;eventuale contestazione) in modo chiaro e documentato, per il
            proprietario e per l&apos;inquilino.
          </p>
        </Reveal>
      </section>

      {/* ROUTING SEGNALAZIONI */}
      <section className="px-6 py-20">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Wrench className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="font-display mt-6 text-2xl font-semibold text-ink sm:text-3xl">
            Non serve sapere chi chiamare
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600">
            Un problema in casa? Va al proprietario. Un problema condominiale? Va all&apos;amministratore — e il
            proprietario viene comunque informato. LOQO sa chi deve ricevere ogni segnalazione, perché conosce la
            relazione tra immobile, contratto e condominio. Basta descrivere il problema: al resto pensa la
            piattaforma.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300">
              Problema in casa
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-info)]/10 px-3 py-1 text-sm font-medium text-info ring-1 ring-inset ring-[var(--color-info)]/35">
              Proprietario
            </span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300">
              Problema condominiale
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-info)]/10 px-3 py-1 text-sm font-medium text-info ring-1 ring-inset ring-[var(--color-info)]/35">
              Amministratore
            </span>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-base text-slate-600">
            Quando serve un intervento vero — un idraulico, un elettricista, un tecnico — LOQO mette in contatto con
            professionisti convenzionati, senza dover cercare altrove.
          </p>
        </Reveal>
      </section>

      {/* PERCHÉ LOQO */}
      <section className="bg-surface-muted px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display text-center text-2xl font-semibold text-ink sm:text-3xl">Perché LOQO</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {PERCHE.map((blocco, i) => (
              <Reveal key={blocco.titolo} delayMs={i * 80}>
                <div className="rounded-card border border-slate-200 bg-surface p-7 shadow-card">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                    <blocco.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{blocco.titolo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{blocco.testo}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="bg-primary px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <LoqoSeal size={40} color="#ffffff" className="mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Prova LOQO sulla tua prima agenzia, il tuo primo condominio, il tuo primo affitto
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CTA_CONTATTO_HREF}
              className="touch-target inline-flex items-center justify-center gap-2 rounded-control bg-white px-5 py-2.5 text-sm font-medium text-primary transition-all duration-150 ease-out hover:bg-white/90 active:scale-[0.98]"
            >
              Richiedi una demo
            </a>
            <a
              href={CTA_CONTATTO_HREF}
              className="touch-target inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/30 transition-all duration-150 ease-out hover:bg-white/10 active:scale-[0.98]"
            >
              Scrivici
            </a>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-2">
            <LoqoSeal size={20} ring={false} />
            <span className="font-display text-base font-semibold text-ink">LOQO</span>
          </span>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <a href={CTA_CONTATTO_HREF} className="hover:text-ink">
              Contatti
            </a>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/termini" className="hover:text-ink">
              Termini di servizio
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
