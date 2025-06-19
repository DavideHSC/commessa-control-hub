import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = express.Router();
const prisma = new PrismaClient();

// Funzione helper per gestire gli errori Prisma
const isPrismaError = (error: unknown): error is PrismaClientKnownRequestError => {
    return error instanceof PrismaClientKnownRequestError;
};

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