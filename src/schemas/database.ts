import * as z from 'zod'; 
import { TipoConto } from '@prisma/client';

export const baseSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  externalId: z.string().optional(),
}); 

export const causaleSchema = z.object({
  id: z.string().min(1, { message: "L'ID è obbligatorio." }),
  codice: z.string().optional().nullable(),
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }).optional().nullable(),
  descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }).optional().nullable(),
  externalId: z.string().optional().nullable(),
  dataFine: z.date().optional().nullable(),
  dataInizio: z.date().optional().nullable(),
  noteMovimento: z.string().optional().nullable(),
  tipoAggiornamento: z.string().optional().nullable(),
  tipoMovimento: z.string().optional().nullable(),
  tipoRegistroIva: z.string().optional().nullable(),
  tipoMovimentoDesc: z.string().optional().nullable(),
  tipoAggiornamentoDesc: z.string().optional().nullable(),
  tipoRegistroIvaDesc: z.string().optional().nullable(),
  segnoMovimentoIva: z.string().optional().nullable(),
  segnoMovimentoIvaDesc: z.string().optional().nullable(),
  contoIva: z.string().optional().nullable(),
  contoIvaVendite: z.string().optional().nullable(),
  generazioneAutofattura: z.boolean().default(false),
  tipoAutofatturaGenerata: z.string().optional().nullable(),
  tipoAutofatturaDesc: z.string().optional().nullable(),
  fatturaImporto0: z.boolean().default(false),
  fatturaValutaEstera: z.boolean().default(false),
  nonConsiderareLiquidazioneIva: z.boolean().default(false),
  fatturaEmessaRegCorrispettivi: z.boolean().default(false),
  ivaEsigibilitaDifferita: z.string().optional().nullable(),
  ivaEsigibilitaDifferitaDesc: z.string().optional().nullable(),
  gestionePartite: z.string().optional().nullable(),
  gestionePartiteDesc: z.string().optional().nullable(),
  gestioneIntrastat: z.boolean().default(false),
  gestioneRitenuteEnasarco: z.string().optional().nullable(),
  gestioneRitenuteEnasarcoDesc: z.string().optional().nullable(),
  versamentoRitenute: z.boolean().default(false),
  descrizioneDocumento: z.string().optional().nullable(),
  identificativoEsteroClifor: z.boolean().default(false),
  scritturaRettificaAssestamento: z.boolean().default(false),
  nonStampareRegCronologico: z.boolean().default(false),
  movimentoRegIvaNonRilevante: z.boolean().default(false),
  tipoMovimentoSemplificata: z.string().optional().nullable(),
  tipoMovimentoSemplificataDesc: z.string().optional().nullable(),
});

export const codiceIvaSchema = z.object({
  // Campi base
  id: z.string().min(1, { message: "L'ID è obbligatorio." }),
  externalId: z.string().optional().nullable(),
  codice: z.string().optional().nullable(),
  descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }),
  
  // Campi principali
  aliquota: z.number().min(0).max(100, { message: "L'aliquota deve essere tra 0 e 100." }).optional().nullable(),
  percentuale: z.number().min(0).max(100).optional().nullable(),
  natura: z.string().optional().nullable(),
  codiceExport: z.string().optional().nullable(),
  inUso: z.boolean().optional().nullable(),
  dataAggiornamento: z.date().optional().nullable(),
  note: z.string().optional().nullable(),
  indetraibilita: z.number().min(0).max(100).optional().nullable(),
  tipoCalcolo: z.string().optional().nullable(),
  tipoCalcoloDesc: z.string().optional().nullable(),
  dataInizio: z.date().optional().nullable(),
  dataFine: z.date().optional().nullable(),
  validitaInizio: z.date().optional().nullable(),
  validitaFine: z.date().optional().nullable(),
  
  // Flags principali
  splitPayment: z.boolean().optional().nullable(),
  nonImponibile: z.boolean().optional().nullable(),
  imponibile: z.boolean().optional().nullable(),
  esente: z.boolean().optional().nullable(),
  nonImponibileConPlafond: z.boolean().optional().nullable(),
  inSospensione: z.boolean().optional().nullable(),
  esclusoDaIva: z.boolean().optional().nullable(),
  reverseCharge: z.boolean().optional().nullable(),
  fuoriCampoIva: z.boolean().optional().nullable(),
  
  // === ESTENSIONI FASE 1 - PARSER PYTHON ===
  // Gestione Plafond
  plafondAcquisti: z.string().optional().nullable(),
  plafondAcquistiDesc: z.string().optional().nullable(),
  monteAcquisti: z.boolean().optional().nullable(),
  plafondVendite: z.string().optional().nullable(),
  plafondVenditeDesc: z.string().optional().nullable(),
  noVolumeAffariPlafond: z.boolean().optional().nullable(),
  
  // Pro-rata e Compensazioni
  gestioneProRata: z.string().optional().nullable(),
  gestioneProRataDesc: z.string().optional().nullable(),
  percentualeCompensazione: z.number().min(0).max(100).optional().nullable(),
  
  // Reverse Charge e Operazioni Speciali
  autofatturaReverseCharge: z.boolean().optional().nullable(),
  operazioneEsenteOccasionale: z.boolean().optional().nullable(),
  cesArt38QuaterStornoIva: z.boolean().optional().nullable(),
  agevolazioniSubforniture: z.boolean().optional().nullable(),
  
  // Territorialità
  indicatoreTerritorialeVendite: z.string().optional().nullable(),
  indicatoreTerritorialeVenditeDesc: z.string().optional().nullable(),
  indicatoreTerritorialeAcquisti: z.string().optional().nullable(),
  indicatoreTerritorialeAcquistiDesc: z.string().optional().nullable(),
  
  // Beni Ammortizzabili
  beniAmmortizzabili: z.boolean().optional().nullable(),
  analiticoBeniAmmortizzabili: z.boolean().optional().nullable(),
  
  // Comunicazioni Dati IVA
  comunicazioneDatiIvaVendite: z.string().optional().nullable(),
  comunicazioneDatiIvaVenditeDesc: z.string().optional().nullable(),
  comunicazioneDatiIvaAcquisti: z.string().optional().nullable(),
  comunicazioneDatiIvaAcquistiDesc: z.string().optional().nullable(),
  
  // Altri Campi Fiscali
  imponibile50Corrispettivi: z.boolean().optional().nullable(),
  imposteIntrattenimenti: z.string().optional().nullable(),
  imposteIntrattenimentiDesc: z.string().optional().nullable(),
  ventilazione: z.boolean().optional().nullable(),
  aliquotaDiversa: z.number().min(0).max(100).optional().nullable(),
  percDetrarreExport: z.number().min(0).max(100).optional().nullable(),
  acquistiCessioni: z.string().optional().nullable(),
  acquistiCessioniDesc: z.string().optional().nullable(),
  metodoDaApplicare: z.string().optional().nullable(),
  metodoDaApplicareDesc: z.string().optional().nullable(),
  percentualeForfetaria: z.string().optional().nullable(),
  percentualeForfetariaDesc: z.string().optional().nullable(),
  quotaForfetaria: z.string().optional().nullable(),
  quotaForfetariaDesc: z.string().optional().nullable(),
  acquistiIntracomunitari: z.boolean().optional().nullable(),
  cessioneProdottiEditoriali: z.boolean().optional().nullable(),
  provvigioniDm34099: z.boolean().optional().nullable(),
  acqOperazImponibiliOccasionali: z.boolean().optional().nullable(),
});

export const condizioneSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    descrizione: z.string().min(2, { message: "La descrizione deve essere di almeno 2 caratteri." }),
    codice: z.string().optional().nullable(),
    externalId: z.string().optional().nullable(),
    numeroRate: z.number().int().optional().nullable(),
    giorniPrimaScadenza: z.number().int().optional().nullable(),
    giorniTraRate: z.number().int().optional().nullable(),
    dataRiferimento: z.string().optional().nullable(),
    suddivisione: z.string().optional().nullable(),
    sconto: z.number().optional().nullable(),
    banca: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    calcolaGiorniCommerciali: z.boolean().optional().nullable(),
    consideraPeriodiChiusura: z.boolean().optional().nullable(),
    suddivisioneDesc: z.string().optional().nullable(),
    inizioScadenzaDesc: z.string().optional().nullable(),
});

export const voceSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
    descrizione: z.string().optional(),
    externalId: z.string().optional(),
});

export const contoSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    codice: z.string().min(1, "Il codice è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    tipo: z.nativeEnum(TipoConto),
    richiedeVoceAnalitica: z.boolean().default(false),
    voceAnaliticaId: z.string().optional().nullable(),

    // === ESTENSIONI FASE 1 - PARSER PYTHON (parser_contigen.py) ===
    tabellaItalstudio: z.string().optional().nullable(),
    livello: z.string().optional().nullable(),
    livelloDesc: z.string().optional().nullable(),
    sigla: z.string().optional().nullable(),
    gruppo: z.string().optional().nullable(),
    gruppoDesc: z.string().optional().nullable(),
    controlloSegno: z.string().optional().nullable(),
    controlloSegnoDesc: z.string().optional().nullable(),
    codificaFormattata: z.string().optional().nullable(),
    
    // Validità per Tipo Contabilità
    validoImpresaOrdinaria: z.boolean().default(false).optional().nullable(),
    validoImpresaSemplificata: z.boolean().default(false).optional().nullable(),
    validoProfessionistaOrdinario: z.boolean().default(false).optional().nullable(),
    validoProfessionistaSemplificato: z.boolean().default(false).optional().nullable(),
    
    // Validità per Dichiarazioni
    validoUnicoPf: z.boolean().default(false).optional().nullable(),
    validoUnicoSp: z.boolean().default(false).optional().nullable(),
    validoUnicoSc: z.boolean().default(false).optional().nullable(),
    validoUnicoEnc: z.boolean().default(false).optional().nullable(),
    
    // Classi Fiscali
    classeIrpefIres: z.string().optional().nullable(),
    classeIrap: z.string().optional().nullable(),
    classeProfessionista: z.string().optional().nullable(),
    classeIrapProfessionista: z.string().optional().nullable(),
    classeIva: z.string().optional().nullable(),
    
    // Conti Collegati
    contoCostiRicavi: z.string().optional().nullable(),
    contoDareCee: z.string().optional().nullable(),
    contoAvereCee: z.string().optional().nullable(),
    
    // Gestione Speciale
    naturaConto: z.string().optional().nullable(),
    gestioneBeniAmmortizzabili: z.string().optional().nullable(),
    percDeduzioneManutenzione: z.number().optional().nullable(),
    dettaglioClienteFornitore: z.string().optional().nullable(),
    
    // Descrizioni Bilancio
    descrizioneBilancioDare: z.string().optional().nullable(),
    descrizioneBilancioAvere: z.string().optional().nullable(),
    
    // Dati Extracontabili
    classeDatiExtracontabili: z.string().optional().nullable(),
    
    // Registri Professionisti
    colonnaRegistroCronologico: z.string().optional().nullable(),
    colonnaRegistroIncassiPagamenti: z.string().optional().nullable(),
});

export const commessaSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    descrizione: z.string().optional(),
    clienteId: z.string().min(1, "È obbligatorio selezionare un cliente."),
    parentId: z.string().optional().nullable(),
});

export const clienteSchema = z.object({
  id: z.string().optional(),
  externalId: z.string().optional().nullable(),
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  piva: z.string().optional().nullable(),
  codiceFiscale: z.string().optional().nullable(),
  cap: z.string().optional().nullable(),
  codicePagamento: z.string().optional().nullable(),
  codiceValuta: z.string().optional().nullable(),
  cognome: z.string().optional().nullable(),
  comune: z.string().optional().nullable(),
  comuneNascita: z.string().optional().nullable(),
  dataNascita: z.date().optional().nullable(),
  indirizzo: z.string().optional().nullable(),
  nazione: z.string().optional().nullable(),
  nomeAnagrafico: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  sesso: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  tipoAnagrafica: z.string().optional().nullable(),
  
  // Estensioni
  codiceAnagrafica: z.string().optional().nullable(),
  tipoConto: z.string().optional().nullable(),
  tipoContoDesc: z.string().optional().nullable(),
  tipoSoggetto: z.string().optional().nullable(),
  tipoSoggettoDesc: z.string().optional().nullable(),
  denominazione: z.string().optional().nullable(),
  sessoDesc: z.string().optional().nullable(),
  prefissoTelefono: z.string().optional().nullable(),
  codiceIso: z.string().optional().nullable(),
  idFiscaleEstero: z.string().optional().nullable(),
  
  // Sottoconti
  sottocontoAttivo: z.string().optional().nullable(),
  sottocontoCliente: z.string().optional().nullable(),
  sottocontoFornitore: z.string().optional().nullable(),
  
  // Codici Pagamento
  codiceIncassoCliente: z.string().optional().nullable(),
  codicePagamentoFornitore: z.string().optional().nullable(),
  
  // Flags
  ePersonaFisica: z.boolean().optional().nullable(),
  eCliente: z.boolean().optional().nullable(),
  eFornitore: z.boolean().optional().nullable(),
  haPartitaIva: z.boolean().optional().nullable(),
});

export const fornitoreSchema = clienteSchema.extend({
  aliquota: z.number().optional().nullable(),
  attivitaMensilizzazione: z.number().int().optional().nullable(),
  codiceRitenuta: z.string().optional().nullable(),
  contributoPrevidenziale: z.boolean().optional().nullable(),
  contributoPrevidenzialeL335: z.string().optional().nullable(),
  enasarco: z.boolean().optional().nullable(),
  gestione770: z.boolean().optional().nullable(),
  percContributoCassaPrev: z.number().optional().nullable(),
  quadro770: z.string().optional().nullable(),
  soggettoInail: z.boolean().optional().nullable(),
  soggettoRitenuta: z.boolean().optional().nullable(),
  tipoRitenuta: z.string().optional().nullable(),
  
  // Descrizioni aggiuntive
  quadro770Desc: z.string().optional().nullable(),
  tipoRitenutaDesc: z.string().optional().nullable(),
  contributoPrevid335Desc: z.string().optional().nullable(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
export type FornitoreFormValues = z.infer<typeof fornitoreSchema>;