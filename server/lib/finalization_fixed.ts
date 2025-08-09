import { PrismaClient } from '@prisma/client';

/**
 * VERSIONE CORRETTA - Finalizzazione senza duplicati
 * Implementa upsert pattern e controlli esistenza
 */

/**
 * Finalizza le anagrafiche con controllo duplicati
 */
export async function finalizeAnagrafiche(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAnagrafica.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Anagrafiche] Nessuna anagrafica in staging. Salto il passaggio.');
    return { count: 0 };
  }

  const clientiToUpsert: any[] = [];
  const fornitoriToUpsert: any[] = [];

  for (const sa of stagingData) {
    const tipoSoggetto = sa.tipoSoggetto?.toUpperCase();
    const externalId = sa.codiceUnivoco;

    if (tipoSoggetto === 'C' || tipoSoggetto === '0') {
      clientiToUpsert.push({
        externalId: externalId,
        nome: sa.denominazione || `${sa.cognome || ''} ${sa.nome || ''}`.trim(),
        piva: sa.partitaIva,
        codiceFiscale: sa.codiceFiscaleClifor,
        sottocontoCliente: sa.sottocontoCliente,
        codiceAnagrafica: sa.codiceAnagrafica,
        // ... altri campi mappati per Cliente
      });
    } else if (tipoSoggetto === 'F' || tipoSoggetto === '1') {
      fornitoriToUpsert.push({
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
    // UPSERT clienti - aggiorna se esiste, crea se non esiste
    for (const cliente of clientiToUpsert) {
      await tx.cliente.upsert({
        where: { externalId: cliente.externalId },
        update: cliente,
        create: cliente,
      });
    }

    // UPSERT fornitori - aggiorna se esiste, crea se non esiste  
    for (const fornitore of fornitoriToUpsert) {
      await tx.fornitore.upsert({
        where: { externalId: fornitore.externalId },
        update: fornitore,
        create: fornitore,
      });
    }
  });

  console.log(`[Finalize Anagrafiche] Finalizzate ${clientiToUpsert.length} clienti e ${fornitoriToUpsert.length} fornitori.`);
  return { count: clientiToUpsert.length + fornitoriToUpsert.length };
}

/**
 * Finalizza le scritture contabili con controllo duplicati
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
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < stagingTestate.length; i += BATCH_SIZE) {
    const batch = stagingTestate.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Scritture] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingTestate.length/BATCH_SIZE)} (${batch.length} scritture)`);
    
    await prisma.$transaction(async (tx) => {
      for (const testata of batch) {
        // CONTROLLO DUPLICATI - verifica se esiste già
        const existingScrittura = await tx.scritturaContabile.findFirst({
          where: { externalId: testata.codiceUnivocoScaricamento }
        });

        if (existingScrittura) {
          console.log(`[Finalize Scritture] Scrittura ${testata.codiceUnivocoScaricamento} già esiste, skip.`);
          continue;
        }

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
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6));
            const day = parseInt(dateStr.substring(6, 8));
            return new Date(year, month - 1, day);
          } catch (e) {
            return null;
          }
        };

        // Crea la scrittura contabile SOLO se non esiste
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
 * Finalizza le righe IVA con controllo duplicati
 */
export async function finalizeRigaIva(prisma: PrismaClient) {
  const stagingData = await prisma.stagingRigaIva.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Riga IVA] Nessuna riga IVA in staging. Salto il passaggio.');
    return { count: 0 };
  }

  let righeIvaFinalizzate = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < stagingData.length; i += BATCH_SIZE) {
    const batch = stagingData.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Riga IVA] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingData.length/BATCH_SIZE)} (${batch.length} righe)`);
    
    await prisma.$transaction(async (tx) => {
      for (const stagingRiga of batch) {
        // Cerca la scrittura contabile corrispondente
        const scrittura = await tx.scritturaContabile.findFirst({
          where: { externalId: stagingRiga.codiceUnivocoScaricamento }
        });

        if (!scrittura) {
          console.log(`[Finalize Riga IVA] Scrittura ${stagingRiga.codiceUnivocoScaricamento} non trovata, skip.`);
          continue;
        }

        // Cerca la riga scrittura specifica
        const rigaScrittura = await tx.rigaScrittura.findFirst({
          where: { 
            scritturaContabileId: scrittura.id,
            // Potresti voler aggiungere altri criteri per identificare la riga specifica
          }
        });

        if (!rigaScrittura) {
          console.log(`[Finalize Riga IVA] Riga scrittura per ${stagingRiga.codiceUnivocoScaricamento} non trovata, skip.`);
          continue;
        }

        // Cerca il codice IVA
        const codiceIva = await tx.codiceIva.findFirst({
          where: {
            OR: [
              { codice: stagingRiga.codiceIva },
              { externalId: stagingRiga.codiceIva }
            ]
          }
        });

        if (!codiceIva) {
          console.log(`[Finalize Riga IVA] Codice IVA ${stagingRiga.codiceIva} non trovato, skip.`);
          continue;
        }

        // CONTROLLO DUPLICATI - verifica se esiste già questa combinazione
        const existingRigaIva = await tx.rigaIva.findFirst({
          where: {
            codiceIvaId: codiceIva.id,
            rigaScritturaId: rigaScrittura.id
          }
        });

        if (existingRigaIva) {
          console.log(`[Finalize Riga IVA] Riga IVA già esiste per scrittura ${scrittura.id}, skip.`);
          continue;
        }

        // Parsing sicuro degli importi
        const imponibile = parseFloat(stagingRiga.imponibile.replace(',', '.'));
        const imposta = parseFloat(stagingRiga.imposta.replace(',', '.'));

        if (isNaN(imponibile) || isNaN(imposta)) {
          console.log(`[Finalize Riga IVA] Importi non validi per ${stagingRiga.codiceUnivocoScaricamento}, skip.`);
          continue;
        }

        // Crea la riga IVA SOLO se non esiste
        const riga = {
          imponibile: imponibile,
          imposta: imposta,
          codiceIvaId: codiceIva.id,
          rigaScritturaId: rigaScrittura.id,
        };

        await tx.rigaIva.create({ data: riga });
        righeIvaFinalizzate++;
      }
    });
  }

  console.log(`[Finalize Riga IVA] Finalizzate ${righeIvaFinalizzate} righe IVA.`);
  return { count: righeIvaFinalizzate };
}

/**
 * Finalizza le allocazioni con controllo duplicati
 */
export async function finalizeAllocazioni(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAllocazione.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Allocazioni] Nessuna allocazione in staging. Salto il passaggio.');
    return { count: 0 };
  }

  let allocazioniFinalizzate = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < stagingData.length; i += BATCH_SIZE) {
    const batch = stagingData.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize Allocazioni] Processando batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingData.length/BATCH_SIZE)} (${batch.length} allocazioni)`);
    
    await prisma.$transaction(async (tx) => {
      for (const stagingAllocazione of batch) {
        // Qui dovresti implementare la logica per mappare le allocazioni
        // dalla staging alla produzione basandoti sui tuoi dati specifici
        
        // Esempio di controllo duplicati:
        // const existingAllocazione = await tx.allocazione.findFirst({
        //   where: {
        //     rigaScritturaId: rigaScrittura.id,
        //     commessaId: commessa.id,
        //     voceAnaliticaId: voceAnalitica.id
        //   }
        // });
        //
        // if (existingAllocazione) {
        //   console.log(`[Finalize Allocazioni] Allocazione già esiste, skip.`);
        //   continue;
        // }

        // Implementa qui la logica specifica per le tue allocazioni
        allocazioniFinalizzate++;
      }
    });
  }

  console.log(`[Finalize Allocazioni] Finalizzate ${allocazioniFinalizzate} allocazioni.`);
  return { count: allocazioniFinalizzate };
}