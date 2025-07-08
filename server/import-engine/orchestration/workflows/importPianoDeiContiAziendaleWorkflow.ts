import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedPianoDeiContiAziendaleSchema, ValidatedPianoDeiContiAziendale } from '../../acquisition/validators/pianoDeiContiValidator';
import { transformPianoDeiContiAziendale } from '../../transformation/transformers/pianoDeiContiTransformer';
import { RawPianoDeiContiAziendale } from '../../core/types/generated';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

/**
 * Orchestra l'intero processo di importazione per il Piano dei Conti AZIENDALE (CONTIAZI.TXT).
 * @param fileContent Il contenuto del file da importare come stringa.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function importPianoDeiContiAziendaleWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Aziendale] Avvio importazione Piano dei Conti Aziendale.');
  
  const stats: WorkflowResult = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // 1. Esegue il parsing usando il template per CONTIAZI
  const templateName = 'piano_dei_conti_aziendale';
  const parseResult = await parseFixedWidth<RawPianoDeiContiAziendale>(fileContent, templateName);
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Aziendale] Parsati ${stats.totalRecords} record grezzi.`);

  // 2. Valida ogni record usando lo schema aziendale
  const validRecords: ValidatedPianoDeiContiAziendale[] = [];
  console.log('[Workflow Aziendale] Inizio validazione e coercizione dei tipi...');
  for (const [index, rawRecord] of rawRecords.entries()) {
    const validationResult = validatedPianoDeiContiAziendaleSchema.safeParse(rawRecord);
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
      console.warn(`[Workflow Aziendale] Errore di validazione riga ${index + 1}:`, flatError.fieldErrors);
    }
  }
  console.log(`[Workflow Aziendale] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

  // 3. Trasforma i record validi usando il trasformatore aziendale
  const recordsToUpsert = validRecords.map(transformPianoDeiContiAziendale);
  console.log(`[Workflow Aziendale] Trasformati ${recordsToUpsert.length} record, pronti per il salvataggio.`);

  // 4. Salva nel database con logica Upsert sicura per conti aziendali
  let successfulUpserts = 0;
  if (recordsToUpsert.length > 0) {
    console.log(`[Workflow Aziendale] Tentativo di salvataggio (upsert) di ${recordsToUpsert.length} record...`);
    for (const record of recordsToUpsert) {
      try {
        if (!record.codice || !record.codiceFiscaleAzienda) {
          throw new Error('Codice conto e codice fiscale azienda sono obbligatori per l\'upsert.');
        }
        await prisma.conto.upsert({
          where: {
            codice_codiceFiscaleAzienda: {
              codice: record.codice,
              codiceFiscaleAzienda: record.codiceFiscaleAzienda,
            },
          },
          update: record,
          create: record,
        });
        successfulUpserts++;
      } catch (e: unknown) {
        stats.errorRecords++;
        const error = e as Error;
        console.error(`[Workflow Aziendale] Errore durante l'upsert del record con codice ${record.codice} per azienda ${record.codiceFiscaleAzienda}:`, error.message);
        const originalIndex = rawRecords.findIndex(r => r.codice?.trim() === record.codice);
        stats.errors.push({
          row: originalIndex !== -1 ? originalIndex + 1 : 0,
          message: error.message,
          data: record,
        });
      }
    }
    stats.successfulRecords = successfulUpserts;
    console.log(`[Workflow Aziendale] Salvataggio completato. Record processati con successo: ${successfulUpserts}.`);
  }

  console.log('[Workflow Aziendale] Importazione Piano dei Conti Aziendale terminata.');
  return stats;
} 