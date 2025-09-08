import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser.js';
import { DLQService } from '../../persistence/dlq/DLQService.js';
import { ImportJob } from '../../core/jobs/ImportJob.js';
import { TelemetryService } from '../../core/telemetry/TelemetryService.js';
import {
  rawPnTestaSchema,
  rawPnRigConSchema,
  rawPnRigIvaSchema,
  rawMovAnacSchema,
} from '../../acquisition/validators/scrittureContabiliValidator.js';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - WORKFLOW ORCHESTRATOR (REFACTORED)
// =============================================================================
// Questo è il cuore del parser più complesso del sistema (⭐⭐⭐⭐⭐).
// Coordina il parsing, validazione, trasformazione e persistenza di 4 file
// interconnessi mantenendo integrità transazionale assoluta.
//
// FLUSSO:
// 1. ACQUISIZIONE: Parsing type-safe dei 4 file
// 2. VALIDAZIONE: Validazione Zod con gestione errori
// 3. PULIZIA STAGING: Svuotamento completo delle tabelle di staging pertinenti
// 4. MAPPATURA E PERSISTENZA: Mapping 1:1 dei dati grezzi e salvataggio
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
   * Implementa pattern "Wipe and Load" per lo staging per garantire atomicità
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
      console.log('\n🔍 FASE 2: VALIDAZIONE DATI GREZZI');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando validazione dati...');
      const validatedData = await this.validateMultiFileData(rawData, job.id);
      const errorCount = await this.dlqService.countErrorsForJob(job.id);
      
      console.log(`✅ Validazione completata:`);
      console.log(`   ✓ Testate valide:        ${validatedData.testate.length.toString().padStart(4)} / ${rawData.pnTesta.length}`);
      console.log(`   ✓ Righe contabili valide: ${validatedData.righeContabili.length.toString().padStart(4)} / ${rawData.pnRigCon.length}`);
      console.log(`   ✓ Righe IVA valide:      ${validatedData.righeIva.length.toString().padStart(4)} / ${rawData.pnRigIva.length}`);
      console.log(`   ✓ Allocazioni valide:    ${validatedData.allocazioni.length.toString().padStart(4)} / ${rawData.movAnac.length}`);
      console.log(`   📊 TOTALE VALIDI:        ${(validatedData.testate.length + validatedData.righeContabili.length + validatedData.righeIva.length + validatedData.allocazioni.length).toString().padStart(4)} record`);
      console.log(`   ❌ Record scartati:       ${errorCount.toString().padStart(4)} record (→ DLQ)`);

      // FASE 3: PULIZIA COMPLETA DELLO STAGING
      console.log('\n🧹 FASE 3: PULIZIA TABELLE DI STAGING');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando la pulizia completa delle tabelle di staging per le scritture...');
      await this.prisma.$transaction([
        this.prisma.stagingAllocazione.deleteMany({}),
        this.prisma.stagingRigaIva.deleteMany({}),
        this.prisma.stagingRigaContabile.deleteMany({}),
        this.prisma.stagingTestata.deleteMany({}),
      ]);
      console.log(`✅ Tabelle StagingAllocazione, StagingRigaIva, StagingRigaContabile e StagingTestata svuotate.`);

      // FASE 4: MAPPATURA PER LO STAGING (con conversione sicura a stringa)
      const { testate, righeContabili, righeIva, allocazioni } = validatedData;
      this.telemetryService.logInfo(job.id, 'Iniziando mappatura verso modelli di staging...');

      // Funzione helper per garantire che ogni valore sia una stringa, anche se null o undefined in origine.
      const toStringOrEmpty = (val: unknown): string => val?.toString() ?? '';

      // --- Mappatura StagingTestata ---
      const stagingTestate = testate.map((t: any) => ({
        codiceUnivocoScaricamento: toStringOrEmpty(t.externalId),
        esercizio: toStringOrEmpty(t.esercizio),
        codiceAzienda: toStringOrEmpty(t.codiceFiscaleAzienda),
        codiceCausale: toStringOrEmpty(t.causaleId),
        descrizioneCausale: toStringOrEmpty(t.descrizioneCausale),
        dataRegistrazione: toStringOrEmpty(t.dataRegistrazione),
        tipoRegistroIva: toStringOrEmpty(t.tipoRegistroIva),
        clienteFornitoreCodiceFiscale: toStringOrEmpty(t.clienteFornitoreCodiceFiscale),
        clienteFornitoreSigla: toStringOrEmpty(t.clienteFornitoreSigla),
        dataDocumento: toStringOrEmpty(t.dataDocumento),
        numeroDocumento: toStringOrEmpty(t.numeroDocumento),
        totaleDocumento: toStringOrEmpty(t.totaleDocumento),
        noteMovimento: toStringOrEmpty(t.noteMovimento),
        dataRegistroIva: toStringOrEmpty(t.dataRegistroIva),
        dataCompetenzaLiquidIva: toStringOrEmpty(t.dataCompetenzaLiquidIva),
        dataCompetenzaContabile: toStringOrEmpty(t.dataCompetenzaContabile),
        dataPlafond: toStringOrEmpty(t.dataPlafond),
        annoProRata: toStringOrEmpty(t.annoProRata),
        ritenute: toStringOrEmpty(t.ritenute),
        protocolloRegistroIva: toStringOrEmpty(t.protocolloNumero),
        // Mappatura nuovi campi
        subcodiceAzienda: toStringOrEmpty(t.subcodiceFiscaleAzienda),
        codiceAttivita: toStringOrEmpty(t.codiceAttivita),
        codiceNumerazioneIva: toStringOrEmpty(t.codiceNumerazioneIva),
        clienteFornitoreSubcodice: toStringOrEmpty(t.clienteFornitoreSubcodice),
        documentoBis: toStringOrEmpty(t.documentoBis),
        protocolloBis: toStringOrEmpty(t.protocolloBis),
        enasarco: toStringOrEmpty(t.enasarco),
        totaleInValuta: toStringOrEmpty(t.totaleInValuta),
        codiceValuta: toStringOrEmpty(t.codiceValuta),
        codiceNumerazioneIvaVendite: toStringOrEmpty(t.codiceNumerazioneIvaVendite),
        protocolloNumeroAutofattura: toStringOrEmpty(t.protocolloNumeroAutofattura),
        protocolloBisAutofattura: toStringOrEmpty(t.protocolloBisAutofattura),
        versamentoData: toStringOrEmpty(t.versamentoData),
        versamentoTipo: toStringOrEmpty(t.versamentoTipo),
        versamentoModello: toStringOrEmpty(t.versamentoModello),
        versamentoEstremi: toStringOrEmpty(t.versamentoEstremi),
        stato: toStringOrEmpty(t.stato),
        tipoGestionePartite: toStringOrEmpty(t.tipoGestionePartite),
        codicePagamento: toStringOrEmpty(t.codicePagamento),
        codiceAttivitaIvaPartita: toStringOrEmpty(t.codiceAttivitaIvaPartita),
        tipoRegistroIvaPartita: toStringOrEmpty(t.tipoRegistroIvaPartita),
        codiceNumerazioneIvaPartita: toStringOrEmpty(t.codiceNumerazioneIvaPartita),
        cliForCodiceFiscalePartita: toStringOrEmpty(t.cliForCodiceFiscalePartita),
        cliForSubcodicePartita: toStringOrEmpty(t.cliForSubcodicePartita),
        cliForSiglaPartita: toStringOrEmpty(t.cliForSiglaPartita),
        documentoDataPartita: toStringOrEmpty(t.documentoDataPartita),
        documentoNumeroPartita: toStringOrEmpty(t.documentoNumeroPartita),
        documentoBisPartita: toStringOrEmpty(t.documentoBisPartita),
        cliForIntraCodiceFiscale: toStringOrEmpty(t.cliForIntraCodiceFiscale),
        cliForIntraSubcodice: toStringOrEmpty(t.cliForIntraSubcodice),
        cliForIntraSigla: toStringOrEmpty(t.cliForIntraSigla),
        tipoMovimentoIntrastat: toStringOrEmpty(t.tipoMovimentoIntrastat),
        documentoOperazione: toStringOrEmpty(t.documentoOperazione),
      }));

      // --- Mappatura StagingRigaContabile ---
      const stagingRigheContabili = righeContabili.map((r: any) => ({
        codiceUnivocoScaricamento: toStringOrEmpty(r.externalId),
        externalId: toStringOrEmpty(r.externalId), // Mantenuto per retrocompatibilità/debug
        progressivoRigo: toStringOrEmpty(r.progressivoRigo),
        tipoConto: toStringOrEmpty(r.tipoConto),
        conto: toStringOrEmpty(r.conto),
        importoDare: toStringOrEmpty(r.importoDare),
        importoAvere: toStringOrEmpty(r.importoAvere),
        note: toStringOrEmpty(r.note),
        clienteFornitoreCodiceFiscale: toStringOrEmpty(r.clienteFornitoreCodiceFiscale),
        clienteFornitoreSubcodice: toStringOrEmpty(r.clienteFornitoreSubcodice),
        clienteFornitoreSigla: toStringOrEmpty(r.clienteFornitoreSigla),
        insDatiCompetenzaContabile: toStringOrEmpty(r.insDatiCompetenzaContabile),
        dataInizioCompetenza: toStringOrEmpty(r.dataInizioCompetenza),
        dataFineCompetenza: toStringOrEmpty(r.dataFineCompetenza),
        dataRegistrazioneApertura: toStringOrEmpty(r.dataRegistrazioneApertura),
        dataInizioCompetenzaAnalit: toStringOrEmpty(r.dataInizioCompetenzaAnalit),
        dataFineCompetenzaAnalit: toStringOrEmpty(r.dataFineCompetenzaAnalit),
        // Mappatura nuovi campi
        noteDiCompetenza: toStringOrEmpty(r.noteDiCompetenza),
        contoDaRilevareMovimento1: toStringOrEmpty(r.contoDaRilevareMovimento1),
        contoDaRilevareMovimento2: toStringOrEmpty(r.contoDaRilevareMovimento2),
        insDatiMovimentiAnalitici: toStringOrEmpty(r.insDatiMovimentiAnalitici),
        insDatiStudiDiSettore: toStringOrEmpty(r.insDatiStudiDiSettore),
        statoMovimentoStudi: toStringOrEmpty(r.statoMovimentoStudi),
        esercizioDiRilevanzaFiscale: toStringOrEmpty(r.esercizioDiRilevanzaFiscale),
        dettaglioCliForCodiceFiscale: toStringOrEmpty(r.dettaglioCliForCodiceFiscale),
        dettaglioCliForSubcodice: toStringOrEmpty(r.dettaglioCliForSubcodice),
        dettaglioCliForSigla: toStringOrEmpty(r.dettaglioCliForSigla),
        siglaConto: toStringOrEmpty(r.siglaConto),
      }));

      // --- Mappatura StagingRigaIva ---
      const stagingRigheIva = righeIva.map((r: any, index) => ({
        codiceUnivocoScaricamento: toStringOrEmpty(r.externalId),
        riga: (index + 1).toString(),
        rigaIdentifier: `${toStringOrEmpty(r.externalId)}-${index + 1}`,
        codiceIva: toStringOrEmpty(r.codiceIva),
        contropartita: toStringOrEmpty(r.contropartita),
        imponibile: toStringOrEmpty(r.imponibile),
        imposta: toStringOrEmpty(r.imposta),
        importoLordo: toStringOrEmpty(r.importoLordo),
        impostaNonConsiderata: toStringOrEmpty(r.impostaNonConsiderata),
        note: toStringOrEmpty(r.note),
        siglaContropartita: toStringOrEmpty(r.siglaContropartita),
        // Mappatura nuovi campi
        impostaIntrattenimenti: toStringOrEmpty(r.impostaIntrattenimenti),
        imponibile50CorrNonCons: toStringOrEmpty(r.imponibile50CorrNonCons),
      }));

      // --- Mappatura StagingAllocazione ---
      const stagingAllocazioni = allocazioni.map((a: any, index) => ({
        codiceUnivocoScaricamento: toStringOrEmpty(a.externalId),
        externalId: toStringOrEmpty(a.externalId), // Mantenuto per retrocompatibilità/debug
        progressivoRigoContabile: toStringOrEmpty(a.progressivoRigoContabile),
        centroDiCosto: toStringOrEmpty(a.centroDiCosto),
        parametro: toStringOrEmpty(a.parametro),
        progressivoNumeroRigoCont: toStringOrEmpty(a.progressivoRigoContabile), // Mappatura ridondante ma sicura
        allocazioneIdentifier: `${toStringOrEmpty(a.externalId)}-${toStringOrEmpty(a.progressivoRigoContabile)}-${index}`,
      }));

      this.telemetryService.logInfo(job.id, 'Mappatura completata.');

      // FASE 5: CARICAMENTO NELLO STAGING DB
      console.log('\n💾 FASE 5: CARICAMENTO DATI NELLO STAGING');
      console.log('─'.repeat(50));
      this.telemetryService.logInfo(job.id, 'Iniziando caricamento in staging DB...', {
        'app.importer.testate_count': stagingTestate.length,
        'app.importer.righe_contabili_count': stagingRigheContabili.length,
        'app.importer.righe_iva_count': stagingRigheIva.length,
        'app.importer.allocazioni_count': stagingAllocazioni.length,
      });

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
      console.log('📈 STATISTICHE DI CARICAMENTO STAGING:');
      console.log(`   - Testate Scritture:     ${result.stats.testateStaging}`);
      console.log(`   - Righe Contabili:       ${result.stats.righeContabiliStaging}`);
      console.log(`   - Righe IVA:             ${result.stats.righeIvaStaging}`);
      console.log(`   - Allocazioni Analitiche: ${result.stats.allocazioniStaging}`);
      console.log(`   - Errori di Validazione: ${result.stats.erroriValidazione}`);
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

  private async parseMultiFiles(files: ScrittureContabiliFiles, jobId: string) {
    const templateName = 'scritture_contabili';
    this.telemetryService.logInfo(jobId, `Utilizzando il template DB '${templateName}' per il parsing.`);

    const pnTestaResult = await parseFixedWidth(files.pnTesta.toString('utf-8'), templateName, 'PNTESTA.TXT');
    const pnRigConResult = await parseFixedWidth(files.pnRigCon.toString('utf-8'), templateName, 'PNRIGCON.TXT');
    
    let pnRigIvaResult = { data: [], stats: { totalRecords: 0, successfulRecords: 0, errorRecords: 0, warnings: [], errors: [] } };
    if (files.pnRigIva) {
      const righeIvaContent = files.pnRigIva.toString('utf-8');
      if (righeIvaContent.trim()) {
        const firstLine = righeIvaContent.split('\n')[0];
        const fileIdentifier = (firstLine && firstLine.length > 170) ? 'PNRIGIVA_NUOVO' : 'PNRIGIVA_VECCHIO';
        this.telemetryService.logInfo(jobId, `Rilevato formato PNRIGIVA: ${fileIdentifier}. Applico la definizione corrispondente.`);
        pnRigIvaResult = await parseFixedWidth(righeIvaContent, templateName, fileIdentifier);
      }
    }

    const movAnacResult = (files.movAnac && files.movAnac.toString('utf-8').trim())
      ? await parseFixedWidth(files.movAnac.toString('utf-8'), templateName, 'MOVANAC.TXT')
      : { data: [], stats: { totalRecords: 0, successfulRecords: 0, errorRecords: 0, warnings: [], errors: [] } };
    
    return {
      pnTesta: pnTestaResult.data,
      pnRigCon: pnRigConResult.data,
      pnRigIva: pnRigIvaResult.data,
      movAnac: movAnacResult.data,
    };
  }

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
          await this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', validationResult.error);
        }
      } catch (error) {
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
          await this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', validationResult.error);
        }
      } catch (error) {
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
          await this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', validationResult.error);
        }
      } catch (error) {
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
          await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', validationResult.error);
        }
      } catch (error) {
        await this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', error);
      }
    }

    return validatedData;
  }

  private countProcessedFiles(files: ScrittureContabiliFiles): number {
    let count = 0;
    if (files.pnTesta) count++;
    if (files.pnRigCon) count++;
    if (files.pnRigIva) count++;
    if (files.movAnac) count++;
    return count;
  }
}