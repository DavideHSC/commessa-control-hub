import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
// highlight-start
// MODIFICA: Rimosso import da /lib/finalization e /lib/finalization_optimized.
// Ora c'è un unico import dalla posizione corretta dentro l'Import Engine.
import {
    smartCleanSlate,
    isFirstTimeSetup,
    finalizeAnagrafiche,
    finalizeCausaliContabili,
    finalizeCodiciIva,
    finalizeCondizioniPagamento,
    finalizeConti,
    finalizeScritture,
    finalizeRigaIva,
    finalizeAllocazioni
} from '../import-engine/finalization.js';
import { 
    auditStart, 
    auditSuccess, 
    auditError, 
    auditInfo,
    generateAuditReport,
    clearAuditLog 
} from '../import-engine/core/utils/auditLogger.js';
// highlight-end

const prisma = new PrismaClient();
const router = express.Router();
const sseEmitter = new EventEmitter();

// ... (tutto il codice delle rotte GET /conti, /anagrafiche, etc. rimane INVARIATO) ...
// GET all staging conti with pagination, search, and sort
router.get('/conti', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'id',
        sortOrder = 'asc'
      } = req.query;
  
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;
  
      const where: Prisma.StagingContoWhereInput = search ? {
        OR: [
          { codice: { contains: search as string, mode: 'insensitive' } },
          { descrizione: { contains: search as string, mode: 'insensitive' } },
          { codiceFiscaleAzienda: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};
  
      const orderBy: Prisma.StagingContoOrderByWithRelationInput = {
          [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
      };
  
      const [conti, totalCount] = await prisma.$transaction([
        prisma.stagingConto.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingConto.count({ where }),
      ]);
  
      res.json({
        data: conti,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero dei conti di staging.' });
    }
  });

  // GET all staging anagrafiche with pagination, search, and sort
  router.get('/anagrafiche', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'denominazione',
        sortOrder = 'asc'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.StagingAnagraficaWhereInput = search ? {
        OR: [
          { denominazione: { contains: search as string, mode: 'insensitive' } },
          { nome: { contains: search as string, mode: 'insensitive' } },
          { cognome: { contains: search as string, mode: 'insensitive' } },
          { codiceFiscaleClifor: { contains: search as string, mode: 'insensitive' } },
          { partitaIva: { contains: search as string, mode: 'insensitive' } },
          { codiceUnivoco: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};

      const orderBy: Prisma.StagingAnagraficaOrderByWithRelationInput = {
          [(sortBy as string) || 'denominazione']: (sortOrder as 'asc' | 'desc') || 'asc'
      };

      const [anagrafiche, totalCount] = await prisma.$transaction([
        prisma.stagingAnagrafica.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingAnagrafica.count({ where }),
      ]);

      res.json({
        data: anagrafiche,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero delle anagrafiche di staging.' });
    }
  });

  // GET all staging causali with pagination, search, and sort
  router.get('/causali', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'descrizione',
        sortOrder = 'asc'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.StagingCausaleContabileWhereInput = search ? {
        OR: [
          { descrizione: { contains: search as string, mode: 'insensitive' } },
          { codiceCausale: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};

      const orderBy: Prisma.StagingCausaleContabileOrderByWithRelationInput = {
          [(sortBy as string) || 'descrizione']: (sortOrder as 'asc' | 'desc') || 'asc'
      };

      const [causali, totalCount] = await prisma.$transaction([
        prisma.stagingCausaleContabile.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingCausaleContabile.count({ where }),
      ]);

      res.json({
        data: causali,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero delle causali di staging.' });
    }
  });

  // GET all staging codici IVA with pagination, search, and sort
  router.get('/codici-iva', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'codice',
        sortOrder = 'asc'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.StagingCodiceIvaWhereInput = search ? {
        OR: [
          { codice: { contains: search as string, mode: 'insensitive' } },
          { descrizione: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};

      const orderBy: Prisma.StagingCodiceIvaOrderByWithRelationInput = {
          [(sortBy as string) || 'codice']: (sortOrder as 'asc' | 'desc') || 'asc'
      };

      const [codiciIva, totalCount] = await prisma.$transaction([
        prisma.stagingCodiceIva.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingCodiceIva.count({ where }),
      ]);

      res.json({
        data: codiciIva,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero dei codici IVA di staging.' });
    }
  });

  // GET all staging condizioni pagamento with pagination, search, and sort
  router.get('/condizioni-pagamento', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'descrizione',
        sortOrder = 'asc'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.StagingCondizionePagamentoWhereInput = search ? {
        OR: [
          { descrizione: { contains: search as string, mode: 'insensitive' } },
          { codicePagamento: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};

      const orderBy: Prisma.StagingCondizionePagamentoOrderByWithRelationInput = {
          [(sortBy as string) || 'descrizione']: (sortOrder as 'asc' | 'desc') || 'asc'
      };

      const [condizioni, totalCount] = await prisma.$transaction([
        prisma.stagingCondizionePagamento.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingCondizionePagamento.count({ where }),
      ]);

      res.json({
        data: condizioni,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero delle condizioni di pagamento di staging.' });
    }
  });

  // GET all staging centri di costo with pagination, search, and sort
  router.get('/centri-costo', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'codice',
        sortOrder = 'asc'
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where = search ? {
        OR: [
          { codice: { contains: search as string, mode: 'insensitive' } },
          { descrizione: { contains: search as string, mode: 'insensitive' } },
          { responsabile: { contains: search as string, mode: 'insensitive' } },
          { codiceFiscaleAzienda: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};

      const orderBy = {
          [(sortBy as string) || 'codice']: (sortOrder as 'asc' | 'desc') || 'asc'
      };

      const [centriCosto, totalCount] = await prisma.$transaction([
        (prisma as any).stagingCentroCosto.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        (prisma as any).stagingCentroCosto.count({ where }),
      ]);

      res.json({
        data: centriCosto,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero dei centri di costo di staging.' });
    }
  });
  
  // GET all staging scritture (testate) with pagination, search, and sort
  router.get('/scritture', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'id',
        sortOrder = 'asc'
      } = req.query;
  
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;
  
      const where: Prisma.StagingTestataWhereInput = search ? {
        OR: [
          { codiceUnivocoScaricamento: { contains: search as string, mode: 'insensitive' } },
          { descrizioneCausale: { contains: search as string, mode: 'insensitive' } },
          { numeroDocumento: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};
  
      const orderBy: Prisma.StagingTestataOrderByWithRelationInput = {
          [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
      };
  
      const [testate, totalCount] = await prisma.$transaction([
        prisma.stagingTestata.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take,
        }),
        prisma.stagingTestata.count({ where }),
      ]);
  
      res.json({
        data: testate,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero delle testate di staging.' });
    }
  });

// GET master-detail view for scritture contabili (testate + righe)
router.get('/scritture-complete', async (req, res) => {
    try {
      const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'codiceUnivocoScaricamento',
        sortOrder = 'asc'
      } = req.query;
  
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;
  
      const where: Prisma.StagingTestataWhereInput = search ? {
        OR: [
          { codiceUnivocoScaricamento: { contains: search as string, mode: 'insensitive' } },
          { descrizioneCausale: { contains: search as string, mode: 'insensitive' } },
          { numeroDocumento: { contains: search as string, mode: 'insensitive' } },
          { clienteFornitoreCodiceFiscale: { contains: search as string, mode: 'insensitive' } },
          { clienteFornitoreSigla: { contains: search as string, mode: 'insensitive' } },
        ],
      } : {};
  
      const orderBy: Prisma.StagingTestataOrderByWithRelationInput = {
          [(sortBy as string) || 'codiceUnivocoScaricamento']: (sortOrder as 'asc' | 'desc') || 'asc'
      };
  
      // 1. Recupera le testate con paginazione
      const [testate, totalCount] = await prisma.$transaction([
        prisma.stagingTestata.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        prisma.stagingTestata.count({ where }),
      ]);

      // 2. Per ogni testata, recupera le righe contabili e IVA associate
      const testateWithDetails = await Promise.all(
        testate.map(async (testata) => {
          const [righeContabili, righeIva, allocazioni] = await prisma.$transaction([
            // Righe contabili
            prisma.stagingRigaContabile.findMany({
              where: { codiceUnivocoScaricamento: testata.codiceUnivocoScaricamento },
              orderBy: { progressivoRigo: 'asc' }
            }),
            // Righe IVA  
            prisma.stagingRigaIva.findMany({
              where: { codiceUnivocoScaricamento: testata.codiceUnivocoScaricamento },
              orderBy: { codiceIva: 'asc' }
            }),
            // Allocazioni analitiche
            prisma.stagingAllocazione.findMany({
              where: { codiceUnivocoScaricamento: testata.codiceUnivocoScaricamento },
              orderBy: { progressivoRigoContabile: 'asc' }
            })
          ]);
          
          return {
            ...testata,
            righeContabili,
            righeIva,
            allocazioni,
            // Statistiche di riepilogo
            stats: {
              numeroRigheContabili: righeContabili.length,
              numeroRigheIva: righeIva.length,
              numeroAllocazioni: allocazioni.length,
              totaleDare: righeContabili.reduce((sum, r) => sum + (parseFloat(r.importoDare || '0') || 0), 0),
              totaleAvere: righeContabili.reduce((sum, r) => sum + (parseFloat(r.importoAvere || '0') || 0), 0),
            }
          };
        })
      );

      res.json({
        data: testateWithDetails,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
        summary: {
          totalTestate: totalCount,
          testateInPagina: testate.length,
          righeContabiliTotali: testateWithDetails.reduce((sum, t) => sum + t.stats.numeroRigheContabili, 0),
          righeIvaTotali: testateWithDetails.reduce((sum, t) => sum + t.stats.numeroRigheIva, 0),
          allocazioniTotali: testateWithDetails.reduce((sum, t) => sum + t.stats.numeroAllocazioni, 0)
        }
      });
    } catch (error) {
      console.error('Errore nel recupero delle scritture complete:', error);
      res.status(500).json({ error: 'Errore nel recupero delle scritture complete di staging.' });
    }
  });

router.get('/stats', async (req, res) => {
    try {
        const [anagrafiche, causali, codiciIva, condizioniPagamento, conti, scritture, centriCosto] = await prisma.$transaction([
            prisma.stagingAnagrafica.count(),
            prisma.stagingCausaleContabile.count(),
            prisma.stagingCodiceIva.count(),
            prisma.stagingCondizionePagamento.count(),
            prisma.stagingConto.count(),
            prisma.stagingTestata.count(),
            (prisma as any).stagingCentroCosto.count(),
        ]);
        res.json({ anagrafiche, causali, codiciIva, condizioniPagamento, conti, scritture, centriCosto });
    } catch (error) {
        console.error("Errore nel recupero delle statistiche di staging:", error);
        res.status(500).json({ error: 'Errore nel recupero delle statistiche di staging.' });
    }
});

// GET allocation statistics for the widget
router.get('/allocation-stats', async (req, res) => {
    try {
        // Count total staging righe contabili (before finalization)
        const totalStagingMovements = await prisma.stagingRigaContabile.count();

        // Count finalized movements (after finalization)
        const finalizedCount = await prisma.rigaScrittura.count();

        // Count allocated movements (finalized movements that have allocations)
        const allocatedCount = await prisma.rigaScrittura.count({
            where: {
                allocazioni: {
                    some: {}
                }
            }
        });

        // Calculate unallocated movements (finalized but not allocated)
        const unallocatedFinalizedCount = finalizedCount - allocatedCount;
        
        // Total unallocated = staging + finalized but not allocated
        const totalUnallocatedCount = totalStagingMovements + unallocatedFinalizedCount;

        // Calculate total unallocated amount from staging
        const stagingRows = await prisma.stagingRigaContabile.findMany({
            select: {
                importoDare: true,
                importoAvere: true
            }
        });

        const totalStagingAmount = stagingRows.reduce((sum, row) => {
            const dare = parseFloat(row.importoDare || '0');
            const avere = parseFloat(row.importoAvere || '0');
            return sum + Math.abs(dare - avere); // Consideriamo il valore assoluto della differenza
        }, 0);

        // Calculate unallocated amount from finalized movements
        const unallocatedFinalizedRows = await prisma.rigaScrittura.findMany({
            where: {
                allocazioni: {
                    none: {}
                }
            },
            select: {
                dare: true,
                avere: true
            }
        });

        const totalUnallocatedFinalizedAmount = unallocatedFinalizedRows.reduce((sum, row) => {
            const dare = row.dare || 0;
            const avere = row.avere || 0;
            return sum + Math.abs(dare - avere);
        }, 0);

        const totalUnallocatedAmount = totalStagingAmount + totalUnallocatedFinalizedAmount;

        // Calculate total movements and allocation percentage
        const totalMovements = totalStagingMovements + finalizedCount;
        const allocationPercentage = totalMovements > 0 ? Math.round(((allocatedCount) / totalMovements) * 100) : 0;

        res.json({
            unallocatedCount: totalUnallocatedCount,
            totalUnallocatedAmount,
            totalMovements,
            finalizedCount,
            allocationPercentage
        });
    } catch (error) {
        console.error("Errore nel recupero delle statistiche di allocazione:", error);
        res.status(500).json({ error: 'Errore nel recupero delle statistiche di allocazione.' });
    }
});

router.get('/events', (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.flushHeaders();

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ step: 'connected', message: 'SSE connection established' })}\n\n`);

    const listener = (data: any) => {
        try {
            res.write(`data: ${data}\n\n`);
        } catch (writeError) {
            console.error('[SSE] Error writing to response:', writeError);
            sseEmitter.off('message', listener);
        }
    };

    sseEmitter.on('message', listener);

    req.on('close', () => {
        console.log('[SSE] Client disconnected');
        sseEmitter.off('message', listener);
    });

    req.on('error', (error) => {
        console.error('[SSE] Request error:', error);
        sseEmitter.off('message', listener);
    });
});


const runFinalizationProcess = async () => {
    const sseSend = (data: any) => sseEmitter.emit('message', JSON.stringify(data));
    
    // Inizio audit log per sessione completa
    clearAuditLog();
    const sessionStart = auditStart('FinalizationProcess', { source: 'UI_Button' });

    try {
        sseSend({ step: 'start', message: 'Avvio del processo di finalizzazione...' });

        // highlight-start  
        // MODIFICA: Utilizzo smartCleanSlate per rilevamento automatico modalità
        sseSend({ step: 'clean_slate', status: 'running', message: 'Rilevamento modalità operativa e reset sicuro...' });
        
        // Rileva modalità operativa per logging dettagliato
        const isFirstTime = await isFirstTimeSetup(prisma);
        const modalita = isFirstTime ? 'SETUP INIZIALE' : 'OPERATIVITÀ CICLICA';
        
        sseSend({ 
            step: 'clean_slate', 
            status: 'running', 
            message: `Modalità ${modalita} rilevata - Esecuzione reset appropriato...`,
            metadata: { modalita, isFirstTime }
        });
        
        await smartCleanSlate(prisma);
        
        sseSend({ 
            step: 'clean_slate', 
            status: 'completed', 
            message: `Reset ${modalita.toLowerCase()} completato con successo.`,
            metadata: { modalita, isFirstTime }
        });

        sseSend({ step: 'anagrafiche', status: 'running', message: 'Finalizzazione anagrafiche...' });
        const anagraficheResult = await finalizeAnagrafiche(prisma);
        sseSend({ step: 'anagrafiche', status: 'completed', message: `Anagrafiche finalizzate.`, count: anagraficheResult.count });

        sseSend({ step: 'causali', status: 'running', message: 'Finalizzazione causali...' });
        const causaliResult = await finalizeCausaliContabili(prisma);
        sseSend({ step: 'causali', status: 'completed', message: `Causali finalizzate.`, count: causaliResult.count });

        sseSend({ step: 'codici_iva', status: 'running', message: 'Finalizzazione codici IVA...' });
        const ivaResult = await finalizeCodiciIva(prisma);
        sseSend({ step: 'codici_iva', status: 'completed', message: `Codici IVA finalizzati.`, count: ivaResult.count });

        sseSend({ step: 'condizioni_pagamento', status: 'running', message: 'Finalizzazione condizioni di pagamento...' });
        const pagamentiResult = await finalizeCondizioniPagamento(prisma);
        sseSend({ step: 'condizioni_pagamento', status: 'completed', message: `Condizioni di pagamento finalizzate.`, count: pagamentiResult.count });

        sseSend({ step: 'conti', status: 'running', message: 'Finalizzazione piano dei conti...' });
        const contiResult = await finalizeConti(prisma);
        sseSend({ step: 'conti', status: 'completed', message: 'Piano dei conti finalizzato.', count: contiResult.count });

        sseSend({ step: 'scritture', status: 'running', message: 'Finalizzazione scritture contabili...' });
        const scrittureResult = await finalizeScritture(prisma);
        sseSend({ step: 'scritture', status: 'completed', message: 'Scritture contabili finalizzate.', count: scrittureResult.count });

        sseSend({ step: 'righe_iva', status: 'running', message: 'Finalizzazione righe IVA...' });
        const righeIvaResult = await finalizeRigaIva(prisma);
        sseSend({ step: 'righe_iva', status: 'completed', message: 'Righe IVA finalizzate.', count: righeIvaResult.count });

        sseSend({ step: 'allocazioni', status: 'running', message: 'Finalizzazione allocazioni...' });
        const allocazioniResult = await finalizeAllocazioni(prisma);
        sseSend({ step: 'allocazioni', status: 'completed', message: 'Allocazioni finalizzate.', count: allocazioniResult.count });
        // highlight-end

        sseSend({ step: 'end', message: 'Processo di finalizzazione completato con successo.' });

        // Completa audit con successo
        auditSuccess('FinalizationProcess', sessionStart, { 
            allStepsCompleted: true,
            auditReport: generateAuditReport().summary 
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Finalize] Errore durante il processo di finalizzazione:', errorMessage);
        
        // Audit errore con report completo
        auditError('FinalizationProcess', sessionStart, error, { 
            partialCompletion: true,
            auditReport: generateAuditReport().summary 
        });
        
        sseEmitter.emit('message', JSON.stringify({ step: 'error', message: `Errore: ${errorMessage}` }));
    }
};

// ... (il resto del file, inclusa la logica del flag isFinalizationRunning, rimane INVARIATO) ...
// Endpoint per resettare solo le tabelle delle scritture
router.post('/reset-scritture', async (req, res) => {
    console.log('[Staging Reset Scritture] Richiesta di reset scritture ricevuta.');
    
    try {
        await prisma.$transaction(async (tx) => {
            // Reset solo delle tabelle scritture, in ordine per FK
            await tx.stagingRigaContabile.deleteMany({});
            await tx.stagingTestata.deleteMany({});
        });
        
        console.log('[Staging Reset Scritture] Tabelle scritture pulite.');
        res.json({ 
            message: 'Tabelle staging scritture resettate con successo.',
            success: true 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Reset Scritture] Errore durante il reset:', errorMessage);
        res.status(500).json({ 
            message: `Errore durante il reset delle scritture staging: ${errorMessage}`,
            success: false 
        });
    }
});

// Track running processes to prevent multiple executions
let isFinalizationRunning = false;

// Export function to reset the flag (for emergency use)
export const resetFinalizationFlag = () => {
    console.log('[Reset] Finalization flag reset manually');
    isFinalizationRunning = false;
};

// Reset the flag on server startup
(() => {
    console.log('[Startup] Resetting finalization flag on server restart');
    isFinalizationRunning = false;
})();

router.post('/finalize', async (req, res) => {
    console.log('[Finalize] Richiesta di finalizzazione ricevuta.');

    // Prevent multiple simultaneous runs
    if (isFinalizationRunning) {
        const message = "Un processo di finalizzazione è già in corso. Attendi il completamento.";
        console.warn(`[Finalize] ${message}`);
        return res.status(409).json({ message });
    }

    // Pre-check: Verifica dati necessari e entità di sistema
    const requiredTables = [
      { name: 'Anagrafiche', count: () => prisma.stagingAnagrafica.count() },
      { name: 'Causali Contabili', count: () => prisma.stagingCausaleContabile.count() },
      { name: 'Codici IVA', count: () => prisma.stagingCodiceIva.count() },
      { name: 'Condizioni Pagamento', count: () => prisma.stagingCondizionePagamento.count() },
      { name: 'Piano dei Conti', count: () => prisma.stagingConto.count() },
      { name: 'Scritture', count: () => prisma.stagingTestata.count() },
    ];

    for (const table of requiredTables) {
      const count = await table.count();
      if (count === 0) {
        const message = `La tabella di staging "${table.name}" è vuota. Impossibile procedere con la finalizzazione.`;
        console.error(`[Finalize Pre-check] ${message}`);
        return res.status(400).json({ message });
      }
    }
    
    // Verifica che esista o possa essere creato il cliente di sistema
    const sistemaCliente = await prisma.cliente.findFirst({
      where: { externalId: 'SYS-CUST' }
    });
    
    if (!sistemaCliente) {
      console.log('[Finalize Pre-check] Cliente di sistema non trovato, verrà creato durante la finalizzazione.');
    }
    
    // Verifica coerenza dei dati di staging per allocazioni
    const allocazioniCount = await prisma.stagingAllocazione.count();
    if (allocazioniCount > 0) {
      const allocazioniWithoutCentro = await prisma.stagingAllocazione.count({
        where: { OR: [{ centroDiCosto: null }, { centroDiCosto: '' }] }
      });
      
      if (allocazioniWithoutCentro > 0) {
        console.warn(`[Finalize Pre-check] Trovate ${allocazioniWithoutCentro} allocazioni senza centro di costo. Verranno saltate.`);
      }
    }

    // Set running flag
    isFinalizationRunning = true;
    res.status(202).json({ message: "Processo di finalizzazione avviato." });

    // Run with proper cleanup
    try {
        await runFinalizationProcess();
    } finally {
        isFinalizationRunning = false;
    }
});

// Endpoint per resettare il flag di finalizzazione manualmente (emergency)
router.post('/reset-finalization-flag', async (req, res) => {
    console.log('[Emergency Reset] Richiesta di reset flag finalizzazione ricevuta.');
    
    try {
        isFinalizationRunning = false;
        console.log('[Emergency Reset] Flag finalizzazione resettato con successo.');
        res.json({ 
            message: 'Flag di finalizzazione resettato con successo.',
            success: true,
            wasRunning: isFinalizationRunning
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Emergency Reset] Errore durante il reset:', errorMessage);
        res.status(500).json({ 
            message: `Errore durante il reset del flag: ${errorMessage}`,
            success: false 
        });
    }
});

// POST /api/staging/cleanup-all - Svuota SOLO le tabelle staging
router.post('/cleanup-all', async (req, res) => {
  console.log('[Staging Cleanup] Richiesta cleanup completo SOLO tabelle staging...');
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Svuota SOLO le 9 tabelle staging in ordine sicuro per FK
      console.log('[Staging Cleanup] Eliminazione in corso...');
      
      const deletions = await Promise.all([
        tx.stagingRigaContabile.deleteMany({}),
        tx.stagingRigaIva.deleteMany({}), 
        tx.stagingAllocazione.deleteMany({}),
        tx.stagingTestata.deleteMany({}),
        tx.stagingConto.deleteMany({}),
        tx.stagingCodiceIva.deleteMany({}),
        tx.stagingCausaleContabile.deleteMany({}),
        tx.stagingCondizionePagamento.deleteMany({}),
        tx.stagingAnagrafica.deleteMany({})
      ]);

      const totalDeleted = deletions.reduce((sum, del) => sum + del.count, 0);
      return { totalDeleted, tablesCleared: 9 };
    }, {
      timeout: 30000 // 30 secondi timeout per operazioni massive
    });

    console.log(`[Staging Cleanup] ${result.totalDeleted} record eliminati da ${result.tablesCleared} tabelle staging.`);
    res.json({ 
      message: `Cleanup staging completato: ${result.totalDeleted} record eliminati da ${result.tablesCleared} tabelle.`,
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Staging Cleanup] Errore durante cleanup:', error);
    res.status(500).json({
      message: 'Errore durante il cleanup delle tabelle staging.',
      error: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
});


// Endpoint per ottenere report audit dettagliato
router.get('/audit-report', (_req, res) => {
    try {
        const report = generateAuditReport();
        res.json({
            success: true,
            report
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({
            success: false,
            message: `Errore generazione report audit: ${errorMessage}`
        });
    }
});

// DELETE endpoints per svuotamento singole tabelle staging
router.delete('/staging_conti', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_conti...');
    try {
        const result = await prisma.stagingConto.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_conti.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Piano dei Conti.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_conti:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_anagrafiche', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_anagrafiche...');
    try {
        const result = await prisma.stagingAnagrafica.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_anagrafiche.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Anagrafiche.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_anagrafiche:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_causali_contabili', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_causali_contabili...');
    try {
        const result = await prisma.stagingCausaleContabile.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_causali_contabili.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Causali Contabili.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_causali_contabili:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_codici_iva', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_codici_iva...');
    try {
        const result = await prisma.stagingCodiceIva.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_codici_iva.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Codici IVA.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_codici_iva:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_condizioni_pagamento', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_condizioni_pagamento...');
    try {
        const result = await prisma.stagingCondizionePagamento.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_condizioni_pagamento.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Condizioni Pagamento.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_condizioni_pagamento:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_centri_costo', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_centri_costo...');
    try {
        const result = await (prisma as any).stagingCentroCosto.deleteMany({});
        console.log(`[Staging Delete] ${result.count} record eliminati da staging_centri_costo.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalla tabella Centri di Costo.`,
            count: result.count
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_centri_costo:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

router.delete('/staging_scritture', async (req, res) => {
    console.log('[Staging Delete] Richiesta cancellazione staging_scritture...');
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Elimina in ordine corretto per rispettare le foreign key
            const righeContabili = await tx.stagingRigaContabile.deleteMany({});
            const righeIva = await tx.stagingRigaIva.deleteMany({});
            const allocazioni = await tx.stagingAllocazione.deleteMany({});
            const testate = await tx.stagingTestata.deleteMany({});
            
            return {
                count: righeContabili.count + righeIva.count + allocazioni.count + testate.count,
                details: {
                    righeContabili: righeContabili.count,
                    righeIva: righeIva.count,
                    allocazioni: allocazioni.count,
                    testate: testate.count
                }
            };
        });
        
        console.log(`[Staging Delete] ${result.count} record totali eliminati da tabelle scritture.`);
        res.json({
            success: true,
            message: `${result.count} record eliminati dalle tabelle Scritture Contabili.`,
            count: result.count,
            details: result.details
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Staging Delete] Errore eliminazione staging_scritture:', errorMessage);
        res.status(500).json({
            success: false,
            message: `Errore durante l'eliminazione: ${errorMessage}`
        });
    }
});

export default router;