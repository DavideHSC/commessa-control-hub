import { Router, Request, Response } from 'express';
import multer from 'multer';
import { FieldDefinition, parseFixedWidth } from '../lib/fixedWidthParser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Schema per PNTESTA.TXT - Corretto con start = PRG - 1
const pntestaSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 20, length: 12, type: 'string' },
    { name: 'codiceCausale', start: 39, length: 6, type: 'string' },
    { name: 'descrizioneCausale', start: 45, length: 40, type: 'string' },
    { name: 'dataRegistrazione', start: 85, length: 8, type: 'date' },
    { name: 'tipoRegistroIva', start: 95, length: 1, type: 'string' },
    { name: 'clienteFornitoreCodiceFiscale', start: 99, length: 16, type: 'string' },
    { name: 'clienteFornitoreSigla', start: 116, length: 12, type: 'string' },
    { name: 'documentoData', start: 128, length: 8, type: 'date' },
    { name: 'documentoNumero', start: 136, length: 12, type: 'string' },
    { name: 'protocolloNumero', start: 157, length: 6, type: 'string' }, // Trattato come stringa per sicurezza
    { name: 'totaleDocumento', start: 172, length: 12, type: 'number' },
    { name: 'noteMovimento', start: 192, length: 60, type: 'string' },
];

// Schema per PNRIGCON.TXT - Corretto con start = PRG - 1
const pnrigconSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { name: 'progressivoRiga', start: 15, length: 3, type: 'number' },
    { name: 'tipoConto', start: 18, length: 1, type: 'string' },
    { name: 'codiceFiscale', start: 19, length: 16, type: 'string' },
    { name: 'subcodiceFiscale', start: 35, length: 1, type: 'string' },
    { name: 'siglaClienteFornitore', start: 36, length: 12, type: 'string' },
    { name: 'conto', start: 48, length: 10, type: 'string' },
    { name: 'importoDare', start: 58, length: 12, type: 'number' },
    { name: 'importoAvere', start: 70, length: 12, type: 'number' },
    { name: 'note', start: 82, length: 60, type: 'string' },
    { name: 'insDatiMovimentiAnalitici', start: 247, length: 1, type: 'string' }, // PRG 248 -> start 247
];

// Schema per PNRIGIVA.TXT - Corretto con start = PRG - 1
const pnrigivaSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { name: 'codiceIva', start: 15, length: 4, type: 'string' },
    { name: 'contropartita', start: 19, length: 10, type: 'string' },
    { name: 'imponibile', start: 29, length: 12, type: 'number' },
    { name: 'imposta', start: 41, length: 12, type: 'number' },
    { name: 'importoLordo', start: 89, length: 12, type: 'number' },
    { name: 'note', start: 101, length: 60, type: 'string' },
    { name: 'siglaContropartita', start: 161, length: 12, type: 'string' },
];

// Schema per MOVANAC.TXT - Corretto con start = PRG - 1
const movanacSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 3, length: 12, type: 'string' },
    { name: 'progressivoRigaContabile', start: 15, length: 3, type: 'number' },
    { name: 'centroDiCosto', start: 18, length: 4, type: 'string' },
    { name: 'parametro', start: 22, length: 12, type: 'number' }, // Importo o quantità
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

router.post('/', upload.array('files'), async (req: Request, res: Response) => {

    if (!req.files || !Array.isArray(req.files) || req.files.length < 3) {
        return res.status(400).json({ error: 'Sono richiesti almeno 3 file (PNTESTA, PNRIGCON, MOVANAC). Il file PNRIGIVA è opzionale ma raccomandato.' });
    }
    
    const files = req.files as Express.Multer.File[];

    const pntestaFile = files.find(f => f.originalname.toUpperCase() === 'PNTESTA.TXT');
    const pnrigconFile = files.find(f => f.originalname.toUpperCase() === 'PNRIGCON.TXT');
    const movanacFile = files.find(f => f.originalname.toUpperCase() === 'MOVANAC.TXT');
    const pnrigivaFile = files.find(f => f.originalname.toUpperCase() === 'PNRIGIVA.TXT');

    if (!pntestaFile || !pnrigconFile || !movanacFile) {
        return res.status(400).json({ error: 'Uno o più file richiesti (PNTESTA, PNRIGCON, MOVANAC) sono mancanti.' });
    }

    try {
        // 1. Parsing di tutti i file con la codifica corretta
        const testate = parseFixedWidth<Pntesta>(pntestaFile.buffer.toString('latin1'), pntestaSchema);
        const righeContabili = parseFixedWidth<Pnrigcon>(pnrigconFile.buffer.toString('latin1'), pnrigconSchema);
        const movimentiAnalitici = parseFixedWidth<Movanac>(movanacFile.buffer.toString('latin1'), movanacSchema);
        const righeIva = pnrigivaFile ? parseFixedWidth<Pnrigiva>(pnrigivaFile.buffer.toString('latin1'), pnrigivaSchema) : [];
        
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

        for (const scrittura of scrittureComplete) {
            const codiceUnivoco = scrittura.testata.codiceUnivocoScaricamento;
            let payload: any; // Dichiarato qui per essere accessibile nel catch

            try {
                // Conversione di tipo esplicita e sicura per protocolloNumero
                const protocolloNumeroInt = scrittura.testata.protocolloNumero ? parseInt(scrittura.testata.protocolloNumero, 10) : null;
                
                // Pre-mappo le righe contabili e le loro allocazioni per la creazione nidificata
                const righeContabiliDaCreare = scrittura.righe.map(riga => {
                    const allocazioniDaCreare = riga.allocazioni.map(alloc => ({
                        commessaId: alloc.centroDiCosto, // Mappiamo il centro di costo sull'ID commessa
                        importo: alloc.parametro,
                        suggerimentoAutomatico: true,
                    }));

                    return {
                        riga: riga.progressivoRiga,
                        codiceConto: riga.conto,
                        descrizioneConto: riga.note || `Conto ${riga.conto}`,
                        importoDare: riga.importoDare,
                        importoAvere: riga.importoAvere,
                        note: riga.note,
                        insDatiMovimentiAnalitici: riga.insDatiMovimentiAnalitici === '1' || allocazioniDaCreare.length > 0,
                        allocazioni: {
                            create: allocazioniDaCreare,
                        }
                    };
                });

                // Pre-mappo le righe IVA per la creazione nidificata
                const righeIvaDaCreare = scrittura.righeIva.map((rigaIva, index) => ({
                    riga: index + 1, // aggiungo un progressivo sequenziale
                    codiceIva: rigaIva.codiceIva, // PRG 16 dal tracciato
                    codiceConto: rigaIva.contropartita, // PRG 20 dal tracciato  
                    imponibile: rigaIva.imponibile, // PRG 30 dal tracciato
                    imposta: rigaIva.imposta, // PRG 42 dal tracciato
                    indetraibilita: 0, // default se non presente nel tracciato
                }));

                const upsertData = {
                    codiceCausale: scrittura.testata.codiceCausale,
                    descrizioneCausale: scrittura.testata.descrizioneCausale,
                    dataRegistrazione: scrittura.testata.dataRegistrazione,
                    dataDocumento: scrittura.testata.documentoData,
                    numeroDocumento: scrittura.testata.documentoNumero,
                    protocolloNumero: isNaN(protocolloNumeroInt as number) ? null : protocolloNumeroInt,
                    totaleDocumento: scrittura.testata.totaleDocumento,
                    noteMovimento: scrittura.testata.noteMovimento,
                    clienteFornitoreCodiceFiscale: scrittura.testata.clienteFornitoreCodiceFiscale,
                    clienteFornitoreSigla: scrittura.testata.clienteFornitoreSigla,
                    tipoRegistroIva: scrittura.testata.tipoRegistroIva,
                };

                payload = {
                    where: { codiceUnivocoScaricamento: codiceUnivoco },
                    update: {
                        ...upsertData,
                        righe: {
                            deleteMany: {},
                            create: righeContabiliDaCreare,
                        },
                        righeIva: {
                            deleteMany: {},
                            create: righeIvaDaCreare,
                        }
                    },
                    create: {
                        ...upsertData,
                        righe: {
                            create: righeContabiliDaCreare,
                        },
                        righeIva: {
                            create: righeIvaDaCreare,
                        }
                    }
                };

                await prisma.importScritturaTestata.upsert(payload);
                
                importati++;
            } catch (error) {
                falliti++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                 erroriDiImportazione.push({
                    id: codiceUnivoco,
                    errore: errorMessage
                });
                console.error(`--- ERRORE IMPORTAZIONE SCRITTURA ---`);
                console.error(`ID: ${codiceUnivoco}`);
                console.error(`ERRORE:`, error);
                console.error(`DATI INVIATI A PRISMA:`, JSON.stringify(payload, null, 2));
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