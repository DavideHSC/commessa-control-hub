import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '25', 
      search = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.ImportTemplateWhereInput = search ? {
        OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
        ],
    } : {};

    const orderBy: Prisma.ImportTemplateOrderByWithRelationInput = {
        [(sortBy as string)]: (sortOrder as 'asc' | 'desc')
    };

    const [templates, totalCount] = await prisma.$transaction([
      prisma.importTemplate.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          fieldDefinitions: true,
        },
      }),
      prisma.importTemplate.count({ where }),
    ]);

    res.json({
      data: templates,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Errore nel recupero dei template di importazione:", error);
    res.status(500).json({ error: "Errore nel recupero dei template di importazione" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, fieldDefinitions } = req.body;
    const newTemplate = await prisma.importTemplate.create({
      data: {
        name,
        fieldDefinitions: {
          create: fieldDefinitions,
        },
      },
      include: {
        fieldDefinitions: true,
      }
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Errore nella creazione del template di importazione:", error);
    res.status(500).json({ error: "Errore nella creazione del template di importazione" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { name, fieldDefinitions } = req.body;

    // Transazione per aggiornare il template e i suoi campi
    const updatedTemplate = await prisma.$transaction(async (prisma) => {
      // 1. Aggiorna il nome del template
      const template = await prisma.importTemplate.update({
        where: { id },
        data: { name },
      });

      // 2. Elimina le vecchie definizioni dei campi
      await prisma.fieldDefinition.deleteMany({
        where: { templateId: id },
      });

      // 3. Crea le nuove definizioni dei campi
      await prisma.fieldDefinition.createMany({
        data: fieldDefinitions.map((field: any) => ({
          ...field,
          templateId: id,
        })),
      });

      return template;
    });

    const finalTemplate = await prisma.importTemplate.findUnique({
        where: { id },
        include: { fieldDefinitions: true },
    });

    res.json(finalTemplate);
  } catch (error) {
    console.error(`Errore nell'aggiornamento del template ${id}:`, error);
    res.status(500).json({ error: `Errore nell'aggiornamento del template ${id}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.importTemplate.delete({
      where: { id },
    });
    res.json({ message: "Template eliminato con successo" });
  } catch (error) {
    console.error(`Errore nell'eliminazione del template ${id}:`, error);
    res.status(500).json({ error: `Errore nell'eliminazione del template ${id}` });
  }
});

export default router; 