import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// GET all import templates
router.get('/', async (req, res) => {
    const { page = 1, limit = 5, search = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ImportTemplateWhereInput = search
        ? {
            OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
            ],
        }
        : {};

    try {
        const [templates, totalCount] = await prisma.$transaction([
            prisma.importTemplate.findMany({
                where,
                orderBy: {
                    name: 'asc',
                },
                skip,
                take: limitNum,
                include: {
                    fieldDefinitions: true,
                },
            }),
            prisma.importTemplate.count({ where }),
        ]);

        res.json({
            data: templates,
            totalPages: Math.ceil(totalCount / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        console.error('Errore nel recupero dei template di importazione:', error);
        res.status(500).json({ error: 'Impossibile recuperare i template' });
    }
});

// GET a specific import template
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const template = await prisma.importTemplate.findUnique({
            where: { id },
            include: {
                fieldDefinitions: true,
            },
        });
        if (template) {
            res.json(template);
        } else {
            res.status(404).json({ error: 'Template non trovato' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Impossibile recuperare il template' });
    }
});

// POST a new import template
router.post('/', async (req, res) => {
    const { name, modelName, fileIdentifier, fieldDefinitions } = req.body;
    try {
        const newTemplate = await prisma.importTemplate.create({
            data: {
                name,
                modelName,
                fileIdentifier,
                fieldDefinitions: {
                    create: fieldDefinitions,
                },
            },
            include: {
                fieldDefinitions: true,
            },
        });
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error("Errore durante la creazione del template:", error);
        res.status(500).json({ error: 'Impossibile creare il template' });
    }
});

// PUT (update) an import template
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, modelName, fileIdentifier, fieldDefinitions } = req.body;
    try {
        // Prima cancella le definizioni dei campi esistenti
        await prisma.fieldDefinition.deleteMany({
            where: { templateId: id },
        });
        
        // Poi aggiorna il template e crea le nuove definizioni
        const updatedTemplate = await prisma.importTemplate.update({
            where: { id },
            data: {
                name,
                modelName,
                fileIdentifier,
                fieldDefinitions: {
                    create: fieldDefinitions,
                },
            },
            include: {
                fieldDefinitions: true,
            },
        });
        res.json(updatedTemplate);
    } catch (error) {
        console.error("Errore durante l'aggiornamento del template:", error);
        res.status(500).json({ error: 'Impossibile aggiornare il template' });
    }
});

// DELETE an import template
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Assicuriamoci che prima vengano cancellate le definizioni dei campi dipendenti
        await prisma.fieldDefinition.deleteMany({
            where: { templateId: id },
        });

        // Ora cancella il template
        await prisma.importTemplate.delete({
            where: { id },
        });

        res.status(204).send(); // 204 No Content è una risposta standard per un DELETE andato a buon fine
    } catch (error) {
        console.error("Errore durante l'eliminazione del template:", error);
        res.status(500).json({ error: 'Impossibile eliminare il template' });
    }
});

export default router; 