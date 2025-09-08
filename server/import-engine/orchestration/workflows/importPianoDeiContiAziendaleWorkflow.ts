import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser.js';
import { validatedPianoDeiContiAziendaleSchema, ValidatedPianoDeiContiAziendale } from '../../acquisition/validators/pianoDeiContiValidator.js';
import { RawPianoDeiContiAziendale } from '../../core/types/generated.js';

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

export async function importPianoDeiContiAziendaleWorkflow(fileContent: string): Promise<WorkflowResult> {
  console.log('[Workflow Staging] Avvio importazione Piano dei Conti AZIENDALE (Read-then-Write con Overlay).');
  
  const stats: WorkflowResult = {
    success: true, // Default to success, will be updated if errors occur
    message: 'Importazione piano dei conti aziendale completata',
    totalRecords: 0,
    successfulRecords: 0,
    createdRecords: 0,
    updatedRecords: 0,
    errorRecords: 0,
    errors: [],
  };

  // FASE 1: Parsing & Validazione
  const templateName = 'piano_dei_conti_aziendale';
  const parseResult = await parseFixedWidth<RawPianoDeiContiAziendale>(fileContent, templateName);
  const rawRecords = parseResult.data;
  stats.totalRecords = rawRecords.length;
  console.log(`[Workflow Staging] Parsati ${stats.totalRecords} record.`);

  const validRecords: ValidatedPianoDeiContiAziendale[] = [];
  for (let index = 0; index < rawRecords.length; index++) {
    const rawRecord = rawRecords[index];
    const validationResult = validatedPianoDeiContiAziendaleSchema.safeParse(rawRecord);
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
  
  const codiceFiscaleAzienda = validRecords[0].codiceFiscaleAzienda?.trim();
  if (!codiceFiscaleAzienda) {
    stats.errors.push({ row: 0, message: "Codice fiscale azienda non trovato o non consistente nei dati validi.", data: {} });
    stats.errorRecords = validRecords.length;
    stats.success = false;
    stats.message = 'Importazione fallita: codice fiscale azienda non valido';
    return stats;
  }

  // FASE 2: READ
  const codiciFromFile = validRecords.map(r => r.codice);
  const existingConti = await prisma.stagingConto.findMany({
    where: {
      codice: { in: codiciFromFile },
      codiceFiscaleAzienda: { in: ['', codiceFiscaleAzienda] } 
    },
    select: { codice: true, codiceFiscaleAzienda: true }
  });

  // FASE 3: COMPARE
  const contiToCreate: ValidatedPianoDeiContiAziendale[] = [];
  const contiToUpdate: ValidatedPianoDeiContiAziendale[] = [];
  const standardCodesToDelete = new Set<string>();
  
  const existingContiMap = new Map<string, string>();
  existingConti.forEach(c => {
    if (c.codiceFiscaleAzienda === codiceFiscaleAzienda || !existingContiMap.has(c.codice)) {
      existingContiMap.set(c.codice, c.codiceFiscaleAzienda);
    }
  });

  for (const record of validRecords) {
    const existingCf = existingContiMap.get(record.codice);

    if (existingCf === undefined) {
      contiToCreate.push(record);
    } else if (existingCf === '') {
      standardCodesToDelete.add(record.codice);
      contiToCreate.push(record);
    } else if (existingCf === codiceFiscaleAzienda) {
      contiToUpdate.push(record);
    }
  }

  console.log(`[Workflow Staging] Confronto completato. Da creare: ${contiToCreate.length}, Da aggiornare: ${contiToUpdate.length}, Standard da sovrascrivere: ${standardCodesToDelete.size}.`);

  try {
    // FASE 4: WRITE
    await prisma.$transaction(async (tx) => {
      if (standardCodesToDelete.size > 0) {
        const deleted = await tx.stagingConto.deleteMany({
          where: {
            codice: { in: Array.from(standardCodesToDelete) },
            codiceFiscaleAzienda: ''
          }
        });
        console.log(`[Workflow Staging] Transazione: Eliminati ${deleted.count} conti standard da sovrascrivere.`);
      }

      if (contiToCreate.length > 0) {
        const result = await tx.stagingConto.createMany({
          data: contiToCreate,
          skipDuplicates: true,
        });
        stats.createdRecords = result.count;
      }

      if (contiToUpdate.length > 0) {
        for (const record of contiToUpdate) {
          await tx.stagingConto.update({
            where: {
              codice_codiceFiscaleAzienda: {
                codice: record.codice,
                codiceFiscaleAzienda: codiceFiscaleAzienda
              }
            },
            data: record,
          });
        }
        stats.updatedRecords = contiToUpdate.length;
      }
    });

    stats.successfulRecords = stats.createdRecords + stats.updatedRecords;
    console.log(`[Workflow Staging] Transazione completata. Creati: ${stats.createdRecords}, Aggiornati: ${stats.updatedRecords}.`);
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