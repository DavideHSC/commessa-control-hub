Assolutamente. Analizziamo l'ultimo tracciato, `CODICIVA.TXT`, che è la tabella dei codici IVA. Questo file è cruciale per tutte le operazioni fiscalmente rilevanti e lavora in stretta sinergia con la causale contabile e i movimenti.

### 1. Rappresentazione del Tracciato (formato Excel-like)

Ecco la struttura completa del file `CODICIVA.TXT`.

*   **Scopo:** Tabella dei Codici IVA (aliquote, esenzioni, non imponibilità, ecc.).
*   **Lunghezza Record:** 162 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato. |
| TABELLA ITALSTUDIO (X) | A | 1 | 4 | 4 | Campo riservato, non utilizzare. |
| **CODICE IVA** | A | 4 | 5 | 8 | **Primary Key:** Codice univoco dell'aliquota/esenzione IVA. |
| DESCRIZIONE | A | 40 | 9 | 48 | Descrizione estesa del codice IVA. |
| TIPO CALCOLO | A | 1 | 49 | 49 | N=Nessuno, O=Normale, S=Scorporo, E=Esente, etc. |
| ALIQUOTA IVA (999.99) | N | 6 | 50 | 55 | Percentuale dell'aliquota (es. '02200' per 22.00%). |
| PERCENTUALE D'INDETRAIBILITA' | N | 3 | 56 | 58 | Percentuale di indetraibilità (0-100). |
| NOTE | A | 40 | 59 | 98 | Note descrittive aggiuntive. |
| DATA INIZIO VALIDITA' (GGMMAAAA)| N | 8 | 99 | 106 | Data di inizio validità del codice. |
| DATA FINE VALIDITA' (GGMMAAAA) | N | 8 | 107 | 114 | Data di fine validità del codice. |
| IMPONIBILE 50% CORRISPETTIVI (X)| A | 1 | 115 | 115 | Flag (X) per gestione speciale corrispettivi. |
| IMPOSTA INTRATTENIMENTI | A | 2 | 116 | 117 | Percentuale per imposta su intrattenimenti (6, 8, 10, ...). |
| VENTILAZIONE ALIQUOTA DIVERSA (X)| A | 1 | 118 | 118 | Flag (X) se usa aliquota diversa per ventilazione. |
| ALIQUOTA DIVERSA (999.99) | N | 6 | 119 | 124 | Valore dell'aliquota diversa. |
| PLAFOND ACQUISTI | A | 1 | 125 | 125 | I=Interno/Intra, E=Importazioni. |
| MONTE ACQUISTI (X) | A | 1 | 126 | 126 | Flag (X) se concorre al monte acquisti. |
| PLAFOND VENDITE | A | 1 | 127 | 127 | E=Esportazioni. |
| NO VOLUME D'AFFARI PLAFOND (X) | A | 1 | 128 | 128 | Flag (X) per escludere dal volume d'affari per Plafond. |
| GESTIONE PRO RATA | A | 1 | 129 | 129 | D=Volume d'affari, E=Esente, N=Escluso. |
| ACQ. OPERAZ. IMPONIBILI OCC. (X)| A | 1 | 130 | 130 | Flag (X) per acquisti occasionali. |
| COMUNICAZIONE DATI IVA VENDITE | A | 1 | 131 | 131 | Raccordo per la comunicazione dati IVA (Spesometro). |
| AGEVOLAZIONI SUBFORNITURE (X) | A | 1 | 132 | 132 | Flag (X) per regime di subfornitura. |
| COMUNICAZIONE DATI IVA ACQUISTI | A | 1 | 133 | 133 | Raccordo per la comunicazione dati IVA (Spesometro). |
| AUTOFATTURA REVERSE CHARGE (X) | A | 1 | 134 | 134 | Flag (X) se il codice attiva il meccanismo del reverse charge. |
| OPERAZIONE ESENTE OCCASIONALE (X)| A | 1 | 135 | 135 | Flag (X) per operazione esente occasionale. |
| CES. ART.38 QUATER C.2 (X) | A | 1 | 136 | 136 | Flag (X) per storno IVA (Tax Free Shopping). |
| PERC. DA DETRARRE SU EXPORT (Agr)| N | 6 | 137 | 142 | Percentuale specifica per regime agricoltura. |
| ACQUISTI/CESSIONI (Agricoltura) | A | 1 | 143 | 143 | A=Tabella A1, B=Beni attività connesse. |
| PERCENTUALE COMPENSAZ. (Agric.)| N | 6 | 144 | 149 | Percentuale di compensazione per regime agricoltura. |
| BENI AMMORTIZZABILI (Agric.) (X)| A | 1 | 150 | 150 | Flag (X) se bene ammortizzabile in regime agricolo. |
| INDICATORE TERRIT. VENDITE (AgV)| A | 2 | 151 | 152 | VC=CEE, VX=Extra CEE, VM=Mista (per Agenzie Viaggio). |
| PROVVIGIONI DM 340/99 (AgV) (X)| A | 1 | 153 | 153 | Flag (X) per provvigioni specifiche agenzie viaggio. |
| INDICATORE TERRIT. ACQUISTI (AgV)| A | 2 | 154 | 155 | AC, AX, MC, MX (per Agenzie Viaggio). |
| METODO DA APPLICARE (Beni Usati)| A | 1 | 156 | 156 | T=Analitico/Globale, F=Forfetario. |
| PERCENTUALE FORFETARIA (Beni Usati)| A | 2 | 157 | 158 | Percentuale forfetaria (25, 50, 60). |
| ANALITICO (BENI AMM.) (B.U.) (X)| A | 1 | 159 | 159 | Flag (X) per metodo analitico su beni ammortizzabili. |
| QUOTA FORFETARIA (Intratt.) | A | 1 | 160 | 160 | 1=1/10, 2=1/2, 3=1/3. |
| ACQUISTI INTRACOMUNITARI (X) | A | 1 | 161 | 161 | Flag (X) se è un acquisto intracomunitario. |
| CESSIONE PRODOTTI EDITORIALI | A | 1 | 162 | 162 | Flag (X) per regime speciale editoria. |
| CRLF | E | 2 | 163 | 164 | Fine record. |

---
### 2. Cosa Rappresenta il File?

Il file `CODICIVA.TXT` è la **tabella delle codifiche IVA**. Ogni record definisce le proprietà e il comportamento di un'aliquota, di un'esenzione o di una qualsiasi altra tipologia di gestione IVA. È la base per tutti i calcoli fiscali relativi all'Imposta sul Valore Aggiunto.

Caratteristiche principali:
*   **Calcolo:** Il campo `TIPO CALCOLO` è fondamentale. Specifica se l'IVA deve essere calcolata in modo normale, scorporata, o se si tratta di un'operazione non soggetta.
*   **Aliquote e Indetraibilità:** Definisce il valore numerico dell'aliquota e l'eventuale percentuale di indetraibilità (es. per spese auto).
*   **Regimi Speciali:** Contiene numerosi campi specifici per gestire regimi IVA particolari come il Plafond, il Pro-Rata, le agenzie di viaggio, i beni usati, l'agricoltura e il reverse charge.
*   **Raccordi Fiscali:** Similmente al piano dei conti, i campi `COMUNICAZIONE DATI IVA` servono a classificare l'operazione per adempimenti come lo "spesometro" o la dichiarazione IVA annuale.

---
### 3. Relazioni con gli Altri Tracciati

La tabella dei codici IVA è una tabella "master" che viene referenziata principalmente dai movimenti IVA.

| File Sorgente | Campo Chiave Sorgente | File Destinazione | Campo Chiave Destinazione | Descrizione della Relazione |
| :--- | :--- | :--- | :--- | :--- |
| **CODICIVA.TXT** | `CODICE IVA` (pos. 5) | **PNRIGIVA.TXT** | `CODICE IVA` (pos. 16) | **Questa è la relazione chiave.** Ogni riga nel file `PNRIGIVA.TXT` (il "castelletto IVA" di una fattura) deve specificare quale codice IVA applicare. Il software usa questo codice per recuperare dal file `CODICIVA.TXT` l'aliquota, il tipo di calcolo e tutte le altre proprietà necessarie per calcolare correttamente imposta e imponibile. |
| **CODICIVA.TXT** | `CODICE IVA` (pos. 5) | **CAUSALI.TXT** | `CONTO IVA` (pos. 71) e `CONTO IVA VENDITE` (pos. 83) | Sebbene la relazione sia indiretta (passa attraverso il Piano dei Conti), una causale può avere un `CONTO IVA` predefinito. Quel conto IVA, a sua volta, ha spesso un codice IVA associato per default nelle sue proprietà, creando un legame logico. |

---
### 4. Codice TypeScript per il Parsing

Ecco un esempio di codice TypeScript per interpretare i dati di questo tracciato.

```typescript
// Definizione dell'interfaccia per una rappresentazione strutturata dei dati
interface ICodiceIva {
  codiceIva: string;
  descrizione: string;
  tipoCalcolo: 'Nessuno' | 'Normale' | 'Solo imposta' | 'Imposta non assolta' | 'Scorporo' | 'Scorporo per intrattenimento' | 'Esente/Non imponibile/Escluso' | 'Ventilazione corrispettivi';
  aliquota: number;
  percentualeIndetraibilita?: number;
  note?: string;
  gestioniFiscali: {
    autofatturaReverseCharge: boolean;
    gestioneProRata: 'Volume d\'affari' | 'Esente' | 'Escluso';
    plafondAcquisti?: 'Interno/Intra' | 'Importazioni';
    plafondVendite?: 'Esportazioni';
  };
  regimiSpeciali?: {
    agricoltura?: {
      percentualeCompensazione: number;
    };
    agenzieViaggio?: {
      indicatoreTerritorialeVendite?: 'CEE' | 'Extra CEE' | 'Mista';
      indicatoreTerritorialeAcquisti?: 'CEE' | 'Extra CEE' | 'Misto CEE' | 'Misto Extra CEE';
    };
    beniUsati?: {
      metodo: 'Analitico/Globale' | 'Forfetario';
      percentualeForfetaria?: 25 | 50 | 60;
    };
  };
}

/**
 * Esegue il parsing di una singola riga del file CODICIVA.TXT
 * @param line Una stringa corrispondente a una riga del file
 * @returns Un oggetto ICodiceIva
 */
function parseCodiceIva(line: string): ICodiceIva {
  if (line.length < 162) {
    throw new Error("La riga non ha la lunghezza minima richiesta di 162 caratteri.");
  }
  
  const getFlag = (pos: number): boolean => line.substring(pos - 1, pos).toUpperCase() === 'X';
  const getNum = (start: number, len: number): number => {
      const val = line.substring(start - 1, start - 1 + len).trim();
      return val ? parseFloat(val.replace(',', '.')) : 0;
  };
  
  const getTipoCalcolo = (code: string): ICodiceIva['tipoCalcolo'] => {
      switch(code) {
          case 'N': return 'Nessuno';
          case 'O': return 'Normale';
          case 'A': return 'Solo imposta';
          case 'I': return 'Imposta non assolta';
          case 'S': return 'Scorporo';
          case 'T': return 'Scorporo per intrattenimento';
          case 'E': return 'Esente/Non imponibile/Escluso';
          case 'V': return 'Ventilazione corrispettivi';
          default: throw new Error(`Tipo calcolo non valido: ${code}`);
      }
  };

  const codiceIva: ICodiceIva = {
    codiceIva: line.substring(4, 8).trim(),
    descrizione: line.substring(8, 48).trim(),
    tipoCalcolo: getTipoCalcolo(line.substring(48, 49)),
    aliquota: getNum(50, 6) / 100, // Converte da 999.99 a 9.99
    percentualeIndetraibilita: getNum(56, 3),
    note: line.substring(58, 98).trim() || undefined,
    gestioniFiscali: {
      autofatturaReverseCharge: getFlag(134),
      gestioneProRata: 'Escluso', // Default
    },
  };

  switch(line.substring(128, 129)) {
      case 'D': codiceIva.gestioniFiscali.gestioneProRata = 'Volume d\'affari'; break;
      case 'E': codiceIva.gestioniFiscali.gestioneProRata = 'Esente'; break;
  }

  return codiceIva;
}

/**
 * Esegue il parsing di un intero file di testo dei Codici IVA.
 * @param fileContent Contenuto del file CODICIVA.TXT
 * @returns Un array di oggetti ICodiceIva
 */
function parseFileCodiciIva(fileContent: string): ICodiceIva[] {
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => parseCodiceIva(line));
}
```