import { Router, Request, Response } from 'express';
import multer from 'multer';
import { FieldDefinition, parseFixedWidth } from '../lib/fixedWidthParser';
import { PrismaClient, Prisma, Commessa } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Schema per PNTESTA.TXT - Corretto con start = PRG - 1
const testataFields: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 20, length: 12, type: 'string' },
    { fieldName: 'codiceCausale', start: 39, length: 6, type: 'string' },
    { fieldName: 'descrizioneCausale', start: 45, length: 40, type: 'string' },
    { fieldName: 'dataRegistrazione', start: 85, length: 8, type: 'date' },
    { fieldName: 'tipoRegistroIva', start: 95, length: 1, type: 'string' },
    { fieldName: 'clienteFornitoreCodiceFiscale', start: 99, length: 16, type: 'string' },
    { fieldName: 'clienteFornitoreSigla', start: 116, length: 12, type: 'string' },
    { fieldName: 'documentoData', start: 128, length: 8, type: 'date' },
    { fieldName: 'documentoNumero', start: 136, length: 12, type: 'string' },
    { fieldName: 'protocolloNumero', start: 157, length: 6, type: 'string' }, // Trattato come stringa per sicurezza
    { fieldName: 'totaleDocumento', start: 172, length: 12, type: 'number' },
    { fieldName: 'noteMovimento', start: 192, length: 60, type: 'string' },
];

// Schema per PNRIGCON.TXT - Corretto con start = PRG - 1
const rigaContabileFields: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { fieldName: 'progressivoRiga', start: 15, length: 3, type: 'number' },
    { fieldName: 'tipoConto', start: 18, length: 1, type: 'string' },
    { fieldName: 'codiceFiscale', start: 19, length: 16, type: 'string' },
    { fieldName: 'subcodiceFiscale', start: 35, length: 1, type: 'string' },
    { fieldName: 'siglaClienteFornitore', start: 36, length: 12, type: 'string' },
    { fieldName: 'conto', start: 48, length: 10, type: 'string' },
    { fieldName: 'importoDare', start: 58, length: 12, type: 'number' },
    { fieldName: 'importoAvere', start: 70, length: 12, type: 'number' },
    { fieldName: 'note', start: 82, length: 60, type: 'string' },
    { fieldName: 'insDatiMovimentiAnalitici', start: 247, length: 1, type: 'string' }, // PRG 248 -> start 247
];

// Schema per PNRIGIVA.TXT - Corretto con start = PRG - 1
const rigaIvaFields: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { fieldName: 'codiceIva', start: 15, length: 4, type: 'string' },
    { fieldName: 'contropartita', start: 19, length: 10, type: 'string' },
    { fieldName: 'imponibile', start: 29, length: 12, type: 'number' },
    { fieldName: 'imposta', start: 41, length: 12, type: 'number' },
    { fieldName: 'importoLordo', start: 89, length: 12, type: 'number' },
    { fieldName: 'note', start: 101, length: 60, type: 'string' },
    { fieldName: 'siglaContropartita', start: 161, length: 12, type: 'string' },
];

// Schema per MOVANAC.TXT - Corretto con start = PRG - 1
const rigaAnaliticaFields: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { fieldName: 'progressivoRigaContabile', start: 15, length: 3, type: 'number' },
    { fieldName: 'centroDiCosto', start: 18, length: 4, type: 'string' },
    { fieldName: 'parametro', start: 22, length: 12, type: 'number' }, // Importo o quantità
];

// --- Definizioni dei tipi per i dati parsati ---
interface Pntesta {
    codiceUnivocoScaricamento: string;
    codiceCausale: string;
    descrizioneCausale: string;
    dataRegistrazione: Date | null;
    tipoRegistroIva: string;
    clienteFornitoreCodiceFiscale: string;
    clienteFornitoreSigla: string;
    documentoData: Date | null;
    documentoNumero: string;
    protocolloNumero: string;
    totaleDocumento: number;
    noteMovimento: string;
}

interface Pnrigcon {
    codiceUnivocoScaricamento: string;
    progressivoRiga: number;
    tipoConto: string;
    codiceFiscale: string;
    subcodiceFiscale: string;
    siglaClienteFornitore: string;
    conto: string;
    importoDare: number;
    importoAvere: number;
    note: string;
    insDatiMovimentiAnalitici: string;
}

interface Pnrigiva {
    codiceUnivocoScaricamento: string;
    codiceIva: string;
    contropartita: string;
    imponibile: number;
    imposta: number;
    importoLordo: number;
    note: string;
    siglaContropartita: string;
}

interface Movanac {
    codiceUnivocoScaricamento: string;
    progressivoRigaContabile: number;
    centroDiCosto: string;
    parametro: number;
}

interface ScritturaCompleta {
    testata: Pntesta;
    righe: (Pnrigcon & { allocazioni: Movanac[] })[];
    righeIva: Pnrigiva[];
}

router.post('/', upload.fields([
    { name: 'pntesta', maxCount: 1 },
    { name: 'pnrigcon', maxCount: 1 },
    { name: 'movanac', maxCount: 1 },
    { name: 'pnrigiva', maxCount: 1 }
]), async (req, res) => {
    console.log('[Import] Ricevuta richiesta di importazione Prima Nota.');

    // Fase 0: Pulizia delle tabelle di staging correlate alla Prima Nota
    // Questo garantisce che ogni importazione sia pulita e previene errori di unicità.
    try {
        console.log('[Import] Pulizia delle tabelle di staging...');
        // L'ordine è importante per via dei vincoli di chiave esterna
        await prisma.importAllocazione.deleteMany({});
        await prisma.importScritturaRigaIva.deleteMany({});
        await prisma.importScritturaRigaContabile.deleteMany({});
        await prisma.importScritturaTestata.deleteMany({});
        console.log('[Import] Tabelle di staging pulite con successo.');
    } catch (error) {
        console.error('Errore durante la pulizia delle tabelle di staging:', error);
        return res.status(500).json({
            message: 'Errore interno durante la pulizia delle tabelle di staging.',
            details: error instanceof Error ? error.message : String(error),
        });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.pntesta || !files.pnrigcon || !files.movanac) {
        return res.status(400).json({ error: 'Uno o più file richiesti (PNTESTA, PNRIGCON, MOVANAC) sono mancanti.' });
    }

    try {
        // 1. Parsing di tutti i file con la codifica corretta
        const testate = parseFixedWidth<Pntesta>(files.pntesta[0].buffer.toString('latin1'), testataFields);
        const righeContabili = parseFixedWidth<Pnrigcon>(files.pnrigcon[0].buffer.toString('latin1'), rigaContabileFields);
        const movimentiAnalitici = parseFixedWidth<Movanac>(files.movanac[0].buffer.toString('latin1'), rigaAnaliticaFields);
        const righeIva = files.pnrigiva ? parseFixedWidth<Pnrigiva>(files.pnrigiva[0].buffer.toString('latin1'), rigaIvaFields) : [];
        
        console.log(`[Import] Parsati ${testate.length} testate, ${righeContabili.length} righe contabili, ${movimentiAnalitici.length} movimenti analitici, ${righeIva.length} righe IVA.`);

        // 2. Raggruppamento dei dati
        const righeByTestata = righeContabili.reduce((acc, riga) => {
            const key = riga.codiceUnivocoScaricamento;
            if (!acc[key]) acc[key] = [];
            acc[key].push(riga);
            return acc;
        }, {} as Record<string, Pnrigcon[]>);

        const analiticiByRiga = movimentiAnalitici.reduce((acc, mov) => {
            const key = `${mov.codiceUnivocoScaricamento}-${mov.progressivoRigaContabile}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(mov);
            return acc;
        }, {} as Record<string, Movanac[]>);

        const ivaByTestata = righeIva.reduce((acc, riga) => {
            const key = riga.codiceUnivocoScaricamento;
            if (!acc[key]) acc[key] = [];
            acc[key].push(riga);
            return acc;
        }, {} as Record<string, Pnrigiva[]>);


        // 3. Costruzione della struttura dati completa
        const scrittureComplete = testate.map(testata => {
            const codiceUnivoco = testata.codiceUnivocoScaricamento;
            const righeAssociate = righeByTestata[codiceUnivoco] || [];
            const righeIvaAssociate = ivaByTestata[codiceUnivoco] || [];

            const righeConAnalitica = righeAssociate.map(riga => {
                const key = `${codiceUnivoco}-${riga.progressivoRiga}`;
                const allocazioni = analiticiByRiga[key] || [];
                return { 
                    ...riga,
                    allocazioni: allocazioni
                };
            });

            return {
                testata: testata,
                righe: righeConAnalitica,
                righeIva: righeIvaAssociate
            };
        });

        console.log(`[Import] Ricostruite ${scrittureComplete.length} scritture complete.`);

        // 4. Salvataggio nel database
        let importati = 0;
        let falliti = 0;
        const erroriDiImportazione: { id: string, errore: string }[] = [];
        
        // Cache per le commesse per evitare query ripetute nel loop
        const commesseCache = new Map<string, Commessa>();
        const tutteLeCommesse = await prisma.commessa.findMany();
        tutteLeCommesse.forEach(c => c.externalId && commesseCache.set(c.externalId, c));

        for (const scrittura of scrittureComplete) {
            const codiceUnivoco = scrittura.testata.codiceUnivocoScaricamento;

            try {
                // La transazione assicura che una scrittura venga importata interamente o per nulla.
                await prisma.$transaction(async (tx) => {
                    // 1. Creazione della testata
                    await tx.importScritturaTestata.create({
                        data: {
                            codiceUnivocoScaricamento: codiceUnivoco,
                            codiceCausale: scrittura.testata.codiceCausale,
                            descrizioneCausale: scrittura.testata.descrizioneCausale,
                            dataRegistrazione: scrittura.testata.dataRegistrazione,
                            dataDocumento: scrittura.testata.documentoData,
                            numeroDocumento: scrittura.testata.documentoNumero,
                            totaleDocumento: scrittura.testata.totaleDocumento,
                            noteMovimento: scrittura.testata.noteMovimento,
                        }
                    });

                    // 2. Creazione delle righe contabili
                    if (scrittura.righe.length > 0) {
                        await tx.importScritturaRigaContabile.createMany({
                            data: scrittura.righe.map((riga, index) => ({
                                codiceUnivocoScaricamento: codiceUnivoco,
                                riga: index + 1, // FIX: Garantisce unicità
                                codiceConto: riga.conto,
                                descrizioneConto: riga.note || `Conto ${riga.conto}`,
                                importoDare: riga.importoDare,
                                importoAvere: riga.importoAvere,
                                note: riga.note,
                                insDatiMovimentiAnalitici: riga.insDatiMovimentiAnalitici === '1'
                            })),
                        });
                    }

                    // 3. Creazione delle righe IVA
                    if (scrittura.righeIva.length > 0) {
                        await tx.importScritturaRigaIva.createMany({
                            data: scrittura.righeIva.map((riga, index) => ({
                                codiceUnivocoScaricamento: codiceUnivoco,
                                riga: index + 1, // FIX: Garantisce unicità
                                codiceIva: riga.codiceIva,
                                codiceConto: riga.contropartita, // FIX: Mappatura corretta
                                imponibile: riga.imponibile,
                                imposta: riga.imposta,
                            }))
                        });
                    }

                    // 4. Creazione dei suggerimenti di allocazione
                    const righeContabiliCreate = await tx.importScritturaRigaContabile.findMany({
                        where: {
                            codiceUnivocoScaricamento: codiceUnivoco,
                            insDatiMovimentiAnalitici: true
                        }
                    });

                    if (righeContabiliCreate.length > 0) {
                        console.log(`[Allocazione] Trovate ${righeContabiliCreate.length} righe da allocare per scrittura ${codiceUnivoco}.`);

                        for (const rigaDb of righeContabiliCreate) {
                            // La riga in DB ha riga = index + 1. Troviamo la riga originale nell'array.
                            const rigaOriginale = scrittura.righe[rigaDb.riga - 1];

                            if (rigaOriginale && rigaOriginale.allocazioni.length > 0) {
                                const allocazioniDaCreare: Prisma.ImportAllocazioneCreateManyInput[] = [];
                                for (const allocazioneFile of rigaOriginale.allocazioni) {
                                    const commessa = commesseCache.get(allocazioneFile.centroDiCosto);
                                    if (commessa) {
                                        allocazioniDaCreare.push({
                                            importo: allocazioneFile.parametro,
                                            suggerimentoAutomatico: true,
                                            commessaId: commessa.id,
                                            importScritturaRigaContabileId: rigaDb.id,
                                        });
                                    } else {
                                        console.warn(`[Allocazione] Commessa con externalId '${allocazioneFile.centroDiCosto}' non trovata per riga ${rigaDb.id}. Allocazione saltata.`);
                                    }
                                }

                                if (allocazioniDaCreare.length > 0) {
                                    console.log(`[Allocazione] Creazione di ${allocazioniDaCreare.length} suggerimenti per riga ${rigaDb.riga}.`);
                                    await tx.importAllocazione.createMany({
                                        data: allocazioniDaCreare,
                                    });
                                }
                            }
                        }
                    }
                }); // Fine transazione

                importati++;
            } catch (error) {
                falliti++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                erroriDiImportazione.push({
                    id: codiceUnivoco,
                    errore: errorMessage
                });
                console.error(`--- ERRORE IMPORTAZIONE SCRITTURA ID: ${codiceUnivoco} ---`);
                console.error(error);
                console.error(`------------------------------------`);
            }
        }

        console.log(`[Import] Elaborazione terminata. Successo: ${importati}, Falliti: ${falliti}.`);

        return res.json({
            message: 'Elaborazione dei file completata.',
            scrittureRicostruite: scrittureComplete.length,
            importateConSuccesso: importati,
            fallite: falliti,
            errori: erroriDiImportazione,
            sample: scrittureComplete.slice(0, 1)
        });

    } catch (error) {
        const e = error as Error;
        console.error("Errore durante l'elaborazione dei file di prima nota:", e.message);
        return res.status(500).json({ error: 'Errore interno durante l\'elaborazione dei file.', dettagli: e.message });
    }
});

export default router; 