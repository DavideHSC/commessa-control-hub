import express from 'express';
import { Prisma, PrismaClient, TipoConto } from '@prisma/client';

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
      sortOrder = 'asc',
      tipo,
      rilevanti, // Nuovo parametro per filtrare conti rilevanti per commesse
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.ContoWhereInput = {};

    if (search) {
      where.OR = [
        { codice: { contains: search as string, mode: 'insensitive' } },
        { nome: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (tipo && Object.values(TipoConto).includes(tipo as TipoConto)) {
      where.tipo = tipo as TipoConto;
    }

    // Filtro per conti rilevanti per commesse
    if (rilevanti === 'true') {
      where.isRilevantePerCommesse = true;
    }

    const orderBy: Prisma.ContoOrderByWithRelationInput = {
      [(sortBy as string) || 'codice']: (sortOrder as 'asc' | 'desc') || 'asc',
    };

    const [conti, totalCount] = await prisma.$transaction([
      prisma.conto.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          vociAnalitiche: true,
        },
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
      include: {
        vociAnalitiche: true,
      },
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
      include: {
        vociAnalitiche: true,
      },
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