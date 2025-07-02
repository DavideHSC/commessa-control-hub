import type { ValidatedCondizionePagamento } from '../../acquisition/validators/condizioniPagamentoValidator';

export interface TransformedCondizionePagamento {
  externalId: string;
  codice: string;
  descrizione: string;
  numeroRate?: number | null;
  contoIncassoPagamento?: string | null;
  inizioScadenza?: string | null;
  suddivisione?: string | null;
  calcolaGiorniCommerciali?: boolean | null;
}

export function condizioniPagamentoTransformer(
  record: ValidatedCondizionePagamento
): TransformedCondizionePagamento {
  const codice = record.codice || `COND_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return {
    externalId: codice,
    codice: codice,
    descrizione: record.descrizione || 'Condizione di pagamento importata',
    numeroRate: record.giorni,
    contoIncassoPagamento: null,
    inizioScadenza: record.tipoScadenza,
    suddivisione: null,
    calcolaGiorniCommerciali: record.primaNota,
  };
} 