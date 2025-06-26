import type { Prisma } from '@prisma/client';
import type { RawCondizionePagamento } from '../../acquisition/validators/condizioniPagamentoValidator';

/**
 * Trasforma i dati validati delle condizioni di pagamento in un formato
 * adatto per l'operazione di upsert nel database (Prisma.CondizionePagamentoCreateInput).
 *
 * Questa funzione rappresenta il "Transformation Layer" per questo specifico import.
 * È una funzione pura, il che la rende facilmente testabile in isolamento.
 *
 * @param records Un array di record `RawCondizionePagamento` che sono già stati parsati e validati.
 * @returns Un array di oggetti `Prisma.CondizionePagamentoCreateInput` pronti per la persistenza.
 */
export function transformCondizioniPagamento(
  records: RawCondizionePagamento[]
): Prisma.CondizionePagamentoCreateInput[] {
  
  const transformedData: Prisma.CondizionePagamentoCreateInput[] = [];

  for (const record of records) {
    const dataToUpsert: Prisma.CondizionePagamentoCreateInput = {
      // Usiamo 'codicePagamento' come ID univoco, externalId e codice.
      id: record.codicePagamento,
      externalId: record.codicePagamento,
      codice: record.codicePagamento,
      
      // Mappatura diretta dei campi.
      // Lo schema Zod ha già gestito la coercizione dei tipi e la pulizia dei dati.
      descrizione: record.descrizione ?? '', // Assicuriamo che non sia undefined
      numeroRate: record.numeroRate,
      contoIncassoPagamento: record.contoIncassoPagamento,
      suddivisione: record.suddivisione,
      inizioScadenza: record.inizioScadenza,
      
      // I booleani sono già stati trasformati da 'X' a true/false dal validatore.
      calcolaGiorniCommerciali: record.calcolaGiorniCommerciali,
      consideraPeriodiChiusura: record.consideraPeriodiChiusura,

      // Campi decodificati (non presenti per questo import)
      // suddivisioneDesc: ...
      // inizioScadenzaDesc: ...
    };

    transformedData.push(dataToUpsert);
  }

  return transformedData;
} 