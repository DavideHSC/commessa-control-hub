// Questo file conterrà tutti i dati mock per la nostra demo.
// Simula un database a cui l'applicazione accederà tramite un layer API fittizio.

import { VoceAnalitica, Conto, Commessa, CausaleContabile, ScritturaContabile } from '../types';

// ====================================================================
// 1. VOCI ANALITICHE (ex Centri di Costo)
// Basate sulle colonne del file Excel del cliente e del file di testo.
// ====================================================================
export const vociAnalitiche: VoceAnalitica[] = [
  { id: '1', nome: 'Personale', descrizione: 'Costi relativi al personale dipendente' },
  { id: '2', nome: 'Gestione Automezzi', descrizione: 'Costi per la manutenzione e gestione della flotta' },
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
  { id: '10', nome: 'Servizi Generali', descrizione: 'Costi per servizi non direttamente attribuibili' },
];

// ====================================================================
// 2. PIANO DEI CONTI (un estratto significativo)
// Arricchito con 'tipo' e 'centroDiCostoSuggeritoId' per i nostri automatismi.
// I dati sono presi come spunto dallo screenshot e dal file del cliente.
// ====================================================================
export const pianoDeiConti: Conto[] = [
  // --- COSTI ---
  // Acquisti
  { id: '60100001', codice: '60100001', nome: 'MERCE C/ACQUISTI', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '12', vociAnaliticheAbilitateIds: ['12'], voceAnaliticaId: null },
  { id: '6005000150', codice: '6005000150', nome: 'ACQUISTI MATERIALE DI CONSUMO', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '12', vociAnaliticheAbilitateIds: ['4', '7', '12'], voceAnaliticaId: null },
  { id: '60100002', codice: '60100002', nome: 'ACQUISTI PRESTAZIONI DI SERVIZI', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '5', vociAnaliticheAbilitateIds: ['5', '6', '11', '13', '14'], voceAnaliticaId: null },
  { id: '6005000350', codice: '6005000350', nome: 'ACQUISTO FIORI E PIANTE', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '15', vociAnaliticheAbilitateIds: ['15'], voceAnaliticaId: null },

  // Costi del personale
  { id: '6310000500', codice: '6310000500', nome: 'SALARI E STIPENDI', tipo: 'Costo', voceAnaliticaSuggeritaId: '1', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['1'], voceAnaliticaId: null },
  { id: '6340000650', codice: '6340000650', nome: 'BUONI PASTO', tipo: 'Costo', voceAnaliticaSuggeritaId: '1', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['1'], voceAnaliticaId: null },

  // Costi per servizi
  { id: '6005000850', codice: '6005000850', nome: 'CARBURANTI E LUBRIFICANTI', tipo: 'Costo', voceAnaliticaSuggeritaId: '2', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['2', '8'], contropartiteSuggeriteIds: ['FOR001', '45.01.001'], voceAnaliticaId: null },
  { id: '6015000800', codice: '6015000800', nome: 'MANUTENZIONI E RIPARAZIONI AUTOMEZZI', tipo: 'Costo', voceAnaliticaSuggeritaId: '2', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['2', '8'], contropartiteSuggeriteIds: ['FOR999', '45.01.001'], voceAnaliticaId: null },
  { id: '6015001800', codice: '6015001800', nome: 'ASSICURAZIONI OBBLIGATORIE AUTOMEZZI', tipo: 'Costo', voceAnaliticaSuggeritaId: '2', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['2', '8'], contropartiteSuggeriteIds: ['FOR002', '45.01.001'], voceAnaliticaId: null },
  { id: '6015000750', codice: '6015000750', nome: 'MANUTENZIONI E RIPARAZIONI ATTREZZATURE', tipo: 'Costo', voceAnaliticaSuggeritaId: '3', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['3', '9'], voceAnaliticaId: null },
  { id: '6008001114', codice: '6008001114', nome: 'SACCHI E BIDONI', tipo: 'Costo', voceAnaliticaSuggeritaId: '4', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['4'], voceAnaliticaId: null },
  { id: '6015010103', codice: '6015010103', nome: 'SELEZIONE/TRATTAMENTO RIF.INGOMBRANTI', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '13', vociAnaliticheAbilitateIds: ['13'], voceAnaliticaId: null },
  { id: '6015010104', codice: '6015010104', nome: 'CONFERIMENTO RIFIUTI ORGANICI', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '14', vociAnaliticheAbilitateIds: ['14'], voceAnaliticaId: null },
  
  // Costi diversi
  { id: '60100013', codice: '60100013', nome: 'ANTIVIRUS E SOFTWARE', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '12', vociAnaliticheAbilitateIds: ['12'], voceAnaliticaId: null },
  { id: '6020000250', codice: '6020000250', nome: 'AFFITTI UFFICI', tipo: 'Costo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '10', vociAnaliticheAbilitateIds: ['10'], voceAnaliticaId: null },
  { id: '7820000880', codice: '7820000880', nome: 'TARI (TASSA RIFIUTI)', tipo: 'Costo', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  
  // --- RICAVI ---
  { id: '5510001122', codice: '5510001122', nome: 'RICAVI DA CONVENZIONE', tipo: 'Ricavo', richiedeVoceAnalitica: false, contropartiteSuggeriteIds: ['CLI001', 'CLI002', 'CLI003', '45.02.001'], voceAnaliticaId: null },
  { id: '5510001121', codice: '5510001121', nome: 'RICAVI DA RACCOLTA DIFFERENZIATA', tipo: 'Ricavo', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['13', '14'], voceAnaliticaId: null },
  { id: '50100002', codice: '50100002', nome: 'RICAVI PRESTAZIONI DI SERVIZI', tipo: 'Ricavo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '5', vociAnaliticheAbilitateIds: ['5', '6', '11'], voceAnaliticaId: null },
  { id: '5510001132', codice: '5510001132', nome: 'RICAVI DA MANUT. VERDE PUBBLICO', tipo: 'Ricavo', richiedeVoceAnalitica: true, voceAnaliticaSuggeritaId: '15', vociAnaliticheAbilitateIds: ['15'], voceAnaliticaId: null },
  { id: '5560000950', codice: '5560000950', nome: 'RISARCIMENTI ASSICURATIVI', tipo: 'Ricavo', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  
  // --- CONTI PATRIMONIALI E FINANZIARI ---
  { id: '45.01.001', codice: '45.01.001', nome: 'IVA NS/CREDITO', tipo: 'Patrimoniale', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: '45.02.001', codice: '45.02.001', nome: 'IVA NS/DEBITO', tipo: 'Patrimoniale', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: '10.01.001', codice: '10.01.001', nome: 'BANCA INTESA SANPAOLO', tipo: 'Patrimoniale', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: '1010001', codice: '1010001', nome: 'CASSA CONTANTI', tipo: 'Patrimoniale', richiedeVoceAnalitica: false, voceAnaliticaId: null },

  // Clienti
  { id: 'CLI001', codice: 'CLI001', nome: 'COMUNE DI SORRENTO', tipo: 'Cliente', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'CLI002', codice: 'CLI002', nome: 'COMUNE DI VICO EQUENSE', tipo: 'Cliente', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'CLI003', codice: 'CLI003', nome: 'COMUNE DI PIANO DI SORRENTO', tipo: 'Cliente', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'CLI999', codice: 'CLI999', nome: 'CLIENTE GENERICO SPA', tipo: 'Cliente', richiedeVoceAnalitica: false, voceAnaliticaId: null },

  // Fornitori
  { id: 'FOR001', codice: '4010001', nome: 'ROSSI CARBURANTI SRL', tipo: 'Fornitore', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'FOR002', codice: '4010002', nome: 'ASSICURAZIONI GENERALI SPA', tipo: 'Fornitore', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'FOR003', codice: '4010003', nome: 'SOFTWARE SICURO SRL', tipo: 'Fornitore', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: 'FOR999', codice: '4019999', nome: 'FORNITORE GENERICO SPA', tipo: 'Fornitore', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: '4010000001', codice: '4010000001', nome: 'Fornitore ENI', tipo: 'Fornitore', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  { id: '4010000002', codice: '4010000002', nome: 'Cliente ACME S.p.A.', tipo: 'Cliente', richiedeVoceAnalitica: false, voceAnaliticaId: null },
  
  // Duplicati da revisionare - per ora li sistemo per far compilare il codice
  { id: '6005000850-2', codice: '6005000850', nome: 'CARBURANTI E LUBRIFICANTI', tipo: 'Costo', voceAnaliticaSuggeritaId: '2', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['2', '8'], voceAnaliticaId: null },
  { id: '60100002-2', codice: '60100002', nome: 'ACQUISTI PRESTAZIONI DI SERVIZI', tipo: 'Costo', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['5', '6', '11', '13', '14'], voceAnaliticaId: null },
  { id: '7001000001', codice: '7001000001', nome: 'RICAVI PER SERVIZI', tipo: 'Ricavo', richiedeVoceAnalitica: true, vociAnaliticheAbilitateIds: ['5', '6', '11'], voceAnaliticaId: null },
];


// ====================================================================
// 3. COMMESSE (con budget mockato dal foglio "Sorrento")
// ====================================================================
export const commesse: Commessa[] = [
    {
        id: 'SORRENTO_2025',
        nome: 'Comune di Sorrento (2025)',
        clienteId: 'CLI001',
        cliente: { id: 'CLI001', nome: 'COMUNE DI SORRENTO' },
        budget: [
            { voceAnaliticaId: '1', importo: 2274867 },
            { voceAnaliticaId: '2', importo: 358625 },
            { voceAnaliticaId: '3', importo: 17000 },
            { voceAnaliticaId: '4', importo: 90000 },
            { voceAnaliticaId: '5', importo: 32880 },
            { voceAnaliticaId: '6', importo: 184875 },
            { voceAnaliticaId: '7', importo: 80000 },
            { voceAnaliticaId: '8', importo: 222552 },
            { voceAnaliticaId: '9', importo: 71855 },
            { voceAnaliticaId: '10', importo: 83759 },
            { voceAnaliticaId: '11', importo: 220244 },
            { voceAnaliticaId: '12', importo: 307000 + 276056 + 30000 - 218370 },
            { voceAnaliticaId: '13', importo: 279900 },
            { voceAnaliticaId: '15', importo: 50000 },
        ]
    },
    {
        id: 'PIANO_SORR_2025',
        nome: 'Comune di Piano di Sorrento (2025)',
        clienteId: 'CLI003',
        cliente: { id: 'CLI003', nome: 'COMUNE DI PIANO DI SORRENTO' },
        budget: [
            { voceAnaliticaId: '1', importo: 1000000 },
            { voceAnaliticaId: '2', importo: 150000 },
            { voceAnaliticaId: '4', importo: 50000 },
        ]
    },
    {
        id: 'MASSA_LUB_2025',
        nome: 'Comune di Massa Lubrense (2025)',
        clienteId: 'CLI999',
        cliente: { id: 'CLI999', nome: 'CLIENTE GENERICO SPA' },
        budget: [
            { voceAnaliticaId: '1', importo: 1800000 },
            { voceAnaliticaId: '2', importo: 250000 },
            { voceAnaliticaId: '8', importo: 100000 },
        ]
    },
    { id: 'SORRENTO', nome: 'Comune di Sorrento', clienteId: 'CLI001', cliente: { id: 'CLI001', nome: 'COMUNE DI SORRENTO' }, budget: [ { voceAnaliticaId: '1', importo: 10000 }, { voceAnaliticaId: '2', importo: 5000 } ] },
    { id: 'NAPOLI', nome: 'Comune di Napoli', clienteId: 'CLI002', cliente: { id: 'CLI002', nome: 'COMUNE DI VICO EQUENSE' }, budget: [ { voceAnaliticaId: '1', importo: 20000 }, { voceAnaliticaId: '10', importo: 8000 } ] },
];

// ====================================================================
// 4. CAUSALI CONTABILI (con i loro template)
// RIMOSSO - Ora gestito direttamente in prisma/seed.ts per maggiore robustezza
// ====================================================================


// =================================================================================
// 5. REGISTRAZIONI CONTABILI (PRIMA NOTA)
// =================================================================================
export const scrittureContabili: ScritturaContabile[] = [
  {
    id: 'reg-1716135384238',
    data: '2024-05-19',
    causaleId: 'FATT_VEND_PRODOTTI',
    descrizione: 'Fattura n.1 del 19/05/2024',
    righe: [
      {
        id: 'riga-1716135384238',
        contoId: 'CLI001',
        descrizione: 'COMUNE DI SORRENTO',
        dare: 3000,
        avere: 0,
        allocazioni: []
      },
      {
        id: 'riga-1716135394238',
        contoId: '45.02.001',
        descrizione: 'IVA NS/DEBITO',
        dare: 0,
        avere: 660,
        allocazioni: []
      },
      {
        id: 'riga-1716135404238',
        contoId: '5510001122',
        descrizione: 'RICAVI DA CONVENZIONE',
        dare: 0,
        avere: 2340,
        allocazioni: []
      }
    ],
    datiAggiuntivi: {
      clienteId: 'CLI001',
      totaleFattura: 3000,
      aliquotaIva: 22
    }
  }
];

// Altri dati mock (Causali, Scritture) verranno aggiunti in seguito.

export {}; 