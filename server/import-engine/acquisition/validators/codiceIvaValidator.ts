import { z } from 'zod';

// Questo file ora definisce solo la struttura dei dati grezzi
// come letti dal file a larghezza fissa.
// La coercizione e la logica di business sono gestite dal Transformer.

export const rawCodiceIvaSchema = z.object({
    codice: z.string().trim(),
    descrizione: z.string().trim(),
    tipoCalcolo: z.string().trim(),
    aliquota: z.string().trim(),
    indetraibilita: z.string().trim(),
    note: z.string().trim(),
    validitaInizio: z.string().trim(),
    validitaFine: z.string().trim(),
    imponibile50Corrispettivi: z.string().trim(),
    imposteIntrattenimenti: z.string().trim(),
    ventilazione: z.string().trim(),
    aliquotaDiversa: z.string().trim(),
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
    percentualeCompensazione: z.string().trim(),
    beniAmmortizzabili: z.string().trim(),
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

export type RawCodiceIva = z.infer<typeof rawCodiceIvaSchema>; 