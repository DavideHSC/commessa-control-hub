import { PrismaClient } from '@prisma/client';
import { AllocationStatusData, VirtualMovimento, AllocationStatus } from '../types/virtualEntities.js';
import { parseItalianCurrency, calculateAllocationStatus, getTipoMovimento } from '../utils/stagingDataHelpers.js';
import { RigheAggregator } from './RigheAggregator.js';

export class AllocationCalculator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Calcola gli stati di allocazione per tutti i movimenti staging
   * Logica INTERPRETATIVA - calcola senza finalizzare
   */
  async calculateAllocationStatus(): Promise<AllocationStatusData> {
    const startTime = Date.now();

    try {
      // 1. Ottieni le scritture aggregate dal RigheAggregator
      const aggregator = new RigheAggregator();
      const aggregationData = await aggregator.aggregateRighe();
      const scritture = aggregationData.scritture;

      // 2. Calcola stati di allocazione per ogni movimento
      const movimenti = await this.calculateMovimentiAllocationStatus(scritture);

      // 3. Raggruppa per stato
      const allocationsByStatus: Record<AllocationStatus, number> = {
        'non_allocato': 0,
        'parzialmente_allocato': 0,
        'completamente_allocato': 0
      };

      let totalAllocatedAmount = 0;
      let totalMovementAmount = 0;

      movimenti.forEach(movimento => {
        allocationsByStatus[movimento.scrittura.allocationStatus]++;
        totalAllocatedAmount += Math.abs(movimento.totaleMovimento) * movimento.allocationPercentage;
        totalMovementAmount += Math.abs(movimento.totaleMovimento);
      });

      // 4. Trova i top movimenti non allocati per prioritizzazione
      const topUnallocatedMovements = movimenti
        .filter(m => m.scrittura.allocationStatus === 'non_allocato')
        .sort((a, b) => Math.abs(b.totaleMovimento) - Math.abs(a.totaleMovimento))
        .slice(0, 10); // Top 10

      const averageAllocationPercentage = totalMovementAmount > 0 
        ? totalAllocatedAmount / totalMovementAmount 
        : 0;

      const processingTime = Date.now() - startTime;
      console.log(`✅ AllocationCalculator: Processed ${movimenti.length} movimenti in ${processingTime}ms`);

      return {
        allocationsByStatus,
        totalAllocations: movimenti.length,
        averageAllocationPercentage,
        topUnallocatedMovements
      };

    } catch (error) {
      console.error('❌ Error in AllocationCalculator:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Calcola lo stato di allocazione per ogni movimento
   */
  private async calculateMovimentiAllocationStatus(scritture: any[]): Promise<VirtualMovimento[]> {
    const movimenti: VirtualMovimento[] = [];

    // Carica allocazioni esistenti per confronto
    let allocazioniEsistenti = [];
    try {
      allocazioniEsistenti = await this.prisma.allocazione.findMany({
        select: {
          rigaScritturaId: true,
          importo: true,
          rigaScrittura: {
            select: {
              scritturaContabile: {
                select: {
                  externalId: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.warn('⚠️ Could not load existing allocazioni (tables may be empty or missing):', error.message);
      allocazioniEsistenti = [];
    }

    // Crea mappa delle allocazioni esistenti per externalId
    const allocazioniMap = new Map<string, number>();
    allocazioniEsistenti.forEach(alloc => {
      try {
        const externalId = alloc.rigaScrittura?.scritturaContabile?.externalId;
        if (externalId) {
          const currentTotal = allocazioniMap.get(externalId) || 0;
          allocazioniMap.set(externalId, currentTotal + Math.abs(alloc.importo || 0));
        }
      } catch (error) {
        console.warn('⚠️ Error processing existing allocation:', error);
      }
    });

    scritture.forEach(scrittura => {
      try {
        // Calcola il totale del movimento (valore assoluto del maggiore tra dare e avere)
        const totaleMovimento = Math.max(scrittura.totaliDare || 0, scrittura.totaliAvere || 0);
        
        // Ottieni allocazioni esistenti per questa scrittura
        const allocatoEsistente = allocazioniMap.get(scrittura.codiceUnivocoScaricamento) || 0;
        
        // Aggiungi allocazioni staging potenziali
        const allocazioniStaging = scrittura.allocazioni?.length || 0;
        
        // Calcola percentuale di allocazione
        let allocationPercentage = 0;
        let allocationStatus: AllocationStatus = 'non_allocato';
        
        if (totaleMovimento > 0) {
          allocationPercentage = allocatoEsistente / totaleMovimento;
          
          if (allocatoEsistente === 0 && allocazioniStaging === 0) {
            allocationStatus = 'non_allocato';
          } else if (Math.abs(allocatoEsistente - totaleMovimento) < 0.01) {
            allocationStatus = 'completamente_allocato';
          } else {
            allocationStatus = 'parzialmente_allocato';
          }
        }

        // Determina il tipo di movimento
        const tipoMovimento = getTipoMovimento(scrittura.righeContabili || []);

        // Crea movimento virtuale
        const movimento: VirtualMovimento = {
          scrittura: {
            ...scrittura,
            allocationStatus
          },
          anagraficheRisolte: (scrittura.righeContabili || [])
            .map((r: any) => r.anagrafica)
            .filter((a: any) => a !== null),
          totaleMovimento,
          tipoMovimento,
          allocationPercentage,
          businessValidations: [] // Sarà popolato da BusinessValidationTester
        };

        movimenti.push(movimento);
      } catch (error) {
        console.error(`❌ Error processing movimento for scrittura ${scrittura.codiceUnivocoScaricamento}:`, error);
        // Skip this movimento and continue with others
      }
    });

    return movimenti;
  }

  /**
   * Calcola statistiche dettagliate per una specifica scrittura
   */
  async calculateScritturaAllocationDetails(codiceUnivocoScaricamento: string): Promise<{
    totalAmount: number;
    allocatedAmount: number;
    remainingAmount: number;
    allocationPercentage: number;
    status: AllocationStatus;
    righeBreakdown: Array<{
      progressivo: string;
      importo: number;
      allocato: number;
      rimanente: number;
      status: AllocationStatus;
    }>;
  } | null> {
    try {
      // Carica dati staging per questa scrittura
      const [righeContabili, allocazioniStaging] = await Promise.all([
        this.prisma.stagingRigaContabile.findMany({
          where: { codiceUnivocoScaricamento },
          select: {
            progressivoRigo: true,
            importoDare: true,
            importoAvere: true
          }
        }),
        this.prisma.stagingAllocazione.findMany({
          where: { codiceUnivocoScaricamento },
          select: {
            progressivoRigoContabile: true
          }
        })
      ]);

      if (righeContabili.length === 0) return null;

      const righeBreakdown = righeContabili.map(riga => {
        try {
          const importoDare = parseItalianCurrency(riga.importoDare);
          const importoAvere = parseItalianCurrency(riga.importoAvere);
          const importoRiga = Math.max(importoDare, importoAvere);
          
          // Conta allocazioni per questa riga
          const allocazioniRiga = allocazioniStaging.filter(
            a => a.progressivoRigoContabile === riga.progressivoRigo
          ).length;

          // Per ora assumiamo allocazione "binaria" - o 100% o 0%
          const allocato = allocazioniRiga > 0 ? importoRiga : 0;
          const rimanente = importoRiga - allocato;
          const status: AllocationStatus = allocato === 0 ? 'non_allocato' : 
                                         rimanente === 0 ? 'completamente_allocato' : 
                                         'parzialmente_allocato';

          return {
            progressivo: riga.progressivoRigo,
            importo: importoRiga,
            allocato,
            rimanente,
            status
          };
        } catch (error) {
          console.error(`❌ Error processing riga breakdown ${riga.progressivoRigo}:`, error);
          // Return safe default
          return {
            progressivo: riga.progressivoRigo || '',
            importo: 0,
            allocato: 0,
            rimanente: 0,
            status: 'non_allocato' as AllocationStatus
          };
        }
      });

      const totalAmount = righeBreakdown.reduce((sum, r) => sum + r.importo, 0);
      const allocatedAmount = righeBreakdown.reduce((sum, r) => sum + r.allocato, 0);
      const remainingAmount = totalAmount - allocatedAmount;
      const allocationPercentage = totalAmount > 0 ? allocatedAmount / totalAmount : 0;
      
      const status: AllocationStatus = allocatedAmount === 0 ? 'non_allocato' :
                                     remainingAmount === 0 ? 'completamente_allocato' :
                                     'parzialmente_allocato';

      return {
        totalAmount,
        allocatedAmount,
        remainingAmount,
        allocationPercentage,
        status,
        righeBreakdown
      };

    } catch (error) {
      console.error('❌ Error calculating scrittura allocation details:', error);
      return null;
    }
  }
}