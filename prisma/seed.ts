import {
  PrismaClient,
  TipoImmobile,
  TipoContratto,
  RegimeFiscale,
  StatoContratto,
  StatoDeposito,
  StatoPagamento,
  TipoUtenza,
  StatoUtenza,
  StatoAssicurazione,
  TipoChecklist,
  StatoSegnalazione,
  CategoriaIntervento,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMonths, subMonths } from "date-fns";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Pulizia database...");
  await prisma.documento.deleteMany();
  await prisma.checklistImmobile.deleteMany();
  await prisma.richiestaPreventivo.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.segnalazioneRisposta.deleteMany();
  await prisma.segnalazioneDestinatario.deleteMany();
  await prisma.segnalazione.deleteMany();
  await prisma.assicurazione.deleteMany();
  await prisma.utenza.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.contratto.deleteMany();
  await prisma.immobile.deleteMany();
  await prisma.condominio.deleteMany();
  await prisma.inquilino.deleteMany();
  await prisma.proprietario.deleteMany();
  await prisma.amministratore.deleteMany();
  await prisma.agenzia.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await hash("Password123!");

  // ---------- Admin ----------
  await prisma.user.create({
    data: {
      email: "admin@loqo.it",
      passwordHash: defaultPassword,
      role: "ADMIN",
      nome: "Giulia",
      cognome: "Ferrari",
      telefono: "+39 320 1112233",
    },
  });

  // ---------- Agenzie ----------
  const agenziaUser1 = await prisma.user.create({
    data: {
      email: "agenzia.milano@loqo.it",
      passwordHash: defaultPassword,
      role: "AGENZIA",
      nome: "Marco",
      cognome: "Bianchi",
      telefono: "+39 02 55443322",
    },
  });
  const agenzia1 = await prisma.agenzia.create({
    data: {
      userId: agenziaUser1.id,
      ragioneSociale: "Milano Casa Immobiliare Srl",
      piva: "01234567890",
      indirizzo: "Via Torino 12, 20123 Milano (MI)",
      telefono: "+39 02 55443322",
    },
  });

  const agenziaUser2 = await prisma.user.create({
    data: {
      email: "agenzia.roma@loqo.it",
      passwordHash: defaultPassword,
      role: "AGENZIA",
      nome: "Chiara",
      cognome: "Romano",
      telefono: "+39 06 99887766",
    },
  });
  const agenzia2 = await prisma.agenzia.create({
    data: {
      userId: agenziaUser2.id,
      ragioneSociale: "Roma Affitti & Gestioni Srl",
      piva: "09876543210",
      indirizzo: "Via Nazionale 45, 00184 Roma (RM)",
      telefono: "+39 06 99887766",
    },
  });

  // ---------- Amministratori di condominio ----------
  const amminUser1 = await prisma.user.create({
    data: {
      email: "amministratore.nord@loqo.it",
      passwordHash: defaultPassword,
      role: "AMMINISTRATORE",
      nome: "Paolo",
      cognome: "Neri",
      telefono: "+39 02 33445566",
    },
  });
  const amministratore1 = await prisma.amministratore.create({
    data: {
      userId: amminUser1.id,
      ragioneSociale: "Condomini Nord Srl",
      piva: "11223344556",
      indirizzo: "Via Brera 5, 20121 Milano (MI)",
      telefono: "+39 02 33445566",
    },
  });

  const amminUser2 = await prisma.user.create({
    data: {
      email: "amministratore.sud@loqo.it",
      passwordHash: defaultPassword,
      role: "AMMINISTRATORE",
      nome: "Federica",
      cognome: "Testa",
      telefono: "+39 06 77889900",
    },
  });
  const amministratore2 = await prisma.amministratore.create({
    data: {
      userId: amminUser2.id,
      ragioneSociale: "Gestioni Sud Srl",
      piva: "66554433221",
      indirizzo: "Via Cavour 20, 00184 Roma (RM)",
      telefono: "+39 06 77889900",
    },
  });

  // ---------- Condomini ----------
  const condominio1 = await prisma.condominio.create({
    data: {
      amministratoreId: amministratore1.id,
      nome: "Residenza Parco Sempione",
      indirizzo: "Corso Buenos Aires 22",
      comune: "Milano",
      numeroUnita: 24,
    },
  });
  const condominio2 = await prisma.condominio.create({
    data: {
      amministratoreId: amministratore1.id,
      nome: "Condominio Via Torino",
      indirizzo: "Via Torino 15",
      comune: "Milano",
      numeroUnita: 12,
    },
  });
  const condominio3 = await prisma.condominio.create({
    data: {
      amministratoreId: amministratore2.id,
      nome: "Palazzo Colosseo",
      indirizzo: "Via del Corso 150",
      comune: "Roma",
      numeroUnita: 18,
    },
  });

  // ---------- Proprietari ----------
  const proprietariData = [
    { nome: "Luca", cognome: "Verdi", email: "luca.verdi@example.com", cf: "VRDLCU80A01F205X" },
    { nome: "Anna", cognome: "Colombo", email: "anna.colombo@example.com", cf: "CLMNNA75B41F205Y" },
    { nome: "Paolo", cognome: "Ricci", email: "paolo.ricci@example.com", cf: "RCCPLA70C15H501Z" },
    { nome: "Sara", cognome: "Marino", email: "sara.marino@example.com", cf: "MRNSRA85D55F839W" },
    { nome: "Davide", cognome: "Gallo", email: "davide.gallo@example.com", cf: "GLLDVD90E20H501K" },
    { nome: "Elena", cognome: "Conti", email: "elena.conti@example.com", cf: "CNTLNE88F55F205J" },
  ];
  const proprietari = [];
  for (const p of proprietariData) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: defaultPassword,
        role: "PROPRIETARIO",
        nome: p.nome,
        cognome: p.cognome,
        telefono: "+39 333 " + Math.floor(1000000 + Math.random() * 8999999),
      },
    });
    const proprietario = await prisma.proprietario.create({
      data: {
        userId: user.id,
        codiceFiscale: p.cf,
        indirizzo: `Via Roma ${Math.floor(Math.random() * 100)}, Milano (MI)`,
      },
    });
    proprietari.push(proprietario);
  }

  // ---------- Inquilini ----------
  const inquiliniData = [
    { nome: "Elena", cognome: "Bruno", email: "elena.bruno@example.com", cf: "BRNLNE92F41F205A" },
    { nome: "Matteo", cognome: "Costa", email: "matteo.costa@example.com", cf: "CSTMTT88G15H501B" },
    { nome: "Giorgia", cognome: "Fontana", email: "giorgia.fontana@example.com", cf: "FNTGRG95H55F839C" },
    { nome: "Simone", cognome: "Rizzo", email: "simone.rizzo@example.com", cf: "RZZSMN91L20H501D" },
    { nome: "Francesca", cognome: "Greco", email: "francesca.greco@example.com", cf: "GRCFNC93M41F205E" },
    { nome: "Alessandro", cognome: "Conti", email: "alessandro.conti@example.com", cf: "CNTLSN87N15H501F" },
    { nome: "Valentina", cognome: "De Luca", email: "valentina.deluca@example.com", cf: "DLCVNT94P55F839G" },
    { nome: "Riccardo", cognome: "Barbieri", email: "riccardo.barbieri@example.com", cf: "BRBRCR89Q20H501H" },
    { nome: "Martina", cognome: "Esposito", email: "martina.esposito@example.com", cf: "SPSMTN96R55F205I" },
    { nome: "Lorenzo", cognome: "Ferrari", email: "lorenzo.ferrari@example.com", cf: "FRRLNZ90S15H501L" },
  ];
  const inquilini = [];
  for (const i of inquiliniData) {
    const user = await prisma.user.create({
      data: {
        email: i.email,
        passwordHash: defaultPassword,
        role: "INQUILINO",
        nome: i.nome,
        cognome: i.cognome,
        telefono: "+39 340 " + Math.floor(1000000 + Math.random() * 8999999),
      },
    });
    const inquilino = await prisma.inquilino.create({
      data: {
        userId: user.id,
        codiceFiscale: i.cf,
      },
    });
    inquilini.push(inquilino);
  }

  // ---------- Immobili ----------
  const immobiliData = [
    { indirizzo: "Via Dante 8", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 75, valore: 320000, ape: "B", agenzia: agenzia1, proprietario: proprietari[0], condominio: null },
    { indirizzo: "Corso Buenos Aires 22", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 55, valore: 250000, ape: "C", agenzia: agenzia1, proprietario: proprietari[1], condominio: condominio1 },
    { indirizzo: "Viale Monza 100", comune: "Milano", provincia: "MI", tipo: TipoImmobile.COMMERCIALE, mq: 120, valore: 480000, ape: "D", agenzia: agenzia1, proprietario: proprietari[2], condominio: null },
    { indirizzo: "Via Padova 34", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 90, valore: 360000, ape: "A", agenzia: agenzia1, proprietario: proprietari[0], condominio: condominio2 },
    { indirizzo: "Via Torino 15", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 68, valore: 290000, ape: "B", agenzia: agenzia1, proprietario: proprietari[3], condominio: condominio2 },
    { indirizzo: "Via del Corso 150", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 65, valore: 400000, ape: "C", agenzia: agenzia2, proprietario: proprietari[3], condominio: condominio3 },
    { indirizzo: "Via Appia Nuova 210", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 80, valore: 340000, ape: "B", agenzia: agenzia2, proprietario: proprietari[4], condominio: null },
    { indirizzo: "Via Prenestina 55", comune: "Roma", provincia: "RM", tipo: TipoImmobile.COMMERCIALE, mq: 200, valore: 610000, ape: "E", agenzia: agenzia2, proprietario: proprietari[3], condominio: null },
    { indirizzo: "Via Tiburtina 88", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 48, valore: 195000, ape: "D", agenzia: agenzia2, proprietario: proprietari[4], condominio: condominio3 },
    { indirizzo: "Via Nazionale 40", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 72, valore: 310000, ape: "C", agenzia: agenzia2, proprietario: proprietari[5], condominio: null },
  ];
  const immobili = [];
  for (const [idx, im] of immobiliData.entries()) {
    const immobile = await prisma.immobile.create({
      data: {
        proprietarioId: im.proprietario.id,
        agenziaId: im.agenzia.id,
        condominioId: im.condominio?.id ?? null,
        indirizzo: im.indirizzo,
        comune: im.comune,
        provincia: im.provincia,
        datiCatastali: `Fg. ${idx + 1}, Part. ${100 + idx}, Sub. ${idx + 1}`,
        superficieMq: im.mq,
        tipoImmobile: im.tipo,
        apeClasse: im.ape,
        valoreStimato: im.valore,
      },
    });
    immobili.push(immobile);

    await prisma.utenza.createMany({
      data: [
        { immobileId: immobile.id, tipo: TipoUtenza.LUCE, fornitore: "Enel Energia", stato: StatoUtenza.ATTIVA, dataAttivazione: subMonths(new Date(), 6) },
        { immobileId: immobile.id, tipo: TipoUtenza.GAS, fornitore: "Eni Gas e Luce", stato: StatoUtenza.ATTIVA, dataAttivazione: subMonths(new Date(), 6) },
        { immobileId: immobile.id, tipo: TipoUtenza.ACQUA, fornitore: "Gruppo CAP", stato: idx % 3 === 0 ? StatoUtenza.DA_ATTIVARE : StatoUtenza.ATTIVA, dataAttivazione: idx % 3 === 0 ? null : subMonths(new Date(), 6) },
        { immobileId: immobile.id, tipo: TipoUtenza.INTERNET, fornitore: "TIM", stato: idx % 4 === 0 ? StatoUtenza.DISDETTA : StatoUtenza.ATTIVA, dataAttivazione: subMonths(new Date(), 3) },
      ],
    });
  }

  // ---------- Assicurazioni (2-3) ----------
  await prisma.assicurazione.createMany({
    data: [
      {
        immobileId: immobili[0].id,
        tipo: "Polizza multirischio abitazione",
        fornitore: "Generali Italia",
        premioAnnuale: 240,
        stato: StatoAssicurazione.ATTIVA,
        dataScadenza: addMonths(new Date(), 8),
        commissioneLoqo: 24,
      },
      {
        immobileId: immobili[1].id,
        tipo: "Polizza responsabilità civile locatore",
        fornitore: "Allianz",
        premioAnnuale: 180,
        stato: StatoAssicurazione.DA_RINNOVARE,
        dataScadenza: addDays(new Date(), 20),
        commissioneLoqo: 18,
      },
      {
        immobileId: immobili[5].id,
        tipo: "Polizza multirischio abitazione",
        fornitore: "UnipolSai",
        premioAnnuale: 260,
        stato: StatoAssicurazione.SCADUTA,
        dataScadenza: subMonths(new Date(), 1),
        commissioneLoqo: 26,
      },
    ],
  });

  // ---------- Contratti ----------
  const contrattiConfig = [
    { immobile: immobili[0], inquilino: inquilini[0], agenzia: agenzia1, tipo: TipoContratto.QUATTRO_PIU_QUATTRO, canone: 1100, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 8), registrato: true, depositoStato: StatoDeposito.VERSATO },
    { immobile: immobili[1], inquilino: inquilini[1], agenzia: agenzia1, tipo: TipoContratto.TRE_PIU_DUE, canone: 850, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 14), registrato: true, depositoStato: StatoDeposito.VERSATO },
    { immobile: immobili[2], inquilino: inquilini[2], agenzia: agenzia1, tipo: TipoContratto.CONCORDATO, canone: 1900, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 3), registrato: true, depositoStato: StatoDeposito.IN_CONTESTAZIONE },
    { immobile: immobili[3], inquilino: inquilini[3], agenzia: agenzia1, tipo: TipoContratto.STUDENTI, canone: 600, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.SCADUTO, inizio: subMonths(new Date(), 20), registrato: true, depositoStato: StatoDeposito.RESTITUITO },
    { immobile: immobili[5], inquilino: inquilini[4], agenzia: agenzia2, tipo: TipoContratto.QUATTRO_PIU_QUATTRO, canone: 1350, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 5), registrato: true, depositoStato: StatoDeposito.VERSATO },
    { immobile: immobili[6], inquilino: inquilini[5], agenzia: agenzia2, tipo: TipoContratto.TRANSITORIO, canone: 750, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.BOZZA, inizio: addDays(new Date(), 15), registrato: false, depositoStato: StatoDeposito.NON_VERSATO },
    { immobile: immobili[8], inquilino: inquilini[6], agenzia: agenzia2, tipo: TipoContratto.TRE_PIU_DUE, canone: 700, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 6), registrato: true, depositoStato: StatoDeposito.VERSATO },
  ];

  const contratti = [];
  for (const c of contrattiConfig) {
    const dataFine =
      c.tipo === TipoContratto.QUATTRO_PIU_QUATTRO ? addMonths(c.inizio, 48) :
      c.tipo === TipoContratto.TRE_PIU_DUE ? addMonths(c.inizio, 36) :
      c.tipo === TipoContratto.TRANSITORIO ? addMonths(c.inizio, 12) :
      c.tipo === TipoContratto.STUDENTI ? addMonths(c.inizio, 24) :
      addMonths(c.inizio, 36);

    const depositoImporto = c.canone * 2;

    const contratto = await prisma.contratto.create({
      data: {
        immobileId: c.immobile.id,
        inquilinoId: c.inquilino.id,
        agenziaId: c.agenzia.id,
        tipoContratto: c.tipo,
        dataInizio: c.inizio,
        dataFine,
        canoneMensile: c.canone,
        regimeFiscale: c.regime,
        stato: c.stato,
        dataRegistrazioneAdE: c.registrato ? addDays(c.inizio, 30) : null,
        dataUltimoRinnovoRegistrazione: c.registrato && c.stato === StatoContratto.ATTIVO ? addMonths(c.inizio, 12) : null,
        depositoImporto,
        depositoStato: c.depositoStato,
        interessiLegaliMaturati: c.depositoStato === StatoDeposito.VERSATO ? Math.round(depositoImporto * 0.015 * 100) / 100 : 0,
        dataRestituzioneDeposito: c.depositoStato === StatoDeposito.RESTITUITO ? addDays(c.inizio, 600) : null,
      },
    });
    contratti.push(contratto);

    if (c.stato === StatoContratto.BOZZA) continue;

    // Storico pagamenti: mesi passati pagati, mese corrente in ritardo/pagato misto, mesi futuri programmati
    for (let m = -3; m <= 2; m++) {
      const scadenza = addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 5), m);
      let stato: StatoPagamento;
      let dataPagamento: Date | null = null;
      let metodo: string | null = "Bonifico bancario";

      if (m < 0) {
        stato = StatoPagamento.PAGATO;
        dataPagamento = addDays(scadenza, Math.floor(Math.random() * 3));
      } else if (m === 0) {
        if (c.stato === StatoContratto.SCADUTO) {
          stato = StatoPagamento.INSOLUTO;
          metodo = null;
        } else {
          stato = Math.random() > 0.6 ? StatoPagamento.IN_RITARDO : StatoPagamento.PAGATO;
          dataPagamento = stato === StatoPagamento.PAGATO ? addDays(scadenza, 2) : null;
          metodo = stato === StatoPagamento.PAGATO ? "Bonifico bancario" : null;
        }
      } else {
        stato = StatoPagamento.PROGRAMMATO;
        metodo = null;
      }

      await prisma.pagamento.create({
        data: {
          contrattoId: contratto.id,
          importo: c.canone,
          dataScadenza: scadenza,
          dataPagamento,
          stato,
          metodoPagamento: metodo,
        },
      });
    }

    await prisma.documento.create({
      data: {
        contrattoId: contratto.id,
        nome: "Contratto_registrato.pdf",
        url: "/documenti/mock/contratto.pdf",
        tipo: "CONTRATTO",
      },
    });
  }

  // Checklist ingresso per un paio di contratti attivi
  await prisma.checklistImmobile.createMany({
    data: [
      {
        contrattoId: contratti[0].id,
        tipo: TipoChecklist.INGRESSO,
        fotoUrls: ["/checklist/mock/foto1.jpg", "/checklist/mock/foto2.jpg"],
        firmaInquilino: true,
        firmaProprietario: true,
        note: "Immobile consegnato in ottimo stato, nessuna criticità rilevata.",
      },
      {
        contrattoId: contratti[4].id,
        tipo: TipoChecklist.INGRESSO,
        fotoUrls: ["/checklist/mock/foto3.jpg"],
        firmaInquilino: true,
        firmaProprietario: false,
        note: "In attesa della firma del proprietario.",
      },
    ],
  });

  // ---------- Segnalazioni: problemi di unità (aperte dall'inquilino, vanno al proprietario) ----------
  const segnalazioniUnita = [
    { immobile: immobili[0], inquilino: inquilini[0], titolo: "Perdita rubinetto cucina", descrizione: "Il rubinetto della cucina perde acqua costantemente, servirebbe un idraulico.", stato: StatoSegnalazione.APERTA, priorita: "ALTA", categoriaIntervento: CategoriaIntervento.IDRAULICO },
    { immobile: immobili[1], inquilino: inquilini[1], titolo: "Caldaia non si accende", descrizione: "La caldaia non parte da ieri sera, niente acqua calda.", stato: StatoSegnalazione.IN_LAVORAZIONE, priorita: "ALTA", categoriaIntervento: CategoriaIntervento.CALDAIA_CLIMATIZZAZIONE },
    { immobile: immobili[2], inquilino: inquilini[2], titolo: "Citofono guasto", descrizione: "Il citofono non suona, bisogna sostituire il pulsante esterno.", stato: StatoSegnalazione.APERTA, priorita: "MEDIA", categoriaIntervento: CategoriaIntervento.ELETTRICISTA },
    { immobile: immobili[5], inquilino: inquilini[4], titolo: "Tapparella bloccata", descrizione: "La tapparella della camera da letto si è bloccata a metà.", stato: StatoSegnalazione.RISOLTA, priorita: "BASSA", categoriaIntervento: CategoriaIntervento.MANUTENZIONE_GENERICA },
  ];
  for (const s of segnalazioniUnita) {
    const proprietario = proprietari.find((p) => p.id === s.immobile.proprietarioId)!;
    await prisma.segnalazione.create({
      data: {
        titolo: s.titolo,
        descrizione: s.descrizione,
        categoria: "PROBLEMA_UNITA",
        categoriaIntervento: s.categoriaIntervento,
        stato: s.stato,
        priorita: s.priorita,
        creatoDaUserId: s.inquilino.userId,
        immobileId: s.immobile.id,
        destinatari: {
          create: [
            { userId: s.inquilino.userId, letto: true, dataLettura: new Date() },
            { userId: proprietario.userId, letto: false },
          ],
        },
      },
    });
  }

  // ---------- Segnalazioni: problemi condominiali (aperte dall'amministratore, vanno a proprietario + inquilino) ----------
  const segnalazioniCondominiali = [
    { immobile: immobili[1], amministratore: amministratore1, titolo: "Infiltrazione tetto scala B", descrizione: "Segnalata infiltrazione d'acqua dal tetto in corrispondenza della scala B, ultimo piano.", stato: StatoSegnalazione.IN_LAVORAZIONE, priorita: "ALTA" },
    { immobile: immobili[1], amministratore: amministratore1, titolo: "Ascensore fuori servizio", descrizione: "L'ascensore principale è bloccato al piano terra, necessario intervento tecnico.", stato: StatoSegnalazione.APERTA, priorita: "ALTA" },
    { immobile: immobili[3], amministratore: amministratore1, titolo: "Manutenzione giardino condominiale", descrizione: "Il giardino condominiale necessita di potatura e manutenzione ordinaria.", stato: StatoSegnalazione.APERTA, priorita: "BASSA" },
    { immobile: immobili[5], amministratore: amministratore2, titolo: "Sostituzione lampade scale", descrizione: "Diverse lampade delle scale condominiali sono fulminate e vanno sostituite.", stato: StatoSegnalazione.RISOLTA, priorita: "MEDIA" },
    { immobile: immobili[8], amministratore: amministratore2, titolo: "Rumori molesti impianto idrico", descrizione: "Alcuni condomini segnalano rumori anomali provenienti dall'impianto idrico centrale.", stato: StatoSegnalazione.IN_LAVORAZIONE, priorita: "MEDIA" },
  ];
  for (const s of segnalazioniCondominiali) {
    const proprietario = proprietari.find((p) => p.id === s.immobile.proprietarioId)!;
    const contrattoAttivo = contratti.find((c) => c.immobileId === s.immobile.id && c.stato === "ATTIVO");
    const inquilinoAttivo = contrattoAttivo ? inquilini.find((i) => i.id === contrattoAttivo.inquilinoId) : undefined;

    await prisma.segnalazione.create({
      data: {
        titolo: s.titolo,
        descrizione: s.descrizione,
        categoria: "PROBLEMA_CONDOMINIALE",
        stato: s.stato,
        priorita: s.priorita,
        creatoDaUserId: s.amministratore.userId,
        immobileId: s.immobile.id,
        destinatari: {
          create: [
            { userId: s.amministratore.userId, letto: true, dataLettura: new Date() },
            { userId: proprietario.userId, letto: false },
            ...(inquilinoAttivo ? [{ userId: inquilinoAttivo.userId, letto: false }] : []),
          ],
        },
      },
    });
  }

  // ---------- Partner convenzionati ----------
  await prisma.partner.createMany({
    data: [
      {
        nome: "Idraulica Rossi",
        categoria: "IDRAULICO",
        zonaCopertura: "Milano e provincia",
        telefono: "+39 02 1234567",
        email: "info@idraulicarossi.it",
        contattoReferente: "Giuseppe Rossi",
        commissioneMedia: 25,
      },
      {
        nome: "ElettroService Milano",
        categoria: "ELETTRICISTA",
        zonaCopertura: "Milano e hinterland",
        telefono: "+39 02 2345678",
        email: "assistenza@elettroservicemilano.it",
        contattoReferente: "Marco Bianchi",
        commissioneMedia: 20,
      },
      {
        nome: "Caldaie & Clima Lombardia",
        categoria: "CALDAIA_CLIMATIZZAZIONE",
        zonaCopertura: "Milano, Monza e Brianza",
        telefono: "+39 02 3456789",
        email: "info@caldaieclimalombardia.it",
        contattoReferente: "Luca Ferrari",
        commissioneMedia: 30,
      },
      {
        nome: "Tutto Pro Milano",
        categoria: "MANUTENZIONE_GENERICA",
        zonaCopertura: "Milano città",
        telefono: "+39 02 4567890",
        email: "richieste@tuttopromilano.it",
        contattoReferente: "Andrea Colombo",
        commissioneMedia: 18,
      },
      {
        nome: "Energia Diretta",
        categoria: "UTENZE_LUCE_GAS",
        zonaCopertura: "Tutta Italia",
        telefono: "+39 800 123456",
        email: "commerciale@energiadiretta.it",
        contattoReferente: "Silvia Greco",
        commissioneMedia: 15,
      },
      {
        nome: "Assicura Casa",
        categoria: "ASSICURAZIONE",
        zonaCopertura: "Tutta Italia",
        telefono: "+39 06 5678901",
        email: "polizze@assicuracasa.it",
        contattoReferente: "Roberto Marino",
        commissioneMedia: 12,
      },
      {
        nome: "Idraulica Capitale",
        categoria: "IDRAULICO",
        zonaCopertura: "Roma e provincia",
        telefono: "+39 06 6789012",
        email: "info@idraulicacapitale.it",
        contattoReferente: "Francesco Esposito",
        commissioneMedia: 25,
      },
      {
        nome: "Handyman Roma",
        categoria: "MANUTENZIONE_GENERICA",
        zonaCopertura: "Roma città",
        telefono: "+39 06 7890123",
        email: "info@handymanroma.it",
        contattoReferente: "Davide Ricci",
        commissioneMedia: 18,
      },
    ],
  });

  console.log("Seed completato con successo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
