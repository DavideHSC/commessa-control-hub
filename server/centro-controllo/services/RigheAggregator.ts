import { PrismaClient } from '@prisma/client';
import { VirtualScrittura, VirtualRigaContabile, VirtualRigaIva, VirtualAllocazione, RigheAggregationData, MovimentiAggregati } from '../types/virtualEntities.js';
import { parseGestionaleCurrency, parseDateGGMMAAAA, isScrittuराQuadrata, getTipoAnagrafica, generateRigaIdentifier } from '../utils/stagingDataHelpers.js';
import { MovimentClassifier } from '../utils/movimentClassifier.js';
import { getContiGenLookupService, ContoEnricchito } from '../utils/contiGenLookup.js';

export class RigheAggregator {
  private prisma: PrismaClient;
  private contiLookupService;

  constructor() {
    this.prisma = new PrismaClient();
    this.contiLookupService = getContiGenLookupService(this.prisma);
  }

  /**
   * Aggrega le righe contabili staging per formare scritture virtuali complete
   * Logica INTERPRETATIVA - zero persistenza, solo aggregazione logica
   */
  async aggregateRighe(): Promise<RigheAggregationData> {
    const startTime = Date.now();

    try {
      // 1. Carica tutti i dati staging necessari + inizializza servizio CONTIGEN
      const [testate, righeContabili, righeIva, allocazioni, codiciIvaMap] = await Promise.all([
        this.loadStagingTestate(),
        this.loadStagingRigheContabili(),
        this.loadStagingRigheIva(),
        this.loadStagingAllocazioni(),
        this.loadCodiciIvaDenominazioni()
      ]);

      // Inizializza servizio CONTIGEN
      await this.contiLookupService.initialize();

      // 2. Aggrega tutto per codice univoco scaricamento
      const scritture = await this.aggregateByTestata(testate, righeContabili, righeIva, allocazioni, codiciIvaMap);

      // 3. Calcola statistiche avanzate
      const quadrateScrittureCount = scritture.filter(s => s.isQuadrata).length;
      const nonQuadrateScrittureCount = scritture.length - quadrateScrittureCount;
      const totalRigheCount = scritture.reduce((sum, s) => sum + s.righeContabili.length, 0);
      const totalRigheAllocabili = scritture.reduce((sum, s) => sum + s.righeAllocabili, 0);
      const percentualeAllocabilita = totalRigheCount > 0 ? (totalRigheAllocabili / totalRigheCount) * 100 : 0;
      
      // 4. Calcola aggregazioni per tipologia movimento
      const movimentiAggregati = this.calculateMovimentiAggregati(scritture);

      const processingTime = Date.now() - startTime;
      console.log(`✅ RigheAggregator: Aggregated ${scritture.length} scritture (${totalRigheCount} righe, ${totalRigheAllocabili} allocabili) in ${processingTime}ms`);

      return {
        scritture,
        totalScrittureCount: scritture.length,
        quadrateScrittureCount,
        nonQuadrateScrittureCount,
        totalRigheCount,
        movimentiAggregati,
        totalRigheAllocabili,
        percentualeAllocabilita: Math.round(percentualeAllocabilita * 100) / 100
      };

    } catch (error) {
      console.error('❌ Error in RigheAggregator:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Carica tutte le testate staging
   */
  private async loadStagingTestate() {
    return await this.prisma.stagingTestata.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        dataRegistrazione: true,
        codiceCausale: true,
        descrizioneCausale: true,
        numeroDocumento: true,
        dataDocumento: true
      }
    });
  }

  /**
   * Carica tutte le righe contabili staging
   */
  private async loadStagingRigheContabili() {
    return await this.prisma.stagingRigaContabile.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        progressivoRigo: true,
        tipoConto: true,
        clienteFornitoreCodiceFiscale: true,
        clienteFornitoreSigla: true,
        clienteFornitoreSubcodice: true,
        conto: true,
        siglaConto: true,
        importoDare: true,
        importoAvere: true,
        note: true,
        insDatiCompetenzaContabile: true,
        insDatiMovimentiAnalitici: true
      }
    });
  }


  /**
   * Carica tutti i codici IVA per le denominazioni (pattern da finalizeRigaIva)
   */
  private async loadCodiciIvaDenominazioni() {
    const codiciIva = await this.prisma.codiceIva.findMany({
      select: {
        id: true,
        externalId: true,
        descrizione: true,
        aliquota: true
      }
    });

    // Crea mappa per lookup efficiente (pattern da finalizeRigaIva:530-537)
    const codiciIvaMap = new Map<string, { id: string; descrizione: string; aliquota: number }>();
    
    codiciIva.forEach(codiceIva => {
      // Usa externalId come chiave (il codice dai dati staging viene mappato su externalId)
      if (codiceIva.externalId) {
        codiciIvaMap.set(codiceIva.externalId, { 
          id: codiceIva.id, 
          descrizione: codiceIva.descrizione, 
          aliquota: codiceIva.aliquota || 0
        });
      }
    });

    return codiciIvaMap;
  }

  /**
   * Carica tutte le righe IVA staging
   */
  private async loadStagingRigheIva() {
    return await this.prisma.stagingRigaIva.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        codiceIva: true,
        contropartita: true,
        siglaContropartita: true,
        imponibile: true,
        imposta: true,
        importoLordo: true,
        note: true
      }
    });
  }

  /**
   * Carica tutte le allocazioni staging
   */
  private async loadStagingAllocazioni() {
    return await this.prisma.stagingAllocazione.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        progressivoRigoContabile: true,
        centroDiCosto: true,
        parametro: true
      }
    });
  }

  /**
   * Aggrega tutti i dati per testata (codice univoco scaricamento)
   */
  private async aggregateByTestata(
    testate: any[],
    righeContabili: any[],
    righeIva: any[],
    allocazioni: any[],
    codiciIvaMap: Map<string, { id: string; descrizione: string; aliquota: number }>
  ): Promise<VirtualScrittura[]> {
    const scrittureMap = new Map<string, VirtualScrittura>();

    // Prima passa - crea le scritture dalle testate
    testate.forEach(testata => {
      try {
        const codice = testata.codiceUnivocoScaricamento;
        const dataReg = testata.dataRegistrazione ? parseDateGGMMAAAA(testata.dataRegistrazione) || new Date() : new Date();
        const dataDoc = testata.dataDocumento ? parseDateGGMMAAAA(testata.dataDocumento) : null;
        
        // CLASSIFICAZIONE INTERPRETATIVA
        const causale = testata.codiceCausale || '';
        const tipoMovimento = MovimentClassifier.classifyMovimentoType(causale);
        const causaleInterpretata = MovimentClassifier.classifyCausaleCategory(causale, tipoMovimento);
        const isAllocabileScrittura = MovimentClassifier.isAllocabile(tipoMovimento, causaleInterpretata);

      scrittureMap.set(codice, {
        codiceUnivocoScaricamento: codice,
        dataRegistrazione: dataReg,
        causale,
        descrizione: testata.descrizioneCausale || '',
        numeroDocumento: testata.numeroDocumento,
        dataDocumento: dataDoc,
        righeContabili: [],
        righeIva: [],
        allocazioni: [],
        totaliDare: 0,
        totaliAvere: 0,
        isQuadrata: false,
        allocationStatus: 'non_allocato',
        // NUOVI CAMPI INTERPRETATIVI
        tipoMovimento,
        causaleInterpretata,
        isAllocabile: isAllocabileScrittura,
        motivoNonAllocabile: !isAllocabileScrittura ? MovimentClassifier.getMotivoNonAllocabile(tipoMovimento) : undefined,
        righeAllocabili: 0,
        suggerimentiAllocazione: [],
        // CAMPI RELAZIONALI MANCANTI
        anagraficheRisolte: [],
        qualitaRelazioni: {
          contiRisolti: 0,
          anagraficheRisolte: 0,
          codiciIvaRisolti: 0,
          percentualeCompletezza: 0
        }
      });
      } catch (error) {
        console.error(`❌ Error processing testata ${testata.codiceUnivocoScaricamento}:`, error);
        // Skip this testata and continue with others
      }
    });

    // Seconda passa - aggiungi righe contabili
    for (const riga of righeContabili) {
      try {
        const codice = riga.codiceUnivocoScaricamento;
        const scrittura = scrittureMap.get(codice);
        if (!scrittura) return;

        const importoDare = parseGestionaleCurrency(riga.importoDare);
        const importoAvere = parseGestionaleCurrency(riga.importoAvere);
        
        // IDENTIFICAZIONE CONTO: usa CONTO o SIGLA CONTO (tracciato PNRIGCON)
        const conto = riga.conto || riga.siglaConto || '';
        const tipoRiga = MovimentClassifier.classifyRigaType(conto, importoDare, importoAvere);
        const isRigaAllocabile = MovimentClassifier.isRigaAllocabile(tipoRiga);
        const motivoNonAllocabile = !isRigaAllocabile ? MovimentClassifier.getMotivoNonAllocabile(scrittura.tipoMovimento, tipoRiga) : undefined;
        const classeContabile = conto.charAt(0) || '0';
        
        // Suggerimento voce analitica
        const suggestionVoce = MovimentClassifier.suggestVoceAnalitica(conto, riga.note || '');

        // RECUPERA DENOMINAZIONI CONTO CON SERVIZIO CONTIGEN (arricchito)
        // Gestisce sia codici che sigle dal tracciato CONTIGEN
        const contoEnricchito = await this.contiLookupService.lookupConto(conto);
        const contoDenominazione = contoEnricchito?.nome || `Conto ${conto}`;
        const contoDescrizione = contoEnricchito?.descrizioneLocale;

      // Crea anagrafica virtuale se presente
      let virtualAnagrafica = null;
      const tipo = getTipoAnagrafica(riga.tipoConto);
      if (tipo) {
        virtualAnagrafica = {
          codiceFiscale: riga.clienteFornitoreCodiceFiscale || '',
          sigla: riga.clienteFornitoreSigla || '',
          subcodice: riga.clienteFornitoreSubcodice || '',
          tipo,
          matchedEntity: null, // Sarà risolto da AnagraficaResolver
          matchConfidence: 0,
          sourceRows: 1
        };
      }

      const virtualRiga: VirtualRigaContabile = {
        progressivoRigo: riga.progressivoRigo,
        conto,
        siglaConto: riga.siglaConto,
        importoDare,
        importoAvere,
        note: riga.note || '',
        anagrafica: virtualAnagrafica,
        hasCompetenzaData: riga.insDatiCompetenzaContabile === '1',
        hasMovimentiAnalitici: riga.insDatiMovimentiAnalitici === '1',
        // NUOVI CAMPI INTERPRETATIVI
        tipoRiga,
        voceAnaliticaSuggerita: suggestionVoce.voceAnalitica,
        isAllocabile: isRigaAllocabile,
        motivoNonAllocabile,
        classeContabile,
        // DENOMINAZIONI CONTI (per UX migliorata)
        contoDenominazione,
        contoDescrizione,
        // DATI CONTIGEN ARRICCHITI
        contigenData: contoEnricchito?.contigenData,
        matchType: contoEnricchito?.matchType,
        matchConfidence: contoEnricchito?.confidence
      };

      scrittura.righeContabili.push(virtualRiga);
      scrittura.totaliDare += importoDare;
      scrittura.totaliAvere += importoAvere;
      
      // Aggiorna conteggi allocabilità
      if (isRigaAllocabile) {
        scrittura.righeAllocabili++;
        
        // Aggiungi suggerimento alla scrittura
        const suggestionForScrittura = {
          ...suggestionVoce,
          rigaProgressivo: riga.progressivoRigo,
          importoSuggerito: importoDare + importoAvere // Importo totale della riga
        };
        scrittura.suggerimentiAllocazione.push(suggestionForScrittura);
      }
      } catch (error) {
        console.error(`❌ Error processing riga contabile ${riga.codiceUnivocoScaricamento}:`, error);
        // Skip this riga and continue with others
      }
    }

    // Terza passa - aggiungi righe IVA
    righeIva.forEach(riga => {
      try {
        const codice = riga.codiceUnivocoScaricamento;
        const scrittura = scrittureMap.get(codice);
        if (!scrittura) return;

        // RECUPERA DENOMINAZIONI CODICE IVA (pattern da finalizeRigaIva:530-537)
        const codiceIvaInfo = codiciIvaMap.get(riga.codiceIva || '');
        const matchedCodiceIva = codiceIvaInfo ? {
          id: codiceIvaInfo.id,
          descrizione: codiceIvaInfo.descrizione,
          aliquota: codiceIvaInfo.aliquota
        } : null;

        const virtualRigaIva: VirtualRigaIva = {
          codiceIva: riga.codiceIva || '',
          contropartita: riga.contropartita || riga.siglaContropartita || '',
          imponibile: parseGestionaleCurrency(riga.imponibile),
          imposta: parseGestionaleCurrency(riga.imposta),
          importoLordo: parseGestionaleCurrency(riga.importoLordo),
          note: riga.note || '',
          matchedCodiceIva
        };

        scrittura.righeIva.push(virtualRigaIva);
      } catch (error) {
        console.error(`❌ Error processing riga IVA ${riga.codiceUnivocoScaricamento}:`, error);
        // Skip this riga and continue with others
      }
    });

    // Quarta passa - aggiungi allocazioni
    allocazioni.forEach(alloc => {
      try {
        const codice = alloc.codiceUnivocoScaricamento;
        const scrittura = scrittureMap.get(codice);
        if (!scrittura) return;

        if (!alloc.centroDiCosto?.trim() || !alloc.parametro?.trim()) return;

        const virtualAllocazione: VirtualAllocazione = {
          progressivoRigoContabile: alloc.progressivoRigoContabile || '',
          centroDiCosto: alloc.centroDiCosto.trim(),
          parametro: alloc.parametro.trim(),
          matchedCommessa: null, // Sarà risolto separatamente
          matchedVoceAnalitica: null // Sarà risolto separatamente
        };

        scrittura.allocazioni.push(virtualAllocazione);
      } catch (error) {
        console.error(`❌ Error processing allocazione ${alloc.codiceUnivocoScaricamento}:`, error);
        // Skip this allocazione and continue with others
      }
    });

    // Quinta passa - calcola stati
    scrittureMap.forEach(scrittura => {
      try {
        // Calcola se è quadrata
        scrittura.isQuadrata = isScrittuराQuadrata(scrittura.righeContabili);

        // Calcola stato allocazione (semplificato per ora)
        if (scrittura.allocazioni.length === 0) {
          scrittura.allocationStatus = 'non_allocato';
        } else {
          // Logica più sofisticata da implementare in AllocationCalculator
          scrittura.allocationStatus = 'parzialmente_allocato';
        }
      } catch (error) {
        console.error(`❌ Error calculating states for scrittura ${scrittura.codiceUnivocoScaricamento}:`, error);
        // Set safe defaults
        scrittura.isQuadrata = false;
        scrittura.allocationStatus = 'non_allocato';
      }
    });

    return Array.from(scrittureMap.values())
      .sort((a, b) => b.dataRegistrazione.getTime() - a.dataRegistrazione.getTime()); // Ordina per data desc
  }

  /**
   * Calcola aggregazioni per tipologia movimento
   */
  private calculateMovimentiAggregati(scritture: VirtualScrittura[]): MovimentiAggregati {
    const result: MovimentiAggregati = {
      fattureAcquisto: { count: 0, totaleImporto: 0, allocabili: 0 },
      fattureVendita: { count: 0, totaleImporto: 0, allocabili: 0 },
      movimentiFinanziari: { count: 0, totaleImporto: 0, allocabili: 0 },
      assestamenti: { count: 0, totaleImporto: 0, allocabili: 0 },
      giroContabili: { count: 0, totaleImporto: 0, allocabili: 0 }
    };

    scritture.forEach(scrittura => {
      const importoTotale = Math.max(scrittura.totaliDare, scrittura.totaliAvere);
      
      switch (scrittura.tipoMovimento) {
        case 'FATTURA_ACQUISTO':
          result.fattureAcquisto.count++;
          result.fattureAcquisto.totaleImporto += importoTotale;
          result.fattureAcquisto.allocabili += scrittura.righeAllocabili;
          break;
          
        case 'FATTURA_VENDITA':
          result.fattureVendita.count++;
          result.fattureVendita.totaleImporto += importoTotale;
          result.fattureVendita.allocabili += scrittura.righeAllocabili;
          break;
          
        case 'MOVIMENTO_FINANZIARIO':
          result.movimentiFinanziari.count++;
          result.movimentiFinanziari.totaleImporto += importoTotale;
          // allocabili rimane sempre 0
          break;
          
        case 'ASSESTAMENTO':
          result.assestamenti.count++;
          result.assestamenti.totaleImporto += importoTotale;
          result.assestamenti.allocabili += scrittura.righeAllocabili;
          break;
          
        case 'GIRO_CONTABILE':
          result.giroContabili.count++;
          result.giroContabili.totaleImporto += importoTotale;
          // allocabili rimane sempre 0
          break;
      }
    });

    return result;
  }
}