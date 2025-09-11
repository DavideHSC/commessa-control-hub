/**
 * PerformanceOptimizedCache - Risolve CRITICITÀ 5: Performance Issues
 * 
 * PROBLEMA RISOLTO: findMany() senza LIMIT causava timeout con dataset >10K
 * MovimentiContabiliService.ts:65-68 caricava tutto in memoria senza ottimizzazioni
 * 
 * SOLUZIONE: Sistema di cache intelligente con:
 * 1. Paginazione automatica per dataset grandi
 * 2. Cache LRU con TTL configurabile
 * 3. Batch loading asincrono non bloccante
 * 4. Monitoraggio performance e memoria
 */

import { PrismaClient } from '@prisma/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  size: number; // Dimensione stimata in bytes
}

interface CacheStats {
  totalEntries: number;
  totalMemoryMB: number;
  hitRate: number;
  missRate: number;
  averageQueryTimeMs: number;
  oldestEntryAge: number;
}

export class PerformanceOptimizedCache {
  private prisma: PrismaClient;
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private queryTimes: number[] = [];
  
  // Configurazione cache
  private readonly DEFAULT_TTL = 1800000; // 30 minuti
  private readonly MAX_CACHE_SIZE_MB = 100; // Limite memoria cache
  private readonly BATCH_SIZE = 1000; // Dimensione batch per paginazione
  private readonly MAX_QUERY_TIME_MS = 5000; // Timeout query

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeCacheStructures();
  }

  /**
   * Inizializza le strutture cache per ogni tabella
   */
  private initializeCacheStructures(): void {
    const tables = [
      'stagingConto',
      'stagingCausaleContabile', 
      'stagingAnagrafica',
      'stagingCodiceIva',
      'stagingCentroCosto'
    ];
    
    tables.forEach(table => {
      this.caches.set(table, new Map());
    });
  }

  /**
   * Carica lookup tables con ottimizzazioni performance
   * SOSTITUISCE: MovimentiContabiliService.loadLookupTables()
   */
  async loadOptimizedLookupTables(): Promise<{
    contiMap: Map<string, any>;
    causaliMap: Map<string, any>;
    anagraficheMap: Map<string, any>;
    codiciIvaMap: Map<string, any>;
    centriCostoMap: Map<string, any>;
    stats: {
      loadTimeMs: number;
      totalRecords: number;
      cacheHits: number;
      fromDatabase: number;
    };
  }> {
    
    const startTime = Date.now();
    console.log('🚀 PerformanceOptimizedCache: Loading lookup tables...');
    
    let totalRecords = 0;
    let fromDatabase = 0;
    let cacheHitsCount = 0;

    // Caricamento parallelo ottimizzato per tutte le tabelle
    const [conti, causali, anagrafiche, codiciIva, centriCosto] = await Promise.all([
      this.loadTableWithOptimization('stagingConto', { 
        keyFields: ['codice', 'sigla'],
        maxRecords: 50000 
      }),
      this.loadTableWithOptimization('stagingCausaleContabile', {
        keyFields: ['codiceCausale'],
        maxRecords: 5000
      }),
      this.loadTableWithOptimization('stagingAnagrafica', {
        keyFields: ['codiceAnagrafica', 'codiceFiscaleClifor'],
        maxRecords: 100000
      }),
      this.loadTableWithOptimization('stagingCodiceIva', {
        keyFields: ['codice'],
        maxRecords: 1000
      }),
      this.loadTableWithOptimization('stagingCentroCosto', {
        keyFields: ['codice'],
        maxRecords: 10000
      })
    ]);

    // Costruzione mappe ottimizzate
    const contiMap = this.buildOptimizedMap(conti.data, ['codice', 'sigla']);
    const causaliMap = this.buildOptimizedMap(causali.data, ['codiceCausale']);
    const anagraficheMap = this.buildOptimizedMap(anagrafiche.data, ['codiceAnagrafica', 'codiceFiscaleClifor']);
    const codiciIvaMap = this.buildOptimizedMap(codiciIva.data, ['codice']);
    const centriCostoMap = this.buildOptimizedMap(centriCosto.data, ['codice']);

    // Statistiche
    totalRecords = conti.recordCount + causali.recordCount + anagrafiche.recordCount + 
                   codiciIva.recordCount + centriCosto.recordCount;
    
    fromDatabase = conti.fromCache ? 0 : conti.recordCount +
                   (causali.fromCache ? 0 : causali.recordCount) +
                   (anagrafiche.fromCache ? 0 : anagrafiche.recordCount) +
                   (codiciIva.fromCache ? 0 : codiciIva.recordCount) +
                   (centriCosto.fromCache ? 0 : centriCosto.recordCount);

    cacheHitsCount = totalRecords - fromDatabase;

    const loadTimeMs = Date.now() - startTime;
    console.log(`✅ Lookup tables loaded in ${loadTimeMs}ms - ${totalRecords} total records (${cacheHitsCount} from cache)`);

    return {
      contiMap,
      causaliMap, 
      anagraficheMap,
      codiciIvaMap,
      centriCostoMap,
      stats: {
        loadTimeMs,
        totalRecords,
        cacheHits: cacheHitsCount,
        fromDatabase
      }
    };
  }

  /**
   * Carica una tabella con ottimizzazioni automatiche
   */
  private async loadTableWithOptimization(
    tableName: string,
    options: {
      keyFields: string[];
      maxRecords: number;
      ttl?: number;
    }
  ): Promise<{
    data: any[];
    recordCount: number;
    fromCache: boolean;
    loadTimeMs: number;
  }> {
    
    const startTime = Date.now();
    const cacheKey = `${tableName}_full`;
    
    // 1. Verifica cache prima
    const cached = this.getCachedData(tableName, cacheKey, options.ttl);
    if (cached) {
      this.cacheHits++;
      return {
        data: cached,
        recordCount: cached.length,
        fromCache: true,
        loadTimeMs: Date.now() - startTime
      };
    }

    // 2. Caricamento ottimizzato dal database
    try {
      console.log(`📊 Loading ${tableName} from database...`);
      
      // Prima, conta i record per decidere strategia
      const totalCount = await this.getTableCount(tableName);
      console.log(`📊 ${tableName}: ${totalCount} records to load`);

      let allData: any[] = [];

      if (totalCount > this.BATCH_SIZE) {
        // Caricamento batch per tabelle grandi
        allData = await this.loadTableInBatches(tableName, totalCount, options.maxRecords);
      } else {
        // Caricamento diretto per tabelle piccole
        allData = await this.loadTableDirect(tableName, options.maxRecords);
      }

      // 3. Cache dei risultati
      this.setCachedData(tableName, cacheKey, allData, options.ttl);
      this.cacheMisses++;
      
      const loadTimeMs = Date.now() - startTime;
      this.recordQueryTime(loadTimeMs);

      return {
        data: allData,
        recordCount: allData.length,
        fromCache: false,
        loadTimeMs
      };

    } catch (error) {
      console.error(`❌ Error loading ${tableName}:`, error);
      throw new Error(`Failed to load ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Caricamento batch ottimizzato per tabelle grandi
   */
  private async loadTableInBatches(
    tableName: string,
    totalCount: number,
    maxRecords: number
  ): Promise<any[]> {
    
    const batchCount = Math.min(Math.ceil(totalCount / this.BATCH_SIZE), Math.ceil(maxRecords / this.BATCH_SIZE));
    const allData: any[] = [];
    
    console.log(`📦 Loading ${tableName} in ${batchCount} batches of ${this.BATCH_SIZE}...`);

    // Caricamento batch sequenziale per controllo memoria
    for (let i = 0; i < batchCount; i++) {
      const skip = i * this.BATCH_SIZE;
      const take = Math.min(this.BATCH_SIZE, maxRecords - allData.length);
      
      if (take <= 0) break;

      try {
        const batch = await this.queryTableWithTimeout(tableName, {
          skip,
          take,
          orderBy: { id: 'asc' } // Ordinamento per consistenza paginazione
        });

        allData.push(...batch);
        
        // Progress logging ogni 10 batch
        if (i % 10 === 0 || i === batchCount - 1) {
          console.log(`📊 ${tableName}: loaded ${allData.length}/${Math.min(totalCount, maxRecords)} records`);
        }

        // Controllo limite memoria
        if (this.getCurrentCacheSizeMB() > this.MAX_CACHE_SIZE_MB * 0.8) {
          console.warn(`⚠️ Cache approaching memory limit, stopping batch load at ${allData.length} records`);
          break;
        }

      } catch (error) {
        console.error(`❌ Error in batch ${i} for ${tableName}:`, error);
        // Continua con i batch successivi invece di fallire completamente
      }
    }

    return allData;
  }

  /**
   * Caricamento diretto per tabelle piccole
   */
  private async loadTableDirect(tableName: string, maxRecords: number): Promise<any[]> {
    return await this.queryTableWithTimeout(tableName, {
      take: maxRecords
    });
  }

  /**
   * Query con timeout per prevenire hang
   */
  private async queryTableWithTimeout(tableName: string, options: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Query timeout for ${tableName} after ${this.MAX_QUERY_TIME_MS}ms`));
      }, this.MAX_QUERY_TIME_MS);

      (this.prisma as any)[tableName].findMany(options)
        .then((result: any[]) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error: any) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Ottiene conteggio tabella con cache
   */
  private async getTableCount(tableName: string): Promise<number> {
    const cacheKey = `${tableName}_count`;
    const cached = this.getCachedData(tableName, cacheKey, 300000); // 5 minuti TTL
    
    if (cached) {
      return cached;
    }

    const count = await (this.prisma as any)[tableName].count();
    this.setCachedData(tableName, cacheKey, count, 300000);
    return count;
  }

  /**
   * Costruisce mappa ottimizzata con multiple chiavi
   */
  private buildOptimizedMap(data: any[], keyFields: string[]): Map<string, any> {
    const map = new Map<string, any>();
    
    for (const item of data) {
      for (const field of keyFields) {
        if (item[field]) {
          map.set(item[field], item);
        }
      }
    }

    return map;
  }

  /**
   * Cache management con LRU e TTL
   */
  private getCachedData(tableName: string, key: string, ttl: number = this.DEFAULT_TTL): any | null {
    const tableCache = this.caches.get(tableName);
    if (!tableCache) return null;

    const entry = tableCache.get(key);
    if (!entry) return null;

    // Verifica TTL
    if (Date.now() - entry.timestamp > ttl) {
      tableCache.delete(key);
      return null;
    }

    // Aggiorna hit count per LRU
    entry.hitCount++;
    return entry.data;
  }

  private setCachedData(tableName: string, key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const tableCache = this.caches.get(tableName);
    if (!tableCache) return;

    const size = this.estimateDataSize(data);
    
    // Controllo limite memoria
    if (this.getCurrentCacheSizeMB() + (size / 1024 / 1024) > this.MAX_CACHE_SIZE_MB) {
      this.evictLeastUsedEntries(tableName);
    }

    tableCache.set(key, {
      data,
      timestamp: Date.now(),
      hitCount: 0,
      size
    });
  }

  /**
   * LRU eviction quando cache piena
   */
  private evictLeastUsedEntries(tableName: string): void {
    const tableCache = this.caches.get(tableName);
    if (!tableCache) return;

    const entries = Array.from(tableCache.entries());
    
    // Ordina per hit count e età
    entries.sort(([, a], [, b]) => {
      const aScore = a.hitCount / (Date.now() - a.timestamp + 1);
      const bScore = b.hitCount / (Date.now() - b.timestamp + 1);
      return aScore - bScore;
    });

    // Rimuovi bottom 25% delle entry
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      tableCache.delete(entries[i][0]);
    }

    console.log(`🧹 Cache cleanup: removed ${toRemove} entries from ${tableName}`);
  }

  /**
   * Utilities di monitoring
   */
  private estimateDataSize(data: any): number {
    // Stima approssimativa dimensione JSON
    return JSON.stringify(data).length * 2; // *2 per overhead oggetti JS
  }

  private getCurrentCacheSizeMB(): number {
    let totalSize = 0;
    
    for (const tableCache of this.caches.values()) {
      for (const entry of tableCache.values()) {
        totalSize += entry.size;
      }
    }
    
    return totalSize / 1024 / 1024;
  }

  private recordQueryTime(timeMs: number): void {
    this.queryTimes.push(timeMs);
    
    // Mantieni solo ultime 100 misurazioni
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
  }

  /**
   * Ottieni statistiche cache per monitoring
   */
  getCacheStats(): CacheStats {
    let totalEntries = 0;
    let oldestTimestamp = Date.now();

    for (const tableCache of this.caches.values()) {
      totalEntries += tableCache.size;
      
      for (const entry of tableCache.values()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
      }
    }

    const totalQueries = this.cacheHits + this.cacheMisses;
    const hitRate = totalQueries > 0 ? this.cacheHits / totalQueries : 0;
    const averageQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length 
      : 0;

    return {
      totalEntries,
      totalMemoryMB: this.getCurrentCacheSizeMB(),
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round((1 - hitRate) * 100) / 100,
      averageQueryTimeMs: Math.round(averageQueryTime),
      oldestEntryAge: Math.round((Date.now() - oldestTimestamp) / 1000)
    };
  }

  /**
   * Pulisce tutta la cache
   */
  clearCache(): void {
    for (const tableCache of this.caches.values()) {
      tableCache.clear();
    }
    console.log('🧹 All caches cleared');
  }
}

export default PerformanceOptimizedCache;