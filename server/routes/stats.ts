import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
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