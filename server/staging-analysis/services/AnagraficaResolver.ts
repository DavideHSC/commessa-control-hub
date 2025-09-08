import { PrismaClient } from '@prisma/client';
import { VirtualAnagrafica, AnagraficheResolutionData } from '../types/virtualEntities.js';
import { getTipoAnagrafica, calculateMatchConfidence, createRecordHash } from '../utils/stagingDataHelpers.js';

export class AnagraficaResolver {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Risolve tutte le anagrafiche dai dati staging senza creare entità fake
   * Logica INTERPRETATIVA - lavora direttamente sui dati staging
   */
  async resolveAnagrafiche(): Promise<AnagraficheResolutionData> {
    const startTime = Date.now();
    
    try {
      // 1. Estrae tutte le anagrafiche uniche dai dati staging
      const stagingAnagrafiche = await this.extractUniqueAnagrafiche();
      
      // 2. Per ogni anagrafica staging, cerca match nel database
      const anagraficheRisolte = await this.matchWithExistingEntities(stagingAnagrafiche);
      
      // 3. Calcola statistiche
      const matchedCount = anagraficheRisolte.filter(a => a.matchedEntity !== null).length;
      const unmatchedCount = anagraficheRisolte.length - matchedCount;
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ AnagraficaResolver: Processed ${anagraficheRisolte.length} anagrafiche in ${processingTime}ms`);
      
      return {
        anagrafiche: anagraficheRisolte,
        totalRecords: anagraficheRisolte.length,
        matchedRecords: matchedCount,
        unmatchedRecords: unmatchedCount
      };
      
    } catch (error) {
      console.error('❌ Error in AnagraficaResolver:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Estrae anagrafiche uniche dai record staging
   */
  private async extractUniqueAnagrafiche(): Promise<Array<{
    codiceFiscale: string;
    sigla: string;
    subcodice: string;
    tipo: 'CLIENTE' | 'FORNITORE';
    sourceRows: number;
  }>> {
    // Query sui dati staging per estrarre tutte le anagrafiche
    const righeContabili = await this.prisma.stagingRigaContabile.findMany({
      select: {
        tipoConto: true,
        clienteFornitoreCodiceFiscale: true,
        clienteFornitoreSigla: true,
        clienteFornitoreSubcodice: true
      },
      where: {
        tipoConto: {
          in: ['C', 'F'] // Solo clienti e fornitori
        }
      }
    });

    // Mappa per rimozione duplicati e conteggio occorrenze
    const anagraficheMap = new Map<string, {
      codiceFiscale: string;
      sigla: string;
      subcodice: string;
      tipo: 'CLIENTE' | 'FORNITORE';
      sourceRows: number;
    }>();

    righeContabili.forEach(riga => {
      const tipo = getTipoAnagrafica(riga.tipoConto);
      if (!tipo) return;

      const codiceFiscale = riga.clienteFornitoreCodiceFiscale?.trim() || '';
      const sigla = riga.clienteFornitoreSigla?.trim() || '';
      const subcodice = riga.clienteFornitoreSubcodice?.trim() || '';

      // Skip se dati insufficienti
      if (!codiceFiscale && !sigla) return;

      // Crea hash per identificare record unico
      const hash = createRecordHash([tipo, codiceFiscale, sigla, subcodice]);

      if (anagraficheMap.has(hash)) {
        anagraficheMap.get(hash)!.sourceRows++;
      } else {
        anagraficheMap.set(hash, {
          codiceFiscale,
          sigla,
          subcodice,
          tipo,
          sourceRows: 1
        });
      }
    });

    return Array.from(anagraficheMap.values());
  }

  /**
   * Matcha le anagrafiche staging con le entità esistenti nel database
   */
  private async matchWithExistingEntities(
    stagingAnagrafiche: Array<{
      codiceFiscale: string;
      sigla: string;
      subcodice: string;
      tipo: 'CLIENTE' | 'FORNITORE';
      sourceRows: number;
    }>
  ): Promise<VirtualAnagrafica[]> {
    const virtualAnagrafiche: VirtualAnagrafica[] = [];

    // Carica tutte le entità esistenti per batch matching
    const [clienti, fornitori] = await Promise.all([
      this.prisma.cliente.findMany({
        select: { id: true, nome: true, codiceFiscale: true, nomeAnagrafico: true }
      }),
      this.prisma.fornitore.findMany({
        select: { id: true, nome: true, codiceFiscale: true, nomeAnagrafico: true }
      })
    ]);

    stagingAnagrafiche.forEach(staging => {
      // Determina in quale tabella cercare
      const entities = staging.tipo === 'CLIENTE' ? clienti : fornitori;
      
      let bestMatch: { id: string; nome: string } | null = null;
      let bestConfidence = 0;

      // Cerca il match migliore
      entities.forEach(entity => {
        const confidence = calculateMatchConfidence(
          {
            clienteFornitoreCodiceFiscale: staging.codiceFiscale,
            clienteFornitoreSigla: staging.sigla,
            clienteFornitoreSubcodice: staging.subcodice
          },
          {
            codiceFiscale: entity.codiceFiscale,
            ragioneSociale: entity.nomeAnagrafico || entity.nome, // Usa nomeAnagrafico come fallback
            nome: entity.nome
          }
        );

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = {
            id: entity.id,
            nome: entity.nomeAnagrafico || entity.nome
          };
        }
      });

      // Solo match con confidence > 0.5
      if (bestConfidence < 0.5) {
        bestMatch = null;
        bestConfidence = 0;
      }

      virtualAnagrafiche.push({
        codiceFiscale: staging.codiceFiscale,
        sigla: staging.sigla,
        subcodice: staging.subcodice,
        tipo: staging.tipo,
        matchedEntity: bestMatch,
        matchConfidence: bestConfidence,
        sourceRows: staging.sourceRows
      });
    });

    return virtualAnagrafiche;
  }
}