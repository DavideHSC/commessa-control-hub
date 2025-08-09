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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Mappatura basata sul documento .docs/analysis/voci-costo-analitico.md
var MAPPING = {
    '6005000150': 'Materiale di Consumo',
    '6005000850': 'Carburanti e Lubrificanti',
    '6015000400': 'Utenze',
    '6015000751': 'Lavorazioni Esterne',
    '6015000800': 'Spese Generali / di Struttura',
    '6015002101': 'Pulizie di Cantiere',
    '6015002102': 'Pulizie di Cantiere',
    '6015002700': 'Utenze',
    '6015003710': 'Oneri e Spese Accessorie',
    '6015007703': 'Smaltimento Rifiuti Speciali',
    '6015009701': 'Manutenzione Mezzi',
    '6016000310': 'Consulenze Tecniche/Legali',
    '6018000940': 'Servizi Generici di Cantiere',
    '6020001290': 'Canoni Leasing Mezzi/Attrezz.',
    '6020001420': 'Canoni Leasing Mezzi/Attrezz.',
    '6310000500': 'Manodopera Diretta',
    '6320000350': 'Oneri su Manodopera',
};
var NOMI_CONTI_NON_ANALITICI = [
    'Oneri Finanziari',
    'Imposte e Tasse Deducibili',
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var vociAnalitiche, vociMap, defaultVoceId, conti, contiAggiornati, contiNonModificati, contiNonTrovatiInMapping, updates, _i, conti_1, conto, isCostoORicavo, isInMapping, voceAnaliticaIdDaCollegare, nomeVoce, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Inizio script di mapping dei conti alle voci analitiche...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 8]);
                    return [4 /*yield*/, prisma.voceAnalitica.findMany()];
                case 2:
                    vociAnalitiche = _a.sent();
                    vociMap = new Map(vociAnalitiche.map(function (v) { return [v.nome, v.id]; }));
                    defaultVoceId = vociMap.get('Costi/Ricavi da Classificare');
                    if (!defaultVoceId) {
                        throw new Error('La voce analitica di default "Costi/Ricavi da Classificare" non è stata trovata. Eseguire il seed del database.');
                    }
                    return [4 /*yield*/, prisma.conto.findMany()];
                case 3:
                    conti = _a.sent();
                    console.log("Trovati ".concat(conti.length, " conti nel database."));
                    contiAggiornati = 0;
                    contiNonModificati = 0;
                    contiNonTrovatiInMapping = 0;
                    updates = [];
                    // 3. Itera sui conti e applica il mapping
                    for (_i = 0, conti_1 = conti; _i < conti_1.length; _i++) {
                        conto = conti_1[_i];
                        isCostoORicavo = conto.tipo === client_1.TipoConto.Costo || conto.tipo === client_1.TipoConto.Ricavo;
                        isInMapping = conto.codice && MAPPING[conto.codice];
                        if (!isCostoORicavo && !isInMapping) {
                            contiNonModificati++;
                            continue;
                        }
                        // Salta i conti che hanno nomi specifici da non allocare
                        if (conto.nome && NOMI_CONTI_NON_ANALITICI.includes(conto.nome)) {
                            contiNonModificati++;
                            continue;
                        }
                        voceAnaliticaIdDaCollegare = undefined;
                        if (conto.codice && isInMapping) {
                            nomeVoce = MAPPING[conto.codice];
                            voceAnaliticaIdDaCollegare = vociMap.get(nomeVoce);
                            if (!voceAnaliticaIdDaCollegare) {
                                console.warn("ATTENZIONE: La voce analitica \"".concat(nomeVoce, "\" specificata per il conto ").concat(conto.codice, " non esiste nel database."));
                            }
                        }
                        else {
                            // Se è un costo/ricavo ma non è nel mapping, usa la voce di default
                            voceAnaliticaIdDaCollegare = defaultVoceId;
                            contiNonTrovatiInMapping++;
                        }
                        // Se abbiamo trovato una voce da collegare e il conto non è già collegato a quella voce
                        if (voceAnaliticaIdDaCollegare && conto.voceAnaliticaId !== voceAnaliticaIdDaCollegare) {
                            updates.push(prisma.conto.update({
                                where: { id: conto.id },
                                data: { voceAnaliticaId: voceAnaliticaIdDaCollegare },
                            }));
                            contiAggiornati++;
                        }
                        else {
                            contiNonModificati++;
                        }
                    }
                    console.log("\nPreparati ".concat(updates.length, " aggiornamenti. Esecuzione in corso..."));
                    return [4 /*yield*/, prisma.$transaction(updates)];
                case 4:
                    _a.sent();
                    console.log('\n--- Risultato del Mapping ---');
                    console.log("\u2705 Conti aggiornati con una nuova voce analitica: ".concat(contiAggiornati));
                    console.log("\uD83D\uDD35 Conti gi\u00E0 correttamente mappati o non economici: ".concat(contiNonModificati));
                    console.log("\uD83D\uDFE0 Conti di costo/ricavo non trovati nel mapping e assegnati alla voce di default: ".concat(contiNonTrovatiInMapping));
                    console.log('-----------------------------\n');
                    return [3 /*break*/, 8];
                case 5:
                    error_1 = _a.sent();
                    console.error('Si è verificato un errore durante lo script di mapping:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, prisma.$disconnect()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
main();
