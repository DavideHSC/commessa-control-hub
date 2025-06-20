import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all import templates
router.get('/', async (req, res) => {
    try {
        const templates = await prisma.importTemplate.findMany({
            include: { fields: true },
            orderBy: { nome: 'asc' }
        });
        res.json(templates);
    } catch (error) {
        console.error("Errore nel recupero dei template di importazione:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

// POST a new import template
router.post('/', async (req, res) => {
    const { nome, fields } = req.body;

    if (!nome || !fields) {
        return res.status(400).json({ error: "Il nome e i campi del template sono obbligatori." });
    }

    try {
        const newTemplate = await prisma.importTemplate.create({
            data: {
                nome,
                fields: {
                    create: fields.map((field: any) => ({
                        nomeCampo: field.nomeCampo,
                        start: parseInt(field.start, 10),
                        length: parseInt(field.length, 10),
                        type: field.type,
                        fileIdentifier: field.fileIdentifier || null
                    } as any))
                }
            },
            include: { fields: true }
        });
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error("Errore nella creazione del template:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

// PUT (update) an import template
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, fields } = req.body;

    if (!nome || !fields) {
        return res.status(400).json({ error: "Il nome e i campi del template sono obbligatori." });
    }

    try {
        const updatedTemplate = await prisma.$transaction(async (tx) => {
            // 1. Aggiorna il nome del template
            const template = await tx.importTemplate.update({
                where: { id },
                data: { nome }
            });

            const existingFields = await tx.fieldDefinition.findMany({ where: { templateId: id } });
            const existingFieldIds = new Set(existingFields.map(f => f.id));
            const incomingFieldIds = new Set(fields.map((f: any) => f.id).filter(Boolean));

            // 2. Identifica i campi da eliminare
            const fieldsToDelete = [...existingFieldIds].filter(fieldId => !incomingFieldIds.has(fieldId));
            if (fieldsToDelete.length > 0) {
                await tx.fieldDefinition.deleteMany({
                    where: { id: { in: fieldsToDelete } }
                });
            }

            // 3. Aggiorna o crea i campi
            for (const field of fields) {
                if (field.id && existingFieldIds.has(field.id)) {
                    // Aggiorna campo esistente
                    await tx.fieldDefinition.update({
                        where: { id: field.id },
                        data: {
                            nomeCampo: field.nomeCampo,
                            start: parseInt(field.start, 10),
                            length: parseInt(field.length, 10),
                            type: field.type,
                            fileIdentifier: field.fileIdentifier || null
                        } as any
                    });
                } else {
                    // Crea nuovo campo
                    await tx.fieldDefinition.create({
                        data: {
                            templateId: id,
                            nomeCampo: field.nomeCampo,
                            start: parseInt(field.start, 10),
                            length: parseInt(field.length, 10),
                            type: field.type,
                            fileIdentifier: field.fileIdentifier || null
                        } as any
                    });
                }
            }

            return tx.importTemplate.findUnique({
                where: { id },
                include: { fields: true }
            });
        });

        res.json(updatedTemplate);

    } catch (error) {
        console.error(`Errore nell'aggiornamento del template ${id}:`, error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

// DELETE an import template
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // La cancellazione a cascata è gestita da Prisma in base allo schema
        await prisma.importTemplate.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        console.error(`Errore nella cancellazione del template ${id}:`, error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

export default router; 