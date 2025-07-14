import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import {
    finalizeAnagrafiche,
    finalizeCausaliContabili,
    finalizeCodiciIva,
    finalizeCondizioniPagamento,
    finalizeConti
} from '../lib/finalization';

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

        // Fase 1: Finalizzazione Anagrafiche
        sseSend({ step: 'anagrafiche', status: 'running', message: 'Finalizzazione anagrafiche...' });
        const anagraficheResult = await finalizeAnagrafiche(prisma);
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

        // TODO: Fase 6: Finalizzazione Scritture Contabili
        sseSend({ step: 'scritture', status: 'pending', message: 'Finalizzazione scritture contabili da implementare...' });

        sseSend({ step: 'end', message: 'Processo di finalizzazione completato.' });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Finalize] Errore durante il processo di finalizzazione:', errorMessage);
        sseEmitter.emit('message', JSON.stringify({ step: 'error', message: `Errore: ${errorMessage}` }));
    }
};

router.post('/finalize', async (req, res) => {
    console.log('[Finalize] Richiesta di finalizzazione ricevuta.');

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

    res.status(202).json({ message: "Processo di finalizzazione avviato." });

    runFinalizationProcess();
});


export default router; 