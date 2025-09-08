import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { 
  validateCommessaHierarchy, 
  validateBudgetVsAllocazioni,
  validateCommessaDeletion,
  validateCommessaUpdate
} from '../import-engine/core/validations/businessValidations.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET all commesse with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '25', 
      search = '',
      sortBy = 'nome',
      sortOrder = 'asc',
      active
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.CommessaWhereInput = {
      ...(search ? {
        OR: [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { descrizione: { contains: search as string, mode: 'insensitive' } },
          { cliente: { nome: { contains: search as string, mode: 'insensitive' } } },
          { parent: { nome: { contains: search as string, mode: 'insensitive' } } },
        ],
      } : {}),
      ...(active === 'true' ? { isAttiva: true } : {}),
    };

    const orderBy: Prisma.CommessaOrderByWithRelationInput = {
        [(sortBy as string) || 'nome']: (sortOrder as 'asc' | 'desc') || 'asc'
    };

    const [commesse, totalCount] = await prisma.$transaction([
      prisma.commessa.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { 
          cliente: true, 
          budget: true,
          parent: true,
          children: true
        }
      }),
      prisma.commessa.count({ where })
    ]);
    
    res.json({
        data: commesse,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Errore nel recupero delle commesse.' });
  }
});

// POST a new commessa
router.post('/', async (req, res) => {
  try {
    const { budget, parentId, ...commessaData } = req.body;
    
    // Per le nuove commesse, la validazione gerarchia è più semplice
    // Basta verificare che il parent esista (se specificato)
    if (parentId) {
      const parentExists = await prisma.commessa.findUnique({
        where: { id: parentId },
        select: { id: true }
      });
      
      if (!parentExists) {
        return res.status(400).json({ 
          error: 'Commessa parent non trovata',
          validationErrors: ['Parent ID non valido'] 
        });
      }
    }

    const nuovaCommessa = await prisma.commessa.create({
      data: {
        ...commessaData,
        parentId,
        budget: {
          create: budget || [], // budget è un array di BudgetVoce
        }
      },
      include: {
        cliente: true,
        parent: true,
        children: true,
        budget: true,
      }
    });
    
    res.status(201).json(nuovaCommessa);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione della commessa.' });
  }
});

// PUT update a commessa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { budget, cliente, ...commessaData } = req.body;
    
    // GESTIONE BUDGET: Converte numero singolo in array BudgetVoce se necessario
    let budgetArray = null;
    console.log(`[Commesse API] Processing budget for commessa ${id}:`, budget, typeof budget);
    
    if (budget !== undefined) {
      if (typeof budget === 'number') {
        // Budget singolo dal form semplice: creiamo una voce generica
        const vociGeneriche = await prisma.voceAnalitica.findMany({
          where: { tipo: 'costo', isAttiva: true },
          take: 1
        });
        
        console.log(`[Commesse API] Found voci analitiche:`, vociGeneriche.length);
        
        if (vociGeneriche.length > 0) {
          budgetArray = [{
            voceAnaliticaId: vociGeneriche[0].id,
            importo: budget
          }];
          console.log(`[Commesse API] Created budget array:`, budgetArray);
        } else {
          // Se non ci sono voci analitiche, creiamone una di default
          console.log(`[Commesse API] No voci analitiche found, creating default one`);
          const defaultVoce = await prisma.voceAnalitica.create({
            data: {
              nome: 'Budget Generale',
              tipo: 'costo',
              descrizione: 'Voce analitica generica per budget',
              isAttiva: true
            }
          });
          
          budgetArray = [{
            voceAnaliticaId: defaultVoce.id,
            importo: budget
          }];
          console.log(`[Commesse API] Created default voce and budget array:`, budgetArray);
        }
      } else if (Array.isArray(budget)) {
        // Budget complesso (array di BudgetVoce): usa logica esistente
        budgetArray = budget;
        console.log(`[Commesse API] Using existing budget array:`, budgetArray);
      }
    } else {
      console.log(`[Commesse API] Budget is undefined, skipping budget update`);
    }
    
    // VALIDAZIONI BUSINESS CRITICHE
    console.log(`[Commesse API] Validating update for commessa ${id}...`);
    
    const validationData = {
      parentId: commessaData.parentId,
      budget: budgetArray ? budgetArray.map((b: any) => ({
        voceAnaliticaId: b.voceAnaliticaId,
        budgetPrevisto: b.importo || b.budgetPrevisto || 0
      })) : undefined
    };
    
    const validationResult = await validateCommessaUpdate(prisma, id, validationData);
    
    if (!validationResult.isValid) {
      console.log(`[Commesse API] Validation failed: ${validationResult.error}`);
      return res.status(400).json({ 
        error: validationResult.error,
        validationErrors: [validationResult.error]
      });
    }
    
    // Log warnings se presenti
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn(`[Commesse API] Validation warnings:`, validationResult.warnings);
    }
    
    // Iniziamo una transazione per aggiornare la commessa e il suo budget
    const result = await prisma.$transaction(async (tx) => {
      // 1. Aggiorna i dati base della commessa
      const commessaAggiornata = await tx.commessa.update({
        where: { id },
        data: commessaData,
        include: {
          cliente: true,
          parent: true,
          children: true,
          budget: true,
        }
      });

      // 2. Se è stato fornito un nuovo budget, cancelliamo quello vecchio e creiamo quello nuovo
      if (budgetArray) {
        console.log(`[Commesse API] Deleting existing budget for commessa ${id}`);
        await tx.budgetVoce.deleteMany({
          where: { commessaId: id },
        });
        
        const budgetData = budgetArray.map((voce: any) => ({
          voceAnaliticaId: voce.voceAnaliticaId,
          importo: voce.importo || voce.budgetPrevisto || 0,
          commessaId: id,
        }));
        
        console.log(`[Commesse API] Creating new budget:`, budgetData);
        await tx.budgetVoce.createMany({
          data: budgetData,
        });
        console.log(`[Commesse API] Budget created successfully for commessa ${id}`);
      } else {
        console.log(`[Commesse API] No budget update for commessa ${id}`);
      }

      return commessaAggiornata;
    });

    // Includi warnings nella response se presenti
    const response = {
      ...result,
      validationWarnings: validationResult.warnings
    };

    console.log(`[Commesse API] Update successful for commessa ${id}. Returning:`, {
      id: response.id,
      nome: response.nome,
      budget: response.budget?.length ? response.budget.map(b => ({ voceAnaliticaId: b.voceAnaliticaId, importo: b.importo })) : 'No budget'
    });
    res.json(response);
  } catch (error: unknown) {
    console.error(`[Commesse API] Update error for commessa ${id}:`, error);
    res.status(500).json({ error: `Errore nell'aggiornamento della commessa ${id}.` });
  }
});

// DELETE a commessa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // VALIDAZIONI BUSINESS per eliminazione
    console.log(`[Commesse API] Validating deletion for commessa ${id}...`);
    
    const validationResult = await validateCommessaDeletion(prisma, id);
    
    if (!validationResult.isValid) {
      console.log(`[Commesse API] Deletion validation failed: ${validationResult.error}`);
      return res.status(400).json({ 
        error: validationResult.error,
        validationErrors: [validationResult.error]
      });
    }
    
    // La cancellazione a cascata dovrebbe gestire il budget associato
    await prisma.commessa.delete({
      where: { id },
    });
    
    console.log(`[Commesse API] Deletion successful for commessa ${id}`);
    res.status(204).send();
  } catch (error: unknown) {
    console.error(`[Commesse API] Deletion error for commessa ${id}:`, error);
    res.status(500).json({ error: `Errore nell'eliminazione della commessa ${id}.` });
  }
});

// GET all commesse for select inputs
router.get('/select', async (req, res) => {
  try {
    const { active } = req.query;
    
    const commesse = await prisma.commessa.findMany({
      where: active === 'true' ? { isAttiva: true } : {},
      select: {
        id: true,
        nome: true,
        isAttiva: true,
        cliente: {
          select: {
            nome: true,
          },
        },
        stato: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.json(commesse);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero delle commesse per la selezione.' });
  }
});

export default router; 