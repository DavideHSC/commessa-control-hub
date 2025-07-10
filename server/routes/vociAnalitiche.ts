import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all voci analitiche con i conti associati
router.get('/', async (req, res) => {
  try {
    const voci = await prisma.voceAnalitica.findMany({
      include: {
        conti: {
          select: {
            id: true,
            codice: true,
            nome: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.json(voci);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero delle voci analitiche." });
  }
});

// POST create a new voce analitica
router.post('/', async (req, res) => {
  const { nome, descrizione, tipo, contiIds } = req.body;
  if (!nome || !tipo) {
    return res.status(400).json({ error: "Nome e tipo sono obbligatori." });
  }

  try {
    const nuovaVoce = await prisma.voceAnalitica.create({
      data: {
        nome,
        descrizione,
        tipo,
        conti: {
          connect: contiIds?.map((id: string) => ({ id })) || [],
        },
      },
    });
    res.status(201).json(nuovaVoce);
  } catch (error) {
    res.status(500).json({ error: "Errore nella creazione della voce analitica." });
  }
});

// PUT update a voce analitica and its conti mapping
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descrizione, tipo, contiIds } = req.body;

  try {
    const voceAggiornata = await prisma.voceAnalitica.update({
      where: { id },
      data: {
        nome,
        descrizione,
        tipo,
        conti: {
          set: contiIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        conti: {
          select: { id: true, codice: true, nome: true },
        },
      },
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