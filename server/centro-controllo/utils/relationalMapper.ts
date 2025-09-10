/**
 * Relational Mapper per gestione relazioni tabelle basato sui tracciati legacy
 * 
 * Implementa la logica di join e relazioni tra tabelle seguendo le specifiche
 * documentate nei tracciati in .docs/dati_cliente/tracciati/modificati/
 * 
 * STRATEGIA CHIAVE: Utilizza sempre codici interni gestionale per le relazioni,
 * non identificatori fiscali (es. subcodice, codice anagrafica)
 * 
 * @author Claude Code
 * @date 2025-09-04
 */

import { PrismaClient } from '@prisma/client';
import { 
  decodeTipoConto, 
  decodeTipoSoggetto, 
  decodeTipoContigen,
  decodeGruppoContigen,
  decodeLivelloContigen,
  decodeAnagraficaCompleta,
  decodeContoContigenCompleto
} from './fieldDecoders.js';
import { getTipoAnagrafica } from './stagingDataHelpers.js';

// === Types per Entità Arricchite ===

export interface AnagraficaCompleta {
  // Campi core da staging
  codiceFiscale: string;
  subcodice?: string;
  sigla?: string;
  
  // Denominazione risolte
  denominazione?: string;
  tipoContoDecodificato: string;
  tipoSoggettoDecodificato?: string;
  descrizioneCompleta: string;
  
  // Metadati relazionali
  matchType: 'exact' | 'partial' | 'fallback' | 'none';
  matchConfidence: number;
  sourceField: 'subcodice' | 'codiceFiscale' | 'sigla';
}

export interface ContoEnricchito {
  // Campi core
  codice: string;
  sigla?: string;
  
  // Denominazioni risolte
  nome?: string;
  descrizione?: string;
  descrizioneLocale?: string;
  
  // Decodifiche CONTIGEN
  livelloDecodificato?: string;
  tipoDecodificato?: string;
  gruppoDecodificato?: string;
  descrizioneCompleta?: string;
  
  // Metadati relazionali
  matchType: 'exact' | 'sigla' | 'partial' | 'fallback' | 'none';
  matchConfidence: number;
  sourceField: 'codice' | 'sigla' | 'externalId';
}

export interface CausaleEnricchita {
  // Campi core
  codice: string;
  
  // Denominazioni risolte
  descrizione?: string;
  
  // Decodifiche specifiche
  tipoMovimentoDecodificato?: string;
  tipoAggiornamentoDecodificato?: string;
  tipoRegistroIvaDecodificato?: string;
  
  // Metadati relazionali
  matchType: 'exact' | 'externalId' | 'none';
  matchConfidence: number;
}

export interface CodiceIvaEnricchito {
  // Campi core
  codice: string;
  
  // Denominazioni risolte
  descrizione?: string;
  aliquota?: number;
  
  // Metadati relazionali
  matchType: 'exact' | 'externalId' | 'none';
  matchConfidence: number;
}

// === Relational Mapper Class ===

export class RelationalMapper {
  private prisma: PrismaClient;
  
  // Cache per lookup efficienti
  private anagraficheCache = new Map<string, any>();
  private contiCache = new Map<string, any>();
  private causaliCache = new Map<string, any>();
  private codiciIvaCache = new Map<string, any>();
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Inizializza le cache per lookup efficienti
   */
  async initialize(): Promise<void> {
    try {
      console.log('[RelationalMapper] Inizializzazione cache...');
      
      const startTime = Date.now();
      
      // Carica cache in parallelo
      await Promise.all([
        this.loadAnagraficheCache(),
        this.loadContiCache(),
        this.loadCausaliCache(),
        this.loadCodiciIvaCache()
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`[RelationalMapper] Cache inizializzate in ${duration}ms`);
      
    } catch (error) {
      console.error('[RelationalMapper] Errore inizializzazione:', error);
      throw error;
    }
  }

  /**
   * Carica cache anagrafiche (A_CLIFOR pattern)
   */
  private async loadAnagraficheCache(): Promise<void> {
    try {
      console.log('[RelationalMapper] 🔄 Caricamento cache clienti...');
      const anagrafiche = await this.prisma.cliente.findMany({
        select: {
          id: true,
          nome: true,
          codiceFiscale: true,
          piva: true,
          nomeAnagrafico: true,
          sottocontoCliente: true,
          externalId: true
        }
      });
      console.log(`[RelationalMapper] ✅ Trovati ${anagrafiche.length} clienti`);
      
      console.log('[RelationalMapper] 🔄 Caricamento cache fornitori...');
      const fornitori = await this.prisma.fornitore.findMany({
        select: {
          id: true,
          nome: true,
          codiceFiscale: true,
          piva: true,
          nomeAnagrafico: true,
          sottocontoFornitore: true,
          externalId: true
        }
      });
      console.log(`[RelationalMapper] ✅ Trovati ${fornitori.length} fornitori`);
      
      console.log('[RelationalMapper] 🔄 Popolamento cache multi-key...');
      // Popola cache con strategia multi-key
      const allAnagrafiche = [...anagrafiche.map(a => ({ ...a, tipo: 'Cliente' })), ...fornitori.map(f => ({ ...f, tipo: 'Fornitore' }))];
      console.log(`[RelationalMapper] 📊 Processando ${allAnagrafiche.length} anagrafiche totali`);
      
      let cfKeys = 0, pivaKeys = 0, subKeys = 0, extKeys = 0;
      
      allAnagrafiche.forEach((item, index) => {
        // Key primaria: codice fiscale (se disponibile)
        if (item.codiceFiscale && item.codiceFiscale.trim()) {
          this.anagraficheCache.set(`cf_${item.codiceFiscale}`, item);
          cfKeys++;
        }
        
        // Key secondaria: partita IVA (se disponibile)
        if (item.piva && item.piva.trim()) {
          this.anagraficheCache.set(`piva_${item.piva}`, item);
          pivaKeys++;
        }
        
        // Key terziaria: subcodice clienti/fornitori
        if (item.tipo === 'Cliente' && 'sottocontoCliente' in item && item.sottocontoCliente && item.sottocontoCliente.trim()) {
          this.anagraficheCache.set(`sub_cliente_${item.sottocontoCliente}`, item);
          subKeys++;
        }
        if (item.tipo === 'Fornitore' && 'sottocontoFornitore' in item && item.sottocontoFornitore && item.sottocontoFornitore.trim()) {
          this.anagraficheCache.set(`sub_fornitore_${item.sottocontoFornitore}`, item);
          subKeys++;
        }
        
        // Key quaternaria: externalId
        if (item.externalId && item.externalId.trim()) {
          this.anagraficheCache.set(`ext_${item.externalId}`, item);
          extKeys++;
        }
        
        // Debug per prime 3 entries
        if (index < 3) {
          const subcodice = item.tipo === 'Cliente' && 'sottocontoCliente' in item ? item.sottocontoCliente : 
                           item.tipo === 'Fornitore' && 'sottocontoFornitore' in item ? item.sottocontoFornitore : 'N/A';
          console.log(`[RelationalMapper] 🔍 Sample ${item.tipo}: CF=${item.codiceFiscale}, PIVA=${item.piva}, SUB=${subcodice}, EXT=${item.externalId}, NOME=${item.nome}`);
        }
      });
      
      console.log(`[RelationalMapper] ✅ Cache anagrafiche popolata:`);
      console.log(`[RelationalMapper]   📋 Total cache entries: ${this.anagraficheCache.size}`);
      console.log(`[RelationalMapper]   🆔 CF keys: ${cfKeys}, PIVA keys: ${pivaKeys}, SUB keys: ${subKeys}, EXT keys: ${extKeys}`);
      
    } catch (error) {
      console.error('[RelationalMapper] ❌ Errore caricamento cache anagrafiche:', error);
      throw error;
    }
  }

  /**
   * Carica cache conti (CONTIGEN pattern)
   */
  private async loadContiCache(): Promise<void> {
    const conti = await this.prisma.conto.findMany({
      select: {
        id: true,
        codice: true,
        nome: true,
        descrizioneLocale: true,
        externalId: true,
        // Altri campi CONTIGEN se disponibili
      }
    });
    
    const stagingConti = await this.prisma.stagingConto.findMany({
      select: {
        codice: true,
        descrizione: true,
        sigla: true,
        tipo: true,
        gruppo: true,
        livello: true
      }
    });
    
    // Popola cache conti produzione
    conti.forEach(conto => {
      // Key primaria: codice
      this.contiCache.set(`prod_${conto.codice}`, conto);
      
      // Key alternativa: externalId
      if (conto.externalId) {
        this.contiCache.set(`prod_ext_${conto.externalId}`, conto);
      }
    });
    
    // Popola cache staging CONTIGEN con decodifiche
    stagingConti.forEach(conto => {
      const enriched = {
        ...conto,
        tipoDecodificato: decodeTipoContigen(conto.tipo || ''),
        gruppoDecodificato: decodeGruppoContigen(conto.gruppo || ''),
        livelloDecodificato: decodeLivelloContigen(conto.livello || ''),
        descrizioneCompleta: decodeContoContigenCompleto(conto.livello || '', conto.tipo || '', conto.gruppo)
      };
      
      // Key per codice
      this.contiCache.set(`staging_${conto.codice}`, enriched);
      
      // Key per sigla (se disponibile)
      if (conto.sigla) {
        this.contiCache.set(`staging_sigla_${conto.sigla}`, enriched);
      }
    });
    
    console.log(`[RelationalMapper] Cache conti: ${this.contiCache.size} entries`);
  }

  /**
   * Carica cache causali contabili
   */
  private async loadCausaliCache(): Promise<void> {
    const causali = await this.prisma.causaleContabile.findMany({
      select: {
        id: true,
        externalId: true,
        descrizione: true,
        // Altri campi se disponibili
      }
    });
    
    causali.forEach(causale => {
      // Key primaria: externalId (da tracciato CAUSALI.TXT)
      if (causale.externalId) {
        this.causaliCache.set(causale.externalId, causale);
      }
    });
    
    console.log(`[RelationalMapper] Cache causali: ${this.causaliCache.size} entries`);
  }

  /**
   * Carica cache codici IVA
   */
  private async loadCodiciIvaCache(): Promise<void> {
    const codiciIva = await this.prisma.codiceIva.findMany({
      select: {
        id: true,
        externalId: true,
        descrizione: true,
        aliquota: true,
        // Altri campi se disponibili
      }
    });
    
    codiciIva.forEach(codice => {
      // Key primaria: externalId (da tracciato CODICIVA.TXT)
      if (codice.externalId) {
        this.codiciIvaCache.set(codice.externalId, codice);
      }
    });
    
    console.log(`[RelationalMapper] Cache codici IVA: ${this.codiciIvaCache.size} entries`);
  }

  /**
   * Risolve anagrafica da dati riga contabile seguendo priorità A_CLIFOR
   * 
   * PRIORITÀ (da A_CLIFOR.md riga 41):
   * 1. Codice fiscale + subcodice (se disponibili)
   * 2. Sigla anagrafica
   * 3. Fallback su denominazione parziale
   */
  async resolveAnagraficaFromRiga(
    tipoConto: string,
    codiceFiscale?: string,
    subcodice?: string,
    sigla?: string
  ): Promise<AnagraficaCompleta> {
    
    let matchedEntity = null;
    let matchType: AnagraficaCompleta['matchType'] = 'none';
    let matchConfidence = 0;
    let sourceField: AnagraficaCompleta['sourceField'] = 'codiceFiscale';
    
    // Strategy 1: Subcodice (priorità massima - più affidabile)
    if (subcodice && subcodice.trim()) {
      const tipoKey = getTipoAnagrafica(tipoConto) === 'CLIENTE' ? 'cliente' : 'fornitore';
      const key = `sub_${tipoKey}_${subcodice.trim()}`;
      matchedEntity = this.anagraficheCache.get(key);
      
      if (matchedEntity) {
        matchType = 'exact';
        matchConfidence = 95;
        sourceField = 'subcodice';
      }
    }
    
    // Strategy 2: Codice fiscale (seconda priorità)
    if (!matchedEntity && codiceFiscale && codiceFiscale.trim()) {
      const key = `cf_${codiceFiscale.trim()}`;
      matchedEntity = this.anagraficheCache.get(key);
      
      if (matchedEntity) {
        matchType = 'exact';
        matchConfidence = 85;
        sourceField = 'codiceFiscale';
      }
    }
    
    // Strategy 3: ExternalId (terza priorità)
    if (!matchedEntity && subcodice && subcodice.trim()) {
      const key = `ext_${subcodice.trim()}`;
      matchedEntity = this.anagraficheCache.get(key);
      
      if (matchedEntity) {
        matchType = 'partial';
        matchConfidence = 75;
        sourceField = 'subcodice';
      }
    }
    
    // Strategy 4: Sigla (fallback)
    if (!matchedEntity && sigla && sigla.trim()) {
      // Ricerca denominazione parziale nei nomi (future enhancement)
      sourceField = 'sigla';
      matchType = 'fallback';
      matchConfidence = 60;
    }
    
    // Se nessun match trovato, mantieni confidence 0
    if (!matchedEntity) {
      matchType = 'none';
      matchConfidence = 0;
    }
    
    // Costruisci risultato
    const result: AnagraficaCompleta = {
      codiceFiscale: codiceFiscale || '',
      subcodice,
      sigla,
      denominazione: matchedEntity?.nome || 'N/D',
      tipoContoDecodificato: decodeTipoConto(tipoConto),
      descrizioneCompleta: matchedEntity 
        ? `${decodeTipoConto(tipoConto)}: ${matchedEntity.nome}`
        : decodeTipoConto(tipoConto),
      matchType,
      matchConfidence,
      sourceField
    };
    
    return result;
  }

  /**
   * Risolve conto da codice/sigla seguendo priorità PNRIGCON
   * 
   * PRIORITÀ (da PNRIGCON.md):
   * 1. CONTO (pos. 49-58) - codice diretto
   * 2. SIGLA CONTO (pos. 301-312) - identificatore alternativo
   */
  async resolveContoFromCodice(conto?: string, siglaConto?: string): Promise<ContoEnricchito> {
    
    let matchedEntity = null;
    let matchType: ContoEnricchito['matchType'] = 'none';
    let matchConfidence = 0;
    let sourceField: ContoEnricchito['sourceField'] = 'codice';
    
    // Strategy 1: Codice diretto (priorità massima)
    if (conto && conto.trim()) {
      // Cerca prima in produzione
      matchedEntity = this.contiCache.get(`prod_${conto.trim()}`);
      
      if (matchedEntity) {
        matchType = 'exact';
        matchConfidence = 95;
        sourceField = 'codice';
      } else {
        // Fallback su staging CONTIGEN
        matchedEntity = this.contiCache.get(`staging_${conto.trim()}`);
        if (matchedEntity) {
          matchType = 'exact';
          matchConfidence = 90;
          sourceField = 'codice';
        }
      }
    }
    
    // Strategy 2: Sigla conto (fallback)
    if (!matchedEntity && siglaConto && siglaConto.trim()) {
      matchedEntity = this.contiCache.get(`staging_sigla_${siglaConto.trim()}`);
      
      if (matchedEntity) {
        matchType = 'sigla';
        matchConfidence = 80;
        sourceField = 'sigla';
      }
    }
    
    // Strategy 3: Ricerca parziale (per codici troncati)
    if (!matchedEntity && conto && conto.length >= 4) {
      // Implementazione futura per match parziali
      matchType = 'partial';
      matchConfidence = 50;
    }
    
    // Costruisci risultato arricchito
    const result: ContoEnricchito = {
      codice: conto || '',
      sigla: siglaConto,
      nome: matchedEntity?.nome || matchedEntity?.descrizione || 'N/D',
      descrizione: matchedEntity?.descrizioneLocale || matchedEntity?.descrizione,
      // Campi CONTIGEN decodificati (se da staging)
      livelloDecodificato: matchedEntity?.livelloDecodificato,
      tipoDecodificato: matchedEntity?.tipoDecodificato,
      gruppoDecodificato: matchedEntity?.gruppoDecodificato,
      descrizioneCompleta: matchedEntity?.descrizioneCompleta || matchedEntity?.nome || `Conto ${conto}`,
      matchType,
      matchConfidence,
      sourceField
    };
    
    return result;
  }

  /**
   * Risolve causale contabile da codice
   */
  async resolveCausaleFromCodice(codiceCausale: string): Promise<CausaleEnricchita> {
    
    let matchedEntity = null;
    let matchType: CausaleEnricchita['matchType'] = 'none';
    let matchConfidence = 0;
    
    if (codiceCausale && codiceCausale.trim()) {
      matchedEntity = this.causaliCache.get(codiceCausale.trim());
      
      if (matchedEntity) {
        matchType = 'exact';
        matchConfidence = 95;
      }
    }
    
    const result: CausaleEnricchita = {
      codice: codiceCausale || '',
      descrizione: matchedEntity?.descrizione || 'N/D',
      matchType,
      matchConfidence
    };
    
    return result;
  }

  /**
   * Risolve codice IVA da codice
   */
  async resolveCodiceIvaFromCodice(codiceIva: string): Promise<CodiceIvaEnricchito> {
    
    let matchedEntity = null;
    let matchType: CodiceIvaEnricchito['matchType'] = 'none';
    let matchConfidence = 0;
    
    if (codiceIva && codiceIva.trim()) {
      matchedEntity = this.codiciIvaCache.get(codiceIva.trim());
      
      if (matchedEntity) {
        matchType = 'exact';
        matchConfidence = 95;
      }
    }
    
    const result: CodiceIvaEnricchito = {
      codice: codiceIva || '',
      descrizione: matchedEntity?.descrizione || 'N/D',
      aliquota: matchedEntity?.aliquota,
      matchType,
      matchConfidence
    };
    
    return result;
  }

  /**
   * Costruisce scrittura completa con tutte le relazioni risolte
   * 
   * Questo è il metodo master che utilizza il CODICE UNIVOCO SCARICAMENTO
   * per aggregare tutti i dati correlati seguendo i pattern dei tracciati
   */
  async buildCompleteScrittura(codiceUnivocoScaricamento: string): Promise<any> {
    // Implementazione futura - aggregazione completa seguendo tutti i join pattern
    // dei 4 tracciati principali (PNTESTA, PNRIGCON, PNRIGIVA, MOVANAC)
    
    console.log(`[RelationalMapper] TODO: Implementare aggregazione completa per ${codiceUnivocoScaricamento}`);
    
    return {
      codiceUnivocoScaricamento,
      status: 'not_implemented'
    };
  }

  /**
   * Pulisce le cache (per testing o refresh)
   */
  clearCache(): void {
    this.anagraficheCache.clear();
    this.contiCache.clear();
    this.causaliCache.clear();
    this.codiciIvaCache.clear();
    console.log('[RelationalMapper] Cache pulite');
  }

  /**
   * Statistiche cache per debugging
   */
  getCacheStats(): Record<string, number> {
    return {
      anagrafiche: this.anagraficheCache.size,
      conti: this.contiCache.size,
      causali: this.causaliCache.size,
      codiciIva: this.codiciIvaCache.size
    };
  }
}

// === Factory Function ===

let relationalMapperInstance: RelationalMapper | null = null;

/**
 * Factory function per singleton RelationalMapper
 */
export function getRelationalMapper(prisma: PrismaClient): RelationalMapper {
  if (!relationalMapperInstance) {
    relationalMapperInstance = new RelationalMapper(prisma);
  }
  return relationalMapperInstance;
}

/**
 * Reimposta il singleton (per testing)
 */
export function resetRelationalMapper(): void {
  if (relationalMapperInstance) {
    relationalMapperInstance.clearCache();
  }
  relationalMapperInstance = null;
}