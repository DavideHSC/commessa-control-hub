import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

// Tipi incollati per evitare errore rootDir
interface ScritturaContabile {
  id: string;
  data: string; 
  causaleId: string;
  descrizione: string;
  righe: RigaScrittura[];
  datiAggiuntivi?: {
    fornitoreId?: string | null;
    clienteId?: string | null;
    totaleFattura?: number | string;
    aliquotaIva?: number;
  };
}

interface RigaScrittura {
  id: string;
  descrizione: string;
  dare: number;
  avere: number;
  contoId: string;
  allocazioni: Allocazione[];
}

interface Allocazione {
  id: string;
  commessaId: string;
  voceAnaliticaId: string;
  importo: number;
  descrizione?: string;
}


const router = express.Router();
const prisma = new PrismaClient();

// GET all with pagination, search, and sort
router.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '25', 
      search = '',
      sortBy = 'data',
      sortOrder = 'desc',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.ScritturaContabileWhereInput = {
      ...(search && {
        descrizione: { contains: search as string, mode: 'insensitive' }
      }),
      ...(dateFrom && dateTo && {
        data: {
          gte: new Date(dateFrom as string),
          lte: new Date(dateTo as string)
        }
      })
    };

    const orderBy: Prisma.ScritturaContabileOrderByWithRelationInput = {
        [(sortBy as string) || 'data']: (sortOrder as 'asc' | 'desc') || 'desc'
    };

    const [scritture, totalCount] = await prisma.$transaction([
      prisma.scritturaContabile.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { 
          righe: { include: { conto: true, allocazioni: true } },
          fornitore: true
        },
      }),
      prisma.scritturaContabile.count({ where }),
    ]);

    res.json({
      data: scritture,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel caricamento delle scritture' });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
    try {
        const scrittura = await prisma.scritturaContabile.findUnique({
            where: { id: req.params.id },
            include: { righe: { include: { conto: true, allocazioni: true } } },
        });
        if (!scrittura) return res.status(404).json({ error: 'Scrittura non trovata' });
        res.json(scrittura);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel caricamento della scrittura' });
    }
});


// POST (Create)
router.post('/', async (req, res) => {
    const { righe, ...data } = req.body as ScritturaContabile;
    try {
        const nuovaScrittura = await prisma.scritturaContabile.create({
            data: {
                ...data,
                data: new Date(data.data),
                righe: {
                    create: righe.map(riga => ({
                        ...riga,
                        allocazioni: {
                            create: riga.allocazioni || [],
                        }
                    }))
                }
            },
            include: { righe: true }
        });
        res.status(201).json(nuovaScrittura);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nella creazione della scrittura' });
    }
});

// PUT (Update)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { righe, ...data } = req.body as ScritturaContabile;
    try {
        // Transazione per aggiornare: cancella le vecchie righe e crea le nuove
        const updatedScrittura = await prisma.$transaction(async (tx) => {
            await tx.rigaScrittura.deleteMany({ where: { scritturaContabileId: id }});
            
            return tx.scritturaContabile.update({
                where: { id },
                data: {
                    ...data,
                    data: new Date(data.data),
                    righe: {
                        create: righe.map(riga => ({
                            descrizione: riga.descrizione,
                            dare: riga.dare,
                            avere: riga.avere,
                            contoId: riga.contoId,
                            allocazioni: {
                                create: riga.allocazioni || [],
                            }
                        }))
                    }
                },
                 include: { righe: { include: { allocazioni: true }}}
            });
        });
        res.json(updatedScrittura);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nell\'aggiornamento della scrittura' });
    }
});


// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prisma.scritturaContabile.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Errore nell\'eliminazione della scrittura' });
    }
});


export default router; 