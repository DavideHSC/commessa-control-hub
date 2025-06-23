import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
  try {
    const [
      totaleScrittureContabili,
      totaleCommesse,
      totaleClienti,
      totaleFornitori,
      totaleConti,
      totaleVociAnalitiche,
      totaleCausali,
      totaleCodiciIva,
      totaleCondizioniPagamento,
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

    res.json({
      totaleScrittureContabili,
      totaleCommesse,
      totaleClienti,
      totaleFornitori,
      totaleConti,
      totaleVociAnalitiche,
      totaleCausali,
      totaleCodiciIva,
      totaleCondizioniPagamento,
    });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche del database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

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

export default router; 