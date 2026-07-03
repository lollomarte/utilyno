import { PrismaClient, TipoImmobile, TipoContratto, RegimeFiscale, StatoContratto, StatoPagamento, TipoUtenza, StatoUtenza, StatoTicket } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMonths, subMonths, subDays } from "date-fns";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Pulizia database...");
  await prisma.documento.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.utenza.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.contratto.deleteMany();
  await prisma.immobile.deleteMany();
  await prisma.inquilino.deleteMany();
  await prisma.proprietario.deleteMany();
  await prisma.agenzia.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await hash("Password123!");

  // ---------- Admin ----------
  await prisma.user.create({
    data: {
      email: "admin@werent.it",
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
      email: "agenzia.milano@werent.it",
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
      piva: "IT01234567890",
      indirizzo: "Via Torino 12, 20123 Milano (MI)",
      telefono: "+39 02 55443322",
    },
  });

  const agenziaUser2 = await prisma.user.create({
    data: {
      email: "agenzia.roma@werent.it",
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
      piva: "IT09876543210",
      indirizzo: "Via Nazionale 45, 00184 Roma (RM)",
      telefono: "+39 06 99887766",
    },
  });

  // ---------- Proprietari ----------
  const proprietariData = [
    { nome: "Luca", cognome: "Verdi", email: "luca.verdi@example.com", cf: "VRDLCU80A01F205X" },
    { nome: "Anna", cognome: "Colombo", email: "anna.colombo@example.com", cf: "CLMNNA75B41F205Y" },
    { nome: "Paolo", cognome: "Ricci", email: "paolo.ricci@example.com", cf: "RCCPLA70C15H501Z" },
    { nome: "Sara", cognome: "Marino", email: "sara.marino@example.com", cf: "MRNSRA85D55F839W" },
    { nome: "Davide", cognome: "Gallo", email: "davide.gallo@example.com", cf: "GLLDVD90E20H501K" },
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
    { indirizzo: "Via Dante 8", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 75, valore: 320000, ape: "B", agenzia: agenzia1, proprietario: proprietari[0] },
    { indirizzo: "Corso Buenos Aires 22", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 55, valore: 250000, ape: "C", agenzia: agenzia1, proprietario: proprietari[1] },
    { indirizzo: "Viale Monza 100", comune: "Milano", provincia: "MI", tipo: TipoImmobile.COMMERCIALE, mq: 120, valore: 480000, ape: "D", agenzia: agenzia1, proprietario: proprietari[2] },
    { indirizzo: "Via Padova 34", comune: "Milano", provincia: "MI", tipo: TipoImmobile.RESIDENZIALE, mq: 90, valore: 360000, ape: "A", agenzia: agenzia1, proprietario: proprietari[0] },
    { indirizzo: "Via del Corso 150", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 65, valore: 400000, ape: "C", agenzia: agenzia2, proprietario: proprietari[3] },
    { indirizzo: "Via Appia Nuova 210", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 80, valore: 340000, ape: "B", agenzia: agenzia2, proprietario: proprietari[4] },
    { indirizzo: "Via Prenestina 55", comune: "Roma", provincia: "RM", tipo: TipoImmobile.COMMERCIALE, mq: 200, valore: 610000, ape: "E", agenzia: agenzia2, proprietario: proprietari[3] },
    { indirizzo: "Via Tiburtina 88", comune: "Roma", provincia: "RM", tipo: TipoImmobile.RESIDENZIALE, mq: 48, valore: 195000, ape: "D", agenzia: agenzia2, proprietario: proprietari[4] },
  ];
  const immobili = [];
  for (const [idx, im] of immobiliData.entries()) {
    const immobile = await prisma.immobile.create({
      data: {
        proprietarioId: im.proprietario.id,
        agenziaId: im.agenzia.id,
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

  // ---------- Contratti ----------
  const contrattiConfig = [
    { immobile: immobili[0], inquilino: inquilini[0], agenzia: agenzia1, tipo: TipoContratto.QUATTRO_PIU_QUATTRO, canone: 1100, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 8), registrato: true },
    { immobile: immobili[1], inquilino: inquilini[1], agenzia: agenzia1, tipo: TipoContratto.TRE_PIU_DUE, canone: 850, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 14), registrato: true },
    { immobile: immobili[2], inquilino: inquilini[2], agenzia: agenzia1, tipo: TipoContratto.CONCORDATO, canone: 1900, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 3), registrato: true },
    { immobile: immobili[3], inquilino: inquilini[3], agenzia: agenzia1, tipo: TipoContratto.STUDENTI, canone: 600, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.SCADUTO, inizio: subMonths(new Date(), 20), registrato: true },
    { immobile: immobili[4], inquilino: inquilini[4], agenzia: agenzia2, tipo: TipoContratto.QUATTRO_PIU_QUATTRO, canone: 1350, regime: RegimeFiscale.CEDOLARE_SECCA, stato: StatoContratto.ATTIVO, inizio: subMonths(new Date(), 5), registrato: true },
    { immobile: immobili[5], inquilino: inquilini[5], agenzia: agenzia2, tipo: TipoContratto.TRANSITORIO, canone: 750, regime: RegimeFiscale.ORDINARIO, stato: StatoContratto.BOZZA, inizio: addDays(new Date(), 15), registrato: false },
  ];

  const contratti = [];
  for (const c of contrattiConfig) {
    const dataFine =
      c.tipo === TipoContratto.QUATTRO_PIU_QUATTRO ? addMonths(c.inizio, 48) :
      c.tipo === TipoContratto.TRE_PIU_DUE ? addMonths(c.inizio, 36) :
      c.tipo === TipoContratto.TRANSITORIO ? addMonths(c.inizio, 12) :
      c.tipo === TipoContratto.STUDENTI ? addMonths(c.inizio, 24) :
      addMonths(c.inizio, 36);

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

  // ---------- Ticket ----------
  await prisma.ticket.createMany({
    data: [
      {
        immobileId: immobili[0].id,
        inquilinoId: inquilini[0].id,
        titolo: "Perdita rubinetto cucina",
        descrizione: "Il rubinetto della cucina perde acqua costantemente, servirebbe un idraulico.",
        stato: StatoTicket.APERTO,
        priorita: "ALTA",
      },
      {
        immobileId: immobili[1].id,
        inquilinoId: inquilini[1].id,
        titolo: "Caldaia non si accende",
        descrizione: "La caldaia non parte da ieri sera, niente acqua calda.",
        stato: StatoTicket.IN_LAVORAZIONE,
        priorita: "ALTA",
      },
      {
        immobileId: immobili[2].id,
        inquilinoId: inquilini[2].id,
        titolo: "Citofono guasto",
        descrizione: "Il citofono non suona, bisogna sostituire il pulsante esterno.",
        stato: StatoTicket.APERTO,
        priorita: "MEDIA",
      },
      {
        immobileId: immobili[4].id,
        inquilinoId: inquilini[4].id,
        titolo: "Tapparella bloccata",
        descrizione: "La tapparella della camera da letto si è bloccata a metà.",
        stato: StatoTicket.RISOLTO,
        priorita: "BASSA",
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
