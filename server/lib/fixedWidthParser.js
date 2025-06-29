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
exports.parseFixedWidth = parseFixedWidth;
exports.parseFixedWidthRobust = parseFixedWidthRobust;
var client_1 = require("@prisma/client");
var moment = require("moment");
var fs = require("fs/promises");
var prisma = new client_1.PrismaClient();
// Configurazioni di validazione per i template (Fase 2.2)
var RECORD_VALIDATIONS = {
    'causali': { expectedLength: 171, required: true },
    'codici_iva': { expectedLength: 162, required: true },
    'anagrafica_clifor': { expectedLength: 338, required: true },
    'piano_dei_conti': { expectedLength: 388, required: true },
    'condizioni_pagamento': { expectedLength: 68, required: true }
};
function getDefaultValue(type) {
    switch (type) {
        case 'number':
            return 0;
        case 'date':
            return null;
        case 'boolean':
            return false;
        case 'string':
        default:
            return '';
    }
}
// === FASE 2.1: FALLBACK ENCODING ROBUSTO ===
/**
 * Legge file con fallback su diversi encoding (basato su parser Python)
 */
function readFileWithFallbackEncoding(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var encodings, _i, encodings_1, encoding, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodings = ['utf-8', 'latin1', 'ascii'];
                    _i = 0, encodings_1 = encodings;
                    _a.label = 1;
                case 1:
                    if (!(_i < encodings_1.length)) return [3 /*break*/, 6];
                    encoding = encodings_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: encoding })];
                case 3:
                    content = _a.sent();
                    console.log("[Parser] File aperto con encoding: ".concat(encoding));
                    return [2 /*return*/, content.split(/\r?\n/)];
                case 4:
                    error_1 = _a.sent();
                    if (error_1 && typeof error_1 === 'object' && 'code' in error_1 && error_1.code === 'ENOENT') {
                        throw new Error("File non trovato: ".concat(filePath));
                    }
                    console.warn("[Parser] Encoding ".concat(encoding, " fallito, provo il prossimo..."));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: throw new Error('Nessun encoding supportato ha funzionato');
            }
        });
    });
}
// === FASE 2.2: VALIDAZIONE LUNGHEZZA RECORD ===
/**
 * Valida la lunghezza di un record (basato su pattern Python)
 */
function validateRecordLength(line, templateName, lineNumber) {
    var validation = RECORD_VALIDATIONS[templateName];
    if (!validation)
        return true; // Nessuna validazione configurata
    var cleanLine = line.replace(/\r?\n$/, '');
    var actualLength = cleanLine.length;
    if (actualLength < validation.expectedLength) {
        console.warn("[Parser] Riga ".concat(lineNumber, ": lunghezza insufficiente (").concat(actualLength, " < ").concat(validation.expectedLength, ")"));
        return !validation.required;
    }
    return true;
}
// === FASE 2.3: GESTIONE ERRORI GRACEFUL ===
/**
 * Elabora records con gestione errori robusta (pattern Python)
 */
function processWithErrorHandling(records, processor, templateName) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, data, i, line, warning, result, errorMsg;
        return __generator(this, function (_a) {
            stats = {
                totalRecords: 0,
                successfulRecords: 0,
                errorRecords: 0,
                inserted: 0,
                updated: 0,
                skipped: 0,
                warnings: [],
                errors: []
            };
            data = [];
            console.log("[Parser] Inizio elaborazione ".concat(records.length, " righe per template '").concat(templateName, "'"));
            for (i = 0; i < records.length; i++) {
                line = records[i];
                // Salta righe vuote
                if (line.trim().length === 0) {
                    continue;
                }
                stats.totalRecords++;
                try {
                    // Validazione lunghezza record
                    if (!validateRecordLength(line, templateName, i + 1)) {
                        warning = "Riga ".concat(i + 1, ": lunghezza record non valida");
                        stats.warnings.push(warning);
                        continue;
                    }
                    result = processor(line, i);
                    data.push(result);
                    stats.successfulRecords++;
                    // Log ogni 100 record (come in Python)
                    if (stats.successfulRecords % 100 === 0) {
                        console.log("[Parser] Elaborati ".concat(stats.successfulRecords, " record..."));
                    }
                }
                catch (error) {
                    stats.errorRecords++;
                    errorMsg = "Errore riga ".concat(i + 1, ": ").concat(error.message);
                    stats.errors.push(errorMsg);
                    console.error("[Parser] ".concat(errorMsg));
                    // Continua processing invece di fermarsi (graceful)
                    continue;
                }
            }
            // Statistiche finali
            console.log("[Parser] Parsing completato:");
            console.log("  - Record totali letti: ".concat(stats.totalRecords));
            console.log("  - Record elaborati con successo: ".concat(stats.successfulRecords));
            console.log("  - Record con errori: ".concat(stats.errorRecords));
            if (stats.warnings.length > 0) {
                console.log("  - Avvisi: ".concat(stats.warnings.length));
            }
            return [2 /*return*/, { data: data, stats: stats }];
        });
    });
}
/**
 * Parser boolean flag (come in Python)
 */
function parseBooleanFlag(char) {
    return char.trim().toUpperCase() === 'X';
}
/**
 * Parser decimal con gestione errori (migliorato)
 */
function parseDecimal(value, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (!value || value.trim() === '')
        return null;
    try {
        var cleanValue = value.trim().replace(',', '.');
        var numericValue = parseFloat(cleanValue);
        if (isNaN(numericValue))
            return null;
        return decimals > 0 ? Math.round(numericValue * Math.pow(10, decimals)) / Math.pow(10, decimals) : numericValue;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Parser percentage (basato su logica parser Python)
 * Converte stringhe come "002200" in 22 (percentuale)
 */
function parsePercentage(value) {
    if (!value || value.trim() === '')
        return null;
    try {
        var cleanValue = value.trim();
        var numericValue = parseInt(cleanValue, 10);
        if (isNaN(numericValue))
            return null;
        // Dividi per 100 per convertire da formato "002200" a 22
        return numericValue / 100;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Esegue il parsing di una stringa di testo a larghezza fissa.
 * VERSIONE LEGACY - mantenuta per compatibilità
 */
function parseFixedWidth(content, definitions) {
    var lines = content.split(/\r?\n/).filter(function (line) { return line.trim().length > 0; });
    var results = [];
    lines.forEach(function (line, index) {
        var record = {};
        var hasData = false;
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var def = definitions_1[_i];
            var fieldName = def.fieldName, start = def.start, length_1 = def.length, type = def.type, format = def.format;
            var name_1 = fieldName !== null && fieldName !== void 0 ? fieldName : 'unknown'; // Fallback per il nome del campo
            var startIndex = start - 1;
            if (startIndex < 0 || startIndex >= line.length) {
                record[name_1] = getDefaultValue(type);
                continue;
            }
            var rawValue = line.substring(startIndex, startIndex + length_1).trim();
            if (rawValue) {
                hasData = true;
            }
            try {
                // Gestione formato percentage
                if (format === 'percentage') {
                    record[name_1] = parsePercentage(rawValue);
                }
                else if (format === 'boolean') {
                    record[name_1] = parseBooleanFlag(rawValue);
                }
                else {
                    switch (type) {
                        case 'boolean':
                            record[name_1] = parseBooleanFlag(rawValue);
                            break;
                        case 'number':
                            record[name_1] = parseDecimal(rawValue);
                            break;
                        case 'date':
                            if (rawValue && rawValue !== '00000000') {
                                var parsedDate = moment(rawValue, 'DDMMYYYY', true);
                                record[name_1] = parsedDate.isValid() ? parsedDate.toDate() : null;
                            }
                            else {
                                record[name_1] = null;
                            }
                            break;
                        case 'string':
                        default:
                            record[name_1] = rawValue;
                            break;
                    }
                }
            }
            catch (e) {
                console.error("[Parser] Errore nella conversione del campo '".concat(name_1, "' con valore \"").concat(rawValue, "\" per la riga ").concat(index + 1, "."), e);
                record[name_1] = getDefaultValue(type);
            }
        }
        if (hasData) {
            results.push(record);
        }
    });
    console.log("[Parser] Parsing completato. ".concat(results.length, " record estratti dal file."));
    return results;
}
/**
 * Converte camelCase a UPPER_CASE con underscore per compatibilità validator
 */
function camelToUpperCase(str) {
    return str
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, ''); // Rimuove underscore iniziale se presente
}
/**
 * NUOVA VERSIONE ROBUSTA - Parsing con encoding fallback e gestione errori
 */
function parseFixedWidthRobust(filePath, definitions, templateName) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, actualDefinitions_1, template, lines, processor, error_2, stats_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stats = {
                        totalRecords: 0,
                        successfulRecords: 0,
                        errorRecords: 0,
                        inserted: 0,
                        updated: 0,
                        skipped: 0,
                        warnings: [],
                        errors: [],
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    actualDefinitions_1 = definitions;
                    if (!(definitions.length === 0 && templateName)) return [3 /*break*/, 3];
                    console.log("[Parser] Caricamento template '".concat(templateName, "' dal database..."));
                    return [4 /*yield*/, prisma.importTemplate.findUnique({
                            where: { name: templateName },
                            include: { fieldDefinitions: true }
                        })];
                case 2:
                    template = _a.sent();
                    if (!template) {
                        throw new Error("Template '".concat(templateName, "' non trovato nel database"));
                    }
                    if (template.fieldDefinitions.length === 0) {
                        throw new Error("Template '".concat(templateName, "' non ha field definitions"));
                    }
                    // Converti FieldDefinition da Prisma al formato FieldDefinition locale
                    actualDefinitions_1 = template.fieldDefinitions.map(function (field) { return ({
                        fieldName: field.fieldName ? camelToUpperCase(field.fieldName) : null,
                        start: field.start,
                        length: field.length,
                        end: field.end, // Ensure 'end' is included
                        type: 'string', // Default type
                        format: field.format ?
                            field.format :
                            undefined
                    }); });
                    console.log("[Parser] Caricato template con ".concat(actualDefinitions_1.length, " field definitions"));
                    _a.label = 3;
                case 3: return [4 /*yield*/, readFileWithFallbackEncoding(filePath)];
                case 4:
                    lines = _a.sent();
                    processor = function (line, index) {
                        var record = {};
                        var hasData = false;
                        for (var _i = 0, actualDefinitions_2 = actualDefinitions_1; _i < actualDefinitions_2.length; _i++) {
                            var def = actualDefinitions_2[_i];
                            var fieldName = def.fieldName, start = def.start, length_2 = def.length, type = def.type, format = def.format;
                            var name_2 = fieldName !== null && fieldName !== void 0 ? fieldName : 'unknown'; // Fallback per il nome del campo
                            var startIndex = start - 1;
                            if (startIndex < 0 || startIndex >= line.length) {
                                record[name_2] = getDefaultValue(type);
                                continue;
                            }
                            var rawValue = line.substring(startIndex, startIndex + length_2).trim();
                            if (rawValue) {
                                hasData = true;
                            }
                            // Gestione formato percentage
                            if (format === 'percentage') {
                                record[name_2] = parsePercentage(rawValue);
                            }
                            else if (format === 'boolean') {
                                record[name_2] = parseBooleanFlag(rawValue);
                            }
                            else {
                                switch (type) {
                                    case 'boolean':
                                        record[name_2] = parseBooleanFlag(rawValue);
                                        break;
                                    case 'number':
                                        record[name_2] = parseDecimal(rawValue);
                                        break;
                                    case 'date':
                                        if (rawValue && rawValue !== '00000000') {
                                            var parsedDate = moment(rawValue, 'DDMMYYYY', true);
                                            record[name_2] = parsedDate.isValid() ? parsedDate.toDate() : null;
                                        }
                                        else {
                                            record[name_2] = null;
                                        }
                                        break;
                                    case 'string':
                                    default:
                                        record[name_2] = rawValue;
                                        break;
                                }
                            }
                        }
                        if (!hasData) {
                            throw new Error('Record vuoto o senza dati validi');
                        }
                        return record;
                    };
                    return [4 /*yield*/, processWithErrorHandling(lines, processor, templateName)];
                case 5: 
                // Elabora con gestione errori
                return [2 /*return*/, _a.sent()];
                case 6:
                    error_2 = _a.sent();
                    stats_1 = {
                        totalRecords: 0,
                        successfulRecords: 0,
                        errorRecords: 1,
                        inserted: 0,
                        updated: 0,
                        skipped: 0,
                        warnings: [],
                        errors: [error_2.message]
                    };
                    return [2 /*return*/, { data: [], stats: stats_1 }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
