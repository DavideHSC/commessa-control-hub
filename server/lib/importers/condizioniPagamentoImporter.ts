import { PrismaClient } from '@prisma/client';
import { ImportStats } from '../fixedWidthParser';

const prisma = new PrismaClient();

// Definiamo un tipo per i record parsati per evitare l'uso di 'any'
interface ParsedRecord {
  [key: string]: string;
}

/**
 * Elabora i dati parsati per le Condizioni di Pagamento e li salva nel database.
 * Questa funzione è progettata per essere chiamata da un gestore che le passa i dati
 * già parsati da un file a larghezza fissa.
 * 
 * @param parsedData Dati grezzi parsati.
 * @param stats Oggetto per tracciare le statistiche di importazione.
 */
export async function processCondizioniPagamento(
  parsedData: ParsedRecord[],
  stats: ImportStats
): Promise<void> {

  const BATCH_SIZE = 100;
  
  for (let i = 0; i < parsedData.length; i += BATCH_SIZE) {
    const batch = parsedData.slice(i, i + BATCH_SIZE);
    const upsertPromises = batch.map(async (record, index) => {

      // L'ID univoco per l'upsert è 'codicePagamento' che corrisponde al codice del pagamento
      const externalId = record.codicePagamento; 
      if (!externalId) {
        stats.skipped++;
        stats.warnings.push({
          row: i + index, // Calcola il numero di riga globale
          message: 'Record saltato: codicePagamento mancante.',
          data: record
        });
        return;
      }
      
      // Mappatura e trasformazione dati basata sui campi del template
      const dataToUpsert = {
        id: record.codicePagamento,
        descrizione: record.descrizione,
        codice: record.codicePagamento,
        externalId: externalId,
        numeroRate: record.numeroRate ? parseInt(record.numeroRate, 10) : null,
        contoIncassoPagamento: record.contoIncassoPagamento,
        suddivisione: record.suddivisione,
        inizioScadenza: record.inizioScadenza,
        
        // La conversione del flag 'X' in booleano
        calcolaGiorniCommerciali: record.calcolaGiorniCommerciali === 'X',
        consideraPeriodiChiusura: record.consideraPeriodiChiusura === 'X',
      };

      await prisma.condizionePagamento.upsert({
        where: { id: externalId },
        update: dataToUpsert,
        create: dataToUpsert,
      });

      stats.updated++; // Upsert conta come un aggiornamento o inserimento, lo categorizziamo qui
    
    });

    await Promise.all(upsertPromises);
  }
} 