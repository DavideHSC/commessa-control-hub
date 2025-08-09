import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all commesse with pagination
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

    const where: Prisma.CommessaWhereInput = search ? {
      OR: [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { descrizione: { contains: search as string, mode: 'insensitive' } },
        { cliente: { nome: { contains: search as string, mode: 'insensitive' } } },
        { parent: { nome: { contains: search as string, mode: 'insensitive' } } },
      ],
    } : {};

    const orderBy: Prisma.CommessaOrderByWithRelationInput = {
        [(sortBy as string) || 'nome']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [commesse, totalCount] = await prisma.$transaction([
      prisma.commessa.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { 
          cliente: true, 
          budget: true,
          parent: true,
          children: true
        }
      }),
      prisma.commessa.count({ where })
    ]);
    
    res.json({
        data: commesse,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Errore nel recupero delle commesse.' });
  }
});

// POST a new commessa
router.post('/', async (req, res) => {
  try {
    const { budget, ...commessaData } = req.body;
    const nuovaCommessa = await prisma.commessa.create({
      data: {
        ...commessaData,
        budget: {
          create: budget || [], // budget è un array di BudgetVoce
        }
      },
      include: {
        cliente: true,
        parent: true,
        children: true,
        budget: true,
      }
    });
    res.status(201).json(nuovaCommessa);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione della commessa.' });
  }
});

// PUT update a commessa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { budget, cliente, ...commessaData } = req.body;
    
    // Iniziamo una transazione per aggiornare la commessa e il suo budget
    const result = await prisma.$transaction(async (tx) => {
      // 1. Aggiorna i dati base della commessa
      const commessaAggiornata = await tx.commessa.update({
        where: { id },
        data: commessaData,
        include: {
          cliente: true,
          parent: true,
          children: true,
          budget: true,
        }
      });

      // 2. Se è stato fornito un nuovo budget, cancelliamo quello vecchio e creiamo quello nuovo
      if (budget) {
        await tx.budgetVoce.deleteMany({
          where: { commessaId: id },
        });
        await tx.budgetVoce.createMany({
          data: budget.map((voce: Partial<import('@prisma/client').BudgetVoce>) => ({
            ...voce,
            commessaId: id,
          })),
        });
      }

      return commessaAggiornata;
    });

    res.json(result);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: `Errore nell'aggiornamento della commessa ${id}.` });
  }
});

// DELETE a commessa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // La cancellazione a cascata dovrebbe gestire il budget associato
    await prisma.commessa.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: unknown) {
    res.status(500).json({ error: `Errore nell'eliminazione della commessa ${id}.` });
  }
});

// GET all commesse for select inputs
router.get('/select', async (req, res) => {
  try {
    const commesse = await prisma.commessa.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.json(commesse);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero delle commesse per la selezione.' });
  }
});

export default router; 