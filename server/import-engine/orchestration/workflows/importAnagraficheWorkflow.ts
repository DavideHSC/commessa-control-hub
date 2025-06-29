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
    console.log('💾 FASE 4: Salvataggio atomico nel database...');
    
    await prisma.$transaction(async (tx) => {
      // Prima eliminiamo i dati esistenti per permettere re-import
      console.log('🗑️  Eliminazione dati esistenti...');
      
      // L'ordine di eliminazione è FONDAMENTALE per rispettare i vincoli di Foreign Key.
      // Si parte dalle tabelle "figlio" per risalire ai "padri".
      
      // 1. Eliminare le tabelle che hanno dipendenze multiple (join tables)
      await tx.allocazione.deleteMany({});
      await tx.rigaIva.deleteMany({});
      
      // 2. Eliminare le tabelle che dipendono da Cliente/Fornitore ma sono "padri" di altre
      await tx.scritturaContabile.deleteMany({}); // Questo elimina a cascata RigaScrittura
      await tx.commessa.deleteMany({});

      // 3. Ora possiamo eliminare Clienti e Fornitori in sicurezza.
      await tx.cliente.deleteMany({});
      await tx.fornitore.deleteMany({});
      
      console.log(`   - Dati precedenti eliminati con successo.`);
      
      // Salvataggio Clienti
      if (transformResult.clienti.length > 0) {
        console.log(`💾 Inserimento ${transformResult.clienti.length} clienti...`);
        
        for (const cliente of transformResult.clienti) {
          try {
            await tx.cliente.create({ data: cliente });
          } catch (error) {
            console.error(`❌ Errore inserimento cliente ${cliente.nome || cliente.denominazione}:`, error);
            throw error;
          }
        }
        
        console.log(`✅ Clienti inseriti con successo`);
      }
      
      // Salvataggio Fornitori
      if (transformResult.fornitori.length > 0) {
        console.log(`💾 Inserimento ${transformResult.fornitori.length} fornitori...`);
        
        for (const fornitore of transformResult.fornitori) {
          try {
            await tx.fornitore.create({ data: fornitore });
          } catch (error) {
            console.error(`❌ Errore inserimento fornitore ${fornitore.nome || fornitore.denominazione}:`, error);
            throw error;
          }
        }
        
        console.log(`✅ Fornitori inseriti con successo`);
      }
    });
    
    // **RISULTATO FINALE**
    const finalMessage = `✅ Import anagrafiche completato con successo!
📊 STATISTICHE FINALI:
   • Record processati: ${transformResult.statistics.totalProcessed}
   • Clienti creati: ${transformResult.statistics.clientiCreated}
   • Fornitori creati: ${transformResult.statistics.fornitoriCreated}
   • Record "Entrambi" (C+F): ${transformResult.statistics.entrambiCreated}
   
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
        errorRecords: stats.errorRecords + validationErrors
      },
      anagraficheStats: transformResult.statistics,
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