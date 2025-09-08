import express from 'express';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { resetFinalizationFlag } from './staging.js'; // Import necessario per il reset del flag

const execAsync = util.promisify(exec);

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const [
      scritture,
      commesse,
      clienti,
      fornitori,
      conti,
      vociAnalitiche,
      causali,
      codiciIva,
      condizioniPagamento,
      righeScrittura,
      righeIva,
    ] = await prisma.$transaction([
      prisma.scritturaContabile.findMany({
        include: {
          righe: true
        },
        orderBy: {
            data: 'desc'
        }
      }),
      prisma.commessa.findMany(),
      prisma.cliente.findMany({ orderBy: { nome: 'asc' } }),
      prisma.fornitore.findMany({ orderBy: { nome: 'asc' } }),
      prisma.conto.findMany({ orderBy: { codice: 'asc' } }),
      prisma.voceAnalitica.findMany({ orderBy: { nome: 'asc' } }),
      prisma.causaleContabile.findMany({ orderBy: { nome: 'asc' } }),
      prisma.codiceIva.findMany({ orderBy: { id: 'asc' } }),
      prisma.condizionePagamento.findMany({ orderBy: { id: 'asc' } }),
      prisma.rigaScrittura.findMany({ orderBy: { id: 'asc' } }),
      prisma.rigaIva.findMany({ orderBy: { id: 'asc' } }),
    ]);

    const stats = {
      totaleScrittureContabili: scritture.length,
      totaleCommesse: commesse.length,
      totaleClienti: clienti.length,
      totaleFornitori: fornitori.length,
      totaleConti: conti.length,
      totaleVociAnalitiche: vociAnalitiche.length,
      totaleCausali: causali.length,
      totaleCodiciIva: codiciIva.length,
      totaleCondizioniPagamento: condizioniPagamento.length,
      totaleRigheScrittura: righeScrittura.length,
      totaleRigheIva: righeIva.length,
    };

    res.json({
      scritture,
      commesse,
      clienti,
      fornitori,
      conti,
      vociAnalitiche,
      causali,
      codiciIva,
      condizioniPagamento,
      righeScrittura,
      righeIva,
      stats,
    });
  } catch (error) {
    console.error('Errore nel recupero dei dati del database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/backup', async (req, res) => {
  const backupDir = path.join(__dirname, '..', '..', 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.dump`;
  const backupFilePath = path.join(backupDir, backupFileName);

  try {
    // Assicurati che la directory di backup esista
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Leggi la stringa di connessione dal .env
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non è definita nel file .env');
    }

    // Comando pg_dump
    const command = `pg_dump "${databaseUrl}" -F c -b -v -f "${backupFilePath}"`;

    console.log(`Esecuzione del backup: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    console.log('Output del backup:', stdout);
    if (stderr) {
      console.error('Errore durante il backup:', stderr);
    }

    res.status(200).json({ 
      message: 'Backup del database creato con successo.',
      filePath: backupFilePath 
    });

  } catch (error) {
    console.error("Errore durante la creazione del backup del database:", error);
    res.status(500).json({ 
      error: 'Errore interno del server durante la creazione del backup.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});


// --- LOGICA SPOSTATA DA reset-finalization.ts ---

// Emergency reset endpoint to clear stuck finalization processes
router.post('/reset-finalization-flag', async (req, res) => {
    console.log('[Reset] Resetting finalization flag...');
    
    try {
        resetFinalizationFlag();
        
        res.json({ 
            message: 'Flag di finalizzazione resettato con successo. Ora puoi rilanciare il processo.',
            success: true 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Reset] Errore:', errorMessage);
        res.status(500).json({ 
            message: `Errore durante il reset: ${errorMessage}`,
            success: false 
        });
    }
});

// Check current finalization status
router.get('/finalization-status', async (req, res) => {
    try {
        const activeConnections = await prisma.$queryRaw<Array<{ active_count: bigint }>>`
            SELECT COUNT(*) as active_count 
            FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query LIKE '%INSERT%' OR query LIKE '%DELETE%' OR query LIKE '%UPDATE%'
        `;

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
            activeConnections: Number(activeConnections[0]?.active_count) || 0,
            stagingCounts,
            productionCounts,
            totalStagingRecords: Object.values(stagingCounts).reduce((sum, count) => sum + count, 0),
            totalProductionRecords: Object.values(productionCounts).reduce((sum, count) => sum + count, 0)
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Status] Errore:', errorMessage);
        res.status(500).json({ error: errorMessage });
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Emergency] Errore:', errorMessage);
        res.status(500).json({ 
            message: `Errore durante emergency cleanup: ${errorMessage}`,
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
                await prisma.allocazione.deleteMany({});
                await prisma.budgetVoce.deleteMany({});
                await prisma.regolaRipartizione.deleteMany({});
                await prisma.importAllocazione.deleteMany({});
                result = await prisma.commessa.deleteMany({});
                break;
            case 'scritture':
            case 'scritture-contabili':
                await prisma.allocazione.deleteMany({});
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
                await prisma.allocazione.deleteMany({});
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Clear Table] Errore durante l'eliminazione di ${tableName}:`, errorMessage);
        res.status(500).json({ 
            message: `Errore durante l'eliminazione della tabella ${tableName}: ${errorMessage}`,
            success: false 
        });
    }
});


export default router;