import { Prisma } from '@prisma/client';
import type { RawCodiceIva } from '../../acquisition/validators/codiceIvaValidator';
import * as decoders from '../decoders/codiceIvaDecoders';
import moment from 'moment';

/**
 * Helper function to parse a numeric string from the fixed-width file.
 * It handles cases with implied decimal places.
 * @param value The string value from the parser.
 * @param decimalPlaces The number of decimal places to assume.
 * @returns A number or null if the input is empty/invalid.
 */
function parseNumeric(value: string, decimalPlaces = 0): number | null {
    const cleanVal = value.trim();
    if (cleanVal === '') return null;
    
    const num = parseFloat(cleanVal.replace(',', '.'));
    if (isNaN(num)) return null;
    
    return decimalPlaces > 0 ? num / Math.pow(10, decimalPlaces) : num;
}

/**
 * Transforms validated raw data for Codici IVA into the format required for Prisma upsert operations.
 * It applies business logic, decodes fields into human-readable descriptions, and maps them to the database schema.
 *
 * @param records - An array of validated Codice IVA records.
 * @returns An array of `Prisma.CodiceIvaCreateInput` objects, ready for database insertion.
 */
export function transformCodiciIva(
  records: RawCodiceIva[]
): Prisma.CodiceIvaCreateInput[] {
  const transformedRecords: Prisma.CodiceIvaCreateInput[] = records.map(record => {
    // The externalId is the unique key for the upsert operation.
    const externalId = record.codice;

    const dataToUpsert: Prisma.CodiceIvaCreateInput = {
        externalId:                     externalId,
        codice:                         record.codice,
        descrizione:                    record.descrizione,
        aliquota:                       parseNumeric(record.aliquota, 2),
        indetraibilita:                 parseNumeric(record.indetraibilita),
        note:                           record.note,
        validitaInizio:                 record.validitaInizio ? moment(record.validitaInizio, "DDMMYYYY").toDate() : null,
        validitaFine:                   record.validitaFine ? moment(record.validitaFine, "DDMMYYYY").toDate() : null,

        // Decoded fields
        tipoCalcolo:                    record.tipoCalcolo,
        tipoCalcoloDesc:                decoders.decodeTipoCalcolo(record.tipoCalcolo),
        
        // Boolean flags
        imponibile50Corrispettivi:      record.imponibile50Corrispettivi === 'X',
        ventilazione:                   record.ventilazione === 'X',
        monteAcquisti:                  record.monteAcquisti === 'X',
        noVolumeAffariPlafond:          record.noVolumeAffariPlafond === 'X',
        acqOperazImponibiliOccasionali: record.acqOperazImponibiliOccasionali === 'X',
        agevolazioniSubforniture:       record.agevolazioniSubforniture === 'X',
        autofatturaReverseCharge:       record.autofatturaReverseCharge === 'X',
        operazioneEsenteOccasionale:    record.operazioneEsenteOccasionale === 'X',
        cesArt38QuaterStornoIva:        record.cesArt38QuaterStornoIva === 'X',
        beniAmmortizzabili:             record.beniAmmortizzabili === 'X',
        provvigioniDm34099:             record.provvigioniDm34099 === 'X',
        analiticoBeniAmmortizzabili:    record.analiticoBeniAmmortizzabili === 'X',
        acquistiIntracomunitari:        record.acquistiIntracomunitari === 'X',
        cessioneProdottiEditoriali:     record.cessioneProdottiEditoriali === 'X',

        // Other numeric fields
        aliquotaDiversa:                parseNumeric(record.aliquotaDiversa, 2),
        percDetrarreExport:             parseNumeric(record.percDetrarreExport, 2),
        percentualeCompensazione:       parseNumeric(record.percentualeCompensazione, 2),
        
        // Other string fields with their decoded descriptions
        imposteIntrattenimenti:         record.imposteIntrattenimenti,
        imposteIntrattenimentiDesc:     decoders.decodeImpostaIntrattenimenti(record.imposteIntrattenimenti),
        
        plafondAcquisti:                record.plafondAcquisti,
        plafondAcquistiDesc:            decoders.decodePlafondAcquisti(record.plafondAcquisti),

        plafondVendite:                 record.plafondVendite,
        plafondVenditeDesc:             decoders.decodePlafondVendite(record.plafondVendite),
        
        gestioneProRata:                record.gestioneProRata,
        gestioneProRataDesc:            decoders.decodeGestioneProRata(record.gestioneProRata),

        comunicazioneDatiIvaVendite:    record.comunicazioneDatiIvaVendite,
        comunicazioneDatiIvaVenditeDesc: decoders.decodeComunicazioneVendite(record.comunicazioneDatiIvaVendite),

        comunicazioneDatiIvaAcquisti:   record.comunicazioneDatiIvaAcquisti,
        comunicazioneDatiIvaAcquistiDesc: decoders.decodeComunicazioneAcquisti(record.comunicazioneDatiIvaAcquisti),

        acquistiCessioni:               record.acquistiCessioni,
        acquistiCessioniDesc:           decoders.decodeAcquistiCessioni(record.acquistiCessioni),

        indicatoreTerritorialeVendite:  record.indicatoreTerritorialeVendite,
        indicatoreTerritorialeVenditeDesc: decoders.decodeIndicatoreTerritorialeVendite(record.indicatoreTerritorialeVendite),
        
        indicatoreTerritorialeAcquisti: record.indicatoreTerritorialeAcquisti,
        indicatoreTerritorialeAcquistiDesc: decoders.decodeIndicatoreTerritorialeAcquisti(record.indicatoreTerritorialeAcquisti),

        metodoDaApplicare:              record.metodoDaApplicare,
        metodoDaApplicareDesc:          decoders.decodeMetodoApplicare(record.metodoDaApplicare),
        
        percentualeForfetaria:          record.percentualeForfetaria,
        percentualeForfetariaDesc:      decoders.decodePercentualeForfetaria(record.percentualeForfetaria),
        
        quotaForfetaria:                record.quotaForfetaria,
        quotaForfetariaDesc:            decoders.decodeQuotaForfetaria(record.quotaForfetaria),
    };

    return dataToUpsert;
  });

  return transformedRecords;
} 