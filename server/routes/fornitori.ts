import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = express.Router();
const prisma = new PrismaClient();

// Funzione helper per gestire gli errori Prisma
const isPrismaError = (error: unknown): error is PrismaClientKnownRequestError => {
    return error instanceof PrismaClientKnownRequestError;
};

// GET - Recupera tutti i fornitori con paginazione
router.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
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

    const where: Prisma.FornitoreWhereInput = search ? {
      OR: [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { externalId: { contains: search as string, mode: 'insensitive' } },
        { piva: { contains: search as string, mode: 'insensitive' } },
        { codiceFiscale: { contains: search as string, mode: 'insensitive' } },
      ],
    } : {};

    const orderBy: Prisma.FornitoreOrderByWithRelationInput = {
        [(sortBy as string) || 'nome']: (sortOrder as 'asc' | 'desc') || 'asc'
    };
    
    const [fornitori, totalCount] = await prisma.$transaction([
        prisma.fornitore.findMany({
            where,
            orderBy,
            skip,
            take,
        }),
        prisma.fornitore.count({ where }),
    ]);

    res.json({
        data: fornitori,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });
  } catch (error) {
    console.error('Errore nel recupero dei fornitori:', error);
    res.status(500).json({ error: "Errore durante il recupero dei fornitori." });
  }
});

// --- CRUD Fornitori ---
router.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { nome, externalId } = req.body;
    if (!nome) {
      res.status(400).json({ error: 'Il nome è obbligatorio' });
      return;
    }
    const nuovoFornitore = await prisma.fornitore.create({ 
      data: {
        nome,
        externalId
      }
    });
    res.status(201).json(nuovoFornitore);
  } catch (error) {
    console.error('Errore nella creazione del fornitore:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Un fornitore con questa P.IVA o nome esiste già.' });
      return;
    }
    res.status(500).json({ error: "Errore durante la creazione del fornitore." });
  }
});

router.put('/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { nome, externalId } = req.body;
    if (!nome) {
      res.status(400).json({ error: 'Il nome è obbligatorio' });
      return;
    }
    const fornitoreAggiornato = await prisma.fornitore.update({
      where: { id: req.params.id },
      data: {
        nome,
        externalId
      },
    });
    res.json(fornitoreAggiornato);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del fornitore:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        res.status(404).json({ error: 'Fornitore non trovato.' });
        return;
    }
    res.status(500).json({ error: "Errore durante l'aggiornamento del fornitore." });
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    await prisma.fornitore.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
          res.status(404).json({ error: 'Fornitore non trovato.' });
          return;
      }
      if (error.code === 'P2003') {
        res.status(409).json({ error: 'Impossibile eliminare il fornitore perché è utilizzato in una o più registrazioni.' });
        return;
      }
    }
    console.error('Errore nell\'eliminazione del fornitore:', error);
    res.status(500).json({ error: "Errore durante l'eliminazione del fornitore." });
  }
});

export default router; 