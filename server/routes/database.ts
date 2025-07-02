import express from 'express';
import { PrismaClient } from '@prisma/client';

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

export default router; 