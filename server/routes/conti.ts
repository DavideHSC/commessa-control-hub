import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all conti with pagination, search, and sort
router.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '25', 
      search = '',
      sortBy = 'codice',
      sortOrder = 'asc'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.ContoWhereInput = search ? {
      OR: [
        { codice: { contains: search as string, mode: 'insensitive' } },
        { nome: { contains: search as string, mode: 'insensitive' } },
      ],
    } : {};

    const orderBy: Prisma.ContoOrderByWithRelationInput = {
        [(sortBy as string) || 'codice']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [conti, totalCount] = await prisma.$transaction([
      prisma.conto.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.conto.count({ where }),
    ]);

    res.json({
      data: conti,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei conti.' });
  }
});

// GET all conti for configuration purposes (no pagination)
router.get('/configurabili', async (req, res) => {
  try {
    const conti = await prisma.conto.findMany({
      select: {
        id: true,
        codice: true,
        nome: true,
        isRilevantePerCommesse: true,
      },
      orderBy: {
        codice: 'asc',
      },
    });
    res.json({ data: conti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei conti per la configurazione.' });
  }
});

// PATCH toggle a conto's relevance for analytics
router.patch('/:id/toggle-rilevanza', async (req, res) => {
  const { id } = req.params;
  const { isRilevante } = req.body;

  if (typeof isRilevante !== 'boolean') {
    return res.status(400).json({ error: 'Il campo isRilevante deve essere un booleano.' });
  }

  try {
    const contoAggiornato = await prisma.conto.update({
      where: { id },
      data: {
        isRilevantePerCommesse: isRilevante,
      },
      select: {
        id: true,
        isRilevantePerCommesse: true,
      }
    });
    res.json(contoAggiornato);
  } catch (error) {
    res.status(500).json({ error: `Errore nell'aggiornamento del conto ${id}.` });
  }
});

// GET all conti for select inputs
router.get('/select', async (req, res) => {
  try {
    const conti = await prisma.conto.findMany({
      select: {
        id: true,
        codice: true,
        nome: true,
      },
      orderBy: {
        codice: 'asc',
      },
    });
    res.json(conti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei conti per la selezione.' });
  }
});

// POST a new conto
router.post('/', async (req, res) => {
  try {
    const nuovoConto = await prisma.conto.create({
      data: req.body,
    });
    res.status(201).json(nuovoConto);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione del conto.' });
  }
});

// PUT update a conto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contoAggiornato = await prisma.conto.update({
      where: { id },
      data: req.body,
    });
    res.json(contoAggiornato);
  } catch (error) {
    res.status(500).json({ error: `Errore nell'aggiornamento del conto ${id}.` });
  }
});

// DELETE a conto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.conto.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: `Errore nell'eliminazione del conto ${id}.` });
  }
});

export default router; 