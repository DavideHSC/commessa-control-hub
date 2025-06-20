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

        // Gestione speciale per anagrafica clienti/fornitori
        if (templateName === 'anagrafica_clifor') {
            await prisma.$transaction(async (tx) => {
                for (const record of parsedData) {
                    const externalId = record.externalId?.trim();
                    if (!externalId) {
                        continue; // Salta record senza un ID esterno valido
                    }

                    const dataToUpsert = {
                        id: externalId,
                        externalId: externalId,
                        nome: record.nome?.trim() || 'N/A',
                        piva: record.piva?.trim(),
                        codiceFiscale: record.codiceFiscale?.trim(),
                    };

                    const createInCliente = async () => {
                        // Se la P.IVA è fornita, controlla che non esista già per un ID diverso
                        if (dataToUpsert.piva) {
                            const existing = await tx.cliente.findUnique({
                                where: { piva: dataToUpsert.piva },
                            });
                            // Se esiste un cliente con questa P.IVA e ID diverso, salta per evitare conflitti
                            if (existing && existing.id !== dataToUpsert.id) {
                                console.warn(`Cliente con P.IVA ${dataToUpsert.piva} già esistente (ID: ${existing.id}). Record con ID ${dataToUpsert.id} saltato.`);
                                return;
                            }
                        }
                        await tx.cliente.upsert({
                            where: { id: dataToUpsert.id },
                            update: dataToUpsert,
                            create: dataToUpsert,
                        });
                    };

                    const createInFornitore = async () => {
                        // Se la P.IVA è fornita, controlla che non esista già per un ID diverso
                        if (dataToUpsert.piva) {
                            const existing = await tx.fornitore.findUnique({
                                where: { piva: dataToUpsert.piva },
                            });
                            // Se esiste un fornitore con questa P.IVA e ID diverso, salta per evitare conflitti
                            if (existing && existing.id !== dataToUpsert.id) {
                                console.warn(`Fornitore con P.IVA ${dataToUpsert.piva} già esistente (ID: ${existing.id}). Record con ID ${dataToUpsert.id} saltato.`);
                                return;
                            }
                        }
                        await tx.fornitore.upsert({
                            where: { id: dataToUpsert.id },
                            update: dataToUpsert,
                            create: dataToUpsert,
                        });
                    };

                    const tipoAnagrafica = record.tipo?.trim().toUpperCase();

                    if (tipoAnagrafica === 'C') {
                        await createInCliente();
                    } else if (tipoAnagrafica === 'F') {
                        await createInFornitore();
                    } else if (tipoAnagrafica === 'E') {
                        await createInCliente();
                        await createInFornitore();
                    }
                }
            });
             return res.status(200).json({ message: `Importazione per '${templateName}' completata con successo.` });
        }

        // Gestione per Piano dei Conti (CONTIGEN.TXT)
        if (templateName === 'piano_dei_conti') {
            let processedCount = 0;
            const batchSize = 100; // Processa in batch per evitare timeout
            
            try {
                // Filtra e prepara i dati prima della transazione
                const validRecords = parsedData
                    .map(record => {
                        const codice = record.codice?.trim();
                        if (!codice) return null;

                        // Mappa il tipo carattere a TipoConto enum
                        let tipo: TipoConto;
                        const tipoChar = record.tipoChar?.trim();
                        switch (tipoChar) {
                            case 'P': 
                                tipo = TipoConto.Patrimoniale; 
                                break;
                            case 'E': 
                                // Per i conti economici, distingui tra ricavi (classe 1) e costi (altre classi)
                                tipo = codice.startsWith('1') ? TipoConto.Ricavo : TipoConto.Costo; 
                                break;
                            case 'C': 
                                tipo = TipoConto.Cliente; 
                                break;
                            case 'F': 
                                tipo = TipoConto.Fornitore; 
                                break;
                            default: 
                                tipo = TipoConto.Patrimoniale; 
                                break;
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
                    })
                    .filter(record => record !== null);

                console.log(`Piano dei conti: ${validRecords.length} record validi da processare`);

                // Processa in batch
                for (let i = 0; i < validRecords.length; i += batchSize) {
                    const batch = validRecords.slice(i, i + batchSize);
                    
                    await prisma.$transaction(async (tx) => {
                        for (const dataToUpsert of batch) {
                            try {
                                await tx.conto.upsert({
                                    where: { id: dataToUpsert.id },
                                    update: {
                                        nome: dataToUpsert.nome,
                                        tipo: dataToUpsert.tipo,
                                        externalId: dataToUpsert.externalId,
                                        richiedeVoceAnalitica: dataToUpsert.richiedeVoceAnalitica,
                                        vociAnaliticheAbilitateIds: dataToUpsert.vociAnaliticheAbilitateIds,
                                        contropartiteSuggeriteIds: dataToUpsert.contropartiteSuggeriteIds
                                    },
                                    create: dataToUpsert,
                                });
                                processedCount++;
                            } catch (error) {
                                console.warn(`Errore processando conto ${dataToUpsert.codice}:`, error);
                            }
                        }
                    });
                    
                    console.log(`Piano dei conti: processati ${Math.min(i + batchSize, validRecords.length)}/${validRecords.length} record`);
                }
                
                console.log(`✅ IMPORTAZIONE COMPLETATA: ${processedCount} conti salvati nel database su ${parsedData.length} record totali`);
                
                return res.status(200).json({ 
                    message: `Importazione piano dei conti completata. ${processedCount} conti processati su ${parsedData.length} record totali.` 
                });
            } catch (error) {
                console.error('Errore durante importazione piano dei conti:', error);
                return res.status(500).json({ 
                    error: `Errore durante importazione piano dei conti: ${(error as Error).message}. Processati: ${processedCount} record.` 
                });
            }
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