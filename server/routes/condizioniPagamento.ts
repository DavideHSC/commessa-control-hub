import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Recupera tutte le condizioni di pagamento
router.get('/', async (req, res) => {
  try {
    const condizioniPagamento = await prisma.condizionePagamento.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    res.json(condizioniPagamento);
  } catch (error) {
    console.error('Errore nel caricamento delle condizioni di pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST - Crea una nuova condizione di pagamento
router.post('/', async (req, res) => {
  try {
    const { id, descrizione, externalId } = req.body;
    
    const condizionePagamento = await prisma.condizionePagamento.create({
      data: {
        id,
        descrizione,
        externalId: externalId || null,
      }
    });
    
    res.status(201).json(condizionePagamento);
  } catch (error) {
    console.error('Errore nella creazione della condizione di pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PUT - Aggiorna una condizione di pagamento esistente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descrizione, externalId } = req.body;
    
    const condizionePagamento = await prisma.condizionePagamento.update({
      where: { id },
      data: {
        descrizione,
        externalId: externalId || null,
      }
    });
    
    res.json(condizionePagamento);
  } catch (error) {
    console.error('Errore nell\'aggiornamento della condizione di pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// DELETE - Elimina una condizione di pagamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.condizionePagamento.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Errore nell\'eliminazione della condizione di pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router; 