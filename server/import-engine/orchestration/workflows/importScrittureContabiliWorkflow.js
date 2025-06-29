"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportScrittureContabiliWorkflow = void 0;
var scrittureContabiliDefinitions_1 = require("../../acquisition/definitions/scrittureContabiliDefinitions");
var fixedWidthParser_1 = require("../../../lib/fixedWidthParser");
var ImportJob_1 = require("../../core/jobs/ImportJob");
var scrittureContabiliValidator_1 = require("../../acquisition/validators/scrittureContabiliValidator");
var scrittureContabiliTransformer_1 = require("../../transformation/transformers/scrittureContabiliTransformer");
// -----------------------------------------------------------------------------
// SERVIZI DIPENDENTI
// -----------------------------------------------------------------------------
var ImportScrittureContabiliWorkflow = /** @class */ (function () {
    function ImportScrittureContabiliWorkflow(prisma, dlqService, telemetryService) {
        this.prisma = prisma;
        this.dlqService = dlqService;
        this.telemetryService = telemetryService;
    }
    // ---------------------------------------------------------------------------
    // METODO PRINCIPALE
    // ---------------------------------------------------------------------------
    /**
     * Importa le scritture contabili da 4 file interconnessi
     * Implementa pattern staging-commit per garantire atomicità
     */
    ImportScrittureContabiliWorkflow.prototype.execute = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var job, startTime, rawData, totalRawRecords, validatedData, totalValidRecords, errorCount, transformResult, endTime, duration, recordsPerSecond, result, error_1, endTime, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        job = ImportJob_1.ImportJob.create('import_scritture_contabili');
                        startTime = Date.now();
                        console.log('\n' + '='.repeat(80));
                        console.log('🚀 PARSER 6: SCRITTURE CONTABILI - Avvio Import Multi-File');
                        console.log('='.repeat(80));
                        this.telemetryService.logJobStart(job);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        // FASE 1: ACQUISIZIONE - Parsing type-safe dei 4 file
                        console.log('\n📋 FASE 1: ACQUISIZIONE DATI');
                        console.log('─'.repeat(50));
                        console.log('🔍 DEBUG: File ricevuti:');
                        console.log('  - pnTesta:', files.pnTesta ? files.pnTesta.length + ' bytes' : 'MISSING');
                        console.log('  - pnRigCon:', files.pnRigCon ? files.pnRigCon.length + ' bytes' : 'MISSING');
                        console.log('  - pnRigIva:', files.pnRigIva ? files.pnRigIva.length + ' bytes' : 'MISSING');
                        console.log('  - movAnac:', files.movAnac ? files.movAnac.length + ' bytes' : 'MISSING');
                        this.telemetryService.logInfo(job.id, 'Iniziando parsing multi-file...');
                        return [4 /*yield*/, this.parseMultiFiles(files, job.id)];
                    case 2:
                        rawData = _a.sent();
                        totalRawRecords = rawData.pnTesta.length + rawData.pnRigCon.length +
                            rawData.pnRigIva.length + rawData.movAnac.length;
                        console.log("\u2705 Parsing completato:");
                        console.log("   \uD83D\uDCC4 PNTESTA.TXT:   ".concat(rawData.pnTesta.length.toString().padStart(4), " record (testate)"));
                        console.log("   \uD83D\uDCC4 PNRIGCON.TXT:  ".concat(rawData.pnRigCon.length.toString().padStart(4), " record (righe contabili)"));
                        console.log("   \uD83D\uDCC4 PNRIGIVA.TXT:  ".concat(rawData.pnRigIva.length.toString().padStart(4), " record (righe IVA)"));
                        console.log("   \uD83D\uDCC4 MOVANAC.TXT:   ".concat(rawData.movAnac.length.toString().padStart(4), " record (allocazioni)"));
                        console.log("   \uD83D\uDCCA TOTALE:        ".concat(totalRawRecords.toString().padStart(4), " record estratti"));
                        // FASE 2: VALIDAZIONE - Validazione Zod con error handling
                        console.log('\n🔍 FASE 2: VALIDAZIONE E PULIZIA DATI');
                        console.log('─'.repeat(50));
                        this.telemetryService.logInfo(job.id, 'Iniziando validazione dati...');
                        return [4 /*yield*/, this.validateMultiFileData(rawData, job.id)];
                    case 3:
                        validatedData = _a.sent();
                        totalValidRecords = validatedData.testate.length + validatedData.righeContabili.length +
                            validatedData.righeIva.length + validatedData.allocazioni.length;
                        return [4 /*yield*/, this.dlqService.countErrorsForJob(job.id)];
                    case 4:
                        errorCount = _a.sent();
                        console.log("\u2705 Validazione completata:");
                        console.log("   \u2713 Testate valide:        ".concat(validatedData.testate.length.toString().padStart(4), " / ").concat(rawData.pnTesta.length));
                        console.log("   \u2713 Righe contabili valide: ".concat(validatedData.righeContabili.length.toString().padStart(4), " / ").concat(rawData.pnRigCon.length));
                        console.log("   \u2713 Righe IVA valide:      ".concat(validatedData.righeIva.length.toString().padStart(4), " / ").concat(rawData.pnRigIva.length));
                        console.log("   \u2713 Allocazioni valide:    ".concat(validatedData.allocazioni.length.toString().padStart(4), " / ").concat(rawData.movAnac.length));
                        console.log("   \uD83D\uDCCA TOTALE VALIDI:        ".concat(totalValidRecords.toString().padStart(4), " record"));
                        console.log("   \u274C Record scartati:       ".concat(errorCount.toString().padStart(4), " record (\u2192 DLQ)"));
                        // FASE 3: TRASFORMAZIONE - Logica business pura
                        console.log('\n🔄 FASE 3: TRASFORMAZIONE BUSINESS LOGIC');
                        console.log('─'.repeat(50));
                        this.telemetryService.logInfo(job.id, 'Iniziando trasformazione business logic...');
                        transformResult = (0, scrittureContabiliTransformer_1.transformScrittureContabili)(validatedData.testate, validatedData.righeContabili, validatedData.righeIva, validatedData.allocazioni);
                        console.log("\u2705 Trasformazione completata:");
                        console.log("   \uD83D\uDCDD Scritture create:        ".concat(transformResult.stats.entitaCreate.scritture.toString().padStart(4)));
                        console.log("   \uD83D\uDCB0 Righe contabili create:  ".concat(transformResult.stats.entitaCreate.righeScrittura.toString().padStart(4)));
                        console.log("   \uD83D\uDCCA Righe IVA create:        ".concat(transformResult.stats.entitaCreate.righeIva.toString().padStart(4)));
                        console.log("   \uD83C\uDFED Allocazioni create:      ".concat(transformResult.stats.entitaCreate.allocazioni.toString().padStart(4)));
                        // FASE 4: PERSISTENZA - Pattern staging-commit atomico
                        console.log('\n💾 FASE 4: PERSISTENZA ATOMICA');
                        console.log('─'.repeat(50));
                        this.telemetryService.logInfo(job.id, 'Iniziando persistenza con staging-commit...');
                        return [4 /*yield*/, this.persistWithStagingCommit(transformResult, job.id)];
                    case 5:
                        _a.sent();
                        endTime = Date.now();
                        duration = endTime - startTime;
                        recordsPerSecond = Math.round((totalValidRecords / duration) * 1000);
                        result = {
                            success: true,
                            jobId: job.id,
                            stats: {
                                filesProcessed: this.countProcessedFiles(files),
                                scrittureImportate: transformResult.stats.entitaCreate.scritture,
                                righeContabiliOrganizzate: transformResult.stats.entitaCreate.righeScrittura,
                                righeIvaOrganizzate: transformResult.stats.entitaCreate.righeIva,
                                allocazioniOrganizzate: transformResult.stats.entitaCreate.allocazioni,
                                erroriValidazione: errorCount,
                                fornitoriCreati: transformResult.stats.entitaCreate.fornitori,
                                causaliCreate: transformResult.stats.entitaCreate.causali,
                            },
                            message: "Import completato con successo. ".concat(transformResult.stats.entitaCreate.scritture, " scritture importate."),
                        };
                        // RIEPILOGO FINALE
                        console.log('\n🎉 RIEPILOGO FINALE');
                        console.log('='.repeat(80));
                        console.log("\u2705 Import completato con successo in ".concat(duration, "ms"));
                        console.log("\uD83D\uDCCA Performance: ".concat(recordsPerSecond, " record/secondo"));
                        console.log("\n\uD83D\uDCC8 STATISTICHE FINALI:");
                        console.log("   \uD83C\uDFAF Scritture contabili create:  ".concat(result.stats.scrittureImportate.toString().padStart(4)));
                        console.log("   \uD83C\uDFE2 Fornitori creati:            ".concat(result.stats.fornitoriCreati.toString().padStart(4)));
                        console.log("   \uD83D\uDCCB Causali contabili create:    ".concat(result.stats.causaliCreate.toString().padStart(4)));
                        console.log("   \uD83D\uDCB0 Righe contabili elaborate:   ".concat(result.stats.righeContabiliOrganizzate.toString().padStart(4)));
                        console.log("   \uD83C\uDFED Allocazioni elaborate:       ".concat(result.stats.allocazioniOrganizzate.toString().padStart(4)));
                        console.log("   \u274C Record con errori (DLQ):     ".concat(result.stats.erroriValidazione.toString().padStart(4)));
                        console.log("\n\uD83D\uDE80 ARCHITETTURA ENTERPRISE: Parser 6/6 COMPLETATO!");
                        console.log('='.repeat(80) + '\n');
                        this.telemetryService.logJobSuccess(job, result.stats);
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _a.sent();
                        endTime = Date.now();
                        duration = endTime - startTime;
                        console.log('\n❌ ERRORE DURANTE L\'IMPORT');
                        console.log('='.repeat(80));
                        console.log("\uD83D\uDCA5 Errore: ".concat(error_1 instanceof Error ? error_1.message : 'Errore sconosciuto'));
                        console.log("\u23F1\uFE0F  Durata parziale: ".concat(duration, "ms"));
                        console.log("\uD83D\uDD0D Job ID: ".concat(job.id));
                        console.log('='.repeat(80) + '\n');
                        this.telemetryService.logJobError(job, error_1);
                        return [2 /*return*/, {
                                success: false,
                                jobId: job.id,
                                stats: {
                                    filesProcessed: 0,
                                    scrittureImportate: 0,
                                    righeContabiliOrganizzate: 0,
                                    righeIvaOrganizzate: 0,
                                    allocazioniOrganizzate: 0,
                                    erroriValidazione: 0,
                                    fornitoriCreati: 0,
                                    causaliCreate: 0,
                                },
                                message: "Errore durante l'import: ".concat(error_1 instanceof Error ? error_1.message : 'Errore sconosciuto'),
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // ---------------------------------------------------------------------------
    // HELPER METHODS
    // ---------------------------------------------------------------------------
    // ---------------------------------------------------------------------------
    // FASE 1: ACQUISIZIONE - PARSING MULTI-FILE
    // ---------------------------------------------------------------------------
    ImportScrittureContabiliWorkflow.prototype.parseMultiFiles = function (files, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var pnTestaRaw, pnRigConRaw, pnRigIvaRaw, movAnacRaw;
            return __generator(this, function (_a) {
                // FASE 1: ACQUISIZIONE - Usa le definizioni statiche e corrette
                this.telemetryService.logInfo(jobId, 'Utilizzando definizioni di campo statiche dal codice.');
                pnTestaRaw = (0, fixedWidthParser_1.parseFixedWidth)(files.pnTesta.toString('utf-8'), scrittureContabiliDefinitions_1.pnTestaDefinitions);
                pnRigConRaw = (0, fixedWidthParser_1.parseFixedWidth)(files.pnRigCon.toString('utf-8'), scrittureContabiliDefinitions_1.pnRigConDefinitions);
                pnRigIvaRaw = files.pnRigIva
                    ? (0, fixedWidthParser_1.parseFixedWidth)(files.pnRigIva.toString('utf-8'), scrittureContabiliDefinitions_1.pnRigIvaDefinitions)
                    : [];
                movAnacRaw = files.movAnac
                    ? (0, fixedWidthParser_1.parseFixedWidth)(files.movAnac.toString('utf-8'), scrittureContabiliDefinitions_1.movAnacDefinitions)
                    : [];
                return [2 /*return*/, {
                        pnTesta: pnTestaRaw,
                        pnRigCon: pnRigConRaw,
                        pnRigIva: pnRigIvaRaw,
                        movAnac: movAnacRaw,
                    }];
            });
        });
    };
    // ---------------------------------------------------------------------------
    // FASE 2: VALIDAZIONE MULTI-FILE
    // ---------------------------------------------------------------------------
    ImportScrittureContabiliWorkflow.prototype.validateMultiFileData = function (rawData, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedData, i, validated, error_2, i, validated, error_3, i, validated, error_4, i, validated, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validatedData = {
                            testate: [],
                            righeContabili: [],
                            righeIva: [],
                            allocazioni: [],
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < rawData.pnTesta.length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 3, , 5]);
                        validated = scrittureContabiliValidator_1.validatedPnTestaSchema.parse(rawData.pnTesta[i]);
                        validatedData.testate.push(validated);
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        return [4 /*yield*/, this.dlqService.logError(jobId, 'PNTESTA.TXT', i + 1, rawData.pnTesta[i], 'validation', error_2)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        i = 0;
                        _a.label = 7;
                    case 7:
                        if (!(i < rawData.pnRigCon.length)) return [3 /*break*/, 12];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 9, , 11]);
                        validated = scrittureContabiliValidator_1.validatedPnRigConSchema.parse(rawData.pnRigCon[i]);
                        validatedData.righeContabili.push(validated);
                        return [3 /*break*/, 11];
                    case 9:
                        error_3 = _a.sent();
                        return [4 /*yield*/, this.dlqService.logError(jobId, 'PNRIGCON.TXT', i + 1, rawData.pnRigCon[i], 'validation', error_3)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        i++;
                        return [3 /*break*/, 7];
                    case 12:
                        i = 0;
                        _a.label = 13;
                    case 13:
                        if (!(i < rawData.pnRigIva.length)) return [3 /*break*/, 18];
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 15, , 17]);
                        validated = scrittureContabiliValidator_1.validatedPnRigIvaSchema.parse(rawData.pnRigIva[i]);
                        validatedData.righeIva.push(validated);
                        return [3 /*break*/, 17];
                    case 15:
                        error_4 = _a.sent();
                        return [4 /*yield*/, this.dlqService.logError(jobId, 'PNRIGIVA.TXT', i + 1, rawData.pnRigIva[i], 'validation', error_4)];
                    case 16:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 17:
                        i++;
                        return [3 /*break*/, 13];
                    case 18:
                        i = 0;
                        _a.label = 19;
                    case 19:
                        if (!(i < rawData.movAnac.length)) return [3 /*break*/, 24];
                        _a.label = 20;
                    case 20:
                        _a.trys.push([20, 21, , 23]);
                        validated = scrittureContabiliValidator_1.validatedMovAnacSchema.parse(rawData.movAnac[i]);
                        validatedData.allocazioni.push(validated);
                        return [3 /*break*/, 23];
                    case 21:
                        error_5 = _a.sent();
                        return [4 /*yield*/, this.dlqService.logError(jobId, 'MOVANAC.TXT', i + 1, rawData.movAnac[i], 'validation', error_5)];
                    case 22:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 23:
                        i++;
                        return [3 /*break*/, 19];
                    case 24: return [2 /*return*/, validatedData];
                }
            });
        });
    };
    // ---------------------------------------------------------------------------
    // FASE 4: PERSISTENZA STAGING-COMMIT
    // ---------------------------------------------------------------------------
    ImportScrittureContabiliWorkflow.prototype.persistWithStagingCommit = function (transformResult, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.telemetryService.logInfo(jobId, '💾 PERSISTENZA COMPLETA: Salvataggio di tutte le entità');
                        // Usa una transazione per garantire atomicità completa (timeout esteso)
                        return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, fornitore, _b, _c, causale, _d, _e, conto, _f, _g, codiceIva, _h, _j, commessa, _k, _l, voce, _m, _o, scrittura, _p, _q, riga, _r, _s, rigaIva, _t, _u, allocazione;
                                return __generator(this, function (_v) {
                                    switch (_v.label) {
                                        case 0:
                                            // 🧹 PULIZIA TABELLE (rispetta ordine foreign keys)
                                            this.telemetryService.logInfo(jobId, '🧹 Pulizia tabelle in ordine FK...');
                                            // Prima: tabelle dipendenti
                                            return [4 /*yield*/, tx.allocazione.deleteMany({})];
                                        case 1:
                                            // Prima: tabelle dipendenti
                                            _v.sent();
                                            return [4 /*yield*/, tx.rigaIva.deleteMany({})];
                                        case 2:
                                            _v.sent();
                                            return [4 /*yield*/, tx.rigaScrittura.deleteMany({})];
                                        case 3:
                                            _v.sent();
                                            return [4 /*yield*/, tx.scritturaContabile.deleteMany({})];
                                        case 4:
                                            _v.sent();
                                            // Poi: staging (se esistono)
                                            return [4 /*yield*/, tx.importAllocazione.deleteMany({})];
                                        case 5:
                                            // Poi: staging (se esistono)
                                            _v.sent();
                                            return [4 /*yield*/, tx.importScritturaRigaIva.deleteMany({})];
                                        case 6:
                                            _v.sent();
                                            return [4 /*yield*/, tx.importScritturaRigaContabile.deleteMany({})];
                                        case 7:
                                            _v.sent();
                                            return [4 /*yield*/, tx.importScritturaTestata.deleteMany({})];
                                        case 8:
                                            _v.sent();
                                            this.telemetryService.logInfo(jobId, '✅ Tutte le tabelle pulite');
                                            // 1. CREA ENTITÀ DIPENDENTI (in ordine di dipendenza)
                                            this.telemetryService.logInfo(jobId, "\uD83C\uDFE2 Creazione ".concat(transformResult.fornitori.length, " fornitori..."));
                                            _i = 0, _a = transformResult.fornitori;
                                            _v.label = 9;
                                        case 9:
                                            if (!(_i < _a.length)) return [3 /*break*/, 12];
                                            fornitore = _a[_i];
                                            return [4 /*yield*/, tx.fornitore.upsert({
                                                    where: { id: fornitore.id },
                                                    update: {},
                                                    create: fornitore,
                                                })];
                                        case 10:
                                            _v.sent();
                                            _v.label = 11;
                                        case 11:
                                            _i++;
                                            return [3 /*break*/, 9];
                                        case 12:
                                            this.telemetryService.logInfo(jobId, "\uD83D\uDCCB Creazione ".concat(transformResult.causali.length, " causali..."));
                                            _b = 0, _c = transformResult.causali;
                                            _v.label = 13;
                                        case 13:
                                            if (!(_b < _c.length)) return [3 /*break*/, 16];
                                            causale = _c[_b];
                                            return [4 /*yield*/, tx.causaleContabile.upsert({
                                                    where: { id: causale.id },
                                                    update: {},
                                                    create: causale,
                                                })];
                                        case 14:
                                            _v.sent();
                                            _v.label = 15;
                                        case 15:
                                            _b++;
                                            return [3 /*break*/, 13];
                                        case 16:
                                            this.telemetryService.logInfo(jobId, "\uD83C\uDFE6 Creazione ".concat(transformResult.conti.length, " conti..."));
                                            _d = 0, _e = transformResult.conti;
                                            _v.label = 17;
                                        case 17:
                                            if (!(_d < _e.length)) return [3 /*break*/, 20];
                                            conto = _e[_d];
                                            return [4 /*yield*/, tx.conto.upsert({
                                                    where: { id: conto.id },
                                                    update: {},
                                                    create: conto,
                                                })];
                                        case 18:
                                            _v.sent();
                                            _v.label = 19;
                                        case 19:
                                            _d++;
                                            return [3 /*break*/, 17];
                                        case 20:
                                            this.telemetryService.logInfo(jobId, "\uD83D\uDCCA Creazione ".concat(transformResult.codiciIva.length, " codici IVA..."));
                                            _f = 0, _g = transformResult.codiciIva;
                                            _v.label = 21;
                                        case 21:
                                            if (!(_f < _g.length)) return [3 /*break*/, 24];
                                            codiceIva = _g[_f];
                                            return [4 /*yield*/, tx.codiceIva.upsert({
                                                    where: { id: codiceIva.id },
                                                    update: {},
                                                    create: codiceIva,
                                                })];
                                        case 22:
                                            _v.sent();
                                            _v.label = 23;
                                        case 23:
                                            _f++;
                                            return [3 /*break*/, 21];
                                        case 24:
                                            this.telemetryService.logInfo(jobId, "\uD83C\uDFED Creazione ".concat(transformResult.commesse.length, " commesse..."));
                                            _h = 0, _j = transformResult.commesse;
                                            _v.label = 25;
                                        case 25:
                                            if (!(_h < _j.length)) return [3 /*break*/, 28];
                                            commessa = _j[_h];
                                            return [4 /*yield*/, tx.commessa.upsert({
                                                    where: { id: commessa.id },
                                                    update: {},
                                                    create: commessa,
                                                })];
                                        case 26:
                                            _v.sent();
                                            _v.label = 27;
                                        case 27:
                                            _h++;
                                            return [3 /*break*/, 25];
                                        case 28:
                                            this.telemetryService.logInfo(jobId, "\uD83D\uDCC8 Creazione ".concat(transformResult.vociAnalitiche.length, " voci analitiche..."));
                                            _k = 0, _l = transformResult.vociAnalitiche;
                                            _v.label = 29;
                                        case 29:
                                            if (!(_k < _l.length)) return [3 /*break*/, 32];
                                            voce = _l[_k];
                                            return [4 /*yield*/, tx.voceAnalitica.upsert({
                                                    where: { id: voce.id },
                                                    update: {},
                                                    create: voce,
                                                })];
                                        case 30:
                                            _v.sent();
                                            _v.label = 31;
                                        case 31:
                                            _k++;
                                            return [3 /*break*/, 29];
                                        case 32:
                                            // 2. CREA SCRITTURE CONTABILI (testate)
                                            this.telemetryService.logInfo(jobId, "\uD83D\uDCDD Creazione ".concat(transformResult.scritture.length, " scritture contabili..."));
                                            _m = 0, _o = transformResult.scritture;
                                            _v.label = 33;
                                        case 33:
                                            if (!(_m < _o.length)) return [3 /*break*/, 36];
                                            scrittura = _o[_m];
                                            return [4 /*yield*/, tx.scritturaContabile.create({ data: scrittura })];
                                        case 34:
                                            _v.sent();
                                            _v.label = 35;
                                        case 35:
                                            _m++;
                                            return [3 /*break*/, 33];
                                        case 36:
                                            // 3. CREA RIGHE SCRITTURA (righe contabili)
                                            this.telemetryService.logInfo(jobId, "\uD83D\uDCB0 Creazione ".concat(transformResult.righeScrittura.length, " righe contabili..."));
                                            _p = 0, _q = transformResult.righeScrittura;
                                            _v.label = 37;
                                        case 37:
                                            if (!(_p < _q.length)) return [3 /*break*/, 40];
                                            riga = _q[_p];
                                            return [4 /*yield*/, tx.rigaScrittura.create({ data: riga })];
                                        case 38:
                                            _v.sent();
                                            _v.label = 39;
                                        case 39:
                                            _p++;
                                            return [3 /*break*/, 37];
                                        case 40:
                                            // 4. CREA RIGHE IVA
                                            this.telemetryService.logInfo(jobId, "\uD83E\uDDFE Creazione ".concat(transformResult.righeIva.length, " righe IVA..."));
                                            _r = 0, _s = transformResult.righeIva;
                                            _v.label = 41;
                                        case 41:
                                            if (!(_r < _s.length)) return [3 /*break*/, 44];
                                            rigaIva = _s[_r];
                                            return [4 /*yield*/, tx.rigaIva.create({ data: rigaIva })];
                                        case 42:
                                            _v.sent();
                                            _v.label = 43;
                                        case 43:
                                            _r++;
                                            return [3 /*break*/, 41];
                                        case 44:
                                            // 5. CREA ALLOCAZIONI
                                            this.telemetryService.logInfo(jobId, "\uD83C\uDFAF Creazione ".concat(transformResult.allocazioni.length, " allocazioni..."));
                                            _t = 0, _u = transformResult.allocazioni;
                                            _v.label = 45;
                                        case 45:
                                            if (!(_t < _u.length)) return [3 /*break*/, 48];
                                            allocazione = _u[_t];
                                            return [4 /*yield*/, tx.allocazione.create({ data: allocazione })];
                                        case 46:
                                            _v.sent();
                                            _v.label = 47;
                                        case 47:
                                            _t++;
                                            return [3 /*break*/, 45];
                                        case 48:
                                            this.telemetryService.logInfo(jobId, '✅ PERSISTENZA COMPLETA: Tutte le entità salvate con successo!');
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, {
                                timeout: 60000, // 60 secondi timeout
                            })];
                    case 1:
                        // Usa una transazione per garantire atomicità completa (timeout esteso)
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ---------------------------------------------------------------------------
    // UTILITY
    // ---------------------------------------------------------------------------
    ImportScrittureContabiliWorkflow.prototype.countProcessedFiles = function (files) {
        var count = 2; // PNTESTA e PNRIGCON sono obbligatori
        if (files.pnRigIva)
            count++;
        if (files.movAnac)
            count++;
        return count;
    };
    return ImportScrittureContabiliWorkflow;
}());
exports.ImportScrittureContabiliWorkflow = ImportScrittureContabiliWorkflow;
