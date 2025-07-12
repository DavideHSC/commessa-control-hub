import { 
  pnTestaDefinitions,
  pnRigConDefinitions,
  pnRigIvaVecchioDefinitions,
  pnRigIvaNuovoDefinitions,
  movAnacDefinitions,
} from '../../acquisition/definitions/scrittureContabiliDefinitions';
import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../../lib/fixedWidthParser';
import { DLQService } from '../../persistence/dlq/DLQService';
import { ImportJob } from '../../core/jobs/ImportJob';
import { TelemetryService } from '../../core/telemetry/TelemetryService';
import {
  rawPnTestaSchema,
  rawPnRigConSchema,
  rawPnRigIvaSchema,
  rawMovAnacSchema,
} from '../../acquisition/validators/scrittureContabiliValidator';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - WORKFLOW ORCHESTRATOR
// =============================================================================
// Questo è il cuore del parser più complesso del sistema (⭐⭐⭐⭐⭐).
// Coordina il parsing, validazione, trasformazione e persistenza di 4 file
// interconnessi mantenendo integrità transazionale assoluta.
//
// FLUSSO:
// 1. ACQUISIZIONE: Parsing type-safe dei 4 file
// 2. VALIDAZIONE: Validazione Zod con gestione errori
// 3. TRASFORMAZIONE: Logica business pura multi-file
// 4. PERSISTENZA: Pattern staging-commit con transazioni atomiche
// =============================================================================

// -----------------------------------------------------------------------------
// TIPI E INTERFACCE
// -----------------------------------------------------------------------------

export interface ScrittureContabiliFiles {
  pnTesta: Buffer;
  pnRigCon: Buffer;
  pnRigIva?: Buffer;
  movAnac?: Buffer;
}

// Interfaccia per statistiche di creazione delle entità
interface EntityCreationStat {
  count: number;
  sample: { id: string; nome: string }[];
}

export interface ImportScrittureContabiliResult {
  success: boolean;
  jobId: string;
  stats: {
    filesProcessed: number;
    testateStaging: number;
    righeContabiliStaging: number;
    righeIvaStaging: number;
    allocazioniStaging: number;
    erroriValidazione: number;
  };
  message: string;
}

interface RawData {
  pnTesta: Record<string, unknown>[];
  pnRigCon: Record<string, unknown>[];
  pnRigIva: Record<string, unknown>[];
  movAnac: Record<string, unknown>[];
}

// -----------------------------------------------------------------------------
// SERVIZI DIPENDENTI
// -----------------------------------------------------------------------------

export class ImportScrittureContabiliWorkflow {

  constructor(
    private prisma: PrismaClient,
    private dlqService: DLQService,
    private telemetryService: TelemetryService
  ) {}

  // ---------------------------------------------------------------------------
  // METODO PRINCIPALE
  // ---------------------------------------------------------------------------

  /**
   * Importa le scritture contabili da 4 file interconnessi
   * Implementa pattern staging-commit per garantire atomicità
   */
  async execute(files: ScrittureContabiliFiles): Promise<ImportScrittureContabiliResult> {
    const job = ImportJob.create('import_scritture_contabili');
    const startTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 PARSER 6: SCRITTURE CONTABILI - Avvio Import Multi-File');
    console.log('='.repeat(80));
    
    this.telemetryService.logJobStart(job);

    try {
      // FASE 1: ACQUISIZIONE
      console.log('\n📋 FASE 1: ACQUISIZIONE DATI');
      console.log('─'.repeat(50));
      console.log('🔍 DEBUG: File ricevuti:');
      console.log('  - pnTesta:', files.pnTesta ? files.pnTesta.length + ' bytes' : 'MISSING');
      console.log('  - pnRigCon:', files.pnRigCon ? files.pnRigCon.length + ' bytes' : 'MISSING');
      console.log('  - pnRigIva:', files.pnRigIva ? files.pnRigIva.length + ' bytes' : 'MISSING');
      console.log('  - movAnac:', files.movAnac ? files.movAnac.length + ' bytes' : 'MISSING');
      
      this.telemetryService.logInfo(job.id, 'Iniziando parsing multi-file...');
      const rawData = await this.parseMultiFiles(files, job.id);
      
      const totalRawRecords = rawData.pnTesta.length + rawData.pnRigCon.length + 
                             rawData.pnRigIva.length + rawData.movAnac.length;
      
      console.log(`✅ Parsing completato:`);
      console.log(`   📄 PNTESTA.TXT:   ${rawData.pnTesta.length.toString().padStart(4)} record (testate)`);
      console.log(`   📄 PNRIGCON.TXT:  ${rawData.pnRigCon.length.toString().padStart(4)} record (righe contabili)`);
      console.log(`   📄 PNRIGIVA.TXT:  ${rawData.pnRigIva.length.toString().padStart(4)} record (righe IVA)`);
      console.log(`   📄 MOVANAC.TXT:   ${rawData.movAnac.length.toString().padStart(4)} record (allocazioni)`);
      console.log(`   📊 TOTALE:        ${totalRawRecords.toString().padStart(4)} record estratti`);

      // FASE 2: VALIDAZIONE
      console.log('\n🔍 FASE 2: VALIDAZIONE E PULIZIA DATI');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando validazione dati...');
      const validatedData = await this.validateMultiFileData(rawData, job.id);
      const errorCount = await this.dlqService.countErrorsForJob(job.id);
      
      console.log(`✅ Validazione completata:`);
      console.log(`   ✓ Testate valide:        ${validatedData.testate.length.toString().padStart(4)} / ${rawData.pnTesta.length}`);
      console.log(`   ✓ Righe contabili valide: ${validatedData.righeContabili.length.toString().padStart(4)} / ${rawData.pnRigCon.length}`);
      console.log(`   ✓ Righe IVA valide:      ${validatedData.righeIva.length.toString().padStart(4)} / ${rawData.pnRigIva.length}`);
      console.log(`   ✓ Allocazioni valide:    ${validatedData.allocazioni.length.toString().padStart(4)} / ${rawData.movAnac.length}`);
      console.log(`   📊 TOTALE VALIDI:        ${totalRawRecords.toString().padStart(4)} record`);
      console.log(`   ❌ Record scartati:       ${errorCount.toString().padStart(4)} record (→ DLQ)`);

      // FASE 3: MAPPATURA PER LO STAGING (con conversione a stringa)
      const { testate, righeContabili, righeIva, allocazioni } = validatedData;
      this.telemetryService.logInfo(job.id, 'Iniziando mappatura verso modelli di staging...');

      const toString = (val: unknown): string => val?.toString() ?? '';

      // Estraggo l'esercizio e il codice azienda per usarli come filtro
      // Prendo il primo record come riferimento, assumendo che sia consistente per tutto il file
      const riferimento = testate.length > 0 ? testate[0] : {};
      const esercizio = toString(riferimento.esercizio) || new Date().getFullYear().toString();
      const codiceAzienda = toString(riferimento.codiceFiscaleAzienda) || '';
      
      const externalIds = testate.map(t => t.externalId).filter((id): id is string => !!id);

      const stagingTestate = testate.map((t) => ({
        importJobId: job.id,
        codiceUnivocoScaricamento: toString(t.externalId),
        
        // MAPPING CORRETTO da campi validati a schema Prisma
        esercizio: toString(t.esercizio) || esercizio, // Usa l'esercizio del record o quello di riferimento
        codiceAzienda: toString(t.codiceFiscaleAzienda) || codiceAzienda, // Usa il codiceAzienda del record o quello di riferimento
        codiceCausale: toString(t.causaleId),
        descrizioneCausale: toString(t.descrizioneCausale),
        dataRegistrazione: toString(t.dataRegistrazione),
        tipoRegistroIva: toString(t.tipoRegistroIva),
        clienteFornitoreCodiceFiscale: toString(t.clienteFornitoreCodiceFiscale),
        clienteFornitoreSigla: toString(t.clienteFornitoreSigla),
        dataDocumento: toString(t.dataDocumento),
        numeroDocumento: toString(t.numeroDocumento),
        totaleDocumento: toString(t.totaleDocumento),
        noteMovimento: toString(t.noteMovimento),
        dataRegistroIva: toString(t.dataRegistroIva),
        dataCompetenzaLiquidIva: toString(t.dataCompetenzaLiquidIva),
        dataCompetenzaContabile: toString(t.dataCompetenzaContabile),
        dataPlafond: toString(t.dataPlafond),
        annoProRata: toString(t.annoProRata),
        ritenute: toString(t.ritenute),
        protocolloRegistroIva: toString(t.protocolloNumero),

        // CAMPI OBBLIGATORI CON DEFAULT VUOTO
        esigibilitaIva: '', 
        flagQuadrSchedaContabile: '',
        flagStampaRegIva: '',
      }));

      const stagingRigheContabili = righeContabili.map((r) => ({
        // RIMOSSO importJobId e rigaIdentifier CHE NON ESISTONO NELLO SCHEMA
        codiceUnivocoScaricamento: toString(r.externalId),
        externalId: toString(r.externalId),
        progressivoRigo: toString(r.progressivoRigo),
        tipoConto: toString(r.tipoConto),
        conto: toString(r.conto),
        importoDare: toString(r.importoDare),
        importoAvere: toString(r.importoAvere),
        note: toString(r.note),
        clienteFornitoreCodiceFiscale: toString(r.clienteFornitoreCodiceFiscale),
        clienteFornitoreSubcodice: toString(r.clienteFornitoreSubcodice),
        clienteFornitoreSigla: toString(r.clienteFornitoreSigla),
        insDatiCompetenzaContabile: toString(r.insDatiCompetenzaContabile),
        dataInizioCompetenza: toString(r.dataInizioCompetenza),
        dataFineCompetenza: toString(r.dataFineCompetenza),
        dataRegistrazioneApertura: toString(r.dataRegistrazioneApertura),
        dataInizioCompetenzaAnalit: toString(r.dataInizioCompetenzaAnalit),
        dataFineCompetenzaAnalit: toString(r.dataFineCompetenzaAnalit),
      }));

      const stagingRigheIva = righeIva.map((r, index) => ({
        importJobId: job.id,
        codiceUnivocoScaricamento: toString(r.externalId),

        // CALCOLO PROGRESSIVO E IDENTIFICATORE UNIVOCO
        riga: (index + 1).toString(),
        rigaIdentifier: `${toString(r.externalId)}-${index + 1}`,

        // MAPPING CORRETTO
        codiceIva: toString(r.codiceIva),
        contropartita: toString(r.contropartita),
        imponibile: toString(r.imponibile),
        imposta: toString(r.imposta),
        importoLordo: toString(r.importoLordo),
        impostaNonConsiderata: toString(r.impostaNonConsiderata),
        note: toString(r.note),
        siglaContropartita: toString(r.siglaContropartita),
      }));

      const stagingAllocazioni = allocazioni.map((a, index) => ({
        // RIMOSSO importJobId CHE NON ESISTE NELLO SCHEMA
        codiceUnivocoScaricamento: toString(a.externalId),
        externalId: toString(a.externalId),
        progressivoRigoContabile: toString(a.progressivoRigoContabile),
        centroDiCosto: toString(a.codiceContoAnalitico), // Mapping corretto da Zod a Prisma
        parametro: toString(a.parametro),
        progressivoNumeroRigoCont: toString(a.progressivoRigoContabile),
        allocazioneIdentifier: `${toString(a.externalId)}-${toString(a.progressivoRigoContabile)}-${index}`,
      }));

      this.telemetryService.logInfo(job.id, 'Mappatura completata.');

      // FASE 4: CARICAMENTO NELLO STAGING DB
      this.telemetryService.logInfo(job.id, 'Iniziando caricamento in staging DB...', {
        'app.importer.esercizio': esercizio,
        'app.importer.codice_azienda': codiceAzienda,
        'app.importer.testate_count': stagingTestate.length,
        'app.importer.righe_contabili_count': stagingRigheContabili.length,
        'app.importer.righe_iva_count': stagingRigheIva.length,
        'app.importer.allocazioni_count': stagingAllocazioni.length,
      });

      // Pulizia selettiva basata su esercizio e codice azienda
      await this.prisma.$transaction([
        this.prisma.stagingTestata.deleteMany({ 
          where: { 
            AND: [
              { esercizio: esercizio },
              { codiceAzienda: codiceAzienda }
            ]
          } 
        }),
        this.prisma.stagingRigaContabile.deleteMany({ 
          where: { 
            codiceUnivocoScaricamento: { in: externalIds }
          } 
        }),
        this.prisma.stagingRigaIva.deleteMany({ 
          where: { 
            codiceUnivocoScaricamento: { in: externalIds }
          } 
        }),
        this.prisma.stagingAllocazione.deleteMany({ 
          where: { 
            codiceUnivocoScaricamento: { in: externalIds }
          } 
        }),
      ]);

      await this.prisma.stagingTestata.createMany({ data: stagingTestate, skipDuplicates: true });
      await this.prisma.stagingRigaContabile.createMany({ data: stagingRigheContabili, skipDuplicates: true });
      await this.prisma.stagingRigaIva.createMany({ data: stagingRigheIva, skipDuplicates: true });
      await this.prisma.stagingAllocazione.createMany({ data: stagingAllocazioni, skipDuplicates: true });

      this.telemetryService.logInfo(job.id, 'Persistenza su tabelle di staging completata.');

      const endTime = Date.now();
      const duration = endTime - startTime;
      const recordsPerSecond = Math.round((totalRawRecords / duration) * 1000);

      // Costruisci risultato successo
      const result: ImportScrittureContabiliResult = {
        success: true,
        jobId: job.id,
        stats: {
          filesProcessed: this.countProcessedFiles(files),
          testateStaging: stagingTestate.length,
          righeContabiliStaging: stagingRigheContabili.length,
          righeIvaStaging: stagingRigheIva.length,
          allocazioniStaging: stagingAllocazioni.length,
          erroriValidazione: errorCount,
        },
        message: `Importazione nello staging completata con successo. ${stagingTestate.length} testate caricate.`,
      };

      // RIEPILOGO FINALE
      console.log('\n🎉 RIEPILOGO FINALE');
      console.log('='.repeat(80));
      console.log(`✅ Import completato con successo in ${duration}ms (${recordsPerSecond} record/secondo)`);
      console.log('📈 STATISTICHE DI CREAZIONE:');
      console.log(`   - Scritture: ${result.stats.testateStaging}`);
      console.log(`   - Fornitori: ${result.stats.righeContabiliStaging}`);
      console.log(`   - Causali:   ${result.stats.righeIvaStaging}`);
      console.log(`   - Conti:     ${result.stats.allocazioniStaging}`);
      console.log(`   - Codici IVA: ${result.stats.erroriValidazione}`);
      console.log('='.repeat(80) + '\n');
      
      this.telemetryService.logJobSuccess(job, result.stats);

      return result;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('\n❌ ERRORE DURANTE L\'IMPORT');
      console.log('='.repeat(80));
      console.log(`💥 Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      console.log(`⏱️  Durata parziale: ${duration}ms`);
      console.log(`🔍 Job ID: ${job.id}`);
      console.log('='.repeat(80) + '\n');
      
      this.telemetryService.logJobError(job, error);
      
      return {
        success: false,
        jobId: job.id,
        stats: {
          filesProcessed: 0,
          testateStaging: 0,
          righeContabiliStaging: 0,
          righeIvaStaging: 0,
          allocazioniStaging: 0,
          erroriValidazione: await this.dlqService.countErrorsForJob(job.id),
        },
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante l\'importazione.',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  

  // ---------------------------------------------------------------------------
  // FASE 1: ACQUISIZIONE - PARSING MULTI-FILE
  // ---------------------------------------------------------------------------

  

  private async parseMultiFiles(files: ScrittureContabiliFiles, jobId: string) {
    // FASE 1: ACQUISIZIONE - Usa le definizioni statiche e corrette
    this.telemetryService.logInfo(jobId, 'Utilizzando definizioni di campo statiche dal codice.');

    const pnTestaRaw = parseFixedWidth<Record<string, unknown>>(
      files.pnTesta.toString('utf-8'),
      pnTestaDefinitions
    );

    const pnRigConRaw = parseFixedWidth<Record<string, unknown>>(
      files.pnRigCon.toString('utf-8'),
      pnRigConDefinitions
    );
    
    // Rilevamento automatico del formato per PNRIGIVA
    let parsedRigheIva: Record<string, unknown>[] = [];
    if (files.pnRigIva) {
      const righeIvaContent = files.pnRigIva.toString('utf-8');
      const firstLine = righeIvaContent.split('\n')[0];
      
      // Il tracciato nuovo/esteso è più lungo di 170 caratteri.
      const definition = (firstLine && firstLine.length > 170) 
        ? pnRigIvaNuovoDefinitions 
        : pnRigIvaVecchioDefinitions;
      
      const definitionName = definition === pnRigIvaNuovoDefinitions ? 'NUOVO/ESTESO' : 'VECCHIO/STANDARD';
      this.telemetryService.logInfo(jobId, `Rilevato formato PNRIGIVA: ${definitionName}. Applico la definizione di parsing corrispondente.`);

      parsedRigheIva = parseFixedWidth(righeIvaContent, definition);
    }

    const movAnacRaw = files.movAnac
      ? parseFixedWidth<Record<string, unknown>>(files.movAnac.toString('utf-8'), movAnacDefinitions)
      : [];

    return {
      pnTesta: pnTestaRaw,
      pnRigCon: pnRigConRaw,
      pnRigIva: parsedRigheIva,
      movAnac: movAnacRaw,
    };
  }

  // ---------------------------------------------------------------------------
  // FASE 2: VALIDAZIONE MULTI-FILE
  // ---------------------------------------------------------------------------

  private async validateMultiFileData(rawData: RawData, jobId: string) {
    const validatedData = {
      testate: [] as Record<string, unknown>[],
      righeContabili: [] as Record<string, unknown>[],
      righeIva: [] as Record<string, unknown>[],
      allocazioni: [] as Record<string, unknown>[],
    };

    // Valida PNTESTA.TXT
    for (let i = 0; i < rawData.pnTesta.length; i++) {
      try {
        const validationResult = rawPnTestaSchema.safeParse(rawData.pnTesta[i]);
        if (validationResult.success) {
          validatedData.testate.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNTESTA.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNTESTA.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', error);
      }
    }

    // Valida PNRIGCON.TXT
    for (let i = 0; i < rawData.pnRigCon.length; i++) {
      try {
        const validationResult = rawPnRigConSchema.safeParse(rawData.pnRigCon[i]);
        if (validationResult.success) {
          validatedData.righeContabili.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNRIGCON.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNRIGCON.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', error);
      }
    }

    // Valida PNRIGIVA.TXT
    for (let i = 0; i < rawData.pnRigIva.length; i++) {
      try {
        const validationResult = rawPnRigIvaSchema.safeParse(rawData.pnRigIva[i]);
        if (validationResult.success) {
          validatedData.righeIva.push(validationResult.data);
        } else {
          console.error(`Errore validazione PNRIGIVA.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione PNRIGIVA.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', error);
      }
    }

    // Valida MOVANAC.TXT
    for (let i = 0; i < rawData.movAnac.length; i++) {
      try {
        const validationResult = rawMovAnacSchema.safeParse(rawData.movAnac[i]);
        if (validationResult.success) {
          validatedData.allocazioni.push(validationResult.data);
        } else {
          console.error(`Errore validazione MOVANAC.TXT riga ${i + 1}:`, JSON.stringify(validationResult.error, null, 2));
          await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', validationResult.error);
        }
      } catch (error) {
        console.error(`Errore validazione MOVANAC.TXT riga ${i + 1}:`, JSON.stringify(error, null, 2));
        await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', error);
      }
    }

    return validatedData;
  }

  // ---------------------------------------------------------------------------
  // FASE 4: PERSISTENZA STAGING-COMMIT
  // ---------------------------------------------------------------------------

  // IL METODO `persistWithStagingCommit` VIENE RIMOSSO

  // ---------------------------------------------------------------------------
  // UTILITY
  // ---------------------------------------------------------------------------

  private countProcessedFiles(files: ScrittureContabiliFiles): number {
    let count = 2; // PNTESTA e PNRIGCON sono obbligatori
    if (files.pnRigIva) count++;
    if (files.movAnac) count++;
    return count;
  }
} 