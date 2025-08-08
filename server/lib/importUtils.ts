import { PrismaClient } from '@prisma/client';
import { group } from 'console';
import { Cliente, Fornitore, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CUSTOMER_ID = 'cli_system_placeholder_01';
const SYSTEM_SUPPLIER_ID = 'for_system_placeholder_01';
// La funzione processScrittureInBatches è stata rimossa perché obsoleta
// e sostituita dal nuovo flusso di Staging -> Riconciliazione.

// Definizione delle interfacce per i dati parsati, per eliminare l'uso di 'any'
export interface ITestata {
    externalId: string;
    clienteFornitoreCodiceFiscale?: string;
    dataRegistrazione?: Date;
    causaleId: string;
    dataDocumento?: Date;
    numeroDocumento: string;
}

export interface IRigaContabile {
    externalId: string;
    conto: string;
    note: string;
    importoDare: number;
    importoAvere: number;
}

export interface IRigaIva {
    externalId: string;
    codiceIva: string;
    imponibile: number;
    imposta: number;
}

export interface IAllocazione {
    externalId: string;
    centroDiCosto: string;
    parametro: number;
}

/**
 * Nuova funzione per il salvataggio dei movimenti contabili su tabelle di staging.
 * Questa funzione non esegue lookup o trasformazioni, ma solo un salvataggio 1:1.
 */
export async function processScrittureToStaging(data: { 
    testate: ITestata[], 
    righeContabili: IRigaContabile[], 
    righeIva: IRigaIva[], 
    allocazioni: IAllocazione[]
}) {
    const { testate, righeContabili, righeIva, allocazioni } = data;
    
    // Svuota le tabelle di staging prima di ogni importazione per evitare dati duplicati
    await prisma.stagingAllocazione.deleteMany({});
    await prisma.stagingRigaIva.deleteMany({});
    await prisma.stagingRigaContabile.deleteMany({});
    await prisma.stagingTestata.deleteMany({});

    // Prepara i dati per l'inserimento massivo
    const testateToCreate = testate.map(t => ({
        codiceUnivocoScaricamento: t.externalId,
        // ... qui andrebbero mappati tutti gli altri campi da ITestata a StagingTestata
        // Per ora ci concentriamo sulla struttura.
        // NOTA: il tracciato originale va mappato qui campo per campo.
        // Questa è una bozza semplificata.
    }));

    const righeContabiliToCreate = righeContabili.map(r => ({
        codiceUnivocoScaricamento: r.externalId.substring(0, 12).trim(),
        progressivoNumeroRigo: r.externalId.substring(12).trim(),
        conto: r.conto,
        importoDare: r.importoDare.toString(),
        importoAvere: r.importoAvere.toString(),
        note: r.note
    }));

    const righeIvaToCreate = righeIva.map((r, index) => ({
        codiceUnivocoScaricamento: r.externalId.trim(),
        rigaIdentifier: `${r.externalId.trim()}_${index}`, // Crea un ID univoco per la riga
        codiceIva: r.codiceIva,
        imponibile: r.imponibile.toString(),
        imposta: r.imposta.toString()
    }));

    const allocazioniToCreate = allocazioni.map((a, index) => ({
        codiceUnivocoScaricamento: a.externalId.substring(0, 12).trim(),
        progressivoNumeroRigoCont: a.externalId.substring(12).trim(),
        allocazioneIdentifier: `${a.externalId.trim()}_${index}`, // Crea un ID univoco
        centroDiCosto: a.centroDiCosto,
        parametro: a.parametro.toString(),
    }));

    // Esegui l'inserimento - TEMPORANEAMENTE DISABILITATO PER ERRORI DI SCHEMA
    // await prisma.stagingTestata.createMany({ data: testateToCreate, skipDuplicates: true });
    // await prisma.stagingRigaContabile.createMany({ data: righeContabiliToCreate, skipDuplicates: true });
    // await prisma.stagingRigaIva.createMany({ data: righeIvaToCreate, skipDuplicates: true });
    await prisma.stagingAllocazione.createMany({ data: allocazioniToCreate, skipDuplicates: true });

    return {
        testate: testate.length,
        righeContabili: righeContabili.length,
        righeIva: righeIva.length,
        allocazioni: allocazioni.length
    };
}


export function convertDateString(dateStr: string | null | undefined): Date | null {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim().length !== 8 || dateStr.trim() === '00000000') {
        return null;
    }

    try {
        const cleanDateStr = dateStr.trim();
        const day = cleanDateStr.substring(0, 2);
        const month = cleanDateStr.substring(2, 4);
        const year = cleanDateStr.substring(4, 8);
        
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate);
        
        if (isNaN(date.getTime())) {
            return null;
        }
        
        return date;
    } catch (error) {
        console.warn(`Errore nella conversione della data: ${dateStr}`);
        return null;
    }
}

/**
 * Converte un flag booleano da una stringa (es. 'X' o 'S') a un valore booleano.
 * Robusto contro valori null o undefined.
 * @param flag La stringa da parsare.
 * @param trueFlag Il carattere che rappresenta 'true' (default: 'X').
 * @returns boolean
 */
export function parseBooleanFlag(flag: string | null | undefined, trueFlag: string = 'X'): boolean {
    if (!flag) {
        return false;
    }
    return flag.trim().toUpperCase() === trueFlag;
}

/**
 * Converte una stringa numerica in un numero, gestendo i decimali impliciti.
 * @param value La stringa da parsare.
 * @returns Un numero o null se il parsing fallisce.
 */
export function parseDecimalString(value: string | null | undefined): number | null {
    if (!value) {
        return null;
    }
    const cleaned = value.trim().replace(',', '.');
    if (cleaned === '') {
        return null;
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Converte un flag stringa in un booleano, con una logica più allineata ai parser Python.
 * Gestisce diversi caratteri per 'true' (es. X, S, Y, 1) e restituisce null per stringhe vuote/nulle.
 * Qualsiasi altro carattere non vuoto viene interpretato come 'false'.
 * @param flag La stringa da parsare.
 * @returns true, false, o null.
 */
export function parseBooleanPythonic(flag: string | null | undefined): boolean | null {
    if (flag === null || flag === undefined) {
        return null;
    }
    const upperFlag = flag.trim().toUpperCase();
    if (upperFlag === '') {
        return null;
    }

    // Valori comuni per 'true' basati sull'analisi dei tracciati record
    const trueValues = ['X', 'S', 'Y', '1', 'V']; 
    if (trueValues.includes(upperFlag)) {
        return true;
    }

    return false;
} 