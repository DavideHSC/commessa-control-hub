Questo tracciato, `CAUSALI.TXT`, è un altro elemento fondamentale del sistema contabile. Definisce le "causali contabili", che sono codici usati per descrivere la natura di una transazione (es. 'FA' per Fattura di Acquisto, 'FP' per Fattura di Pagamento, 'GIRO' per Giroconto) e per automatizzare gran parte del processo di registrazione.

### 1. Rappresentazione del Tracciato (formato Excel-like)

Ecco la struttura completa del file `CAUSALI.TXT`.

*   **Scopo:** Tabella delle Causali Contabili.
*   **Lunghezza Record:** 171 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato. |
| TABELLA ITALSTUDIO (X) | A | 1 | 4 | 4 | Campo riservato, non utilizzare. |
| **CODICE CAUSALE** | A | 6 | 5 | 10 | **Primary Key:** Codice univoco della causale (es. FA, FP, RI, PG). |
| DESCRIZIONE CAUSALE | A | 40 | 11 | 50 | Descrizione estesa della causale. |
| TIPO MOVIMENTO | A | 1 | 51 | 51 | C=Contabile, I=Contabile/IVA. |
| TIPO AGGIORNAMENTO | A | 1 | 52 | 52 | I=Saldo Iniziale, P=Progressivo, F=Finale. |
| DATA INIZIO VALIDITA' (GGMMAAAA)| N | 8 | 53 | 60 | Data di inizio validità della causale. |
| DATA FINE VALIDITA' (GGMMAAAA) | N | 8 | 61 | 68 | Data di fine validità della causale. |
| TIPO REGISTRO IVA | A | 1 | 69 | 69 | A=Acquisti, C=Corrispettivi, V=Vendite. |
| SEGNO MOVIMENTO IVA | A | 1 | 70 | 70 | I=Incrementa (+), D=Decrementa (-). |
| CONTO IVA | A | 10 | 71 | 80 | Conto IVA predefinito per questa causale. |
| GENERAZIONE AUTOFATTURA (X) | A | 1 | 81 | 81 | Flag (X) se la causale genera un'autofattura. |
| TIPO AUTOFATTURA GENERATA | A | 1 | 82 | 82 | A=Altre, C=CEE, E=Reverse Charge, R=RSM. |
| CONTO IVA VENDITE | A | 10 | 83 | 92 | Conto IVA vendite usato per l'autofattura. |
| FATTURA IMPORTO 0 (X) | A | 1 | 93 | 93 | Flag (X) se la causale gestisce fatture a importo zero. |
| FATTURA IN VALUTA ESTERA (X) | A | 1 | 94 | 94 | Flag (X) se la causale gestisce fatture in valuta. |
| NON CONS. IN LIQUIDAZIONE IVA (X)| A | 1 | 95 | 95 | Flag (X) per escludere il movimento dalla liquidazione IVA. |
| IVA ESIGIBILITA' DIFFERITA | A | 1 | 96 | 96 | N=Nessuna, E=Alla data fattura, I=All'incasso/pagamento. |
| FAT. EMESSA SU REG. CORRISP. (X)| A | 1 | 97 | 97 | Flag (X) se è una fattura emessa su registro corrispettivi. |
| GESTIONE PARTITE | A | 1 | 98 | 98 | N=Nessuna, A=Creazione+Chiusura, C=Creazione, H=Chiusura. |
| GESTIONE INTRASTAT (X) | A | 1 | 99 | 99 | Flag (X) se il movimento è rilevante per Intrastat. |
| GESTIONE RITENUTE/ENASARCO | A | 1 | 100 | 100 | R=Ritenuta, E=Enasarco, T=Entrambi. |
| VERSAMENTO RITENUTE (X) | A | 1 | 101 | 101 | Flag (X) se è una causale di versamento ritenute. |
| NOTE MOVIMENTO | A | 60 | 102 | 161 | Testo predefinito per le note del movimento. |
| DESCRIZIONE DOCUMENTO | A | 5 | 162 | 166 | Descrizione breve del tipo di documento (es. FATT, RICE). |
| ST. ID. ESTERO CLI./FOR. (X) | A | 1 | 167 | 167 | Flag (X) per stampare l'identificativo estero. |
| SCRITTURA RETTIFICA/ASS. (X) | A | 1 | 168 | 168 | Flag (X) se è una scrittura di rettifica o assestamento. |
| NON STAMPARE SU REG. CRON. (X) | A | 1 | 169 | 169 | Flag (X) per escludere dalla stampa di alcuni registri. |
| MOV. SU REG.IVA NON RIL. IVA (X)| A | 1 | 170 | 170 | Flag (X) per movimenti contabili su registri IVA. |
| TIPO MOVIMENTO (Semplificata) | A | 1 | 171 | 171 | C=Costi, R=Ricavi. |
| CRLF | E | 2 | 172 | 173 | Fine record. |

---
### 2. Cosa Rappresenta il File?

Questo file definisce le **regole di comportamento** per ogni tipo di registrazione contabile. Quando un utente inserisce una nuova prima nota, la prima cosa che sceglie è la causale. La causale, a sua volta, pre-imposta e guida il comportamento di tutto il resto della maschera di inserimento e dei calcoli successivi.

In sostanza, la tabella delle causali è il "cervello" che automatizza l'inserimento dati.

Caratteristiche principali:
*   **Automazione:** In base al codice causale, il sistema sa già se deve gestire l'IVA, quale registro IVA movimentare, se gestire le partite e lo scadenzario, se applicare ritenute, etc.
*   **Guida per l'Utente:** La scelta della causale determina quali campi saranno attivi o obbligatori durante la registrazione, semplificando il lavoro e riducendo gli errori.
*   **Standardizzazione:** Assicura che operazioni simili (es. tutte le fatture di acquisto) vengano registrate in modo omogeneo e coerente.

---
### 3. Relazioni con gli Altri Tracciati

La tabella delle causali (`CAUSALI.TXT`) è un'altra tabella "master", fondamentale per i file transazionali.

| File Sorgente | Campo Chiave Sorgente | File Destinazione | Campo Chiave Destinazione | Descrizione della Relazione |
| :--- | :--- | :--- | :--- | :--- |
| **CAUSALI.TXT** | `CODICE CAUSALE` (pos. 5) | **PNTESTA.TXT** | `CODICE CAUSALE` (pos. 40) | **Questa è la relazione più importante.** Ogni movimento contabile registrato in `PNTESTA.TXT` **deve** avere una causale. Il codice causale in `PNTESTA` funge da chiave esterna per "puntare" a un record in `CAUSALI.TXT` e ereditarne tutte le proprietà e le regole di comportamento. |
| **CAUSALI.TXT** | `CONTO IVA` (pos. 71) | **CONTIGEN.TXT** | `CODIFICA` (pos. 6) | La causale può specificare un conto IVA predefinito, che deve esistere nel Piano dei Conti. |
| **CAUSALI.TXT** | `CONTO IVA VENDITE` (pos. 83) | **CONTIGEN.TXT** | `CODIFICA` (pos. 6) | Anche questo conto deve esistere nel Piano dei Conti. |

**Flusso Logico:**
1.  Un utente deve registrare una fattura di acquisto.
2.  Nel software, sceglie la causale "FA" (Fattura Acquisto).
3.  Il sistema legge il record corrispondente a "FA" dalla tabella `CAUSALI.TXT`.
4.  Da questo record, apprende che:
    *   `TIPO MOVIMENTO` è 'I' (Contabile/IVA), quindi abiliterà la sezione IVA.
    *   `TIPO REGISTRO IVA` è 'A' (Acquisti), quindi la registrazione finirà nel registro acquisti.
    *   `GESTIONE PARTITE` è 'C' (Creazione), quindi creerà una nuova partita nello scadenzario fornitori.
    *   `GESTIONE RITENUTE/ENASARCO` è 'R' (Ritenuta), quindi attiverà i campi per il calcolo della ritenuta se il fornitore è un professionista.
5.  Tutte queste impostazioni vengono applicate automaticamente alla registrazione che sta per essere creata nel file `PNTESTA.TXT`.

---
### 4. Codice TypeScript per il Parsing

Ecco un esempio di codice TypeScript per interpretare una riga del file `CAUSALI.TXT`.

```typescript
// Definizione dell'interfaccia per una rappresentazione strutturata dei dati
interface ICausaleContabile {
  codiceCausale: string;
  descrizione: string;
  tipoMovimento: 'Contabile' | 'Contabile/Iva';
  tipoAggiornamento: 'Saldo Iniziale' | 'Saldo Progressivo' | 'Saldo Finale';
  validita?: {
    inizio?: string;
    fine?: string;
  };
  impostazioniIva?: {
    tipoRegistro: 'Acquisti' | 'Corrispettivi' | 'Vendite';
    segnoMovimento: 'Incrementa' | 'Decrementa';
    contoIvaDefault?: string;
    esigibilitaDifferita: 'Nessuna' | 'Fattura' | 'Incasso/Pagamento';
  };
  gestioniSpeciali: {
    generaAutofattura: boolean;
    gestionePartite: 'Nessuna' | 'Creazione+Chiusura' | 'Creazione' | 'Chiusura';
    gestioneIntrastat: boolean;
    gestioneRitenute?: 'Ritenuta' | 'Enasarco' | 'Entrambi';
    versamentoRitenute: boolean;
  };
  noteDefault?: string;
  descrizioneDocumento?: string;
}

/**
 * Esegue il parsing di una singola riga del file CAUSALI.TXT
 * @param line Una stringa corrispondente a una riga del file
 * @returns Un oggetto ICausaleContabile
 */
function parseCausale(line: string): ICausaleContabile {
  if (line.length < 171) {
    throw new Error("La riga non ha la lunghezza minima richiesta di 171 caratteri.");
  }
  
  const getFlag = (pos: number): boolean => line.substring(pos - 1, pos).toUpperCase() === 'X';

  const causale: ICausaleContabile = {
    codiceCausale: line.substring(4, 10).trim(),
    descrizione: line.substring(10, 50).trim(),
    tipoMovimento: line.substring(50, 51) === 'I' ? 'Contabile/Iva' : 'Contabile',
    tipoAggiornamento: line.substring(51, 52) === 'I' ? 'Saldo Iniziale' : (line.substring(51, 52) === 'P' ? 'Saldo Progressivo' : 'Saldo Finale'),
    validita: {
      inizio: line.substring(52, 60).trim() || undefined,
      fine: line.substring(60, 68).trim() || undefined,
    },
    gestioniSpeciali: {
      generaAutofattura: getFlag(81),
      gestioneIntrastat: getFlag(99),
      versamentoRitenute: getFlag(101),
      gestionePartite: 'Nessuna', // Default
      gestioneRitenute: undefined,
    },
    noteDefault: line.substring(101, 161).trim() || undefined,
    descrizioneDocumento: line.substring(161, 166).trim() || undefined,
  };

  // Gestione Partite
  switch (line.substring(97, 98)) {
    case 'A': causale.gestioniSpeciali.gestionePartite = 'Creazione+Chiusura'; break;
    case 'C': causale.gestioniSpeciali.gestionePartite = 'Creazione'; break;
    case 'H': causale.gestioniSpeciali.gestionePartite = 'Chiusura'; break;
  }
  
  // Gestione Ritenute
  switch (line.substring(99, 100)) {
      case 'R': causale.gestioniSpeciali.gestioneRitenute = 'Ritenuta'; break;
      case 'E': causale.gestioniSpeciali.gestioneRitenute = 'Enasarco'; break;
      case 'T': causale.gestioniSpeciali.gestioneRitenute = 'Entrambi'; break;
  }
  
  // Popola la sezione IVA solo se il movimento è di tipo 'Contabile/Iva'
  if (causale.tipoMovimento === 'Contabile/Iva') {
    causale.impostazioniIva = {
      tipoRegistro: line.substring(68, 69) === 'A' ? 'Acquisti' : (line.substring(68, 69) === 'C' ? 'Corrispettivi' : 'Vendite'),
      segnoMovimento: line.substring(69, 70) === 'I' ? 'Incrementa' : 'Decrementa',
      contoIvaDefault: line.substring(70, 80).trim() || undefined,
      esigibilitaDifferita: 'Nessuna', // Default
    };
    switch (line.substring(95, 96)) {
        case 'E': causale.impostazioniIva.esigibilitaDifferita = 'Fattura'; break;
        case 'I': causale.impostazioniIva.esigibilitaDifferita = 'Incasso/Pagamento'; break;
    }
  }

  return causale;
}

/**
 * Esegue il parsing di un intero file di testo delle Causali.
 * @param fileContent Contenuto del file CAUSALI.TXT
 * @returns Un array di oggetti ICausaleContabile
 */
function parseFileCausali(fileContent: string): ICausaleContabile[] {
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => parseCausale(line));
}
```