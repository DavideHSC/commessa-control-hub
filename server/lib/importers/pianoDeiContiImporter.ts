import { Response } from 'express';
import { PrismaClient, Prisma, TipoConto } from '@prisma/client';
import * as decoders from '../businessDecoders';

const prisma = new PrismaClient();

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

interface ParsedRecord {
    [key: string]: any;
}

export async function handlePianoDeiContiImport(parsedData: ParsedRecord[], res: Response) {
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
            nome: record.descrizione?.trim() || 'Conto senza nome',
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