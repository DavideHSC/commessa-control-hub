import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const causali = await prisma.causaleContabile.findMany({
        include: {
            datiPrimari: true,
            templateScrittura: true,
        },
        orderBy: {
            nome: 'asc'
        }
    });
    res.json(causali);
  } catch (error) {
    console.error('Errore nel caricamento delle causali contabili:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router; 