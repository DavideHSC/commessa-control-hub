import { PrismaClient } from '@prisma/client';

export interface AnagraficaPreviewRecord {
  id: string;
  codiceTestata: string;  // clienteFornitoreSigla dalla testata
  codiceAnagrafica: string | null;  // codiceAnagrafica trovato in StagingAnagrafica
  denominazione: string | null;  // denominazione dall'anagrafica
  sottocontoCliente: string | null;  // dalla anagrafica
  sottocontoFornitore: string | null;  // dalla anagrafica
  tipoAnagrafica: 'CLIENTE' | 'FORNITORE';  // dal tipoConto
  hasMatch: boolean;  // se è stata trovata corrispondenza
  testataId: string;  // ID della testata per reference
  anagraficaId: string | null;  // ID dell'anagrafica se trovata
}

export interface AnagrafichePreviewData {
  records: AnagraficaPreviewRecord[];
  totalTestate: number;
  matchedCount: number;
  unmatchedCount: number;
  clientiCount: number;
  fornitoriCount: number;
}

export class AnagrafichePreviewService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Genera preview import anagrafiche confrontando testate con anagrafiche staging
   */
  async getAnagrafichePreview(): Promise<AnagrafichePreviewData> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 AnagrafichePreviewService: Avvio analisi preview import anagrafiche...');
      
      // 1. Estrai tutti i clienteFornitoreSigla dalle testate con conti Cliente/Fornitore
      const testateConAnagrafiche = await this.extractTestateConAnagrafiche();
      console.log(`📊 Trovate ${testateConAnagrafiche.length} testate con anagrafiche`);
      
      // 2. Per ogni testata, cerca corrispondenza nelle anagrafiche staging
      const previewRecords = await this.buildPreviewRecords(testateConAnagrafiche);
      
      // 3. Calcola statistiche
      const stats = this.calculateStats(previewRecords);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AnagrafichePreviewService: Elaborati ${previewRecords.length} record in ${processingTime}ms`);
      console.log(`📊 Stats: ${stats.matchedCount} matched, ${stats.unmatchedCount} unmatched`);
      
      return {
        records: previewRecords,
        totalTestate: previewRecords.length,
        ...stats
      };
      
    } catch (error) {
      console.error('❌ Error in AnagrafichePreviewService:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Estrae tutte le testate che hanno clienteFornitoreSigla per conti C/F
   */
  private async extractTestateConAnagrafiche(): Promise<Array<{
    testataId: string;
    clienteFornitoreSigla: string;
    tipoAnagrafica: 'CLIENTE' | 'FORNITORE';
    righeContabiliCount: number;
  }>> {
    console.log('🔍 Estraendo testate con anagrafiche dalle righe contabili...');
    
    // Query semplificata per debuggare
    const righeConAnagrafiche = await this.prisma.stagingRigaContabile.findMany({
      select: {
        id: true,
        codiceUnivocoScaricamento: true,
        clienteFornitoreSigla: true,
        tipoConto: true
      },
      where: {
        tipoConto: {
          in: ['C', 'F'] // Solo clienti e fornitori
        }
      },
      take: 10 // Limita per il debug
    });

    console.log(`📊 Trovate ${righeConAnagrafiche.length} righe contabili con anagrafiche`);

    // Aggrega per testata e clienteFornitoreSigla
    const testateMap = new Map<string, {
      testataId: string;
      clienteFornitoreSigla: string;
      tipoAnagrafica: 'CLIENTE' | 'FORNITORE';
      righeContabiliCount: number;
    }>();

    righeConAnagrafiche.forEach(riga => {
      // Skip righe senza clienteFornitoreSigla
      if (!riga.clienteFornitoreSigla || riga.clienteFornitoreSigla.trim() === '') return;
      
      const key = `${riga.codiceUnivocoScaricamento}-${riga.clienteFornitoreSigla}-${riga.tipoConto}`;
      
      if (testateMap.has(key)) {
        testateMap.get(key)!.righeContabiliCount++;
      } else {
        testateMap.set(key, {
          testataId: riga.codiceUnivocoScaricamento, // Uso il codice invece dell'ID
          clienteFornitoreSigla: riga.clienteFornitoreSigla!,
          tipoAnagrafica: riga.tipoConto === 'C' ? 'CLIENTE' : 'FORNITORE',
          righeContabiliCount: 1
        });
      }
    });

    const result = Array.from(testateMap.values());
    console.log(`🎯 Identificate ${result.length} combinazioni unique testata-anagrafica`);
    
    return result;
  }

  /**
   * Per ogni testata, costruisce il record di preview cercando corrispondenza nelle anagrafiche
   */
  private async buildPreviewRecords(
    testateConAnagrafiche: Array<{
      testataId: string;
      clienteFornitoreSigla: string;
      tipoAnagrafica: 'CLIENTE' | 'FORNITORE';
      righeContabiliCount: number;
    }>
  ): Promise<AnagraficaPreviewRecord[]> {
    console.log('🔗 Costruendo record di preview con matching...');
    
    const previewRecords: AnagraficaPreviewRecord[] = [];
    let matchedCount = 0;

    for (const testata of testateConAnagrafiche) {
      try {
        // Cerca corrispondenza nell'anagrafica staging
        const anagraficaMatch = await this.findAnagraficaMatch(
          testata.clienteFornitoreSigla,
          testata.tipoAnagrafica
        );

        const hasMatch = anagraficaMatch !== null;
        if (hasMatch) matchedCount++;

        const record: AnagraficaPreviewRecord = {
          id: `${testata.testataId}-${testata.clienteFornitoreSigla}-${testata.tipoAnagrafica}`,
          codiceTestata: testata.clienteFornitoreSigla,
          codiceAnagrafica: anagraficaMatch?.codiceAnagrafica || null,
          denominazione: anagraficaMatch?.denominazione || null,
          sottocontoCliente: anagraficaMatch?.sottocontoCliente || null,
          sottocontoFornitore: anagraficaMatch?.sottocontoFornitore || null,
          tipoAnagrafica: testata.tipoAnagrafica,
          hasMatch,
          testataId: testata.testataId,
          anagraficaId: anagraficaMatch?.id || null
        };

        previewRecords.push(record);
        
      } catch (error) {
        console.warn(`⚠️ Errore elaborazione testata ${testata.testataId}:`, error);
        
        // Fallback record senza match
        previewRecords.push({
          id: `${testata.testataId}-${testata.clienteFornitoreSigla}-${testata.tipoAnagrafica}`,
          codiceTestata: testata.clienteFornitoreSigla,
          codiceAnagrafica: null,
          denominazione: null,
          sottocontoCliente: null,
          sottocontoFornitore: null,
          tipoAnagrafica: testata.tipoAnagrafica,
          hasMatch: false,
          testataId: testata.testataId,
          anagraficaId: null
        });
      }
    }

    console.log(`🎯 Preview completata: ${matchedCount}/${testateConAnagrafiche.length} matched`);
    return previewRecords;
  }

  /**
   * Cerca corrispondenza nell'anagrafica staging usando clienteFornitoreSigla → codiceAnagrafica
   */
  private async findAnagraficaMatch(
    clienteFornitoreSigla: string,
    tipoAnagrafica: 'CLIENTE' | 'FORNITORE'
  ): Promise<{
    id: string;
    codiceAnagrafica: string;
    denominazione: string;
    sottocontoCliente: string | null;
    sottocontoFornitore: string | null;
  } | null> {
    console.log(`🔍 Cercando match per ${tipoAnagrafica} con sigla: "${clienteFornitoreSigla}"`);
    
    try {
      // Cerca nell'anagrafica staging usando codiceAnagrafica
      const anagraficaMatch = await this.prisma.stagingAnagrafica.findFirst({
        where: {
          AND: [
            { 
              tipoSoggetto: tipoAnagrafica === 'CLIENTE' ? 'C' : 'F' 
            },
            {
              codiceAnagrafica: clienteFornitoreSigla.trim()
            }
          ]
        },
        select: {
          id: true,
          codiceAnagrafica: true,
          denominazione: true,
          sottocontoCliente: true,
          sottocontoFornitore: true,
          tipoSoggetto: true
        }
      });

      if (anagraficaMatch) {
        console.log(`✅ Match trovato per ${tipoAnagrafica}: "${anagraficaMatch.denominazione}"`);
        return {
          id: anagraficaMatch.id,
          codiceAnagrafica: anagraficaMatch.codiceAnagrafica || clienteFornitoreSigla,
          denominazione: anagraficaMatch.denominazione || 'N/A',
          sottocontoCliente: anagraficaMatch.sottocontoCliente,
          sottocontoFornitore: anagraficaMatch.sottocontoFornitore
        };
      }

      console.log(`❌ Nessun match trovato per ${tipoAnagrafica} con sigla: "${clienteFornitoreSigla}"`);
      return null;
      
    } catch (error) {
      console.warn('⚠️ Errore ricerca match anagrafica:', error);
      return null;
    }
  }

  /**
   * Calcola statistiche sui record di preview
   */
  private calculateStats(records: AnagraficaPreviewRecord[]) {
    const matchedCount = records.filter(r => r.hasMatch).length;
    const unmatchedCount = records.length - matchedCount;
    const clientiCount = records.filter(r => r.tipoAnagrafica === 'CLIENTE').length;
    const fornitoriCount = records.filter(r => r.tipoAnagrafica === 'FORNITORE').length;

    return {
      matchedCount,
      unmatchedCount,
      clientiCount,
      fornitoriCount
    };
  }
}