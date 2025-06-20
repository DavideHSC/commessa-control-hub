import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all voci analitiche
router.get('/', async (req, res) => {
  try {
    const vociAnalitiche = await prisma.voceAnalitica.findMany();
    res.json(vociAnalitiche);
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