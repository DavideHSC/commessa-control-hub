import { PrismaClient } from '@prisma/client';
import { UserMovementsData, VirtualMovimento } from '../types/virtualEntities.js';
import { formatItalianCurrency, formatPercentage } from '../utils/stagingDataHelpers.js';
import { AllocationCalculator } from './AllocationCalculator.js';

export class UserPresentationMapper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Trasforma i dati staging in una rappresentazione user-friendly
   * per la visualizzazione dei movimenti contabili
   */
  async mapToUserMovements(): Promise<UserMovementsData> {
    const startTime = Date.now();

    try {
      // 1. Ottieni i movimenti con stati di allocazione
      const calculator = new AllocationCalculator();
      const allocationData = await calculator.calculateAllocationStatus();
      
      // 2. Arricchisci con informazioni di presentazione
      const movimentiArricchiti = await this.enrichMovementsForUser(
        allocationData.topUnallocatedMovements
      );

      // 3. Carica tutti i movimenti (non solo i top unallocated)
      const tuttiMovimenti = await this.loadAllMovementsForPresentation();

      // 4. Calcola statistiche per tipo
      const costiTotal = tuttiMovimenti
        .filter(m => m.tipoMovimento === 'COSTO')
        .reduce((sum, m) => sum + Math.abs(m.totaleMovimento), 0);

      const ricaviTotal = tuttiMovimenti
        .filter(m => m.tipoMovimento === 'RICAVO')
        .reduce((sum, m) => sum + Math.abs(m.totaleMovimento), 0);

      const altroTotal = tuttiMovimenti
        .filter(m => m.tipoMovimento === 'ALTRO')
        .reduce((sum, m) => sum + Math.abs(m.totaleMovimento), 0);

      const processingTime = Date.now() - startTime;
      console.log(`✅ UserPresentationMapper: Mapped ${tuttiMovimenti.length} movements in ${processingTime}ms`);

      return {
        movimenti: tuttiMovimenti,
        totalMovimenti: tuttiMovimenti.length,
        costiTotal,
        ricaviTotal,
        altroTotal
      };

    } catch (error) {
      console.error('❌ Error in UserPresentationMapper:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Arricchisce i movimenti con informazioni per la presentazione utente
   */
  private async enrichMovementsForUser(movimenti: VirtualMovimento[]): Promise<VirtualMovimento[]> {
    // Carica informazioni aggiuntive dal database per arricchire la presentazione
    const codiciUnici = movimenti.map(m => m.scrittura.codiceUnivocoScaricamento);
    
    // Carica causali esistenti per descrizioni più ricche
    let causali = [];
    try {
      causali = await this.prisma.causaleContabile.findMany({
        select: {
          codice: true,
          descrizione: true,
          nome: true
        }
      });
    } catch (error) {
      console.warn('⚠️ Could not load causali contabili (table may be empty):', error.message);
      causali = [];
    }

    const causaliMap = new Map(causali.map(c => [c.codice, c]));

    // Carica codici IVA per informazioni sulle aliquote
    let codiciIva = [];
    try {
      codiciIva = await this.prisma.codiceIva.findMany({
        select: {
          codice: true,
          descrizione: true,
          aliquota: true
        }
      });
    } catch (error) {
      console.warn('⚠️ Could not load codici IVA (table may be empty):', error.message);
      codiciIva = [];
    }

    const codiciIvaMap = new Map(codiciIva.map(c => [c.codice, c]));

    // Arricchisce ogni movimento
    return movimenti.map(movimento => {
      try {
        // Arricchisci causale
        const causaleInfo = causaliMap.get(movimento.scrittura.causale);
        if (causaleInfo) {
          movimento.scrittura.descrizione = causaleInfo.descrizione || movimento.scrittura.descrizione;
        }

        // Arricchisci righe IVA
        (movimento.scrittura.righeIva || []).forEach(rigaIva => {
          try {
            const codiceIvaInfo = codiciIvaMap.get(rigaIva.codiceIva);
            if (codiceIvaInfo) {
              rigaIva.matchedCodiceIva = {
                id: rigaIva.codiceIva, // Usiamo il codice come ID temporaneo
                descrizione: codiceIvaInfo.descrizione,
                aliquota: codiceIvaInfo.aliquota || 0
              };
            }
          } catch (error) {
            console.warn('⚠️ Error enriching riga IVA:', error);
          }
        });

        return movimento;
      } catch (error) {
        console.error('❌ Error enriching movimento:', error);
        return movimento; // Return movimento unchanged if enrichment fails
      }
    });
  }

  /**
   * Carica tutti i movimenti per la presentazione (versione completa)
   */
  private async loadAllMovementsForPresentation(): Promise<VirtualMovimento[]> {
    const calculator = new AllocationCalculator();
    const allocationData = await calculator.calculateAllocationStatus();
    
    // Per ora ritorniamo i top unallocated + alcuni movimenti di esempio
    // In produzione, implementeremmo paginazione e filtri
    const tuttiMovimenti = [
      ...allocationData.topUnallocatedMovements
    ];

    // Aggiungi alcuni movimenti allocati per varietà
    // (In produzione questa logica sarebbe più sofisticata)
    return tuttiMovimenti.slice(0, 50); // Limit per performance
  }

  /**
   * Genera un riassunto user-friendly per un singolo movimento
   */
  async generateMovementSummary(codiceUnivocoScaricamento: string): Promise<{
    title: string;
    description: string;
    amount: string;
    formattedAmount: string;
    type: string;
    allocationStatus: string;
    allocationPercentage: string;
    righeCount: number;
    righeIvaCount: number;
    allocazioniCount: number;
    keyHighlights: string[];
    actionItems: string[];
  } | null> {
    try {
      const calculator = new AllocationCalculator();
      const details = await calculator.calculateScritturaAllocationDetails(codiceUnivocoScaricamento);
      
      if (!details) return null;

      // Carica dati base della scrittura
      const testata = await this.prisma.stagingTestata.findFirst({
        where: { codiceUnivocoScaricamento },
        select: {
          descrizioneCausale: true,
          codiceCausale: true,
          numeroDocumento: true,
          dataDocumento: true
        }
      });

      if (!testata) return null;

      // Genera titolo user-friendly
      const title = testata.numeroDocumento 
        ? `${testata.descrizioneCausale} - Doc. ${testata.numeroDocumento}`
        : testata.descrizioneCausale;

      // Determina tipo movimento
      const type = details.totalAmount > 0 ? 
        (details.righeBreakdown.some(r => r.importo > 0) ? 'Movimento Contabile' : 'Altro') :
        'Movimento Nullo';

      // Genera highlights
      const keyHighlights = [];
      if (details.allocationPercentage === 1) {
        keyHighlights.push('🟢 Completamente allocato');
      } else if (details.allocationPercentage > 0) {
        keyHighlights.push(`🟡 ${formatPercentage(details.allocationPercentage)} allocato`);
      } else {
        keyHighlights.push('🔴 Non allocato');
      }

      if (details.righeBreakdown.length > 1) {
        keyHighlights.push(`📊 ${details.righeBreakdown.length} righe contabili`);
      }

      // Genera action items
      const actionItems = [];
      if (details.remainingAmount > 0) {
        actionItems.push(`Allocare ${formatItalianCurrency(details.remainingAmount)} rimanenti`);
      }
      if (details.righeBreakdown.some(r => r.status === 'non_allocato')) {
        const righeNonAllocate = details.righeBreakdown.filter(r => r.status === 'non_allocato').length;
        actionItems.push(`Allocare ${righeNonAllocate} righe non allocate`);
      }

      return {
        title,
        description: testata.descrizioneCausale,
        amount: details.totalAmount.toString(),
        formattedAmount: formatItalianCurrency(details.totalAmount),
        type,
        allocationStatus: details.status,
        allocationPercentage: formatPercentage(details.allocationPercentage),
        righeCount: details.righeBreakdown.length,
        righeIvaCount: 0, // Da implementare se necessario
        allocazioniCount: details.righeBreakdown.filter(r => r.allocato > 0).length,
        keyHighlights,
        actionItems
      };

    } catch (error) {
      console.error('❌ Error generating movement summary:', error);
      return null;
    }
  }
}