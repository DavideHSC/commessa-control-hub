import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedPianoDeiContiSchema, ValidatedPianoDeiConti } from '../../acquisition/validators/pianoDeiContiValidator';
import { transformPianoDeiConti } from '../../transformation/transformers/pianoDeiContiTransformer';
import { RawPianoDeiConti } from '../../core/types/generated';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

/**
 * Orchestra l'intero processo di importazione per il Piano dei Conti (ARCHITETTURA MODERNA).
 * @param fileContent Il contenuto del file da importare come stringa.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function importPianoDeiContiWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow] Avvio importazione Piano dei Conti con architettura moderna.');
  
  const stats: WorkflowResult = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // 1. Esegue il parsing del contenuto del file
  const templateName = 'piano_dei_conti'; // Assicurati che il nome sia corretto
  const parseResult = await parseFixedWidth<RawPianoDeiConti>(fileContent, templateName);
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow] Parsati ${stats.totalRecords} record grezzi.`);

  // 2. Valida ogni record
  const validRecords: ValidatedPianoDeiConti[] = [];
  console.log('[Workflow] Inizio validazione e coercizione dei tipi...');
  for (const [index, rawRecord] of rawRecords.entries()) {
    const validationResult = validatedPianoDeiContiSchema.safeParse(rawRecord);
    if (validationResult.success) {
      validRecords.push(validationResult.data);
    } else {
      stats.errorRecords++;
      const flatError = validationResult.error.flatten();
      stats.errors.push({
        row: index + 1,
        message: JSON.stringify(flatError.fieldErrors),
        data: rawRecord,
      });
      console.warn(`[Workflow] Errore di validazione riga ${index + 1}:`, flatError.fieldErrors);
    }
  }
  console.log(`[Workflow] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

  // 3. Trasforma i record validi
  const recordsToUpsert = validRecords.map(transformPianoDeiConti);
  console.log(`[Workflow] Trasformati ${recordsToUpsert.length} record, pronti per il salvataggio.`);

  // 4. Salva nel database con logica Upsert sicura
  let successfulUpserts = 0;
  if (recordsToUpsert.length > 0) {
    console.log(`[Workflow] Tentativo di salvataggio (upsert) di ${recordsToUpsert.length} record...`);
    for (const record of recordsToUpsert) {
      try {
        if (!record.codice) {
          throw new Error('Il codice del conto è obbligatorio per l\'operazione di upsert.');
        }
        await prisma.conto.upsert({
          where: { codice: record.codice },
          update: record,
          create: record,
        });
        successfulUpserts++;
      } catch (e: unknown) {
        stats.errorRecords++;
        const error = e as Error;
        console.error(`[Workflow] Errore durante l'upsert del record con codice ${record.codice}:`, error.message);
        // Aggiungi l'errore al report
        const originalIndex = rawRecords.findIndex(r => r.codice?.trim() === record.codice);
        stats.errors.push({
          row: originalIndex !== -1 ? originalIndex + 1 : 0,
          message: error.message,
          data: record,
        });
      }
    }
    stats.successfulRecords = successfulUpserts;
    console.log(`[Workflow] Salvataggio completato. Record processati con successo: ${successfulUpserts}.`);
  }

  console.log('[Workflow] Importazione Piano dei Conti terminata.');
  return stats;
} 