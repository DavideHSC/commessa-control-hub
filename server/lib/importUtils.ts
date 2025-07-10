import { Prisma, PrismaClient, TipoConto } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();
const SYSTEM_CUSTOMER_ID = 'system_customer_01'; // Assicurati che questo ID sia nel seed
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

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

export async function processScrittureInBatches(data: { 
    testate: ITestata[], 
    righeContabili: IRigaContabile[], 
    righeIva: IRigaIva[], 
    allocazioni: IAllocazione[],
    codiceFiscaleAzienda: string 
}) {
    const { testate, righeContabili, righeIva, allocazioni, codiceFiscaleAzienda } = data;
    
    // Mappe dati pre-elaborate per efficienza
    const testateMap = new Map(testate.map(t => [t.externalId.trim(), t]));
    const righeContabiliMap = new Map<string, IRigaContabile[]>();
    righeContabili.forEach(r => {
        const testataId = r.externalId.substring(0, 12).trim();
        if (!righeContabiliMap.has(testataId)) righeContabiliMap.set(testataId, []);
        righeContabiliMap.get(testataId)!.push(r);
    });
    const righeIvaMap = new Map<string, IRigaIva[]>();
    righeIva.forEach(r => {
        const rigaId = r.externalId.trim();
        if (!righeIvaMap.has(rigaId)) righeIvaMap.set(rigaId, []);
        righeIvaMap.get(rigaId)!.push(r);
    });
    const allocazioniMap = new Map<string, IAllocazione[]>();
    allocazioni.forEach(a => {
        const rigaId = a.externalId.trim();
        if (!allocazioniMap.has(rigaId)) allocazioniMap.set(rigaId, []);
        allocazioniMap.get(rigaId)!.push(a);
    });

    let processedCount = 0;
    let errorCount = 0;
    const totalBatches = testateMap.size;
    console.log(`[Import] Inizio elaborazione di ${totalBatches} scritture in batch...`);

    for (const [testataId, testata] of testateMap.entries()) {
        try {
            // Ogni testata viene processata in una transazione separata
            await prisma.$transaction(async (tx) => {
                const fornitoreCodice = testata.clienteFornitoreCodiceFiscale?.trim();
                if (fornitoreCodice) {
                    await tx.fornitore.upsert({
                        where: { externalId: fornitoreCodice },
                        update: {},
                        create: {
                            externalId: fornitoreCodice,
                            nome: `Fornitore importato - ${fornitoreCodice}`
                        }
                    });
                }

                const fornitore = fornitoreCodice ? await tx.fornitore.findUnique({ where: { externalId: fornitoreCodice } }) : null;

                // FIX: Esegui il lookup della causale
                const causaleCodice = testata.causaleId.trim();
                const causale = await tx.causaleContabile.findUnique({
                    where: { codice: causaleCodice },
                    select: { id: true }
                });

                if (!causale) {
                    throw new Error(`Causale contabile con codice '${causaleCodice}' non trovata per la scrittura ${testataId}.`);
                }

                const scritturaData = {
                    data: testata.dataRegistrazione,
                    descrizione: `Importazione - ${testataId}`,
                    causaleId: causale.id, // Usa l'ID trovato
                    dataDocumento: testata.dataDocumento,
                    numeroDocumento: testata.numeroDocumento.trim(),
                    fornitoreId: fornitore?.id
                };

                const scrittura = await tx.scritturaContabile.upsert({
                    where: { externalId: testataId },
                    update: scritturaData,
                    create: { ...scritturaData, externalId: testataId }
                });

                const righeContabiliPerTestata = righeContabiliMap.get(testataId) || [];
                for (const riga of righeContabiliPerTestata) {
                    const rigaId = riga.externalId.trim();
                    const contoCodice = riga.conto.trim();
                    if (!contoCodice) continue;

                    await tx.conto.upsert({
                        where: { 
                            codice_codiceFiscaleAzienda: {
                                codice: contoCodice,
                                codiceFiscaleAzienda: codiceFiscaleAzienda // <-- FIX: Usa il codice fiscale corretto
                            }
                        },
                        update: {},
                        create: {
                            codice: contoCodice,
                            codiceFiscaleAzienda: codiceFiscaleAzienda, // <-- FIX: Usa il codice fiscale corretto
                            nome: `Conto importato - ${contoCodice}`,
                            tipo: TipoConto.Patrimoniale,
                            richiedeVoceAnalitica: false,
                        }
                    });

                    const conto = await tx.conto.findUniqueOrThrow({ 
                        where: { 
                            codice_codiceFiscaleAzienda: {
                                codice: contoCodice,
                                codiceFiscaleAzienda: codiceFiscaleAzienda // <-- FIX: Usa il codice fiscale corretto
                            }
                        }, 
                        select: { id: true } 
                    });

                    const rigaScrittura = await tx.rigaScrittura.create({
                        data: {
                            scritturaContabileId: scrittura.id,
                            descrizione: riga.note.trim(),
                            dare: riga.importoDare,
                            avere: riga.importoAvere,
                            contoId: conto.id,
                        }
                    });

                    const righeIvaPerRiga = righeIvaMap.get(rigaId) || [];
                    for (const rigaIva of righeIvaPerRiga) {
                        const codiceIvaCodice = rigaIva.codiceIva.trim();
                        if (!codiceIvaCodice) continue;
                        
                        const codiceIva = await tx.codiceIva.upsert({
                            where: { externalId: codiceIvaCodice },
                            update: {},
                            create: {
                                externalId: codiceIvaCodice,
                                codice: codiceIvaCodice,
                                descrizione: `IVA importata - ${codiceIvaCodice}`,
                                aliquota: 0,
                            }
                        });

                        await tx.rigaIva.create({
                            data: {
                                rigaScritturaId: rigaScrittura.id,
                                imponibile: rigaIva.imponibile,
                                imposta: rigaIva.imposta,
                                codiceIvaId: codiceIva.id,
                            }
                        });
                    }

                    const allocazioniPerRiga = allocazioniMap.get(rigaId) || [];
                    for (const alloc of allocazioniPerRiga) {
                        const commessaCodice = alloc.centroDiCosto.trim();
                        const voceAnaliticaCodice = alloc.parametro.toString().trim();
                        if (!commessaCodice || !voceAnaliticaCodice) continue;

                        const voceAnalitica = await tx.voceAnalitica.upsert({
                            where: { nome: voceAnaliticaCodice },
                            update: {},
                            create: {
                                nome: voceAnaliticaCodice,
                                tipo: 'Costo' // FIX: Aggiunto tipo di default
                            }
                        });

                        const commessa = await tx.commessa.upsert({
                            where: { nome: commessaCodice },
                            update: {},
                            create: {
                                nome: commessaCodice,
                                clienteId: SYSTEM_CUSTOMER_ID
                            }
                        });

                        await tx.allocazione.create({
                            data: {
                                rigaScritturaId: rigaScrittura.id,
                                importo: alloc.parametro,
                                commessaId: commessa.id,
                                voceAnaliticaId: voceAnalitica.id,
                                // FIX: Aggiunti campi obbligatori
                                tipoMovimento: 'COSTO_EFFETTIVO', 
                                dataMovimento: testata.dataRegistrazione || new Date()
                            }
                        });
                    }
                }
            });
            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`[Import] Progresso: ${processedCount} / ${totalBatches} scritture elaborate...`);
            }
        } catch (error) {
            console.error(`[Import] Errore durante l'elaborazione della testata ${testataId}. Questo record sarà saltato. Dettagli:`, error);
            errorCount++;
        }
    }

    console.log(`[Import] Elaborazione batch completata. Successo: ${processedCount}, Errori: ${errorCount}.`);
    return { processedCount, errorCount };
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

    // Esegui l'inserimento
    await prisma.stagingTestata.createMany({ data: testateToCreate, skipDuplicates: true });
    await prisma.stagingRigaContabile.createMany({ data: righeContabiliToCreate, skipDuplicates: true });
    await prisma.stagingRigaIva.createMany({ data: righeIvaToCreate, skipDuplicates: true });
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