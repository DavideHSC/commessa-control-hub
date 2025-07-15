import { PrismaClient } from '@prisma/client';

/**
 * CLEAN SLATE APPROACH - Elimina tutto e ricrea da staging
 * Appropriato per fase di test con dati non critici
 */

/**
 * Elimina tutti i dati di produzione per un fresh start
 */
export async function cleanSlateReset(prisma: PrismaClient) {
  console.log('[Clean Slate] Eliminando tutti i dati di produzione...');
  
  await prisma.$transaction(async (tx) => {
    // Elimina in ordine CORRETTO per rispettare foreign keys
    await tx.allocazione.deleteMany({});
    await tx.budgetVoce.deleteMany({});
    await tx.regolaRipartizione.deleteMany({});
    await tx.importAllocazione.deleteMany({});
    await tx.commessa.deleteMany({});
    await tx.rigaIva.deleteMany({});
    await tx.rigaScrittura.deleteMany({});
    await tx.scritturaContabile.deleteMany({});
    await tx.cliente.deleteMany({});
    await tx.fornitore.deleteMany({});
    await tx.causaleContabile.deleteMany({});
    await tx.codiceIva.deleteMany({});
    await tx.condizionePagamento.deleteMany({});
    // NON eliminiamo Conto e VoceAnalitica perché sono dati di configurazione
    
    console.log('[Clean Slate] Tutti i dati di produzione eliminati.');
  });
}

/**
 * Finalizza le anagrafiche, smistando i dati da StagingAnagrafica
 * verso i modelli di produzione Cliente e Fornitore.
 */
export async function finalizeAnagrafiche(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAnagrafica.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Anagrafiche] Nessuna anagrafica in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const clientiToCreate: any[] = [];
  const fornitoriToCreate: any[] = [];

  for (const sa of stagingData) {
    // Determina se è un cliente o fornitore
    // Supporta sia 'C'/'F' che '0'/'1' (0=Cliente, 1=Fornitore)
    const tipoSoggetto = sa.tipoSoggetto?.toUpperCase();
    
    // Costruiamo un externalId basato sul codice univoco fornito
    const externalId = sa.codiceUnivoco;

    if (tipoSoggetto === 'C' || tipoSoggetto === '0') {
      clientiToCreate.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoCliente: sa.sottocontoCliente,
        codiceAnagrafica: sa.codiceAnagrafica,
        // ... altri campi mappati per Cliente
      });
    } else if (tipoSoggetto === 'F' || tipoSoggetto === '1') {
      fornitoriToCreate.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoFornitore: sa.sottocontoFornitore,
        codiceAnagrafica: sa.codiceAnagrafica,
        // ... altri campi mappati per Fornitore
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    // Pulisci i clienti esistenti
    const clientiIds = clientiToCreate.map(c => c.externalId).filter(Boolean);
    if (clientiIds.length > 0) {
      await tx.cliente.deleteMany({ where: { externalId: { in: clientiIds } } });
      await tx.cliente.createMany({ data: clientiToCreate, skipDuplicates: true });
    }

    // Pulisci i fornitori esistenti
    const fornitoriIds = fornitoriToCreate.map(f => f.externalId).filter(Boolean);
    if (fornitoriIds.length > 0) {
      await tx.fornitore.deleteMany({ where: { externalId: { in: fornitoriIds } } });
      await tx.fornitore.createMany({ data: fornitoriToCreate, skipDuplicates: true });
    }
  });

  return { count: clientiToCreate.length + fornitoriToCreate.length };
}

/**
 * Finalizza le causali contabili.
 * Legge da StagingCausaleContabile e popola CausaleContabile.
 */
export async function finalizeCausaliContabili(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCausaleContabile.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Causali] Nessuna causale in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const causaliToCreate = stagingData.map(sc => ({
    externalId: sc.codiceCausale,
    codice: sc.codiceCausale,
    descrizione: sc.descrizione || 'N/D', // Fornisce un fallback per il campo obbligatorio
    tipoMovimento: sc.tipoMovimento,
    tipoAggiornamento: sc.tipoAggiornamento,
    // ... altri campi mappati da StagingCausaleContabile a CausaleContabile
  }));

  await prisma.$transaction(async (tx) => {
    // CLEAN SLATE: Crea tutto nuovo
    if (causaliToCreate.length > 0) {
      await tx.causaleContabile.createMany({ data: causaliToCreate, skipDuplicates: true });
    }
  });

  return { count: causaliToCreate.length };
}

/**
 * Finalizza i codici IVA.
 * Legge da StagingCodiceIva e popola CodiceIva.
 */
export async function finalizeCodiciIva(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCodiceIva.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize CodiciIva] Nessun codice IVA in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const codiciToCreate = stagingData.map(si => {
    const aliquota = si.aliquota ? parseFloat(si.aliquota.replace(',', '.')) : null;
    return {
      externalId: si.codice,
      codice: si.codice || 'N/D',
      descrizione: si.descrizione || 'N/D', // Fornisce un fallback
      aliquota: isNaN(aliquota!) ? null : aliquota,
      // ... altri campi mappati
    };
  });

  await prisma.$transaction(async (tx) => {
    // CLEAN SLATE: Crea tutto nuovo
    if (codiciToCreate.length > 0) {
      await tx.codiceIva.createMany({ data: codiciToCreate, skipDuplicates: true });
    }
  });

  return { count: codiciToCreate.length };
}

/**
 * Finalizza le condizioni di pagamento.
 * Legge da StagingCondizionePagamento e popola CondizionePagamento.
 */
export async function finalizeCondizioniPagamento(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCondizionePagamento.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize CondizioniPagamento] Nessuna condizione in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const condizioniToCreate = stagingData.map(sp => {
    const numeroRate = sp.numeroRate ? parseInt(sp.numeroRate, 10) : null;
    return {
      externalId: sp.codicePagamento,
      codice: sp.codicePagamento || 'N/D',
      descrizione: sp.descrizione || 'N/D',
      numeroRate: isNaN(numeroRate!) ? null : numeroRate,
      // ... altri campi
    };
  });

  await prisma.$transaction(async (tx) => {
    // CLEAN SLATE: Crea tutto nuovo
    if (condizioniToCreate.length > 0) {
      await tx.condizionePagamento.createMany({ data: condizioniToCreate, skipDuplicates: true });
    }
  });

  return { count: condizioniToCreate.length };
}

/**
 * Finalizza il piano dei conti.
 * Legge da StagingConto e popola Conto.
 */
export async function finalizeConti(prisma: PrismaClient) {
  const stagingData = await prisma.stagingConto.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Conti] Nessun conto in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const contiToCreate = stagingData.map(sc => {
    let tipoConto: any; // Usiamo 'any' per flessibilità, ma sarebbe meglio l'enum
    switch (sc.tipo) {
        case 'C': tipoConto = 'Costo'; break;
        case 'R': tipoConto = 'Ricavo'; break;
        case 'P': tipoConto = 'Patrimoniale'; break;
        case 'F': tipoConto = 'Fornitore'; break;
        case 'L': tipoConto = 'Cliente'; break;
        case 'E': tipoConto = 'Economico'; break;
        default: tipoConto = 'Economico';
    }

    return {
        externalId: `${sc.codice || ''}-${sc.codiceFiscaleAzienda || ''}`,
        codice: sc.codice,
        nome: sc.descrizione || 'N/D',
        tipo: tipoConto,
        codiceFiscaleAzienda: sc.codiceFiscaleAzienda || '',
        livello: sc.livello,
        sigla: sc.sigla,
        gruppo: sc.gruppo,
        controlloSegno: sc.controlloSegno,
        validoImpresaOrdinaria: sc.validoImpresaOrdinaria === 'S',
        validoImpresaSemplificata: sc.validoImpresaSemplificata === 'S',
        validoProfessionistaOrdinario: sc.validoProfessionistaOrdinario === 'S',
        validoProfessionistaSemplificato: sc.validoProfessionistaSemplificato === 'S',
        validoUnicoPf: sc.validoUnicoPf === 'S',
        validoUnicoSp: sc.validoUnicoSp === 'S',
        validoUnicoSc: sc.validoUnicoSc === 'S',
        validoUnicoEnc: sc.validoUnicoEnc === 'S',
        classeIrap: sc.codiceClasseIrap,
        classeIrapProfessionista: sc.codiceClasseIrapProfessionista,
        classeIva: sc.codiceClasseIva,
        contoCostiRicavi: sc.contoCostiRicaviCollegato,
        contoDareCee: sc.contoDareCee,
        contoAvereCee: sc.contoAvereCee,
        isRilevantePerCommesse: false,
        richiedeVoceAnalitica: false,
    };
  });

  // CLEAN SLATE: Per i conti facciamo UPSERT in batch più piccoli
  const BATCH_SIZE = 50;
  for (let i = 0; i < contiToCreate.length; i += BATCH_SIZE) {
    const batch = contiToCreate.slice(i, i + BATCH_SIZE);
    
    await prisma.$transaction(async (tx) => {
      for (const conto of batch) {
        await tx.conto.upsert({
          where: { externalId: conto.externalId },
          update: conto,
          create: conto
        });
      }
    });
  }

  return { count: contiToCreate.length };
}


/**
 * Finalizza le scritture contabili.
 * Legge da StagingTestata e StagingRigaContabile e popola ScritturaContabile e RigaScrittura.
 */
export async function finalizeScritture(prisma: PrismaClient) {
  const stagingTestate = await prisma.stagingTestata.findMany({
    include: {
      righe: true
    }
  });

  if (stagingTestate.length === 0) {
    console.log('[Finalize Scritture] Nessuna testata in staging. Salto il passaggio.');
    return { count: 0 };
  }

  let scrittureFinalizzate = 0;

  // Processare le scritture in batch più piccoli per evitare timeout
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < stagingTestate.length; i += BATCH_SIZE) {
    const batch = stagingTestate.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Scritture] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingTestate.length/BATCH_SIZE)} (${batch.length} scritture)`);
    
    await prisma.$transaction(async (tx) => {
      for (const testata of batch) {
      // Cerca la causale basandosi sul codice
      const causale = await tx.causaleContabile.findFirst({
        where: { 
          OR: [
            { codice: testata.codiceCausale },
            { externalId: testata.codiceCausale }
          ]
        },
        select: { id: true }
      });

      // Cerca il fornitore se specificato
      let fornitore: { id: string } | null = null;
      if (testata.clienteFornitoreCodiceFiscale) {
        fornitore = await tx.fornitore.findFirst({
          where: {
            OR: [
              { codiceFiscale: testata.clienteFornitoreCodiceFiscale },
              { externalId: testata.clienteFornitoreCodiceFiscale }
            ]
          },
          select: { id: true }
        });
      }

      // Parsing sicuro delle date
      const parseDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        try {
          // Assumo formato YYYYMMDD
          if (dateStr.length === 8) {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
            const day = parseInt(dateStr.substring(6, 8));
            return new Date(year, month, day);
          }
          return new Date(dateStr);
        } catch {
          return null;
        }
      };

      // Crea la scrittura contabile
      const scrittura = await tx.scritturaContabile.create({
        data: {
          externalId: testata.codiceUnivocoScaricamento,
          data: parseDate(testata.dataRegistrazione) || new Date(),
          descrizione: testata.descrizioneCausale || 'N/D',
          dataDocumento: parseDate(testata.dataDocumento),
          numeroDocumento: testata.numeroDocumento,
          causaleId: causale?.id,
          fornitoreId: fornitore?.id,
          datiAggiuntivi: {
            tipoRegistroIva: testata.tipoRegistroIva,
            totaleDocumento: testata.totaleDocumento,
            noteMovimento: testata.noteMovimento,
            esercizio: testata.esercizio,
            codiceAzienda: testata.codiceAzienda
          }
        }
      });

      // Crea le righe contabili
      for (const rigaStaging of testata.righe) {
        // Cerca il conto basandosi sul codice
        const conto = await tx.conto.findFirst({
          where: {
            OR: [
              { codice: rigaStaging.conto },
              { externalId: { contains: rigaStaging.conto } }
            ]
          },
          select: { id: true }
        });

        // Parsing sicuro degli importi
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

        scrittureFinalizzate++;
      }
    });
  }

  console.log(`[Finalize Scritture] Finalizzate ${scrittureFinalizzate} scritture contabili.`);
  return { count: scrittureFinalizzate };
}

/**
 * Finalizza le righe IVA.
 * Legge da StagingRigaIva e popola RigaIva.
 */
export async function finalizeRigaIva(prisma: PrismaClient) {
  const stagingData = await prisma.stagingRigaIva.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize RigaIva] Nessuna riga IVA in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const righeIvaToCreate: any[] = [];
  let rilevateCorrelazioni = 0;

  for (const stagingRiga of stagingData) {
    // Trova la scrittura contabile corrispondente
    const scrittura = await prisma.scritturaContabile.findFirst({
      where: { externalId: stagingRiga.codiceUnivocoScaricamento },
      select: { id: true }
    });

    if (!scrittura) {
      console.warn(`[Finalize RigaIva] Scrittura non trovata per ${stagingRiga.codiceUnivocoScaricamento}`);
      continue;
    }

    // Trova il codice IVA
    const codiceIva = await prisma.codiceIva.findFirst({
      where: { 
        OR: [
          { codice: stagingRiga.codiceIva },
          { externalId: stagingRiga.codiceIva }
        ]
      },
      select: { id: true }
    });

    if (!codiceIva) {
      console.warn(`[Finalize RigaIva] Codice IVA non trovato: ${stagingRiga.codiceIva}`);
      continue;
    }

    // Trova la riga scrittura associata (se esiste)
    const rigaScrittura = await prisma.rigaScrittura.findFirst({
      where: { scritturaContabileId: scrittura.id },
      select: { id: true }
    });

    // Parsing sicuro degli importi
    const imponibile = stagingRiga.imponibile ? 
      parseFloat(stagingRiga.imponibile.replace(',', '.')) : 0;
    const imposta = stagingRiga.imposta ? 
      parseFloat(stagingRiga.imposta.replace(',', '.')) : 0;

    righeIvaToCreate.push({
      imponibile: !isNaN(imponibile) ? imponibile : 0,
      imposta: !isNaN(imposta) ? imposta : 0,
      codiceIvaId: codiceIva.id,
      rigaScritturaId: rigaScrittura?.id || null
    });
    
    rilevateCorrelazioni++;
  }

  // Processare in batch per evitare timeout
  const BATCH_SIZE = 100;
  let righeIvaFinalizzate = 0;

  for (let i = 0; i < righeIvaToCreate.length; i += BATCH_SIZE) {
    const batch = righeIvaToCreate.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize RigaIva] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(righeIvaToCreate.length/BATCH_SIZE)} (${batch.length} righe)`);
    
    await prisma.$transaction(async (tx) => {
      // Crea le nuove righe IVA
      for (const riga of batch) {
        await tx.rigaIva.create({ data: riga });
        righeIvaFinalizzate++;
      }
    });
  }

  console.log(`[Finalize RigaIva] Finalizzate ${righeIvaFinalizzate} righe IVA (${rilevateCorrelazioni} correlazioni rilevate).`);
  return { count: righeIvaFinalizzate };
}

/**
 * Finalizza le allocazioni.
 * Legge da StagingAllocazione e popola Allocazione.
 */
export async function finalizeAllocazioni(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAllocazione.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Allocazioni] Nessuna allocazione in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const allocazioniToCreate: any[] = [];
  let rilevateCorrelazioni = 0;

  for (const stagingAllocazione of stagingData) {
    // Trova la scrittura contabile corrispondente
    const scrittura = await prisma.scritturaContabile.findFirst({
      where: { externalId: stagingAllocazione.codiceUnivocoScaricamento },
      select: { id: true }
    });

    if (!scrittura) {
      console.warn(`[Finalize Allocazioni] Scrittura non trovata per ${stagingAllocazione.codiceUnivocoScaricamento}`);
      continue;
    }

    // Trova la riga scrittura 
    const rigaScrittura = await prisma.rigaScrittura.findFirst({
      where: { scritturaContabileId: scrittura.id },
      select: { id: true }
    });

    if (!rigaScrittura) {
      console.warn(`[Finalize Allocazioni] Riga scrittura non trovata per ${stagingAllocazione.codiceUnivocoScaricamento}`);
      continue;
    }

    // Trova la commessa (se specificata)
    let commessa: { id: string } | null = null;
    if (stagingAllocazione.centroDiCosto) {
      commessa = await prisma.commessa.findFirst({
        where: { 
          OR: [
            { externalId: stagingAllocazione.centroDiCosto },
            { nome: stagingAllocazione.centroDiCosto }
          ]
        },
        select: { id: true }
      });
    }

    // Trova una voce analitica di default (per ora, meglio creare una logica più specifica)
    const voceAnalitica = await prisma.voceAnalitica.findFirst({
      select: { id: true }
    });

    if (!voceAnalitica) {
      console.warn(`[Finalize Allocazioni] Nessuna voce analitica trovata - skip allocazione`);
      continue;
    }

    // Parsing sicuro dell'importo
    const importo = stagingAllocazione.parametro ? 
      parseFloat(stagingAllocazione.parametro.replace(',', '.')) : 0;

    if (commessa) {
      allocazioniToCreate.push({
        importo: !isNaN(importo) ? importo : 0,
        rigaScritturaId: rigaScrittura.id,
        commessaId: commessa.id,
        voceAnaliticaId: voceAnalitica.id,
        dataMovimento: new Date(),
        tipoMovimento: 'COSTO_EFFETTIVO' as const, // Default, potrebbe essere determinato dinamicamente
        note: `Allocazione automatica da staging - Centro: ${stagingAllocazione.centroDiCosto}`
      });
      
      rilevateCorrelazioni++;
    }
  }

  // Processare in batch per evitare timeout
  const BATCH_SIZE = 50;
  let allocazioniFinalizzate = 0;

  for (let i = 0; i < allocazioniToCreate.length; i += BATCH_SIZE) {
    const batch = allocazioniToCreate.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Allocazioni] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(allocazioniToCreate.length/BATCH_SIZE)} (${batch.length} allocazioni)`);
    
    await prisma.$transaction(async (tx) => {
      // Crea le nuove allocazioni
      for (const allocazione of batch) {
        try {
          await tx.allocazione.create({ data: allocazione });
          allocazioniFinalizzate++;
        } catch (error) {
          console.warn(`[Finalize Allocazioni] Errore creazione allocazione: ${error}`);
        }
      }
    });
  }

  console.log(`[Finalize Allocazioni] Finalizzate ${allocazioniFinalizzate} allocazioni (${rilevateCorrelazioni} correlazioni rilevate).`);
  return { count: allocazioniFinalizzate };
}