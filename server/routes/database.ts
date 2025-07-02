import express from 'express';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

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
      stats,
    });
  } catch (error) {
    console.error('Errore nel recupero dei dati del database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.delete('/scritture', async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.allocazione.deleteMany({});
      await tx.rigaIva.deleteMany({});
      await tx.rigaScrittura.deleteMany({});
      await tx.scritturaContabile.deleteMany({});
    });
    res.status(200).json({ message: 'Tabella Scritture Contabili svuotata con successo.' });
  } catch (error) {
    console.error("Errore durante lo svuotamento della tabella Scritture Contabili:", error);
    res.status(500).json({ error: 'Errore interno del server durante la pulizia delle scritture.' });
  }
});

router.delete('/codici-iva', async (req, res) => {
  try {
    await prisma.codiceIva.deleteMany({});
    res.status(200).json({ message: 'Tabella Codici IVA svuotata con successo.' });
  } catch (error) {
    console.error("Errore durante lo svuotamento della tabella Codici IVA:", error);
    res.status(500).json({ error: 'Errore interno del server durante la pulizia dei codici IVA.' });
  }
});

router.delete('/condizioni-pagamento', async (req, res) => {
  try {
    await prisma.condizionePagamento.deleteMany({});
    res.status(200).json({ message: 'Tabella Condizioni di Pagamento svuotata con successo.' });
  } catch (error) {
    console.error("Errore durante lo svuotamento della tabella Condizioni di Pagamento:", error);
    res.status(500).json({ error: 'Errore interno del server durante la pulizia delle condizioni di pagamento.' });
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

export default router; 