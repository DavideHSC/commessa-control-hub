import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import {
    cleanSlateReset,
    finalizeAnagrafiche,
    finalizeCausaliContabili,
    finalizeCodiciIva,
    finalizeCondizioniPagamento,
    finalizeConti,
    finalizeScritture,
    finalizeRigaIva,
    finalizeAllocazioni
} from '../lib/finalization';
import {
    optimizedCleanSlate,
    optimizedFinalizeAnagrafiche,
    optimizedFinalizeScritture
} from '../lib/finalization_optimized';

const prisma = new PrismaClient();
const router = express.Router();
const sseEmitter = new EventEmitter();

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

router.get('/stats', async (req, res) => {
    try {
        const [anagrafiche, causali, codiciIva, condizioniPagamento, conti, scritture] = await prisma.$transaction([
            prisma.stagingAnagrafica.count(),
            prisma.stagingCausaleContabile.count(),
            prisma.stagingCodiceIva.count(),
            prisma.stagingCondizionePagamento.count(),
            prisma.stagingConto.count(),
            prisma.stagingTestata.count(),
        ]);
        res.json({ anagrafiche, causali, codiciIva, condizioniPagamento, conti, scritture });
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
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const listener = (data: any) => {
        res.write(`data: ${data}\n\n`);
    };

    sseEmitter.on('message', listener);

    req.on('close', () => {
        sseEmitter.off('message', listener);
    });
});


const runFinalizationProcess = async () => {
    const sseSend = (data: any) => sseEmitter.emit('message', JSON.stringify(data));

    try {
        sseSend({ step: 'start', message: 'Avvio del processo di finalizzazione...' });

        // Fase 0: CLEAN SLATE OTTIMIZZATO - Elimina tutti i dati di produzione
        sseSend({ step: 'clean_slate', status: 'running', message: 'Eliminazione dati esistenti (ottimizzata)...' });
        await optimizedCleanSlate(prisma);
        sseSend({ step: 'clean_slate', status: 'completed', message: 'Dati di produzione eliminati con successo.' });

        // Fase 1: Finalizzazione Anagrafiche OTTIMIZZATA
        sseSend({ step: 'anagrafiche', status: 'running', message: 'Finalizzazione anagrafiche (ottimizzata)...' });
        const anagraficheResult = await optimizedFinalizeAnagrafiche(prisma);
        sseSend({ step: 'anagrafiche', status: 'completed', message: `Anagrafiche finalizzate.`, count: anagraficheResult.count });

        // Fase 2: Finalizzazione Causali Contabili
        sseSend({ step: 'causali', status: 'running', message: 'Finalizzazione causali...' });
        const causaliResult = await finalizeCausaliContabili(prisma);
        sseSend({ step: 'causali', status: 'completed', message: `Causali finalizzate.`, count: causaliResult.count });

        // Fase 3: Finalizzazione Codici IVA
        sseSend({ step: 'codici_iva', status: 'running', message: 'Finalizzazione codici IVA...' });
        const ivaResult = await finalizeCodiciIva(prisma);
        sseSend({ step: 'codici_iva', status: 'completed', message: `Codici IVA finalizzati.`, count: ivaResult.count });

        // Fase 4: Finalizzazione Condizioni di Pagamento
        sseSend({ step: 'condizioni_pagamento', status: 'running', message: 'Finalizzazione condizioni di pagamento...' });
        const pagamentiResult = await finalizeCondizioniPagamento(prisma);
        sseSend({ step: 'condizioni_pagamento', status: 'completed', message: `Condizioni di pagamento finalizzate.`, count: pagamentiResult.count });

        // Fase 5: Finalizzazione Piano dei Conti
        sseSend({ step: 'conti', status: 'running', message: 'Finalizzazione piano dei conti...' });
        const contiResult = await finalizeConti(prisma);
        sseSend({ step: 'conti', status: 'completed', message: 'Piano dei conti finalizzato.', count: contiResult.count });

        // Fase 6: Finalizzazione Scritture Contabili OTTIMIZZATA
        sseSend({ step: 'scritture', status: 'running', message: 'Finalizzazione scritture contabili (ottimizzata)...' });
        const scrittureResult = await optimizedFinalizeScritture(prisma);
        sseSend({ step: 'scritture', status: 'completed', message: 'Scritture contabili finalizzate.', count: scrittureResult.count });

        // Fase 7: Finalizzazione Righe IVA
        sseSend({ step: 'righe_iva', status: 'running', message: 'Finalizzazione righe IVA...' });
        const righeIvaResult = await finalizeRigaIva(prisma);
        sseSend({ step: 'righe_iva', status: 'completed', message: 'Righe IVA finalizzate.', count: righeIvaResult.count });

        // Fase 8: Finalizzazione Allocazioni
        sseSend({ step: 'allocazioni', status: 'running', message: 'Finalizzazione allocazioni...' });
        const allocazioniResult = await finalizeAllocazioni(prisma);
        sseSend({ step: 'allocazioni', status: 'completed', message: 'Allocazioni finalizzate.', count: allocazioniResult.count });

        sseSend({ step: 'end', message: 'Processo di finalizzazione completato con successo.' });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Finalize] Errore durante il processo di finalizzazione:', errorMessage);
        sseEmitter.emit('message', JSON.stringify({ step: 'error', message: `Errore: ${errorMessage}` }));
    }
};

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

    // Pre-check
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
        const message = `La tabella di staging "${table.name}" è vuota. Impossibile procedere.`;
        console.error(`[Finalize Pre-check] ${message}`);
        return res.status(400).json({ message });
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


export default router; 