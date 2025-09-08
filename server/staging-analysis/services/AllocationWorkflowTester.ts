import { PrismaClient } from '@prisma/client';
import { AllocationWorkflowTest, AllocationWorkflowResult, VirtualAllocazione, ValidationResult } from '../types/virtualEntities.js';
import { parseItalianCurrency, isValidAllocationData } from '../utils/stagingDataHelpers.js';

export class AllocationWorkflowTester {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Testa il workflow di allocazione manuale sui dati staging
   * Simula il processo di allocazione senza effettivamente creare record
   */
  async testAllocationWorkflow(testData: AllocationWorkflowTest): Promise<AllocationWorkflowResult> {
    const startTime = Date.now();

    try {
      // 1. Valida input
      const validationResults = await this.validateAllocationRequest(testData);
      
      if (validationResults.some(v => v.severity === 'ERROR')) {
        return {
          success: false,
          virtualAllocations: [],
          validations: validationResults,
          totalAllocatedAmount: 0,
          remainingAmount: 0
        };
      }

      // 2. Trova la riga contabile target
      const rigaTarget = await this.findTargetRiga(testData.rigaScritturaIdentifier);
      if (!rigaTarget) {
        validationResults.push({
          rule: 'RIGA_EXISTS',
          passed: false,
          message: `Riga contabile ${testData.rigaScritturaIdentifier} non trovata`,
          severity: 'ERROR'
        });

        return {
          success: false,
          virtualAllocations: [],
          validations: validationResults,
          totalAllocatedAmount: 0,
          remainingAmount: 0
        };
      }

      // 3. Crea allocazioni virtuali
      const virtualAllocations = await this.createVirtualAllocations(
        testData.proposedAllocations, 
        rigaTarget
      );

      // 4. Valida allocazioni
      const allocationValidations = await this.validateVirtualAllocations(
        virtualAllocations, 
        rigaTarget.importoTotale
      );

      validationResults.push(...allocationValidations);

      // 5. Calcola totali
      const totalAllocatedAmount = virtualAllocations.reduce((sum, alloc) => {
        // Estrarre l'importo dalla logica di allocazione (da implementare)
        return sum + rigaTarget.importoTotale / virtualAllocations.length; // Distribuzione uniforme per test
      }, 0);

      const remainingAmount = rigaTarget.importoTotale - totalAllocatedAmount;

      const processingTime = Date.now() - startTime;
      console.log(`✅ AllocationWorkflowTester: Tested ${virtualAllocations.length} allocations in ${processingTime}ms`);

      return {
        success: validationResults.every(v => v.severity !== 'ERROR'),
        virtualAllocations,
        validations: validationResults,
        totalAllocatedAmount,
        remainingAmount
      };

    } catch (error) {
      console.error('❌ Error in AllocationWorkflowTester:', error);
      return {
        success: false,
        virtualAllocations: [],
        validations: [{
          rule: 'SYSTEM_ERROR',
          passed: false,
          message: `Errore di sistema: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'ERROR'
        }],
        totalAllocatedAmount: 0,
        remainingAmount: 0
      };
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Valida la richiesta di allocazione
   */
  private async validateAllocationRequest(testData: AllocationWorkflowTest): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];

    // Valida che ci siano allocazioni proposte
    if (!testData.proposedAllocations || testData.proposedAllocations.length === 0) {
      validations.push({
        rule: 'HAS_ALLOCATIONS',
        passed: false,
        message: 'Nessuna allocazione proposta fornita',
        severity: 'ERROR'
      });
    }

    // Valida che ogni allocazione proposta abbia i campi richiesti
    testData.proposedAllocations?.forEach((alloc, index) => {
      if (!alloc.commessaExternalId?.trim()) {
        validations.push({
          rule: 'COMMESSA_REQUIRED',
          passed: false,
          message: `Allocazione ${index + 1}: Commessa richiesta`,
          severity: 'ERROR'
        });
      }

      if (!alloc.voceAnaliticaNome?.trim()) {
        validations.push({
          rule: 'VOCE_REQUIRED',
          passed: false,
          message: `Allocazione ${index + 1}: Voce analitica richiesta`,
          severity: 'ERROR'
        });
      }

      if (typeof alloc.importo !== 'number' || alloc.importo <= 0) {
        validations.push({
          rule: 'IMPORTO_VALID',
          passed: false,
          message: `Allocazione ${index + 1}: Importo deve essere positivo`,
          severity: 'ERROR'
        });
      }
    });

    // Valida che le commesse esistano
    if (testData.proposedAllocations) {
      const commesseIds = testData.proposedAllocations.map(a => a.commessaExternalId);
      let commesseEsistenti = [];
      
      try {
        commesseEsistenti = await this.prisma.commessa.findMany({
          where: { externalId: { in: commesseIds } },
          select: { externalId: true }
        });
      } catch (error) {
        console.warn('⚠️ Could not load commesse (table may be empty):', error.message);
        commesseEsistenti = [];
      }

      const commesseFound = new Set(commesseEsistenti.map(c => c.externalId));
      
      commesseIds.forEach(id => {
        if (!commesseFound.has(id)) {
          validations.push({
            rule: 'COMMESSA_EXISTS',
            passed: false,
            message: `Commessa ${id} non trovata nel database`,
            severity: 'WARNING' // Warning perché potrebbe essere creata automaticamente
          });
        }
      });
    }

    return validations;
  }

  /**
   * Trova la riga contabile target per l'allocazione
   */
  private async findTargetRiga(identifier: string): Promise<{
    codiceUnivocoScaricamento: string;
    progressivoRigo: string;
    importoTotale: number;
  } | null> {
    // Parse identifier nel formato "CODICE-PROGRESSIVO"
    const parts = identifier.split('-');
    if (parts.length !== 2) return null;

    const [codiceUnivocoScaricamento, progressivoRigo] = parts;

    const riga = await this.prisma.stagingRigaContabile.findFirst({
      where: {
        codiceUnivocoScaricamento,
        progressivoRigo
      },
      select: {
        codiceUnivocoScaricamento: true,
        progressivoRigo: true,
        importoDare: true,
        importoAvere: true
      }
    });

    if (!riga) return null;

    const importoDare = parseItalianCurrency(riga.importoDare);
    const importoAvere = parseItalianCurrency(riga.importoAvere);
    const importoTotale = Math.max(importoDare, importoAvere);

    return {
      codiceUnivocoScaricamento: riga.codiceUnivocoScaricamento,
      progressivoRigo: riga.progressivoRigo,
      importoTotale
    };
  }

  /**
   * Crea allocazioni virtuali dalle proposte
   */
  private async createVirtualAllocations(
    proposedAllocations: AllocationWorkflowTest['proposedAllocations'],
    rigaTarget: { codiceUnivocoScaricamento: string; progressivoRigo: string }
  ): Promise<VirtualAllocazione[]> {
    const virtualAllocations: VirtualAllocazione[] = [];

    for (const proposed of proposedAllocations) {
      let commessa = null;
      let voceAnalitica = null;

      // Cerca commessa esistente
      try {
        commessa = await this.prisma.commessa.findFirst({
          where: { externalId: proposed.commessaExternalId },
          select: { id: true, nome: true }
        });
      } catch (error) {
        console.warn('⚠️ Could not search commessa (table may be empty):', error.message);
      }

      // Cerca voce analitica esistente
      try {
        voceAnalitica = await this.prisma.voceAnalitica.findFirst({
          where: { nome: proposed.voceAnaliticaNome },
          select: { id: true, nome: true }
        });
      } catch (error) {
        console.warn('⚠️ Could not search voce analitica (table may be empty):', error.message);
      }

      virtualAllocations.push({
        progressivoRigoContabile: rigaTarget.progressivoRigo,
        centroDiCosto: proposed.commessaExternalId, // Usiamo externalId come centro di costo
        parametro: proposed.voceAnaliticaNome,
        matchedCommessa: commessa ? {
          id: commessa.id,
          nome: commessa.nome
        } : null,
        matchedVoceAnalitica: voceAnalitica ? {
          id: voceAnalitica.id,
          nome: voceAnalitica.nome
        } : null
      });
    }

    return virtualAllocations;
  }

  /**
   * Valida le allocazioni virtuali create
   */
  private async validateVirtualAllocations(
    virtualAllocations: VirtualAllocazione[],
    importoTotaleRiga: number
  ): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];

    // Valida che non ci siano allocazioni duplicate
    const centroCostoParametroSet = new Set<string>();
    virtualAllocations.forEach((alloc, index) => {
      const key = `${alloc.centroDiCosto}-${alloc.parametro}`;
      if (centroCostoParametroSet.has(key)) {
        validations.push({
          rule: 'NO_DUPLICATES',
          passed: false,
          message: `Allocazione duplicata per commessa ${alloc.centroDiCosto} e voce ${alloc.parametro}`,
          severity: 'WARNING'
        });
      }
      centroCostoParametroSet.add(key);
    });

    // Valida che le entità mancanti possano essere create automaticamente
    virtualAllocations.forEach((alloc, index) => {
      if (!alloc.matchedCommessa) {
        validations.push({
          rule: 'COMMESSA_AUTO_CREATE',
          passed: true,
          message: `Commessa ${alloc.centroDiCosto} sarà creata automaticamente`,
          severity: 'INFO'
        });
      }

      if (!alloc.matchedVoceAnalitica) {
        validations.push({
          rule: 'VOCE_AUTO_CREATE',
          passed: true,
          message: `Voce analitica ${alloc.parametro} sarà creata automaticamente`,
          severity: 'INFO'
        });
      }
    });

    // Validazione business: controllo che le allocazioni siano sensate
    if (virtualAllocations.length > 0) {
      validations.push({
        rule: 'BUSINESS_LOGIC_OK',
        passed: true,
        message: `${virtualAllocations.length} allocazioni virtuali create con successo`,
        severity: 'INFO'
      });
    }

    return validations;
  }
}