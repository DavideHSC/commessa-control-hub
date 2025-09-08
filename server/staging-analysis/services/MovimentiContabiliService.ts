import { Prisma, PrismaClient, StagingConto, StagingAnagrafica, StagingCausaleContabile, StagingCodiceIva } from '@prisma/client';

import { MovimentiContabiliData, MovimentoContabileCompleto, VirtualRigaContabile } from '../types/virtualEntities.js';
import { parseDateGGMMAAAA, parseGestionaleCurrency } from '../utils/stagingDataHelpers.js';

interface MovimentiContabiliFilters {
  dataDa?: string; // YYYY-MM-DD
  dataA?: string;  // YYYY-MM-DD
  soggetto?: string; // Ricerca parziale su clienteFornitoreSigla o denominazione
  stato?: 'D' | 'P' | 'V' | 'ALL'; // Draft, Posted, Validated
  page?: number;
  limit?: number;
}

export interface MovimentiContabiliResponse {
  movimenti: MovimentoContabileCompleto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filtriApplicati: MovimentiContabiliFilters;
  statistiche: {
    totalMovimenti: number;
    totalImporto: number;
    movimentiQuadrati: number;
    movimentiAllocabili: number;
  };
}

/**
 * Service per gestione movimenti contabili completi nella staging analysis
 * REFACTORING COMPLETO: Nuovo approccio con caching in memoria e arricchimento totale
 * Implementa l'aggiornamento n.002 del piano con lookup tables e metodi unificati
 */
export class MovimentiContabiliService {
  protected prisma: PrismaClient;
  
  private contiMap: Map<string, StagingConto>;
  private causaliMap: Map<string, StagingCausaleContabile>;
  private anagraficheByCodiceMap: Map<string, StagingAnagrafica>; // Chiave: codiceAnagrafica o CF
  private anagraficheBySottocontoMap: Map<string, StagingAnagrafica>; // <-- LA CHIAVE DELLA SOLUZIONE
  private codiciIvaMap: Map<string, StagingCodiceIva>;
  private centriCostoMap: Map<string, any>; // Chiave: codice centro di costo

  constructor() {
    this.prisma = new PrismaClient();
    this.contiMap = new Map();
    this.causaliMap = new Map();
    this.anagraficheByCodiceMap = new Map();
    this.anagraficheBySottocontoMap = new Map(); // <-- LA CHIAVE DELLA SOLUZIONE
    this.codiciIvaMap = new Map();
    this.centriCostoMap = new Map();
  }

  private async loadAllLookups(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log('🔄 Loading all lookup tables into memory...');
      
      const [conti, causali, anagrafiche, codiciIva, centriCosto] = await Promise.all([
        this.prisma.stagingConto.findMany(),
        this.prisma.stagingCausaleContabile.findMany(),
        this.prisma.stagingAnagrafica.findMany(),
        this.prisma.stagingCodiceIva.findMany(),
        (this.prisma as any).stagingCentroCosto.findMany()
      ]);

      this.contiMap.clear();
      conti.forEach(conto => {
        if (conto.codice) this.contiMap.set(conto.codice, conto);
        if (conto.sigla) this.contiMap.set(conto.sigla, conto);
      });

      this.causaliMap.clear();
      causali.forEach(causale => {
        if (causale.codiceCausale) this.causaliMap.set(causale.codiceCausale, causale);
      });

      // --- INIZIO BLOCCO LOGICA ANAGRAFICHE MIGLIORATA ---
      this.anagraficheByCodiceMap.clear();
      this.anagraficheBySottocontoMap.clear();
      anagrafiche.forEach(anagrafica => {
        // Mappa per codice anagrafica (es. "ERION WEEE") e CF
        if (anagrafica.codiceAnagrafica) this.anagraficheByCodiceMap.set(anagrafica.codiceAnagrafica, anagrafica);
        if (anagrafica.codiceFiscaleClifor) this.anagraficheByCodiceMap.set(anagrafica.codiceFiscaleClifor, anagrafica);

        // Mappa per sottoconto (es. "1410000034")
        if (anagrafica.sottocontoCliente) this.anagraficheBySottocontoMap.set(anagrafica.sottocontoCliente, anagrafica);
        if (anagrafica.sottocontoFornitore) this.anagraficheBySottocontoMap.set(anagrafica.sottocontoFornitore, anagrafica);
      });
      // --- FINE BLOCCO LOGICA ANAGRAFICHE MIGLIORATA ---

      this.codiciIvaMap.clear();
      codiciIva.forEach(iva => {
        if (iva.codice) this.codiciIvaMap.set(iva.codice, iva);
      });

      this.centriCostoMap.clear();
      centriCosto.forEach(centro => {
        if (centro.codice) this.centriCostoMap.set(centro.codice, centro);
      });

      const loadTime = Date.now() - startTime;
      console.log(`✅ Lookup tables loaded: ${conti.length} conti, ${causali.length} causali, ${anagrafiche.length} anagrafiche, ${codiciIva.length} codici IVA, ${centriCosto.length} centri costo in ${loadTime}ms`);
      
    } catch (error) {
      console.error('❌ Error loading lookup tables:', error);
      throw error;
    }
  }

  async getMovimentiContabili(filters: MovimentiContabiliFilters = {}): Promise<MovimentiContabiliResponse> {
    const startTime = Date.now();
    try {
      await this.loadAllLookups();

      const appliedFilters = {
        page: filters.page || 1,
        limit: Math.min(filters.limit || 50, 100),
        dataDa: filters.dataDa,
        dataA: filters.dataA,
        soggetto: filters.soggetto,
        stato: filters.stato || 'ALL'
      };

      console.log(`🔍 MovimentiContabiliService: Filtering with`, appliedFilters);

      let preFilteredTestataIds: string[] | undefined = undefined;
      if (appliedFilters.soggetto) {
          const matchingRighe = await this.prisma.stagingRigaContabile.findMany({
              where: {
                  OR: [
                      { clienteFornitoreSigla: { contains: appliedFilters.soggetto, mode: 'insensitive' } },
                      { clienteFornitoreCodiceFiscale: { contains: appliedFilters.soggetto, mode: 'insensitive' } }
                  ]
              },
              select: { codiceUnivocoScaricamento: true }
          });
          preFilteredTestataIds = [...new Set(matchingRighe.map(r => r.codiceUnivocoScaricamento))];
          if (preFilteredTestataIds.length === 0) return this.createEmptyResponse(appliedFilters);
      }

      const testateFiltrate = await this.loadFilteredTestate(appliedFilters, preFilteredTestataIds);
      if (testateFiltrate.length === 0) return this.createEmptyResponse(appliedFilters);

      const codiciTestate = testateFiltrate.map(t => t.codiceUnivocoScaricamento);
      const [righeContabili, righeIva, allocazioni] = await Promise.all([
        this.loadRigheForTestate(codiciTestate),
        this.loadRigheIvaForTestate(codiciTestate),
        this.loadAllocazioniForTestate(codiciTestate)
      ]);


      const movimentiCompleti = this.aggregateAndEnrichMovimenti(
        testateFiltrate, righeContabili, righeIva, allocazioni
      );

      const startIndex = (appliedFilters.page - 1) * appliedFilters.limit;
      const endIndex = startIndex + appliedFilters.limit;
      const movimentiPaginati = movimentiCompleti.slice(startIndex, endIndex);

      const statistiche = this.calcolaStatisticheMovimenti(movimentiCompleti);
      const processingTime = Date.now() - startTime;
      console.log(`✅ MovimentiContabiliService: Processed ${movimentiPaginati.length}/${movimentiCompleti.length} movimenti in ${processingTime}ms`);

      return {
        movimenti: movimentiPaginati,
        pagination: {
          page: appliedFilters.page,
          limit: appliedFilters.limit,
          total: movimentiCompleti.length,
          totalPages: Math.ceil(movimentiCompleti.length / appliedFilters.limit)
        },
        filtriApplicati: appliedFilters,
        statistiche
      };
    } catch (error) {
      console.error('❌ Error in MovimentiContabiliService:', error);
      throw error;
    }
  }

  private createEmptyResponse(filters: MovimentiContabiliFilters): MovimentiContabiliResponse {
    return {
      movimenti: [],
      pagination: { page: filters.page || 1, limit: filters.limit || 50, total: 0, totalPages: 0 },
      filtriApplicati: filters,
      statistiche: { totalMovimenti: 0, totalImporto: 0, movimentiQuadrati: 0, movimentiAllocabili: 0 }
    };
  }

  private async loadFilteredTestate(filters: MovimentiContabiliFilters, preFilteredTestataIds?: string[]) {
    const whereConditions: Prisma.StagingTestataWhereInput = {};
    if (preFilteredTestataIds) {
        whereConditions.codiceUnivocoScaricamento = { in: preFilteredTestataIds };
    }
    if (filters.dataDa || filters.dataA) {
      whereConditions.dataRegistrazione = {};
      if (filters.dataDa) {
        const [year, month, day] = filters.dataDa.split('-');
        whereConditions.dataRegistrazione.gte = `${day}${month}${year}`;
      }
      if (filters.dataA) {
        const [year, month, day] = filters.dataA.split('-');
        whereConditions.dataRegistrazione.lte = `${day}${month}${year}`;
      }
    }
    if (filters.stato && filters.stato !== 'ALL') {
      whereConditions.stato = filters.stato;
    }
    return this.prisma.stagingTestata.findMany({ where: whereConditions, orderBy: { dataRegistrazione: 'asc' } });
  }

  private async loadRigheForTestate(codiciTestate: string[]) {
    return this.prisma.stagingRigaContabile.findMany({ where: { codiceUnivocoScaricamento: { in: codiciTestate } } });
  }

  private async loadRigheIvaForTestate(codiciTestate: string[]) {
    return this.prisma.stagingRigaIva.findMany({ where: { codiceUnivocoScaricamento: { in: codiciTestate } } });
  }

  private async loadAllocazioniForTestate(codiciTestate: string[]) {
    return this.prisma.stagingAllocazione.findMany({ where: { codiceUnivocoScaricamento: { in: codiciTestate } } });
  }

  private aggregateAndEnrichMovimenti(testate: any[], righeContabili: any[], righeIva: any[], allocazioni: any[]): MovimentoContabileCompleto[] {
    const scrittureMap = new Map<string, any>();

    testate.forEach(testata => {
      const causaleInfo = this.causaliMap.get(testata.codiceCausale || '');
      const toISODate = (dateStr: string | null) => dateStr ? (parseDateGGMMAAAA(dateStr)?.toISOString().split('T')[0] || null) : null;
      scrittureMap.set(testata.codiceUnivocoScaricamento, {
        testata: {
          ...testata,
          numeroDocumento: testata.numeroDocumento || 'Non Presente', // <-- CORREZIONE APPLICATA QUI
          dataRegistrazione: toISODate(testata.dataRegistrazione),
          dataDocumento: toISODate(testata.dataDocumento),
          dataRegistroIva: toISODate(testata.dataRegistroIva),
          dataCompetenzaLiquidIva: toISODate(testata.dataCompetenzaLiquidIva),
          dataCompetenzaContabile: toISODate(testata.dataCompetenzaContabile),
          causaleDecodificata: causaleInfo?.descrizione || testata.codiceCausale,
          descrizioneCausale: causaleInfo?.descrizione || testata.descrizioneCausale,
          soggettoResolve: null
        },
        righeDettaglio: [], righeIva: [], allocazioni: [], totaliDare: 0, totaliAvere: 0
      });
    });

    righeContabili.forEach(riga => {
      const scrittura = scrittureMap.get(riga.codiceUnivocoScaricamento);
      if (!scrittura) return;

      const importoDare = parseGestionaleCurrency(riga.importoDare);
      const importoAvere = parseGestionaleCurrency(riga.importoAvere);
      const contoCodice = riga.conto || riga.siglaConto || '';
      
      // --- INIZIO LOGICA DI RISOLUZIONE DENOMINAZIONE DEFINITIVA ---
      let contoDenominazione = `[Conto non presente: ${contoCodice}]`;
      let anagraficaRisolta = null;

      if (riga.tipoConto === 'C' || riga.tipoConto === 'F') {
          // È un cliente o fornitore, cerco la denominazione in staging_anagrafiche
          const anagraficaInfo = this.anagraficheBySottocontoMap.get(contoCodice);
          if (anagraficaInfo) {
              contoDenominazione = anagraficaInfo.denominazione || `${anagraficaInfo.cognome} ${anagraficaInfo.nome}`.trim();
              anagraficaRisolta = {
                  ...anagraficaInfo,
                  codiceCliente: anagraficaInfo.codiceAnagrafica || riga.clienteFornitoreSigla,
                  denominazione: contoDenominazione,
                  tipo: riga.tipoConto === 'C' ? 'CLIENTE' : 'FORNITORE',
              };
          } else {
              contoDenominazione = `[Anagrafica non trovata per sottoconto: ${contoCodice}]`;
          }
      } else {
          // È un conto generico, cerco la denominazione in staging_conti
          const contoInfo = this.contiMap.get(contoCodice);
          if (contoInfo) {
              contoDenominazione = contoInfo.descrizione || `[Descrizione vuota per: ${contoCodice}]`;
          }
      }

      if (!scrittura.testata.soggettoResolve && (riga.tipoConto === 'C' || riga.tipoConto === 'F')) {
        const sigla = riga.clienteFornitoreSigla || riga.clienteFornitoreCodiceFiscale;
        const anagraficaTrovata = this.anagraficheByCodiceMap.get(sigla);
        scrittura.testata.soggettoResolve = anagraficaTrovata ? { ...anagraficaTrovata, tipo: riga.tipoConto === 'C' ? 'CLIENTE' : 'FORNITORE' } : { denominazione: sigla, tipo: riga.tipoConto === 'C' ? 'CLIENTE' : 'FORNITORE', isUnresolved: true };
      }
      
      const contoInfo = this.contiMap.get(contoCodice); // Lo ricarico per il gruppo
      const gruppo = contoInfo?.gruppo?.trim().toUpperCase();
      const isAllocabile = gruppo === 'C' || gruppo === 'R';
      let motivoNonAllocabile: string | undefined = undefined;
      if (!isAllocabile) {
          if (gruppo === 'A' || gruppo === 'P' || gruppo === 'N') motivoNonAllocabile = "Conto Patrimoniale";
          else if (riga.tipoConto === 'C' || riga.tipoConto === 'F') motivoNonAllocabile = "Conto Cliente/Fornitore";
          else motivoNonAllocabile = "Natura conto non allocabile";
      }
      // --- FINE LOGICA DI RISOLUZIONE DENOMINAZIONE DEFINITIVA ---

      scrittura.righeDettaglio.push({
        ...riga, importoDare, importoAvere,
        contoDenominazione, isAllocabile, motivoNonAllocabile, anagrafica: anagraficaRisolta,
        conto: contoInfo || null
      });
      scrittura.totaliDare += importoDare;
      scrittura.totaliAvere += importoAvere;
    });

    righeIva.forEach(riga => {
      const scrittura = scrittureMap.get(riga.codiceUnivocoScaricamento);
      if (scrittura) {
        const ivaInfo = this.codiciIvaMap.get(riga.codiceIva);
        const matchedCodiceIva = ivaInfo ? {
            id: ivaInfo.id,
            descrizione: ivaInfo.descrizione,
            aliquota: parseGestionaleCurrency(ivaInfo.aliquota || '')
        } : {
            id: riga.codiceIva,
            descrizione: `Non Presente`, // Come richiesto
            aliquota: null
        };
        
        // NUOVO: Aggiungere contropartita arricchita
        const matchedContropartita = riga.contropartita ? {
          codice: riga.contropartita,
          descrizione: this.contiMap.get(riga.contropartita)?.descrizione || 'Conto non trovato'
        } : null;
        
        scrittura.righeIva.push({
            ...riga,
            imponibile: parseGestionaleCurrency(riga.imponibile),
            imposta: parseGestionaleCurrency(riga.imposta),
            importoLordo: parseGestionaleCurrency(riga.importoLordo),
            matchedCodiceIva,
            matchedContropartita
        });
      }
    });

    allocazioni.forEach(alloc => {
      const scrittura = scrittureMap.get(alloc.codiceUnivocoScaricamento);
      if (scrittura) {
        const centroCostoInfo = this.centriCostoMap.get(alloc.centroDiCosto);
        
        // NUOVO: Centro di costo arricchito
        const matchedCentroCosto = {
          codice: alloc.centroDiCosto,
          descrizione: centroCostoInfo?.descrizione || 'Centro di costo non trovato'
        };
        
        scrittura.allocazioni.push({
          ...alloc,
          matchedCentroCosto
        });
      }
    });

    return Array.from(scrittureMap.values()).map(scrittura => {
      // Se nessun soggetto risolto dalle righe, è un movimento interno. Usa la causale come descrizione.
      if (!scrittura.testata.soggettoResolve) {
          const descrizioneInterna = scrittura.testata.descrizioneCausale || 'Movimento Interno';
          scrittura.testata.soggettoResolve = {
              denominazione: descrizioneInterna, // Testo principale
              tipo: '',                        // Testo secondario vuoto
              // --- Tutti gli altri campi sono irrilevanti per la UI ma necessari per la struttura dati ---
              codiceFiscale: '',
              sigla: descrizioneInterna, // Duplichiamo qui per compatibilità temporanea
              subcodice: '',
              matchedEntity: null,
              matchConfidence: 1,
              sourceRows: 0,
              codiceCliente: 'INTERNO',
              totaleImporti: scrittura.totaliAvere,
              transazioni: [scrittura.testata.codiceUnivocoScaricamento],
              tipoContoDecodificato: 'Interno',
              tipoSoggettoDecodificato: '',
              descrizioneCompleta: `Movimento Interno: ${descrizioneInterna}`,
              matchType: 'exact' as const,
              sourceField: 'sigla' as const
          };
      }

      const isQuadrato = Math.abs(scrittura.totaliDare - scrittura.totaliAvere) < 0.01;
      const filtriApplicabili = [isQuadrato ? 'quadrato' : 'sbilanciato'];
      if (scrittura.allocazioni.length > 0) filtriApplicabili.push('allocato');
      if (scrittura.righeIva.length > 0) filtriApplicabili.push('con-iva');

      return { ...scrittura, statoDocumento: this.decodificaStato(scrittura.testata.stato), filtriApplicabili };
    });
  }

  private decodificaStato(stato: string): 'Draft' | 'Posted' | 'Validated' {
      const mapping: Record<string, 'Draft' | 'Posted' | 'Validated'> = { 'P': 'Draft', 'D': 'Posted', 'V': 'Validated' };
      return mapping[stato] || 'Posted';
  }

  private calcolaStatisticheMovimenti(movimenti: MovimentoContabileCompleto[]) {
    return {
      totalMovimenti: movimenti.length,
      totalImporto: movimenti.reduce((sum, m) => sum + Math.max(m.totaliDare, m.totaliAvere), 0),
      movimentiQuadrati: movimenti.filter(m => Math.abs(m.totaliDare - m.totaliAvere) < 0.01).length,
      movimentiAllocabili: movimenti.filter(m => m.righeDettaglio.some((r: VirtualRigaContabile) => r.isAllocabile)).length
    };
  }
}