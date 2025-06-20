import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all conti
router.get('/', async (req, res) => {
  try {
    const conti = await prisma.conto.findMany();
    res.json(conti);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei conti.' });
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