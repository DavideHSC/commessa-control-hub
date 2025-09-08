import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser.js';
import { validatedPianoDeiContiSchema, ValidatedPianoDeiConti } from '../../acquisition/validators/pianoDeiContiValidator.js';
import { RawPianoDeiConti } from '../../core/types/generated.js';

const prisma = new PrismaClient();

interface WorkflowResult {
  success: boolean;
  message: string;
  totalRecords: number;
  successfulRecords: number;
  createdRecords: number;
  updatedRecords: number;
  errorRecords: number;
  errors: { row: number; message: string; data: unknown }[];
}

export async function importPianoDeiContiWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Staging] Avvio importazione Piano dei Conti STANDARD (Read-then-Write in Batch).');
  
  const stats: WorkflowResult = {
    success: true, // Default to success, will be updated if errors occur
    message: 'Importazione piano dei conti standard completata',
    totalRecords: 0,
    successfulRecords: 0,
    createdRecords: 0,
    updatedRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // FASE 1: Parsing & Validazione
  const parseResult = await parseFixedWidth<RawPianoDeiConti>(fileContent, 'piano_dei_conti');
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Staging] Parsati ${stats.totalRecords} record.`);

  const validRecords: ValidatedPianoDeiConti[] = [];
  for (let index = 0; index < rawRecords.length; index++) {
    const rawRecord = rawRecords[index];
    const validationResult = validatedPianoDeiContiSchema.safeParse(rawRecord);
    if (validationResult.success) {
      validRecords.push(validationResult.data);
    } else {
      stats.errorRecords++;
      stats.errors.push({ row: index + 1, message: JSON.stringify(validationResult.error.flatten().fieldErrors), data: rawRecord });
    }
  }

  if (validRecords.length === 0) {
    console.log('[Workflow Staging] Nessun record valido da processare.');
    stats.success = stats.errorRecords === 0; // Success if no errors occurred
    stats.message = stats.errorRecords > 0 
      ? 'Importazione fallita: tutti i record contengono errori di validazione'
      : 'Importazione completata: file vuoto o senza record validi';
    return stats;
  }
  
  // FASE 2: READ
  const codiciFromFile = validRecords.map(r => r.codice);
  const existingConti = await prisma.stagingConto.findMany({
    where: {
      codice: { in: codiciFromFile },
      codiceFiscaleAzienda: ''
    },
    select: { codice: true }
  });

  // FASE 3: COMPARE
  const existingContiSet = new Set(existingConti.map(c => c.codice));
  const contiToCreate: ValidatedPianoDeiConti[] = [];
  const contiToUpdate: ValidatedPianoDeiConti[] = [];

  for (const record of validRecords) {
    if (existingContiSet.has(record.codice)) {
      contiToUpdate.push(record);
    } else {
      contiToCreate.push(record);
    }
  }
  
  console.log(`[Workflow Staging] Confronto completato. Da creare: ${contiToCreate.length}. Da aggiornare: ${contiToUpdate.length}.`);

  try {
    // FASE 4: WRITE - Approccio batch ottimizzato
    await prisma.$transaction(async (tx) => {
      if (contiToCreate.length > 0) {
        const dataToCreate = contiToCreate.map(r => ({ ...r, codiceFiscaleAzienda: '' }));
        const result = await tx.stagingConto.createMany({
          data: dataToCreate,
          skipDuplicates: true,
        });
        stats.createdRecords = result.count;
      }

      if (contiToUpdate.length > 0) {
        // Usa deleteMany + createMany invece di loop di update per evitare timeout transazione
        const codiciToUpdate = contiToUpdate.map(r => r.codice);
        
        // Prima elimina i record esistenti
        await tx.stagingConto.deleteMany({
          where: {
            codice: { in: codiciToUpdate },
            codiceFiscaleAzienda: ''
          }
        });
        
        // Poi ricrea con i nuovi dati
        const dataToUpdate = contiToUpdate.map(r => ({ ...r, codiceFiscaleAzienda: '' }));
        const result = await tx.stagingConto.createMany({
          data: dataToUpdate,
          skipDuplicates: true,
        });
        
        stats.updatedRecords = result.count;
      }
    });

    stats.successfulRecords = stats.createdRecords + stats.updatedRecords;
    console.log(`[Workflow Staging] Salvataggio completato. Creati: ${stats.createdRecords}, Aggiornati: ${stats.updatedRecords}.`);
  } catch(e) {
      const error = e as Error;
      stats.errorRecords = validRecords.length - (stats.createdRecords + stats.updatedRecords);
      stats.errors.push({ row: 0, message: `Errore DB in batch: ${error.message}`, data: {} });
      stats.success = false;
      stats.message = 'Importazione fallita: errore durante il salvataggio nel database';
      console.error(`[Workflow Staging] Errore durante il salvataggio in staging:`, error);
  }
  
  return stats;
}