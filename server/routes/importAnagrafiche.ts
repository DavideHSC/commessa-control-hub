import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, FieldDefinition } from '../lib/fixedWidthParser';
import moment from 'moment';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });


router.post('/:templateName', upload.single('file'), async (req: Request, res: Response) => {
    const { templateName } = req.params;
    console.log(`[IMPORT] Ricevuta richiesta per il template: ${templateName}`);

    if (!req.file) {
        console.error('[IMPORT] Errore: File non trovato nella richiesta.');
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    
    const file = req.file;
    const fileContent = file.buffer.toString('latin1');
    console.log(`[IMPORT] Ricevuto file: ${file.originalname}, dimensione: ${file.size} bytes`);

    if (templateName === 'anagrafica_clifor') {
        await handleAnagraficaCliForImport(fileContent, res);
        return;
    }
    
    try {
        const importTemplate = await prisma.importTemplate.findUnique({
            where: { name: templateName },
            include: { fieldDefinitions: true },
        });

        if (!importTemplate) {
            console.error(`[IMPORT] Errore: Template '${templateName}' non trovato nel database.`);
            return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
        }
        
        console.log(`[IMPORT] Trovato template '${importTemplate.name}' con ${importTemplate.fieldDefinitions.length} campi definiti.`);

        const modelName = (importTemplate as any).modelName as keyof PrismaClient | null;
        
        const getFieldType = (format: string | null): 'string' | 'number' | 'date' => {
            if (!format) return 'string';
            if (format.startsWith('date')) return 'date';
            if (format.startsWith('number')) return 'number';
            return 'string';
        }

        const fieldDefinitionsForParser: FieldDefinition[] = importTemplate.fieldDefinitions
            .filter(f => f.fieldName)
            .map(f => ({
                name: f.fieldName!,
                start: f.start,
                length: f.length,
                type: getFieldType(f.format)
            }));

        const parsedData = parseFixedWidth<any>(fileContent, fieldDefinitionsForParser);
        
        if (templateName === 'piano_dei_conti') {
            await handlePianoDeiContiImport(parsedData, res);
            return;
        }

        if (!modelName || !(prisma as any)[modelName]) {
            console.error(`[IMPORT] Errore di configurazione: modelName non specificato o non valido per il template '${templateName}'.`);
            return res.status(400).json({ error: `Il nome del modello per '${templateName}' non è valido.` });
        }
        
        const model = (prisma as any)[modelName];
        
        const result = await model.createMany({
            data: parsedData,
            skipDuplicates: true,
        });

        console.log(`[IMPORT] Importazione completata per '${templateName}'. Record creati: ${result.count}`);
        return res.status(200).json({ message: 'Importazione completata con successo', importedCount: result.count });

    } catch (error) {
        console.error(`[IMPORT] Errore fatale durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: `Errore durante l'importazione di ${templateName}. Controlla i log del server per i dettagli.` });
    }
});

const anagraficaCliForFields: FieldDefinition[] = [
    { name: 'filler', start: 1, length: 3, type: 'string' },
    { name: 'codiceFiscaleAzienda', start: 4, length: 16, type: 'string' },
    { name: 'subcodiceAzienda', start: 20, length: 1, type: 'string' },
    { name: 'codiceUnivocoScaricamento', start: 21, length: 12, type: 'string' },
    { name: 'codiceFiscale', start: 33, length: 16, type: 'string' },
    { name: 'subcodiceCliFor', start: 49, length: 1, type: 'string' },
    { name: 'tipoConto', start: 50, length: 1, type: 'string' },
    { name: 'sottocontoCliente', start: 51, length: 10, type: 'string' },
    { name: 'sottocontoFornitore', start: 61, length: 10, type: 'string' },
    { name: 'externalId', start: 71, length: 12, type: 'string' },
    { name: 'piva', start: 83, length: 11, type: 'string' },
    { name: 'tipoSoggetto', start: 94, length: 1, type: 'string' },
    { name: 'ragioneSociale', start: 95, length: 60, type: 'string' },
    { name: 'cognome', start: 155, length: 20, type: 'string' },
    { name: 'nome', start: 175, length: 20, type: 'string' },
    { name: 'sesso', start: 195, length: 1, type: 'string' },
    { name: 'dataNascita', start: 196, length: 8, type: 'string' },
    { name: 'comuneNascita', start: 204, length: 4, type: 'string' },
    { name: 'comuneResidenza', start: 208, length: 4, type: 'string' },
    { name: 'cap', start: 212, length: 5, type: 'string' },
    { name: 'indirizzo', start: 217, length: 30, type: 'string' },
    { name: 'prefissoTelefono', start: 247, length: 4, type: 'string' },
    { name: 'numeroTelefono', start: 251, length: 11, type: 'string' },
    { name: 'identificativoFiscaleEstero', start: 262, length: 20, type: 'string' },
    { name: 'codiceIso', start: 282, length: 2, type: 'string' },
    { name: 'codicePagamento', start: 284, length: 8, type: 'string' },
    { name: 'codicePagamentoCliente', start: 292, length: 8, type: 'string' },
    { name: 'codicePagamentoFornitore', start: 300, length: 8, type: 'string' },
    { name: 'codiceValuta', start: 308, length: 4, type: 'string' },
    { name: 'gestione770', start: 312, length: 1, type: 'string' },
    { name: 'soggettoRitenuta', start: 313, length: 1, type: 'string' },
    { name: 'quadro770', start: 314, length: 1, type: 'string' },
    { name: 'contributoPrevidenziale', start: 315, length: 1, type: 'string' },
    { name: 'codiceRitenuta', start: 316, length: 5, type: 'string' },
    { name: 'enasarco', start: 321, length: 1, type: 'string' },
    { name: 'tipoRitenuta', start: 322, length: 1, type: 'string' },
    { name: 'soggettoInail', start: 323, length: 1, type: 'string' },
    { name: 'contributoPrevidenzialeL335', start: 324, length: 1, type: 'string' },
    { name: 'aliquota', start: 325, length: 6, type: 'string' },
    { name: 'percContributoCassaPrev', start: 331, length: 6, type: 'string' },
    { name: 'attivitaMensilizzazione', start: 337, length: 2, type: 'string' },
];

// Funzione per convertire date dal formato DDMMYYYY a Date
function convertDateString(dateStr: string | null): Date | null {
    if (!dateStr || dateStr.trim().length !== 8) return null;
    
    try {
        const day = dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const year = dateStr.substring(4, 8);
        
        // Crea la data nel formato ISO (YYYY-MM-DD)
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate);
        
        // Verifica che la data sia valida
        if (isNaN(date.getTime())) return null;
        
        return date;
    } catch (error) {
        console.warn(`Errore nella conversione della data: ${dateStr}`);
        return null;
    }
}

async function handleAnagraficaCliForImport(fileContent: string, res: Response) {
    let processedCount = 0;
    const batchSize = 100;

    try {
        const parsedData = parseFixedWidth<any>(fileContent, anagraficaCliForFields);

        const validRecords = parsedData.map(record => {
            const externalId = record.externalId?.trim();
            if (!externalId) return null;

            const data = {
                externalId: externalId,
                nome: record.ragioneSociale?.trim() || 'Soggetto senza nome',
                piva: record.piva || null,
                codiceFiscale: record.codiceFiscale || null,
                tipoAnagrafica: record.tipoSoggetto === '0' ? 'Persona Fisica' : 'Soggetto Diverso',
                cognome: record.cognome || null,
                nomeAnagrafico: record.nome || null,
                sesso: record.sesso || null,
                dataNascita: convertDateString(record.dataNascita),
                comuneNascita: record.comuneNascita || null,
                indirizzo: record.indirizzo || null,
                cap: record.cap || null,
                comune: record.comuneResidenza || null,
                nazione: record.codiceIso || null,
                telefono: `${record.prefissoTelefono || ''}${record.numeroTelefono || ''}`.trim() || null,
                codicePagamento: record.codicePagamento || record.codicePagamentoCliente || record.codicePagamentoFornitore || null,
                codiceValuta: record.codiceValuta || null,
                
                // Dati specifici fornitore
                gestione770: record.gestione770 === 'X',
                soggettoRitenuta: record.soggettoRitenuta === 'X',
                quadro770: record.quadro770 || null,
                contributoPrevidenziale: record.contributoPrevidenziale === 'X',
                codiceRitenuta: record.codiceRitenuta || null,
                enasarco: record.enasarco === 'X',
                tipoRitenuta: record.tipoRitenuta || null,
                soggettoInail: record.soggettoInail === 'X',
                contributoPrevidenzialeL335: record.contributoPrevidenzialeL335 || null,
                aliquota: record.aliquota ? parseFloat(record.aliquota) : null,
                percContributoCassaPrev: record.percContributoCassaPrev ? parseFloat(record.percContributoCassaPrev) : null,
                attivitaMensilizzazione: record.attivitaMensilizzazione ? parseInt(record.attivitaMensilizzazione) : null,
                
                // Campo per lo smistamento
                tipoConto: record.tipoConto?.toUpperCase(),
            };
            
            const id = `${data.externalId}`;

            return { id, ...data };
            
        }).filter((record): record is NonNullable<typeof record> => record !== null);

        console.log(`[IMPORT Clienti/Fornitori] Trovati ${validRecords.length} record validi da processare.`);

        for (let i = 0; i < validRecords.length; i += batchSize) {
            const batch = validRecords.slice(i, i + batchSize);
            await prisma.$transaction(async (tx) => {
                for (const record of batch) {
                    const { tipoConto, ...dataToSave } = record;

                    const commonData = {
                        id: dataToSave.id,
                        externalId: dataToSave.externalId,
                        nome: dataToSave.nome,
                        piva: dataToSave.piva,
                        codiceFiscale: dataToSave.codiceFiscale,
                        tipoAnagrafica: dataToSave.tipoAnagrafica,
                        cognome: dataToSave.cognome,
                        nomeAnagrafico: dataToSave.nomeAnagrafico,
                        sesso: dataToSave.sesso,
                        dataNascita: dataToSave.dataNascita,
                        comuneNascita: dataToSave.comuneNascita,
                        indirizzo: dataToSave.indirizzo,
                        cap: dataToSave.cap,
                        comune: dataToSave.comune,
                        nazione: dataToSave.nazione,
                        telefono: dataToSave.telefono,
                        codicePagamento: dataToSave.codicePagamento,
                        codiceValuta: dataToSave.codiceValuta,
                    };

                    const fornitoreData = {
                        ...commonData,
                        gestione770: dataToSave.gestione770,
                        soggettoRitenuta: dataToSave.soggettoRitenuta,
                        quadro770: dataToSave.quadro770,
                        contributoPrevidenziale: dataToSave.contributoPrevidenziale,
                        codiceRitenuta: dataToSave.codiceRitenuta,
                        enasarco: dataToSave.enasarco,
                        tipoRitenuta: dataToSave.tipoRitenuta,
                        soggettoInail: dataToSave.soggettoInail,
                        contributoPrevidenzialeL335: dataToSave.contributoPrevidenzialeL335,
                        aliquota: dataToSave.aliquota,
                        percContributoCassaPrev: dataToSave.percContributoCassaPrev,
                        attivitaMensilizzazione: dataToSave.attivitaMensilizzazione,
                    };
                    
                    const upsertCliente = () => tx.cliente.upsert({
                        where: { id: record.id },
                        update: commonData,
                        create: commonData,
                    });
                    
                    const upsertFornitore = () => tx.fornitore.upsert({
                        where: { id: record.id },
                        update: fornitoreData,
                        create: fornitoreData,
                    });
                    
                    if (tipoConto === 'C') {
                        await upsertCliente();
                    } else if (tipoConto === 'F') {
                        await upsertFornitore();
                    } else if (tipoConto === 'E') {
                        await upsertCliente();
                        await upsertFornitore();
                    }
                }
            });
            processedCount += batch.length;
            console.log(`[IMPORT Clienti/Fornitori] Processati ${processedCount}/${validRecords.length} record.`);
        }

        res.status(200).json({ message: 'Importazione completata con successo', importedCount: validRecords.length });

    } catch (error) {
        console.error('Errore durante l\'importazione di anagrafica clienti/fornitori:', error);
        res.status(500).json({ error: 'Errore interno del server durante l\'importazione' });
    }
}

async function handlePianoDeiContiImport(parsedData: any[], res: Response) {
    let processedCount = 0;
    const batchSize = 100;

    const validRecords = parsedData.map(record => {
        const id = record.codice;
        if (!id) return null;
        return {
            id,
            externalId: id,
            codice: id,
            descrizione: record.descrizione || 'Conto senza nome',
        };
    }).filter((record): record is NonNullable<typeof record> => record !== null);

    console.log(`[IMPORT Piano dei Conti] Trovati ${validRecords.length} record validi da processare.`);
    
    const getTipoConto = (record: typeof validRecords[number]): TipoConto => {
        const codice = record.codice;
        if (codice.startsWith('C')) return TipoConto.Costo;
        if (codice.startsWith('R')) return TipoConto.Ricavo;
        return TipoConto.Patrimoniale;
    };

    for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
        await prisma.$transaction(async (tx) => {
            for (const record of batch) {
                const tipoConto = getTipoConto(record);
                const dataToUpsert = {
                    id: record.id,
                    externalId: record.externalId,
                    codice: record.codice,
                    nome: record.descrizione,
                    tipo: tipoConto,
                    richiedeVoceAnalitica: false, 
                    vociAnaliticheAbilitateIds: [],
                    contropartiteSuggeriteIds: []
                };

                try {
                    await tx.conto.upsert({
                        where: { id: record.id },
                        update: {
                            codice: dataToUpsert.codice,
                            nome: dataToUpsert.nome,
                            tipo: dataToUpsert.tipo,
                        },
                        create: dataToUpsert,
                    });
                    processedCount++;
                } catch (error) {
                    console.error(`Errore durante l'upsert del conto con id ${record.id}:`, error);
                }
            }
        });
    }

    console.log(`[IMPORT Piano dei Conti] Importazione completata. Record processati: ${processedCount}`);
    res.status(200).json({ message: 'Importazione completata con successo', importedCount: processedCount });
}

export default router;