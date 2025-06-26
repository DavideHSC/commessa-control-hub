import type { Prisma } from '@prisma/client';
import type { ValidatedCausaleContabile } from '../../acquisition/validators/causaleContabileValidator';
import {
  decodeGestionePartite,
  decodeGestioneRitenuteEnasarco,
  decodeIvaEsigibilitaDifferita,
  decodeSegnoMovimentoIva,
  decodeTipoAggiornamento,
  decodeTipoAutofattura,
  decodeTipoMovimento,
  decodeTipoMovimentoSemplificata,
  decodeTipoRegistroIva,
} from '../decoders/causaleContabileDecoders';

/**
 * Trasforma una singola causale contabile validata nel formato necessario per la creazione nel database.
 * @param record La causale contabile validata.
 * @returns Un oggetto `Prisma.CausaleContabileCreateInput`.
 */
export function transformCausaleContabile(
  record: ValidatedCausaleContabile
): Prisma.CausaleContabileCreateInput {
  return {
    // Campi diretti o già trasformati dallo schema Zod
    id: record.codiceCausale.trim(), // Usiamo il codice come ID
    codice: record.codiceCausale.trim(),
    descrizione: record.descrizione,
    dataInizio: record.dataInizio,
    dataFine: record.dataFine,
    contoIva: record.contoIva.trim(),
    contoIvaVendite: record.contoIvaVendite.trim(),
    generazioneAutofattura: record.generazioneAutofattura,
    fatturaImporto0: record.fatturaImporto0,
    fatturaValutaEstera: record.fatturaValutaEstera,
    nonConsiderareLiquidazioneIva: record.nonConsiderareLiquidazioneIva,
    fatturaEmessaRegCorrispettivi: record.fatturaEmessaRegCorrispettivi,
    gestioneIntrastat: record.gestioneIntrastat,
    versamentoRitenute: record.versamentoRitenute,
    noteMovimento: record.noteMovimento.trim(),
    descrizioneDocumento: record.descrizioneDocumento.trim(),
    identificativoEsteroClifor: record.identificativoEsteroClifor,
    scritturaRettificaAssestamento: record.scritturaRettificaAssestamento,
    nonStampareRegCronologico: record.nonStampareRegCronologico,
    movimentoRegIvaNonRilevante: record.movimentoRegIvaNonRilevante,

    // Campi che richiedono decodifica
    tipoMovimento: record.tipoMovimento,
    tipoMovimentoDesc: decodeTipoMovimento(record.tipoMovimento),

    tipoAggiornamento: record.tipoAggiornamento,
    tipoAggiornamentoDesc: decodeTipoAggiornamento(record.tipoAggiornamento),

    tipoRegistroIva: record.tipoRegistroIva,
    tipoRegistroIvaDesc: decodeTipoRegistroIva(record.tipoRegistroIva),

    segnoMovimentoIva: record.segnoMovimentoIva,
    segnoMovimentoIvaDesc: decodeSegnoMovimentoIva(record.segnoMovimentoIva),

    tipoAutofatturaGenerata: record.tipoAutofatturaGenerata,
    tipoAutofatturaDesc: decodeTipoAutofattura(record.tipoAutofatturaGenerata),

    ivaEsigibilitaDifferita: record.ivaEsigibilitaDifferita,
    ivaEsigibilitaDifferitaDesc: decodeIvaEsigibilitaDifferita(record.ivaEsigibilitaDifferita),

    gestionePartite: record.gestionePartite,
    gestionePartiteDesc: decodeGestionePartite(record.gestionePartite),
    
    gestioneRitenuteEnasarco: record.gestioneRitenuteEnasarco,
    gestioneRitenuteEnasarcoDesc: decodeGestioneRitenuteEnasarco(record.gestioneRitenuteEnasarco),

    tipoMovimentoSemplificata: record.tipoMovimentoSemplificata,
    tipoMovimentoSemplificataDesc: decodeTipoMovimentoSemplificata(record.tipoMovimentoSemplificata),
  };
} 