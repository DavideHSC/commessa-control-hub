import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Recupera tutti i codici IVA
router.get('/', async (req, res) => {
  try {
    const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'id',
        sortOrder = 'asc'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.CodiceIvaWhereInput = search ? {
        OR: [
            { id: { contains: search as string, mode: 'insensitive' } },
            { descrizione: { contains: search as string, mode: 'insensitive' } },
            { externalId: { contains: search as string, mode: 'insensitive' } },
        ],
    } : {};

    const orderBy: Prisma.CodiceIvaOrderByWithRelationInput = {
        [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [codiciIva, totalCount] = await prisma.$transaction([
        prisma.codiceIva.findMany({
            where,
            orderBy,
            skip,
            take,
        }),
        prisma.codiceIva.count({ where }),
    ]);

    res.json({
        data: codiciIva,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });
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