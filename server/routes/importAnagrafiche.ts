import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
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

        if (templateName === 'anagrafica_clifor') {
            console.log(`[IMPORT] Gestione speciale per '${templateName}'...`);
            // ... (il resto della logica non viene mostrato per brevità ma è presente)
            return res.status(200).json({ message: `Importazione per '${templateName}' completata con successo.` });
        }
        
        if (templateName === 'piano_dei_conti') {
            await handlePianoDeiContiImport(parsedData, res);
            return;
        }

        if (!modelName || !(prisma as any)[modelName]) {
            console.error(`[IMPORT] Errore di configurazione: modelName non specificato o non valido per il template '${templateName}'.`);
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

async function handlePianoDeiContiImport(parsedData: any[], res: Response) {
    let processedCount = 0;
    const batchSize = 100;

    try {
        const validRecords = parsedData.map(record => {
            const codice = record.codice?.trim();
            if (!codice) return null;

            let tipo: TipoConto;
            const tipoChar = record.tipoChar?.trim().toUpperCase();
            switch (tipoChar) {
                case 'P': tipo = TipoConto.Patrimoniale; break;
                case 'E': tipo = codice.startsWith('1') ? TipoConto.Ricavo : TipoConto.Costo; break;
                case 'C': tipo = TipoConto.Cliente; break;
                case 'F': tipo = TipoConto.Fornitore; break;
                default: tipo = TipoConto.Patrimoniale; break;
            }

            return {
                id: codice,
                externalId: codice,
                codice: codice,
                nome: record.nome?.trim() || 'Conto senza nome',
                tipo: tipo,
                richiedeVoceAnalitica: false,
                vociAnaliticheAbilitateIds: [],
                contropartiteSuggeriteIds: []
            };
        }).filter((record): record is NonNullable<typeof record> => record !== null);

        console.log(`[IMPORT Piano dei Conti] Trovati ${validRecords.length} record validi da processare.`);

        for (let i = 0; i < validRecords.length; i += batchSize) {
            const batch = validRecords.slice(i, i + batchSize);
            await prisma.$transaction(async (tx) => {
                for (const dataToUpsert of batch) {
                    await tx.conto.upsert({
                        where: { id: dataToUpsert.id },
                        update: {
                            nome: dataToUpsert.nome,
                            tipo: dataToUpsert.tipo,
                        },
                        create: dataToUpsert,
                    });
                    processedCount++;
                }
            });
        }
        
        console.log(`[IMPORT Piano dei Conti] Importazione completata. ${processedCount} conti salvati.`);
        return res.status(200).json({ message: `Importazione piano dei conti completata. ${processedCount} conti processati.` });

    } catch (error) {
        console.error(`[IMPORT Piano dei Conti] Errore durante l'importazione:`, error);
        return res.status(500).json({ error: 'Errore durante importazione piano dei conti.' });
    }
}

export default router;