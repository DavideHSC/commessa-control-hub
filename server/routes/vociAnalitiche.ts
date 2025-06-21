import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all voci analitiche
router.get('/', async (req, res) => {
  try {
    const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'nome',
        sortOrder = 'asc'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.VoceAnaliticaWhereInput = search ? {
        OR: [
            { id: { contains: search as string, mode: 'insensitive' } },
            { nome: { contains: search as string, mode: 'insensitive' } },
            { descrizione: { contains: search as string, mode: 'insensitive' } },
        ],
    } : {};

    const orderBy: Prisma.VoceAnaliticaOrderByWithRelationInput = {
        [(sortBy as string) || 'nome']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [vociAnalitiche, totalCount] = await prisma.$transaction([
        prisma.voceAnalitica.findMany({
            where,
            orderBy,
            skip,
            take,
        }),
        prisma.voceAnalitica.count({ where }),
    ]);

    res.json({
        data: vociAnalitiche,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });

  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero delle voci analitiche.' });
  }
});

// POST a new voce analitica
router.post('/', async (req, res) => {
  try {
    const nuovaVoce = await prisma.voceAnalitica.create({
      data: req.body,
    });
    res.status(201).json(nuovaVoce);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione della voce analitica.' });
  }
});

// PUT update a voce analitica
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const voceAggiornata = await prisma.voceAnalitica.update({
      where: { id },
      data: req.body,
    });
    res.json(voceAggiornata);
  } catch (error) {
    res.status(500).json({ error: `Errore nell'aggiornamento della voce analitica ${id}.` });
  }
});

// DELETE a voce analitica
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.voceAnalitica.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: `Errore nell'eliminazione della voce analitica ${id}.` });
  }
});

export default router; 