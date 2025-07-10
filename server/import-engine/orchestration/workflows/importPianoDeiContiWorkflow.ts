import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedPianoDeiContiSchema, ValidatedPianoDeiConti } from '../../acquisition/validators/pianoDeiContiValidator';
import { transformPianoDeiContiToStaging } from '../../transformation/transformers/pianoDeiContiTransformer';
import { RawPianoDeiConti } from '../../core/types/generated';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

/**
 * Orchestra l'importazione del Piano dei Conti standard (CONTIGEN) in una tabella di staging.
 * @param fileContent Il contenuto del file da importare come stringa.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function importPianoDeiContiWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Staging] Avvio importazione Piano dei Conti Standard.');
  
  const stats: WorkflowResult = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // 1. Parsing
  const templateName = 'piano_dei_conti';
  const parseResult = await parseFixedWidth<RawPianoDeiConti>(fileContent, templateName);
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Staging] Parsati ${stats.totalRecords} record.`);

  // 2. Validazione
  const validRecords: ValidatedPianoDeiConti[] = [];
  // ... (la logica di validazione rimane la stessa per ora) ...
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
    }
  }

  // 3. Trasformazione
  const recordsToCreate = validRecords.map(transformPianoDeiContiToStaging);
  console.log(`[Workflow Staging] Trasformati ${recordsToCreate.length} record, pronti per lo staging.`);

  // 4. Salvataggio in Staging
  if (recordsToCreate.length > 0) {
    try {
      // Svuota la tabella di staging prima di un nuovo import
      await prisma.stagingConto.deleteMany({
        where: { codiceFiscaleAzienda: '' } // Cancella solo i record generici
      });

      const result = await prisma.stagingConto.createMany({
        data: recordsToCreate,
        skipDuplicates: true, // In caso di righe duplicate nel file, le salta
      });
      stats.successfulRecords = result.count;
      console.log(`[Workflow Staging] Salvati ${result.count} record nella tabella di staging.`);
    } catch (e) {
      const error = e as Error;
      stats.errorRecords = recordsToCreate.length; // Tutti falliti
      stats.errors.push({ row: 0, message: `Errore di massa durante il createMany: ${error.message}`, data: {} });
      console.error(`[Workflow Staging] Errore durante il salvataggio in staging:`, error);
    }
  }

  console.log('[Workflow Staging] Importazione Piano dei Conti Standard terminata.');
  return stats;
} 