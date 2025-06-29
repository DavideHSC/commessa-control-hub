"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformScrittureContabili = transformScrittureContabili;
// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - TRANSFORMER COMPLETO
// =============================================================================
// Implementa il transformer completo che crea TUTTE le entità:
// - ScritturaContabile (testate)
// - RigaScrittura (righe contabili)
// - RigaIva (righe IVA)
// - Allocazione (movimenti analitici)
// - Entità dipendenti (fornitori, causali, conti, codici IVA, commesse)
// =============================================================================
// Costanti di sistema
var SYSTEM_CUSTOMER_ID = 'cliente_sistema';
var DEFAULT_VOCE_ANALITICA_ID = 'default_voce_analitica';
// -----------------------------------------------------------------------------
// FUNZIONE PRINCIPALE COMPLETA
// -----------------------------------------------------------------------------
function transformScrittureContabili(testate, righeContabili, righeIva, allocazioni) {
    console.log('🔧 Transformer COMPLETO: Creazione di TUTTE le entità...');
    // FASE 1: Organizza dati per CODICE_UNIVOCO
    var scrittureOrganizzate = organizzaDatiMultiFile(testate, righeContabili, righeIva, allocazioni);
    // FASE 2: Valida integrità referenziale
    var erroriIntegrita = validaIntegritaReferenziale(scrittureOrganizzate);
    // FASE 3: Identifica entità dipendenti necessarie
    var entitaNecessarie = identificaEntitaDipendenti(scrittureOrganizzate);
    // FASE 4: Crea tutte le entità con correlazioni
    var entitaPrisma = creaTutteLeEntita(scrittureOrganizzate, entitaNecessarie);
    // FASE 5: Statistiche finali
    var stats = calcolaStatisticheComplete(scrittureOrganizzate, entitaPrisma, erroriIntegrita);
    console.log("\u2705 Transformer COMPLETO: ".concat(stats.entitaCreate.scritture, " scritture complete create"));
    console.log("   \uD83D\uDCCA Righe contabili: ".concat(stats.entitaCreate.righeScrittura));
    console.log("   \uD83D\uDCB0 Righe IVA: ".concat(stats.entitaCreate.righeIva));
    console.log("   \uD83C\uDFED Allocazioni: ".concat(stats.entitaCreate.allocazioni));
    return __assign(__assign({}, entitaPrisma), { scrittureOrganizzate: scrittureOrganizzate, stats: stats });
}
// -----------------------------------------------------------------------------
// FASE 1: ORGANIZZAZIONE DATI (IDENTICA AL MVP)
// -----------------------------------------------------------------------------
function organizzaDatiMultiFile(testate, righeContabili, righeIva, allocazioni) {
    var _a;
    var scrittureMap = {};
    // 1. Prima le testate
    console.log("\uD83D\uDCCB Organizzando ".concat(testate.length, " testate..."));
    for (var _i = 0, testate_1 = testate; _i < testate_1.length; _i++) {
        var testata = testate_1[_i];
        var key = testata.externalId;
        scrittureMap[key] = {
            testata: testata,
            righeContabili: [],
            righeIva: [],
            allocazioni: [],
        };
    }
    console.log("\u2705 Testate organizzate. Prime 5 chiavi:", Object.keys(scrittureMap).slice(0, 5));
    // 2. Poi righe contabili
    console.log("\uD83D\uDCB0 Associando ".concat(righeContabili.length, " righe contabili..."));
    var righeAssociate = 0;
    for (var _b = 0, righeContabili_1 = righeContabili; _b < righeContabili_1.length; _b++) {
        var riga = righeContabili_1[_b];
        var key = riga.externalId;
        if (scrittureMap[key]) {
            scrittureMap[key].righeContabili.push(riga);
            righeAssociate++;
        }
        else {
            // DEBUG: primi 3 che non si associano
            if (righeAssociate < 3) {
                console.log("\u274C DEBUG RIGA ".concat(righeAssociate + 1, ": Riga externalId=\"").concat(riga.externalId, "\" non trova testata."));
                console.log("\u274C DEBUG: Prime 5 testate: ".concat(Object.keys(scrittureMap).slice(0, 5).join('", "')));
                console.log("\u274C DEBUG: Lunghezza riga externalId: ".concat(riga.externalId.length, ", lunghezza testata externalId: ").concat(((_a = Object.keys(scrittureMap)[0]) === null || _a === void 0 ? void 0 : _a.length) || 'N/A'));
            }
        }
    }
    console.log("\u2705 ".concat(righeAssociate, "/").concat(righeContabili.length, " righe contabili associate"));
    // 3. Poi righe IVA
    console.log("\uD83D\uDCCA Associando ".concat(righeIva.length, " righe IVA..."));
    var righeIvaAssociate = 0;
    for (var _c = 0, righeIva_1 = righeIva; _c < righeIva_1.length; _c++) {
        var riga = righeIva_1[_c];
        var key = riga.externalId;
        if (scrittureMap[key]) {
            scrittureMap[key].righeIva.push(riga);
            righeIvaAssociate++;
        }
    }
    console.log("\u2705 ".concat(righeIvaAssociate, "/").concat(righeIva.length, " righe IVA associate"));
    // 4. Infine allocazioni analitiche
    console.log("\uD83C\uDFED Associando ".concat(allocazioni.length, " allocazioni..."));
    var allocazioniAssociate = 0;
    for (var _d = 0, allocazioni_1 = allocazioni; _d < allocazioni_1.length; _d++) {
        var alloc = allocazioni_1[_d];
        var key = alloc.externalId;
        if (scrittureMap[key]) {
            scrittureMap[key].allocazioni.push(alloc);
            allocazioniAssociate++;
        }
    }
    console.log("\u2705 ".concat(allocazioniAssociate, "/").concat(allocazioni.length, " allocazioni associate"));
    return scrittureMap;
}
// -----------------------------------------------------------------------------
// FASE 2: VALIDAZIONE INTEGRITÀ REFERENZIALE
// -----------------------------------------------------------------------------
function validaIntegritaReferenziale(scrittureMap) {
    var errori = [];
    Object.entries(scrittureMap).forEach(function (_a) {
        var key = _a[0], scrittura = _a[1];
        // Controllo testata
        if (!scrittura.testata) {
            errori.push("Scrittura ".concat(key, ": testata mancante"));
        }
        // Controllo righe contabili
        if (scrittura.righeContabili.length === 0) {
            errori.push("Scrittura ".concat(key, ": nessuna riga contabile trovata"));
        }
        // Controllo coerenza righe IVA
        scrittura.righeIva.forEach(function (rigaIva, idx) {
            if (rigaIva.externalId !== key) {
                errori.push("Scrittura ".concat(key, ": riga IVA ").concat(idx, " ha externalId diverso (").concat(rigaIva.externalId, ")"));
            }
        });
        // Controllo coerenza allocazioni
        scrittura.allocazioni.forEach(function (alloc, idx) {
            if (alloc.externalId !== key) {
                errori.push("Scrittura ".concat(key, ": allocazione ").concat(idx, " ha externalId diverso (").concat(alloc.externalId, ")"));
            }
        });
    });
    return errori;
}
// -----------------------------------------------------------------------------
// FASE 3: IDENTIFICAZIONE ENTITÀ DIPENDENTI
// -----------------------------------------------------------------------------
function identificaEntitaDipendenti(scrittureMap) {
    var entitaSet = {
        fornitori: new Set(),
        causali: new Set(),
        conti: new Set(),
        codiciIva: new Set(),
        commesse: new Set(),
        vociAnalitiche: new Set(),
    };
    Object.values(scrittureMap).forEach(function (scrittura) {
        // Dalle testate
        if (scrittura.testata.causaleId) {
            entitaSet.causali.add(scrittura.testata.causaleId);
        }
        if (scrittura.testata.clienteFornitoreCodiceFiscale) {
            entitaSet.fornitori.add(scrittura.testata.clienteFornitoreCodiceFiscale);
        }
        // Dalle righe contabili
        scrittura.righeContabili.forEach(function (riga) {
            if (riga.conto) {
                entitaSet.conti.add(riga.conto);
            }
        });
        // Dalle righe IVA
        scrittura.righeIva.forEach(function (riga) {
            if (riga.codiceIva) {
                entitaSet.codiciIva.add(riga.codiceIva);
            }
        });
        // Dalle allocazioni
        scrittura.allocazioni.forEach(function (alloc) {
            if (alloc.centroDiCosto) {
                entitaSet.commesse.add(alloc.centroDiCosto);
            }
            // Aggiungi voce analitica di default se non specificata
            entitaSet.vociAnalitiche.add(DEFAULT_VOCE_ANALITICA_ID);
        });
    });
    return entitaSet;
}
// -----------------------------------------------------------------------------
// FASE 4: CREAZIONE TUTTE LE ENTITÀ
// -----------------------------------------------------------------------------
function creaTutteLeEntita(scrittureMap, entitaNecessarie) {
    console.log('🔧 Creando tutte le entità Prisma...');
    // 1. Crea entità dipendenti
    var entitaDipendenti = creaEntitaDipendenti(entitaNecessarie);
    // 2. Crea correlazioni per le foreign keys
    var correlazioni = {
        scrittureByExternalId: new Map(),
        righeByKey: new Map(),
        righeIvaByKey: new Map(),
    };
    // 3. Crea scritture (testate)
    var scritture = creaScrittureContabili(scrittureMap, correlazioni);
    // 4. Crea righe contabili
    var righeScrittura = creaRigheScrittura(scrittureMap, correlazioni);
    // 5. Crea righe IVA
    var righeIva = creaRigheIva(scrittureMap, correlazioni);
    // 6. Crea allocazioni
    var allocazioni = creaAllocazioni(scrittureMap, correlazioni);
    return __assign(__assign({}, entitaDipendenti), { scritture: scritture, righeScrittura: righeScrittura, righeIva: righeIva, allocazioni: allocazioni });
}
// -----------------------------------------------------------------------------
// CREAZIONE ENTITÀ DIPENDENTI
// -----------------------------------------------------------------------------
function creaEntitaDipendenti(entitaSet) {
    // Fornitori
    var fornitori = Array.from(entitaSet.fornitori).map(function (id) { return ({
        id: id,
        externalId: id,
        nome: "Fornitore importato - ".concat(id),
    }); });
    // Causali
    var causali = Array.from(entitaSet.causali).map(function (id) { return ({
        id: id,
        externalId: id,
        descrizione: "Causale importata - ".concat(id),
    }); });
    // Conti
    var conti = Array.from(entitaSet.conti).map(function (id) { return ({
        id: id,
        codice: id,
        nome: "Conto importato - ".concat(id),
        tipo: 'Patrimoniale',
    }); });
    // Codici IVA
    var codiciIva = Array.from(entitaSet.codiciIva).map(function (id) { return ({
        id: id,
        externalId: id,
        descrizione: "Codice IVA importato - ".concat(id),
        aliquota: 22.0, // Default
    }); });
    // Commesse
    var commesse = Array.from(entitaSet.commesse).map(function (id) { return ({
        id: id,
        nome: "Commessa importata - ".concat(id),
        descrizione: "Commessa importata dal sistema legacy - ".concat(id),
        cliente: { connect: { id: SYSTEM_CUSTOMER_ID } },
    }); });
    // Voci Analitiche
    var vociAnalitiche = Array.from(entitaSet.vociAnalitiche).map(function (id) { return ({
        id: id,
        nome: id === DEFAULT_VOCE_ANALITICA_ID ? 'Voce Analitica Default' : "Voce Analitica - ".concat(id),
        descrizione: "Voce analitica importata - ".concat(id),
    }); });
    return {
        fornitori: fornitori,
        causali: causali,
        conti: conti,
        codiciIva: codiciIva,
        commesse: commesse,
        vociAnalitiche: vociAnalitiche,
    };
}
// -----------------------------------------------------------------------------
// CREAZIONE SCRITTURE CONTABILI (TESTATE)
// -----------------------------------------------------------------------------
function creaScrittureContabili(scrittureMap, correlazioni) {
    var scritture = [];
    Object.entries(scrittureMap).forEach(function (_a) {
        var _b;
        var key = _a[0], scrittura = _a[1];
        // Genera ID unico per la scrittura
        var scritturaId = "scrittura_".concat(key);
        correlazioni.scrittureByExternalId.set(key, scritturaId);
        // FIX DATI (come nell'MVP)
        var dataValida = scrittura.testata.dataRegistrazione || new Date('2025-01-01');
        var descrizioneValida = ((_b = scrittura.testata.noteMovimento) === null || _b === void 0 ? void 0 : _b.trim()) ||
            "Scrittura importata ".concat(key, " - Causale ").concat(scrittura.testata.causaleId);
        scritture.push({
            id: scritturaId,
            externalId: key,
            data: dataValida,
            descrizione: descrizioneValida,
            causale: scrittura.testata.causaleId ? { connect: { id: scrittura.testata.causaleId } } : undefined,
            fornitore: scrittura.testata.clienteFornitoreCodiceFiscale ? { connect: { id: scrittura.testata.clienteFornitoreCodiceFiscale } } : undefined,
            dataDocumento: scrittura.testata.dataDocumento,
            numeroDocumento: scrittura.testata.numeroDocumento,
        });
    });
    return scritture;
}
// -----------------------------------------------------------------------------
// CREAZIONE RIGHE SCRITTURA (RIGHE CONTABILI)
// -----------------------------------------------------------------------------
function creaRigheScrittura(scrittureMap, correlazioni) {
    var righe = [];
    Object.entries(scrittureMap).forEach(function (_a) {
        var key = _a[0], scrittura = _a[1];
        var scritturaId = correlazioni.scrittureByExternalId.get(key);
        scrittura.righeContabili.forEach(function (riga, idx) {
            var _a;
            var rigaId = "riga_".concat(key, "_").concat(idx);
            var rigaKey = "".concat(scritturaId, ":").concat(idx);
            correlazioni.righeByKey.set(rigaKey, rigaId);
            // FIX DATI (gestione valori null)
            var descrizioneRiga = ((_a = riga.note) === null || _a === void 0 ? void 0 : _a.trim()) || "Riga ".concat(idx + 1, " - Conto ").concat(riga.conto);
            var dare = riga.importoDare || 0;
            var avere = riga.importoAvere || 0;
            righe.push({
                id: rigaId,
                descrizione: descrizioneRiga,
                dare: dare,
                avere: avere,
                conto: { connect: { id: riga.conto } },
                scritturaContabile: { connect: { id: scritturaId } },
            });
        });
    });
    return righe;
}
// -----------------------------------------------------------------------------
// CREAZIONE RIGHE IVA
// -----------------------------------------------------------------------------
function creaRigheIva(scrittureMap, correlazioni) {
    var righeIva = [];
    Object.entries(scrittureMap).forEach(function (_a) {
        var key = _a[0], scrittura = _a[1];
        var scritturaId = correlazioni.scrittureByExternalId.get(key);
        scrittura.righeIva.forEach(function (riga, idx) {
            var rigaIvaId = "riga_iva_".concat(key, "_").concat(idx);
            // Trova la riga contabile corrispondente (se esiste)
            var rigaContabileKey = "".concat(scritturaId, ":").concat(riga.riga - 1); // riga.riga è 1-based
            var rigaContabileId = correlazioni.righeByKey.get(rigaContabileKey);
            righeIva.push({
                id: rigaIvaId,
                imponibile: riga.imponibile || 0,
                imposta: riga.imposta || 0,
                codiceIva: { connect: { id: riga.codiceIva } },
            });
        });
    });
    return righeIva;
}
// -----------------------------------------------------------------------------
// CREAZIONE ALLOCAZIONI
// -----------------------------------------------------------------------------
function creaAllocazioni(scrittureMap, correlazioni) {
    var allocazioni = [];
    Object.entries(scrittureMap).forEach(function (_a) {
        var key = _a[0], scrittura = _a[1];
        var scritturaId = correlazioni.scrittureByExternalId.get(key);
        scrittura.allocazioni.forEach(function (alloc, idx) {
            var allocazioneId = "alloc_".concat(key, "_").concat(idx);
            // Trova la riga contabile corrispondente
            var rigaContabileKey = "".concat(scritturaId, ":").concat(alloc.progressivoRigoContabile - 1); // progressivoRigoContabile è 1-based
            var rigaContabileId = correlazioni.righeByKey.get(rigaContabileKey);
            if (rigaContabileId) {
                allocazioni.push({
                    id: allocazioneId,
                    importo: alloc.parametro || 0,
                    descrizione: "Allocazione ".concat(idx + 1, " - Commessa ").concat(alloc.centroDiCosto),
                    rigaScrittura: { connect: { id: rigaContabileId } },
                    commessa: { connect: { id: alloc.centroDiCosto } },
                    voceAnalitica: { connect: { id: DEFAULT_VOCE_ANALITICA_ID } },
                });
            }
        });
    });
    return allocazioni;
}
function calcolaStatisticheComplete(scrittureMap, entitaPrisma, erroriIntegrita) {
    var stats = {
        scrittureProcessate: Object.keys(scrittureMap).length,
        righeContabiliProcessate: Object.values(scrittureMap).reduce(function (acc, s) { return acc + s.righeContabili.length; }, 0),
        righeIvaProcessate: Object.values(scrittureMap).reduce(function (acc, s) { return acc + s.righeIva.length; }, 0),
        allocazioniProcessate: Object.values(scrittureMap).reduce(function (acc, s) { return acc + s.allocazioni.length; }, 0),
        entitaCreate: {
            scritture: entitaPrisma.scritture.length,
            righeScrittura: entitaPrisma.righeScrittura.length,
            righeIva: entitaPrisma.righeIva.length,
            allocazioni: entitaPrisma.allocazioni.length,
            fornitori: entitaPrisma.fornitori.length,
            causali: entitaPrisma.causali.length,
            conti: entitaPrisma.conti.length,
            codiciIva: entitaPrisma.codiciIva.length,
            commesse: entitaPrisma.commesse.length,
            vociAnalitiche: entitaPrisma.vociAnalitiche.length,
        },
        erroriIntegrita: erroriIntegrita,
    };
    return stats;
}
