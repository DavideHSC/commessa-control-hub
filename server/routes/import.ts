import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import multer from 'multer';
import * as fs from 'fs';
import csv from 'csv-parser';

// --- Inizio Codice Parser Incollato ---

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
interface FieldDefinition {
  name: string;
  start: number;
  length: number;
  type?: 'string' | 'number' | 'date';
}

/**
 * Esegue il parsing di una stringa di testo a larghezza fissa.
 */
function parseFixedWidth<T>(
  content: string,
  definitions: FieldDefinition[]
): T[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const results: T[] = [];

  for (const line of lines) {
    const parsedObject: { [key: string]: any } = {};

    for (const def of definitions) {
      const rawValue = line.substring(def.start, def.start + def.length).trim();
      
      switch (def.type) {
        case 'number':
          parsedObject[def.name] = parseFloat(rawValue) || 0;
          break;
        case 'date':
          if (rawValue.length === 8) {
            const year = parseInt(rawValue.substring(4));
            if (year > 1900) {
                parsedObject[def.name] = new Date(
                parseInt(rawValue.substring(0, 4)),
                parseInt(rawValue.substring(4, 6)) - 1,
                parseInt(rawValue.substring(6, 8))
              );
            } else {
                parsedObject[def.name] = new Date(
                parseInt(rawValue.substring(4, 8)),
                parseInt(rawValue.substring(2, 4)) - 1,
                parseInt(rawValue.substring(0, 2))
              );
            }
          } else {
            parsedObject[def.name] = null;
          }
          break;
        case 'string':
        default:
          parsedObject[def.name] = rawValue;
          break;
      }
    }
    results.push(parsedObject as T);
  }

  return results;
}

// --- Funzione di salvataggio estratta ---

async function saveDataInTransaction(data: { testate: any[], righeContabili: any[], righeIva: any[], allocazioni: any[] }) {
    const { testate, righeContabili, righeIva, allocazioni } = data;
    
    // Mappa i dati per un accesso efficiente
    const testateMap = new Map(testate.map(t => [t.id_registrazione.trim(), t]));
    
    const righeContabiliMap = new Map<string, any[]>();
    righeContabili.forEach(r => {
        const testataId = r.id_registrazione_riga.substring(0, 14).trim();
        if (!righeContabiliMap.has(testataId)) {
            righeContabiliMap.set(testataId, []);
        }
        righeContabiliMap.get(testataId)!.push(r);
    });

    const righeIvaMap = new Map<string, any[]>();
    righeIva.forEach(r => {
        const rigaId = r.id_registrazione_riga.trim();
        if (!righeIvaMap.has(rigaId)) {
            righeIvaMap.set(rigaId, []);
        }
        righeIvaMap.get(rigaId)!.push(r);
    });

    const allocazioniMap = new Map<string, any[]>();
    allocazioni.forEach(a => {
        const rigaId = a.id_registrazione_riga.trim();
        if (!allocazioniMap.has(rigaId)) {
            allocazioniMap.set(rigaId, []);
        }
        allocazioniMap.get(rigaId)!.push(a);
    });

    let createdHeaders = 0;
    let createdAccountingRows = 0;
    let createdVatRows = 0;
    let createdAnalyticRows = 0;

    await prisma.$transaction(async (tx) => {
        for (const [testataId, testata] of testateMap.entries()) {

            // Se la scrittura esiste, prima eliminiamo le sue righe per poterle ricreare.
            // Grazie a onDelete: Cascade, verranno eliminate anche righeIva e allocazioni.
            const existingScrittura = await tx.scritturaContabile.findUnique({
                where: { externalId: testataId }
            });

            if (existingScrittura) {
                await tx.rigaScrittura.deleteMany({
                    where: { scritturaContabileId: existingScrittura.id }
                });
            }

            const scritturaData = {
                data: testata.data_registrazione,
                descrizione: `Importazione - ${testataId}`,
                causaleId: testata.codice_causale.trim(),
                dataDocumento: testata.data_documento,
                numeroDocumento: testata.numero_documento.trim(),
                fornitoreId: testata.id_cliente_fornitore?.trim() || undefined
            };

            const scrittura = await tx.scritturaContabile.upsert({
                where: { externalId: testataId },
                update: scritturaData,
                create: {
                    ...scritturaData,
                    externalId: testataId,
                }
            });
            createdHeaders++;

            const righeContabiliPerTestata = righeContabiliMap.get(testataId) || [];
            for (const riga of righeContabiliPerTestata) {
                const rigaId = riga.id_registrazione_riga.trim();
                const rigaScrittura = await tx.rigaScrittura.create({
                    data: {
                        scritturaContabileId: scrittura.id,
                        descrizione: riga.descrizione_riga.trim(),
                        dare: riga.importo_dare,
                        avere: riga.importo_avere,
                        contoId: riga.codice_conto.trim(),
                    }
                });
                createdAccountingRows++;

                const righeIvaPerRiga = righeIvaMap.get(rigaId) || [];
                for (const rigaIva of righeIvaPerRiga) {
                    await tx.rigaIva.create({
                        data: {
                            rigaScritturaId: rigaScrittura.id,
                            imponibile: rigaIva.imponibile,
                            imposta: rigaIva.imposta,
                            codiceIvaId: rigaIva.codice_iva.trim(),
                        }
                    });
                    createdVatRows++;
                }

                const allocazioniPerRiga = allocazioniMap.get(rigaId) || [];
                for (const alloc of allocazioniPerRiga) {
                    await tx.allocazione.create({
                        data: {
                            rigaScritturaId: rigaScrittura.id,
                            importo: alloc.importo_allocato,
                            commessaId: alloc.codice_commessa.trim(),
                            voceAnaliticaId: alloc.codice_voce_analitica.trim(), 
                        }
                    });
                    createdAnalyticRows++;
                }
            }
        }
    });

    return { createdHeaders, createdAccountingRows, createdVatRows, createdAnalyticRows };
}

// --- Fine Codice Parser Incollato ---

const router = express.Router();
const prisma = new PrismaClient();

// Configurazione multer per l'upload dei file in memoria
const upload = multer({ storage: multer.memoryStorage() });

// Interfacce per tipizzare i dati CSV
interface CSVRow {
  data_registrazione: string;
  descrizione_scrittura: string;
  codice_conto: string;
  importo_dare: string;
  importo_avere: string;
  id_commessa?: string;
  voce_analitica?: string;
  external_id_fornitore?: string;
  external_id_cliente?: string;
}

// NUOVO Endpoint di importazione generico
router.post('/:templateName', upload.array('files', 10), async (req: Request, res: Response) => {
    const { templateName } = req.params;

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    
    const files = req.files as Express.Multer.File[];

    try {
        if (templateName === 'scritture_contabili') {
            
            // 1. Recupera il template e le definizioni dal DB
            const importTemplate = await prisma.importTemplate.findUnique({
                where: { nome: templateName },
                include: { fields: true },
            });

            if (!importTemplate) {
                return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
            }
            
            // 2. Raggruppa le definizioni per fileIdentifier
            const definitionsByFile = importTemplate.fields.reduce((acc, field) => {
                const key = (field as any).fileIdentifier || 'default';
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({
                    name: field.nomeCampo,
                    start: field.start,
                    length: field.length,
                    type: field.type as 'string' | 'number' | 'date',
                });
                return acc;
            }, {} as Record<string, FieldDefinition[]>);

            // 3. Associa i file caricati alle loro definizioni
            const filesByDefinition = Object.keys(definitionsByFile).reduce((acc, key) => {
                const file = files.find(f => f.originalname === key);
                if (file) {
                    acc[key] = {
                        file,
                        definitions: definitionsByFile[key]
                    };
                }
                return acc;
            }, {} as Record<string, { file: Express.Multer.File, definitions: FieldDefinition[] }>);

            console.log('File trovati e associati:', Object.keys(filesByDefinition));

            // VERIFICA: Assicurarsi che tutti i file necessari siano presenti
            const requiredFiles = ['PNTESTA.TXT', 'PNRIGCON.TXT']; // PNRIGANA.TXT è opzionale
            for (const requiredFile of requiredFiles) {
                if (!filesByDefinition[requiredFile]) {
                    return res.status(400).json({ error: `File mancante: ${requiredFile} è richiesto per questa importazione.` });
                }
            }

            // 4. Esegui il parsing per ogni file
            const testate = parseFixedWidth<any>(filesByDefinition['PNTESTA.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNTESTA.TXT'].definitions);
            const righeContabili = parseFixedWidth<any>(filesByDefinition['PNRIGCON.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNRIGCON.TXT'].definitions);
            
            let righeIva: any[] = [];
            if (filesByDefinition['PNRIGIVA.TXT']) {
                righeIva = parseFixedWidth<any>(filesByDefinition['PNRIGIVA.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNRIGIVA.TXT'].definitions);
            }

            let allocazioni: any[] = [];
            if (filesByDefinition['PNRIGANA.TXT']) {
                allocazioni = parseFixedWidth<any>(filesByDefinition['PNRIGANA.TXT'].file.buffer.toString('utf-8'), filesByDefinition['PNRIGANA.TXT'].definitions);
            }

            // 5. Salva i dati in una transazione
            const summary = await saveDataInTransaction({ testate, righeContabili, righeIva, allocazioni });

            return res.status(200).json({ 
                message: 'Importazione delle scritture completata con successo.',
                summary
            });
        }

        // --- Logica per upload singolo, mantenuta per compatibilità (solo anagrafiche) ---
        // Questa parte ora esegue il salvataggio diretto solo per i template semplici
        if (files.length > 1) {
            return res.status(400).json({ error: `Il template '${templateName}' accetta un solo file.` });
        }
        const file = files[0];

        // 1. Recupera il template e le definizioni dal DB
        const importTemplate = await prisma.importTemplate.findUnique({
            where: { nome: templateName },
            include: { fields: true },
        });

        if (!importTemplate) {
            return res.status(404).json({ error: `Template '${templateName}' non trovato.` });
        }

        const modelName = (importTemplate as any).modelName as keyof PrismaClient;
        
        // Gestione speciale per clienti/fornitori che non usano un singolo modello
        if (templateName === 'clienti_fornitori') {
            const fileContent = files[0].buffer.toString('utf-8');
            const fieldDefinitions = importTemplate.fields.map(f => ({ name: f.nomeCampo, start: f.start, length: f.length, type: f.type as any }));
            const parsedData = parseFixedWidth<any>(fileContent, fieldDefinitions);

            await prisma.$transaction(async (tx) => {
                for (const record of parsedData) {
                    const dataToUpsert = {
                        id: record.externalId.trim(),
                        externalId: record.externalId.trim(),
                        nome: record.nome.trim(),
                        piva: record.piva.trim(),
                        codiceFiscale: record.codiceFiscale.trim(),
                    };
                    const targetModel = record.tipo === 'C' ? tx.cliente : tx.fornitore;
                    await (targetModel as any).upsert({
                        where: { id: dataToUpsert.id },
                        update: dataToUpsert,
                        create: dataToUpsert,
                    });
                }
            });
             return res.status(200).json({ message: `Importazione per '${templateName}' completata. ${parsedData.length} record processati.` });
        }

        if (!modelName || !(prisma as any)[modelName]) {
            return res.status(400).json({ error: `Il nome del modello per '${templateName}' non è valido o non è configurato.` });
        }

        const model = (prisma as any)[modelName];

        // Esegui il parsing e il salvataggio
        const fileContent = files[0].buffer.toString('utf-8');
        const fieldDefinitions = importTemplate.fields.map(f => ({
            name: f.nomeCampo,
            start: f.start,
            length: f.length,
            type: f.type as 'string' | 'number' | 'date',
        }));
        
        const parsedData = parseFixedWidth<any>(fileContent, fieldDefinitions);

        const dataToCreate = parsedData.map(record => {
          const newRecord: { [key: string]: any } = {};
          for (const key in record) {
            // Rinomina la chiave 'id' in 'codice' se necessario, o gestisci la mappatura
            const newKey = key === 'id' ? 'id' : key; // Esempio: nessuna modifica
            newRecord[newKey] = record[key];
          }
          
          // Gestione speciale per le causali: aggiungi il campo 'nome' se mancante
          if (templateName === 'causali' && !newRecord.nome && newRecord.descrizione) {
            newRecord.nome = newRecord.descrizione;
          }
          
          // Gestione speciale per i codici IVA: aggiungi il campo 'aliquota' se mancante
          if (templateName === 'codici_iva' && newRecord.aliquota === undefined) {
            newRecord.aliquota = 22.0; // Aliquota di default del 22%
          }
          
          return newRecord;
        });

        await prisma.$transaction(async (tx) => {
            const txModel = (tx as any)[modelName];
            for (const record of dataToCreate) {
                // Se il record non ha un ID, saltalo per evitare errori.
                if (!record.id) {
                    console.warn("Skipping record due to missing ID:", record);
                    continue;
                }
                await txModel.upsert({
                    where: { id: record.id },
                    update: record,
                    create: record,
                });
            }
        });

        res.status(200).json({
            message: `Importazione per '${templateName}' completata con successo.`,
            summary: {
                createdHeaders: 0,
                createdAccountingRows: 0,
                createdVatRows: 0,
                createdAnalyticRows: 0
            }
        });
    } catch (error) {
        console.error(`Errore durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: "Errore interno del server durante l'importazione." });
    }
});

// NUOVO: Endpoint per il COMMIT dell'importazione delle scritture
router.post('/commit-scritture', async (req: Request, res: Response) => {
    try {
        const { parsedData } = req.body;

        if (!parsedData) {
            return res.status(400).json({ error: 'Dati parsati non forniti.' });
        }

        const summary = await saveDataInTransaction(parsedData);

        res.json({
            message: 'Importazione delle scritture completata con successo.',
            summary,
        });

    } catch (error) {
        console.error(`Errore durante il commit delle scritture:`, error);
        res.status(500).json({ error: "Errore interno del server durante il salvataggio." });
    }
});

// Endpoint per l'importazione di file CSV
router.post('/csv', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'Nessun file caricato.' });
        return;
    }

    try {
        const results: CSVRow[] = [];
        const filePath = req.file.path;

        // Leggi il file CSV
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: CSVRow) => results.push(data))
            .on('end', async () => {
                try {
                    // Elimina le scritture precedenti con causaleId 'IMPORT'
                    await prisma.scritturaContabile.deleteMany({
                        where: { causaleId: 'IMPORT' }
                    });

                    console.log(`Processando ${results.length} righe CSV...`);
                    let scriptureCreate = 0;
                    let righeCreate = 0;

                    // Raggruppa le righe per scrittura (stessa data + descrizione)
                    const scrittureMap = new Map<string, CSVRow[]>();
                    
                    for (const row of results) {
                        if (!row.data_registrazione || !row.descrizione_scrittura || !row.codice_conto) {
                            continue; // Salta righe incomplete
                        }
                        
                        const key = `${row.data_registrazione}_${row.descrizione_scrittura}`;
                        if (!scrittureMap.has(key)) {
                            scrittureMap.set(key, []);
                        }
                        scrittureMap.get(key)!.push(row);
                    }

                    // Processa ogni scrittura
                    for (const [key, righe] of scrittureMap) {
                        const primaRiga = righe[0];
                        
                        // Prepara le righe della scrittura
                        const righeScrittura: Prisma.RigaScritturaCreateWithoutScritturaContabileInput[] = [];
                        
                        for (const riga of righe) {
                            const importoDare = parseFloat(riga.importo_dare) || 0;
                            const importoAvere = parseFloat(riga.importo_avere) || 0;
                            
                            if (importoDare === 0 && importoAvere === 0) {
                                continue; // Salta righe senza importi
                            }

                            // Trova o crea il conto
                            let conto = await prisma.conto.findFirst({
                                where: { codice: riga.codice_conto }
                            });

                            if (!conto) {
                                conto = await prisma.conto.create({
                                    data: {
                                        id: `conto_${riga.codice_conto}_${Date.now()}`,
                                        codice: riga.codice_conto,
                                        nome: `Conto ${riga.codice_conto}`,
                                        tipo: importoDare > 0 ? 'Costo' : 'Ricavo'
                                    }
                                });
                            }

                            // Trova la commessa se specificata
                            let commessa: { id: string } | null = null;
                            if (riga.id_commessa) {
                                commessa = await prisma.commessa.findFirst({
                                    where: { id: riga.id_commessa }
                                });
                            }

                            // Gestisci clienti/fornitori con external_id
                            let cliente: { id: string } | null = null;
                            let fornitore: { id: string } | null = null;

                            if (riga.external_id_cliente) {
                                cliente = await prisma.cliente.findFirst({
                                    where: { externalId: riga.external_id_cliente }
                                });
                            }

                            if (riga.external_id_fornitore) {
                                fornitore = await prisma.fornitore.findFirst({
                                    where: { externalId: riga.external_id_fornitore }
                                });
                            }

                            // Prepara i dati della riga
                            const rigaData: Prisma.RigaScritturaCreateWithoutScritturaContabileInput = {
                                descrizione: `${riga.descrizione_scrittura} - ${riga.codice_conto}`,
                                dare: importoDare,
                                avere: importoAvere,
                                conto: {
                                    connect: { id: conto.id }
                                }
                            };

                            // Aggiungi allocazione se ci sono commessa e/o voce analitica
                            if (commessa && (importoDare > 0 || importoAvere > 0)) {
                                rigaData.allocazioni = {
                                    create: [{
                                        commessa: {
                                            connect: { id: commessa.id }
                                        },
                                        voceAnalitica: {
                                            connect: { id: riga.voce_analitica || '1' }
                                        },
                                        importo: importoDare > 0 ? importoDare : importoAvere,
                                        descrizione: `Allocazione: ${riga.descrizione_scrittura}`
                                    }]
                                };
                            }

                            righeScrittura.push(rigaData);
                            righeCreate++;
                        }

                        // Crea la scrittura contabile
                        if (righeScrittura.length > 0) {
                            await prisma.scritturaContabile.create({
                                data: {
                                    data: new Date(primaRiga.data_registrazione),
                                    descrizione: primaRiga.descrizione_scrittura,
                                    causaleId: 'IMPORT',
                                    righe: {
                                        create: righeScrittura
                                    }
                                }
                            });
                            scriptureCreate++;
                        }
                    }

                    // Pulisci il file temporaneo
                    fs.unlinkSync(filePath);

                    res.json({ 
                        message: 'Importazione completata con successo',
                        recordsProcessed: results.length,
                        summary: {
                            scrittureCreate: scriptureCreate,
                            righeCreate: righeCreate
                        }
                    });

                } catch (error) {
                    console.error('Errore durante l\'elaborazione del CSV:', error);
                    if (error instanceof PrismaClientKnownRequestError) {
                        if (error.code === 'P2003') {
                            res.status(409).json({ error: `Dato di riferimento non trovato (es. commessa o conto inesistente). Dettagli: ${error.message}` });
                        } else {
                            res.status(400).json({ error: `Errore del database durante l'importazione: ${error.message}` });
                        }
                    } else {
                        res.status(500).json({ error: 'Errore interno del server durante l\'elaborazione del file' });
                    }
                }
            });
    } catch (error) {
        console.error('Errore durante la lettura del file:', error);
        res.status(500).json({ error: 'Errore interno del server durante la lettura del file' });
    }
});

export default router; 