import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Emergency reset endpoint to clear stuck finalization processes
router.post('/reset-finalization-flag', async (req, res) => {
    console.log('[Reset] Resetting finalization flag...');
    
    try {
        // Import and reset the flag
        const { resetFinalizationFlag } = await import('./staging');
        resetFinalizationFlag();
        
        res.json({ 
            message: 'Flag di finalizzazione resettato con successo. Ora puoi rilanciare il processo.',
            success: true 
        });
    } catch (error) {
        console.error('[Reset] Errore:', error);
        res.status(500).json({ 
            message: `Errore durante il reset: ${error}`,
            success: false 
        });
    }
});

// Check current finalization status
router.get('/finalization-status', async (req, res) => {
    try {
        // Check if there are any ongoing database operations
        const activeConnections = await prisma.$queryRaw`
            SELECT COUNT(*) as active_count 
            FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query LIKE '%INSERT%' OR query LIKE '%DELETE%' OR query LIKE '%UPDATE%'
        ` as any[];

        const stagingCounts = {
            anagrafiche: await prisma.stagingAnagrafica.count(),
            causali: await prisma.stagingCausaleContabile.count(),
            codiciIva: await prisma.stagingCodiceIva.count(),
            condizioniPagamento: await prisma.stagingCondizionePagamento.count(),
            conti: await prisma.stagingConto.count(),
            scritture: await prisma.stagingTestata.count(),
        };

        const productionCounts = {
            clienti: await prisma.cliente.count(),
            fornitori: await prisma.fornitore.count(),
            causali: await prisma.causaleContabile.count(),
            codiciIva: await prisma.codiceIva.count(),
            condizioniPagamento: await prisma.condizionePagamento.count(),
            conti: await prisma.conto.count(),
            scritture: await prisma.scritturaContabile.count(),
        };

        res.json({
            activeConnections: activeConnections[0]?.active_count || 0,
            stagingCounts,
            productionCounts,
            totalStagingRecords: Object.values(stagingCounts).reduce((sum, count) => sum + count, 0),
            totalProductionRecords: Object.values(productionCounts).reduce((sum, count) => sum + count, 0)
        });
    } catch (error) {
        console.error('[Status] Errore:', error);
        res.status(500).json({ error: error.message });
    }
});

// Emergency cleanup - use with EXTREME caution
router.post('/emergency-cleanup', async (req, res) => {
    console.log('[Emergency] Emergency cleanup richiesta...');
    
    try {
        // Kill any hanging transactions (PostgreSQL specific)
        await prisma.$queryRaw`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = current_database()
            AND pid <> pg_backend_pid()
            AND state = 'active'
            AND query LIKE '%staging%'
        `;

        res.json({ 
            message: 'Emergency cleanup eseguito. Connessioni database terminate.',
            success: true 
        });
    } catch (error) {
        console.error('[Emergency] Errore:', error);
        res.status(500).json({ 
            message: `Errore durante emergency cleanup: ${error}`,
            success: false 
        });
    }
});

// Clear individual database tables
router.delete('/clear-table/:tableName', async (req, res) => {
    const { tableName } = req.params;
    console.log(`[Clear Table] Richiesta eliminazione tabella: ${tableName}`);
    
    try {
        let result;
        
        switch(tableName) {
            case 'clienti':
                result = await prisma.cliente.deleteMany({});
                break;
            case 'fornitori':
                result = await prisma.fornitore.deleteMany({});
                break;
            case 'commesse':
                // Elimina prima le dipendenze
                await prisma.allocazione.deleteMany({});
                await prisma.budgetVoce.deleteMany({});
                await prisma.regolaRipartizione.deleteMany({});
                await prisma.importAllocazione.deleteMany({});
                result = await prisma.commessa.deleteMany({});
                break;
            case 'scritture':
            case 'scritture-contabili':
                // Elimina prima le dipendenze
                await prisma.rigaIva.deleteMany({});
                await prisma.rigaScrittura.deleteMany({});
                result = await prisma.scritturaContabile.deleteMany({});
                break;
            case 'conti':
                result = await prisma.conto.deleteMany({});
                break;
            case 'causali':
                result = await prisma.causaleContabile.deleteMany({});
                break;
            case 'codici-iva':
                result = await prisma.codiceIva.deleteMany({});
                break;
            case 'condizioni-pagamento':
                result = await prisma.condizionePagamento.deleteMany({});
                break;
            case 'righe-scrittura':
                result = await prisma.rigaScrittura.deleteMany({});
                break;
            case 'righe-iva':
                result = await prisma.rigaIva.deleteMany({});
                break;
            default:
                return res.status(400).json({ 
                    message: `Tabella non supportata: ${tableName}`,
                    success: false 
                });
        }
        
        console.log(`[Clear Table] Eliminati ${result.count} record da ${tableName}`);
        res.json({ 
            message: `Eliminati ${result.count} record dalla tabella ${tableName}.`,
            count: result.count,
            success: true 
        });
    } catch (error) {
        console.error(`[Clear Table] Errore durante l'eliminazione di ${tableName}:`, error);
        res.status(500).json({ 
            message: `Errore durante l'eliminazione della tabella ${tableName}: ${error}`,
            success: false 
        });
    }
});

export default router;