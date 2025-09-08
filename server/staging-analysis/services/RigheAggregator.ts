import { PrismaClient } from '@prisma/client';
import { VirtualScrittura, VirtualRigaContabile, VirtualRigaIva, VirtualAllocazione, RigheAggregationData } from '../types/virtualEntities.js';
import { parseItalianCurrency, parseDateGGMMAAAA, isScrittuраQuadrata, getTipoAnagrafica, generateRigaIdentifier } from '../utils/stagingDataHelpers.js';

export class RigheAggregator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Aggrega le righe contabili staging per formare scritture virtuali complete
   * Logica INTERPRETATIVA - zero persistenza, solo aggregazione logica
   */
  async aggregateRighe(): Promise<RigheAggregationData> {
    const startTime = Date.now();

    try {
      // 1. Carica tutti i dati staging necessari
      const [testate, righeContabili, righeIva, allocazioni] = await Promise.all([
        this.loadStagingTestate(),
        this.loadStagingRigheContabili(),
        this.loadStagingRigheIva(),
        this.loadStagingAllocazioni()
      ]);

      // 2. Aggrega tutto per codice univoco scaricamento
      const scritture = this.aggregateByTestata(testate, righeContabili, righeIva, allocazioni);

      // 3. Calcola statistiche
      const quadrateScrittureCount = scritture.filter(s => s.isQuadrata).length;
      const nonQuadrateScrittureCount = scritture.length - quadrateScrittureCount;
      const totalRigheCount = scritture.reduce((sum, s) => sum + s.righeContabili.length, 0);

      const processingTime = Date.now() - startTime;
      console.log(`✅ RigheAggregator: Aggregated ${scritture.length} scritture (${totalRigheCount} righe) in ${processingTime}ms`);

      return {
        scritture,
        totalScrittureCount: scritture.length,
        quadrateScrittureCount,
        nonQuadrateScrittureCount,
        totalRigheCount
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
   * Carica tutte le righe IVA staging
   */
  private async loadStagingRigheIva() {
    return await this.prisma.stagingRigaIva.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        riga: true,
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
  private aggregateByTestata(
    testate: any[],
    righeContabili: any[],
    righeIva: any[],
    allocazioni: any[]
  ): VirtualScrittura[] {
    const scrittureMap = new Map<string, VirtualScrittura>();

    // Prima passa - crea le scritture dalle testate
    testate.forEach(testata => {
      try {
        const codice = testata.codiceUnivocoScaricamento;
        const dataReg = testata.dataRegistrazione ? parseDateGGMMAAAA(testata.dataRegistrazione) || new Date() : new Date();
        const dataDoc = testata.dataDocumento ? parseDateGGMMAAAA(testata.dataDocumento) : null;

      scrittureMap.set(codice, {
        codiceUnivocoScaricamento: codice,
        dataRegistrazione: dataReg,
        causale: testata.codiceCausale || '',
        descrizione: testata.descrizioneCausale || '',
        numeroDocumento: testata.numeroDocumento,
        dataDocumento: dataDoc,
        righeContabili: [],
        righeIva: [],
        allocazioni: [],
        totaliDare: 0,
        totaliAvere: 0,
        isQuadrata: false,
        allocationStatus: 'non_allocato'
      });
      } catch (error) {
        console.error(`❌ Error processing testata ${testata.codiceUnivocoScaricamento}:`, error);
        // Skip this testata and continue with others
      }
    });

    // Seconda passa - aggiungi righe contabili
    righeContabili.forEach(riga => {
      try {
        const codice = riga.codiceUnivocoScaricamento;
        const scrittura = scrittureMap.get(codice);
        if (!scrittura) return;

        const importoDare = parseItalianCurrency(riga.importoDare);
        const importoAvere = parseItalianCurrency(riga.importoAvere);

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
        conto: riga.conto || '',
        siglaConto: riga.siglaConto,
        importoDare,
        importoAvere,
        note: riga.note || '',
        anagrafica: virtualAnagrafica,
        hasCompetenzaData: riga.insDatiCompetenzaContabile === '1',
        hasMovimentiAnalitici: riga.insDatiMovimentiAnalitici === '1'
      };

      scrittura.righeContabili.push(virtualRiga);
      scrittura.totaliDare += importoDare;
      scrittura.totaliAvere += importoAvere;
      } catch (error) {
        console.error(`❌ Error processing riga contabile ${riga.codiceUnivocoScaricamento}:`, error);
        // Skip this riga and continue with others
      }
    });

    // Terza passa - aggiungi righe IVA
    righeIva.forEach(riga => {
      try {
        const codice = riga.codiceUnivocoScaricamento;
        const scrittura = scrittureMap.get(codice);
        if (!scrittura) return;

        const virtualRigaIva: VirtualRigaIva = {
          riga: riga.riga,
          codiceIva: riga.codiceIva || '',
          contropartita: riga.contropartita || riga.siglaContropartita || '',
          imponibile: parseItalianCurrency(riga.imponibile),
          imposta: parseItalianCurrency(riga.imposta),
          importoLordo: parseItalianCurrency(riga.importoLordo),
          note: riga.note || '',
          matchedCodiceIva: null // Sarà risolto separatamente se necessario
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
}