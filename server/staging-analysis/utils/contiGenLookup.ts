/**
 * CONTIGEN Lookup Service
 * 
 * Servizio per il matching avanzato delle denominazioni conti utilizzando
 * i dati del tracciato CONTIGEN.TXT per arricchire le informazioni dei conti.
 */

import { PrismaClient } from '@prisma/client';

export interface ContigenData {
  codifica: string;      // Campo CODIFICA (pos 6-15)
  descrizione: string;   // Campo DESCRIZIONE (pos 16-75) 
  tipo: string;          // Campo TIPO (pos 76): P/E/O/C/F
  sigla: string;         // Campo SIGLA (pos 77-88)
  gruppo?: string;       // Campo GRUPPO (pos 257): A/C/N/P/R/V/Z
}

export interface ContoEnricchito {
  codice: string;
  nome: string;
  descrizioneLocale?: string;
  externalId?: string;
  // Dati CONTIGEN arricchiti
  contigenData?: ContigenData;
  matchType: 'exact' | 'partial' | 'fallback' | 'none';
  confidence: number; // 0-100
}

export class ContiGenLookupService {
  private prisma: PrismaClient;
  private contiCache: Map<string, ContoEnricchito> = new Map();
  private contigenCache: ContigenData[] = [];
  private initialized = false;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Inizializza il servizio caricando i dati reali da database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Carica tutti i conti dalla tabella di produzione
    const conti = await this.prisma.conto.findMany({
      select: {
        codice: true,
        nome: true,
        externalId: true
      }
    });

    // Carica tutti i dati CONTIGEN reali dalla staging
    const contiStaging = await this.prisma.stagingConto.findMany({
      select: {
        codice: true,
        descrizione: true,
        descrizioneLocale: true,
        sigla: true,
        tipo: true,
        gruppo: true,
        livello: true
      }
    });

    // Popola la cache CONTIGEN con dati reali
    for (const stagingConto of contiStaging) {
      if (stagingConto.codice) {
        this.contigenCache.push({
          codifica: stagingConto.codice,
          descrizione: stagingConto.descrizione || stagingConto.descrizioneLocale || '',
          tipo: stagingConto.tipo || '',
          sigla: stagingConto.sigla || '',
          gruppo: stagingConto.gruppo || undefined
        });
      }
    }

    // Popola la cache dei conti con lookup CONTIGEN
    for (const conto of conti) {
      const codice = conto.codice || conto.externalId || '';
      
      // Cerca dati arricchiti da CONTIGEN
      const contigenMatch = this.findContigenMatch(codice);
      
      const enriched: ContoEnricchito = {
        codice: codice,
        nome: contigenMatch?.descrizione || conto.nome,
        descrizioneLocale: contigenMatch?.descrizione,
        externalId: conto.externalId || undefined,
        contigenData: contigenMatch,
        matchType: contigenMatch ? 'exact' : 'fallback',
        confidence: contigenMatch ? 100 : 60
      };
      
      // Aggiungi alle cache con tutte le chiavi possibili
      if (conto.codice) {
        this.contiCache.set(conto.codice, enriched);
      }
      if (conto.externalId && conto.externalId !== conto.codice) {
        this.contiCache.set(conto.externalId, enriched);
      }
    }

    console.log(`✅ ContiGenLookupService: Initialized with ${this.contiCache.size} conti and ${this.contigenCache.length} CONTIGEN entries`);
    this.initialized = true;
  }

  /**
   * Lookup principale: trova il conto migliore per un codice
   * Gestisce sia CONTO che SIGLA CONTO dal tracciato PNRIGCON
   */
  async lookupConto(codiceConto: string): Promise<ContoEnricchito | null> {
    await this.initialize();

    if (!codiceConto || codiceConto.trim() === '') {
      return null;
    }

    const codice = codiceConto.trim();

    // 1. Match esatto dalla cache (primo try con codice esatto)
    if (this.contiCache.has(codice)) {
      return this.contiCache.get(codice)!;
    }

    // 2. Match per sigla (cerca nelle sigle CONTIGEN)
    const siglaMatch = this.findSiglaMatch(codice);
    if (siglaMatch) {
      return siglaMatch;
    }

    // 3. Match parziale per codici simili
    const partialMatch = this.findPartialMatch(codice);
    if (partialMatch) {
      return partialMatch;
    }

    // 4. Fallback: cerca in CONTIGEN per dati aggiuntivi
    const contigenMatch = this.findContigenMatch(codice);
    if (contigenMatch) {
      return {
        codice,
        nome: contigenMatch.descrizione || `Conto ${codice}`,
        contigenData: contigenMatch,
        matchType: 'fallback',
        confidence: 70
      };
    }

    // 5. Nessun match trovato - restituisce dati minimi
    return {
      codice,
      nome: `Conto ${codice}`,
      matchType: 'none',
      confidence: 0
    };
  }

  /**
   * Cerca match per sigla (per gestire SIGLA CONTO da PNRIGCON)
   */
  private findSiglaMatch(sigla: string): ContoEnricchito | null {
    const contigenMatch = this.contigenCache.find(c => 
      c.sigla && c.sigla.toLowerCase() === sigla.toLowerCase()
    );

    if (contigenMatch) {
      return {
        codice: contigenMatch.codifica,
        nome: contigenMatch.descrizione,
        contigenData: contigenMatch,
        matchType: 'exact',
        confidence: 95
      };
    }

    return null;
  }

  /**
   * Batch lookup per più conti contemporaneamente
   */
  async lookupConti(codiciConti: string[]): Promise<Map<string, ContoEnricchito>> {
    await this.initialize();
    
    const results = new Map<string, ContoEnricchito>();
    
    for (const codice of codiciConti) {
      const result = await this.lookupConto(codice);
      if (result) {
        results.set(codice, result);
      }
    }
    
    return results;
  }

  /**
   * Match parziale per codici simili
   */
  private findPartialMatch(codice: string): ContoEnricchito | null {
    // Cerca match parziali nella cache
    for (const [key, value] of this.contiCache.entries()) {
      // Match inizio stringa (es. "2010000038" matches "201000003*")
      if (key.startsWith(codice.substring(0, Math.min(6, codice.length))) && codice.length >= 4) {
        return {
          ...value,
          matchType: 'partial',
          confidence: 75
        };
      }
      
      // Match per lunghezza ridotta (es. "201000" matches "2010000038")
      if (codice.length >= 6 && key.includes(codice.substring(0, 6))) {
        return {
          ...value,
          matchType: 'partial', 
          confidence: 70
        };
      }
    }
    
    return null;
  }

  /**
   * Cerca match nei dati CONTIGEN
   */
  private findContigenMatch(codice: string): ContigenData | null {
    return this.contigenCache.find(c => 
      c.codifica === codice || 
      c.codifica.includes(codice) ||
      codice.includes(c.codifica)
    ) || null;
  }


  /**
   * Ottieni statistiche del servizio
   */
  getStats() {
    return {
      contiCached: this.contiCache.size,
      contigenEntries: this.contigenCache.length,
      initialized: this.initialized
    };
  }

  /**
   * Pulisce la cache (utile per testing o refresh)
   */
  clearCache(): void {
    this.contiCache.clear();
    this.contigenCache = [];
    this.initialized = false;
  }
}

// Singleton instance per riuso
let lookupServiceInstance: ContiGenLookupService | null = null;

export function getContiGenLookupService(prisma: PrismaClient): ContiGenLookupService {
  if (!lookupServiceInstance) {
    lookupServiceInstance = new ContiGenLookupService(prisma);
  }
  return lookupServiceInstance;
}