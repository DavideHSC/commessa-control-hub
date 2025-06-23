import { Prisma, PrismaClient, TipoConto } from '@prisma/client';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();
const SYSTEM_CUSTOMER_ID = 'system_customer_01'; // Assicurati che questo ID sia nel seed
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

/**
 * Decodifica un buffer di testo provando una serie di codifiche in fallback.
 * Questo approccio è fondamentale per gestire file provenienti da sistemi diversi,
 * che potrebbero non usare lo standard UTF-8.
 * La sequenza di tentativi è ['utf-8', 'latin1', 'cp1252'].
 * @param buffer Il buffer del file da decodificare.
 * @returns La stringa decodificata correttamente.
 */
export function decodeBufferWithFallback(buffer: Buffer): string {
    const REPLACEMENT_CHAR = '\uFFFD'; // Carattere usato per byte non validi in UTF-8
    const encodingsToTry: (BufferEncoding | 'cp1252')[] = ['utf-8', 'latin1', 'cp1252'];

    // Prova con UTF-8 e controlla la presenza di caratteri non validi
    const utf8String = buffer.toString('utf-8');
    if (!utf8String.includes(REPLACEMENT_CHAR)) {
        console.log('[Parser] Decodifica riuscita con: utf-8');
        return utf8String;
    }

    // Se UTF-8 fallisce (o contiene errori), prova gli altri encoding
    // Nota: iconv-lite è necessario per cp1252, non supportato nativamente da Buffer.
    for (const encoding of encodingsToTry) {
        if (encoding === 'utf-8') continue; // Già provato
        try {
            const decodedString = iconv.decode(buffer, encoding);
            console.log(`[Parser] Decodifica riuscita con: ${encoding}`);
            return decodedString;
        } catch (e) {
            console.warn(`[Parser] Tentativo di decodifica con ${encoding} fallito.`);
        }
    }
    
    // Come ultima risorsa, restituisce la stringa UTF-8 anche se imperfetta
    console.warn('[Parser] Nessuna codifica ha funzionato perfettamente. Ritorno a utf-8 con possibili errori.');
    return utf8String;
}

export async function processScrittureInBatches(data: { testate: any[], righeContabili: any[], righeIva: any[], allocazioni: any[] }) {
    const { testate, righeContabili, righeIva, allocazioni } = data;
    
    // Mappe dati pre-elaborate per efficienza
    const testateMap = new Map(testate.map(t => [t.codiceUnivocoScaricamento.trim(), t]));
    
    const righeContabiliMap = new Map<string, any[]>();
    righeContabili.forEach(r => {
        const testataId = r.codiceUnivocoScaricamento.trim();
        if (!righeContabiliMap.has(testataId)) righeContabiliMap.set(testataId, []);
        righeContabiliMap.get(testataId)!.push(r);
    });

    const righeIvaMap = new Map<string, any[]>();
    righeIva.forEach(r => {
        const testataId = r.codiceUnivocoScaricamento.trim();
        if (!righeIvaMap.has(testataId)) righeIvaMap.set(testataId, []);
        righeIvaMap.get(testataId)!.push(r);
    });

    const allocazioniMap = new Map<string, any[]>();
    allocazioni.forEach(a => {
        const testataId = a.codiceUnivocoScaricamento.trim();
        const rigaProg = parseInt(a.riga, 10);
        if (isNaN(rigaProg)) return;
        
        const key = `${testataId}_${rigaProg}`;
        if (!allocazioniMap.has(key)) allocazioniMap.set(key, []);
        allocazioniMap.get(key)!.push(a);
    });

    let processedCount = 0;
    let errorCount = 0;
    const totalBatches = testateMap.size;
    console.log(`[Import Staging] Inizio elaborazione di ${totalBatches} scritture...`);

    // Pulisci le tabelle di staging prima di iniziare
    try {
        await prisma.importAllocazione.deleteMany({});
        await prisma.importScritturaRigaContabile.deleteMany({});
        await prisma.importScritturaTestata.deleteMany({});
    } catch (e) {
        console.error("Errore pulizia tabelle di staging", e);
        // Potremmo voler fermare l'import se la pulizia fallisce
    }


    for (const [testataId, testata] of testateMap.entries()) {
        try {
            await prisma.$transaction(async (tx) => {

                // 1. Crea la testata di staging
                const scritturaTestata = await tx.importScritturaTestata.create({
                    data: {
                        codiceUnivocoScaricamento: testataId,
                        codiceCausale: testata.causaleId,
                        descrizioneCausale: testata.descrizioneCausale,
                        dataRegistrazione: testata.dataRegistrazione,
                        dataDocumento: testata.dataDocumento,
                        numeroDocumento: testata.numeroDocumento,
                        noteMovimento: testata.note,
                    }
                });

                // 2. Crea le righe contabili di staging
                const righeContabiliPerTestata = righeContabiliMap.get(testataId) || [];
                for (const riga of righeContabiliPerTestata) {
                    const rigaContabileStaging = await tx.importScritturaRigaContabile.create({
                        data: {
                            importScritturaTestataId: scritturaTestata.id,
                            codiceUnivocoScaricamento: testataId,
                            riga: parseInt(riga.riga, 10),
                            codiceConto: riga.codiceConto,
                            importoDare: riga.importoDare,
                            importoAvere: riga.importoAvere,
                            note: riga.note,
                        }
                    });

                    // 3. Crea le allocazioni di staging
                    const rigaProg = parseInt(riga.riga, 10);
                    const allocazioniKey = `${testataId}_${rigaProg}`;
                    const allocazioniPerRiga = allocazioniMap.get(allocazioniKey) || [];

                    if (allocazioniPerRiga.length > 0) {
                        await tx.importAllocazione.createMany({
                            data: allocazioniPerRiga.map(alloc => ({
                                importScritturaRigaContabileId: rigaContabileStaging.id,
                                commessaId: alloc.commessaId,
                                importo: alloc.importo,
                            }))
                        });
                    }
                }
                
                // 4. Logica per le righe IVA (da definire come gestirle nello staging)
                const righeIvaPerTestata = righeIvaMap.get(testataId) || [];
                // Per ora, le ignoriamo nello staging per semplicità, ma qui andrebbe la logica
            });
            processedCount++;
        } catch (error) {
            console.error(`[Import Staging] Errore durante l'elaborazione della testata ${testataId}. Dettagli:`, error);
            errorCount++;
        }
    }

    console.log(`[Import Staging] Elaborazione completata. Successo: ${processedCount}, Errori: ${errorCount}.`);
    return { processedCount, errorCount };
} 