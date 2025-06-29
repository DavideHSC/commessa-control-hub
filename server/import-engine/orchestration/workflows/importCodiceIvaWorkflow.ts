import { PrismaClient, FieldDefinition as PrismaFieldDefinition } from '@prisma/client';
import { parseFixedWidth, FieldDefinition as ParserFieldDefinition } from '../../../lib/fixedWidthParser';
import { rawCodiceIvaSchema, RawCodiceIva } from '../../acquisition/validators/codiceIvaValidator';
import { transformCodiciIva } from '../../transformation/transformers/codiceIvaTransformer';
// import { addToDLQ } from '../../persistence/dlq/dlqService'; // Placeholder for DLQ service
// import { runInTransaction } from '../../persistence/transactions/transactionService'; // Placeholder for transaction service

const prisma = new PrismaClient();

export interface ImportStats {
  totalRecords: number;
  inserted: number;
  updated: number;

  errors: number;
}

/**
 * Orchestrates the import process for Codici IVA.
 * This includes parsing, validation, transformation, and persistence.
 *
 * @param fileContent - The string content of the `CODICIVA.TXT` file.
 * @param fields - The array of field definitions for this template.
 * @returns An object containing statistics about the import process.
 */
export async function importCodiceIvaWorkflow(
  fileContent: string,
  fields: PrismaFieldDefinition[]
): Promise<ImportStats> {
    // Type assertion to bridge the gap between Prisma's FieldDefinition and the parser's expected type.
    const parserFields: ParserFieldDefinition[] = fields.map(f => ({
        ...f,
        format: f.format as ParserFieldDefinition['format'], 
    }));

  // 1. Parsing
  const rawRecords = parseFixedWidth<RawCodiceIva>(fileContent, parserFields);
  
  const insertedCount = 0;
  const updatedCount = 0;
  const errorLogs: Array<{ lineNumber: number; rawData: RawCodiceIva; errors: z.ZodError<RawCodiceIva>; }> = []; // Placeholder for DLQ

  // 2. Validation & Coercion
  const validationPromises = rawRecords.map(async (rawRecord, index) => {
    const validationResult = rawCodiceIvaSchema.safeParse(rawRecord);

    if (!validationResult.success) {
      errorLogs.push({
        lineNumber: index + 1,
        rawData: rawRecord,
        errors: validationResult.error.flatten(),
      });
      return null;
    }
    return validationResult.data;
  });

  const validatedRecords = (await Promise.all(validationPromises)).filter(
    (r): r is NonNullable<RawCodiceIva> => r !== null
  );
  
  console.log(`[Workflow] Number of validated records: ${validatedRecords.length}`);

  // 3. Transformation
  const transformedData = transformCodiciIva(validatedRecords);

  console.log(`[Workflow] Number of transformed records: ${transformedData.length}`);

  // 4. Persistence
  // This should be wrapped in a robust transaction manager
  try {
    // This is a simplified version of the final transaction logic.
    // A real implementation would use `runInTransaction`.
    await prisma.$transaction(async (tx) => {
        for (const recordData of transformedData) {
            const result = await tx.codiceIva.upsert({
                where: { externalId: recordData.externalId! },
                update: recordData,
                create: recordData,
            });
            // This is a simplified way to count. A better way is to check creation/update time
            // but for now this is just a placeholder. The previous implementation was flawed.
            // A more correct way would involve checking if the record existed right before the upsert.
            // For now, we will just count them as updated as upsert does not return this info.
            updatedCount++; 
        }
    });
  } catch(e: unknown) {
      // TODO: proper error handling
      console.error(e);
      throw new Error("Failed to persist data during transaction.");
  }


  return {
    totalRecords: rawRecords.length,
    inserted: insertedCount, // Placeholder
    updated: updatedCount, // Placeholder
    errors: errorLogs.length,
  };
} 