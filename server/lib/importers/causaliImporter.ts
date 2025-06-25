import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as decoders from '../businessDecoders';

const prisma = new PrismaClient();

/**
 * === CAUSALI CONTABILI - IMPORT SPECIALIZZATO ===
 * Basato su parser_causali.py con integrazione completa di tutti i 28 campi
 * e decodifiche semantiche dal businessDecoders.ts
 */
export async function handleCausaliImport(parsedData: any[], res: Response) {
    console.log(`[CAUSALI] Iniziata elaborazione di ${parsedData.length} record`);
    
    try {
        const validRecords = parsedData.map(record => {
            const externalId = record.codice?.trim();
            if (!externalId) {
                return null;
            }

            // Parsing con decodifiche semantiche complete
            const causaleData = {
                id: externalId,
                codice: externalId,
                externalId: externalId,
                descrizione: record.descrizione?.trim() || 'Descrizione mancante',
                tipoMovimento: record.tipoMovimento?.trim() || null,
                tipoMovimentoDesc: decoders.decodeTipoMovimento(record.tipoMovimento),
                tipoAggiornamento: record.tipoAggiornamento?.trim() || null,
                tipoAggiornamentoDesc: decoders.decodeTipoAggiornamento(record.tipoAggiornamento),
                dataInizio: record.dataInizio,
                dataFine: record.dataFine,
                tipoRegistroIva: record.tipoRegistroIva?.trim() || null,
                tipoRegistroIvaDesc: decoders.decodeTipoRegistroIva(record.tipoRegistroIva),
                segnoMovimentoIva: record.segnoMovimentoIva?.trim() || null,
                segnoMovimentoIvaDesc: decoders.decodeSegnoMovimentoIva(record.segnoMovimentoIva),
                contoIva: record.contoIva?.trim() || null,
                contoIvaVendite: record.contoIvaVendite?.trim() || null,
                generazioneAutofattura: decoders.decodeBooleanFlag(record.generazioneAutofattura),
                tipoAutofatturaGenerata: record.tipoAutofatturaGenerata?.trim() || null,
                tipoAutofatturaDesc: decoders.decodeTipoAutofattura(record.tipoAutofatturaGenerata),
                fatturaImporto0: decoders.decodeBooleanFlag(record.fatturaImporto0),
                fatturaValutaEstera: decoders.decodeBooleanFlag(record.fatturaValutaEstera),
                nonConsiderareLiquidazioneIva: decoders.decodeBooleanFlag(record.nonConsiderareLiquidazioneIva),
                fatturaEmessaRegCorrispettivi: decoders.decodeBooleanFlag(record.fatturaEmessaRegCorrispettivi),
                ivaEsigibilitaDifferita: record.ivaEsigibilitaDifferita?.trim() || null,
                ivaEsigibilitaDifferitaDesc: decoders.decodeIvaEsigibilita(record.ivaEsigibilitaDifferita),
                gestionePartite: record.gestionePartite?.trim() || null,
                gestionePartiteDesc: decoders.decodeGestionePartite(record.gestionePartite),
                gestioneIntrastat: decoders.decodeBooleanFlag(record.gestioneIntrastat),
                gestioneRitenuteEnasarco: record.gestioneRitenuteEnasarco?.trim() || null,
                gestioneRitenuteEnasarcoDesc: decoders.decodeGestioneRitenuteEnasarco(record.gestioneRitenuteEnasarco),
                versamentoRitenute: decoders.decodeBooleanFlag(record.versamentoRitenute),
                noteMovimento: record.noteMovimento?.trim() || null,
                descrizioneDocumento: record.descrizioneDocumento?.trim() || null,
                identificativoEsteroClifor: decoders.decodeBooleanFlag(record.identificativoEsteroClifor),
                scritturaRettificaAssestamento: decoders.decodeBooleanFlag(record.scritturaRettificaAssestamento),
                nonStampareRegCronologico: decoders.decodeBooleanFlag(record.nonStampareRegCronologico),
                movimentoRegIvaNonRilevante: decoders.decodeBooleanFlag(record.movimentoRegIvaNonRilevante),
                tipoMovimentoSemplificata: record.tipoMovimentoSemplificata?.trim() || null,
                tipoMovimentoSemplificataDesc: decoders.decodeTipoMovimentoSemplificata(record.tipoMovimentoSemplificata)
            };

            return causaleData;
        }).filter(record => record !== null);

        console.log(`[IMPORT Causali] Trovati ${validRecords.length} record validi da processare.`);

        let insertedCount = 0;
        let updatedCount = 0;
        let processedCount = 0;
        
        for (const causale of validRecords) {
            try {
                const existingRecord = await prisma.causaleContabile.findUnique({
                    where: { id: causale.id }
                });

                await prisma.causaleContabile.upsert({
                    where: { id: causale.id },
                    create: causale,
                    update: {
                        ...causale
                    }
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