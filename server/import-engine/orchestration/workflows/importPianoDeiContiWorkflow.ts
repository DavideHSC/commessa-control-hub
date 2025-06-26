import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import { parseFixedWidthRobust, FieldDefinition as LegacyFieldDefinition } from '../../../../server/lib/fixedWidthParser';
import { validatedPianoDeiContiSchema } from '../../acquisition/validators/pianoDeiContiValidator';
import { transformPianoDeiConti } from '../../transformation/transformers/pianoDeiContiTransformer';
import { RawPianoDeiConti } from '../../core/types/generated';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface WorkflowResult {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: any }[];
}

/**
 * Orchestra l'intero processo di importazione per il Piano dei Conti.
 * 1. Legge il file.
 * 2. Esegue il parsing riga per riga.
 * 3. Valida e trasforma ogni record.
 * 4. Salva i record validi nel database in una singola transazione.
 *
 * @param filePath Il percorso del file da importare.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function importPianoDeiContiWorkflow(filePath: string): Promise<WorkflowResult> {
  console.log(`[Workflow] Avvio importazione Piano dei Conti da: ${filePath}`);

  // 1. Recupera il template e le definizioni dei campi dal DB
  const template = await prisma.importTemplate.findUnique({
    where: { name: 'piano_dei_conti' },
    include: { fieldDefinitions: true },
  });

  if (!template) {
    throw new Error('Template "piano_dei_conti" non trovato nel database.');
  }

  // Adatta le FieldDefinition al formato richiesto dal parser legacy
  const definitions: LegacyFieldDefinition[] = template.fieldDefinitions.map(fd => ({
      fieldName: fd.fieldName!,
      start: fd.start,
      length: fd.length,
      type: 'string', // Per ora trattiamo tutto come stringa
  }));

  // 2. Esegue il parsing robusto del file
  const parseResult = await parseFixedWidthRobust<RawPianoDeiConti>(filePath, definitions, 'piano_dei_conti');
  
  const validationPromises = parseResult.data.map((rawRecord, index) =>
    validatedPianoDeiContiSchema.safeParseAsync(rawRecord)
      .then(result => ({ ...result, originalIndex: index }))
  );

  const validationResults = await Promise.allSettled(validationPromises);

  const validData: Prisma.ContoCreateInput[] = [];
  const errors: WorkflowResult['errors'] = [];

  for (const result of validationResults) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        const transformed = transformPianoDeiConti(result.value.data);
        validData.push(transformed);
      } else {
        // Formattiamo l'errore di Zod in una stringa JSON leggibile
        const errorMessage = JSON.stringify(result.value.error.flatten().fieldErrors);
        errors.push({
          row: result.value.originalIndex + 1,
          message: errorMessage,
          data: parseResult.data[result.value.originalIndex],
        });
      }
    } else {
      // Errore imprevisto durante la validazione
      errors.push({
        row: -1, // Indice sconosciuto
        message: 'Errore di sistema durante la validazione',
        data: result.reason,
      });
    }
  }

  console.log(`[Workflow] Validazione completata. Record validi: ${validData.length}, Errori: ${errors.length}`);

  // 4. Salva i dati validi in una transazione
  if (validData.length > 0) {
    console.log(`[Workflow] Inizio transazione per salvare ${validData.length} record...`);
    
    const upsertOperations = validData.map(conto => 
      prisma.conto.upsert({
        where: { id: conto.id! }, // Aggiungiamo '!' perché sappiamo che l'ID esiste
        update: conto,
        create: conto,
      })
    );

    await prisma.$transaction(upsertOperations);
    console.log('[Workflow] Transazione completata con successo.');
  }

  const finalResult: WorkflowResult = {
    totalRecords: parseResult.stats.totalRecords,
    successfulRecords: validData.length,
    errorRecords: errors.length,
    errors,
  };

  console.log('[Workflow] Importazione Piano dei Conti terminata.');
  return finalResult;
} 