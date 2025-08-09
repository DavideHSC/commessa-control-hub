import { PrismaClient } from '@prisma/client';

/**
 * VERSIONE OTTIMIZZATA - Risolve problemi di timeout e deadlock
 */

export async function optimizedCleanSlate(prisma: PrismaClient) {
  console.log('[Clean Slate Optimized] Eliminando tutti i dati di produzione...');
  
  // Elimina in steps separati per evitare timeout di transazione
  console.log('[Clean Slate] Step 1/6 - Eliminando allocazioni...');
  await prisma.allocazione.deleteMany({});
  await prisma.budgetVoce.deleteMany({});
  await prisma.regolaRipartizione.deleteMany({});
  await prisma.importAllocazione.deleteMany({});
  
  console.log('[Clean Slate] Step 2/6 - Eliminando righe IVA...');
  await prisma.rigaIva.deleteMany({});
  
  console.log('[Clean Slate] Step 3/6 - Eliminando righe scritture...');
  await prisma.rigaScrittura.deleteMany({});
  
  console.log('[Clean Slate] Step 4/6 - Eliminando scritture contabili...');
  await prisma.scritturaContabile.deleteMany({});
  
  console.log('[Clean Slate] Step 5/6 - Eliminando commesse...');
  await prisma.commessa.deleteMany({});
  
  console.log('[Clean Slate] Step 6/6 - Eliminando anagrafiche e ausiliari...');
  await prisma.cliente.deleteMany({});
  await prisma.fornitore.deleteMany({});
  await prisma.causaleContabile.deleteMany({});
  await prisma.codiceIva.deleteMany({});
  await prisma.condizionePagamento.deleteMany({});
  
  console.log('[Clean Slate Optimized] Completato senza timeout.');
}

export async function optimizedFinalizeAnagrafiche(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAnagrafica.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Anagrafiche] Nessuna anagrafica in staging.');
    return { count: 0 };
  }

  const clientiToCreate: any[] = [];
  const fornitoriToCreate: any[] = [];

  for (const sa of stagingData) {
    const tipoSoggetto = sa.tipoSoggetto?.toUpperCase();
    const externalId = sa.codiceUnivoco;

    if (tipoSoggetto === 'C' || tipoSoggetto === '0') {
      clientiToCreate.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoCliente: sa.sottocontoCliente,
        codiceAnagrafica: sa.codiceAnagrafica,
      });
    } else if (tipoSoggetto === 'F' || tipoSoggetto === '1') {
      fornitoriToCreate.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoFornitore: sa.sottocontoFornitore,
        codiceAnagrafica: sa.codiceAnagrafica,
      });
    }
  }

  // Inserimento in batch singoli - no transazione per evitare deadlock
  let totalCreated = 0;
  
  if (clientiToCreate.length > 0) {
    try {
      await prisma.cliente.createMany({ 
        data: clientiToCreate, 
        skipDuplicates: true 
      });
      totalCreated += clientiToCreate.length;
      console.log(`[Finalize Anagrafiche] Creati ${clientiToCreate.length} clienti.`);
    } catch (error) {
      console.error(`[Finalize Anagrafiche] Errore clienti: ${error}`);
    }
  }

  if (fornitoriToCreate.length > 0) {
    try {
      await prisma.fornitore.createMany({ 
        data: fornitoriToCreate, 
        skipDuplicates: true 
      });
      totalCreated += fornitoriToCreate.length;
      console.log(`[Finalize Anagrafiche] Creati ${fornitoriToCreate.length} fornitori.`);
    } catch (error) {
      console.error(`[Finalize Anagrafiche] Errore fornitori: ${error}`);
    }
  }

  return { count: totalCreated };
}

export async function optimizedFinalizeScritture(prisma: PrismaClient) {
  const stagingTestate = await prisma.stagingTestata.findMany({
    include: { righe: true }
  });

  if (stagingTestate.length === 0) {
    console.log('[Finalize Scritture] Nessuna testata in staging.');
    return { count: 0 };
  }

  console.log(`[Finalize Scritture] Processando ${stagingTestate.length} scritture...`);
  
  let scrittureFinalizzate = 0;
  const BATCH_SIZE = 25; // Batch più piccolo per evitare timeout

  for (let i = 0; i < stagingTestate.length; i += BATCH_SIZE) {
    const batch = stagingTestate.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Scritture] Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingTestate.length/BATCH_SIZE)} (${batch.length} scritture)`);
    
    for (const testata of batch) {
      try {
        // Processa ogni scrittura individualmente per evitare deadlock
        await processaSingolaScrittura(prisma, testata);
        scrittureFinalizzate++;
      } catch (error) {
        console.error(`[Finalize Scritture] Errore scrittura ${testata.codiceUnivocoScaricamento}: ${error}`);
      }
    }
    
    // Piccola pausa tra batch per alleviare il database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`[Finalize Scritture] Completate ${scrittureFinalizzate}/${stagingTestate.length} scritture.`);
  return { count: scrittureFinalizzate };
}

async function processaSingolaScrittura(prisma: PrismaClient, testata: any) {
  // Pre-fetch delle dipendenze fuori dalla transazione
  const causale = await prisma.causaleContabile.findFirst({
    where: { 
      OR: [
        { codice: testata.codiceCausale },
        { externalId: testata.codiceCausale }
      ]
    },
    select: { id: true }
  });

  let fornitore: { id: string } | null = null;
  if (testata.clienteFornitoreCodiceFiscale) {
    fornitore = await prisma.fornitore.findFirst({
      where: {
        OR: [
          { codiceFiscale: testata.clienteFornitoreCodiceFiscale },
          { externalId: testata.clienteFornitoreCodiceFiscale }
        ]
      },
      select: { id: true }
    });
  }

  // Parsing delle date
  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      if (dateStr.length === 8) {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  // Transazione breve solo per la creazione
  await prisma.$transaction(async (tx) => {
    const scrittura = await tx.scritturaContabile.create({
      data: {
        externalId: testata.codiceUnivocoScaricamento,
        data: parseDate(testata.dataRegistrazione) || new Date(),
        descrizione: testata.descrizioneCausale || 'N/D',
        dataDocumento: parseDate(testata.dataDocumento),
        numeroDocumento: testata.numeroDocumento,
        causaleId: causale?.id,
        fornitoreId: fornitore?.id, // null se non trovato
        datiAggiuntivi: {
          tipoRegistroIva: testata.tipoRegistroIva,
          totaleDocumento: testata.totaleDocumento,
          noteMovimento: testata.noteMovimento,
          esercizio: testata.esercizio,
          codiceAzienda: testata.codiceAzienda
        }
      }
    });

    // Pre-fetch conti fuori dalla transazione sarebbe meglio, ma per semplicità li cerchiamo qui
    for (const rigaStaging of testata.righe) {
      const conto = await tx.conto.findFirst({
        where: {
          OR: [
            { codice: rigaStaging.conto },
            { externalId: { contains: rigaStaging.conto } }
          ]
        },
        select: { id: true }
      });

      const importoDare = rigaStaging.importoDare ? 
        parseFloat(rigaStaging.importoDare.replace(',', '.')) : null;
      const importoAvere = rigaStaging.importoAvere ? 
        parseFloat(rigaStaging.importoAvere.replace(',', '.')) : null;

      await tx.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: rigaStaging.conto || 'N/D',
          dare: !isNaN(importoDare!) ? importoDare : null,
          avere: !isNaN(importoAvere!) ? importoAvere : null,
          contoId: conto?.id
        }
      });
    }
  }, { timeout: 10000 }); // 10 secondi max per scrittura
}