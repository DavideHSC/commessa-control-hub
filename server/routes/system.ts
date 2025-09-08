import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

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
    }, {} as Record<string, { stepId: string; stepTitle: string; templateName: string; status: string; fileName?: string; recordCount?: number; completedAt?: Date; error?: string; }>);

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

/**
 * Elimina SOLO le tabelle di produzione (NON le tabelle staging)
 * Ordine rispetta le foreign key constraints
 */
async function deleteProductionTablesOnly(prisma: PrismaClient) {
  console.log('[Reset Database] 🔄 Eliminazione SOLO tabelle produzione...');
  
  const result = await prisma.$transaction(async (tx) => {
    // Ordine di eliminazione: prima figlie, poi parent (per FK)
    console.log('[Reset Database] Step 1/5 - Eliminando dati dipendenti...');
    await tx.allocazione.deleteMany({});
    await tx.budgetVoce.deleteMany({});
    
    console.log('[Reset Database] Step 2/5 - Eliminando scritture contabili...');
    await tx.rigaIva.deleteMany({});
    await tx.rigaScrittura.deleteMany({});
    await tx.scritturaContabile.deleteMany({});
    
    console.log('[Reset Database] Step 3/5 - Eliminando commesse...');
    await tx.commessa.deleteMany({});
    
    console.log('[Reset Database] Step 4/5 - Eliminando anagrafiche...');
    await tx.cliente.deleteMany({});
    await tx.fornitore.deleteMany({});
    
    console.log('[Reset Database] Step 5/5 - Eliminando configurazioni...');
    await tx.conto.deleteMany({});
    await tx.voceAnalitica.deleteMany({});
    await tx.causaleContabile.deleteMany({});
    await tx.codiceIva.deleteMany({});
    await tx.condizionePagamento.deleteMany({});
    await tx.regolaRipartizione.deleteMany({});
    
    return { success: true };
  }, {
    timeout: 30000 // 30 secondi timeout per operazioni massive
  });
  
  console.log('[Reset Database] ✅ Eliminazione tabelle produzione completata.');
  return result;
}

/**
 * Esegue il seed per ripopolare i dati iniziali
 */
async function runSeedData() {
  console.log('[Reset Database] 🌱 Esecuzione seed per ripopolamento...');
  
  try {
    await execAsync('npx prisma db seed');
    console.log('[Reset Database] ✅ Seed completato con successo.');
  } catch (error) {
    console.error('[Reset Database] ❌ Errore durante seed:', error);
    throw error;
  }
}

router.post('/reset-database', async (req, res) => {
  console.log("[Reset Database] 🔄 Avvio reset SOLO tabelle produzione + ripopolamento...");
  
  try {
    // Step 1: Elimina SOLO tabelle produzione (staging intatte)
    await deleteProductionTablesOnly(prisma);
    
    // Step 2: Ripopola con dati seed
    await runSeedData();
    
    console.log("[Reset Database] ✅ Reset selettivo completato con successo.");
    res.status(200).json({ 
      message: 'Reset database completato: tabelle produzione eliminate e ripopolate, staging preservato.',
      success: true,
      operation: 'selective_reset'
    });

  } catch (error) {
    console.error("[Reset Database] ❌ Errore durante reset:", error);
    res.status(500).json({
      message: 'Errore durante il reset selettivo del database.',
      error: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
});

// LOGICA SPOSTATA DA stats.ts
router.get('/db-stats', async (req, res) => {
  try {
    const [
      scrittureCount,
      commesseCount,
      clientiCount,
      fornitoriCount,
      contiCount,
      vociAnaliticheCount,
      causaliCount,
      codiciIvaCount,
      condizioniPagamentoCount,
    ] = await prisma.$transaction([
      prisma.scritturaContabile.count(),
      prisma.commessa.count(),
      prisma.cliente.count(),
      prisma.fornitore.count(),
      prisma.conto.count(),
      prisma.voceAnalitica.count(),
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.condizionePagamento.count(),
    ]);

    const stats = {
      totaleScrittureContabili: scrittureCount,
      totaleCommesse: commesseCount,
      totaleClienti: clientiCount,
      totaleFornitori: fornitoriCount,
      totaleConti: contiCount,
      totaleVociAnalitiche: vociAnaliticheCount,
      totaleCausali: causaliCount,
      totaleCodiciIva: codiciIvaCount,
      totaleCondizioniPagamento: condizioniPagamentoCount,
    };

    res.json(stats);
  } catch (error) {
    console.error('Errore nel recupero delle statistiche del database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});


export default router;