Analisi del file tracciato `CONTIGEN.TXT`.
Descrive la struttura del **Piano dei Conti**, un elemento fondamentale di qualsiasi sistema contabile.

### 1. Rappresentazione del Tracciato (formato Excel-like)

Ecco la struttura completa del file `CONTIGEN.TXT`, che definisce i singoli conti, mastri e sottoconti.

*   **Scopo:** Piano dei Conti (struttura gerarchica dei conti contabili).
*   **Lunghezza Record:** 388 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato. |
| TABELLA ITALSTUDIO (X) | A | 1 | 4 | 4 | Campo riservato, non utilizzare. |
| LIVELLO | A | 1 | 5 | 5 | 1=Mastro, 2=Conto, 3=Sottoconto. |
| **CODIFICA (MM/MMCC/MMCCSSSSSS)** | A | 10 | 6 | 15 | **Primary Key:** Codice del conto (gerarchico). |
| DESCRIZIONE | A | 60 | 16 | 75 | Descrizione del mastro/conto/sottoconto. |
| TIPO | A | 1 | 76 | 76 | P=Patrimoniale, E=Economico, O=Ordine, C=Cliente, F=Fornitore. |
| SIGLA | A | 12 | 77 | 88 | Sigla/Codice mnemonico alternativo per il conto. |
| CONTROLLO SEGNO | A | 1 | 89 | 89 | Se il conto deve movimentare solo in DARE (D) o AVERE (A). |
| CONTO COSTI/RICAVI COLLEGATO | A | 10 | 90 | 99 | Per conti patrimoniali, il conto economico di contropartita. |
| VALIDO PER IMPRESA ORDINARIA (X) | A | 1 | 100 | 100 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER IMPRESA SEMPLIFICATA (X)| A | 1 | 101 | 101 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER PROF. ORDINARIA (X) | A | 1 | 102 | 102 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER PROF. SEMPLIFICATA (X) | A | 1 | 103 | 103 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER UNICO PF (X) | A | 1 | 104 | 104 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO SP (X) | A | 1 | 105 | 105 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO SC (X) | A | 1 | 106 | 106 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO ENC (X) | A | 1 | 107 | 107 | Flag (X) se valido per questo modello di dichiarazione. |
| CODICE CLASSE IRPEF/IRES | A | 10 | 108 | 117 | Raccordo per la dichiarazione dei redditi. |
| CODICE CLASSE IRAP | A | 10 | 118 | 127 | Raccordo per la dichiarazione IRAP. |
| CODICE CLASSE PROFESSIONISTA | A | 10 | 128 | 137 | Raccordo per dichiarazione professionisti. |
| CODICE CLASSE IRAP PROFESSIONISTA| A | 10 | 138 | 147 | Raccordo per dichiarazione IRAP professionisti. |
| CODICE CLASSE IVA | A | 10 | 148 | 157 | Raccordo per la dichiarazione IVA. |
| NUMERO COLONNA REG. CRONOLOGICO | N | 4 | 158 | 161 | Colonna su registro cronologico per professionisti. |
| NUMERO COLONNA REG. INCASSI/PAG | N | 4 | 162 | 165 | Colonna su registro incassi/pagamenti per professionisti. |
| CONTO DARE (CEE) | A | 12 | 166 | 177 | Conto di destinazione nel bilancio CEE (sezione Dare). |
| CONTO AVERE (CEE) | A | 12 | 178 | 189 | Conto di destinazione nel bilancio CEE (sezione Avere). |
| NATURA CONTO | A | 4 | 190 | 193 | Codice che definisce la natura del conto (es. Cassa, Banca). |
| GESTIONE BENI AMMORTIZZABILI | A | 1 | 194 | 194 | M=Materiali, I=Immateriali, S=Fondo Svalutazione. |
| PERC. DED. MANUT. (999.99) | N | 6 | 195 | 200 | Percentuale di deducibilità per costi di manutenzione. |
| FILLER | A | 56 | 201 | 256 | Spazio non utilizzato. |
| GRUPPO | A | 1 | 257 | 257 | A=Attività, C=Costo, P=Passività, R=Ricavo. |
| CODICE CLASSE DATI STUDI SETTORE| A | 10 | 258 | 267 | Raccordo per gli Studi di Settore. |
| DETTAGLIO CLI./FOR. PRIMA NOTA | A | 1 | 268 | 268 | 1=Cliente, 2=Fornitore, 3=Entrambi. |
| DESCRIZIONE BILANCIO DARE | A | 60 | 269 | 328 | Descrizione da usare nei report di bilancio (sezione Dare). |
| DESCRIZIONE BILANCIO AVERE | A | 60 | 329 | 388 | Descrizione da usare nei report di bilancio (sezione Avere). |
| CRLF | E | 2 | 389 | 390 | Fine record. |

---
### 2. Cosa Rappresenta il File?

Il file `CONTIGEN.TXT` rappresenta la **struttura completa e dettagliata del Piano dei Conti** di un'azienda. Non è una lista di movimenti, ma il "vocabolario" di base che permette di classificare ogni transazione economica e finanziaria.

Le sue caratteristiche chiave sono:
*   **Gerarchia:** Il campo `LIVELLO` permette di definire la struttura ad albero tipica del piano dei conti:
    *   **Mastri** (es. "COSTI PER SERVIZI")
    *   **Conti** (es. "SPESE TELEFONICHE")
    *   **Sottoconti** (es. "SPESE TELEFONICHE FISSE", "SPESE TELEFONICHE MOBILI")
*   **Classificazione Contabile:** Il campo `TIPO` (Patrimoniale, Economico, Ordine...) e `GRUPPO` (Attività, Passività, Costo, Ricavo) definiscono la natura del conto, determinando come verrà trattato nei bilanci e nel conto economico.
*   **Raccordi Fiscali:** Una parte molto importante del tracciato è dedicata ai collegamenti con i vari quadri delle dichiarazioni fiscali (IRPEF/IRES, IRAP, IVA, Studi di Settore). Questo permette al software di automatizzare la compilazione dei modelli fiscali partendo dai saldi contabili.
*   **Automazione e Controlli:** Campi come `CONTROLLO SEGNO`, `CONTO COSTI/RICAVI COLLEGATO` e `GESTIONE BENI AMMORTIZZABILI` servono a impostare automatismi e controlli per ridurre gli errori durante l'inserimento dei dati in prima nota.

---
### 3. Relazioni con gli Altri Tracciati

Il Piano dei Conti (`CONTIGEN.TXT`) è il **master centrale** a cui quasi tutti gli altri file si collegano. È la tabella di lookup fondamentale.

| File Sorgente | Campo Chiave Sorgente | File Destinazione | Campo Chiave Destinazione | Descrizione della Relazione |
| :--- | :--- | :--- | :--- | :--- |
| **CONTIGEN.TXT** | `CODIFICA` (pos. 6) o `SIGLA` (pos. 77) | **PNRIGCON.TXT** | `CONTO` (pos. 49) o `SIGLA CONTO` (pos. 301) | La riga contabile di un movimento specifica su quale conto deve essere registrato l'importo Dare/Avere. `PNRIGCON.TXT` usa il codice del conto per "puntare" a un record in `CONTIGEN.TXT`. |
| **CONTIGEN.TXT** | `CODIFICA` (pos. 6) o `SIGLA` (pos. 77) | **PNRIGIVA.TXT** | `CONTROPARTITA` (pos. 20) o `SIGLA CONTROPARTITA` (pos. 162) | La riga IVA di un movimento specifica quale conto (solitamente un costo o un ricavo) è la contropartita dell'imponibile. |
| **CONTIGEN.TXT** | `CODIFICA` (pos. 6) | **A_CLIFOR.TXT** | `SOTTOCONTO CLIENTE` (pos. 51) o `SOTTOCONTO FORNITORE` (pos. 61) | L'anagrafica di un cliente o fornitore specifica quale sottoconto patrimoniale (definito nel Piano dei Conti) deve essere movimentato quando si registra una fattura a suo nome. |

In pratica, senza un Piano dei Conti definito in `CONTIGEN.TXT`, i movimenti registrati negli altri file non avrebbero significato, perché non si saprebbe come classificarli.

---
### 4. Codice TypeScript per il Parsing

Ecco un esempio di codice TypeScript per interpretare una riga del file `CONTIGEN.TXT` e trasformarla in un oggetto strutturato.

```typescript
// Definizione dell'interfaccia per una rappresentazione strutturata dei dati
interface IPianoDeiConti {
  livello: 'Mastro' | 'Conto' | 'Sottoconto';
  codifica: string;
  descrizione: string;
  tipo: 'Patrimoniale' | 'Economico' | 'Conto d\'ordine' | 'Cliente' | 'Fornitore';
  sigla?: string;
  controlloSegno?: 'Dare' | 'Avere';
  contoCollegato?: string;
  validita: {
    impresaOrdinaria: boolean;
    impresaSemplificata: boolean;
    profOrdinaria: boolean;
    profSemplificata: boolean;
  };
  raccordiFiscali: {
    classeIrpefIres?: string;
    classeIrap?: string;
    classeStudiSettore?: string;
  };
  gestioneBeniAmmortizzabili?: 'Immobilizzazioni Materiali' | 'Immobilizzazioni Immateriali' | 'Fondo Svalutazione';
  gruppo?: 'Attivita' | 'Costo' | 'Patrimonio Netto' | 'Passivita' | 'Ricavo';
}

/**
 * Esegue il parsing di una singola riga del file CONTIGEN.TXT
 * @param line Una stringa corrispondente a una riga del file
 * @returns Un oggetto IPianoDeiConti
 */
function parsePianoDeiConti(line: string): IPianoDeiConti {
  if (line.length < 388) {
    throw new Error("La riga non ha la lunghezza minima richiesta di 388 caratteri.");
  }

  const getFlag = (pos: number): boolean => line.substring(pos - 1, pos).toUpperCase() === 'X';

  const getLivello = (code: string): 'Mastro' | 'Conto' | 'Sottoconto' => {
    switch (code) {
      case '1': return 'Mastro';
      case '2': return 'Conto';
      case '3': return 'Sottoconto';
      default: throw new Error(`Livello non valido: ${code}`);
    }
  };

  const getTipo = (code: string): 'Patrimoniale' | 'Economico' | 'Conto d\'ordine' | 'Cliente' | 'Fornitore' => {
    switch (code) {
      case 'P': return 'Patrimoniale';
      case 'E': return 'Economico';
      case 'O': return 'Conto d\'ordine';
      case 'C': return 'Cliente';
      case 'F': return 'Fornitore';
      default: throw new Error(`Tipo conto non valido: ${code}`);
    }
  };
  
  const getGruppo = (code: string): IPianoDeiConti['gruppo'] => {
      switch(code) {
          case 'A': return 'Attivita';
          case 'C': return 'Costo';
          case 'N': return 'Patrimonio Netto';
          case 'P': return 'Passivita';
          case 'R': return 'Ricavo';
          default: return undefined;
      }
  }

  let conto: IPianoDeiConti = {
    livello: getLivello(line.substring(4, 5)),
    codifica: line.substring(5, 15).trim(),
    descrizione: line.substring(15, 75).trim(),
    tipo: getTipo(line.substring(75, 76)),
    sigla: line.substring(76, 88).trim() || undefined,
    controlloSegno: line.substring(88, 89).trim() === 'A' ? 'Avere' : (line.substring(88, 89).trim() === 'D' ? 'Dare' : undefined),
    contoCollegato: line.substring(89, 99).trim() || undefined,
    validita: {
      impresaOrdinaria: getFlag(100),
      impresaSemplificata: getFlag(101),
      profOrdinaria: getFlag(102),
      profSemplificata: getFlag(103),
    },
    raccordiFiscali: {
      classeIrpefIres: line.substring(107, 117).trim() || undefined,
      classeIrap: line.substring(117, 127).trim() || undefined,
      classeStudiSettore: line.substring(257, 267).trim() || undefined,
    },
    gruppo: getGruppo(line.substring(256, 257))
  };

  return conto;
}

/**
 * Esegue il parsing di un intero file di testo del Piano dei Conti.
 * @param fileContent Contenuto del file CONTIGEN.TXT
 * @returns Un array di oggetti IPianoDeiConti
 */
function parseFilePianoDeiConti(fileContent: string): IPianoDeiConti[] {
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => parsePianoDeiConti(line));
}
```

