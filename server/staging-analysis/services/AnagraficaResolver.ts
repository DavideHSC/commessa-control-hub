import { PrismaClient } from '@prisma/client';
import { VirtualAnagrafica, AnagraficheResolutionData, AnagraficaCompleta } from '../types/virtualEntities.js';
import { getTipoAnagrafica, createRecordHash } from '../utils/stagingDataHelpers.js';
import { RelationalMapper } from '../utils/relationalMapper.js';
import { decodeTipoConto, decodeTipoSoggetto } from '../utils/fieldDecoders.js';

export class AnagraficaResolver {
  private prisma: PrismaClient;
  private relationalMapper: RelationalMapper;

  constructor() {
    this.prisma = new PrismaClient();
    this.relationalMapper = new RelationalMapper(this.prisma);
  }

  /**
   * Risolve tutte le anagrafiche dai dati staging con focus su informazioni UTILI
   * NUOVA LOGICA: Preparazione import - cosa verrà creato/aggiornato
   */
  async resolveAnagrafiche(): Promise<AnagraficheResolutionData> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 AnagraficaResolver: Inizializzazione RelationalMapper...');
      await this.relationalMapper.initialize();
      
      // 1. Estrae anagrafiche uniche dai dati staging con informazioni business
      const stagingAnagrafiche = await this.extractAnagraficheConImporti();
      console.log(`📊 Estratte ${stagingAnagrafiche.length} anagrafiche uniche con dettagli business`);
      
      // 2. Risolve denominazioni e match DB per preparazione import
      const anagraficheRisolte = await this.resolvePerImportPreview(stagingAnagrafiche);
      
      // 3. Calcola statistiche utili per business
      const esistentiCount = anagraficheRisolte.filter(a => a.matchedEntity !== null).length;
      const nuoveCount = anagraficheRisolte.length - esistentiCount;
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AnagraficaResolver: Risolte ${anagraficheRisolte.length} anagrafiche in ${processingTime}ms`);
      console.log(`📊 Import preview: ${esistentiCount} esistenti, ${nuoveCount} nuove da creare`);
      
      return {
        anagrafiche: anagraficheRisolte,
        totalRecords: anagraficheRisolte.length,
        matchedRecords: esistentiCount, // Rename per chiarezza: "esistenti" 
        unmatchedRecords: nuoveCount    // Rename per chiarezza: "nuove da creare"
      };
      
    } catch (error) {
      console.error('❌ Error in AnagraficaResolver:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Estrae anagrafiche con importi e dettagli business per preview import
   * FOCUS: Informazioni UTILI per decisioni aziendali
   */
  private async extractAnagraficheConImporti(): Promise<Array<{
    codiceCliente: string; // Subcodice = vero identificativo aziendale
    denominazione: string; // Nome leggibile per business
    tipo: 'CLIENTE' | 'FORNITORE';
    tipoConto: string; // Per decodifiche
    // Dati financiari aggregati
    totaleImporti: number;
    movimentiCount: number;
    transazioni: string[];
    // Dati originali per matching
    codiceFiscale: string;
    sigla: string;
    subcodice: string;
  }>> {
    console.log('🔍 Estraendo anagrafiche con importi da StagingRigaContabile...');
    
    // Query completa con importi per calcoli business
    const righeContabili = await this.prisma.stagingRigaContabile.findMany({
      select: {
        codiceUnivocoScaricamento: true,
        tipoConto: true,
        clienteFornitoreCodiceFiscale: true,
        clienteFornitoreSigla: true,
        clienteFornitoreSubcodice: true,
        importoDare: true,
        importoAvere: true,
        note: true
      },
      where: {
        tipoConto: {
          in: ['C', 'F'] // Solo clienti e fornitori
        }
      }
    });

    console.log(`📊 Trovate ${righeContabili.length} righe contabili con anagrafiche`);

    // Mappa con aggregazione importi e denominazioni
    const anagraficheMap = new Map<string, {
      codiceCliente: string;
      denominazione: string;
      tipo: 'CLIENTE' | 'FORNITORE';
      tipoConto: string;
      totaleImporti: number;
      movimentiCount: number;
      transazioni: string[];
      codiceFiscale: string;
      sigla: string;
      subcodice: string;
    }>();

    righeContabili.forEach(riga => {
      const tipo = getTipoAnagrafica(riga.tipoConto);
      if (!tipo) return;

      const codiceFiscale = riga.clienteFornitoreCodiceFiscale?.trim() || '';
      const sigla = riga.clienteFornitoreSigla?.trim() || '';
      const subcodice = riga.clienteFornitoreSubcodice?.trim() || '';

      // Skip se nessun identificativo
      if (!codiceFiscale && !sigla && !subcodice) return;

      // Parsing importi (formato gestionale)
      const dare = parseFloat(riga.importoDare) || 0;
      const avere = parseFloat(riga.importoAvere) || 0;
      const importoTotale = Math.abs(dare - avere);

      // Codice Cliente = priorità subcodice > sigla > codice fiscale
      const codiceCliente = subcodice || sigla || codiceFiscale.substring(0, 10);
      
      // Denominazione = note se disponibili, altrimenti sigla o codice
      let denominazione = '';
      if (riga.note && riga.note.trim() && riga.note.trim() !== '-') {
        denominazione = riga.note.trim().substring(0, 50); // Max 50 char
      } else if (sigla && sigla.length > 2) {
        denominazione = sigla;
      } else {
        denominazione = `${tipo} ${codiceCliente}`;
      }

      const hash = createRecordHash([tipo, codiceCliente]);

      if (anagraficheMap.has(hash)) {
        const existing = anagraficheMap.get(hash)!;
        existing.totaleImporti += importoTotale;
        existing.movimentiCount++;
        existing.transazioni.push(riga.codiceUnivocoScaricamento);
      } else {
        anagraficheMap.set(hash, {
          codiceCliente,
          denominazione,
          tipo,
          tipoConto: riga.tipoConto,
          totaleImporti: importoTotale,
          movimentiCount: 1,
          transazioni: [riga.codiceUnivocoScaricamento],
          codiceFiscale,
          sigla,
          subcodice
        });
      }
    });

    const result = Array.from(anagraficheMap.values())
      .sort((a, b) => b.totaleImporti - a.totaleImporti); // Ordina per importo DESC
    
    console.log(`🎯 Identificate ${result.length} anagrafiche uniche con importi`);
    console.log(`💰 Importo totale: €${result.reduce((sum, a) => sum + a.totaleImporti, 0).toLocaleString()}`);
    
    return result;
  }

  /**
   * Risolve anagrafiche per preview import con focus su utilità business
   * NUOVA LOGICA: Esistenti vs Nuove da creare
   */
  private async resolvePerImportPreview(
    stagingAnagrafiche: Array<{
      codiceCliente: string;
      denominazione: string;
      tipo: 'CLIENTE' | 'FORNITORE';
      tipoConto: string;
      totaleImporti: number;
      movimentiCount: number;
      transazioni: string[];
      codiceFiscale: string;
      sigla: string;
      subcodice: string;
    }>
  ): Promise<VirtualAnagrafica[]> {
    console.log('🔗 Iniziando risoluzione con RelationalMapper...');
    const virtualAnagrafiche: VirtualAnagrafica[] = [];

    let matchedCount = 0;
    let highConfidenceMatches = 0;

    for (const staging of stagingAnagrafiche) {
      try {
        // Usa RelationalMapper per risoluzione completa
        const anagraficaCompleta = await this.relationalMapper.resolveAnagraficaFromRiga(
          staging.tipoConto,
          staging.codiceFiscale,
          staging.subcodice,
          staging.sigla
        );

        // Determina match entity dal risultato RelationalMapper
        let matchedEntity: { id: string; nome: string } | null = null;
        let matchConfidence = anagraficaCompleta.matchConfidence;
        
        // SEMPRE tenta il matching, indipendentemente dalla confidence del RelationalMapper
        // Il RelationalMapper potrebbe avere bassa confidence ma i dati potrebbero essere matchabili
        console.log(`📝 Tentativo matching per ${staging.tipo} (confidence: ${matchConfidence})`);
        
        // Prova il matching usando i dati originali dalle righe contabili
        const anagraficaPerMatching = {
          codiceFiscale: staging.codiceFiscale,
          subcodice: staging.subcodice, 
          sigla: staging.sigla
        };
        
        matchedEntity = await this.findMatchedEntity(anagraficaPerMatching, staging.tipo);
        
        // Recupera SEMPRE la denominazione vera dalle anagrafiche (non dalle note movimenti)
        const denominazioneVera = await this.getDenominazioneVera(anagraficaPerMatching, staging.tipo);
        
        if (matchedEntity) {
          matchedCount++;
          // Recalcola confidence basandoti sul fatto che abbiamo trovato un match
          matchConfidence = Math.max(matchConfidence, 0.7); // Almeno 70% se troviamo match
          if (matchConfidence >= 0.8) highConfidenceMatches++;
        } else {
          // Reset confidence se non troviamo l'entità reale nel DB
          matchConfidence = 0;
        }

        // Crea VirtualAnagrafica con dati enriched + BUSINESS DATA
        const virtualAnagrafica: VirtualAnagrafica = {
          codiceFiscale: staging.codiceFiscale,
          sigla: staging.sigla,
          subcodice: staging.subcodice,
          tipo: staging.tipo,
          matchedEntity,
          matchConfidence,
          sourceRows: staging.movimentiCount, // Fix: use actual count from business data
          
          // BUSINESS DATA FOR TABLE
          codiceCliente: staging.codiceCliente,
          denominazione: denominazioneVera || staging.denominazione, // Usa denominazione vera o fallback
          totaleImporti: staging.totaleImporti,
          transazioni: staging.transazioni,
          
          // NUOVI CAMPI RELAZIONALI da RelationalMapper
          tipoContoDecodificato: decodeTipoConto(staging.tipoConto),
          tipoSoggettoDecodificato: anagraficaCompleta.tipoSoggettoDecodificato,
          descrizioneCompleta: this.buildDescrizioneCompleta(anagraficaCompleta, staging),
          matchType: anagraficaCompleta.matchType,
          sourceField: anagraficaCompleta.sourceField
        };

        virtualAnagrafiche.push(virtualAnagrafica);

      } catch (error) {
        console.warn(`⚠️  Errore elaborazione anagrafica ${staging.codiceFiscale}:`, error);
        
        // Fallback: crea virtual anagrafica basic con BUSINESS DATA
        virtualAnagrafiche.push({
          codiceFiscale: staging.codiceFiscale,
          sigla: staging.sigla,
          subcodice: staging.subcodice,
          tipo: staging.tipo,
          matchedEntity: null,
          matchConfidence: 0,
          sourceRows: staging.movimentiCount,
          
          // BUSINESS DATA FOR TABLE
          codiceCliente: staging.codiceCliente,
          denominazione: staging.denominazione,
          totaleImporti: staging.totaleImporti,
          transazioni: staging.transazioni,
          
          tipoContoDecodificato: decodeTipoConto(staging.tipoConto),
          descrizioneCompleta: `${decodeTipoConto(staging.tipoConto)}: ${staging.sigla || staging.codiceFiscale || 'N/A'}`,
          matchType: 'none',
          sourceField: 'codiceFiscale'
        });
      }
    }

    console.log(`🎯 Risoluzione completata: ${matchedCount}/${stagingAnagrafiche.length} matched (${highConfidenceMatches} high confidence)`);
    return virtualAnagrafiche;
  }

  /**
   * Recupera la denominazione vera dalle anagrafiche (non dalle note movimenti)
   */
  private async getDenominazioneVera(
    anagraficaCompleta: { codiceFiscale: string; subcodice: string; sigla: string },
    tipo: 'CLIENTE' | 'FORNITORE'
  ): Promise<string | null> {
    try {
      console.log(`📝 Cercando denominazione vera per ${tipo}: CF="${anagraficaCompleta.codiceFiscale}", SUB="${anagraficaCompleta.subcodice}"`);
      
      // Costruisci condizioni OR dinamicamente (stesso logic del matching)
      const orConditions = [];
      
      if (anagraficaCompleta.subcodice?.trim()) {
        orConditions.push({ subcodiceClifor: anagraficaCompleta.subcodice.trim() });
      }
      
      if (anagraficaCompleta.codiceFiscale?.trim()) {
        orConditions.push({ codiceFiscaleClifor: anagraficaCompleta.codiceFiscale.trim() });
      }
      
      if (orConditions.length === 0) {
        return null;
      }
      
      // Query per recuperare solo la denominazione
      const stagingAnagrafica = await this.prisma.stagingAnagrafica.findFirst({
        where: {
          AND: [
            { tipoSoggetto: tipo === 'CLIENTE' ? 'C' : 'F' },
            { OR: orConditions }
          ]
        },
        select: { denominazione: true }
      });
      
      if (stagingAnagrafica?.denominazione?.trim()) {
        console.log(`✅ Denominazione vera trovata: "${stagingAnagrafica.denominazione}"`);
        return stagingAnagrafica.denominazione.trim();
      }
      
      console.log(`❌ Denominazione vera non trovata per ${tipo}`);
      return null;
      
    } catch (error) {
      console.warn('⚠️  Errore recupero denominazione vera:', error);
      return null;
    }
  }

  /**
   * Trova l'entità matchata nelle tabelle staging anagrafiche
   */
  private async findMatchedEntity(
    anagraficaCompleta: { codiceFiscale: string; subcodice: string; sigla: string },
    tipo: 'CLIENTE' | 'FORNITORE'
  ): Promise<{ id: string; nome: string } | null> {
    try {
      console.log(`🔍 DEBUGGING - Cercando match per ${tipo}:`);
      console.log(`  CF: "${anagraficaCompleta.codiceFiscale}"`);
      console.log(`  SUB: "${anagraficaCompleta.subcodice}"`);
      console.log(`  SIGLA: "${anagraficaCompleta.sigla}"`);
      
      // Costruisci condizioni OR dinamicamente
      const orConditions = [];
      
      // Priorità 1: subcodice (più specifico)
      if (anagraficaCompleta.subcodice?.trim()) {
        orConditions.push({ subcodiceClifor: anagraficaCompleta.subcodice.trim() });
        console.log(`  🎯 Aggiunto filtro subcodiceClifor: "${anagraficaCompleta.subcodice.trim()}"`);
      }
      
      // Priorità 2: codice fiscale
      if (anagraficaCompleta.codiceFiscale?.trim()) {
        orConditions.push({ codiceFiscaleClifor: anagraficaCompleta.codiceFiscale.trim() });
        console.log(`  🎯 Aggiunto filtro codiceFiscaleClifor: "${anagraficaCompleta.codiceFiscale.trim()}"`);
      }
      
      // Se non abbiamo condizioni, skip
      if (orConditions.length === 0) {
        console.log(`  ⚠️  Nessuna condizione valida per matching ${tipo}`);
        return null;
      }
      
      console.log(`  🔍 Query con ${orConditions.length} condizioni OR`);
      
      // Cerca nelle tabelle staging anagrafiche
      const stagingAnagrafica = await this.prisma.stagingAnagrafica.findFirst({
        where: {
          AND: [
            { tipoSoggetto: tipo === 'CLIENTE' ? 'C' : 'F' },
            { OR: orConditions }
          ]
        },
        select: { 
          id: true, 
          denominazione: true, 
          subcodiceClifor: true, 
          codiceFiscaleClifor: true,
          tipoSoggetto: true
        }
      });
      
      if (stagingAnagrafica) {
        console.log(`✅ MATCH TROVATO per ${tipo}:`);
        console.log(`  ID: ${stagingAnagrafica.id}`);
        console.log(`  Denominazione: "${stagingAnagrafica.denominazione}"`);
        console.log(`  SubcodiceClifor: "${stagingAnagrafica.subcodiceClifor}"`);
        console.log(`  CodiceFiscaleClifor: "${stagingAnagrafica.codiceFiscaleClifor}"`);
        
        return {
          id: stagingAnagrafica.id,
          nome: stagingAnagrafica.denominazione || `${tipo} ${stagingAnagrafica.subcodiceClifor || stagingAnagrafica.codiceFiscaleClifor}`
        };
      }
      
      console.log(`❌ NESSUN MATCH trovato in staging per ${tipo} con le condizioni specificate`);
      
      // Debug: conta quante anagrafiche ci sono per questo tipo
      const countPerTipo = await this.prisma.stagingAnagrafica.count({
        where: { tipoSoggetto: tipo === 'CLIENTE' ? 'C' : 'F' }
      });
      console.log(`  📊 Totale ${tipo} in staging: ${countPerTipo}`);
      
      // Debug: mostra alcuni CF disponibili per confronto
      const sampleAnagrafiche = await this.prisma.stagingAnagrafica.findMany({
        where: { tipoSoggetto: tipo === 'CLIENTE' ? 'C' : 'F' },
        select: { codiceFiscaleClifor: true, subcodiceClifor: true, denominazione: true },
        take: 3
      });
      console.log(`  🔍 Sample anagrafiche in staging per ${tipo}:`);
      sampleAnagrafiche.forEach((ana, i) => {
        console.log(`    ${i+1}. CF="${ana.codiceFiscaleClifor}" SUB="${ana.subcodiceClifor}" NOME="${ana.denominazione}"`);
      });
      
      return null;
      
    } catch (error) {
      console.warn('⚠️  Errore ricerca entità matchata:', error);
      return null;
    }
  }

  /**
   * Costruisce descrizione completa per l'anagrafica
   */
  private buildDescrizioneCompleta(
    anagraficaCompleta: AnagraficaCompleta,
    staging: { codiceFiscale: string; sigla: string; subcodice: string; tipoConto: string }
  ): string {
    const tipoDecodificato = decodeTipoConto(staging.tipoConto);
    const denominazione = anagraficaCompleta.denominazione || staging.sigla || staging.codiceFiscale || 'N/A';
    
    let descrizione = `${tipoDecodificato}: ${denominazione}`;
    
    if (anagraficaCompleta.matchType !== 'none') {
      descrizione += ` (match: ${anagraficaCompleta.matchType})`;
    }
    
    return descrizione;
  }
}