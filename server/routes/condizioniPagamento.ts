import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET - Recupera tutte le condizioni di pagamento
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

    const where: Prisma.CondizionePagamentoWhereInput = search ? {
        OR: [
            { id: { contains: search as string, mode: 'insensitive' } },
            { descrizione: { contains: search as string, mode: 'insensitive' } },
            { externalId: { contains: search as string, mode: 'insensitive' } },
        ],
    } : {};

    const orderBy: Prisma.CondizionePagamentoOrderByWithRelationInput = {
        [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
    };
    
    const [condizioniPagamento, totalCount] = await prisma.$transaction([
        prisma.condizionePagamento.findMany({
            where,
            orderBy,
            skip,
            take,
        }),
        prisma.condizionePagamento.count({ where }),
    ]);
    
    res.json({
        data: condizioniPagamento,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });
  } catch (error) {
    console.error('Errore nel caricamento delle condizioni di pagamento:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST - Crea una nuova condizione di pagamento
router.post('/', async (req, res) => {
  try {
    const { id, codice, descrizione, externalId } = req.body;
    
    const condizionePagamento = await prisma.condizionePagamento.create({
      data: {
        id,
        codice,
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