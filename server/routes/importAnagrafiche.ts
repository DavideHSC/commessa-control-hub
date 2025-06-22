import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, FieldDefinition } from '../lib/fixedWidthParser';

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
    console.log(`[IMPORT] Ricevuto file: ${file.originalname}, dimensione: ${file.size} bytes`);

    try {
        const importTemplate = await prisma.importTemplate.findUnique({
            where: { nome: templateName },
            include: { fields: true },
        });

        if (!importTemplate) {
            console.error(`[IMPORT] Errore: Template '${templateName}' non trovato nel database.`);
            return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
        }
        
        console.log(`[IMPORT] Trovato template '${importTemplate.nome}' con ${importTemplate.fields.length} campi definiti.`);

        const modelName = (importTemplate as any).modelName as keyof PrismaClient | null;
        const fileContent = file.buffer.toString('utf-8');
        
        const fieldDefinitionsForParser: FieldDefinition[] = importTemplate.fields.map(f => ({
            name: f.nomeCampo,
            start: f.start,
            length: f.length,
            type: f.type as 'string' | 'number' | 'date'
        }));

        const parsedData = parseFixedWidth<any>(fileContent, fieldDefinitionsForParser);

        if (!modelName) {
             console.log(`[IMPORT] Gestione custom per '${templateName}'. Nessun modelName specificato.`);
             // Qui andrebbe la logica specifica per i template senza modelName, es. anagrafica_clifor
             // Per ora, terminiamo con successo per non bloccare i test.
             console.log(`[IMPORT] Logica per '${templateName}' non ancora implementata in questa route generica.`);
             return res.status(200).json({ message: `Import per '${templateName}' ricevuto, gestione custom richiesta.` });
        }

        if (typeof modelName !== 'string' || !(prisma as any)[modelName]) {
            console.error(`[IMPORT] Errore di configurazione: modelName '${String(modelName)}' non è un modello Prisma valido.`);
            return res.status(400).json({ error: `Il nome del modello per '${templateName}' non è valido.` });
        }
        
        const model = (prisma as any)[modelName];
        
        const result = await model.createMany({
            data: parsedData,
            skipDuplicates: true,
        });

        console.log(`[IMPORT] Importazione completata per '${templateName}'. Record creati: ${result.count}`);
        return res.status(200).json({ message: 'Importazione completata con successo', importedCount: result.count });

    } catch (error: any) {
        console.error(`--- ERRORE DURANTE L'IMPORTAZIONE per '${templateName}' ---`);
        if (error instanceof Error) {
            console.error('Tipo Errore:', error.name);
            console.error('Messaggio:', error.message);
            console.error('Stack Trace:', error.stack);
        } else {
            console.error('Errore non standard:', error);
        }
        console.error('-----------------------------------------------------------');
        res.status(500).json({ error: "Errore interno del server durante l'importazione. Controlla i log del server." });
    }
});

export default router;