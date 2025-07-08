import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { parseFixedWidth, FieldDefinition } from '../fixedWidthParser';
import * as decoders from '../businessDecoders';
import { parseDecimalString, parseBooleanFlag, convertDateString } from '../importUtils';

const prisma = new PrismaClient();

const anagraficaCliForFields: FieldDefinition[] = [
    { fieldName: 'filler', start: 1, length: 3, type: 'string' },
    { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, type: 'string' },
    { fieldName: 'subcodiceAzienda', start: 20, length: 1, type: 'string' },
    { fieldName: 'codiceUnivocoScaricamento', start: 21, length: 12, type: 'string' },
    { fieldName: 'codiceFiscale', start: 33, length: 16, type: 'string' },
    { fieldName: 'subcodiceCliFor', start: 49, length: 1, type: 'string' },
    { fieldName: 'tipoConto', start: 50, length: 1, type: 'string' },
    { fieldName: 'sottocontoCliente', start: 51, length: 10, type: 'string' },
    { fieldName: 'sottocontoFornitore', start: 61, length: 10, type: 'string' },
    { fieldName: 'externalId', start: 71, length: 12, type: 'string' },
    { fieldName: 'piva', start: 83, length: 11, type: 'string' },
    { fieldName: 'tipoSoggetto', start: 94, length: 1, type: 'string' },
    { fieldName: 'ragioneSociale', start: 95, length: 60, type: 'string' },
    { fieldName: 'cognome', start: 155, length: 20, type: 'string' },
    { fieldName: 'nome', start: 175, length: 20, type: 'string' },
    { fieldName: 'sesso', start: 195, length: 1, type: 'string' },
    { fieldName: 'dataNascita', start: 196, length: 8, type: 'string' },
    { fieldName: 'comuneNascita', start: 204, length: 4, type: 'string' },
    { fieldName: 'comuneResidenza', start: 208, length: 4, type: 'string' },
    { fieldName: 'cap', start: 212, length: 5, type: 'string' },
    { fieldName: 'indirizzo', start: 217, length: 30, type: 'string' },
    { fieldName: 'prefissoTelefono', start: 247, length: 4, type: 'string' },
    { fieldName: 'numeroTelefono', start: 251, length: 11, type: 'string' },
    { fieldName: 'identificativoFiscaleEstero', start: 262, length: 20, type: 'string' },
    { fieldName: 'codiceIso', start: 282, length: 2, type: 'string' },
    { fieldName: 'codicePagamento', start: 284, length: 8, type: 'string' },
    { fieldName: 'codicePagamentoCliente', start: 292, length: 8, type: 'string' },
    { fieldName: 'codicePagamentoFornitore', start: 300, length: 8, type: 'string' },
    { fieldName: 'codiceValuta', start: 308, length: 4, type: 'string' },
    { fieldName: 'gestione770', start: 312, length: 1, type: 'string' },
    { fieldName: 'soggettoRitenuta', start: 313, length: 1, type: 'string' },
    { fieldName: 'quadro770', start: 314, length: 1, type: 'string' },
    { fieldName: 'contributoPrevidenziale', start: 315, length: 1, type: 'string' },
    { fieldName: 'codiceRitenuta', start: 316, length: 5, type: 'string' },
    { fieldName: 'enasarco', start: 321, length: 1, type: 'string' },
    { fieldName: 'tipoRitenuta', start: 322, length: 1, type: 'string' },
    { fieldName: 'soggettoInail', start: 323, length: 1, type: 'string' },
    { fieldName: 'contributoPrevidenzialeL335', start: 324, length: 1, type: 'string' },
    { fieldName: 'aliquota', start: 325, length: 6, type: 'string' },
    { fieldName: 'percContributoCassaPrev', start: 331, length: 6, type: 'string' },
    { fieldName: 'attivitaMensilizzazione', start: 337, length: 2, type: 'string' },
];

export interface AnagraficaCliForRecord {
    [key: string]: string | number | Date | null | undefined;
    filler: string;
    codiceFiscaleAzienda: string;
    subcodiceAzienda: string;
    codiceUnivocoScaricamento: string;
    codiceFiscale: string;
    subcodiceCliFor: string;
    tipoConto: string;
    sottocontoCliente: string;
    sottocontoFornitore: string;
    externalId: string;
    piva: string;
    tipoSoggetto: string;
    ragioneSociale: string;
    cognome: string;
    nome: string;
    sesso: string;
    dataNascita: string;
    comuneNascita: string;
    comuneResidenza: string;
    cap: string;
    indirizzo: string;
    prefissoTelefono: string;
    numeroTelefono: string;
    identificativoFiscaleEstero: string;
    codiceIso: string;
    codicePagamento: string;
    codicePagamentoCliente: string;
    codicePagamentoFornitore: string;
    codiceValuta: string;
    gestione770: string;
    soggettoRitenuta: string;
    quadro770: string;
    contributoPrevidenziale: string;
    codiceRitenuta: string;
    enasarco: string;
    tipoRitenuta: string;
    soggettoInail: string;
    contributoPrevidenzialeL335: string;
    aliquota: string;
    percContributoCassaPrev: string;
    attivitaMensilizzazione: string;
}

export async function handleAnagraficaCliForImport(parsedData: AnagraficaCliForRecord[], res: Response) {
    let processedCount = 0;
    const batchSize = 100;

    try {
        const validRecords = parsedData.map(record => {
            const externalId = typeof record.externalId === 'string' ? record.externalId.trim() : null;
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
                dataNascita: record.dataNascita,
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
