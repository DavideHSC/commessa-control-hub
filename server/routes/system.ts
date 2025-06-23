import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

router.get('/status', async (c, res) => {
  try {
    const [
      contiCount,
      clientiCount,
      fornitoriCount,
      causaliCount,
      codiciIvaCount,
      condizioniPagamentoCount,
      commesseCount,
      scrittureCount,
      vociAnaliticheCount,
    ] = await prisma.$transaction([
      prisma.conto.count(),
      prisma.cliente.count(),
      prisma.fornitore.count(),
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.condizionePagamento.count(),
      prisma.commessa.count(),
      prisma.scritturaContabile.count(),
      prisma.voceAnalitica.count(),
    ]);

    // Recupera i wizard steps usando query raw (client Prisma non ancora aggiornato)
    const wizardSteps = await prisma.$queryRaw<Array<{
      stepId: string;
      stepTitle: string;
      templateName: string;
      status: string;
      fileName?: string;
      recordCount?: number;
      completedAt?: Date;
      error?: string;
    }>>`SELECT * FROM "WizardStep"`;

    // Crea una mappa degli step del wizard per accesso rapido
    const wizardStepsMap = wizardSteps.reduce((acc, step) => {
      acc[step.stepId] = step;
      return acc;
    }, {} as Record<string, any>);

    const anagrafichePerCommessaPopolate =
      clientiCount > 0 && vociAnaliticheCount > 0;

    // La condizione di inizializzazione ora considera i dati per la commessa
    const needsInitialization = !anagrafichePerCommessaPopolate;

    return res.json({
      needsInitialization,
      status: needsInitialization ? 'incomplete' : 'ready',
      checks: {
        conti: { 
          count: contiCount, 
          status: contiCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['conti'] || null
        },
        clienti: { 
          count: clientiCount, 
          status: clientiCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['clienti'] || null
        },
        vociAnalitiche: {
          count: vociAnaliticheCount,
          status: vociAnaliticheCount > 0 ? 'ok' : 'missing',
        },
        fornitori: { count: fornitoriCount, status: fornitoriCount > 0 ? 'ok' : 'missing' },
        causali: { 
          count: causaliCount, 
          status: causaliCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['causali'] || null
        },
        codiciIva: { count: codiciIvaCount, status: 'ok' },
        condizioniPagamento: { count: condizioniPagamentoCount, status: 'ok' },
        commesse: { count: commesseCount, status: 'ok' },
        scritture: { count: scrittureCount, status: 'ok' },
      },
      wizardSteps: wizardStepsMap,
    });
  } catch (error) {
    console.error("Failed to get system status:", error);
    return res.status(500).json({ error: 'Failed to retrieve system status' });
  }
});

// Nuovo endpoint per recuperare i dettagli degli import logs
router.get('/import-logs/:templateName?', async (req, res) => {
  try {
    // Per ora restituiamo dati mock finché non risolviamo il client Prisma
    const mockData = {
      logs: [],
      stats: {
        'piano_dei_conti': { total: 1, success: 1, failed: 0, totalRows: 150 },
        'anagrafica_clifor': { total: 1, success: 1, failed: 0, totalRows: 320 },
        'causali': { total: 0, success: 0, failed: 0, totalRows: 0 }
      }
    };
    
    return res.json(mockData);
  } catch (error) {
    console.error("Failed to get import logs:", error);
    return res.status(500).json({ error: 'Failed to retrieve import logs' });
  }
});

router.post('/reset-database', async (req, res, next) => {
    try {
        console.log("Inizio azzeramento database (versione sicura)...");

        // L'ordine è importante per via dei vincoli di chiave esterna.
        // Si parte dalle tabelle che "dipendono" da altre.
        // I TEMPLATE DI IMPORTAZIONE VENGONO ESCLUSI DALLA CANCELLAZIONE.
        await prisma.$transaction([
            // Modelli che dipendono da altri
            prisma.allocazione.deleteMany({}),
            prisma.rigaIva.deleteMany({}),
            prisma.rigaScrittura.deleteMany({}),
            prisma.budgetVoce.deleteMany({}),
            prisma.scritturaContabile.deleteMany({}),
            prisma.commessa.deleteMany({}),
            
            // Modelli "radice" o quasi
            prisma.causaleContabile.deleteMany({}),
            prisma.condizionePagamento.deleteMany({}),
            prisma.codiceIva.deleteMany({}),
            prisma.voceAnalitica.deleteMany({}),
            prisma.conto.deleteMany({}),
            prisma.fornitore.deleteMany({}),
            prisma.cliente.deleteMany({}),
        ]);

        console.log("Database azzerato con successo (dati transazionali). I template sono stati preservati.");
        res.status(200).json({ message: "Database azzerato con successo (dati transazionali). I template sono stati preservati." });

    } catch (error) {
        console.error('Errore durante l\'azzeramento del database:', error);
        next(error);
    }
});

// Rotta per consolidare le scritture importate
router.post('/consolidate-scritture', async (req, res) => {
  console.log('[Consolidate] Avvio del processo di consolidamento...');

  // 1. Lettura di tutti i dati dalle tabelle di staging
  const scrittureDaImportare = await prisma.importScritturaTestata.findMany({
    include: {
      righeContabili: true,
      righeIva: true,
    },
  });

  if (scrittureDaImportare.length === 0) {
    console.log('[Consolidate] Nessuna scrittura da importare.');
    return res.json({ message: 'Nessuna nuova scrittura da consolidare.' });
  }

  console.log(`[Consolidate] Trovate ${scrittureDaImportare.length} scritture da consolidare.`);
  let importateConSuccesso = 0;
  const errori = [];

  // 2. Esecuzione del consolidamento in una transazione per ogni scrittura
  for (const scritturaStaging of scrittureDaImportare) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- 3. Creazione della Scrittura Contabile (Testata) ---
        const scritturaFinale = await tx.scritturaContabile.create({
          data: {
            externalId: scritturaStaging.codiceUnivocoScaricamento,
            data: scritturaStaging.dataRegistrazione,
            dataDocumento: scritturaStaging.dataDocumento,
            numeroDocumento: scritturaStaging.numeroDocumento,
            descrizione: scritturaStaging.descrizioneCausale || scritturaStaging.noteMovimento || 'Scrittura importata',
            // TODO: Mappare correttamente causaleId e fornitoreId se necessario
          },
        });

        // --- 4. Iterazione e creazione delle Righe Scrittura e Allocazioni ---
        for (const rigaStaging of scritturaStaging.righeContabili) {
          if (!rigaStaging.conto) continue;

          // Trova il conto corrispondente nel piano dei conti
          const conto = await tx.conto.findUnique({
            where: { codice: rigaStaging.conto },
          });

          if (!conto) {
            throw new Error(`Conto con codice ${rigaStaging.conto} non trovato.`);
          }

          // Creazione della riga di scrittura finale
          const rigaFinale = await tx.rigaScrittura.create({
            data: {
              scritturaContabileId: scritturaFinale.id,
              contoId: conto.id,
              descrizione: rigaStaging.note || 'Riga importata',
              dare: rigaStaging.importoDare || 0,
              avere: rigaStaging.importoAvere || 0,
            },
          });

          // --- 5. Creazione Allocazione Analitica (se dati presenti) ---
          if (rigaStaging.insDatiMovimentiAnalitici && rigaStaging.centroDiCosto && conto.voceAnaliticaId) {
            const commessa = await tx.commessa.findFirst({
              where: { externalId: rigaStaging.centroDiCosto },
            });
            
            if (!commessa) {
               console.warn(`Commessa con externalId ${rigaStaging.centroDiCosto} non trovata. Allocazione saltata.`);
            } else {
              await tx.allocazione.create({
                data: {
                  rigaScritturaId: rigaFinale.id,
                  commessaId: commessa.id,
                  voceAnaliticaId: conto.voceAnaliticaId,
                  importo: rigaStaging.importoAnalitico || rigaStaging.importoDare || rigaStaging.importoAvere || 0,
                  descrizione: `Allocazione importata per riga ${rigaStaging.progressivoNumeroRigo}`,
                },
              });
            }
          }
        }
        
        // TODO: Aggiungere logica per le righe IVA se necessario

      });

      // Se la transazione ha successo, si può cancellare il record di staging
      await prisma.importScritturaTestata.delete({
        where: { id: scritturaStaging.id },
      });

      importateConSuccesso++;
    } catch (error) {
      console.error(`[Consolidate] Fallito il consolidamento per la scrittura ID ${scritturaStaging.codiceUnivocoScaricamento}:`, error);
      errori.push({ id: scritturaStaging.codiceUnivocoScaricamento, errore: (error as Error).message });
    }
  }

  const message = `Consolidamento terminato. ${importateConSuccesso} scritture importate con successo, ${errori.length} fallite.`;
  console.log(`[Consolidate] ${message}`);

  if (errori.length > 0) {
    return res.status(500).json({ message, errori });
  }

  return res.json({ message });
});

export default router; 