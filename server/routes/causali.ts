import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Recupera tutte le causali contabili
router.get('/', async (req, res) => {
  try {
    const { 
        page = '1', 
        limit = '25', 
        search = '',
        sortBy = 'descrizione',
        sortOrder = 'asc',
        all = 'false'
    } = req.query;

    if (all === 'true') {
        const causali = await prisma.causaleContabile.findMany({
            orderBy: { [(sortBy as string) || 'descrizione']: (sortOrder as 'asc' | 'desc') || 'asc' }
        });
        return res.json({ data: causali, pagination: { total: causali.length } });
    }

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.CausaleContabileWhereInput = search ? {
        OR: [
            { descrizione: { contains: search as string, mode: 'insensitive' } },
            { nome: { contains: search as string, mode: 'insensitive' } },
        ],
    } : {};

    const orderBy: Prisma.CausaleContabileOrderByWithRelationInput = {
        [(sortBy as string) || 'descrizione']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [causali, totalCount] = await prisma.$transaction([
        prisma.causaleContabile.findMany({
            where,
            orderBy,
            skip,
            take,
        }),
        prisma.causaleContabile.count({ where }),
    ]);
    
    res.json({
        data: causali,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });

  } catch (error) {
    console.error('Errore nel caricamento delle causali contabili:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST - Crea una nuova causale contabile
router.post('/', async (req, res) => {
  try {
    const causaleData = req.body;
    
    const causale = await prisma.causaleContabile.create({
      data: causaleData
    });
    
    res.status(201).json(causale);
  } catch (error) {
    console.error('Errore nella creazione della causale contabile:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// PUT - Aggiorna una causale contabile esistente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const causale = await prisma.causaleContabile.update({
      where: { id },
      data: updateData
    });
    
    res.json(causale);
  } catch (error) {
    console.error('Errore nell\'aggiornamento della causale contabile:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// DELETE - Elimina una causale contabile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.causaleContabile.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Errore nell\'eliminazione della causale contabile:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router;