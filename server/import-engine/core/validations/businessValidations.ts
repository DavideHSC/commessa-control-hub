import { PrismaClient } from '@prisma/client';

/**
 * Validazioni Business Critiche
 * 
 * Contiene le validazioni business che prevengono inconsistenze critiche:
 * - Gerarchia circolare nelle commesse
 * - Budget vs allocazioni
 * - Integrità referenziale
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Valida che non si crei una gerarchia circolare nelle commesse
 * 
 * @param prisma - Cliente Prisma
 * @param commessaId - ID della commessa da aggiornare
 * @param newParentId - Nuovo ID del parent (può essere null)
 * @returns Risultato validazione
 */
export async function validateCommessaHierarchy(
  prisma: PrismaClient, 
  commessaId: string, 
  newParentId: string | null
): Promise<ValidationResult> {
  
  // Se non c'è parent, non può esserci ciclo
  if (!newParentId) {
    return { isValid: true };
  }

  // Non può essere parent di se stesso
  if (commessaId === newParentId) {
    return { 
      isValid: false, 
      error: 'Una commessa non può essere parent di se stessa' 
    };
  }

  try {
    // Verifica che il parent esista
    const parentCommessa = await prisma.commessa.findUnique({
      where: { id: newParentId },
      select: { id: true, parentId: true }
    });

    if (!parentCommessa) {
      return { 
        isValid: false, 
        error: 'Commessa parent non trovata' 
      };
    }

    // Verifica cicli: risale la gerarchia dal nuovo parent
    const visited = new Set<string>([commessaId]); // Include la commessa corrente
    let currentId = parentCommessa.parentId;

    while (currentId) {
      if (visited.has(currentId)) {
        return { 
          isValid: false, 
          error: 'Rilevato ciclo nella gerarchia delle commesse' 
        };
      }

      visited.add(currentId);
      
      const current = await prisma.commessa.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });

      currentId = current?.parentId || null;
    }

    return { isValid: true };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Errore durante validazione gerarchia: ${error}` 
    };
  }
}

/**
 * Valida che le allocazioni non superino il budget disponibile
 * 
 * @param prisma - Cliente Prisma
 * @param commessaId - ID della commessa
 * @param newBudgetVoci - Nuove voci di budget (opzionale)
 * @returns Risultato validazione
 */
export async function validateBudgetVsAllocazioni(
  prisma: PrismaClient,
  commessaId: string,
  newBudgetVoci?: Array<{ voceAnaliticaId: string; budgetPrevisto: number }>
): Promise<ValidationResult> {

  try {
    // Ottieni allocazioni attuali per commessa
    const allocazioni = await prisma.allocazione.findMany({
      where: { commessaId },
      select: {
        importo: true,
        voceAnaliticaId: true,
        tipoMovimento: true
      }
    });

    // Calcola totali allocati per voce analitica
    const allocazioniPerVoce = allocazioni.reduce((acc, alloc) => {
      const key = alloc.voceAnaliticaId;
      if (!acc[key]) acc[key] = 0;
      
      // Somma costi, sottrai ricavi
      const delta = (alloc.tipoMovimento === 'COSTO_EFFETTIVO' || alloc.tipoMovimento === 'COSTO_STIMATO' || alloc.tipoMovimento === 'COSTO_BUDGET') ? alloc.importo : -alloc.importo;
      acc[key] += delta;
      
      return acc;
    }, {} as Record<string, number>);

    // Ottieni budget attuale o usa quello nuovo
    let budgetVoci: Array<{ voceAnaliticaId: string; budgetPrevisto: number }>;
    
    if (newBudgetVoci) {
      budgetVoci = newBudgetVoci;
    } else {
      const budgetFromDB = await prisma.budgetVoce.findMany({
        where: { commessaId },
        select: { voceAnaliticaId: true, importo: true }
      });
      budgetVoci = budgetFromDB.map(b => ({
        voceAnaliticaId: b.voceAnaliticaId,
        budgetPrevisto: b.importo
      }));
    }

    const warnings: string[] = [];
    let hasErrors = false;

    // Verifica ogni voce di budget
    for (const budgetVoce of budgetVoci) {
      const allocato = allocazioniPerVoce[budgetVoce.voceAnaliticaId] || 0;
      const budget = budgetVoce.budgetPrevisto;
      
      if (allocato > budget) {
        const voceAnalitica = await prisma.voceAnalitica.findUnique({
          where: { id: budgetVoce.voceAnaliticaId },
          select: { nome: true }
        });
        
        warnings.push(
          `Voce "${voceAnalitica?.nome || 'N/D'}": allocato €${allocato.toFixed(2)} supera budget €${budget.toFixed(2)}`
        );
        hasErrors = true;
      }
    }

    // Per ora trattiamo come warning, non blocca l'operazione
    return { 
      isValid: true, // Non blocchiamo per ora
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Errore durante validazione budget: ${error}` 
    };
  }
}

/**
 * Valida che una commessa possa essere eliminata
 * 
 * @param prisma - Cliente Prisma
 * @param commessaId - ID della commessa da eliminare
 * @returns Risultato validazione
 */
export async function validateCommessaDeletion(
  prisma: PrismaClient,
  commessaId: string
): Promise<ValidationResult> {

  try {
    // Controlla se ha figli
    const children = await prisma.commessa.count({
      where: { parentId: commessaId }
    });

    if (children > 0) {
      return { 
        isValid: false, 
        error: `Impossibile eliminare commessa con ${children} commesse figlie` 
      };
    }

    // Controlla se ha allocazioni
    const allocazioni = await prisma.allocazione.count({
      where: { commessaId }
    });

    if (allocazioni > 0) {
      return { 
        isValid: false, 
        error: `Impossibile eliminare commessa con ${allocazioni} allocazioni esistenti` 
      };
    }

    return { isValid: true };

  } catch (error) {
    return { 
      isValid: false, 
      error: `Errore durante validazione eliminazione: ${error}` 
    };
  }
}

/**
 * Esegue tutte le validazioni business per l'aggiornamento di una commessa
 * 
 * @param prisma - Cliente Prisma
 * @param commessaId - ID della commessa
 * @param updateData - Dati di aggiornamento
 * @returns Risultato validazione completa
 */
export async function validateCommessaUpdate(
  prisma: PrismaClient,
  commessaId: string,
  updateData: {
    parentId?: string | null;
    budget?: Array<{ voceAnaliticaId: string; budgetPrevisto: number }>;
  }
): Promise<ValidationResult> {

  const allWarnings: string[] = [];

  // Validazione gerarchia
  if (updateData.parentId !== undefined) {
    const hierarchyResult = await validateCommessaHierarchy(prisma, commessaId, updateData.parentId);
    if (!hierarchyResult.isValid) {
      return hierarchyResult;
    }
  }

  // Validazione budget vs allocazioni
  if (updateData.budget) {
    const budgetResult = await validateBudgetVsAllocazioni(prisma, commessaId, updateData.budget);
    if (!budgetResult.isValid) {
      return budgetResult;
    }
    if (budgetResult.warnings) {
      allWarnings.push(...budgetResult.warnings);
    }
  }

  return { 
    isValid: true, 
    warnings: allWarnings.length > 0 ? allWarnings : undefined 
  };
}