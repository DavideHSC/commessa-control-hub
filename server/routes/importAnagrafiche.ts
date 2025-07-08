import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, parseFixedWidthRobust, FieldDefinition, ImportStats } from '../lib/fixedWidthParser';
import * as decoders from '../lib/businessDecoders';
import moment from 'moment';
import { handleCodiciIvaImport } from '../lib/importers/codiciIvaImporter';
import { handleCausaliImport } from '../lib/importers/causaliImporter';
import { AnagraficaCliForRecord, handleAnagraficaCliForImport } from '../lib/importers/anagraficaCliForImporter';
import { processCondizioniPagamento } from '../lib/importers/condizioniPagamentoImporter';
import { executeAnagraficheImportWorkflow } from '../import-engine/orchestration/workflows/importAnagraficheWorkflow';

const router = express.Router();

// Definiamo un'interfaccia base per i dati parsati
interface ParsedRecord {
  [key: string]: string;
}

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
        // === NUOVA LOGICA WORKFLOW PER ANAGRAFICA ===
        if (templateName === 'anagrafica_clifor') {
            console.log(`[IMPORT] Avvio nuovo workflow per anagrafica_clifor...`);
            const result = await executeAnagraficheImportWorkflow(fileContent, templateName);
            
            if (result.success) {
                return res.status(200).json({
                    message: "Importazione anagrafiche completata con successo tramite workflow.",
                    stats: result.stats,
                    anagraficheStats: result.anagraficheStats,
                    errors: result.errors
                });
            } else {
                return res.status(500).json({
                    message: "Errore durante l'importazione anagrafiche tramite workflow.",
                    error: result.message,
                    stats: result.stats,
                    errors: result.errors
                });
            }
        }
        
        // --- VECCHIA LOGICA (mantenuta per altri template) ---

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
                    fieldName: field.fieldName!,
                    start: field.start,
                    length: field.length,
                    end: field.end, // Assicurati che 'end' sia incluso
                    type: fieldType
                };
            });

        const parsedData = parseFixedWidth<ParsedRecord>(fileContent, templateFields);
        console.log(`[IMPORT] Parsing completato. Numero di record estratti: ${parsedData.length}`);
        
        if (templateName === 'causali') {
            await handleCausaliImport(parsedData, res);
        } else if (templateName === 'codici_iva') {
            await handleCodiciIvaImport(parsedData, res);
        } else if (templateName === 'anagrafica_clifor') {
            // QUESTO BLOCCO NON VERRA' MAI ESEGUITO GRAZIE AL CONTROLLO PRECEDENTE
            await handleAnagraficaCliForImport(parsedData as AnagraficaCliForRecord[], res);
        } else if (templateName === 'condizioni_pagamento') {
            const stats: ImportStats = {
                totalRecords: parsedData.length,
                successfulRecords: 0,
                errorRecords: 0,
                inserted: 0,
                updated: 0,
                skipped: 0,
                warnings: [],
                errors: []
            };
            await processCondizioniPagamento(parsedData as ParsedRecord[], stats);
            res.status(200).json({
                message: "Importazione completata",
                stats
            });
        } else {
            return res.status(400).json({ error: `Gestore per il template '${templateName}' non implementato.` });
        }

    } catch (error) {
        console.error(`[IMPORT] Errore fatale durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: `Errore durante l'importazione di ${templateName}.` });
    }
});



export default router;