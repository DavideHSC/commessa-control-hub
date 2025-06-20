import express, { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = Router();
const prisma = new PrismaClient();

// Funzione helper per gestire gli errori Prisma
const isPrismaError = (error: unknown): error is PrismaClientKnownRequestError => {
    return error instanceof PrismaClientKnownRequestError;
};

// GET - Recupera tutti i clienti
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const clienti = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(clienti);
  } catch (error) {
    console.error('Errore nel recupero dei clienti:', error);
    res.status(500).json({ error: "Errore durante il recupero dei clienti." });
  }
});

// --- CRUD Clienti ---
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, externalId } = req.body;
    if (!nome) {
      res.status(400).json({ error: 'Il nome è obbligatorio' });
      return;
    }
    const nuovoCliente = await prisma.cliente.create({
      data: {
        nome,
        externalId,
      },
    });
    res.status(201).json(nuovoCliente);
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Un cliente con questa P.IVA o nome esiste già.' });
      return;
    }
    res.status(500).json({ error: "Errore durante la creazione del cliente." });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, externalId } = req.body;
    if (!nome) {
      res.status(400).json({ error: 'Il nome è obbligatorio' });
      return;
    }
    const clienteAggiornato = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        externalId,
      },
    });
    res.json(clienteAggiornato);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del cliente:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        res.status(404).json({ error: 'Cliente non trovato.' });
        return;
    }
    res.status(500).json({ error: "Errore durante l'aggiornamento del cliente." });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
          res.status(404).json({ error: 'Cliente non trovato.' });
          return;
      }
      if (error.code === 'P2003') {
        res.status(409).json({ error: 'Impossibile eliminare il cliente perché è associato ad almeno una commessa.' });
        return;
      }
    }
    console.error('Errore nell\'eliminazione del cliente:', error);
    res.status(500).json({ error: "Errore durante l'eliminazione del cliente." });
  }
});

export default router; 