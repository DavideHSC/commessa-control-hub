import { Router, Request, Response } from 'express';
import multer from 'multer';
import { FieldDefinition, parseFixedWidth } from '../lib/fixedWidthParser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Schema per PNTESTA.TXT
const pntestaSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 21, length: 12, type: 'string' },
    { name: 'codiceCausale', start: 40, length: 6, type: 'string' },
    { name: 'descrizioneCausale', start: 46, length: 40, type: 'string' },
    { name: 'dataRegistrazione', start: 86, length: 8, type: 'date' },
    { name: 'tipoRegistroIva', start: 96, length: 1, type: 'string' },
    { name: 'clienteFornitoreCodiceFiscale', start: 100, length: 16, type: 'string' },
    { name: 'clienteFornitoreSigla', start: 117, length: 12, type: 'string' },
    { name: 'documentoData', start: 129, length: 8, type: 'date' },
    { name: 'documentoNumero', start: 137, length: 12, type: 'string' },
    { name: 'protocolloNumero', start: 158, length: 6, type: 'number' },
    { name: 'totaleDocumento', start: 173, length: 12, type: 'number' },
    { name: 'noteMovimento', start: 193, length: 60, type: 'string' },
];

// Schema per PNRIGCON.TXT
const pnrigconSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 4, length: 12, type: 'string' },
    { name: 'progressivoRiga', start: 16, length: 3, type: 'number' },
    { name: 'tipoConto', start: 19, length: 1, type: 'string' },
    { name: 'codiceFiscale', start: 20, length: 16, type: 'string' },
    { name: 'subcodiceFiscale', start: 36, length: 1, type: 'string' },
    { name: 'siglaClienteFornitore', start: 37, length: 12, type: 'string' },
    { name: 'conto', start: 49, length: 10, type: 'string' },
    { name: 'importoDare', start: 59, length: 12, type: 'number' },
    { name: 'importoAvere', start: 71, length: 12, type: 'number' },
    { name: 'note', start: 83, length: 60, type: 'string' },
];

// Schema per PNRIGIVA.TXT
const pnrigivaSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 4, length: 12, type: 'string' },
    { name: 'codiceIva', start: 16, length: 4, type: 'string' },
    { name: 'contropartita', start: 20, length: 10, type: 'string' },
    { name: 'imponibile', start: 30, length: 12, type: 'number' },
    { name: 'imposta', start: 42, length: 12, type: 'number' },
    { name: 'importoLordo', start: 90, length: 12, type: 'number' },
    { name: 'note', start: 102, length: 60, type: 'string' },
    { name: 'siglaContropartita', start: 162, length: 12, type: 'string' },
];

// Schema per MOVANAC.TXT
const movanacSchema: FieldDefinition[] = [
    { name: 'codiceUnivocoScaricamento', start: 4, length: 12, type: 'string' },
    { name: 'progressivoRigaContabile', start: 16, length: 3, type: 'number' },
    { name: 'centroDiCosto', start: 19, length: 4, type: 'string' },
    { name: 'parametro', start: 23, length: 12, type: 'number' }, // Importo o quantità
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
    righe: (Pnrigcon & { ripartizioni: Movanac[] })[];
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
        // 1. Parsing di tutti i file
        const testate = parseFixedWidth<Pntesta>(pntestaFile.buffer.toString('utf-8'), pntestaSchema);
        const righeContabili = parseFixedWidth<Pnrigcon>(pnrigconFile.buffer.toString('utf-8'), pnrigconSchema);
        const movimentiAnalitici = parseFixedWidth<Movanac>(movanacFile.buffer.toString('utf-8'), movanacSchema);
        const righeIva = pnrigivaFile ? parseFixedWidth<Pnrigiva>(pnrigivaFile.buffer.toString('utf-8'), pnrigivaSchema) : [];
        
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
                // Si assume una sola ripartizione analitica per riga contabile per semplicità
                const ripartizione = analiticiByRiga[key] ? analiticiByRiga[key][0] : null;
                return { 
                    ...riga,
                    // Aggiungiamo i dati analitici direttamente alla riga
                    insDatiMovimentiAnalitici: !!ripartizione,
                    centroDiCosto: ripartizione?.centroDiCosto,
                    importoAnalitico: ripartizione?.parametro
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
            try {
                // Conversione di tipo esplicita e sicura per protocolloNumero
                const protocolloNumeroInt = scrittura.testata.protocolloNumero ? parseInt(scrittura.testata.protocolloNumero, 10) : null;
                if (isNaN(protocolloNumeroInt as number)) {
                    console.warn(`ID ${scrittura.testata.codiceUnivocoScaricamento}: protocolloNumero "${scrittura.testata.protocolloNumero}" non è un numero valido. Verrà impostato a null.`);
                }

                // --- MAPPATURA CORRETTA E COMPLETA ---

                // Pre-mappo le righe contabili per la creazione nidificata
                const righeContabiliDaCreare = scrittura.righe.map(riga => ({
                    progressivoNumeroRigo: riga.progressivoRiga,
                    tipoConto: riga.tipoConto,
                    conto: riga.conto,
                    clienteFornitoreCodiceFiscale: riga.codiceFiscale,
                    clienteFornitoreSigla: riga.siglaClienteFornitore,
                    importoDare: riga.importoDare,
                    importoAvere: riga.importoAvere,
                    note: riga.note,
                    insDatiMovimentiAnalitici: riga.insDatiMovimentiAnalitici,
                    centroDiCosto: riga.centroDiCosto,
                    importoAnalitico: riga.importoAnalitico,
                }));

                // Pre-mappo le righe IVA per la creazione nidificata
                const righeIvaDaCreare = scrittura.righeIva.map(rigaIva => ({
                    codiceIva: rigaIva.codiceIva,
                    contropartita: rigaIva.contropartita,
                    imponibile: rigaIva.imponibile,
                    imposta: rigaIva.imposta,
                    importoLordo: rigaIva.importoLordo,
                    note: rigaIva.note,
                    siglaContropartita: rigaIva.siglaContropartita,
                }));


                await prisma.importScritturaTestata.upsert({
                    where: { codiceUnivocoScaricamento: scrittura.testata.codiceUnivocoScaricamento },
                    update: {
                        // Mappatura testata
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
                        // Creazione/Sostituzione righe
                        righeContabili: {
                            deleteMany: {},
                            create: righeContabiliDaCreare
                        },
                        righeIva: {
                            deleteMany: {},
                            create: righeIvaDaCreare
                        }
                    },
                    create: {
                        // Mappatura testata
                        codiceUnivocoScaricamento: scrittura.testata.codiceUnivocoScaricamento,
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
                        // Creazione righe
                        righeContabili: {
                            create: righeContabiliDaCreare
                        },
                        righeIva: {
                            create: righeIvaDaCreare
                        }
                    }
                });
                importati++;
            } catch (error) {
                const e = error as Error;
                // Log ridotto all'essenziale
                const prismaError = e.message.match(/Unknown argument `(.*)`/);
                const errorMessage = prismaError ? `Campo sconosciuto: '${prismaError[1]}'` : 'Errore generico di Prisma.';
                console.error(`Errore su scrittura ID ${scrittura.testata.codiceUnivocoScaricamento}: ${errorMessage}`);
                erroriDiImportazione.push({ id: scrittura.testata.codiceUnivocoScaricamento, errore: e.message });
                falliti++;
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