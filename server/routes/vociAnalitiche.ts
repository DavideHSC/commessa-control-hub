import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all voci analitiche con paginazione, ricerca e ordinamento
router.get('/', async (req, res) => {
  const { page = 1, limit = 5, sortBy = 'nome', sortOrder = 'asc', search, active } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  const where: Prisma.VoceAnaliticaWhereInput = {
    ...(search ? {
      OR: [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { descrizione: { contains: search as string, mode: 'insensitive' } },
        { tipo: { contains: search as string, mode: 'insensitive' } },
      ],
    } : {}),
    ...(active === 'true' ? { isAttiva: true } : {}),
  };

  try {
    const [voci, total] = await prisma.$transaction([
      prisma.voceAnalitica.findMany({
        where,
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
          [sortBy as string]: sortOrder,
        },
        skip: offset,
        take: limitNumber,
      }),
      prisma.voceAnalitica.count({ where }),
    ]);

    res.json({
      data: voci,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: unknown) {
    console.error("Errore nel recupero delle voci analitiche:", error);
    res.status(500).json({ error: "Errore nel recupero delle voci analitiche." });
  }
});

// Create a new Voce Analitica
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
       include: {
         conti: {
           select: { id: true, codice: true, nome: true },
         },
       },
    });
    res.status(201).json(nuovaVoce);
  } catch (error: unknown) {
    res.status(500).json({ error: "Errore nella creazione della voce analitica." });
  }
});

// Update a Voce Analitica
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
  } catch (error: unknown) {
    res.status(500).json({ error: `Errore nell'aggiornamento della voce analitica ${id}.` });
  }
});

// GET all Voci Analitiche for select inputs
router.get('/select', async (req, res) => {
  try {
    const voci = await prisma.voceAnalitica.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.json(voci);
  } catch (error: unknown) {
    console.error('Errore nel recupero delle voci analitiche per la selezione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// GET a single Voce Analitica by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const voce = await prisma.voceAnalitica.findUnique({
      where: { id },
      include: {
        conti: {
          select: { id: true, codice: true, nome: true },
        },
      },
    });
    if (!voce) {
      return res.status(404).json({ error: `Voce analitica con ID ${id} non trovata.` });
    }
    res.json(voce);
  } catch (error: unknown) {
    res.status(500).json({ error: `Errore nel recupero della voce analitica ${id}.` });
  }
});


// DELETE a voce analitica
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.voceAnalitica.delete({ where: { id } });
    res.status(204).send();
  } catch (error: unknown) {
    res.status(500).json({ error: `Errore nell'eliminazione della voce analitica ${id}` });
  }
});


export default router; 