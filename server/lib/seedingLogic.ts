import { PrismaClient, TipoConto, Prisma } from '@prisma/client';

/**
 * Funzione di reset del database allo stato "pulito".
 * Svuota tutte le tabelle di dati transazionali e anagrafici,
 * preserva i template di importazione e popola solo le Voci Analitiche di base.
 * @param prisma - Istanza del client Prisma.
 */
export async function resetDatabase(prisma: PrismaClient) {
  console.log('--- Inizio Reset Database per Produzione ---');

  // --- 1. PULIZIA DEL DATABASE IN UNA TRANSAZIONE ---
  console.log('Pulizia delle tabelle di staging e produzione...');
  await prisma.$transaction([
    // Dati di Staging
    prisma.importAllocazione.deleteMany({}),
    prisma.importScritturaRigaContabile.deleteMany({}),
    prisma.importScritturaRigaIva.deleteMany({}),
    prisma.importScritturaTestata.deleteMany({}),

    // Dati di Produzione
    prisma.allocazione.deleteMany({}),
    prisma.rigaIva.deleteMany({}),
    prisma.rigaScrittura.deleteMany({}),
    prisma.scritturaContabile.deleteMany({}),
    
    // Anagrafiche collegate
    prisma.commessa.deleteMany({}),
    prisma.fornitore.deleteMany({}),
    prisma.cliente.deleteMany({}),
    
    // Anagrafiche di base
    prisma.causaleContabile.deleteMany({}),
    prisma.codiceIva.deleteMany({}),
    prisma.conto.deleteMany({}),
    prisma.voceAnalitica.deleteMany({}),
    prisma.condizionePagamento.deleteMany({}),
    // NOTA: Non cancelliamo ImportTemplate
  ]);
  console.log('Pulizia completata.');

  // --- 2. POPOLAMENTO DATI MINIMI INDISPENSABILI ---
  console.log('Popolamento delle Voci Analitiche di base...');
  await prisma.voceAnalitica.createMany({
    data: [
        { id: 'costo_personale', nome: 'Costo del personale' },
        { id: 'servizi_esterni', nome: 'Servizi esterni' },
    ],
    skipDuplicates: true
  });
  console.log('Voci Analitiche create.');
  console.log('--- Reset Database per Produzione Completato ---');
}

export async function runSeed(prisma: PrismaClient) {
  console.log('Inizio seeding completo con dati demo...');
  
  // Eseguiamo prima il reset completo
  await resetDatabase(prisma);

  // --- ORA AGGIUNGIAMO I DATI SPECIFICI PER IL DEMO ---
  console.log('Creazione anagrafiche di base per Dati Demo...');

  await prisma.causaleContabile.createMany({
      data: [{ id: 'FRS', descrizione: 'Fattura ricevuta split payment' }],
      skipDuplicates: true
  });

  await prisma.codiceIva.createMany({
      data: [{ id: '22', descrizione: 'IVA 22%', aliquota: 22 }],
      skipDuplicates: true
  });

  await prisma.condizionePagamento.createMany({
    data: [{id: '30GG', descrizione: '30 giorni data fattura'}],
    skipDuplicates: true,
  });

  await prisma.conto.createMany({
    data: [
      { id: '201000048', codice: '201000048', nome: 'FORNITORI DIVERSI', tipo: TipoConto.Fornitore },
      { id: '6015009701', codice: '6015009701', nome: 'CONSULENZE TECNICHE', tipo: TipoConto.Costo },
      { id: '6015000751', codice: '6015000751', nome: 'MANUTENZIONE FABBRICATI', tipo: TipoConto.Costo },
      { id: '1880000300', codice: '1880000300', nome: 'IVA A CREDITO', tipo: TipoConto.Patrimoniale },
    ],
    skipDuplicates: true
  });
  console.log('Anagrafiche di base create.');

  // --- 3. CREAZIONE ANAGRAFICHE COLLEGATE (CLIENTI, FORNITORI, COMMESSE) ---
  console.log('Creazione cliente, fornitore e commesse...');
  const clientePenisolaVerde = await prisma.cliente.create({
    data: {
      id: 'penisola_verde_spa',
      nome: 'PENISOLAVERDE SPA',
      externalId: 'PENISOLAVERDE_SPA',
    },
  });

  const fornitoreGenerico = await prisma.fornitore.create({
      data: {
          id: 'fornitore_generico_01',
          externalId: 'FORN-GEN-01',
          nome: 'FORNITORE GENERICO SPA'
      }
  })

  const commessaPrincipale = await prisma.commessa.create({
    data: {
      id: 'comm_principale_sorrento',
      nome: 'Comune di Sorrento',
      clienteId: clientePenisolaVerde.id
    }
  });

  const commessaServiziGenerali = await prisma.commessa.create({
      data: {
          id: 'comm_serv_gen',
          nome: 'Commessa Servizi Generali',
          clienteId: clientePenisolaVerde.id,
          commessaPadreId: commessaPrincipale.id,
      }
  });

  const commessaManutenzione = await prisma.commessa.create({
    data: {
        id: 'comm_manutenzione',
        nome: 'Commessa Manutenzione',
        clienteId: clientePenisolaVerde.id,
        commessaPadreId: commessaPrincipale.id,
    }
  });
  console.log('Cliente, fornitore e commesse create con struttura gerarchica.');


  // --- 4. POPOLAMENTO TABELLE DI STAGING (SIMULAZIONE IMPORTAZIONE) ---
  console.log('Popolamento tabelle di staging...');
  const testataScrittura = await prisma.importScritturaTestata.create({
    data: {
      codiceUnivocoScaricamento: 'SCR-001',
      codiceCausale: 'FRS',
      dataRegistrazione: new Date('2025-01-04'),
      dataDocumento: new Date('2024-12-31'),
      numeroDocumento: '1338/00',
      codiceFornitore: 'FORN-GEN-01',
    },
  });

  // Righe contabili collegate
  const rigaContabileCosto1 = await prisma.importScritturaRigaContabile.create({
    data: {
        riga: 1,
        codiceConto: '6015009701', // Consulenze
        importoDare: 143.35,
        importoAvere: 0,
        codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
    }
  });

  await prisma.importScritturaRigaContabile.createMany({
      data:[
        {
            riga: 2,
            codiceConto: '6015000751', // Manutenzione
            importoDare: 398.50,
            importoAvere: 0,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
        {
            riga: 3,
            codiceConto: '1880000300', // IVA
            importoDare: 119.21,
            importoAvere: 0,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
        {
            riga: 4,
            codiceConto: '201000048', // Fornitore
            importoDare: 0,
            importoAvere: 661.06,
            codiceUnivocoScaricamento: testataScrittura.codiceUnivocoScaricamento,
        },
      ]
  });

  // Allocazione di esempio
  await prisma.importAllocazione.create({
      data: {
        importScritturaRigaContabileId: rigaContabileCosto1.id,
        commessaId: commessaServiziGenerali.id,
        importo: 143.35,
        suggerimentoAutomatico: true,
      }
  });
  console.log('Tabelle di staging popolate.');

  // --- 5. CONSOLIDAMENTO DATI DA STAGING A PRODUZIONE ---
  console.log('Inizio consolidamento dati da staging a produzione...');

  const importTestate = await prisma.importScritturaTestata.findMany({
    include: {
      righeContabili: {
        include: {
          allocazioni: true,
        },
      },
      fornitore: true,
    },
  });

  for (const testata of importTestate) {
    if (!testata.dataDocumento) {
      console.warn(`Salto testata ${testata.codiceUnivocoScaricamento} per mancanza di data documento.`);
      continue;
    }

    const data: Prisma.ScritturaContabileCreateInput = {
      descrizione: `Fattura n. ${testata.numeroDocumento || 'Senza Numero'} del ${testata.dataDocumento.toLocaleDateString('it-IT')}`,
      data: testata.dataRegistrazione,
      dataDocumento: testata.dataDocumento,
    };

    if (testata.numeroDocumento) {
      data.numeroDocumento = testata.numeroDocumento;
    }
    if (testata.codiceCausale) {
      data.causale = { connect: { id: testata.codiceCausale } };
    }
    if (testata.fornitore) {
      data.fornitore = { connect: { id: testata.fornitore.id } };
    }

    const scrittura = await prisma.scritturaContabile.create({ data });

    for (const riga of testata.righeContabili) {
      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          contoId: riga.codiceConto,
          descrizione: `Riga ${riga.riga} della scrittura ${scrittura.id}`,
          dare: riga.importoDare ?? 0,
          avere: riga.importoAvere ?? 0,
        },
      });

      for (const alloc of riga.allocazioni) {
        await prisma.allocazione.create({
          data: {
            rigaScritturaId: rigaScrittura.id,
            commessaId: alloc.commessaId,
            importo: alloc.importo,
            // Non c'è voce analitica nei dati di seed per ora
          },
        });
      }
    }
  }
  console.log('Consolidamento completato.');

  console.log('Seeding completo eseguito con successo.');
} 