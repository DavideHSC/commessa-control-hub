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
      const errorDetails = {
        row: index + 1,
        message: JSON.stringify(flatError),
        data: rawRecord,
      };
      stats.errors.push(errorDetails);
      console.warn(`[Workflow Causali] Errore di validazione alla riga ${errorDetails.row}:`, flatError);
    }
  }
  console.log(`[Workflow Causali] Validazione completata. Record validi: ${validRecords.length}, Errori: ${stats.errorRecords}.`);

  // 4. Trasforma i record validi
  console.log('[Workflow Causali] Inizio trasformazione dei record validi...');
  const recordsToCreate = validRecords.map(transformCausaleContabile);
  console.log(`[Workflow Causali] Trasformati ${recordsToCreate.length} record, pronti per il salvataggio.`);

  // 5. Salva nel database in modo transazionale
  if (recordsToCreate.length > 0) {
    console.log(`[Workflow Causali] Tentativo di salvataggio di ${recordsToCreate.length} record nel database...`);
    try {
      const result = await prisma.causaleContabile.createMany({
        data: recordsToCreate,
        skipDuplicates: true, // Salta i record con 'id' o 'codice' duplicato
      });
      stats.successfulRecords = result.count;
      console.log(`[Workflow Causali] Salvataggio completato con successo. Inseriti ${result.count} nuovi record.`);
    } catch (e: unknown) {
        console.error("[Workflow Causali] Errore durante l'operazione di batch createMany:", e);
        // Se c'è un errore nel batch, tutti i record sono considerati falliti ai fini delle statistiche
        stats.errorRecords += recordsToCreate.length;
        stats.errors.push({
            row: -1, // Errore generico di batch
            message: "Batch database operation failed: " + e.message,
            data: "Multiple records"
        });
    }
  }

  console.log('[Workflow Causali] Processo di importazione terminato.');
  return stats;
} 