import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as decoders from '../businessDecoders';
import { parseBooleanPythonic } from '../importUtils';

const prisma = new PrismaClient();

// Funzione di importazione per i Codici IVA - CORRETTA
// Si fida dei dati già parsati da fixedWidthParser in base al template in seed.ts
export async function handleCodiciIvaImport(parsedData: any[], res: Response) {
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const record of parsedData) {
        try {
            const externalId = record.codice;
            if (!externalId) {
                errorCount++;
                continue;
            }

            // Mappatura diretta con conversioni corrette
            const dataToUpsert = {
                externalId:                     externalId,
                codice:                         externalId,
                descrizione:                    record.descrizione,
                aliquota:                       record.aliquota,
                indetraibilita:                 record.indetraibilita,
                note:                           record.note,
                tipoCalcolo:                    record.tipoCalcolo,
                validitaInizio:                 record.validitaInizio,
                validitaFine:                   record.validitaFine
            };

            const result = await prisma.codiceIva.upsert({
                where: { externalId },
                update: dataToUpsert,
                create: dataToUpsert,
            });

            if (result) {
                // Controlla se è stato inserito o aggiornato
                const existing = await prisma.codiceIva.findFirst({
                    where: { externalId },
                    select: { id: true }
                });
                
                if (existing) {
                    updatedCount++;
                } else {
                    insertedCount++;
                }
            }

        } catch (error) {
            console.error(`Errore durante l'importazione del codice IVA ${record.codice}:`, error);
            errorCount++;
        }
    }

    const stats = {
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount
    };

    console.log(`Import codici IVA completato: ${insertedCount} inseriti, ${updatedCount} aggiornati, ${errorCount} errori`);

    res.status(200).json({
        message: `Import completato con successo`,
        stats
    });
} 