import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as decoders from '../businessDecoders';
import { z } from 'zod';
// import { transformCausaleContabile } from '../../import-engine/transformation/transformers/causaleContabileTransformer';
import { causaleContabileValidator } from '../../import-engine/acquisition/validators/causaleContabileValidator';
import { parseDecimalString, parseBooleanFlag, convertDateString } from '../importUtils';
import { ImportStats } from '../fixedWidthParser';

const prisma = new PrismaClient();

interface RawCausaleData {
    codiceCausale?: string;
    descrizione?: string;
    tipoMovimento?: string;
    tipoAggiornamento?: string;
    dataInizio?: string;
    dataFine?: string;
    tipoRegistroIva?: string;
    segnoMovimentoIva?: string;
    contoIva?: string;
    contoIvaVendite?: string;
    generazioneAutofattura?: string;
    tipoAutofatturaGenerata?: string;
    fatturaImporto0?: string;
    fatturaValutaEstera?: string;
    nonConsiderareLiquidazioneIva?: string;
    fatturaEmessaRegCorrispettivi?: string;
    ivaEsigibilitaDifferita?: string;
    gestionePartite?: string;
    gestioneIntrastat?: string;
    gestioneRitenuteEnasarco?: string;
    versamentoRitenute?: string;
    noteMovimento?: string;
    descrizioneDocumento?: string;
    identificativoEsteroClifor?: string;
    scritturaRettificaAssestamento?: string;
    nonStampareRegCronologico?: string;
    movimentoRegIvaNonRilevante?: string;
    tipoMovimentoSemplificata?: string;
}

// Funzione Helper per la trasformazione, ispirata da CAUSALI.md
function transformRawCausale(record: RawCausaleData) {
    const externalId = record.codiceCausale?.trim();
    if (!externalId) {
        return null;
    }

    const cleanedRecord = {
        codiceCausale: record.codiceCausale,
        tipoMovimento: record.tipoMovimento,
        tipoAggiornamento: record.tipoAggiornamento,
        tipoRegistroIva: record.tipoRegistroIva,
        segnoMovimentoIva: record.segnoMovimentoIva,
        tipoAutofatturaGenerata: record.tipoAutofatturaGenerata,
        ivaEsigibilitaDifferita: record.ivaEsigibilitaDifferita,
        gestionePartite: record.gestionePartite,
        gestioneRitenuteEnasarco: record.gestioneRitenuteEnasarco,
        tipoMovimentoSemplificata: record.tipoMovimentoSemplificata,
        generazioneAutofattura: record.generazioneAutofattura,
        fatturaImporto0: record.fatturaImporto0,
        fatturaValutaEstera: record.fatturaValutaEstera,
        nonConsiderareLiquidazioneIva: record.nonConsiderareLiquidazioneIva,
        fatturaEmessaRegCorrispettivi: record.fatturaEmessaRegCorrispettivi,
        gestioneIntrastat: record.gestioneIntrastat,
        versamentoRitenute: record.versamentoRitenute,
        identificativoEsteroClifor: record.identificativoEsteroClifor,
        scritturaRettificaAssestamento: record.scritturaRettificaAssestamento,
        nonStampareRegCronologico: record.nonStampareRegCronologico,
        movimentoRegIvaNonRilevante: record.movimentoRegIvaNonRilevante,
    };

    return {
        id: externalId,
        codice: externalId,
        externalId: externalId,
        descrizione: record.descrizione?.trim() || 'Descrizione mancante',
        tipoMovimento: record.tipoMovimento?.trim() || null,
        tipoMovimentoDesc: decoders.decodeTipoMovimento(cleanedRecord.tipoMovimento || ''),
        tipoAggiornamento: record.tipoAggiornamento?.trim() || null,
        tipoAggiornamentoDesc: decoders.decodeTipoAggiornamento(cleanedRecord.tipoAggiornamento || ''),
        dataInizio: record.dataInizio,
        dataFine: record.dataFine,
        tipoRegistroIva: record.tipoRegistroIva?.trim() || null,
        tipoRegistroIvaDesc: decoders.decodeTipoRegistroIva(cleanedRecord.tipoRegistroIva || ''),
        segnoMovimentoIva: record.segnoMovimentoIva?.trim() || null,
        segnoMovimentoIvaDesc: decoders.decodeSegnoMovimentoIva(cleanedRecord.segnoMovimentoIva || ''),
        contoIva: record.contoIva?.trim() || null,
        contoIvaVendite: record.contoIvaVendite?.trim() || null,
        generazioneAutofattura: decoders.decodeBooleanFlag(cleanedRecord.generazioneAutofattura),
        tipoAutofatturaGenerata: record.tipoAutofatturaGenerata?.trim() || null,
        tipoAutofatturaDesc: decoders.decodeTipoAutofattura(cleanedRecord.tipoAutofatturaGenerata || ''),
        fatturaImporto0: decoders.decodeBooleanFlag(cleanedRecord.fatturaImporto0),
        fatturaValutaEstera: decoders.decodeBooleanFlag(cleanedRecord.fatturaValutaEstera),
        nonConsiderareLiquidazioneIva: decoders.decodeBooleanFlag(cleanedRecord.nonConsiderareLiquidazioneIva),
        fatturaEmessaRegCorrispettivi: decoders.decodeBooleanFlag(cleanedRecord.fatturaEmessaRegCorrispettivi),
        ivaEsigibilitaDifferita: record.ivaEsigibilitaDifferita?.trim() || null,
        ivaEsigibilitaDifferitaDesc: decoders.decodeIvaEsigibilita(cleanedRecord.ivaEsigibilitaDifferita || ''),
        gestionePartite: record.gestionePartite?.trim() || null,
        gestionePartiteDesc: decoders.decodeGestionePartite(cleanedRecord.gestionePartite || ''),
        gestioneIntrastat: decoders.decodeBooleanFlag(cleanedRecord.gestioneIntrastat),
        gestioneRitenuteEnasarco: record.gestioneRitenuteEnasarco?.trim() || null,
        gestioneRitenuteEnasarcoDesc: decoders.decodeGestioneRitenuteEnasarco(cleanedRecord.gestioneRitenuteEnasarco || ''),
        versamentoRitenute: decoders.decodeBooleanFlag(cleanedRecord.versamentoRitenute),
        noteMovimento: record.noteMovimento?.trim() || null,
        descrizioneDocumento: record.descrizioneDocumento?.trim() || null,
        identificativoEsteroClifor: decoders.decodeBooleanFlag(cleanedRecord.identificativoEsteroClifor),
        scritturaRettificaAssestamento: decoders.decodeBooleanFlag(cleanedRecord.scritturaRettificaAssestamento),
        nonStampareRegCronologico: decoders.decodeBooleanFlag(cleanedRecord.nonStampareRegCronologico),
        movimentoRegIvaNonRilevante: decoders.decodeBooleanFlag(cleanedRecord.movimentoRegIvaNonRilevante),
        tipoMovimentoSemplificata: record.tipoMovimentoSemplificata?.trim() || null,
        tipoMovimentoSemplificataDesc: decoders.decodeTipoMovimentoSemplificata(cleanedRecord.tipoMovimentoSemplificata || '')
    };
}

/**
 * === CAUSALI CONTABILI - IMPORT SPECIALIZZATO ===
 * Basato su parser_causali.py con integrazione completa di tutti i 28 campi
 * e decodifiche semantiche dal businessDecoders.ts
 */
export async function handleCausaliImport(parsedData: RawCausaleData[], res: Response) {
    console.log(`[CAUSALI] Iniziata elaborazione di ${parsedData.length} record`);
    
    try {
        const validRecords = parsedData
            .map(transformRawCausale)
            .filter((record): record is NonNullable<ReturnType<typeof transformRawCausale>> => record !== null);

        console.log(`[IMPORT Causali] Trovati ${validRecords.length} record validi da processare.`);

        let insertedCount = 0;
        let updatedCount = 0;
        let processedCount = 0;
        
        for (const causale of validRecords) {
            try {
                const existingRecord = await prisma.causaleContabile.findUnique({
                    where: { id: causale.id }
                });

                const dataInizioDate = causale.dataInizio ? convertDateString(causale.dataInizio) : null;
                const dataFineDate = causale.dataFine ? convertDateString(causale.dataFine) : null;

                const createPayload = {
                    ...causale,
                    dataInizio: dataInizioDate && !isNaN(dataInizioDate.getTime()) ? dataInizioDate : null,
                    dataFine: dataFineDate && !isNaN(dataFineDate.getTime()) ? dataFineDate : null,
                };

                const { id, ...updateData } = createPayload;

                await prisma.causaleContabile.upsert({
                    where: { id: causale.id },
                    update: updateData,
                    create: createPayload,
                });

                if (existingRecord) {
                    updatedCount++;
                } else {
                    insertedCount++;
                }
                
                processedCount++;
                
                if (processedCount % 100 === 0) {
                    console.log(`[CAUSALI] Elaborati ${processedCount} record...`);
                }
                
            } catch (error) {
                console.error(`[CAUSALI] Errore inserimento causale ${causale.codice}:`, error instanceof Error ? error.message : String(error));
            }
        }

        const stats = {
            totalRecords: parsedData.length,
            validRecords: validRecords.length,
            insertedRecords: insertedCount,
            updatedRecords: updatedCount,
            errorRecords: parsedData.length - validRecords.length
        };

        console.log(`[CAUSALI] Completato: ${stats.insertedRecords} inseriti, ${stats.updatedRecords} aggiornati, ${stats.errorRecords} errori`);

        return res.status(200).json({
            success: true,
            message: 'Importazione causali completata con successo',
            stats: stats
        });

    } catch (error) {
        console.error('[CAUSALI] Errore fatale durante l\'importazione:', error);
        return res.status(500).json({
            success: false,
            error: 'Errore durante l\'importazione delle causali',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

export async function processCausali(causali: RawCausaleData[]): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRecords: causali.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errorRecords: 0,
    errors: [],
    warnings: [],
    successfulRecords: 0
  };

  for (const record of causali) {
    // ... existing code ...
  }

  stats.successfulRecords = stats.inserted + stats.updated;
  console.log('Importazione causali completata:', stats);
  return stats;
} 