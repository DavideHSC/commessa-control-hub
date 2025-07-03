import { Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import * as decoders from '../businessDecoders';

const prisma = new PrismaClient();

// Tipi specifici per migliorare la leggibilità e la sicurezza
type Livello = '1' | '2' | '3';

// Helper functions per Piano dei Conti (replica logica Python)
function formatCodificaGerarchica(codifica: string, livello?: string | null): string {
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

function determinaTipoConto(tipoChar?: string | null, codice?: string | null): TipoConto {
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

// Interfaccia per i dati grezzi dal parser
interface RawRecord {
    [key: string]: string | number | boolean | null | undefined;
}

// Funzione helper per normalizzare i campi in stringhe sicure
function normalizeField(value: RawRecord[string]): string | null {
    if (value === null || typeof value === 'undefined') {
        return null;
    }
    return String(value).trim();
}

export async function handlePianoDeiContiImport(parsedData: RawRecord[], res: Response) {
    let processedCount = 0;
    const batchSize = 100;

    console.log(`[IMPORT Piano dei Conti] Inizio elaborazione di ${parsedData.length} record.`);

    const validRecords = parsedData.map(record => {
        const codice = normalizeField(record.codice);
        if (!codice) return null;

        const livello = normalizeField(record.livello);
        const tipoChar = normalizeField(record.tipoChar);
        
        // Applica le decodifiche semantiche, fornendo un default per evitare null
        const livelloDesc = decoders.decodeLivello(livello ?? '');
        const tipoDesc = decoders.decodeTipoConto(tipoChar ?? '');
        const gruppoDesc = decoders.decodeGruppo(normalizeField(record.gruppo) ?? '');
        const controlloSegnoDesc = decoders.decodeControlloSegno(normalizeField(record.controlloSegno) ?? '');
        
        // Formatta codifica gerarchica
        const codificaFormattata = formatCodificaGerarchica(codice, livello ?? '');
        
        // Determina il tipo enum
        const tipo = determinaTipoConto(tipoChar ?? '', codice);

        return {
            id: codice,
            externalId: codice,
            codice: codice,
            nome: normalizeField(record.descrizione) || 'Conto senza nome',
            tipo,
            
            // Gerarchia e Classificazione
            livello: livello,
            livelloDesc,
            sigla: normalizeField(record.sigla),
            gruppo: normalizeField(record.gruppo),
            gruppoDesc,
            controlloSegno: normalizeField(record.controlloSegno),
            controlloSegnoDesc,
            codificaFormattata,
            
            // Validità
            validoImpresaOrdinaria: record.validoImpresaOrd === 'X',
            validoImpresaSemplificata: record.validoImpresaSempl === 'X',
            validoProfessionistaOrdinario: record.validoProfOrd === 'X',
            validoProfessionistaSemplificato: record.validoProfSempl === 'X',
            
            // Classi Fiscali
            classeIrpefIres: normalizeField(record.classeIrpefIres),
            classeIrap: normalizeField(record.classeIrap),
            classeProfessionista: normalizeField(record.classeProfessionista),
            classeIrapProfessionista: normalizeField(record.classeIrapProf),
            classeIva: normalizeField(record.classeIva),
            
            // Conti Collegati
            contoCostiRicavi: normalizeField(record.contoCostiRicavi),
            contoDareCee: normalizeField(record.contoDare),
            contoAvereCee: normalizeField(record.contoAvere),
            
            // Gestione Speciale
            naturaConto: normalizeField(record.naturaConto),
            gestioneBeniAmmortizzabili: normalizeField(record.gestioneBeniAmm),
            percDeduzioneManutenzione: record.percDedManut ? parseFloat(String(record.percDedManut)) : null,
            dettaglioClienteFornitore: normalizeField(record.dettaglioCliFor),
            
            // Descrizioni Bilancio
            descrizioneBilancioDare: normalizeField(record.descBilancioDare),
            descrizioneBilancioAvere: normalizeField(record.descBilancioAvere),
            
            // Dati Extracontabili
            classeDatiExtracontabili: normalizeField(record.classeDatiExtra),
            
            // Registri Professionisti
            colonnaRegistroCronologico: normalizeField(record.colRegCronologico),
            colonnaRegistroIncassiPagamenti: normalizeField(record.colRegIncassiPag),
        };
    }).filter((record): record is NonNullable<typeof record> => record !== null);

    console.log(`[IMPORT Piano dei Conti] Trovati ${validRecords.length} record validi da processare.`);

    for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
        
        await prisma.$transaction(async (tx) => {
            for (const record of batch) {
                // 1. Clean data object: only include fields present in the Prisma model
                const cleanData = {
                    codice: record.codice,
                    nome: record.nome,
                    tipo: record.tipo,
                    externalId: record.externalId,
                    livello: record.livello,
                    livelloDesc: record.livelloDesc,
                    sigla: record.sigla,
                    gruppo: record.gruppo,
                    gruppoDesc: record.gruppoDesc,
                    controlloSegno: record.controlloSegno,
                    controlloSegnoDesc: record.controlloSegnoDesc,
                    codificaFormattata: record.codificaFormattata,
                    validoImpresaOrdinaria: record.validoImpresaOrdinaria,
                    validoImpresaSemplificata: record.validoImpresaSemplificata,
                    validoProfessionistaOrdinario: record.validoProfessionistaOrdinario,
                    validoProfessionistaSemplificato: record.validoProfessionistaSemplificato,
                    classeIrpefIres: record.classeIrpefIres,
                    classeIrap: record.classeIrap,
                    classeProfessionista: record.classeProfessionista,
                    classeIrapProfessionista: record.classeIrapProfessionista,
                    classeIva: record.classeIva,
                    contoCostiRicavi: record.contoCostiRicavi,
                    contoDareCee: record.contoDareCee,
                    contoAvereCee: record.contoAvereCee,
                    naturaConto: record.naturaConto,
                    gestioneBeniAmmortizzabili: record.gestioneBeniAmmortizzabili,
                    percDeduzioneManutenzione: record.percDeduzioneManutenzione,
                    dettaglioClienteFornitore: record.dettaglioClienteFornitore,
                    descrizioneBilancioDare: record.descrizioneBilancioDare,
                    descrizioneBilancioAvere: record.descrizioneBilancioAvere,
                    classeDatiExtracontabili: record.classeDatiExtracontabili,
                    colonnaRegistroCronologico: record.colonnaRegistroCronologico,
                    colonnaRegistroIncassiPagamenti: record.colonnaRegistroIncassiPagamenti,
                    // Default values for fields not in the source file
                    richiedeVoceAnalitica: false,
                    vociAnaliticheAbilitateIds: [],
                    contropartiteSuggeriteIds: []
                };

                try {
                    await tx.conto.upsert({
                        where: { id: record.id },
                        update: cleanData,
                        create: {
                            id: record.id, // ID is required on create
                            ...cleanData
                        },
                    });
                    processedCount++;
                } catch (error) {
                    // 2. Add detailed logging for failed upserts
                    console.error(`[IMPORT Piano dei Conti] Fallito upsert per il conto ${record.codice}.`, {
                        error,
                        recordData: record
                    });
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