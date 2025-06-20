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
    ]);

    const stats = {
      totaleScrittureContabili: scritture.length,
      totaleCommesse: commesse.length,
      totaleClienti: clienti.length,
      totaleFornitori: fornitori.length,
      totaleConti: conti.length,
      totaleVociAnalitiche: vociAnalitiche.length,
    };

    res.json({
      scritture,
      commesse,
      clienti,
      fornitori,
      conti,
      vociAnalitiche,
      stats,
    });
  } catch (error) {
    console.error('Errore nel recupero dei dati del database:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router; 