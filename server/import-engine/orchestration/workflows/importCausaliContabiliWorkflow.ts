import { PrismaClient, FieldDefinition } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { causaleContabileValidator, ValidatedCausaleContabile } from '../../acquisition/validators/causaleContabileValidator';
import { transformCausaleContabile } from '../../transformation/transformers/causaleContabileTransformer';
import { RawCausali } from '../../core/types/generated';

const prisma = new PrismaClient();

interface ImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: RawCausali }[];
}

/**
 * Orchestra l'intero processo di importazione per le causali contabili.
 * @param fileContent Il contenuto del file da importare.
 * @returns Statistiche sull'esito dell'importazione.
 */
export async function runImportCausaliContabiliWorkflow(fileContent: string): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // 1. Recupera le definizioni dei campi per il template 'causali'
  const fieldDefinitions = await prisma.fieldDefinition.findMany({
    where: {
      template: {
        name: 'causali' // Assicurati che il nome del template sia corretto
      }
    }
  });

  if (fieldDefinitions.length === 0) {
    throw new Error("Definizioni dei campi per il template 'causali' non trovate.");
  }

  // 2. Parsa il file
  const parseResult = await parseFixedWidth(fileContent, 'causali');
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Causali] Parsati ${stats.totalRecords} record grezzi dal file.`);

  const validRecords: ValidatedCausaleContabile[] = [];

  // 3. Valida ogni record
  console.log('[Workflow Causali] Inizio validazione e coercizione dei tipi...');
  for (const [index, rawRecord] of rawRecords.entries()) {
    const validationResult = causaleContabileValidator.safeParse(rawRecord);
    if (validationResult.success) {
      validRecords.push(validationResult.data);
    } else {
      stats.errorRecords++;
      const flatError = validationResult.error.flatten();
      console.warn(`[Workflow Causali] Errore di validazione alla riga ${index + 1}:`, flatError);
    }
  }
  console.log(`[Workflow Causali] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

  // 4. Trasforma i record validi
  console.log('[Workflow Causali] Inizio trasformazione dei record validi...');
  const recordsToUpsert = validRecords.map(transformCausaleContabile);
  console.log(`[Workflow Causali] Trasformati ${recordsToUpsert.length} record, pronti per il salvataggio.`);

  // 5. Salva nel database con logica Upsert
  let successfulUpserts = 0;

  if (recordsToUpsert.length > 0) {
    console.log(`[Workflow Causali] Tentativo di salvataggio (upsert) di ${recordsToUpsert.length} record nel database...`);
    
    for (const record of recordsToUpsert) {
      try {
        await prisma.causaleContabile.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
        successfulUpserts++;
      } catch (e: unknown) {
        const error = e as Error;
        console.error(`[Workflow Causali] Errore durante l'upsert del record con ID ${record.id}:`, error.message);
        console.error(`[Workflow Causali] Dati del record fallito:`, JSON.stringify(record, null, 2));
        stats.errorRecords++;
        
        // NOTA: Non aggiungiamo a stats.errors perché il tipo del 'record' trasformato
        // non corrisponde più a 'RawCausali', causando conflitti di tipo.
        // Il logging a console è sufficiente per il debug in questo caso.
      }
    }
    stats.successfulRecords = successfulUpserts;
    console.log(`[Workflow Causali] Salvataggio completato. Record processati con successo: ${successfulUpserts}.`);
  }

  console.log('[Workflow Causali] Processo di importazione terminato.');
  return stats;
} 