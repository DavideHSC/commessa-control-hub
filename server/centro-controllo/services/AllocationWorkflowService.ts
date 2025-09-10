import { PrismaClient } from '@prisma/client';
import { MovimentiContabiliService } from './MovimentiContabiliService.js';
import { AllocationCalculator } from './AllocationCalculator.js';
import { 
  MovimentoContabileCompleto, 
  VirtualRigaContabile,
  VirtualAllocazione,
  AllocationSuggestion,
  MovimentoAllocabile,
  AllocationWorkflowFilters,
  AllocationWorkflowResponse,
  AllocationWorkflowTestRequest,
  AllocationWorkflowTestResponse,
  AllocazioneVirtuale,
  BudgetImpact,
  ValidationResult,
  ScritturaContabilePreview,
  OperationSummary
} from '../types/virtualEntities.js';

export class AllocationWorkflowService extends MovimentiContabiliService {
  private allocationCalculator: AllocationCalculator;

  constructor() {
    super();
    this.allocationCalculator = new AllocationCalculator();
  }

  /**
   * Ottiene movimenti contabili filtrati per essere allocabili
   * Estende la logica base aggiungendo filtri specifici per allocazioni
   */
  async getMovimentiAllocabili(filters: AllocationWorkflowFilters = {}): Promise<AllocationWorkflowResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 AllocationWorkflowService: Loading allocable movements with filters:`, filters);
      
      // 1. Converte i filtri allocation-specific in filtri base
      const baseFilters = {
        dataDa: filters.dataDa,
        dataA: filters.dataA,
        soggetto: filters.soggetto,
        stato: filters.stato,
        page: filters.page || 1,
        limit: filters.limit || 20
      };
      
      // 2. Ottiene movimenti base dal servizio parent
      const baseMovimenti = await this.getMovimentiContabili(baseFilters);
      console.log(`📊 Got ${baseMovimenti.movimenti.length} base movements`);
      
      // 3. Filtra per movimenti allocabili
      let movimentiAllocabili = baseMovimenti.movimenti.filter(movimento => {
        // Filtra solo movimenti con righe che possono essere allocate
        const righeLavorabili = movimento.righeDettaglio.filter(riga => {
          const hasAccount = !!riga.conto;
          const importoTotale = Math.max(riga.importoDare, riga.importoAvere);
          const hasAmount = importoTotale > 0.01;
          const isRelevant = !filters.contoRilevante || riga.isAllocabile;
          
          return hasAccount && hasAmount && isRelevant;
        });
        
        return righeLavorabili.length > 0;
      });
      
      // 4. Applica filtri aggiuntivi allocation-specific
      if (filters.soloAllocabili) {
        movimentiAllocabili = movimentiAllocabili.filter(movimento => 
          movimento.righeDettaglio.some(riga => 
            riga.isAllocabile && Math.max(riga.importoDare, riga.importoAvere) > 0.01
          )
        );
      }
      
      // 5. Arricchisce con dati allocation-specific
      const enrichedMovimenti: MovimentoAllocabile[] = await this.enrichWithAllocationData(movimentiAllocabili, filters);
      
      // 6. Carica metadati per UI
      const [commesseDisponibili, vociAnalitiche] = await Promise.all([
        this.loadCommesseDisponibili(),
        this.loadVociAnalitiche()
      ]);
      
      // 7. Calcola statistiche specifiche allocazioni
      const statistiche = this.calculateAllocationStatistics(enrichedMovimenti);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AllocationWorkflowService: Processed ${enrichedMovimenti.length} allocable movements in ${processingTime}ms`);
      
      return {
        movimentiAllocabili: enrichedMovimenti,
        pagination: {
          page: baseFilters.page,
          limit: baseFilters.limit,
          total: enrichedMovimenti.length,
          totalPages: Math.ceil(enrichedMovimenti.length / baseFilters.limit)
        },
        filtriApplicati: filters,
        statistiche,
        commesseDisponibili,
        vociAnalitiche
      };
      
    } catch (error) {
      console.error('❌ AllocationWorkflowService: Error in getMovimentiAllocabili:', error);
      throw error;
    }
  }

  /**
   * Testa allocazioni virtuali senza persistenza
   * Versione semplificata per testing iniziale
   */
  async testAllocationWorkflow(request: AllocationWorkflowTestRequest): Promise<AllocationWorkflowTestResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 AllocationWorkflowService: Testing ${request.allocazioniVirtuali.length} allocations`);
      
      // Mock validations - simula alcune validazioni
      const validationResults: ValidationResult[] = [
        {
          rule: 'COMMESSE_VALID',
          passed: true,
          message: 'Tutte le commesse selezionate sono valide e attive',
          severity: 'INFO'
        },
        {
          rule: 'IMPORTI_POSITIVE',
          passed: true,
          message: 'Tutti gli importi sono maggiori di zero',
          severity: 'INFO'
        }
      ];
      
      // Calcola totali
      const totalAllocatedAmount = request.allocazioniVirtuali.reduce((sum, a) => sum + a.importo, 0);
      const remainingAmount = 1000 - totalAllocatedAmount; // Mock amount
      
      // Genera preview base se richiesto
      let previewScritture: ScritturaContabilePreview[] | undefined;
      if (request.modalitaTest === 'PREVIEW_SCRITTURE') {
        previewScritture = [{
          descrizione: `Test Allocazione ${request.movimentoId}`,
          dataMovimento: new Date().toISOString().split('T')[0],
          righe: request.allocazioniVirtuali.map(a => ({
            contoId: 'test',
            contoCodice: '999999',
            contoDenominazione: `Allocazione ${a.commessaNome}`,
            dare: a.importo,
            commessaId: a.commessaId,
            voceAnaliticaId: a.voceAnaliticaId
          })),
          totaliDare: totalAllocatedAmount,
          totaliAvere: totalAllocatedAmount,
          isQuadrata: true
        }];
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AllocationWorkflowService: Mock test completed in ${processingTime}ms`);
      
      return {
        success: true,
        risultatiValidazione: validationResults,
        allocazioniProcessate: request.allocazioniVirtuali.map(a => ({
          ...a,
          validazioni: validationResults
        })),
        totalAllocatedAmount,
        remainingAmount,
        budgetImpacts: [], // Mock vuoto
        previewScritture,
        riepilogoOperazioni: {
          totalMovimentiProcessati: 1,
          totalAllocazioniCreate: request.allocazioniVirtuali.length,
          totalImportoAllocato: totalAllocatedAmount,
          commesseInteressate: [...new Set(request.allocazioniVirtuali.map(a => a.commessaId))],
          vociAnaliticheUtilizzate: [...new Set(request.allocazioniVirtuali.map(a => a.voceAnaliticaId))],
          tempoElaborazioneStimato: Math.ceil(request.allocazioniVirtuali.length * 0.5)
        }
      };
      
    } catch (error) {
      console.error('❌ AllocationWorkflowService: Error in testAllocationWorkflow:', error);
      
      return {
        success: false,
        risultatiValidazione: [{
          rule: 'SYSTEM_ERROR',
          passed: false,
          message: error instanceof Error ? error.message : 'Errore sconosciuto',
          severity: 'ERROR'
        }],
        allocazioniProcessate: [],
        totalAllocatedAmount: 0,
        remainingAmount: 0,
        budgetImpacts: [],
        riepilogoOperazioni: {
          totalMovimentiProcessati: 0,
          totalAllocazioniCreate: 0,
          totalImportoAllocato: 0,
          commesseInteressate: [],
          vociAnaliticheUtilizzate: [],
          tempoElaborazioneStimato: 0
        }
      };
    }
  }

  /**
   * METODI PRIVATI DI SUPPORTO
   */

  private buildExtendedFilters(filters: AllocationWorkflowFilters): any {
    const baseFilters = {
      page: filters.page,
      limit: filters.limit,
      dataDa: filters.dataDa,
      dataA: filters.dataA,
      soggetto: filters.soggetto,
      stato: filters.stato
    };

    // TODO: Aggiungere logica filtri specifici
    // - soloAllocabili: filtra movimenti con righe che hanno isAllocabile=true
    // - contoRilevante: filtra conti con isRilevantePerCommesse=true
    // - statoAllocazione: filtra per AllocationStatus

    return baseFilters;
  }

  private async enrichWithAllocationData(
    movimenti: MovimentoContabileCompleto[], 
    filters: AllocationWorkflowFilters
  ): Promise<MovimentoAllocabile[]> {
    const enrichedMovimenti: MovimentoAllocabile[] = [];

    for (const movimento of movimenti) {
      try {
        // 1. Filtra solo righe allocabili (che hanno conto e importo significativo)
        const righeLavorabili = movimento.righeDettaglio.filter(riga => {
          return riga.conto && 
                 Math.max(riga.importoDare, riga.importoAvere) > 0.01 && 
                 (!filters.contoRilevante || riga.isAllocabile);
        });
        
        // Se nessuna riga allocabile e filtro attivo, skip
        if (filters.soloAllocabili && righeLavorabili.length === 0) {
          continue;
        }

        // 2. Genera suggerimenti per questo movimento
        const [suggerimentiMOVANAC, suggerimentiRegole] = await Promise.all([
          this.generateMOVANACSuggestions(movimento),
          this.generateRuleSuggestions(movimento)
        ]);

        // 3. Calcola impatti potenziali su budget
        const potenzialeBudgetImpact = await this.calculatePotentialBudgetImpact(movimento, suggerimentiRegole);

        enrichedMovimenti.push({
          ...movimento,
          righeLavorabili,
          suggerimentiMOVANAC,
          suggerimentiRegole,
          potenzialeBudgetImpact
        });
      } catch (error) {
        console.warn(`⚠️ Error enriching movimento ${movimento.testata.codiceUnivocoScaricamento}:`, error);
        // Continue con movimento senza enrichments
        enrichedMovimenti.push({
          ...movimento,
          righeLavorabili: movimento.righeDettaglio,
          suggerimentiMOVANAC: [],
          suggerimentiRegole: [],
          potenzialeBudgetImpact: []
        });
      }
    }

    return enrichedMovimenti;
  }

  private async generateMOVANACSuggestions(movimento: MovimentoContabileCompleto): Promise<VirtualAllocazione[]> {
    try {
      // Cerca allocazioni MOVANAC predefinite per questo movimento
      const stagingAllocazioni = await this.prisma.stagingAllocazione.findMany({
        where: {
          codiceUnivocoScaricamento: movimento.testata.codiceUnivocoScaricamento
        }
      });

      return stagingAllocazioni.map(alloc => ({
        progressivoRigoContabile: alloc.progressivoRigoContabile || '',
        centroDiCosto: alloc.centroDiCosto || '',
        parametro: alloc.parametro || '',
        matchedCommessa: null, // TODO: Risolvere da centroDiCosto
        matchedVoceAnalitica: null // TODO: Risolvere da parametro
      }));
    } catch (error) {
      console.warn('Error generating MOVANAC suggestions:', error);
      return [];
    }
  }

  private async generateRuleSuggestions(movimento: MovimentoContabileCompleto): Promise<AllocationSuggestion[]> {
    const suggestions: AllocationSuggestion[] = [];

    // Integra con AllocationCalculator esistente per pattern recognition
    try {
      const autoSuggestions = await this.allocationCalculator.generateAutoAllocationSuggestions();
      
      // Filtra suggerimenti pertinenti a questo movimento
      // TODO: Logica di matching basata su conti delle righe
      
    } catch (error) {
      console.warn('Could not generate auto suggestions:', error);
    }

    return suggestions;
  }

  private async calculatePotentialBudgetImpact(
    movimento: MovimentoContabileCompleto, 
    suggestions: AllocationSuggestion[]
  ): Promise<BudgetImpact[]> {
    const impacts: BudgetImpact[] = [];

    for (const suggestion of suggestions) {
      // Calcola impatto su budget commessa/voce analitica
      const budget = await this.prisma.budgetVoce.findFirst({
        where: {
          commessaId: suggestion.commessaId,
          voceAnaliticaId: suggestion.voceAnaliticaId
        }
      });

      if (budget) {
        const nuovoPercentualeUtilizzo = ((budget.importo + suggestion.importoSuggerito) / budget.importo) * 100;
        
        impacts.push({
          commessaId: suggestion.commessaId,
          commessaNome: suggestion.commessaNome,
          voceAnaliticaId: suggestion.voceAnaliticaId,
          voceAnaliticaNome: suggestion.voceAnaliticaNome,
          budgetAttuale: budget.importo,
          impactImporto: suggestion.importoSuggerito,
          nuovoPercentualeUtilizzo,
          isOverBudget: nuovoPercentualeUtilizzo > 100
        });
      }
    }

    return impacts;
  }

  private async validateMovimento(movimentoId: string): Promise<MovimentoContabileCompleto> {
    // Implementazione base - cerca il movimento nei dati staging
    const baseMovimenti = await this.getMovimentiContabili({ 
      limit: 1,
      page: 1,
      stato: 'ALL'
    });
    
    const movimento = baseMovimenti.movimenti.find(m => 
      m.testata.codiceUnivocoScaricamento === movimentoId
    );
    
    if (!movimento) {
      throw new Error(`Movimento ${movimentoId} non trovato`);
    }
    
    return movimento;
  }

  private async validateSingleAllocation(
    allocazione: AllocazioneVirtuale, 
    movimento: MovimentoContabileCompleto
  ): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];

    // Validazione 1: Commessa esiste e attiva
    const commessa = await this.prisma.commessa.findUnique({
      where: { id: allocazione.commessaId }
    });

    if (!commessa) {
      validations.push({
        rule: 'COMMESSA_EXISTS',
        passed: false,
        message: `Commessa ${allocazione.commessaId} non trovata`,
        severity: 'ERROR'
      });
    } else if (!commessa.isAttiva) {
      validations.push({
        rule: 'COMMESSA_ACTIVE',
        passed: false,
        message: `Commessa ${commessa.nome} non è attiva`,
        severity: 'WARNING'
      });
    }

    // Validazione 2: Voce analitica valida
    const voceAnalitica = await this.prisma.voceAnalitica.findUnique({
      where: { id: allocazione.voceAnaliticaId }
    });

    if (!voceAnalitica) {
      validations.push({
        rule: 'VOCE_ANALITICA_EXISTS',
        passed: false,
        message: `Voce analitica ${allocazione.voceAnaliticaId} non trovata`,
        severity: 'ERROR'
      });
    }

    // Validazione 3: Importo positivo e ragionevole
    if (allocazione.importo <= 0) {
      validations.push({
        rule: 'IMPORTO_POSITIVE',
        passed: false,
        message: 'Importo deve essere maggiore di zero',
        severity: 'ERROR'
      });
    }

    return validations;
  }

  private async calculateBudgetImpacts(allocazioni: AllocazioneVirtuale[]): Promise<BudgetImpact[]> {
    const impacts: BudgetImpact[] = [];
    
    try {
      for (const allocazione of allocazioni) {
        // Trova il budget per questa combinazione commessa/voce analitica
        const budget = await this.prisma.budgetVoce.findFirst({
          where: {
            commessaId: allocazione.commessaId,
            voceAnaliticaId: allocazione.voceAnaliticaId
          }
        });
        
        if (budget) {
          const nuovoPercentualeUtilizzo = ((budget.importo + allocazione.importo) / budget.importo) * 100;
          
          impacts.push({
            commessaId: allocazione.commessaId,
            commessaNome: allocazione.commessaNome,
            voceAnaliticaId: allocazione.voceAnaliticaId,
            voceAnaliticaNome: allocazione.voceAnaliticaNome,
            budgetAttuale: budget.importo,
            impactImporto: allocazione.importo,
            nuovoPercentualeUtilizzo,
            isOverBudget: nuovoPercentualeUtilizzo > 100
          });
        }
      }
    } catch (error) {
      console.warn('Error calculating budget impacts:', error);
    }
    
    return impacts;
  }

  private async generateScritturePreview(
    movimento: MovimentoContabileCompleto,
    allocazioni: AllocazioneVirtuale[]
  ): Promise<ScritturaContabilePreview[]> {
    // Implementazione base - genera preview delle scritture
    const preview: ScritturaContabilePreview = {
      descrizione: `Allocazione ${movimento.testata.numeroDocumento}`,
      dataMovimento: new Date().toISOString().split('T')[0],
      righe: [],
      totaliDare: 0,
      totaliAvere: 0,
      isQuadrata: true
    };
    
    // Aggiungi righe di allocazione
    for (const allocazione of allocazioni) {
      preview.righe.push({
        contoId: 'placeholder',
        contoCodice: '999999',
        contoDenominazione: 'Allocazione Analitica',
        dare: allocazione.importo,
        commessaId: allocazione.commessaId,
        voceAnaliticaId: allocazione.voceAnaliticaId
      });
      preview.totaliDare += allocazione.importo;
    }
    
    // Riga di contropartita
    preview.righe.push({
      contoId: 'placeholder',
      contoCodice: '888888',
      contoDenominazione: 'Contropartita Allocazione',
      avere: preview.totaliDare
    });
    preview.totaliAvere = preview.totaliDare;
    
    return [preview];
  }

  private generateOperationSummary(
    request: AllocationWorkflowTestRequest,
    validations: ValidationResult[]
  ): OperationSummary {
    const commesseInteressate = [...new Set(request.allocazioniVirtuali.map(a => a.commessaId))];
    const vociAnalitiche = [...new Set(request.allocazioniVirtuali.map(a => a.voceAnaliticaId))];
    const totalImporto = request.allocazioniVirtuali.reduce((sum, a) => sum + a.importo, 0);

    return {
      totalMovimentiProcessati: 1,
      totalAllocazioniCreate: request.allocazioniVirtuali.length,
      totalImportoAllocato: totalImporto,
      commesseInteressate,
      vociAnaliticheUtilizzate: vociAnalitiche,
      tempoElaborazioneStimato: Math.ceil(request.allocazioniVirtuali.length * 0.5) // 30 sec per allocazione
    };
  }

  private calculateAllocationStatistics(movimenti: MovimentoAllocabile[]) {
    const movimentiConSuggerimenti = movimenti.filter(m => 
      m.suggerimentiMOVANAC.length > 0 || m.suggerimentiRegole.length > 0
    ).length;

    const allocazioniMOVANAC = movimenti.reduce((sum, m) => sum + m.suggerimentiMOVANAC.length, 0);
    const regoleDETTANAL = movimenti.reduce((sum, m) => sum + m.suggerimentiRegole.length, 0);

    return {
      totalMovimenti: movimenti.length,
      movimentiConSuggerimenti,
      allocazioniMOVANACDisponibili: allocazioniMOVANAC,
      regoleDETTANALApplicabili: regoleDETTANAL,
      potenzialeTempoRisparmiato: Math.ceil((allocazioniMOVANAC * 2 + regoleDETTANAL * 1.5) / 60 * 100) / 100
    };
  }

  private async loadCommesseDisponibili() {
    const commesse = await this.prisma.commessa.findMany({
      where: { isAttiva: true },
      include: { cliente: true, budget: true },
      orderBy: { nome: 'asc' }
    });

    return commesse.map(c => ({
      id: c.id,
      nome: c.nome,
      clienteNome: c.cliente.nome,
      isAttiva: c.isAttiva,
      budgetTotale: c.budget.reduce((sum, b) => sum + b.importo, 0)
    }));
  }

  private async loadVociAnalitiche() {
    const voci = await this.prisma.voceAnalitica.findMany({
      where: { isAttiva: true },
      orderBy: { nome: 'asc' }
    });

    return voci.map(v => ({
      id: v.id,
      nome: v.nome,
      tipo: v.tipo,
      isAttiva: v.isAttiva
    }));
  }
}
