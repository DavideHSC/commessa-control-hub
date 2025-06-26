import { PrismaClient, type Prisma, type FieldDefinition, type ImportTemplate } from '@prisma/client';
import { parseFixedWidthRobust } from '../../../lib/fixedWidthParser';
import { rawCondizionePagamentoSchema } from '../../acquisition/validators/condizioniPagamentoValidator';
import { transformCondizioniPagamento } from '../../transformation/transformers/condizioniPagamentoTransformer';
import { z } from 'zod';

const prisma = new PrismaClient();

/**
 * Orchestra l'intero processo di importazione per le Condizioni di Pagamento.
 *
 * @param filePath Il percorso del file da importare.
 * @param template Il template di importazione che definisce la struttura del file.
 * @returns Un oggetto con le statistiche dell'importazione.
 */
export async function runImportCondizioniPagamentoWorkflow(
  filePath: string,
  template: ImportTemplate & { fieldDefinitions: FieldDefinition[] }
) {
  console.log(
    `[Workflow] Avvio importazione Condizioni di Pagamento da: ${filePath}`
  );

  // 1. Parsing
  const { data: records, stats: parseStats } = await parseFixedWidthRobust(
    filePath,
    template.fieldDefinitions,
    template.name ?? 'condizioni_pagamento'
  );
  console.log(`[Workflow] Parsing completato. Record letti: ${parseStats.totalRecords}`);

  // 2. Validazione
  const validationResult = z.array(rawCondizionePagamentoSchema).safeParse(records);
  if (!validationResult.success) {
    console.error('[Workflow] Errore di validazione Zod:', validationResult.error.errors);
    throw new Error('Validazione dei dati fallita.');
  }
  const validatedData = validationResult.data;
  console.log(`[Workflow] Validazione completata. Record validi: ${validatedData.length}`);

  // 3. Trasformazione
  const recordsToUpsert = transformCondizioniPagamento(validatedData);
  console.log(`[Workflow] Trasformazione completata. Record da salvare: ${recordsToUpsert.length}`);

  // 4. Persistenza
  try {
    console.log(
      `[Workflow] Inizio transazione per salvare ${recordsToUpsert.length} record...`
    );
    await prisma.$transaction(async (tx) => {
      for (const data of recordsToUpsert) {
        await tx.condizionePagamento.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
      }
    });
    console.log('[Workflow] Transazione completata con successo.');
  } catch (error) {
    console.error('[Workflow] Errore durante la transazione Prisma:', error);
    throw new Error('Salvataggio nel database fallito.');
  }

  return {
    success: true,
    message: 'Importazione Condizioni di Pagamento completata con successo.',
    stats: {
      totalRecords: parseStats.totalRecords,
      validRecords: validatedData.length,
      errors: parseStats.totalRecords - validatedData.length,
    },
  };
} 