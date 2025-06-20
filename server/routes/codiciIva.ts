import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Recupera tutti i codici IVA
router.get('/', async (req, res) => {
  try {
    const codiciIva = await prisma.codiceIva.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    res.json(codiciIva);
  } catch (error) {
    console.error('Errore nel caricamento dei codici IVA:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST - Crea un nuovo codice IVA
router.post('/', async (req, res) => {
  try {
    const { id, descrizione, aliquota, externalId } = req.body;
    
    const codiceIva = await prisma.codiceIva.create({
      data: {
        id,
        descrizione,
        aliquota: parseFloat(aliquota),
        externalId: externalId || null,
      }
    });
    
    res.status(201).json(codiceIva);
  } catch (error) {
    console.error('Errore nella creazione del codice IVA:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PUT - Aggiorna un codice IVA esistente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descrizione, aliquota, externalId } = req.body;
    
    const codiceIva = await prisma.codiceIva.update({
      where: { id },
      data: {
        descrizione,
        aliquota: parseFloat(aliquota),
        externalId: externalId || null,
      }
    });
    
    res.json(codiceIva);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del codice IVA:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// DELETE - Elimina un codice IVA
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.codiceIva.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Errore nell\'eliminazione del codice IVA:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router; 