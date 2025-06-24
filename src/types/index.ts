// Questo file conterrà tutte le definizioni di tipo (interfacce) per il nostro dominio di business.
// Manterrà il nostro codice organizzato, riutilizzabile e fortemente tipizzato.

/**
 * Rappresenta un Cliente.
 */
export interface Cliente {
  id: string;
  nome: string;
  externalId?: string | null;
  piva?: string | null;
  codiceFiscale?: string | null;
  cap?: string | null;
  codicePagamento?: string | null;
  codiceValuta?: string | null;
  cognome?: string | null;
  comune?: string | null;
  comuneNascita?: string | null;
  dataNascita?: Date | null;
  indirizzo?: string | null;
  nazione?: string | null;
  nomeAnagrafico?: string | null;
  provincia?: string | null;
  sesso?: string | null;
  telefono?: string | null;
  tipoAnagrafica?: string | null;

  // Estensioni Fase 1 - Parser Python
  codiceAnagrafica?: string | null;
  tipoConto?: string | null;
  tipoContoDesc?: string | null;
  tipoSoggetto?: string | null;
  tipoSoggettoDesc?: string | null;
  denominazione?: string | null;
  sessoDesc?: string | null;
  prefissoTelefono?: string | null;
  codiceIso?: string | null;
  idFiscaleEstero?: string | null;
  sottocontoAttivo?: string | null;
  sottocontoCliente?: string | null;
  sottocontoFornitore?: string | null;
  codiceIncassoCliente?: string | null;
  codicePagamentoFornitore?: string | null;
  ePersonaFisica?: boolean | null;
  eCliente?: boolean | null;
  eFornitore?: boolean | null;
  haPartitaIva?: boolean | null;
}

/**
 * Rappresenta un Fornitore.
 */
export interface Fornitore {
  id: string;
  nome: string;
  externalId?: string | null;
  piva?: string | null;
  codiceFiscale?: string | null;
  aliquota?: number | null;
  attivitaMensilizzazione?: number | null;
  cap?: string | null;
  codicePagamento?: string | null;
  codiceRitenuta?: string | null;
  codiceValuta?: string | null;
  cognome?: string | null;
  comune?: string | null;
  comuneNascita?: string | null;
  contributoPrevidenziale?: boolean | null;
  contributoPrevidenzialeL335?: string | null;
  dataNascita?: Date | null;
  enasarco?: boolean | null;
  gestione770?: boolean | null;
  indirizzo?: string | null;
  nazione?: string | null;
  nomeAnagrafico?: string | null;
  percContributoCassaPrev?: number | null;
  provincia?: string | null;
  quadro770?: string | null;
  sesso?: string | null;
  soggettoInail?: boolean | null;
  soggettoRitenuta?: boolean | null;
  telefono?: string | null;
  tipoAnagrafica?: string | null;
  tipoRitenuta?: string | null;

  // Estensioni Fase 1 - Parser Python
  codiceAnagrafica?: string | null;
  tipoConto?: string | null;
  tipoContoDesc?: string | null;
  tipoSoggetto?: string | null;
  tipoSoggettoDesc?: string | null;
  denominazione?: string | null;
  sessoDesc?: string | null;
  prefissoTelefono?: string | null;
  codiceIso?: string | null;
  idFiscaleEstero?: string | null;
  sottocontoAttivo?: string | null;
  sottocontoCliente?: string | null;
  sottocontoFornitore?: string | null;
  codiceIncassoCliente?: string | null;
  codicePagamentoFornitore?: string | null;
  ePersonaFisica?: boolean | null;
  eCliente?: boolean | null;
  eFornitore?: boolean | null;
  haPartitaIva?: boolean | null;
  quadro770Desc?: string | null;
  tipoRitenuraDesc?: string | null;
  contributoPrevid335Desc?: string | null;
}

/**
 * Rappresenta un centro di costo o di ricavo, una delle colonne analitiche del foglio Excel.
 * Esempio: "personale", "gestione automezzi", "sacchi".
 */
export interface VoceAnalitica {
  id: string; // Es. '1', '2', '3' come da file Excel
  nome: string; // Es. 'personale', 'gestione automezzi'
  descrizione?: string;
}

/**
 * Rappresenta una voce del Piano dei Conti.
 * Esempio: "6005000850 CARBURANTI E LUBRIFICANTI"
 */
export interface Conto {
  id: string; // Corrisponde al codice conto, es. "6005000850"
  codice: string; // Duplicato dell'id per chiarezza semantica
  nome: string; // Es. "CARBURANTI E LUBRIFICANTI"
  tipo: 'Costo' | 'Ricavo' | 'Patrimoniale' | 'Fornitore' | 'Cliente'; // Ampliato per maggiore specificità
  validoUnicoPf?: boolean;
  validoUnicoSp?: boolean;
  validoUnicoSc?: boolean;
  validoUnicoEnc?: boolean;
  // Il motore del nostro automatismo: collega un conto a un centro di costo di default.
  voceAnaliticaSuggeritaId?: string; // Es. '2' (gestione automezzi)
  richiedeVoceAnalitica?: boolean; // True se il conto richiede una voce analitica
  vociAnaliticheAbilitateIds?: string[]; // Lista di Voci Analitiche permesse per questo conto
  contropartiteSuggeriteIds?: string[]; // Lista di conti suggeriti come contropartita
}

/**
 * Rappresenta una Commessa di lavoro. Contiene i dati anagrafici
 * e la struttura di budget per il confronto con il consuntivo.
 */
export interface BudgetVoce {
  id: string;
  importo: number;
  commessaId: string;
  voceAnaliticaId: string;
  voceAnalitica: VoceAnalitica;
}

export interface Commessa {
  id: string;
  externalId?: string | null;
  nome: string;
  descrizione?: string | null;
  clienteId: string;
  cliente?: Cliente;
  budget?: Partial<BudgetVoce>[];
  allocazioni?: Allocazione[];
  
  // Gerarchia
  parentId?: string | null;
  parent?: Commessa | null;
  children?: Commessa[];
}

/**
 * Campo dati richiesto da una causale per poter generare la scrittura.
 */
export interface CampoDatiPrimari {
  id: 'totaleDocumento' | 'aliquotaIva' | 'fornitoreId' | 'clienteId' | string; // ID univoco del campo
  label: string; // Es. "Totale Documento"
  tipo: 'number' | 'select' | 'text' | 'date';
  riferimentoConto?: 'Fornitore' | 'Cliente'; // Usato se tipo è 'select'
}

/**
 * Definisce il template per una registrazione contabile automatica.
 * È il motore degli automatismi di inserimento.
 */
export interface CausaleContabile {
  id: string;
  codice?: string | null;
  descrizione: string;
  externalId?: string | null;
  nome?: string | null;
  dataFine?: Date | null;
  dataInizio?: Date | null;
  noteMovimento?: string | null;
  tipoAggiornamento?: string | null;
  tipoMovimento?: string | null;
  tipoRegistroIva?: string | null;

  // === ESTENSIONI FASE 1 - PARSER PYTHON ===
  // Descrizioni Decodificate
  tipoMovimentoDesc?: string | null;
  tipoAggiornamentoDesc?: string | null;
  tipoRegistroIvaDesc?: string | null;

  // Gestione IVA
  segnoMovimentoIva?: string | null;
  segnoMovimentoIvaDesc?: string | null;
  contoIva?: string | null;
  contoIvaVendite?: string | null;

  // Autofatture
  generazioneAutofattura?: boolean | null;
  tipoAutofatturaGenerata?: string | null;
  tipoAutofatturaDesc?: string | null;

  // Gestione Fatture
  fatturaImporto0?: boolean | null;
  fatturaValutaEstera?: boolean | null;
  nonConsiderareLiquidazioneIva?: boolean | null;
  fatturaEmessaRegCorrispettivi?: boolean | null;

  // IVA Esigibilità
  ivaEsigibilitaDifferita?: string | null;
  ivaEsigibilitaDifferitaDesc?: string | null;

  // Gestioni Speciali
  gestionePartite?: string | null;
  gestionePartiteDesc?: string | null;
  gestioneIntrastat?: boolean | null;
  gestioneRitenuteEnasarco?: string | null;
  gestioneRitenuteEnasarcoDesc?: string | null;
  versamentoRitenute?: boolean | null;

  // Documenti e Registrazioni
  descrizioneDocumento?: string | null;
  identificativoEsteroClifor?: boolean | null;
  scritturaRettificaAssestamento?: boolean | null;
  nonStampareRegCronologico?: boolean | null;
  movimentoRegIvaNonRilevante?: boolean | null;

  // Contabilità Semplificata
  tipoMovimentoSemplificata?: string | null;
  tipoMovimentoSemplificataDesc?: string | null;
}

/**
 * Rappresenta una riga del template di una causale contabile.
 */
export interface VoceTemplateScrittura {
  sezione: 'Dare' | 'Avere';
  // ID del conto da usare. Può essere un conto generico (es. 'IVA')
  // o un segnaposto che verrà sostituito da un dato primario (es. fornitoreId).
  contoId: string;
  // Specifica come calcolare l'importo per questa riga.
  formulaImporto: 'imponibile' | 'iva' | 'totale';
}

/**
 * Rappresenta la ripartizione di un importo su una specifica commessa e centro di costo.
 * Questa è l'informazione analitica finale.
 */
export interface Allocazione {
  id: string; // UUID per la riga di allocazione
  commessaId: string;
  voceAnaliticaId: string;
  importo: number; // L'importo finale calcolato
  descrizione?: string;
}

/**
 * Rappresenta una singola riga di dettaglio all'interno di una ScritturaContabile.
 */
export interface RigaScrittura {
  id: string;
  descrizione: string;
  dare: number;
  avere: number;
  contoId: string;
  allocazioni: Allocazione[];
  scritturaContabile?: ScritturaContabile;
}

/**
 * Rappresenta una registrazione di Prima Nota completa.
 */
export interface ScritturaContabile {
  id: string; // UUID per la registrazione
  data: string; // Usiamo l'oggetto Date per maneggiarlo più facilmente, lo convertiremo in stringa solo per le API
  causaleId: string; // ID della causale usata (obbligatorio se si usa un automatismo)
  descrizione: string;
  righe: RigaScrittura[];
  fornitore?: Fornitore | null;
  datiAggiuntivi?: {
    fornitoreId?: string | null;
    clienteId?: string | null;
    totaleFattura?: number | string;
    aliquotaIva?: number;
  };
}

// --- Tipi per la Dashboard Commesse ---

/**
 * Rappresenta i dati per una singola card KPI nella dashboard.
 */
export interface CardKPI {
  label: string;
  value: string; // Valore formattato come stringa (es. "€ 1.2M", "33%")
  delta?: string; // Variazione percentuale opzionale (es. "+8.2%")
}

/**
 * Rappresenta una riga nella tabella della dashboard delle commesse.
 */
export interface CommessaRow {
  id: string;
  nome: string;
  codice: string; // Es. CDM-2024-001
  cliente: string;
  stato: 'In Lavorazione' | 'Aperta' | 'Chiusa' | 'Fatturata';
  ricavi: number;
  costi: number;
  marginePercentuale: number; // (ricavi - costi) / ricavi
}

/**
 * L'oggetto dati principale per popolare la nuova dashboard delle commesse.
 */
export interface DashboardCommesseData {
  kpi: {
    commesseAttive: CardKPI;
    ricaviTotali: CardKPI;
    costiTotali: CardKPI;
    margineLordoMedio: CardKPI;
  };
  commesse: CommessaRow[];
}

// --- TIPI PER LA DASHBOARD DI CONTROLLO ---

export interface CommessaDashboard {
  id: string;
  nome: string;
  cliente: {
    id: string;
    nome: string;
  };
  stato: string; // Es. "In Lavorazione", "Chiusa"
  ricavi: number;
  costi: number;
  margine: number; // (ricavi - costi) / ricavi
}

export interface DashboardData {
  commesse: CommessaDashboard[];
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
  };
}

// --- TIPI PER LA GESTIONE DEI TEMPLATE DI IMPORTAZIONE ---

/**
 * Rappresenta la definizione di un singolo campo in un file a larghezza fissa.
 */
export interface FieldDefinition {
  id?: string;
  fieldName?: string;
  start?: number;
  length?: number;
  type?: 'string' | 'number' | 'date';
  fileIdentifier?: string | null;
}

/**
 * Rappresenta un template di importazione completo.
 */
export interface ImportTemplate {
  id: string;
  name: string;
  fieldDefinitions: FieldDefinition[];
}

export interface CodiceIva {
  id: string;
  externalId?: string | null;
  descrizione: string;
  aliquota?: number | null;
  natura?: string | null;
  codiceExport?: string | null;
  inUso?: boolean | null;
  dataAggiornamento?: Date | null;
  note?: string | null;
  indetraibilita?: number | null;
  codice?: string | null;
  tipoCalcolo?: string | null;
  tipoCalcoloDesc?: string | null;
  splitPayment?: boolean | null;
  nonImponibile?: boolean | null;
  imponibile?: boolean | null;
  imposta?: boolean | null;
  esente?: boolean | null;
  nonImponibileConPlafond?: boolean | null;
  inSospensione?: boolean | null;
  esclusoDaIva?: boolean | null;
  reverseCharge?: boolean | null;
  fuoriCampoIva?: boolean | null;

  // Estensioni Fase 1 - Parser Python
  plafondAcquisti?: string | null;
  plafondAcquistiDesc?: string | null;
  monteAcquisti?: boolean | null;
  plafondVendite?: string | null;
  plafondVenditeDesc?: string | null;
  noVolumeAffariPlafond?: boolean | null;
  gestioneProRata?: string | null;
  gestioneProRataDesc?: string | null;
  percentualeCompensazione?: number | null;
  autofatturaReverseCharge?: boolean | null;
  operazioneEsenteOccasionale?: boolean | null;
  cesArt38QuaterStornoIva?: boolean | null;
  agevolazioniSubforniture?: boolean | null;
  indicatoreTerritorialeVendite?: string | null;
  indicatoreTerritorialeVenditeDesc?: string | null;
  indicatoreTerritorialeAcquisti?: string | null;
  indicatoreTerritorialeAcquistiDesc?: string | null;
  beniAmmortizzabili?: boolean | null;
  analiticoBeniAmmortizzabili?: boolean | null;
  comunicazioneDatiIvaVendite?: string | null;
  comunicazioneDatiIvaVenditeDesc?: string | null;
  comunicazioneDatiIvaAcquisti?: string | null;
  comunicazioneDatiIvaAcquistiDesc?: string | null;
  imponibile50Corrispettivi?: boolean | null;
  imposteIntrattenimenti?: string | null;
  imposteIntrattenimentiDesc?: string | null;
  ventilazione?: boolean | null;
  aliquotaDiversa?: number | null;
  percDetrarreExport?: number | null;
  acquistiCessioni?: string | null;
  acquistiCessioniDesc?: string | null;
  metodoDaApplicare?: string | null;
  metodoDaApplicareDesc?: string | null;
  percentualeForfetaria?: string | null;
  percentualeForfetariaDesc?: string | null;
  quotaForfetaria?: string | null;
  quotaForfetariaDesc?: string | null;
  acquistiIntracomunitari?: boolean | null;
  cessioneProdottiEditoriali?: boolean | null;
  provvigioniDm34099?: boolean | null;
  acqOperazImponibiliOccasionali?: boolean | null;
}

export interface CondizionePagamento {
  id: string;
  externalId?: string | null;
  descrizione: string;
  codice?: string | null;
  contoIncassoPagamento?: string | null;
  inizioScadenza?: string | null;
  numeroRate?: number | null;
  suddivisione?: string | null;

  // Estensioni Fase 1 - Parser Python
  calcolaGiorniCommerciali?: boolean | null;
  consideraPeriodiChiusura?: boolean | null;
  suddivisioneDesc?: string | null;
  inizioScadenzaDesc?: string | null;
}

export interface TableStats {
  totaleScrittureContabili: number;
  totaleCommesse: number;
  totaleClienti: number;
  totaleFornitori: number;
  totaleConti: number;
  totaleVociAnalitiche: number;
  totaleCausali: number;
  totaleCodiciIva: number;
  totaleCondizioniPagamento: number;
}

export {}; 