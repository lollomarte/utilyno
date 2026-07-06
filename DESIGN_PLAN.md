# LOQO — Design Plan (redesign totale)

Stato: **Approvato. In esecuzione (Fase 2).**

> Revisione post-approvazione: la superficie `--pietra` è stata scurita e raffreddata da `#EAE7DF` (hsl 44°,21%,90%) a `#DDDBD4` (hsl 47°,12%,85%) dopo un confronto visivo con il cliché "crema+serif+accento caldo" — l'hue-shift verso il grigio-pietra, non il solo abbassamento di luminosità, è ciò che allontana dal cliché. Vedi tabella aggiornata sotto.

---

## 1. Concept

> **LOQO ha la materia di un portone di un palazzo signorile italiano: pietra chiara, ottone opaco, l'inchiostro di un timbro premuto con cura — non lo scintillio di una startup.**

Il mondo di LOQO è quello del contratto d'affitto, del deposito cauzionale, del citofono, dell'amministratore di condominio: un mondo fisico, italiano, fatto di materiali che invecchiano bene. Non è un prodotto "fintech", è l'infrastruttura silenziosa di chi amministra con cura. Il design deve somigliare più all'atrio di un palazzo d'epoca ristrutturato bene — pietra, ottone opaco, ferro battuto, luce naturale — che a una dashboard SaaS.

Questo non è un pivot: eredita ed eleva ciò che esiste già (blu petrolio, sigillo a 5 nodi, trattamento "Timbro" dei badge di stato) invece di ripartire da zero.

## 2. Palette

Un solo colore accento (ottone), usato con parsimonia. I colori di stato (successo/attenzione/errore/info) restano funzionali e distinti dall'accento — servono per leggere i dati, non per emozionare.

| Token | Nome semantico | Hex | Uso |
|---|---|---|---|
| `--pietra` | surface | `#DDDBD4` | sfondo pagina — pietra/travertino, non carta-crema |
| `--pietra-cupa` | surface-sunken | `#D4D2C9` | superfici incassate, tracce, sfondi di sezione alternati |
| `--inchiostro` | ink | `#12242B` | testo primario |
| `--petrolio` | primary | `#0E2F3C` | brand, superfici scure, sidebar, CTA primaria |
| `--ottone` | accent | `#A9803F` | **l'unico accento** — link, focus di marca, dettagli del Timbro, hover selettivi |
| `--nebbia` | ink-muted | `#5C6B70` | testo secondario, didascalie |

Nota tecnica sul token esistente `--color-accent`: nel codice attuale è già usato in 9 componenti come sinonimo di "successo" (pagamento confermato, checklist firmata, trend positivo) — mai come vero accento di marca. In Fase 2 Step 1 quelle occorrenze migrano a un nuovo `--color-success-soft`/`text-success`, liberando `--color-accent` per il suo uso corretto (ottone, solo nel Timbro e negli highlight di marca).

Colori di stato (invariati nella funzione, leggermente ritarati sul nuovo sfondo pietra):
`--success #1F7A5C` · `--warning #96692C` · `--danger #B23A2E` · `--info #2F5F73`

Nessun gradiente. Nessun glassmorphism. Un solo accento cromatico decorativo (ottone) in tutta la piattaforma.

## 3. Tipografia

Coppia deliberata, non un pairing di comodo:

- **Display — Fraunces** (variable, asse `opsz`/`SOFT`): serif "morbido", con curve idiosincratiche da carattere da stampa a caldo — non il serif ad alto contrasto da editoriale asettico. Riservato ai titoli H1/H2 e a nient'altro. Peso 500–600, `letter-spacing: -0.01em / -0.02em`.
- **Body — Public Sans**: umanista, leggibilissima anche piccola (nata per moduli/form della PA americana), più calda di Inter/Helvetica senza scadere nel decorativo. Tutto il testo UI, i form, le tabelle.
- **Mono — Geist Mono** (già installato): riservato a **tutti i numeri** — importi, date, codici contratto, KPI. Le cifre dei numeri grandi in dashboard useranno il mono, non il display: il serif è per le parole, il mono è per i dati verificabili.

Scala (desktop; clamp per mobile in esecuzione):

| Ruolo | Font | Size/LH | Peso | Tracking |
|---|---|---|---|---|
| Display 2XL (hero H1) | Fraunces | 56/60px → 1.05 | 560 | -0.02em |
| Display XL (H2 sezione) | Fraunces | 40/46px | 520 | -0.015em |
| Display L (H3) | Fraunces | 28/34px | 520 | -0.01em |
| Body XL (lead) | Public Sans | 20/32px | 400 | 0 |
| Body L | Public Sans | 17/28px | 400/500 | 0 |
| Body M (default UI) | Public Sans | 15/24px | 400 | 0 |
| Body S (label/caption) | Public Sans | 13/18px | 500 | 0.01em |
| Micro (eyebrow, uppercase) | Public Sans | 11/16px | 600 | 0.08em |
| Mono XL (KPI grande) | Geist Mono | 40/44px | 500, tabular-nums | -0.01em |
| Mono M (tabelle/importi) | Geist Mono | 15/22px | 500, tabular-nums | 0 |
| Mono S (codici contratto) | Geist Mono | 13/18px | 400, tabular-nums | 0.01em |

Entrambi via `next/font/google` (self-hosted, come già avviene per Newsreader/Geist Mono oggi — nessuna richiesta esterna a runtime).

## 4. Elemento firma — "Il Timbro"

Il nome eredita direttamente il trattamento badge già esistente ("Il Timbro": pallino pieno + anello inciso, vedi `badge.tsx`). Lo eleviamo da dettaglio dei badge a **unico linguaggio d'interazione di tutta la piattaforma**:

- **A riposo**: ogni superficie primaria (CTA principale, voce di nav attiva, il blocco "cosa richiede attenzione") porta, in un angolo, un doppio anello concentrico dello stesso disegno del sigillo LOQO, a opacità quasi impercettibile (4–6%).
- **Hover**: gli anelli si schiariscono e si espandono leggermente (300ms), con un accenno di bagliore color ottone nel punto d'origine.
- **Press/click**: l'elemento scala al 97%, l'ombra diventa incassata per ~150ms come se il timbro venisse premuto — poi si assesta.

Tutto il resto della UI resta deliberatamente quieto: niente ombre drammatiche, niente hover-lift generico, niente icone decorative aggiuntive. Il Timbro è l'unica firma, e proprio per questo va usato con disciplina: mai su superfici puramente informative.

## 5. Motion system

- **Durate**: `150ms` micro (focus, toggle, hover di stato) · `300ms` transizioni (modali, tab, cross-fade, press del Timbro) · `600ms` reveal (scroll-reveal, ingressi di sezione, page transition)
- **Un'unica curva firmata**: `--ease-loqo: cubic-bezier(0.22, 1, 0.36, 1)` — decelerazione morbida e decisa, usata ovunque, senza eccezioni (anche il "press" del Timbro la riusa, solo su una durata più corta — niente molle/bounce che romperebbero la disciplina di un'unica curva).
- **Page transition**: coerente con lo splash esistente (dissolvenza su base petrolio) — tra le route interne, cross-fade 300ms + assestamento verticale di 8px, mai un salto secco.
- **Scroll-reveal orchestrato**: estende il componente `Reveal` già esistente (Intersection Observer, già usato in homepage con stagger `delayMs={i*80}`) invece di introdurre una libreria. Ogni sezione entra con dissolvenza+traslazione; i figli (card, righe) sfalsati di ~80–100ms.
- **Micro-interazioni**: bottoni/righe tabella/card rispondono su hover e su focus da tastiera con lo stesso vocabolario (mai solo su `:hover`).
- **Count-up KPI**: hook custom (nessuna libreria) basato su Intersection Observer, anima da 0 al valore reale in ~900ms con `--ease-loqo`, poi fissa il valore reale (mai un ciclo infinito).
- **`prefers-reduced-motion`**: rispettato ovunque tramite media query globale, come già avviene oggi in `globals.css` — animazioni disattivate, stati finali mostrati immediatamente.

**Decisione libreria**: niente `framer-motion`/`motion` per ora. Tutti gli effetti richiesti (fade, stagger, cross-fade, count-up, page transition) sono ottenibili con CSS transitions + Intersection Observer + piccoli hook custom, coerente con l'architettura già esistente (zero dipendenze nuove, bundle invariato). Unica eccezione possibile: il drag-to-dismiss del bottom sheet mobile, dove valuterò in Fase 2B se i Pointer Event nativi bastano prima di considerare una libreria minima — lo dichiaro qui come punto di attenzione, non lo decido a priori.

Per la command palette: **`cmdk`** (libreria leggera, ~5kb, lo standard de facto per questo pattern) — unica nuova dipendenza prevista in tutto il redesign.

## 6. Dark mode

**Non la implemento.** Il concept (pietra chiara, luce diurna, ottone che riflette la luce) è intrinsecamente una palette da luce naturale: un'inversione scura diluirebbe l'identità e dividerebbe lo sforzo su due modalità mediocri invece di una impeccabile. Meglio una light mode curatissima.

## 7. Wireframe ASCII

### Homepage pubblica

```
┌────────────────────────────────────────────────────────────────┐
│ ◆ LOQO                                    Richiedi demo  Accedi │ ← navbar: trasparente su
├────────────────────────────────────────────────────────────────┤   hero, poi pietra+filo
│                                                                  │   ottone dopo lo scroll
│        Un contratto d'affitto ha cinque persone intorno.        │
│              LOQO le mette nello stesso posto.                  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │   [DEMO ANIMATA]                                      │      │
│   │   ● Segnalazione: "Perdita in bagno"                  │      │
│   │        ↳ instrada da sola →  ● Proprietario            │     │
│   │                              ● Inquilino                │     │
│   │   (loop leggero, parte quando la hero entra in vista)  │      │
│   └──────────────────────────────────────────────────────┘      │
│              [Richiedi una demo]   [Guarda come funziona]       │
├────────────────────────────────────────────────────────────────┤
│  COME FUNZIONA PER RUOLO                                        │
│  (Agenzia) (Proprietario) (Inquilino) (Amministratore) (Admin)  │ ← tab, cross-fade sul
│  ┌────────────────────────────────────────────────────────┐    │   contenuto al cambio
│  │ testo + mini illustrazione lineare specifica del ruolo   │    │
│  └────────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  IL DEPOSITO, PROTETTO                                          │
│  [icona sigillo]  Niente contanti fermi, tracciato per tutta     │
│                    la durata dell'affitto.                       │
├────────────────────────────────────────────────────────────────┤
│  SEGNALAZIONI CHE SANNO DOVE ANDARE                              │
│  [diagramma rotta] Problema in casa → proprietario                │
│                     Problema condominiale → amministratore        │
├────────────────────────────────────────────────────────────────┤
│  PERCHÉ LOQO            (3 card, stagger 80ms)                   │
│  [Tutto collegato] [Nessuno escluso] [Pensato per l'Italia]      │
├────────────────────────────────────────────────────────────────┤
│              Prova LOQO sulla tua prima agenzia                 │
│                [Richiedi una demo]  [Scrivici]                  │
├────────────────────────────────────────────────────────────────┤
│  ◆ LOQO        Contatti · Privacy · Termini                     │
└────────────────────────────────────────────────────────────────┘
```

### Dashboard Proprietario

```
┌───────────┬──────────────────────────────────────────────────────┐
│ ◆ LOQO    │  Marco Bianchi · Proprietario           🔔  Esci      │
│ Portale   ├──────────────────────────────────────────────────────┤
│ Prop.     │  COSA RICHIEDE ATTENZIONE                              │
│           │  ┌────────────────────────────────────────────────┐  │
│ Dashboard │  │ ● 2 pagamenti in ritardo — Via Roma, Via Dante   │  │
│ Immobili  │  │ ● 1 segnalazione aperta — Corso Buenos Aires     │  │
│ Contratti │  │ ● Contratto Via Roma scade tra 40 giorni         │  │
│ Pagamenti │  └────────────────────────────────────────────────┘  │
│ Segnal.   │  (se tutto è a posto: stato di quiete disegnato,      │
│ Documenti │   non un vuoto — es. sigillo a riposo + un rigo)      │
│           │                                                        │
│           │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│           │  │Immobili  │ │Canone med│ │Occupazione│ │Yield medio│ │
│           │  │   4      │ │ 1.100 €  │ │   3 / 4   │ │  4.2%    │ │
│           │  │  (count-up, mono, numero domina, label sussurra) │ │
│           │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│           │                                                        │
│           │  ┌─────────────────────────┐ ┌────────────────────┐  │
│           │  │ Andamento incassi (chart)│ │ Distribuzione pag. │  │
│           │  └─────────────────────────┘ └────────────────────┘  │
│           │  ┌────────────────────────────────────────────────┐  │
│           │  │ Documenti recenti (righe con stagger al primo   │  │
│           │  │ render, hover riga)                             │  │
│           │  └────────────────────────────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────┘
   ⌘K in ogni punto apre la command palette
```

### Dashboard Inquilino

```
┌───────────┬──────────────────────────────────────────────────────┐
│ ◆ LOQO    │  Giorgia Fontana · Inquilino            🔔  Esci      │
│ Portale   ├──────────────────────────────────────────────────────┤
│ Inquilino │  COSA RICHIEDE ATTENZIONE                              │
│           │  ┌────────────────────────────────────────────────┐  │
│ Dashboard │  │ ● Canone di luglio in scadenza tra 3 giorni      │  │
│ Contratto │  │ ● Utenza GAS ancora da attivare                  │  │
│ Pagamenti │  └────────────────────────────────────────────────┘  │
│ Utenze    │                                                        │
│ Segnal.   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│ Checklist │  │Canone mensile│ │Prossima scad.│ │Deposito      │  │
│ Documenti │  │   950 €      │ │  05/07/2026  │ │ Versato      │  │
│           │  └──────────────┘ └──────────────┘ └──────────────┘  │
│           │                                                        │
│           │  ┌────────────────────────────────────────────────┐  │
│           │  │ Contratto in sintesi (agenzia, periodo, canone)  │  │
│           │  └────────────────────────────────────────────────┘  │
│           │  ┌────────────────────────────────────────────────┐  │
│           │  │ Utenze — righe con stato (Attiva/Da attivare),   │  │
│           │  │ hover riga, CTA "Attiva" inline                 │  │
│           │  └────────────────────────────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────┘
```

## 8. Autocritica

*"Questo design potrebbe uscire identico per qualsiasi altro SaaS?"*

- **Cliché (a)** — crema + serif alto contrasto + terracotta: **evitato**. Il fondo è pietra/travertino (più grigio-cemento che carta), il serif (Fraunces) è morbido e idiosincratico, non ad alto contrasto editoriale, e l'accento è ottone opaco — né terracotta né argilla.
- **Cliché (b)** — quasi-nero + accento acido: **evitato**, non c'è una superficie quasi-nera dominante (il petrolio scuro è riservato a sidebar/superfici di marca, non allo sfondo globale).
- **Cliché (c)** — broadsheet/hairline/zero radius: **evitato**, i raggi esistenti (10/12/22px) restano, le ombre morbide restano, non c'è impaginazione da giornale.
- **Cliché (d)** — gradienti viola/blu: **evitato**, nessun gradiente in tutto il piano.
- **Cliché (e)** — glassmorphism: **evitato**, nessun blur/vetro; la navbar allo scroll guadagna una superficie pietra opaca con un filo ottone, non vetro sfocato.
- **Cliché (f)** — emoji: **evitato**, tutte le icone restano Lucide, coerenti con l'esistente.

Il vero rischio non è nella palette ma nella disciplina d'esecuzione: "Il Timbro" deve restare l'UNICA cosa espressiva, altrimenti collassa in un generico "hover-lift ovunque" da SaaS. Lo terrò a mente in Fase 2 come criterio di taglio (regola di Chanel finale).

---

**In attesa della tua approvazione esplicita prima di scrivere qualunque codice.**
