// Questo file conterrà tutti i dati mock per la nostra demo.
// Simula un database a cui l'applicazione accederà tramite un layer API fittizio.

import { CentroDiCosto, Conto, Commessa, CausaleContabile } from '../types';

// ====================================================================
// 1. CENTRI DI COSTO
// Basati sulle colonne del file Excel del cliente e del file di testo.
// ====================================================================
export const centriDiCosto: CentroDiCosto[] = [
  { id: '1', nome: 'Personale' },
  { id: '2', nome: 'Gestione Automezzi' },
  { id: '3', nome: 'Gestione Attrezzature' },
  { id: '4', nome: 'Sacchi e Bidoni' },
  { id: '5', nome: 'Servizi Esternalizzati' },
  { id: '6', nome: 'Pulizia Strade e Diserbo' },
  { id: '7', nome: 'Gestione Aree Operative' },
  { id: '8', nome: 'Amm. Automezzi' },
  { id: '9', nome: 'Amm. Attrezzature' },
  { id: '10', nome: 'Locazione Sedi e Aree' },
  { id: '11', nome: 'Trasporti Esternalizzati' },
  { id: '12', nome: 'Spese Generali e Amministrative' },
  { id: '13', nome: 'Selezione e Trattamento Rifiuti' },
  { id: '14', nome: 'Conferimento Organico e Sfalci' },
  { id: '15', nome: 'Fioriture e Verde Pubblico' },
];

// ====================================================================
// 2. PIANO DEI CONTI (un estratto significativo)
// Arricchito con 'tipo' e 'centroDiCostoSuggeritoId' per i nostri automatismi.
// I dati sono presi come spunto dallo screenshot e dal file del cliente.
// ====================================================================
export const pianoDeiConti: Conto[] = [
  // --- COSTI ---
  // Acquisti
  { id: '60100001', codice: '60100001', nome: 'MERCE C/ACQUISTI', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '12' },
  { id: '6005000150', codice: '6005000150', nome: 'ACQUISTI MATERIALE DI CONSUMO', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '12' },
  { id: '60100002', codice: '60100002', nome: 'ACQUISTI PRESTAZIONI DI SERVIZI', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '5' },
  { id: '6005000350', codice: '6005000350', nome: 'ACQUISTO FIORI E PIANTE', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '15' },

  // Costi del personale
  { id: '6310000500', codice: '6310000500', nome: 'SALARI E STIPENDI', tipo: 'Costo', centroDiCostoSuggeritoId: '1', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['1'] },
  { id: '6340000650', codice: '6340000650', nome: 'BUONI PASTO', tipo: 'Costo', centroDiCostoSuggeritoId: '1', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['1'] },

  // Costi per servizi
  { id: '6005000850', codice: '6005000850', nome: 'CARBURANTI E LUBRIFICANTI', tipo: 'Costo', centroDiCostoSuggeritoId: '2', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['2', '8'] },
  { id: '6015000800', codice: '6015000800', nome: 'MANUTENZIONI E RIPARAZIONI AUTOMEZZI', tipo: 'Costo', centroDiCostoSuggeritoId: '2', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['2', '8'] },
  { id: '6015001800', codice: '6015001800', nome: 'ASSICURAZIONI OBBLIGATORIE AUTOMEZZI', tipo: 'Costo', centroDiCostoSuggeritoId: '2', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['2', '8'] },
  { id: '6015000750', codice: '6015000750', nome: 'MANUTENZIONI E RIPARAZIONI ATTREZZATURE', tipo: 'Costo', centroDiCostoSuggeritoId: '3', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['3', '9'] },
  { id: '6008001114', codice: '6008001114', nome: 'SACCHI E BIDONI', tipo: 'Costo', centroDiCostoSuggeritoId: '4', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['4'] },
  { id: '6015010103', codice: '6015010103', nome: 'SELEZIONE/TRATTAMENTO RIF.INGOMBRANTI', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '13' },
  { id: '6015010104', codice: '6015010104', nome: 'CONFERIMENTO RIFIUTI ORGANICI', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '14' },
  
  // Costi diversi
  { id: '60100013', codice: '60100013', nome: 'ANTIVIRUS E SOFTWARE', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '12' },
  { id: '6020000250', codice: '6020000250', nome: 'AFFITTI UFFICI', tipo: 'Costo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '10' },
  { id: '7820000880', codice: '7820000880', nome: 'TARI (TASSA RIFIUTI)', tipo: 'Costo', richiedeCentroDiCosto: false },
  
  // --- RICAVI ---
  { id: '5510001122', codice: '5510001122', nome: 'RICAVI DA CONVENZIONE', tipo: 'Ricavo', richiedeCentroDiCosto: false },
  { id: '5510001121', codice: '5510001121', nome: 'RICAVI DA RACCOLTA DIFFERENZIATA', tipo: 'Ricavo', richiedeCentroDiCosto: true, centriDiCostoAbilitatiIds: ['13', '14'] },
  { id: '50100002', codice: '50100002', nome: 'RICAVI PRESTAZIONI DI SERVIZI', tipo: 'Ricavo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '5' },
  { id: '5510001132', codice: '5510001132', nome: 'RICAVI DA MANUT. VERDE PUBBLICO', tipo: 'Ricavo', richiedeCentroDiCosto: true, centroDiCostoSuggeritoId: '15' },
  { id: '5560000950', codice: '5560000950', nome: 'RISARCIMENTI ASSICURATIVI', tipo: 'Ricavo', richiedeCentroDiCosto: false },
  
  // --- CONTI PATRIMONIALI E FINANZIARI ---
  { id: '45.01.001', codice: '45.01.001', nome: 'IVA NS/CREDITO', tipo: 'Patrimoniale' },
  { id: '45.02.001', codice: '45.02.001', nome: 'IVA NS/DEBITO', tipo: 'Patrimoniale' },
  { id: '10.01.001', codice: '10.01.001', nome: 'BANCA INTESA SANPAOLO C/C', tipo: 'Patrimoniale' },
  { id: '1010001', codice: '1010001', nome: 'CASSA CONTANTI', tipo: 'Patrimoniale' },

  // Clienti
  { id: 'CLI001', codice: 'CLI001', nome: 'COMUNE DI SORRENTO', tipo: 'Cliente' },
  { id: 'CLI002', codice: 'CLI002', nome: 'COMUNE DI PIANO DI SORRENTO', tipo: 'Cliente' },
  { id: 'CLI003', codice: 'CLI003', nome: 'COMUNE DI MASSA LUBRENSE', tipo: 'Cliente' },
  { id: 'CLI999', codice: 'CLI999', nome: 'CLIENTE GENERICO SPA', tipo: 'Cliente' },

  // Fornitori
  { id: 'FOR001', codice: '4010001', nome: 'ROSSI CARBURANTI SRL', tipo: 'Fornitore' },
  { id: 'FOR002', codice: '4010002', nome: 'ASSICURAZIONI GENERALI SPA', tipo: 'Fornitore' },
  { id: 'FOR003', codice: '4010003', nome: 'SOFTWARE SICURO SRL', tipo: 'Fornitore' },
  { id: 'FOR999', codice: '4019999', nome: 'FORNITORE GENERICO SPA', tipo: 'Fornitore' },
];


// ====================================================================
// 3. COMMESSE (con budget mockato dal foglio "Sorrento")
// ====================================================================
export const commesse: Commessa[] = [
    {
        id: 'SORRENTO_2025',
        nome: 'Comune di Sorrento (2025)',
        budget: {
            '1': 2274867, // Personale
            '2': 358625,  // Gestione automezzi
            '3': 17000,   // Gestione attrezzature
            '4': 90000,   // Sacchi per raccolte Differenziate...
            '5': 32880,   // Servizi esternalizzati
            '6': 184875,  // Pulizia di strade rurali
            '7': 80000,   // Spese gestione aree operative
            '8': 222552,  // Ammortamento automezzi
            '9': 71855,   // Ammortamento attrezzature
            '10': 83759,  // Locazione sedi operative
            '11': 220244, // Trasporti esternalizzati
            '12': (307000 + 276056 + 30000 - 218370), // Spese Generali + Personale Amm. + Sensibilizzazione - CONAI
            '13': 279900, // Oneri selezione e valorizzazione RD
            '15': 50000,  // Fioriture e Verde Pubblico (valore inventato)
        }
    },
    {
        id: 'PIANO_SORR_2025',
        nome: 'Comune di Piano di Sorrento (2025)',
        budget: {
            '1': 1000000,
            '2': 150000,
            '4': 50000,
        }
    },
    {
        id: 'MASSA_LUB_2025',
        nome: 'Comune di Massa Lubrense (2025)',
        budget: {
            '1': 1800000,
            '2': 250000,
            '8': 100000,
        }
    }
];

// ====================================================================
// 4. CAUSALI CONTABILI (con i loro template)
// ====================================================================
export const causaliContabili: CausaleContabile[] = [
  {
    id: 'FATT_ACQ_MERCI',
    nome: 'Fattura Acquisto Merce/Servizi',
    descrizione: 'Registrazione di una fattura di acquisto di merce o servizi.',
    template: [
      { segno: 'Avere', tipoConto: 'Fornitore', tipoImporto: 'Totale' },
      { segno: 'Dare', tipoConto: 'Costo', tipoImporto: 'Imponibile', contoSuggeritoId: '60100002' }, // Suggerisce ACQUISTI PRESTAZIONI DI SERVIZI
      { segno: 'Dare', tipoConto: 'IVA', tipoImporto: 'IVA', contoSuggeritoId: '45.01.001' },
    ]
  },
  {
    id: 'PAG_FATT_FORN',
    nome: 'Pagamento Fattura Fornitore',
    descrizione: 'Registrazione del pagamento di una fattura a un fornitore.',
    template: [
      { segno: 'Dare', tipoConto: 'Fornitore', tipoImporto: 'Totale' },
      { segno: 'Avere', tipoConto: 'Banca', tipoImporto: 'Totale', contoSuggeritoId: '10.01.001' },
    ]
  },
    {
    id: 'FATT_VENDITA',
    nome: 'Fattura di Vendita',
    descrizione: 'Registrazione di una fattura di vendita a cliente.',
    template: [
      { segno: 'Dare', tipoConto: 'Cliente', tipoImporto: 'Totale' },
      { segno: 'Avere', tipoConto: 'Ricavo', tipoImporto: 'Imponibile', contoSuggeritoId: '5510001122' },
      { segno: 'Avere', tipoConto: 'IVA', tipoImporto: 'IVA', contoSuggeritoId: '45.02.001' },
    ]
  },
];

// Altri dati mock (Causali, Scritture) verranno aggiunti in seguito.

export {}; 