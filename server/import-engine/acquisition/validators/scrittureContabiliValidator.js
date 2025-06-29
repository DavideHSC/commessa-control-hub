"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatedMovAnacSchema = exports.rawMovAnacSchema = exports.validatedPnRigIvaSchema = exports.rawPnRigIvaSchema = exports.validatedPnRigConSchema = exports.rawPnRigConSchema = exports.validatedPnTestaSchema = exports.rawPnTestaSchema = void 0;
var zod_1 = require("zod");
// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - VALIDATORI ZOD
// =============================================================================
// Questo è il parser più complesso (⭐⭐⭐⭐⭐) che gestisce 4 file interconnessi:
// - PNTESTA.TXT: Testate delle scritture contabili
// - PNRIGCON.TXT: Righe contabili (movimenti Dare/Avere)
// - PNRIGIVA.TXT: Righe IVA per operazioni fiscalmente rilevanti
// - MOVANAC.TXT: Allocazioni analitiche su centri di costo/commesse
//
// SFIDA: Coordinare parsing, validazione e correlazione multi-file
// mantenendo integrità referenziale assoluta
// =============================================================================
// -----------------------------------------------------------------------------
// UTILITY DI VALIDAZIONE CONDIVISE
// -----------------------------------------------------------------------------
/**
 * Converte data GGMMAAAA in Date object
 * Gestisce valori nulli, vuoti e date non valide (00000000)
 */
var dateTransform = zod_1.z
    .string()
    .transform(function (val) {
    if (!val || val.trim() === '' || val.trim() === '00000000') {
        return null;
    }
    var cleaned = val.trim().padStart(8, '0');
    if (cleaned.length !== 8)
        return null;
    var day = cleaned.substring(0, 2);
    var month = cleaned.substring(2, 4);
    var year = cleaned.substring(4, 8);
    var date = new Date("".concat(year, "-").concat(month, "-").concat(day));
    return isNaN(date.getTime()) ? null : date;
})
    .nullable();
/**
 * Converte numeri con decimali impliciti (divide per 100)
 * Gestisce valori vuoti, null e non numerici
 * Accetta sia stringhe che numeri dal parsing
 */
var currencyTransform = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number()])
    .nullable()
    .transform(function (val) {
    if (val === null)
        return 0;
    if (typeof val === 'number')
        return val / 100;
    if (!val || val.trim() === '')
        return 0;
    var parsed = parseFloat(val.trim());
    return isNaN(parsed) ? 0 : parsed / 100;
});
/**
 * Converte flag '1'/'0' in boolean
 */
var flagTransform = zod_1.z
    .string()
    .transform(function (val) { return (val === null || val === void 0 ? void 0 : val.trim()) === '1'; });
// -----------------------------------------------------------------------------
// VALIDATORI PER OGNI FILE
// -----------------------------------------------------------------------------
/**
 * PNTESTA.TXT - Testate delle scritture contabili
 * Rappresenta l'intestazione di ogni registrazione contabile
 */
exports.rawPnTestaSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    causaleId: zod_1.z.string(),
    dataRegistrazione: zod_1.z.string(),
    clienteFornitoreCodiceFiscale: zod_1.z.string(),
    dataDocumento: zod_1.z.string(),
    numeroDocumento: zod_1.z.string(),
    totaleDocumento: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    noteMovimento: zod_1.z.string(),
});
exports.validatedPnTestaSchema = zod_1.z.object({
    externalId: zod_1.z.string().trim().min(1, "External ID richiesto"),
    causaleId: zod_1.z.string().trim(),
    dataRegistrazione: dateTransform,
    clienteFornitoreCodiceFiscale: zod_1.z.string().trim().optional(),
    dataDocumento: dateTransform,
    numeroDocumento: zod_1.z.string().trim().optional(),
    totaleDocumento: currencyTransform,
    noteMovimento: zod_1.z.string().trim().optional(),
});
/**
 * PNRIGCON.TXT - Righe contabili
 * Ogni riga rappresenta un movimento Dare/Avere su un conto
 */
exports.rawPnRigConSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    progressivoRigo: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    tipoConto: zod_1.z.string(),
    clienteFornitoreCodiceFiscale: zod_1.z.string(),
    conto: zod_1.z.string(),
    importoDare: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    importoAvere: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    note: zod_1.z.string(),
    movimentiAnalitici: zod_1.z.string(),
});
exports.validatedPnRigConSchema = zod_1.z.object({
    externalId: zod_1.z.string().trim().min(1, "External ID richiesto"),
    progressivoRigo: zod_1.z.coerce.number().int().min(0, "Progressivo deve essere >= 0").nullable().transform(function (val) { return val !== null && val !== void 0 ? val : 0; }),
    tipoConto: zod_1.z.string().trim().optional(),
    clienteFornitoreCodiceFiscale: zod_1.z.string().trim().optional(),
    conto: zod_1.z.string().trim().optional(),
    importoDare: currencyTransform,
    importoAvere: currencyTransform,
    note: zod_1.z.string().trim().optional(),
    movimentiAnalitici: flagTransform,
});
/**
 * PNRIGIVA.TXT - Righe IVA
 * Gestisce gli aspetti fiscali delle operazioni
 */
exports.rawPnRigIvaSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    codiceIva: zod_1.z.string(),
    contropartita: zod_1.z.string(),
    imponibile: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    imposta: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    importoLordo: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    note: zod_1.z.string(),
});
exports.validatedPnRigIvaSchema = zod_1.z.object({
    externalId: zod_1.z.string().trim().min(1, "External ID richiesto"),
    riga: zod_1.z.coerce.number().int().min(0, "Numero riga deve essere >= 0").nullable().transform(function (val) { return val !== null && val !== void 0 ? val : 0; }),
    codiceIva: zod_1.z.string().trim().optional(),
    contropartita: zod_1.z.string().trim().optional(),
    imponibile: currencyTransform,
    imposta: currencyTransform,
    importoLordo: currencyTransform,
    note: zod_1.z.string().trim().optional(),
});
/**
 * MOVANAC.TXT - Movimenti analitici
 * Gestisce l'allocazione dei costi/ricavi sui centri di costo (commesse)
 */
exports.rawMovAnacSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    progressivoRigoContabile: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
    centroDiCosto: zod_1.z.string(),
    parametro: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable(),
});
exports.validatedMovAnacSchema = zod_1.z.object({
    externalId: zod_1.z.string().trim().min(1, "External ID richiesto"),
    progressivoRigoContabile: zod_1.z.coerce.number().int().min(0, "Progressivo riga deve essere >= 0").nullable().transform(function (val) { return val !== null && val !== void 0 ? val : 0; }),
    centroDiCosto: zod_1.z.string().trim().optional(),
    parametro: currencyTransform,
});
