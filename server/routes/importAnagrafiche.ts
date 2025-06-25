import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, parseFixedWidthRobust, FieldDefinition, ImportStats } from '../lib/fixedWidthParser';
import * as decoders from '../lib/businessDecoders';
import moment from 'moment';
import { handleCodiciIvaImport } from '../lib/importers/codiciIvaImporter';
import { handleCausaliImport } from '../lib/importers/causaliImporter';
import { handlePianoDeiContiImport } from '../lib/importers/pianoDeiContiImporter';
import { handleAnagraficaCliForImport } from '../lib/importers/anagraficaCliForImporter';

const router = express.Router();

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });


router.post('/:templateName', upload.single('file'), async (req: Request, res: Response) => {
    const { templateName } = req.params;
    console.log(`[IMPORT] Ricevuta richiesta per il template: ${templateName}`);

    if (!req.file) {
        console.error('[IMPORT] Errore: File non trovato nella richiesta.');
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    
    const file = req.file;
    const fileContent = file.buffer.toString('latin1');
    console.log(`[IMPORT] Ricevuto file: ${file.originalname}, dimensione: ${file.size} bytes`);
    
    try {
        const importTemplate = await prisma.importTemplate.findUnique({
            where: { name: templateName },
            include: { fieldDefinitions: true },
        });

        if (!importTemplate) {
            console.error(`[IMPORT] Errore: Template '${templateName}' non trovato nel database.`);
            return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
        }
        
        console.log(`[IMPORT] Trovato template '${importTemplate.name}' con ${importTemplate.fieldDefinitions.length} campi definiti.`);

        const templateFields = importTemplate.fieldDefinitions
            .filter(field => !!field.fieldName)
            .map(field => {
                let fieldType: 'string' | 'number' | 'date' | 'boolean' = 'string';
                if (field.format?.startsWith('date')) {
                    fieldType = 'date';
                } else if (field.format?.includes('number') || field.format?.includes('percentage')) {
                    fieldType = 'number';
                }

                return {
                    name: field.fieldName!,
                    start: field.start,
                    length: field.length,
                    type: fieldType
                };
            });

        const parsedData = parseFixedWidth(fileContent, templateFields);
        console.log(`[IMPORT] Parsing completato. Numero di record estratti: ${parsedData.length}`);
        
        if (templateName === 'piano_dei_conti') {
            await handlePianoDeiContiImport(parsedData, res);
        } else if (templateName === 'causali') {
            await handleCausaliImport(parsedData, res);
        } else if (templateName === 'codici_iva') {
            await handleCodiciIvaImport(parsedData, res);
        } else if (templateName === 'anagrafica_clifor') {
            await handleAnagraficaCliForImport(parsedData, res);
        } else {
            return res.status(400).json({ error: `Gestore per il template '${templateName}' non implementato.` });
        }

    } catch (error) {
        console.error(`[IMPORT] Errore fatale durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: `Errore durante l'importazione di ${templateName}.` });
    }
});



export default router;