// Questo file conterrà tutte le definizioni di tipo (interfacce) per il nostro dominio di business.
// Manterrà il nostro codice organizzato, riutilizzabile e fortemente tipizzato.

/**
 * Rappresenta un centro di costo o di ricavo, una delle colonne analitiche del foglio Excel.
 * Esempio: "personale", "gestione automezzi", "sacchi".
 */
export interface CentroDiCosto {
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
  // Il motore del nostro automatismo: collega un conto a un centro di costo di default.
  centroDiCostoSuggeritoId?: string; // Es. '2' (gestione automezzi)
  richiedeCentroDiCosto?: boolean; // True se il conto richiede un centro di costo
  centriDiCostoAbilitatiIds?: string[]; // Lista di CdC permessi per questo conto
}

/**
 * Rappresenta una Commessa di lavoro. Contiene i dati anagrafici
 * e la struttura di budget per il confronto con il consuntivo.
 */
export interface Commessa {
  id: string; // Es. 'SORRENTO'
  nome: string; // Es. 'Comune di Sorrento'
  descrizione?: string;
  /**
   * Il budget della commessa, suddiviso per ID del centro di costo.
   * La chiave è l'ID del CentroDiCosto, il valore è l'importo previsto.
   * Esempio: { '1': 2274867, '2': 358625 }
   */
  budget: {
    [centroDiCostoId: string]: number;
  };
}

/**
 * Definisce il template per una registrazione contabile automatica.
 * È il motore degli automatismi di inserimento.
 */
export interface CausaleContabile {
  id: string; // Es. 'FATT_ACQ_MERCI'
  nome: string; // Nome breve, es. "Fattura Acquisto"
  descrizione: string; // Es. 'Registrazione Fattura Acquisto Merce'
  template: MovimentoTemplate[];
}

/**
 * Rappresenta una riga del template di una causale contabile.
 */
export interface MovimentoTemplate {
  segno: 'Dare' | 'Avere';
  // Specifica il tipo di conto da usare, non il conto specifico.
  // Es. 'Fornitore', 'Costo', 'Ricavo', 'IVA', 'Banca'.
  // Il sistema poi chiederà all'utente di selezionare il conto specifico se necessario.
  tipoConto: 'Fornitore' | 'Cliente' | 'Costo' | 'Ricavo' | 'IVA' | 'Banca';
  // Specifica come calcolare l'importo per questa riga.
  tipoImporto: 'Imponibile' | 'IVA' | 'Totale';
  // Se il tipoConto è 'Costo' o 'Ricavo', questo campo può suggerire un conto specifico
  contoSuggeritoId?: string;
}

/**
 * Rappresenta la ripartizione di un importo su una specifica commessa.
 * Questa è l'informazione analitica finale.
 */
export interface Allocazione {
  id: string; // UUID per la riga di allocazione
  commessaId: string;
  tipo: 'importo' | 'percentuale';
  valore: number; // Il valore inserito dall'utente (es. 100€ o 50%)
  importo: number; // L'importo finale calcolato
}

/**
 * Rappresenta una singola riga di dettaglio all'interno di una ScritturaContabile.
 */
export interface RigaScrittura {
  id: string; // UUID per la riga
  contoId: string; // ID del conto movimentato (dal PianoDeiConti)
  descrizione: string;
  dare?: number; // Importo in Dare
  avere?: number; // Importo in Avere
  centroDiCostoId?: string; // ID del centro di costo (se applicabile)
  // Per le righe di costo/ricavo, questa è la lista delle allocazioni analitiche.
  // Una singola riga di costo può essere allocata a più commesse/centri di costo.
  allocazioni?: Allocazione[];
}

/**
 * Rappresenta una registrazione di Prima Nota completa.
 */
export interface ScritturaContabile {
  id: string; // UUID per la registrazione
  data: Date;
  causaleId: string; // ID della causale usata
  descrizione: string;
  righe: RigaScrittura[];
}

export {}; 