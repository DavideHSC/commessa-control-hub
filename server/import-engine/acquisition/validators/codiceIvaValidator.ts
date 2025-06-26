import { z } from 'zod';

// Helper for parsing numeric strings into floats with 2 decimal places
const toTwoDecimalFloat = z.string().transform((val) => {
    if (!val || val.trim() === '') return null;
    const cleanVal = val.trim();
    if (cleanVal.length < 3) return parseFloat(cleanVal);
    const integerPart = cleanVal.slice(0, -2);
    const decimalPart = cleanVal.slice(-2);
    return parseFloat(`${integerPart}.${decimalPart}`);
}).nullable();

// Helper for parsing numeric strings into integers
const toInteger = z.string().transform((val) => {
    if (!val || val.trim() === '') return null;
    return parseInt(val.trim(), 10);
}).nullable();

// Helper for parsing 'X' into a boolean
const toBoolean = z.string().transform(val => val.trim().toUpperCase() === 'X');

// Helper for parsing GGMMAAAA date strings
const toDate = z.string().transform((val) => {
    const cleanVal = val.trim();
    if (!cleanVal || cleanVal === '00000000') return null;
    if (cleanVal.length !== 8) return null;
    const day = cleanVal.substring(0, 2);
    const month = cleanVal.substring(2, 4);
    const year = cleanVal.substring(4, 8);
    const date = new Date(`${year}-${month}-${day}`);
    // Check if the created date is valid (e.g., handles '31022023')
    if (isNaN(date.getTime())) return null;
    return date;
}).nullable();


// Raw type from fixed-width file (all strings)
// This will be eventually replaced by a generated type
export const rawCodiceIvaSchema = z.object({
    codice: z.string().trim(),
    descrizione: z.string().trim(),
    tipoCalcolo: z.string().trim(),
    aliquota: z.number().nullable(),
    indetraibilita: z.number().nullable(),
    note: z.string().trim(),
    validitaInizio: z.string().trim(),
    validitaFine: z.string().trim(),
    imponibile50Corrispettivi: z.string().trim(),
    imposteIntrattenimenti: z.string().trim(),
    ventilazione: z.string().trim(),
    aliquotaDiversa: z.number().nullable(),
    plafondAcquisti: z.string().trim(),
    monteAcquisti: z.string().trim(),
    plafondVendite: z.string().trim(),
    noVolumeAffariPlafond: z.string().trim(),
    gestioneProRata: z.string().trim(),
    acqOperazImponibiliOccasionali: z.string().trim(),
    comunicazioneDatiIvaVendite: z.string().trim(),
    agevolazioniSubforniture: z.string().trim(),
    comunicazioneDatiIvaAcquisti: z.string().trim(),
    autofatturaReverseCharge: z.string().trim(),
    operazioneEsenteOccasionale: z.string().trim(),
    cesArt38QuaterStornoIva: z.string().trim(),
    percDetrarreExport: z.string().trim(),
    acquistiCessioni: z.string().trim(),
    percentualeCompensazione: z.number().nullable(),
    beniAmmortizzabili: z.boolean(),
    indicatoreTerritorialeVendite: z.string().trim(),
    provvigioniDm34099: z.string().trim(),
    indicatoreTerritorialeAcquisti: z.string().trim(),
    metodoDaApplicare: z.string().trim(),
    percentualeForfetaria: z.string().trim(),
    analiticoBeniAmmortizzabili: z.string().trim(),
    quotaForfetaria: z.string().trim(),
    acquistiIntracomunitari: z.string().trim(),
    cessioneProdottiEditoriali: z.string().trim(),
});

// Validated and coerced schema
export const validatedCodiceIvaSchema = z.object({
    codice: z.string().trim(),
    descrizione: z.string().trim(),
    tipoCalcolo: z.string().trim(),
    aliquota: toTwoDecimalFloat,
    indetraibilita: toInteger,
    note: z.string().trim(),
    validitaInizio: toDate,
    validitaFine: toDate,
    imponibile50Corrispettivi: toBoolean,
    imposteIntrattenimenti: z.string().trim(),
    ventilazione: toBoolean,
    aliquotaDiversa: toTwoDecimalFloat,
    plafondAcquisti: z.string().trim(),
    monteAcquisti: toBoolean,
    plafondVendite: z.string().trim(),
    noVolumeAffariPlafond: toBoolean,
    gestioneProRata: z.string().trim(),
    acqOperazImponibiliOccasionali: toBoolean,
    comunicazioneDatiIvaVendite: z.string().trim(),
    agevolazioniSubforniture: toBoolean,
    comunicazioneDatiIvaAcquisti: z.string().trim(),
    autofatturaReverseCharge: toBoolean,
    operazioneEsenteOccasionale: toBoolean,
    cesArt38QuaterStornoIva: toBoolean,
    percDetrarreExport: toTwoDecimalFloat,
    acquistiCessioni: z.string().trim(),
    percentualeCompensazione: toTwoDecimalFloat,
    beniAmmortizzabili: toBoolean,
    indicatoreTerritorialeVendite: z.string().trim(),
    provvigioniDm34099: toBoolean,
    indicatoreTerritorialeAcquisti: z.string().trim(),
    metodoDaApplicare: z.string().trim(),
    percentualeForfetaria: z.string().trim(),
    analiticoBeniAmmortizzabili: toBoolean,
    quotaForfetaria: z.string().trim(),
    acquistiIntracomunitari: toBoolean,
    cessioneProdottiEditoriali: toBoolean,
});

export type RawCodiceIva = z.infer<typeof rawCodiceIvaSchema>;
export type ValidatedCodiceIva = z.infer<typeof validatedCodiceIvaSchema>; 