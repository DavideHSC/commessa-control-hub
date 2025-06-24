import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import multer from 'multer';
import { parseFixedWidth, parseFixedWidthRobust, FieldDefinition, ImportStats } from '../lib/fixedWidthParser';
import * as decoders from '../lib/businessDecoders';
import moment from 'moment';

const router = express.Router();

// Helper functions per Piano dei Conti (replica logica Python)
function formatCodificaGerarchica(codifica: string, livello?: string): string {
    if (!codifica) return "";
    
    const cleanCode = codifica.trim();
    if (livello === '1') {  // Mastro
        return cleanCode.slice(0, 2) || cleanCode;
    } else if (livello === '2') {  // Conto
        return cleanCode.slice(0, 4) || cleanCode;
    } else {  // Sottoconto
        return cleanCode;
    }
}

function determinaTipoConto(tipoChar?: string, codice?: string): TipoConto {
    const tipo = tipoChar?.trim().toUpperCase();
    
    switch (tipo) {
        case 'P': return TipoConto.Patrimoniale;
        case 'E': 
            // Per tipo 'E' (Economico), distingui tra Costo e Ricavo dal codice
            if (codice?.startsWith('1') || codice?.startsWith('5')) {
                return TipoConto.Ricavo;
            }
            return TipoConto.Costo;
        case 'C': return TipoConto.Cliente;
        case 'F': return TipoConto.Fornitore;
        case 'O': return TipoConto.Patrimoniale; // Conto d'ordine -> Patrimoniale
        default: return TipoConto.Patrimoniale;
    }
}
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

        if (templateName === 'causali') {
            await handleCausaliImport(parsedData, res);
            return;
        }

        if (templateName === 'codici_iva') {
            await handleCodiciIvaImport(parsedData, res);
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
                
                // === NUOVI CAMPI FASE 1 ===
                codiceAnagrafica: record.externalId || null,
                tipoContoDesc: decoders.decodeTipoContoAnagrafica(record.tipoConto),
                tipoSoggettoDesc: decoders.decodeTipoSoggetto(record.tipoSoggetto),
                denominazione: record.ragioneSociale || null,
                sessoDesc: decoders.decodeSesso(record.sesso),
                prefissoTelefono: record.prefissoTelefono || null,
                codiceIso: record.codiceIso || null,
                idFiscaleEstero: record.identificativoFiscaleEstero || null,
                
                // Sottoconti
                sottocontoAttivo: record.sottocontoCliente || record.sottocontoFornitore || null,
                sottocontoCliente: record.sottocontoCliente || null,
                sottocontoFornitore: record.sottocontoFornitore || null,
                
                // Codici Pagamento Specifici
                codiceIncassoCliente: record.codicePagamentoCliente || null,
                codicePagamentoFornitore: record.codicePagamentoFornitore || null,
                
                // Flags Calcolati
                ePersonaFisica: record.tipoSoggetto === 'PF',
                eCliente: record.tipoConto === 'C' || record.tipoConto === 'E',
                eFornitore: record.tipoConto === 'F' || record.tipoConto === 'E',
                haPartitaIva: !!(record.piva && record.piva.trim()),
                
                // Dati specifici fornitore
                gestione770: record.gestione770 === 'X',
                soggettoRitenuta: record.soggettoRitenuta === 'X',
                quadro770: record.quadro770 || null,
                quadro770Desc: decoders.decodeQuadro770(record.quadro770),
                contributoPrevidenziale: record.contributoPrevidenziale === 'X',
                codiceRitenuta: record.codiceRitenuta || null,
                enasarco: record.enasarco === 'X',
                tipoRitenuta: record.tipoRitenuta || null,
                tipoRitenuraDesc: decoders.decodeTipoRitenuta(record.tipoRitenuta),
                soggettoInail: record.soggettoInail === 'X',
                contributoPrevidenzialeL335: record.contributoPrevidenzialeL335 || null,
                contributoPrevid335Desc: decoders.decodeContributoPrevid335(record.contributoPrevidenzialeL335),
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

    console.log(`[IMPORT Piano dei Conti] Inizio elaborazione di ${parsedData.length} record.`);

    const validRecords = parsedData.map(record => {
        const codice = record.codice?.trim();
        if (!codice) return null;

        // Applica le decodifiche semantiche come nel parser Python
        const livelloDesc = decoders.decodeLivello(record.livello);
        const tipoDesc = decoders.decodeTipoConto(record.tipoChar);
        const gruppoDesc = decoders.decodeGruppo(record.gruppo);
        const controlloSegnoDesc = decoders.decodeControlloSegno(record.controlloSegno);
        
        // Formatta codifica gerarchica come nel parser Python
        const codificaFormattata = formatCodificaGerarchica(codice, record.livello);
        
        // Determina il tipo enum basato sul tipo carattere e sul codice (logica Python)
        const tipo = determinaTipoConto(record.tipoChar, codice);

        return {
            id: codice,
            externalId: codice,
            codice: codice,
            nome: record.nome?.trim() || 'Conto senza nome',
            tipo,
            
            // === Tutti i nuovi campi dalla Fase 1 ===
            // Gerarchia e Classificazione
            livello: record.livello?.trim() || null,
            livelloDesc,
            sigla: record.sigla?.trim() || null,
            gruppo: record.gruppo?.trim() || null,
            gruppoDesc,
            controlloSegno: record.controlloSegno?.trim() || null,
            controlloSegnoDesc,
            codificaFormattata,
            
            // Validità per Tipo Contabilità (flags booleani come Python)
            validoImpresaOrdinaria: record.validoImpresaOrd === 'X',
            validoImpresaSemplificata: record.validoImpresaSempl === 'X',
            validoProfessionistaOrdinario: record.validoProfOrd === 'X',
            validoProfessionistaSemplificato: record.validoProfSempl === 'X',
            
            // Classi Fiscali
            classeIrpefIres: record.classeIrpefIres?.trim() || null,
            classeIrap: record.classeIrap?.trim() || null,
            classeProfessionista: record.classeProfessionista?.trim() || null,
            classeIrapProfessionista: record.classeIrapProf?.trim() || null,
            classeIva: record.classeIva?.trim() || null,
            
            // Conti Collegati
            contoCostiRicavi: record.contoCostiRicavi?.trim() || null,
            contoDareCee: record.contoDare?.trim() || null,
            contoAvereCee: record.contoAvere?.trim() || null,
            
            // Gestione Speciale
            naturaConto: record.naturaConto?.trim() || null,
            gestioneBeniAmmortizzabili: record.gestioneBeniAmm?.trim() || null,
            percDeduzioneManutenzione: record.percDedManut ? parseFloat(record.percDedManut) : null,
            dettaglioClienteFornitore: record.dettaglioCliFor?.trim() || null,
            
            // Descrizioni Bilancio
            descrizioneBilancioDare: record.descBilancioDare?.trim() || null,
            descrizioneBilancioAvere: record.descBilancioAvere?.trim() || null,
            
            // Dati Extracontabili
            classeDatiExtracontabili: record.classeDatiExtra?.trim() || null,
            
            // Registri Professionisti
            colonnaRegistroCronologico: record.colRegCronologico?.trim() || null,
            colonnaRegistroIncassiPagamenti: record.colRegIncassiPag?.trim() || null,
        };
    }).filter((record): record is NonNullable<typeof record> => record !== null);

    console.log(`[IMPORT Piano dei Conti] Trovati ${validRecords.length} record validi da processare.`);

    for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
        
        await prisma.$transaction(async (tx) => {
            for (const record of batch) {
                const dataToUpsert = {
                    ...record,
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
                            // Aggiorna solo i campi che esistono nel modello Conto
                            livello: dataToUpsert.livello,
                            livelloDesc: dataToUpsert.livelloDesc,
                            sigla: dataToUpsert.sigla,
                            gruppo: dataToUpsert.gruppo,
                            gruppoDesc: dataToUpsert.gruppoDesc,
                            controlloSegno: dataToUpsert.controlloSegno,
                            controlloSegnoDesc: dataToUpsert.controlloSegnoDesc,
                            codificaFormattata: dataToUpsert.codificaFormattata,
                            validoImpresaOrdinaria: dataToUpsert.validoImpresaOrdinaria,
                            validoImpresaSemplificata: dataToUpsert.validoImpresaSemplificata,
                            validoProfessionistaOrdinario: dataToUpsert.validoProfessionistaOrdinario,
                            validoProfessionistaSemplificato: dataToUpsert.validoProfessionistaSemplificato,
                            classeIrpefIres: dataToUpsert.classeIrpefIres,
                            classeIrap: dataToUpsert.classeIrap,
                            classeProfessionista: dataToUpsert.classeProfessionista,
                            classeIrapProfessionista: dataToUpsert.classeIrapProfessionista,
                            classeIva: dataToUpsert.classeIva,
                            contoCostiRicavi: dataToUpsert.contoCostiRicavi,
                            contoDareCee: dataToUpsert.contoDareCee,
                            contoAvereCee: dataToUpsert.contoAvereCee,
                            naturaConto: dataToUpsert.naturaConto,
                            gestioneBeniAmmortizzabili: dataToUpsert.gestioneBeniAmmortizzabili,
                            percDeduzioneManutenzione: dataToUpsert.percDeduzioneManutenzione,
                            dettaglioClienteFornitore: dataToUpsert.dettaglioClienteFornitore,
                            descrizioneBilancioDare: dataToUpsert.descrizioneBilancioDare,
                            descrizioneBilancioAvere: dataToUpsert.descrizioneBilancioAvere,
                            classeDatiExtracontabili: dataToUpsert.classeDatiExtracontabili,
                            colonnaRegistroCronologico: dataToUpsert.colonnaRegistroCronologico,
                            colonnaRegistroIncassiPagamenti: dataToUpsert.colonnaRegistroIncassiPagamenti,
                        },
                        create: dataToUpsert,
                    });
                    processedCount++;
                } catch (error) {
                    console.error(`Errore durante l'upsert del conto ${record.codice}:`, error);
                }
            }
        });

        // Log progress come nel parser Python (ogni 100 record)
        if ((i + batchSize) % 100 === 0 || i + batchSize >= validRecords.length) {
            console.log(`[IMPORT Piano dei Conti] Processati ${Math.min(i + batchSize, validRecords.length)}/${validRecords.length} record.`);
        }
    }

    console.log(`[IMPORT Piano dei Conti] Importazione completata. Record processati: ${processedCount}`);
    res.status(200).json({ 
        message: 'Importazione Piano dei Conti completata con successo', 
        importedCount: processedCount 
    });
}

/**
 * === FASE 5: CAUSALI CONTABILI - IMPORT SPECIALIZZATO ===
 * Basato su parser_causali.py con integrazione completa di tutti i 28 campi
 * e decodifiche semantiche dal businessDecoders.ts
 */
async function handleCausaliImport(parsedData: any[], res: Response) {
    console.log(`[CAUSALI] Iniziata elaborazione di ${parsedData.length} record`);
    
    try {
        const validRecords = parsedData.map((record, index) => {
            const codiceCausale = record.codiceCausale?.trim();
            if (!codiceCausale) {
                console.warn(`[CAUSALI] Riga ${index + 1}: codice causale mancante, record saltato`);
                return null;
            }

            // Conversione date dal formato DDMMYYYY
            const convertDate = (dateStr: string) => {
                if (!dateStr || dateStr.trim() === '' || dateStr === '00000000') return null;
                const cleaned = dateStr.trim();
                if (cleaned.length === 8) {
                    const day = cleaned.substring(0, 2);
                    const month = cleaned.substring(2, 4);
                    const year = cleaned.substring(4, 8);
                    return new Date(`${year}-${month}-${day}`);
                }
                return null;
            };

            // Parsing con decodifiche semantiche complete
            const causaleData = {
                // Campi base (seguendo la "bibbia" Python)
                id: codiceCausale, // Usa codice come ID primario
                codice: codiceCausale,
                nome: record.descrizione?.trim() || codiceCausale,
                descrizione: record.descrizione?.trim() || '',
                externalId: codiceCausale,
                
                // === NUOVI CAMPI FASE 1 (18 campi) ===
                tipoMovimento: record.tipoMovimento?.trim() || null,
                tipoMovimentoDesc: decoders.decodeTipoMovimento(record.tipoMovimento),
                tipoAggiornamento: record.tipoAggiornamento?.trim() || null,
                tipoAggiornamentoDesc: decoders.decodeTipoAggiornamento(record.tipoAggiornamento),
                dataInizio: convertDate(record.dataInizio),
                dataFine: convertDate(record.dataFine),
                tipoRegistroIva: record.tipoRegistroIva?.trim() || null,
                tipoRegistroIvaDesc: decoders.decodeTipoRegistroIva(record.tipoRegistroIva),
                segnoMovimentoIva: record.segnoMovimentoIva?.trim() || null,
                segnoMovimentoIvaDesc: decoders.decodeSegnoMovimentoIva(record.segnoMovimentoIva),
                contoIva: record.contoIva?.trim() || null,
                contoIvaVendite: record.contoIvaVendite?.trim() || null,
                generazioneAutofattura: decoders.decodeBooleanFlag(record.generazioneAutofattura),
                tipoAutofatturaGenerata: record.tipoAutofatturaGenerata?.trim() || null,
                tipoAutofatturaDesc: decoders.decodeTipoAutofattura(record.tipoAutofatturaGenerata),
                fatturaImporto0: decoders.decodeBooleanFlag(record.fatturaImporto0),
                fatturaValutaEstera: decoders.decodeBooleanFlag(record.fatturaValutaEstera),
                nonConsiderareLiquidazioneIva: decoders.decodeBooleanFlag(record.nonConsiderareLiquidazioneIva),
                fatturaEmessaRegCorrispettivi: decoders.decodeBooleanFlag(record.fatturaEmessaRegCorrispettivi),
                ivaEsigibilitaDifferita: record.ivaEsigibilitaDifferita?.trim() || null,
                ivaEsigibilitaDifferitaDesc: decoders.decodeIvaEsigibilita(record.ivaEsigibilitaDifferita),
                gestionePartite: record.gestionePartite?.trim() || null,
                gestionePartiteDesc: decoders.decodeGestionePartite(record.gestionePartite),
                gestioneIntrastat: decoders.decodeBooleanFlag(record.gestioneIntrastat),
                gestioneRitenuteEnasarco: record.gestioneRitenuteEnasarco?.trim() || null,
                gestioneRitenuteEnasarcoDesc: decoders.decodeGestioneRitenuteEnasarco(record.gestioneRitenuteEnasarco),
                versamentoRitenute: decoders.decodeBooleanFlag(record.versamentoRitenute),
                noteMovimento: record.noteMovimento?.trim() || null,
                descrizioneDocumento: record.descrizioneDocumento?.trim() || null,
                identificativoEsteroClifor: decoders.decodeBooleanFlag(record.identificativoEsteroClifor),
                scritturaRettificaAssestamento: decoders.decodeBooleanFlag(record.scritturaRettificaAssestamento),
                nonStampareRegCronologico: decoders.decodeBooleanFlag(record.nonStampareRegCronologico),
                movimentoRegIvaNonRilevante: decoders.decodeBooleanFlag(record.movimentoRegIvaNonRilevante),
                tipoMovimentoSemplificata: record.tipoMovimentoSemplificata?.trim() || null,
                tipoMovimentoSemplificataDesc: decoders.decodeTipoMovimento(record.tipoMovimentoSemplificata) // Riuso stesso decoder
            };

            return causaleData;
        }).filter(record => record !== null);

        console.log(`[CAUSALI] Record validi elaborati: ${validRecords.length}/${parsedData.length}`);

        // Inserimento con upsert per evitare duplicati
        let insertedCount = 0;
        let updatedCount = 0;
        
        for (const causale of validRecords) {
            try {
                const result = await prisma.causaleContabile.upsert({
                    where: { id: causale.id },
                    update: {
                        nome: causale.nome,
                        descrizione: causale.descrizione,
                        tipoMovimento: causale.tipoMovimento,
                        tipoMovimentoDesc: causale.tipoMovimentoDesc,
                        tipoAggiornamento: causale.tipoAggiornamento,
                        tipoAggiornamentoDesc: causale.tipoAggiornamentoDesc,
                        dataInizio: causale.dataInizio,
                        dataFine: causale.dataFine,
                        tipoRegistroIva: causale.tipoRegistroIva,
                        tipoRegistroIvaDesc: causale.tipoRegistroIvaDesc,
                        segnoMovimentoIva: causale.segnoMovimentoIva,
                        segnoMovimentoIvaDesc: causale.segnoMovimentoIvaDesc,
                        contoIva: causale.contoIva,
                        contoIvaVendite: causale.contoIvaVendite,
                        generazioneAutofattura: causale.generazioneAutofattura,
                        tipoAutofatturaGenerata: causale.tipoAutofatturaGenerata,
                        tipoAutofatturaDesc: causale.tipoAutofatturaDesc,
                        fatturaImporto0: causale.fatturaImporto0,
                        fatturaValutaEstera: causale.fatturaValutaEstera,
                        nonConsiderareLiquidazioneIva: causale.nonConsiderareLiquidazioneIva,
                        fatturaEmessaRegCorrispettivi: causale.fatturaEmessaRegCorrispettivi,
                        ivaEsigibilitaDifferita: causale.ivaEsigibilitaDifferita,
                        ivaEsigibilitaDifferitaDesc: causale.ivaEsigibilitaDifferitaDesc,
                        gestionePartite: causale.gestionePartite,
                        gestionePartiteDesc: causale.gestionePartiteDesc,
                        gestioneIntrastat: causale.gestioneIntrastat,
                        gestioneRitenuteEnasarco: causale.gestioneRitenuteEnasarco,
                        gestioneRitenuteEnasarcoDesc: causale.gestioneRitenuteEnasarcoDesc,
                        versamentoRitenute: causale.versamentoRitenute,
                        noteMovimento: causale.noteMovimento,
                        descrizioneDocumento: causale.descrizioneDocumento,
                        identificativoEsteroClifor: causale.identificativoEsteroClifor,
                        scritturaRettificaAssestamento: causale.scritturaRettificaAssestamento,
                        nonStampareRegCronologico: causale.nonStampareRegCronologico,
                        movimentoRegIvaNonRilevante: causale.movimentoRegIvaNonRilevante,
                        tipoMovimentoSemplificata: causale.tipoMovimentoSemplificata,
                        tipoMovimentoSemplificataDesc: causale.tipoMovimentoSemplificataDesc
                    },
                    create: causale
                });
                
                // Conta se è un insert o update (Prisma non lo dice direttamente)
                const existed = await prisma.causaleContabile.findUnique({
                    where: { id: causale.id }
                });
                
                if (existed) {
                    updatedCount++;
                } else {
                    insertedCount++;
                }
                
                // Log ogni 100 record come nei parser Python
                if ((insertedCount + updatedCount) % 100 === 0) {
                    console.log(`[CAUSALI] Elaborati ${insertedCount + updatedCount} record...`);
                }
                
            } catch (error) {
                console.error(`[CAUSALI] Errore inserimento causale ${causale.codice}:`, error instanceof Error ? error.message : String(error));
            }
        }

        // Statistiche come nei parser Python
        const stats = {
            totalRecords: parsedData.length,
            validRecords: validRecords.length,
            insertedRecords: insertedCount,
            updatedRecords: updatedCount,
            errorRecords: parsedData.length - validRecords.length
        };

        console.log(`[CAUSALI] Completato: ${stats.insertedRecords} inseriti, ${stats.updatedRecords} aggiornati, ${stats.errorRecords} errori`);

        return res.status(200).json({
            success: true,
            message: 'Importazione causali completata con successo',
            stats: stats
        });

    } catch (error) {
        console.error('[CAUSALI] Errore fatale durante l\'importazione:', error);
        return res.status(500).json({
            success: false,
            error: 'Errore durante l\'importazione delle causali',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// === IMPORT CODICI IVA - BASATO SU PARSER_CODICIIVA.PY ===
async function handleCodiciIvaImport(parsedData: any[], res: Response) {
    let processedCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;
    const batchSize = 50;

    try {
        console.log(`[CODICI IVA] Inizio elaborazione di ${parsedData.length} record.`);

        // Filtra e mappa i record seguendo la mappatura del SEED
        const validRecords = parsedData.map(record => {
            const codiceIva = record.codiceIva?.trim();
            if (!codiceIva) return null;

            // Parsing seguendo ESATTAMENTE la mappatura del SEED
            const codiceIvaData = {
                // Campi base (seguendo il seed template)
                id: codiceIva, // Usa codiceIva come ID primario
                codice: codiceIva, // Campo 'codice' del database
                externalId: codiceIva,
                descrizione: record.descrizione?.trim() || codiceIva,
                
                // Campi core IVA (nomi dal SEED)
                tipoCalcolo: record.tipoCalcolo?.trim() || null,
                tipoCalcoloDesc: decoders.decodeTipoCalcolo(record.tipoCalcolo),
                aliquota: parseDecimalString(record.aliquota),
                indetraibilita: record.indetraibilita ? parseFloat(record.indetraibilita) : null,
                note: record.note?.trim() || null,
                
                // Date validità (ora presenti nello schema)
                dataInizio: convertDateString(record.dataInizio),
                dataFine: convertDateString(record.dataFine),
                
                // === CAMPI DAL SEED TEMPLATE (mappatura esatta) ===
                // Gestione Plafond
                plafondAcquisti: record.plafondAcquisti?.trim() || null,
                plafondAcquistiDesc: decoders.decodePlafondAcquisti(record.plafondAcquisti),
                monteAcquisti: parseBooleanFlag(record.monteAcquisti),
                plafondVendite: record.plafondVendite?.trim() || null,
                plafondVenditeDesc: decoders.decodePlafondVendite(record.plafondVendite),
                noVolumeAffariPlafond: parseBooleanFlag(record.noVolumeAffariPlafond),
                
                // Pro-rata e Compensazioni
                gestioneProRata: record.gestioneProRata?.trim() || null,
                gestioneProRataDesc: decoders.decodeGestioneProRata(record.gestioneProRata),
                percentualeCompensazione: parseDecimalString(record.percentualeCompensazione),
                
                // Reverse Charge e Operazioni Speciali
                autofatturaReverseCharge: parseBooleanFlag(record.autofatturaReverseCharge),
                operazioneEsenteOccasionale: parseBooleanFlag(record.operazioneEsenteOccasionale),
                cesArt38QuaterStornoIva: parseBooleanFlag(record.cesArt38QuaterStornoIva),
                agevolazioniSubforniture: parseBooleanFlag(record.agevolazioniSubforniture),
                
                // Territorialità
                indicatoreTerritorialeVendite: record.indicatoreTerritorialeVendite?.trim() || null,
                indicatoreTerritorialeVenditeDesc: decoders.decodeIndicatoreTerritorialeVendite(record.indicatoreTerritorialeVendite),
                indicatoreTerritorialeAcquisti: record.indicatoreTerritorialeAcquisti?.trim() || null,
                indicatoreTerritorialeAcquistiDesc: decoders.decodeIndicatoreTerritorialeAcquisti(record.indicatoreTerritorialeAcquisti),
                
                // Beni Ammortizzabili
                beniAmmortizzabili: parseBooleanFlag(record.beniAmmortizzabili),
                analiticoBeniAmmortizzabili: parseBooleanFlag(record.analiticoBeniAmmortizzabili),
                
                // Comunicazioni Dati IVA
                comunicazioneDatiIvaVendite: record.comunicazioneDatiIvaVendite?.trim() || null,
                comunicazioneDatiIvaVenditeDesc: decoders.decodeComunicazioneVendite(record.comunicazioneDatiIvaVendite),
                comunicazioneDatiIvaAcquisti: record.comunicazioneDatiIvaAcquisti?.trim() || null,
                comunicazioneDatiIvaAcquistiDesc: decoders.decodeComunicazioneAcquisti(record.comunicazioneDatiIvaAcquisti),
                
                // Altri Campi Fiscali
                imponibile50Corrispettivi: parseBooleanFlag(record.imponibile50Corrispettivi),
                imposteIntrattenimenti: record.imposteIntrattenimenti?.trim() || null,
                imposteIntrattenimentiDesc: decoders.decodeImposteIntrattenimenti(record.imposteIntrattenimenti),
                ventilazione: parseBooleanFlag(record.ventilazione),
                aliquotaDiversa: parseDecimalString(record.aliquotaDiversa),
                percDetrarreExport: parseDecimalString(record.percDetrarreExport),
                acquistiCessioni: record.acquistiCessioni?.trim() || null,
                acquistiCessioniDesc: decoders.decodeAcquistiCessioni(record.acquistiCessioni),
                metodoDaApplicare: record.metodoDaApplicare?.trim() || null,
                metodoDaApplicareDesc: decoders.decodeMetodoApplicare(record.metodoDaApplicare),
                percentualeForfetaria: record.percentualeForfetaria?.trim() || null,
                percentualeForfetariaDesc: decoders.decodePercentualeForfetaria(record.percentualeForfetaria),
                quotaForfetaria: record.quotaForfetaria?.trim() || null,
                quotaForfetariaDesc: decoders.decodeQuotaForfetaria(record.quotaForfetaria),
                acquistiIntracomunitari: parseBooleanFlag(record.acquistiIntracomunitari),
                cessioneProdottiEditoriali: parseBooleanFlag(record.cessioneProdottiEditoriali),
                provvigioniDm34099: parseBooleanFlag(record.provvigioniDm34099),
                acqOperazImponibiliOccasionali: parseBooleanFlag(record.acqOperazImponibiliOccasionali),
                
                // Flags derivati per compatibilità UI (basati sui campi del seed)
                // splitPayment: parseBooleanFlag(record.splitPayment),
                // nonImponibile: parseBooleanFlag(record.nonImponibile),
                // imponibile: parseBooleanFlag(record.imponibile),
                // imposta: parseBooleanFlag(record.imposta),
                // esente: parseBooleanFlag(record.esente),
                // nonImponibileConPlafond: parseBooleanFlag(record.nonImponibileConPlafond),
                // inSospensione: parseBooleanFlag(record.inSospensione),
                // esclusoDaIva: parseBooleanFlag(record.esclusoDaIva),
                // reverseCharge: parseBooleanFlag(record.reverseCharge),
                // fuoriCampoIva: parseBooleanFlag(record.fuoriCampoIva),
                
                // CAMPI DI STATO
                inUso: true, 
                dataAggiornamento: new Date()
            };

            return codiceIvaData;

        }).filter((record): record is NonNullable<typeof record> => record !== null);

        console.log(`[CODICI IVA] Trovati ${validRecords.length} record validi da processare.`);

        // Processamento a batch
        for (let i = 0; i < validRecords.length; i += batchSize) {
            const batch = validRecords.slice(i, i + batchSize);
            
            for (const codiceIva of batch) {
                try {
                    // DEBUG: Verifica esplicita con logging dettagliato
                    const existed = await prisma.codiceIva.findUnique({
                        where: { id: codiceIva.id }
                    });

                    if (existed) {
                        console.log(`[DEBUG] Trovato record esistente per ID: ${codiceIva.id}. Contato come AGGIORNAMENTO.`);
                        updatedCount++;
                    } else {
                        console.log(`[DEBUG] Record per ID: ${codiceIva.id} non trovato. Contato come INSERIMENTO.`);
                        insertedCount++;
                    }

                    await prisma.codiceIva.upsert({
                        where: { id: codiceIva.id },
                        create: codiceIva,
                        update: codiceIva
                    });

                    processedCount++;

                    // Log di avanzamento ogni 50 record
                    if (processedCount % 50 === 0) {
                        console.log(`[CODICI IVA] Elaborati ${processedCount}/${validRecords.length} record...`);
                    }

                } catch (error) {
                    console.error(`[CODICI IVA] Errore inserimento codice IVA ${codiceIva.codice}:`, error instanceof Error ? error.message : String(error));
                    continue;
                }
            }
        }

        console.log(`[CODICI IVA] Importazione completata:`);
        console.log(`[CODICI IVA] - Record processati: ${processedCount}`);
        console.log(`[CODICI IVA] - Nuovi inserimenti: ${insertedCount}`);
        console.log(`[CODICI IVA] - Aggiornamenti: ${updatedCount}`);

        return res.status(200).json({
            success: true,
            message: 'Importazione codici IVA completata con successo',
            stats: {
                processed: processedCount,
                inserted: insertedCount,
                updated: updatedCount,
                total: validRecords.length
            }
        });

    } catch (error) {
        console.error('[CODICI IVA] Errore durante l\'importazione:', error instanceof Error ? error.message : String(error));
        return res.status(500).json({
            success: false,
            error: 'Errore durante l\'importazione dei codici IVA',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Funzione helper per parsare stringhe decimali come fa la "bibbia" Python
// Prende una stringa come "002200" e la converte in 22.00
function parseDecimalString(valueStr: string | null | undefined): number | null {
    // robust check to ensure valueStr is a non-empty string
    if (typeof valueStr !== 'string' || valueStr.trim() === '') {
        return null;
    }
    
    const cleanedStr = valueStr.trim();
    // Inserisce il punto decimale prima delle ultime due cifre
    const integerPart = cleanedStr.slice(0, -2);
    const decimalPart = cleanedStr.slice(-2);
    
    try {
        const result = parseFloat(`${integerPart}.${decimalPart}`);
        return isNaN(result) ? null : result;
    } catch (error) {
        return null;
    }
}

// Funzione helper per parsing boolean flags (dalla "bibbia" Python)
function parseBooleanFlag(char: string | undefined): boolean {
    if (!char) return false;
    return char.trim().toUpperCase() === 'X';
}

export default router;