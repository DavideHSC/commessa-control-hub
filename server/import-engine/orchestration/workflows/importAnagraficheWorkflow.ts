/**
 * IMPORT ANAGRAFICHE WORKFLOW
 * Workflow orchestrato per importazione anagrafiche A_CLIFOR.TXT
 * 
 * Architettura: Acquisition → Validation → Transformation → Persistence
 * Pattern: Parser Type-Safe → Zod Validation → Pure Transform → Atomic DB
 */

import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { validateAnagrafica, type ValidatedAnagrafica, type RawAnagrafica } from '../../acquisition/validators/anagraficaValidator';
import { transformAnagrafiche } from '../../transformation/transformers/anagraficaTransformer';
import type { ImportStats } from '../../../lib/fixedWidthParser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnagraficheImportResult {
  success: boolean;
  message: string;
  stats: ImportStats;
  anagraficheStats: {
    totalProcessed: number;
    clientiCreated: number;
    fornitoriCreated: number;
    entrambiCreated: number;
    personeeFisiche: number;
    societa: number;
    conPartitaIva: number;
    soggettiARitenuta: number;
  };
  errors: Array<{
    row: number;
    error: string;
    data: unknown;
  }>;
}

/**
 * Workflow principale per importazione anagrafiche
 */
export async function executeAnagraficheImportWorkflow(
  fileContent: string,
  templateName: string = 'anagrafica_clifor'
): Promise<AnagraficheImportResult> {
  
  console.log('🚀 Inizio workflow importazione anagrafiche');
  
  
  const errors: Array<{ row: number; error: string; data: unknown }> = [];
  let stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    warnings: [],
    errors: []
  };
  
  try {
    // **FASE 1: ACQUISITION - Parsing Type-Safe**
    console.log('📖 FASE 1: Parsing file A_CLIFOR.TXT...');
    
    const parseResult = await parseFixedWidth<RawAnagrafica>(fileContent, templateName);
    stats = parseResult.stats;
    
    console.log(`✅ Parsing completato:`);
    console.log(`   - Righe totali: ${stats.totalRecords}`);
    console.log(`   - Righe processate: ${stats.successfulRecords}`);
    console.log(`   - Righe con errori: ${stats.errorRecords}`);
    
    if (parseResult.data.length === 0) {
      return {
        success: false,
        message: 'Nessun dato valido trovato nel file',
        stats,
        anagraficheStats: {
          totalProcessed: 0,
          clientiCreated: 0,
          fornitoriCreated: 0,
          entrambiCreated: 0,
          personeeFisiche: 0,
          societa: 0,
          conPartitaIva: 0,
          soggettiARitenuta: 0
        },
        errors
      };
    }
    
    // **FASE 2: VALIDATION - Schema Zod**
    console.log('🔍 FASE 2: Validazione e coercizione dati...');
    
    const validatedRecords: ValidatedAnagrafica[] = [];
    let validationErrors = 0;
    
    for (let i = 0; i < parseResult.data.length; i++) {
      try {
        const validated = validateAnagrafica(parseResult.data[i]);
        validatedRecords.push(validated);
      } catch (error) {
        validationErrors++;
        errors.push({
          row: i + 1,
          error: `Errore validazione: ${error instanceof Error ? error.message : String(error)}`,
          data: parseResult.data[i]
        });
        console.warn(`⚠️  Riga ${i + 1}: Errore validazione - ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log(`✅ Validazione completata:`);
    console.log(`   - Record validi: ${validatedRecords.length}`);
    console.log(`   - Errori validazione: ${validationErrors}`);
    
    if (validatedRecords.length === 0) {
      return {
        success: false,
        message: 'Nessun record ha superato la validazione',
        stats: {
          ...stats,
          errorRecords: stats.errorRecords + validationErrors
        },
        anagraficheStats: {
          totalProcessed: 0,
          clientiCreated: 0,
          fornitoriCreated: 0,
          entrambiCreated: 0,
          personeeFisiche: 0,
          societa: 0,
          conPartitaIva: 0,
          soggettiARitenuta: 0
        },
        errors
      };
    }
    
    // **FASE 3: TRANSFORMATION - Business Logic Pura**
    console.log('🔄 FASE 3: Trasformazione e smistamento Cliente/Fornitore...');
    
    const transformResult = transformAnagrafiche(validatedRecords);
    
    console.log(`✅ Trasformazione completata:`);
    console.log(`   - Clienti da creare: ${transformResult.clienti.length}`);
    console.log(`   - Fornitori da creare: ${transformResult.fornitori.length}`);
    console.log(`   - Record "Entrambi": ${transformResult.statistics.entrambiCreated}`);
    console.log(`   - Persone fisiche: ${transformResult.statistics.personeeFisiche}`);
    console.log(`   - Società: ${transformResult.statistics.societa}`);
    
    // **FASE 4: PERSISTENCE - Transazione Atomica**
    console.log('💾 FASE 4: Salvataggio con logica Upsert nel database...');

    let clientiCreati = 0;
    let clientiAggiornati = 0;
    let fornitoriCreati = 0;
    let fornitoriAggiornati = 0;
    
    await prisma.$transaction(async (tx) => {
      // Salvataggio Clienti con logica Upsert
      if (transformResult.clienti.length > 0) {
        console.log(`💾 Inserimento/Aggiornamento di ${transformResult.clienti.length} clienti...`);
        
        for (const cliente of transformResult.clienti) {
          if (!cliente.externalId) {
            console.warn(`⚠️  Cliente skippato per mancanza di externalId:`, cliente.nome || cliente.denominazione);
            continue; // Skippiamo i record senza un identificatore univoco affidabile
          }

          try {
            const result = await tx.cliente.upsert({
              where: { externalId: cliente.externalId },
              update: cliente,
              create: cliente,
            });
            
            // Questo è un workaround per capire se è stato creato o aggiornato,
            // finché Prisma non fornirà un modo più diretto.
            // Si basa sulla differenza tra createdAt e updatedAt. Se sono uguali (con una tolleranza), è un create.
            if (Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 2000) {
              clientiCreati++;
            } else {
              clientiAggiornati++;
            }

          } catch (error) {
            console.error(`❌ Errore durante l'upsert del cliente ${cliente.nome || cliente.denominazione}:`, error);
            throw error; // Interrompe la transazione in caso di errore
          }
        }
        
        console.log(`✅ Clienti processati: ${clientiCreati} creati, ${clientiAggiornati} aggiornati.`);
      }
      
      // Salvataggio Fornitori con logica Upsert
      if (transformResult.fornitori.length > 0) {
        console.log(`💾 Inserimento/Aggiornamento di ${transformResult.fornitori.length} fornitori...`);
        
        for (const fornitore of transformResult.fornitori) {
          if (!fornitore.externalId) {
            console.warn(`⚠️  Fornitore skippato per mancanza di externalId:`, fornitore.nome || fornitore.denominazione);
            continue; // Skippiamo i record senza un identificatore univoco affidabile
          }

          try {
            const result = await tx.fornitore.upsert({
              where: { externalId: fornitore.externalId },
              update: fornitore,
              create: fornitore,
            });

            if (Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 2000) {
              fornitoriCreati++;
            } else {
              fornitoriAggiornati++;
            }

          } catch (error) {
            console.error(`❌ Errore durante l'upsert del fornitore ${fornitore.nome || fornitore.denominazione}:`, error);
            throw error; // Interrompe la transazione
          }
        }
        
        console.log(`✅ Fornitori processati: ${fornitoriCreati} creati, ${fornitoriAggiornati} aggiornati.`);
      }
    }, 
    {
      maxWait: 15000, // Tempo massimo di attesa per ottenere una connessione dal pool
      timeout: 30000, // Tempo massimo di esecuzione della transazione (aumentato a 30s)
    });

    // Aggiorniamo le statistiche con i conteggi di create/update
    // Nota: le statistiche originali parlavano di 'Created', ora sono più precise.
    const anagraficheStatsUpdated = {
        ...transformResult.statistics,
        clientiCreated: clientiCreati,
        fornitoriCreated: fornitoriCreati,
        // Potremmo aggiungere clientiUpdated e fornitoriUpdated se necessario nel risultato.
    };
    
    // **RISULTATO FINALE**
    const finalMessage = `✅ Import anagrafiche completato con successo!
📊 STATISTICHE FINALI:
   • Record processati: ${transformResult.statistics.totalProcessed}
   • Clienti creati: ${clientiCreati}
   • Clienti aggiornati: ${clientiAggiornati}
   • Fornitori creati: ${fornitoriCreati}
   • Fornitori aggiornati: ${fornitoriAggiornati}
   
📈 DETTAGLIO TIPOLOGIE:
   • Persone fisiche: ${transformResult.statistics.personeeFisiche}
   • Società/Enti: ${transformResult.statistics.societa}
   • Con Partita IVA: ${transformResult.statistics.conPartitaIva}
   • Soggetti a ritenuta: ${transformResult.statistics.soggettiARitenuta}`;
    
    console.log(finalMessage);
    
    return {
      success: true,
      message: finalMessage,
      stats: {
        ...stats,
        inserted: clientiCreati + fornitoriCreati,
        updated: clientiAggiornati + fornitoriAggiornati,
        errorRecords: stats.errorRecords + validationErrors
      },
      anagraficheStats: anagraficheStatsUpdated,
      errors
    };
    
  } catch (error) {
    const errorMessage = `❌ Errore durante l'importazione anagrafiche: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    console.error('Stack trace:', error);
    
    return {
      success: false,
      message: errorMessage,
      stats,
      anagraficheStats: {
        totalProcessed: 0,
        clientiCreated: 0,
        fornitoriCreated: 0,
        entrambiCreated: 0,
        personeeFisiche: 0,
        societa: 0,
        conPartitaIva: 0,
        soggettiARitenuta: 0
      },
      errors
    };
  }
} 