import { PrismaClient } from '@prisma/client';

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
    // Determina se è un cliente o fornitore. 'C' -> Cliente, 'F' -> Fornitore
    const tipoSoggetto = sa.tipoSoggetto?.toUpperCase();
    
    // Costruiamo un externalId basato sul codice univoco fornito
    const externalId = sa.codiceUnivoco;

    if (tipoSoggetto === 'C') {
      clientiToCreate.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoCliente: sa.sottocontoCliente,
        codiceAnagrafica: sa.codiceAnagrafica,
        // ... altri campi mappati per Cliente
      });
    } else if (tipoSoggetto === 'F') {
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
    const externalIds = causaliToCreate.map(c => c.externalId).filter(Boolean) as string[];
    if (externalIds.length > 0) {
      await tx.causaleContabile.deleteMany({ where: { externalId: { in: externalIds } } });
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
    const externalIds = codiciToCreate.map(c => c.externalId).filter(Boolean) as string[];
    if (externalIds.length > 0) {
      await tx.codiceIva.deleteMany({ where: { externalId: { in: externalIds } } });
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
    const externalIds = condizioniToCreate.map(c => c.externalId).filter(Boolean) as string[];
    if (externalIds.length > 0) {
      await tx.condizionePagamento.deleteMany({ where: { externalId: { in: externalIds } } });
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

  await prisma.$transaction(async (tx) => {
    const externalIds = contiToCreate.map(c => c.externalId).filter(Boolean) as string[];
    if (externalIds.length > 0) {
      await tx.conto.deleteMany({ where: { externalId: { in: externalIds } } });
      await tx.conto.createMany({ data: contiToCreate, skipDuplicates: true });
    }
  });

  return { count: contiToCreate.length };
}


// TODO: Implementare le altre funzioni di finalizzazione con la mappatura corretta. 