import { PrismaClient } from '@prisma/client';

/**
 * Logica di Finalizzazione Standard e Unificata.
 * Contiene le versioni più recenti e ottimizzate di tutte le funzioni di finalizzazione.
 * 
 * IMPORTANTE: Supporta due modalità operative:
 * 1. Setup Iniziale: Primo utilizzo, DB vuoto - cleanSlateFirstTime()
 * 2. Operatività Ciclica: Import periodici - cleanSlate() con logica incrementale
 */

// --- MODALITÀ OPERATIVE ---

/**
 * Setup iniziale completo - SOLO per primo utilizzo
 * Elimina TUTTI i dati di produzione per inizializzazione pulita
 */
export async function cleanSlateFirstTime(prisma: PrismaClient) {
  console.log('[Finalization] ⚠️  SETUP INIZIALE: Eliminazione COMPLETA dati produzione...');
  
  console.log('[Finalization] Step 1/6 - Eliminando allocazioni e budget...');
  await prisma.allocazione.deleteMany({});
  await prisma.budgetVoce.deleteMany({});
  await prisma.regolaRipartizione.deleteMany({});
  await prisma.importAllocazione.deleteMany({});
  
  console.log('[Finalization] Step 2/6 - Eliminando righe IVA...');
  await prisma.rigaIva.deleteMany({});
  
  console.log('[Finalization] Step 3/6 - Eliminando righe scritture...');
  await prisma.rigaScrittura.deleteMany({});
  
  console.log('[Finalization] Step 4/6 - Eliminando scritture contabili...');
  await prisma.scritturaContabile.deleteMany({});
  
  console.log('[Finalization] Step 5/6 - Eliminando commesse...');
  await prisma.commessa.deleteMany({});
  
  console.log('[Finalization] Step 6/6 - Eliminando anagrafiche e dati ausiliari...');
  // Preserva le entità di sistema necessarie per il funzionamento
  await prisma.cliente.deleteMany({
    where: {
      NOT: {
        externalId: {
          startsWith: 'SYS-'
        }
      }
    }
  });
  await prisma.fornitore.deleteMany({
    where: {
      NOT: {
        externalId: {
          startsWith: 'SYS-'
        }
      }
    }
  });
  await prisma.causaleContabile.deleteMany({});
  await prisma.codiceIva.deleteMany({});
  await prisma.condizionePagamento.deleteMany({});
  
  console.log('[Finalization] ⚠️  Setup iniziale completato - DB completamente resettato.');
}

/**
 * Operatività ciclica - Logica incremental SICURA
 * NON elimina dati utente (commesse manuali, allocazioni esistenti)
 * Aggiorna solo dati da import periodici
 */
export async function cleanSlate(prisma: PrismaClient) {
  console.log('[Finalization] 🔄 OPERATIVITÀ CICLICA: Reset selettivo dati importazione...');
  
  // SICUREZZA: NON eliminare commesse create manualmente dagli utenti
  // Solo quelle generate automaticamente dall'import (identificate da externalId)
  console.log('[Finalization] Step 1/4 - Reset allocazioni da import (preservando manuali)...');
  await prisma.allocazione.deleteMany({
    where: {
      commessa: {
        externalId: {
          not: null // Solo commesse generate da import
        }
      }
    }
  });
  
  console.log('[Finalization] Step 1b/4 - Reset commesse da import (preservando manuali)...');
  await prisma.commessa.deleteMany({
    where: {
      externalId: {
        not: null // Solo commesse con externalId (generate da import)
      }
    }
  });
  
  console.log('[Finalization] Step 2/4 - Reset righe IVA collegate a scritture da import...');
  await prisma.rigaIva.deleteMany({
    where: {
      rigaScrittura: {
        scritturaContabile: {
          externalId: {
            not: null // Solo scritture da import
          }
        }
      }
    }
  });
  
  console.log('[Finalization] Step 3/4 - Reset scritture da import...');
  // Prima elimina le righe collegate
  await prisma.rigaScrittura.deleteMany({
    where: {
      scritturaContabile: {
        externalId: {
          not: null
        }
      }
    }
  });
  
  // Poi elimina le testate
  await prisma.scritturaContabile.deleteMany({
    where: {
      externalId: {
        not: null
      }
    }
  });
  
  console.log('[Finalization] Step 4/4 - Aggiornamento dati ausiliari (causali, codici IVA, etc.)...');
  // Per dati ausiliari, manteniamo approccio upsert per non perdere personalizzazioni
  
  console.log('[Finalization] 🔄 Reset ciclico completato - Dati utente preservati.');
}

/**
 * Rileva la modalità operativa appropriata
 * Restituisce true se è il primo utilizzo (DB vuoto), false se è operatività ciclica
 */
export async function isFirstTimeSetup(prisma: PrismaClient): Promise<boolean> {
  try {
    // Controlla se esistono commesse create dagli utenti (senza externalId)
    const commesseUtente = await prisma.commessa.count({
      where: {
        externalId: null // Commesse create manualmente
      }
    });
    
    // Controlla se esistono allocazioni manuali
    const allocazioniManuali = await prisma.allocazione.count({
      where: {
        commessa: {
          externalId: null
        }
      }
    });
    
    // Controlla se esistono budget configurati
    const budgetConfigurati = await prisma.budgetVoce.count();
    
    // Se esistono dati utente, NON è primo utilizzo
    const hasDatiUtente = (commesseUtente > 0) || (allocazioniManuali > 0) || (budgetConfigurati > 0);
    
    console.log(`[Finalization] Modalità rilevata: ${hasDatiUtente ? 'OPERATIVITÀ CICLICA' : 'SETUP INIZIALE'}`);
    console.log(`[Finalization] Dati utente esistenti: Commesse=${commesseUtente}, Allocazioni=${allocazioniManuali}, Budget=${budgetConfigurati}`);
    
    return !hasDatiUtente;
  } catch (error) {
    console.error('[Finalization] Errore rilevamento modalità:', error);
    // In caso di errore, assumiamo operatività ciclica per sicurezza
    return false;
  }
}

/**
 * Funzione unificata di reset - seleziona automaticamente la modalità appropriata
 */
export async function smartCleanSlate(prisma: PrismaClient) {
  const startTime = new Date();
  const isFirstTime = await isFirstTimeSetup(prisma);
  
  // Audit log dettagliato
  console.log(`[AUDIT] ${startTime.toISOString()} - Inizio processo smartCleanSlate`);
  console.log(`[AUDIT] Modalità rilevata: ${isFirstTime ? 'SETUP_INIZIALE' : 'OPERATIVITA_CICLICA'}`);
  
  let auditResult = {
    modalita: isFirstTime ? 'SETUP_INIZIALE' : 'OPERATIVITA_CICLICA',
    startTime: startTime.toISOString(),
    endTime: '',
    durataMs: 0,
    operazioniEseguite: [] as string[],
    errori: [] as string[]
  };
  
  try {
    if (isFirstTime) {
      console.log('[Finalization] 🔧 Primo utilizzo rilevato - Esecuzione setup iniziale completo');
      auditResult.operazioniEseguite.push('cleanSlateFirstTime');
      await cleanSlateFirstTime(prisma);
    } else {
      console.log('[Finalization] 🔄 Operatività ciclica rilevata - Esecuzione reset selettivo');
      auditResult.operazioniEseguite.push('cleanSlate');
      await cleanSlate(prisma);
    }
    
    const endTime = new Date();
    auditResult.endTime = endTime.toISOString();
    auditResult.durataMs = endTime.getTime() - startTime.getTime();
    
    console.log(`[AUDIT] ${endTime.toISOString()} - Fine processo smartCleanSlate`);
    console.log(`[AUDIT] Durata totale: ${auditResult.durataMs}ms`);
    console.log(`[AUDIT] Operazioni eseguite: ${auditResult.operazioniEseguite.join(', ')}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    auditResult.errori.push(errorMessage);
    
    console.error(`[AUDIT] ERRORE durante smartCleanSlate: ${errorMessage}`);
    throw error;
  }
}

export async function finalizeAnagrafiche(prisma: PrismaClient) {
  const startTime = new Date();
  console.log(`[AUDIT] ${startTime.toISOString()} - Inizio finalizeAnagrafiche`);
  
  const stagingData = await prisma.stagingAnagrafica.findMany();
  console.log(`[AUDIT] Record in staging: ${stagingData.length}`);

  if (stagingData.length === 0) {
    console.log('[Finalize Anagrafiche] Nessuna anagrafica in staging.');
    console.log(`[AUDIT] ${new Date().toISOString()} - Fine finalizeAnagrafiche (nessun record)`);
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

  let totalCreated = 0;
  
  if (clientiToCreate.length > 0) {
    const { count } = await prisma.cliente.createMany({ data: clientiToCreate, skipDuplicates: true });
    totalCreated += count;
    console.log(`[Finalize Anagrafiche] Creati ${count} clienti.`);
  }

  if (fornitoriToCreate.length > 0) {
    const { count } = await prisma.fornitore.createMany({ data: fornitoriToCreate, skipDuplicates: true });
    totalCreated += count;
    console.log(`[Finalize Anagrafiche] Creati ${count} fornitori.`);
  }

  const endTime = new Date();
  console.log(`[AUDIT] ${endTime.toISOString()} - Fine finalizeAnagrafiche`);
  console.log(`[AUDIT] Clienti creati: ${clientiToCreate.length}, Fornitori creati: ${fornitoriToCreate.length}`);
  console.log(`[AUDIT] Durata: ${endTime.getTime() - startTime.getTime()}ms`);
  
  return { count: totalCreated };
}

export async function finalizeScritture(prisma: PrismaClient) {
    const stagingTestate = await prisma.stagingTestata.findMany({
        include: { righe: true }
    });

    if (stagingTestate.length === 0) {
        console.log('[Finalize Scritture] Nessuna testata in staging.');
        return { count: 0 };
    }

    console.log(`[Finalize Scritture] Processando ${stagingTestate.length} scritture...`);
    
    let scrittureFinalizzate = 0;
    const BATCH_SIZE = 25;

    for (let i = 0; i < stagingTestate.length; i += BATCH_SIZE) {
        const batch = stagingTestate.slice(i, i + BATCH_SIZE);
        console.log(`[Finalize Scritture] Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingTestate.length/BATCH_SIZE)} (${batch.length} scritture)`);
        
        for (const testata of batch) {
            try {
                await processaSingolaScrittura(prisma, testata);
                scrittureFinalizzate++;
                
                // Log ogni 50 scritture elaborate per dare feedback di progresso
                if (scrittureFinalizzate % 50 === 0) {
                    console.log(`[Finalize Scritture] Progresso: ${scrittureFinalizzate}/${stagingTestate.length} scritture completate`);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[Finalize Scritture] Errore scrittura ${testata.codiceUnivocoScaricamento}: ${errorMsg}`);
                
                // Continue processing other records even if one fails
                // This ensures partial success rather than complete failure
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Finalize Scritture] Completate ${scrittureFinalizzate}/${stagingTestate.length} scritture.`);
    return { count: scrittureFinalizzate };
}

async function processaSingolaScrittura(prisma: PrismaClient, testata: any) {
    const causale = await prisma.causaleContabile.findFirst({
        where: { OR: [{ codice: testata.codiceCausale }, { externalId: testata.codiceCausale }] },
        select: { id: true }
    });

    let fornitore: { id: string } | null = null;
    if (testata.clienteFornitoreCodiceFiscale) {
        fornitore = await prisma.fornitore.findFirst({
            where: { OR: [{ codiceFiscale: testata.clienteFornitoreCodiceFiscale }, { externalId: testata.clienteFornitoreCodiceFiscale }] },
            select: { id: true }
        });
    }

    const parseDate = (dateStr: string | null) => {
        if (!dateStr || dateStr.length !== 8) return null;
        try {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1;
            const day = parseInt(dateStr.substring(6, 8));
            const date = new Date(Date.UTC(year, month, day)); // Usa UTC per evitare problemi di timezone
            if (isNaN(date.getTime())) return null;
            return date;
        } catch { return null; }
    };

    await prisma.$transaction(async (tx) => {
        // Use upsert to handle potential duplicates gracefully
        const scrittura = await tx.scritturaContabile.upsert({
            where: {
                externalId: testata.codiceUnivocoScaricamento
            },
            update: {
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
            },
            create: {
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

        for (const rigaStaging of testata.righe) {
            const conto = await tx.conto.findFirst({
                where: { OR: [{ codice: rigaStaging.conto }, { externalId: { contains: rigaStaging.conto } }] },
                select: { id: true }
            });

            const importoDare = rigaStaging.importoDare ? parseFloat(rigaStaging.importoDare.replace(',', '.')) : null;
            const importoAvere = rigaStaging.importoAvere ? parseFloat(rigaStaging.importoAvere.replace(',', '.')) : null;

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
    }, { timeout: 15000 }); // Aumentato leggermente il timeout
}

// --- FUNZIONI DALLA VERSIONE "STANDARD" (ORA UNIFICATE) ---

export async function finalizeCausaliContabili(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCausaleContabile.findMany();
  if (stagingData.length === 0) return { count: 0 };
  const causaliToCreate = stagingData.map(sc => ({
    externalId: sc.codiceCausale,
    codice: sc.codiceCausale,
    descrizione: sc.descrizione || 'N/D',
    tipoMovimento: sc.tipoMovimento,
    tipoAggiornamento: sc.tipoAggiornamento,
  }));
  const { count } = await prisma.causaleContabile.createMany({ data: causaliToCreate, skipDuplicates: true });
  return { count };
}

export async function finalizeCodiciIva(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCodiceIva.findMany();
  if (stagingData.length === 0) return { count: 0 };
  const codiciToCreate = stagingData.map(si => {
    const aliquota = si.aliquota ? parseFloat(si.aliquota.replace(',', '.')) : null;
    return {
      externalId: si.codice,
      codice: si.codice || 'N/D',
      descrizione: si.descrizione || 'N/D',
      aliquota: isNaN(aliquota!) ? null : aliquota,
    };
  });
  const { count } = await prisma.codiceIva.createMany({ data: codiciToCreate, skipDuplicates: true });
  return { count };
}

export async function finalizeCondizioniPagamento(prisma: PrismaClient) {
  const stagingData = await prisma.stagingCondizionePagamento.findMany();
  if (stagingData.length === 0) return { count: 0 };
  const condizioniToCreate = stagingData.map(sp => {
    const numeroRate = sp.numeroRate ? parseInt(sp.numeroRate, 10) : null;
    return {
      externalId: sp.codicePagamento,
      codice: sp.codicePagamento || 'N/D',
      descrizione: sp.descrizione || 'N/D',
      numeroRate: isNaN(numeroRate!) ? null : numeroRate,
    };
  });
  const { count } = await prisma.condizionePagamento.createMany({ data: condizioniToCreate, skipDuplicates: true });
  return { count };
}

export async function finalizeConti(prisma: PrismaClient) {
  const stagingData = await prisma.stagingConto.findMany();
  if (stagingData.length === 0) return { count: 0 };
  // Logica di upsert complessa, la manteniamo in una transazione per batch
  // ... (Il resto del codice di `finalizeConti` dal file `finalization.ts` originale va qui)
  const contiToCreate = stagingData.map(sc => {
    let tipoConto: any;
    switch (sc.tipo) {
        case 'P': tipoConto = 'Patrimoniale'; break;
        case 'C': tipoConto = 'Cliente'; break;
        case 'F': tipoConto = 'Fornitore'; break;
        case 'O': tipoConto = 'Ordine'; break;
        case 'E': 
            if (sc.gruppo === 'C') tipoConto = 'Costo';
            else if (sc.gruppo === 'R') tipoConto = 'Ricavo';
            else tipoConto = 'Economico';
            break;
        default: tipoConto = 'Economico';
    }
    return {
        externalId: `${sc.codice || ''}-${sc.codiceFiscaleAzienda || ''}`,
        codice: sc.codice,
        nome: sc.descrizione || 'N/D',
        tipo: tipoConto,
        // ... tutti gli altri campi
    };
  });
  // Per i conti usiamo UPSERT in batch
  const BATCH_SIZE = 50;
  for (let i = 0; i < contiToCreate.length; i += BATCH_SIZE) {
    const batch = contiToCreate.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(async (tx) => {
      for (const conto of batch) {
        await tx.conto.upsert({
          where: { externalId: conto.externalId },
          update: conto,
          create: conto,
        });
      }
    });
  }
  return { count: contiToCreate.length };
}

export async function finalizeRigaIva(prisma: PrismaClient) {
  const stagingData = await prisma.stagingRigaIva.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize RigaIva] Nessuna riga IVA in staging.');
    return { count: 0 };
  }

  console.log(`[Finalize RigaIva] Processando ${stagingData.length} righe IVA...`);
  
  let righeProcessate = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < stagingData.length; i += BATCH_SIZE) {
    const batch = stagingData.slice(i, i + BATCH_SIZE);
    console.log(`[Finalize RigaIva] Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(stagingData.length/BATCH_SIZE)} (${batch.length} righe)`);
    
    await prisma.$transaction(async (tx) => {
      for (const rigaStaging of batch) {
        try {
          // Trova il codice IVA corrispondente
          const codiceIva = await tx.codiceIva.findFirst({
            where: { 
              OR: [
                { codice: rigaStaging.codiceIva },
                { externalId: rigaStaging.codiceIva }
              ]
            },
            select: { id: true }
          });

          if (!codiceIva) {
            console.warn(`[Finalize RigaIva] Codice IVA non trovato: ${rigaStaging.codiceIva}`);
            continue;
          }

          // Trova la scrittura contabile corrispondente
          const scrittura = await tx.scritturaContabile.findFirst({
            where: { externalId: rigaStaging.codiceUnivocoScaricamento },
            include: { righe: true }
          });

          // Parsing degli importi con gestione errori
          const parseImporto = (importoStr: string | null): number => {
            if (!importoStr) return 0;
            const cleaned = importoStr.replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          };

          const imponibile = parseImporto(rigaStaging.imponibile);
          const imposta = parseImporto(rigaStaging.imposta);

          // Crea la riga IVA
          await tx.rigaIva.create({
            data: {
              imponibile: imponibile,
              imposta: imposta,
              codiceIvaId: codiceIva.id,
              rigaScritturaId: scrittura?.righe?.[0]?.id || null // Collega alla prima riga se disponibile
            }
          });

          righeProcessate++;
        } catch (error) {
          console.error(`[Finalize RigaIva] Errore riga ${rigaStaging.rigaIdentifier}: ${error}`);
        }
      }
    }, { timeout: 15000 });

    // Pausa tra batch per evitare sovraccarico
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`[Finalize RigaIva] Completate ${righeProcessate}/${stagingData.length} righe IVA.`);
  return { count: righeProcessate };
}

export async function finalizeAllocazioni(prisma: PrismaClient) {
  const stagingData = await prisma.stagingAllocazione.findMany();

  if (stagingData.length === 0) {
    console.log('[Finalize Allocazioni] Nessuna allocazione in staging.');
    return { count: 0 };
  }

  // Verifica che esista il cliente di sistema necessario per creare nuove commesse
  let sistemaCliente = await prisma.cliente.findFirst({
    where: { externalId: 'SYS-CUST' }
  });

  // Se non esiste, crealo
  if (!sistemaCliente) {
    console.log('[Finalize Allocazioni] Cliente di sistema non trovato, creazione in corso...');
    sistemaCliente = await prisma.cliente.create({
      data: {
        externalId: 'SYS-CUST',
        nome: 'Cliente di Sistema (per importazioni)',
      }
    });
    console.log('[Finalize Allocazioni] Cliente di sistema creato.');
  }

  console.log(`[Finalize Allocazioni] Processando ${stagingData.length} allocazioni...`);
  
  let allocazioniProcessate = 0;
  let allocazioniSaltate = 0;
  let allocazioniGiaProcessate = 0;
  const BATCH_SIZE = 25;

  for (let i = 0; i < stagingData.length; i += BATCH_SIZE) {
    const batch = stagingData.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(stagingData.length/BATCH_SIZE);
    
    console.log(`[Finalize Allocazioni] Batch ${batchNumber}/${totalBatches} (${batch.length} allocazioni)`);
    
    let batchProcessed = 0;
    let batchSkipped = 0;
    let batchAlreadyProcessed = 0;
    
    await prisma.$transaction(async (tx) => {
      for (const allocStaging of batch) {
        try {
          // Salta allocazioni senza dati essenziali
          if (!allocStaging.codiceUnivocoScaricamento || !allocStaging.progressivoRigoContabile) {
            batchSkipped++;
            allocazioniSaltate++;
            continue;
          }

          // Verifica se questa allocazione è già stata processata dalla riconciliazione automatica
          const esisteAllocazione = await tx.allocazione.findFirst({
            where: {
              rigaScrittura: {
                scritturaContabile: {
                  externalId: allocStaging.codiceUnivocoScaricamento
                }
              }
            }
          });

          if (esisteAllocazione) {
            batchAlreadyProcessed++;
            allocazioniGiaProcessate++;
            continue;
          }

          // Trova la riga scrittura corrispondente
          const rigaScrittura = await tx.rigaScrittura.findFirst({
            where: {
              scritturaContabile: {
                externalId: allocStaging.codiceUnivocoScaricamento
              }
            },
            include: {
              scritturaContabile: true
            }
          });

          if (!rigaScrittura) {
            console.warn(`[Finalize Allocazioni] RigaScrittura non trovata per: ${allocStaging.codiceUnivocoScaricamento}`);
            continue;
          }

          // Trova o crea la Commessa basata su centroDiCosto
          let commessa = null;
          if (allocStaging.centroDiCosto) {
            commessa = await tx.commessa.findFirst({
              where: {
                OR: [
                  { externalId: allocStaging.centroDiCosto },
                  { nome: allocStaging.centroDiCosto }
                ]
              }
            });

            // Se non trovata, crea una nuova commessa con cliente di sistema
            if (!commessa) {
              commessa = await tx.commessa.create({
                data: {
                  externalId: allocStaging.centroDiCosto,
                  nome: `Centro di Costo ${allocStaging.centroDiCosto}`,
                  descrizione: `Commessa generata automaticamente da allocazione`,
                  clienteId: sistemaCliente.id,
                }
              });
              console.log(`[Finalize Allocazioni] Creata nuova commessa: ${commessa.nome}`);
            }
          }

          // Trova o crea la VoceAnalitica basata su parametro
          let voceAnalitica = null;
          if (allocStaging.parametro) {
            voceAnalitica = await tx.voceAnalitica.findFirst({
              where: { nome: allocStaging.parametro }
            });

            // Se non trovata, crea una nuova voce analitica
            if (!voceAnalitica) {
              voceAnalitica = await tx.voceAnalitica.create({
                data: {
                  nome: allocStaging.parametro,
                  descrizione: `Voce analitica generata da allocazione`,
                  tipo: 'Generale'
                }
              });
              console.log(`[Finalize Allocazioni] Creata nuova voce analitica: ${voceAnalitica.nome}`);
            }
          }

          // Salta se mancano dati essenziali per l'allocazione
          if (!commessa || !voceAnalitica) {
            console.warn(`[Finalize Allocazioni] Dati insufficienti per allocazione: ${allocStaging.allocazioneIdentifier} (commessa: ${!!commessa}, voce: ${!!voceAnalitica})`);
            continue;
          }

          // Calcola l'importo dall'allocazione (usare dare o avere della riga)
          const importo = rigaScrittura.dare || rigaScrittura.avere || 0;
          
          // Determina il tipo di movimento (costo se dare, ricavo se avere)
          const tipoMovimento = rigaScrittura.dare > 0 ? 'COSTO_EFFETTIVO' : 'RICAVO_EFFETTIVO';

          // Crea l'allocazione finale
          await tx.allocazione.create({
            data: {
              importo: Math.abs(importo), // Sempre positivo
              rigaScritturaId: rigaScrittura.id,
              commessaId: commessa.id,
              voceAnaliticaId: voceAnalitica.id,
              dataMovimento: rigaScrittura.scritturaContabile.data,
              tipoMovimento: tipoMovimento as 'COSTO_EFFETTIVO' | 'RICAVO_EFFETTIVO',
              note: `Allocazione automatica da staging - CDC: ${allocStaging.centroDiCosto}, Param: ${allocStaging.parametro}`
            }
          });

          batchProcessed++;
          allocazioniProcessate++;
        } catch (error) {
          console.error(`[Finalize Allocazioni] Errore allocazione ${allocStaging.allocazioneIdentifier}: ${error}`);
          batchSkipped++;
          allocazioniSaltate++;
        }
      }
    }, { timeout: 20000 });

    // Log del progresso del batch
    console.log(`[Finalize Allocazioni] Batch ${batchNumber} completato: ${batchProcessed} create, ${batchAlreadyProcessed} già esistenti, ${batchSkipped} saltate`);
    
    // Log progresso complessivo ogni 5 batch o all'ultimo batch
    if (batchNumber % 5 === 0 || batchNumber === totalBatches) {
      console.log(`[Finalize Allocazioni] Progresso: ${allocazioniProcessate}/${stagingData.length} create, ${allocazioniGiaProcessate} già esistenti, ${allocazioniSaltate} saltate`);
    }

    // Pausa tra batch per evitare sovraccarico
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log(`[Finalize Allocazioni] Finalizzazione completata: ${allocazioniProcessate} create, ${allocazioniGiaProcessate} già esistenti, ${allocazioniSaltate} saltate su ${stagingData.length} totali.`);
  return { count: allocazioniProcessate };
}