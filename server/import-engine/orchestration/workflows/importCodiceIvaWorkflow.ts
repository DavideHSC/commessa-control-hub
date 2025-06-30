import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import {
  rawCodiceIvaSchema,
  type RawCodiceIva,
} from '../../acquisition/validators/codiceIvaValidator';
import { transformCodiciIva } from '../../transformation/transformers/codiceIvaTransformer';

const prisma = new PrismaClient();

interface ImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: RawCodiceIva }[];
}

/**
 * Orchestra l'intero processo di importazione per i codici IVA.
 * Segue lo stesso pattern del workflow delle causali che funziona.
 * @param fileContent Il contenuto del file da importare.
 * @returns Statistiche sull'esito dell'importazione.
 */
export async function runImportCodiciIvaWorkflow(fileContent: string): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  try {
    // 1. Parsa il file usando il template 'codici_iva' (nome corretto nel database)
    const parseResult = await parseFixedWidth<RawCodiceIva>(fileContent, 'codici_iva');
    const rawRecords = parseResult.data;
    stats.totalRecords = rawRecords.length;
    console.log(`[Workflow Codici IVA] Parsati ${stats.totalRecords} record grezzi dal file.`);

    const validRecords: RawCodiceIva[] = [];

    // 2. Valida ogni record
    console.log('[Workflow Codici IVA] Inizio validazione e coercizione dei tipi...');
    for (const [index, rawRecord] of rawRecords.entries()) {
      const validationResult = rawCodiceIvaSchema.safeParse(rawRecord);
      if (validationResult.success) {
        validRecords.push(validationResult.data);
      } else {
        stats.errorRecords++;
        const flatError = validationResult.error.flatten();
        console.warn(`[Workflow Codici IVA] Errore di validazione alla riga ${index + 1}:`, flatError);
        stats.errors.push({
          row: index + 1,
          message: JSON.stringify(flatError),
          data: rawRecord
        });
      }
    }
    console.log(`[Workflow Codici IVA] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

    // 3. Trasforma i record validi
    console.log('[Workflow Codici IVA] Inizio trasformazione dei record validi...');
    const recordsToUpsert = transformCodiciIva(validRecords);
    console.log(`[Workflow Codici IVA] Trasformati ${recordsToUpsert.length} record, pronti per il salvataggio.`);

    // 4. Salva nel database con logica Upsert
    let successfulUpserts = 0;

    if (recordsToUpsert.length > 0) {
      console.log(`[Workflow Codici IVA] Tentativo di salvataggio (upsert) di ${recordsToUpsert.length} record nel database...`);
      
      for (const record of recordsToUpsert) {
        try {
          await prisma.codiceIva.upsert({
            where: { externalId: record.externalId as string },
            update: record,
            create: record,
          });
          successfulUpserts++;
        } catch (e: unknown) {
          const error = e as Error;
          console.error(`[Workflow Codici IVA] Errore durante l'upsert del record con ID ${record.externalId}:`, error.message);
          console.error(`[Workflow Codici IVA] Dati del record fallito:`, JSON.stringify(record, null, 2));
          stats.errorRecords++;
        }
      }
      stats.successfulRecords = successfulUpserts;
      console.log(`[Workflow Codici IVA] Salvataggio completato. Record processati con successo: ${successfulUpserts}.`);
    }

    console.log('[Workflow Codici IVA] Processo di importazione terminato.');
    return stats;

  } catch (error) {
    console.error('[Workflow Codici IVA] Errore fatale durante l\'importazione:', error);
    stats.errors.push({
      row: 0,
      message: error instanceof Error ? error.message : String(error),
      data: {} as RawCodiceIva
    });
    return stats;
  } finally {
    await prisma.$disconnect();
  }
} 