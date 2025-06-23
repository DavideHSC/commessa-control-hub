import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all commesse
router.get('/', async (req, res) => {
  try {
    const commesse = await prisma.commessa.findMany({
      where: {
        commessaPadreId: null, // Seleziona solo le commesse principali
      },
      include: {
        cliente: true,
        sottocommesse: {
          include: {
            allocazioni: {
              include: {
                rigaScrittura: {
                  include: {
                    conto: true,
                    scritturaContabile: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { sottocommesse: true },
        },
      },
    });
    res.json({ data: commesse });
  } catch (error) {
    console.error("Errore nel recupero delle commesse:", error);
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
    });
    res.status(201).json(nuovaCommessa);
  } catch (error) {
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
      });

      // 2. Se è stato fornito un nuovo budget, cancelliamo quello vecchio e creiamo quello nuovo
      if (budget) {
        await tx.budgetVoce.deleteMany({
          where: { commessaId: id },
        });
        await tx.budgetVoce.createMany({
          data: budget.map((voce: any) => ({
            ...voce,
            commessaId: id,
          })),
        });
      }

      return commessaAggiornata;
    });

    res.json(result);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: `Errore nell'eliminazione della commessa ${id}.` });
  }
});

export default router; 