import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validatedCondizionePagamentoSchema } from '../../acquisition/validators/condizioniPagamentoValidator';
import { condizioniPagamentoTransformer } from '../../transformation/transformers/condizioniPagamentoTransformer';
import type { RawCondizioniPagamento } from '../../core/types/generated';

const prisma = new PrismaClient();

export interface ImportCondizioniPagamentoResult {
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  errors: string[];
}

export async function runImportCondizioniPagamentoWorkflow(
  fileContent: string
): Promise<ImportCondizioniPagamentoResult> {
  console.log('Iniziando workflow moderno per Condizioni di Pagamento...');

  try {
    // 1. Parsing dei dati grezzi
    const templateName = 'condizioni_pagamento';
    const parseResult = await parseFixedWidth<RawCondizioniPagamento>(fileContent, templateName);
    const rawRecords = parseResult.data;
    console.log(`Parsati ${rawRecords.length} record grezzi`);

    if (rawRecords.length === 0) {
      return {
        totalRecords: 0,
        createdRecords: 0,
        updatedRecords: 0,
        errors: ['Nessun record trovato nel file'],
      };
    }

    // 2. Inizializzazione statistiche
    const stats = {
      totalRecords: rawRecords.length,
      createdRecords: 0,
      updatedRecords: 0,
      errors: [] as string[],
    };

    // 3. Elaborazione record per record
    for (let i = 0; i < rawRecords.length; i++) {
      const rawRecord = rawRecords[i];
      
      try {
        // Validazione
        const validatedRecord = validatedCondizionePagamentoSchema.parse(rawRecord);
        
        // Trasformazione
        const transformedRecord = condizioniPagamentoTransformer(validatedRecord);
        
        // Prepara dati per upsert (solo campi definiti)
        const createData = {
          externalId: transformedRecord.externalId,
          codice: transformedRecord.codice,
          descrizione: transformedRecord.descrizione,
          ...(transformedRecord.numeroRate !== null && transformedRecord.numeroRate !== undefined && { numeroRate: transformedRecord.numeroRate }),
          ...(transformedRecord.contoIncassoPagamento && { contoIncassoPagamento: transformedRecord.contoIncassoPagamento }),
          ...(transformedRecord.inizioScadenza && { inizioScadenza: transformedRecord.inizioScadenza }),
          ...(transformedRecord.suddivisione && { suddivisione: transformedRecord.suddivisione }),
          ...(transformedRecord.calcolaGiorniCommerciali !== null && transformedRecord.calcolaGiorniCommerciali !== undefined && { calcolaGiorniCommerciali: transformedRecord.calcolaGiorniCommerciali }),
        };

        const updateData = {
          codice: transformedRecord.codice,
          descrizione: transformedRecord.descrizione,
          ...(transformedRecord.numeroRate !== null && transformedRecord.numeroRate !== undefined && { numeroRate: transformedRecord.numeroRate }),
          ...(transformedRecord.contoIncassoPagamento && { contoIncassoPagamento: transformedRecord.contoIncassoPagamento }),
          ...(transformedRecord.inizioScadenza && { inizioScadenza: transformedRecord.inizioScadenza }),
          ...(transformedRecord.suddivisione && { suddivisione: transformedRecord.suddivisione }),
          ...(transformedRecord.calcolaGiorniCommerciali !== null && transformedRecord.calcolaGiorniCommerciali !== undefined && { calcolaGiorniCommerciali: transformedRecord.calcolaGiorniCommerciali }),
        };

        // Prima verifica se esiste già
        const existingRecord = await prisma.condizionePagamento.findUnique({
          where: { externalId: transformedRecord.externalId }
        });

        let wasCreated = false;
        
        if (existingRecord) {
          // Record esiste - UPDATE
          await prisma.condizionePagamento.update({
            where: { externalId: transformedRecord.externalId },
            data: updateData,
          });
          wasCreated = false;
        } else {
          // Record non esiste - CREATE
          await prisma.condizionePagamento.create({
            data: createData,
          });
          wasCreated = true;
        }

        // Aggiorna statistiche corrette
        if (wasCreated) {
          stats.createdRecords++;
        } else {
          stats.updatedRecords++;
        }

      } catch (error) {
        const errorMsg = `Record ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    console.log(`Workflow completato: ${stats.createdRecords} creati, ${stats.updatedRecords} aggiornati, ${stats.errors.length} errori`);
    return stats;

  } catch (error) {
    console.error('Errore critico nel workflow:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
} 