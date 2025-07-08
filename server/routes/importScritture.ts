import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, FieldDefinition } from '../lib/fixedWidthParser';
import { IAllocazione, IRigaContabile, IRigaIva, ITestata, processScrittureInBatches } from '../lib/importUtils.js';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('files', 10), async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    
    const files = req.files as Express.Multer.File[];

    try {
        // 1. Recupera il template di importazione per le scritture contabili
        const importTemplate = await prisma.importTemplate.findFirst({
            where: { modelName: 'scritture_contabili' },
            include: { fieldDefinitions: true },
        });

        if (!importTemplate || !importTemplate.fieldDefinitions) {
            return res.status(404).json({ error: "Template 'scritture_contabili' non trovato o non configurato." });
        }
        
        // 2. Raggruppa le definizioni per fileIdentifier
        const definitionsByFile = importTemplate.fieldDefinitions.reduce((acc, field) => {
            if (field.fileIdentifier) {
                if (!acc[field.fileIdentifier]) {
                    acc[field.fileIdentifier] = [];
                }
                acc[field.fileIdentifier].push({
                    fieldName: field.fieldName || '',
                    start: field.start,
                    length: field.length,
                    type: (field.format || 'string') as 'string' | 'number' | 'date',
                });
            }
            return acc;
        }, {} as Record<string, FieldDefinition[]>);

        // 3. Associa i file caricati alle loro definizioni
        const filesByDefinition = Object.keys(definitionsByFile).reduce((acc, key) => {
            const file = files.find(f => f.originalname === key);
            if (file) {
                acc[key] = {
                    file,
                    definitions: definitionsByFile[key]
                };
            }
            return acc;
        }, {} as Record<string, { file: Express.Multer.File, definitions: FieldDefinition[] }>);

        console.log('File trovati e associati:', Object.keys(filesByDefinition));

        // VERIFICA: Assicurarsi che tutti i file necessari siano presenti
        const requiredFiles = ['PNTESTA.TXT', 'PNRIGCON.TXT']; // PNRIGANA.TXT è opzionale
        for (const requiredFile of requiredFiles) {
            if (!filesByDefinition[requiredFile]) {
                return res.status(400).json({ error: `File mancante: ${requiredFile} è richiesto per questa importazione.` });
            }
        }

        // 4. Esegui il parsing per ogni file
        const testate = parseFixedWidth<ITestata>(filesByDefinition['PNTESTA.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNTESTA.TXT'].definitions);
        const righeContabili = parseFixedWidth<IRigaContabile>(filesByDefinition['PNRIGCON.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNRIGCON.TXT'].definitions);
        
        let righeIva: IRigaIva[] = [];
        if (filesByDefinition['PNRIGIVA.TXT']) {
            righeIva = parseFixedWidth<IRigaIva>(filesByDefinition['PNRIGIVA.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNRIGIVA.TXT'].definitions);
        }

        let allocazioni: IAllocazione[] = [];
        if (filesByDefinition['MOVANAC.TXT']) {
            allocazioni = parseFixedWidth<IAllocazione>(filesByDefinition['MOVANAC.TXT'].file.buffer.toString('utf-8'), filesByDefinition['MOVANAC.TXT'].definitions);
        }

        // 5. Salva i dati in una transazione
        const summary = await processScrittureInBatches({ testate, righeContabili, righeIva, allocazioni });

        return res.status(200).json({ 
            message: `Importazione completata. ${summary.processedCount} record processati, ${summary.errorCount} errori.`,
            summary
        });

    } catch (error: unknown) {
        console.error("Errore durante l'importazione delle scritture:", error);
        res.status(500).json({ error: "Errore interno del server durante l'importazione." });
    }
});

export default router; 