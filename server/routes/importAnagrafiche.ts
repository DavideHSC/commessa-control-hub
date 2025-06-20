import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, FieldDefinition } from '../lib/fixedWidthParser';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:templateName', upload.single('file'), async (req: Request, res: Response) => {
    const { templateName } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    
    const file = req.file;

    try {
        // 1. Recupera il template e le definizioni dal DB
        const importTemplate = await prisma.importTemplate.findUnique({
            where: { nome: templateName },
            include: { fields: true },
        });

        if (!importTemplate) {
            return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
        }

        const modelName = (importTemplate as any).modelName as keyof PrismaClient;
        const fileContent = file.buffer.toString('utf-8');
        const fieldDefinitions = importTemplate.fields.map(f => ({ name: f.nomeCampo, start: f.start, length: f.length, type: f.type as any }));
        const parsedData = parseFixedWidth<any>(fileContent, fieldDefinitions);

        // Gestione speciale per clienti/fornitori
        if (templateName === 'clienti_fornitori') {
            await prisma.$transaction(async (tx) => {
                for (const record of parsedData) {
                    const piva = record.piva?.trim();

                    // Se la P.IVA non è valida o è vuota, salta il record per sicurezza
                    if (!piva || piva.length < 11) { 
                        continue;
                    }

                    const dataToUpsert = {
                        id: record.externalId.trim(),
                        externalId: record.externalId.trim(),
                        nome: record.nome.trim(),
                        piva: piva,
                        codiceFiscale: record.codiceFiscale?.trim(),
                    };
                    
                    const targetModel = record.tipo === 'C' ? tx.cliente : tx.fornitore;
                    
                    // Controlla se esiste già un record con questa PIVA prima di fare upsert
                    const existing = await (targetModel as any).findUnique({
                        where: { piva: dataToUpsert.piva },
                    });

                    // Se non esiste, procedi con l'upsert usando l'ID esterno come chiave principale
                    if (!existing) {
                        await (targetModel as any).upsert({
                            where: { id: dataToUpsert.id },
                            update: dataToUpsert,
                            create: dataToUpsert,
                        });
                    }
                }
            });
             return res.status(200).json({ message: `Importazione per '${templateName}' completata. Record duplicati o non validi sono stati ignorati.` });
        }

        // Gestione per Piano dei Conti
        if (templateName === 'piano_dei_conti') {
            const contiDaImportare = parsedData
                .filter(record => record.tipo_soggetto !== 'C' && record.tipo_soggetto !== 'F' && record.id.trim())
                .map(record => ({
                    id: record.id.trim(),
                    codice: record.id.trim(),
                    nome: record.nome.trim() || 'N/A',
                    tipo: TipoConto.Patrimoniale, // Default, andrà classificato meglio in futuro
                    richiedeVoceAnalitica: false,
                }));

            await prisma.$transaction(async (tx) => {
                for (const conto of contiDaImportare) {
                    await tx.conto.upsert({
                        where: { id: conto.id },
                        update: { nome: conto.nome },
                        create: conto,
                    });
                }
            });
            return res.status(200).json({ message: `Importazione per '${templateName}' completata. ${contiDaImportare.length} conti processati.` });
        }

        if (!modelName || !(prisma as any)[modelName]) {
            return res.status(400).json({ error: `Il nome del modello per '${templateName}' non è valido o non è configurato.` });
        }

        // Esegui il parsing e il salvataggio per anagrafiche generiche
        await prisma.$transaction(async (tx) => {
            for (const record of parsedData) {
                const dataToUpsert = { ...record };
                Object.keys(dataToUpsert).forEach(key => {
                    if (typeof dataToUpsert[key] === 'string') {
                        dataToUpsert[key] = dataToUpsert[key].trim();
                    }
                });

                if (!dataToUpsert.id) continue;

                await (tx as any)[modelName].upsert({
                    where: { id: dataToUpsert.id },
                    update: dataToUpsert,
                    create: dataToUpsert,
                });
            }
        });

        return res.status(200).json({ message: `Importazione per '${templateName}' completata. ${parsedData.length} record processati.` });

    } catch (error: any) {
        console.error(`Errore durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: "Errore interno del server durante l'importazione." });
    }
});

export default router; 