import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all staging conti with pagination, search, and sort
router.get('/conti', async (req, res) => {
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

    const where: Prisma.StagingContoWhereInput = search ? {
      OR: [
        { codice: { contains: search as string, mode: 'insensitive' } },
        { descrizione: { contains: search as string, mode: 'insensitive' } },
        { codiceFiscaleAzienda: { contains: search as string, mode: 'insensitive' } },
      ],
    } : {};

    const orderBy: Prisma.StagingContoOrderByWithRelationInput = {
        [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [conti, totalCount] = await prisma.$transaction([
      prisma.stagingConto.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.stagingConto.count({ where }),
    ]);

    res.json({
      data: conti,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei conti di staging.' });
  }
});

// GET all staging scritture (testate) with pagination, search, and sort
router.get('/scritture', async (req, res) => {
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

    const where: Prisma.StagingTestataWhereInput = search ? {
      OR: [
        { codiceUnivocoScaricamento: { contains: search as string, mode: 'insensitive' } },
        { descrizioneCausale: { contains: search as string, mode: 'insensitive' } },
        { documentoNumero: { contains: search as string, mode: 'insensitive' } },
      ],
    } : {};

    const orderBy: Prisma.StagingTestataOrderByWithRelationInput = {
        [(sortBy as string) || 'id']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [testate, totalCount] = await prisma.$transaction([
      prisma.stagingTestata.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.stagingTestata.count({ where }),
    ]);

    res.json({
      data: testate,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero delle testate di staging.' });
  }
});

export default router; 