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

// Funzione per replicare ESATTAMENTE il comportamento del parser Python: `valore == 'X'`
const parseBooleanFlagPythonic = (char: any): boolean => {
  if (typeof char !== 'string') {
    return false;
  }
  return char.trim().toUpperCase() === 'X';
};

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

        // Adatta i campi dal DB a quelli attesi dal parser (`fieldName` -> `name`)
        // e crea un oggetto pulito solo con i campi necessari.
        const templateFields = importTemplate.fieldDefinitions
            .filter(field => !!field.fieldName) // Assicura che il nome del campo esista
            .map(field => {
                // Determina il tipo in modo esplicito e sicuro
                let fieldType: 'string' | 'number' | 'date' | 'boolean' = 'string';
                if (field.format?.startsWith('date')) {
                    fieldType = 'date';
                } else if (field.format?.includes('number') || field.format?.includes('percentage')) {
                    fieldType = 'number';
                }
                
                return {
                    name: field.fieldName!, // L'asserzione '!' è sicura grazie al filtro precedente
                    start: field.start,
                    length: field.length,
                    type: fieldType
                };
            });

        // Debug: analizza il file raw prima del parsing
        if (templateName === 'anagrafica_clifor') {
            const rawLines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
            if (rawLines.length > 0) {
                const firstLine = rawLines[0];
                console.log(`[DEBUG-RAW] Prima riga file (lunghezza: ${firstLine.length}):`, JSON.stringify(firstLine.substring(0, 100)));
                console.log(`[DEBUG-RAW] Carattere posizione 50 (tipoConto):`, `'${firstLine[49]}' (ASCII: ${firstLine.charCodeAt(49)})`);
                console.log(`[DEBUG-RAW] Caratteri posizioni 49-52:`, JSON.stringify(firstLine.substring(49, 52)));
                console.log(`[DEBUG-RAW] Caratteri posizioni 70-82 (codiceAnagrafica):`, JSON.stringify(firstLine.substring(70, 82)));
            }
        }
        
        // Esegui il parsing del file
        const parsedData = parseFixedWidth(fileContent, templateFields);
        console.log(`[IMPORT] Parsing completato. Numero di record estratti: ${parsedData.length}`);
        
        // Smistamento alla funzione corretta in base al template
        if (templateName === 'piano_dei_conti') {
            await handlePianoDeiContiImport(parsedData, res);
        } else if (templateName === 'causali') {
            await handleCausaliImport(parsedData, res);
        } else if (templateName === 'codici_iva') {
            await handleCodiciIvaImport(parsedData, res);
        } else if (templateName === 'anagrafica_clifor') {
            await handleAnagraficaCliForImport(parsedData, res);
        } else {
            return res.status(400).json({ error: `Gestore per il template '${templateName}' non implementato.` });
        }

    } catch (error) {
        console.error(`[IMPORT] Errore fatale durante l'importazione per '${templateName}':`, error);
        res.status(500).json({ error: `Errore durante l'importazione di ${templateName}.` });
    }
});

// Funzione per convertire date dal formato DDMMYYYY a Date
function convertDateString(dateStr: string | null | undefined): Date | null {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim().length !== 8) return null;
    
    try {
        const cleanDateStr = dateStr.trim();
        const day = cleanDateStr.substring(0, 2);
        const month = cleanDateStr.substring(2, 4);
        const year = cleanDateStr.substring(4, 8);
        
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

async function handleAnagraficaCliForImport(parsedData: any[], res: Response) {
    const stats: ImportStats = {
        totalRecords: parsedData.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        warnings: [],
        successfulRecords: 0,
        errorRecords: 0,
    };

    console.log(`[IMPORT-CLIFOR] Inizio elaborazione di ${stats.totalRecords} record.`);

    for (const record of parsedData) {
        const codiceAnagrafica = record.codiceAnagrafica?.trim();
        if (!codiceAnagrafica) {
            stats.skipped++;
            stats.errors.push(`Record saltato: codice anagrafica mancante.`);
            continue;
        }

        try {
            const isCliente = record.tipoConto === 'C' || record.tipoConto === 'E';
            const isFornitore = record.tipoConto === 'F' || record.tipoConto === 'E';

            // Debug per capire perché non vengono inseriti record
            if (!isCliente && !isFornitore) {
                console.warn(`[WARN-CLIFOR] Record ${codiceAnagrafica} saltato: tipoConto='${record.tipoConto}' non è né C, né F, né E`);
            }

            // Mappatura dati comuni
            const commonData = {
                externalId: codiceAnagrafica,
                codiceAnagrafica: codiceAnagrafica,
                nome: record.denominazione?.trim() || `${record.cognome?.trim()} ${record.nome?.trim()}`.trim() || 'N/D',
                piva: record.partitaIva?.trim() || null,
                codiceFiscale: record.codiceFiscaleClifor?.trim() || null,
                denominazione: record.denominazione?.trim() || null,
                cognome: record.cognome?.trim() || null,
                nomeAnagrafico: record.nome?.trim() || null, // Mappato su 'nome' del template
                sesso: record.sesso?.trim() || null,
                dataNascita: record.dataNascita, // Già oggetto Date dal parser
                comuneNascita: record.comuneNascita?.trim() || null,
                indirizzo: record.indirizzo?.trim() || null,
                cap: record.cap?.trim() || null,
                comune: record.comuneResidenza?.trim() || null, // Mappato su comuneResidenza
                nazione: record.codiceIso?.trim() || null,
                telefono: `${record.prefissoTelefono?.trim() || ''}${record.numeroTelefono?.trim() || ''}`.trim() || null,
                prefissoTelefono: record.prefissoTelefono?.trim() || null,
                codiceIso: record.codiceIso?.trim() || null,
                idFiscaleEstero: record.idFiscaleEstero?.trim() || null,
                tipoSoggetto: record.tipoSoggetto?.trim() || null,
                tipoConto: record.tipoConto?.trim() || null,
                sottocontoCliente: record.sottocontoCliente?.trim() || null,
                sottocontoFornitore: record.sottocontoFornitore?.trim() || null,
                codiceIncassoCliente: record.codiceIncassoCliente?.trim() || null,
                codicePagamentoFornitore: record.codicePagamentoFornitore?.trim() || record.codiceIncassoPagamento?.trim() || null,

                // Campi calcolati e decodificati
                sessoDesc: decoders.decodeSesso(record.sesso),
                tipoSoggettoDesc: decoders.decodeTipoSoggetto(record.tipoSoggetto),
                tipoContoDesc: decoders.decodeTipoContoAnagrafica(record.tipoConto),
                ePersonaFisica: record.tipoSoggetto === '0',
                eCliente: isCliente,
                eFornitore: isFornitore,
                haPartitaIva: !!(record.partitaIva && record.partitaIva.trim()),
                sottocontoAttivo: decoders.determineSottocontoAttivo(record.tipoConto, record.sottocontoCliente, record.sottocontoFornitore),
            };

            // Dati specifici fornitore
            const fornitoreData = {
                ...commonData,
                codicePagamento: record.codicePagamentoFornitore?.trim() || record.codiceIncassoPagamento?.trim() || null,
                gestione770: parseBooleanFlagPythonic(record.gestioneDati770),
                soggettoRitenuta: parseBooleanFlagPythonic(record.soggettoARitenuta),
                quadro770: record.quadro770?.trim() || null,
                contributoPrevidenziale: parseBooleanFlagPythonic(record.contributoPrevidenziale),
                codiceRitenuta: record.codiceRitenuta?.trim() || null,
                enasarco: parseBooleanFlagPythonic(record.enasarco),
                tipoRitenuta: record.tipoRitenuta?.trim() || null,
                soggettoInail: parseBooleanFlagPythonic(record.soggettoInail),
                contributoPrevidenzialeL335: record.contributoPrevid335?.trim() || null,
                aliquota: record.aliquota, // Già numero dal parser
                percContributoCassaPrev: record.percContributoCassa, // Già numero dal parser
                attivitaMensilizzazione: record.attivitaMensilizzazione ? parseInt(record.attivitaMensilizzazione, 10) : null,
                // Descrizioni decodificate
                quadro770Desc: decoders.decodeQuadro770(record.quadro770),
                tipoRitenuraDesc: decoders.decodeTipoRitenuta(record.tipoRitenuta),
                contributoPrevid335Desc: decoders.decodeContributoPrevid335(record.contributoPrevid335),
            };
            
            // Dati specifici cliente
            const clienteData = {
                ...commonData,
                codicePagamento: record.codiceIncassoCliente?.trim() || record.codiceIncassoPagamento?.trim() || null,
            };

            await prisma.$transaction(async (tx) => {
                if (isCliente) {
                    const existing = await tx.cliente.findUnique({ where: { externalId: codiceAnagrafica } });
                    if (existing) stats.updated++; else stats.inserted++;
                    await tx.cliente.upsert({
                        where: { externalId: codiceAnagrafica },
                        update: clienteData,
                        create: clienteData,
                    });
                }
                if (isFornitore) {
                    // Se non è solo cliente, aggiorniamo/inseriamo anche fornitore
                    if (!isCliente) {
                       const existing = await tx.fornitore.findUnique({ where: { externalId: codiceAnagrafica } });
                       // Contiamo inserted/updated solo una volta per record
                       if (!existing) stats.inserted++; else stats.updated++;
                    }
                    await tx.fornitore.upsert({
                        where: { externalId: codiceAnagrafica },
                        update: fornitoreData,
                        create: fornitoreData,
                    });
                }
            });

        } catch (error) {
            stats.errors.push(`Errore sul record ${codiceAnagrafica}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    console.log(`[IMPORT-CLIFOR] Importazione completata. Inseriti: ${stats.inserted}, Aggiornati: ${stats.updated}, Saltati: ${stats.skipped}, Errori: ${stats.errors.length}`);
    return res.status(200).json(stats);
}

async function handlePianoDeiContiImport(parsedData: any[], res: Response) {
    const stats: ImportStats = {
        totalRecords: parsedData.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        successfulRecords: 0,
        errorRecords: 0,
        errors: [],
        warnings: []
    };

    let processedCount = 0;
    const batchSize = 100;
    const contiToCreate: Prisma.ContoCreateInput[] = [];
    const contiToUpdate: { where: Prisma.ContoWhereUniqueInput, data: Prisma.ContoUpdateInput }[] = [];

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
                dataInizio: record.dataInizio, // USA DIRETTAMENTE IL VALORE PARSATO
                dataFine: record.dataFine,       // USA DIRETTAMENTE IL VALORE PARSATO
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
                tipoMovimentoSemplificataDesc: decoders.decodeTipoMovimentoSemplificata(record.tipoMovimentoSemplificata)
            };

            return causaleData;
        }).filter(record => record !== null);

        console.log(`[CAUSALI] Record validi elaborati: ${validRecords.length}/${parsedData.length}`);

        // Inserimento con upsert per evitare duplicati
        let insertedCount = 0;
        let updatedCount = 0;
        
        for (const causale of validRecords) {
            try {
                // ✅ CONTROLLA SE ESISTE PRIMA dell'upsert
                const existingRecord = await prisma.causaleContabile.findUnique({
                    where: { id: causale.id }
                });
                
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
                
                // ✅ LOGICA CORRETTA: conta in base a se esisteva prima
                if (existingRecord) {
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

// === IMPORT CODICI IVA - Allineato a Schema e Parser Python ===
async function handleCodiciIvaImport(parsedData: any[], res: Response) {
    console.log(`[IMPORT-IVA] Ricevuti ${parsedData.length} record da elaborare.`);
    const stats: ImportStats = {
        totalRecords: parsedData.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        warnings: [],
        successfulRecords: 0,
        errorRecords: 0,
    };
    
    let processedCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;
    const batchSize = 100;

    const validRecords = parsedData.map(record => {
        const codice = record.codice?.trim();
        if (!codice) return null;

        return {
            id: codice,
            codice: codice,
            externalId: codice,
            descrizione: record.descrizione?.trim() || codice,
            aliquota: typeof record.aliquota === 'number' ? record.aliquota : null,
            percentuale: typeof record.percentuale === 'number' ? record.percentuale : null, // Mantenuto per coerenza con lo schema
            indetraibilita: record.indetraibilita ? parseFloat(record.indetraibilita) : null,
            note: record.note?.trim() || null,
            tipoCalcolo: record.tipoCalcolo?.trim() || null,
            tipoCalcoloDesc: decoders.decodeTipoCalcolo(record.tipoCalcolo),
            dataInizio: convertDateString(record.dataInizio),
            dataFine: convertDateString(record.dataFine),
            validitaInizio: convertDateString(record.validitaInizio), // Mantenuto per coerenza
            validitaFine: convertDateString(record.validitaFine),     // Mantenuto per coerenza
            inUso: true,
            dataAggiornamento: new Date(),
            // Aggiungi qui gli altri campi mappati se necessario, usando record.nomeCampo
        };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    console.log(`[IMPORT-IVA] Trovati ${validRecords.length} record validi da processare.`);

    for (const record of validRecords) {
        try {
            await prisma.codiceIva.upsert({
                where: { id: record.id },
                create: record,
                update: record,
            });

            // Questo conteggio è approssimativo senza leggere prima, ma sufficiente per il debug
            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`[IMPORT-IVA] Elaborati ${processedCount}/${validRecords.length} record...`);
            }
        } catch (error) {
            console.error(`[IMPORT-IVA] Errore durante upsert del record ${record.codice}:`, error);
        }
    }

    // Qui il conteggio di inserted/updated non è accurato ma il processo è corretto
    console.log(`[IMPORT-IVA] Importazione completata. Record processati con successo: ${processedCount}`);
    res.status(200).json({ message: 'Importazione completata', importedCount: processedCount });
}

// Funzione helper per parsare stringhe decimali come fa la "bibbia" Python
// Prende una stringa come "002200" e la converte in 22.00
function parseDecimalString(valueStr: string | null | undefined): number | null {
    if (!valueStr || typeof valueStr !== 'string' || valueStr.trim() === '') {
        return null;
    }
    
    try {
        const cleanedStr = valueStr.trim();
        
        // Se la stringa ha meno di 3 caratteri, trattala come numero intero
        if (cleanedStr.length < 3) {
            const result = parseInt(cleanedStr, 10);
            return isNaN(result) ? null : result;
        }
        
        // Formato standard: inserisce punto decimale prima delle ultime 2 cifre
        // Esempio: "002200" → "0022.00" → 22.00
        const integerPart = cleanedStr.slice(0, -2) || '0';
        const decimalPart = cleanedStr.slice(-2);
        
        const result = parseFloat(`${integerPart}.${decimalPart}`);
        return isNaN(result) ? null : result;
    } catch (error) {
        return null;
    }
}

export default router;