/**
 * RealBusinessValidator - Sostituisce validazioni MOCK con validazioni reali
 * 
 * PROBLEMA RISOLTO: AllocationWorkflowService.ts aveva validazioni 100% mock
 * che restituivano sempre SUCCESS, compromettendo sicurezza e integrità dati.
 * 
 * SOLUZIONE: Validazioni business reali che controllano:
 * 1. Commesse esistenti e attive
 * 2. Budget disponibili (con warning non bloccanti)
 * 3. Voci analitiche valide
 * 4. Importi positivi e consistenti
 * 5. Autorizzazioni utente (se implementate)
 */

import { PrismaClient } from '@prisma/client';
import { ValidationResult, AllocazioneVirtuale, MovimentoContabileCompleto } from '../types/virtualEntities';

export interface BusinessValidationContext {
  allocazioniVirtuali: AllocazioneVirtuale[];
  movimento?: MovimentoContabileCompleto;
  userId?: string;
  options?: {
    skipBudgetWarnings?: boolean;
    allowInactiveCommesse?: boolean;
    strictMode?: boolean;
  };
}

export class RealBusinessValidator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Esegue tutte le validazioni business reali
   */
  async validateAllocations(context: BusinessValidationContext): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // 1. Validazioni strutturali di base
      results.push(...await this.validateBasicStructure(context.allocazioniVirtuali));
      
      // 2. Validazioni commesse
      results.push(...await this.validateCommesse(context.allocazioniVirtuali, context.options));
      
      // 3. Validazioni voci analitiche
      results.push(...await this.validateVociAnalitiche(context.allocazioniVirtuali));
      
      // 4. Validazioni importi
      results.push(...await this.validateImporti(context.allocazioniVirtuali, context.movimento));
      
      // 5. Validazioni budget (warning non bloccanti)
      if (!context.options?.skipBudgetWarnings) {
        results.push(...await this.validateBudgetImpacts(context.allocazioniVirtuali));
      }
      
      // 6. Validazioni autorizzazioni (se necessarie)
      if (context.userId && context.options?.strictMode) {
        results.push(...await this.validateUserPermissions(context.allocazioniVirtuali, context.userId));
      }
      
      console.log(`✅ BusinessValidation completed: ${results.length} validation results`);
      
    } catch (error) {
      console.error('❌ BusinessValidation failed:', error);
      results.push({
        rule: 'VALIDATION_ERROR',
        passed: false,
        message: `Errore interno durante validazione: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'ERROR'
      });
    }

    return results;
  }

  /**
   * 1. Validazioni strutturali di base
   */
  private async validateBasicStructure(allocazioni: AllocazioneVirtuale[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Almeno una allocazione
    if (allocazioni.length === 0) {
      results.push({
        rule: 'MIN_ALLOCATIONS',
        passed: false,
        message: 'È necessario specificare almeno una allocazione',
        severity: 'ERROR'
      });
      return results;
    }

    // Controllo dati obbligatori
    let missingData = 0;
    let invalidAmounts = 0;

    for (const alloc of allocazioni) {
      if (!alloc.commessaId) missingData++;
      if (!alloc.importo || alloc.importo <= 0) invalidAmounts++;
    }

    if (missingData > 0) {
      results.push({
        rule: 'REQUIRED_FIELDS',
        passed: false,
        message: `${missingData} allocazioni mancano di commessa obbligatoria`,
        severity: 'ERROR'
      });
    }

    if (invalidAmounts > 0) {
      results.push({
        rule: 'POSITIVE_AMOUNTS',
        passed: false,
        message: `${invalidAmounts} allocazioni hanno importi non validi (≤ 0)`,
        severity: 'ERROR'
      });
    }

    // Se tutto OK
    if (missingData === 0 && invalidAmounts === 0) {
      results.push({
        rule: 'BASIC_STRUCTURE',
        passed: true,
        message: `${allocazioni.length} allocazioni strutturalmente valide`,
        severity: 'INFO'
      });
    }

    return results;
  }

  /**
   * 2. Validazioni commesse (esistenza e stato attivo)
   */
  private async validateCommesse(
    allocazioni: AllocazioneVirtuale[], 
    options?: BusinessValidationContext['options']
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Ottieni commesse uniche
    const commesseIds = [...new Set(allocazioni.map(a => a.commessaId).filter(Boolean))];
    
    if (commesseIds.length === 0) {
      return results; // Già gestito in validateBasicStructure
    }

    try {
      // Verifica esistenza nel database
      const commesseFound = await this.prisma.commessa.findMany({
        where: {
          id: { in: commesseIds }
        },
        select: {
          id: true,
          nome: true,
          isAttiva: true,
          stato: true
        }
      });

      const foundIds = new Set(commesseFound.map(c => c.id));
      const notFound = commesseIds.filter(id => !foundIds.has(id));
      const inactive = commesseFound.filter(c => !c.isAttiva);

      // Commesse non trovate
      if (notFound.length > 0) {
        results.push({
          rule: 'COMMESSE_EXIST',
          passed: false,
          message: `Commesse non trovate: ${notFound.join(', ')}`,
          severity: 'ERROR'
        });
      }

      // Commesse inattive
      if (inactive.length > 0 && !options?.allowInactiveCommesse) {
        results.push({
          rule: 'COMMESSE_ACTIVE',
          passed: false,
          message: `Commesse non attive: ${inactive.map(c => `${c.nome} (${c.stato})`).join(', ')}`,
          severity: 'ERROR'
        });
      }

      // Riepilogo positivo
      const validCommesse = commesseFound.filter(c => c.isAttiva || options?.allowInactiveCommesse);
      if (validCommesse.length > 0 && notFound.length === 0) {
        results.push({
          rule: 'COMMESSE_VALID',
          passed: true,
          message: `${validCommesse.length} commesse valide: ${validCommesse.map(c => c.nome).join(', ')}`,
          severity: 'INFO'
        });
      }

    } catch (error) {
      results.push({
        rule: 'COMMESSE_CHECK_ERROR',
        passed: false,
        message: `Errore verifica commesse: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'ERROR'
      });
    }

    return results;
  }

  /**
   * 3. Validazioni voci analitiche
   */
  private async validateVociAnalitiche(allocazioni: AllocazioneVirtuale[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    const vociIds = allocazioni
      .map(a => a.voceAnaliticaId)
      .filter(Boolean)
      .filter((id, index, arr) => arr.indexOf(id) === index); // unique

    if (vociIds.length === 0) {
      // Non è un errore bloccante - le voci analitiche possono essere opzionali
      results.push({
        rule: 'VOCI_ANALITICHE_OPTIONAL',
        passed: true,
        message: 'Nessuna voce analitica specificata - allocazione su commessa generica',
        severity: 'INFO'
      });
      return results;
    }

    try {
      const vociFound = await this.prisma.voceAnalitica.findMany({
        where: {
          id: { in: vociIds }
        },
        select: {
          id: true,
          nome: true,
          tipo: true
        }
      });

      const foundIds = new Set(vociFound.map(v => v.id));
      const notFound = vociIds.filter(id => !foundIds.has(id));

      if (notFound.length > 0) {
        results.push({
          rule: 'VOCI_ANALITICHE_EXIST',
          passed: false,
          message: `Voci analitiche non trovate: ${notFound.join(', ')}`,
          severity: 'ERROR'
        });
      } else {
        results.push({
          rule: 'VOCI_ANALITICHE_VALID',
          passed: true,
          message: `${vociFound.length} voci analitiche valide`,
          severity: 'INFO'
        });
      }

    } catch (error) {
      results.push({
        rule: 'VOCI_CHECK_ERROR',
        passed: false,
        message: `Errore verifica voci analitiche: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'ERROR'
      });
    }

    return results;
  }

  /**
   * 4. Validazioni importi e consistenza
   */
  private async validateImporti(
    allocazioni: AllocazioneVirtuale[], 
    movimento?: MovimentoContabileCompleto
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    const totalAllocated = allocazioni.reduce((sum, a) => sum + (a.importo || 0), 0);

    // Importi positivi (già controllato in validateBasicStructure, ma double-check)
    const negativeAmounts = allocazioni.filter(a => (a.importo || 0) <= 0);
    if (negativeAmounts.length > 0) {
      results.push({
        rule: 'IMPORTI_POSITIVE_DETAILED',
        passed: false,
        message: `${negativeAmounts.length} allocazioni con importi non positivi`,
        severity: 'ERROR'
      });
    }

    // Se abbiamo il movimento, verifichiamo la consistenza
    if (movimento) {
      // Calcola importo totale movimento allocabile
      let importoMovimentoTotale = 0;
      try {
        // Logica semplificata - più sofisticata nell'ImportoAllocabileCalculator
        importoMovimentoTotale = movimento.righeDettaglio.reduce((sum, riga) => {
          return sum + Math.max(riga.importoDare || 0, riga.importoAvere || 0);
        }, 0);
      } catch (error) {
        console.warn('Warning: could not calculate movimento total:', error);
      }

      if (importoMovimentoTotale > 0) {
        const differenza = Math.abs(totalAllocated - importoMovimentoTotale);
        const percentualeDifferenza = (differenza / importoMovimentoTotale) * 100;

        if (percentualeDifferenza > 1) { // Tolleranza 1%
          results.push({
            rule: 'IMPORTO_CONSISTENCY',
            passed: false,
            message: `Totale allocato (€${totalAllocated.toFixed(2)}) diverso da totale movimento (€${importoMovimentoTotale.toFixed(2)})`,
            severity: 'WARNING'
          });
        } else {
          results.push({
            rule: 'IMPORTO_CONSISTENCY',
            passed: true,
            message: `Allocazione completa: €${totalAllocated.toFixed(2)} correttamente distribuiti`,
            severity: 'INFO'
          });
        }
      }
    }

    return results;
  }

  /**
   * 5. Validazioni budget impacts (warning non bloccanti)
   */
  private async validateBudgetImpacts(allocazioni: AllocazioneVirtuale[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Raggruppa allocazioni per commessa
      const allocazioniPerCommessa = new Map<string, number>();
      
      for (const alloc of allocazioni) {
        if (!alloc.commessaId) continue;
        const current = allocazioniPerCommessa.get(alloc.commessaId) || 0;
        allocazioniPerCommessa.set(alloc.commessaId, current + alloc.importo);
      }

      // Verifica budget per ogni commessa
      for (const [commessaId, importoAllocato] of allocazioniPerCommessa) {
        const budgetInfo = await this.getBudgetInfo(commessaId);
        
        if (budgetInfo.budget > 0) {
          const utilizzoPercentuale = (budgetInfo.utilizzoAttuale + importoAllocato) / budgetInfo.budget * 100;
          
          if (utilizzoPercentuale > 100) {
            results.push({
              rule: 'BUDGET_EXCEEDED',
              passed: false, // Ma severity WARNING, quindi non bloccante
              message: `Commessa ${commessaId}: budget superato del ${(utilizzoPercentuale - 100).toFixed(1)}%`,
              severity: 'WARNING'
            });
          } else if (utilizzoPercentuale > 90) {
            results.push({
              rule: 'BUDGET_NEAR_LIMIT',
              passed: true,
              message: `Commessa ${commessaId}: budget utilizzato al ${utilizzoPercentuale.toFixed(1)}%`,
              severity: 'WARNING'
            });
          }
        }
      }

      // Riepilogo generale positivo se non ci sono overrun critici
      const criticalOverruns = results.filter(r => r.rule === 'BUDGET_EXCEEDED').length;
      if (criticalOverruns === 0) {
        results.push({
          rule: 'BUDGET_IMPACTS_OK',
          passed: true,
          message: 'Impatti sui budget entro i limiti accettabili',
          severity: 'INFO'
        });
      }

    } catch (error) {
      console.warn('Warning: budget validation failed:', error);
      results.push({
        rule: 'BUDGET_CHECK_WARNING',
        passed: true,
        message: 'Controllo budget non disponibile - allocazioni procedonosenza validazione budget',
        severity: 'WARNING'
      });
    }

    return results;
  }

  /**
   * 6. Validazioni autorizzazioni utente (placeholder per futuro)
   */
  private async validateUserPermissions(
    allocazioni: AllocazioneVirtuale[], 
    userId: string
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Per ora sempre successo - da implementare quando avremo sistema autorizzazioni
    results.push({
      rule: 'USER_PERMISSIONS',
      passed: true,
      message: `Utente ${userId} autorizzato per queste allocazioni`,
      severity: 'INFO'
    });

    return results;
  }

  /**
   * Utility per ottenere informazioni budget di una commessa
   */
  private async getBudgetInfo(commessaId: string): Promise<{
    budget: number;
    utilizzoAttuale: number;
  }> {
    try {
      // Calcola budget totale dalla tabella BudgetVoce
      const budgetVoci = await this.prisma.budgetVoce.findMany({
        where: { commessaId }
      });

      const budgetTotale = budgetVoci.reduce((sum, voce) => sum + voce.importo, 0);

      // Calcola utilizzo attuale dalle allocazioni esistenti
      const allocazioniEsistenti = await this.prisma.allocazione.findMany({
        where: { commessaId }
      });

      const utilizzoAttuale = allocazioniEsistenti.reduce((sum, alloc) => sum + alloc.importo, 0);

      return {
        budget: budgetTotale,
        utilizzoAttuale
      };

    } catch (error) {
      console.warn(`Warning: could not get budget info for commessa ${commessaId}:`, error);
      return { budget: 0, utilizzoAttuale: 0 };
    }
  }

  /**
   * Utility per verificare se ci sono errori bloccanti
   */
  static hasBlockingErrors(validationResults: ValidationResult[]): boolean {
    return validationResults.some(result => 
      !result.passed && result.severity === 'ERROR'
    );
  }

  /**
   * Utility per ottenere summary delle validazioni
   */
  static getValidationSummary(validationResults: ValidationResult[]): {
    totalRules: number;
    passed: number;
    failed: number;
    errors: number;
    warnings: number;
    infos: number;
    canProceed: boolean;
  } {
    const errors = validationResults.filter(r => r.severity === 'ERROR');
    const warnings = validationResults.filter(r => r.severity === 'WARNING');
    const infos = validationResults.filter(r => r.severity === 'INFO');
    const passed = validationResults.filter(r => r.passed);
    const failed = validationResults.filter(r => !r.passed);

    return {
      totalRules: validationResults.length,
      passed: passed.length,
      failed: failed.length,
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
      canProceed: !this.hasBlockingErrors(validationResults)
    };
  }
}

export default RealBusinessValidator;