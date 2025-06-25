import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as decoders from '../businessDecoders';
import { convertDateString } from '../importUtils';

const prisma = new PrismaClient();

// Funzione di importazione per i Codici IVA
export async function handleCodiciIvaImport(parsedData: any[], res: Response) {
    let processedCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;

    try {
        console.log(`[CODICI IVA] Inizio elaborazione di ${parsedData.length} record.`);

        const validRecords = parsedData.map(record => {
            const codice = record.codice?.trim();
            if (!codice) return null;

            return {
                id: codice,
                codice: codice,
                externalId: codice,
                descrizione: record.descrizione?.trim() || codice,
                aliquota: typeof record.aliquota === 'number' ? record.aliquota : null,
                indetraibilita: record.percentualeIndetraibilita ? parseFloat(record.percentualeIndetraibilita) : null,
                note: record.note?.trim() || null,
                tipoCalcolo: record.tipoCalcolo?.trim() || null,
                tipoCalcoloDesc: decoders.decodeTipoCalcolo(record.tipoCalcolo),
                dataInizio: convertDateString(record.dataInizioValidita),
                dataFine: convertDateString(record.dataFineValidita),
                inUso: true,
            };
        }).filter((r): r is NonNullable<typeof r> => r !== null);

        console.log(`[CODICI IVA] Trovati ${validRecords.length} record validi da processare.`);

        for (const record of validRecords) {
            try {
                const existing = await prisma.codiceIva.findUnique({ where: { id: record.id }});

                await prisma.codiceIva.upsert({
                    where: { id: record.id },
                    create: record,
                    update: record,
                });

                if (existing) {
                    updatedCount++;
                } else {
                    insertedCount++;
                }
                processedCount++;
                
                if (processedCount % 100 === 0) {
                    console.log(`[CODICI IVA] Elaborati ${processedCount}/${validRecords.length} record...`);
                }
            } catch (error) {
                console.error(`[CODICI IVA] Errore durante upsert del record ${record.codice}:`, error);
            }
        }

        console.log(`[CODICI IVA] Importazione completata. Record inseriti: ${insertedCount}, aggiornati: ${updatedCount}`);
        res.status(200).json({ message: 'Importazione completata', insertedCount, updatedCount });

    } catch (error) {
        console.error(`[CODICI IVA] Errore durante l'importazione:`, error);
        res.status(500).json({ error: 'Errore interno del server durante l\'importazione dei codici IVA' });
    }
} 