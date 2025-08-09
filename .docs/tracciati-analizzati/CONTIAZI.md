Aalisi del tracciato `CONTIAZI.TXT`, alternativo alla versione standard del file CONTIGEN.TXT.

---

### Analisi del file tracciato `CONTIAZI.TXT`

Questo file descrive una versione personalizzata per una specifica azienda del **Piano dei Conti**. A differenza di `CONTIGEN.TXT`, che rappresenta un piano dei conti standard, `CONTIAZI.TXT` definisce le personalizzazioni e le eccezioni valide solo per l'azienda identificata tramite il suo codice fiscale.

### 1. Rappresentazione del Tracciato (formato Excel-like)

Di seguito la struttura completa del file `CONTIAZI.TXT`. I campi che rappresentano una personalizzazione rispetto al piano dei conti generico sono evidenziati.

*   **Scopo:** Piano dei Conti personalizzato per Azienda.
*   **Lunghezza Record:** 391 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato. |
| **CODICE FISCALE AZIENDA** | A | 16 | 4 | 19 | **Chiave primaria:** Identifica l'azienda a cui si applica la personalizzazione. |
| **SUBCODICE AZIENDA** | A | 1 | 20 | 20 | **Chiave primaria:** Ulteriore identificativo per l'azienda (es. per sedi o attività diverse). |
| TABELLA ITALSTUDIO (X) | A | 1 | 21 | 21 | Campo riservato, non utilizzare. |
| LIVELLO | A | 1 | 22 | 22 | 1=Mastro, 2=Conto, 3=Sottoconto. |
| **CODIFICA (MM/MMCC/MMCCSSSSSS)** | A | 10 | 23 | 32 | **Chiave primaria:** Codice del conto (gerarchico) che si sta personalizzando. |
| TIPO | A | 1 | 33 | 33 | P=Patrimoniale, E=Economico, O=Ordine, C=Cliente, F=Fornitore. |
| DESCRIZIONE | A | 60 | 34 | 93 | Descrizione del mastro/conto/sottoconto. |
| SIGLA | A | 12 | 94 | 105 | Sigla/Codice mnemonico alternativo per il conto. |
| CONTROLLO SEGNO | A | 1 | 106 | 106 | Se il conto deve movimentare solo in DARE (D) o AVERE (A). |
| CONTO COSTI/RICAVI COLLEGATO | A | 10 | 107 | 116 | Per conti patrimoniali, il conto economico di contropartita. |
| VALIDO PER IMPRESA ORDINARIA (X) | A | 1 | 117 | 117 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER IMPRESA SEMPLIFICATA (X)| A | 1 | 118 | 118 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER PROF. ORDINARIA (X) | A | 1 | 119 | 119 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER PROF. SEMPLIFICATA (X) | A | 1 | 120 | 120 | Flag (X) se valido per questo regime contabile. |
| VALIDO PER UNICO PF (X) | A | 1 | 121 | 121 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO SP (X) | A | 1 | 122 | 122 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO SC (X) | A | 1 | 123 | 123 | Flag (X) se valido per questo modello di dichiarazione. |
| VALIDO PER UNICO ENC (X) | A | 1 | 124 | 124 | Flag (X) se valido per questo modello di dichiarazione. |
| CODICE CLASSE IRPEF/IRES | A | 10 | 125 | 134 | Raccordo per la dichiarazione dei redditi. |
| CODICE CLASSE IRAP | A | 10 | 135 | 144 | Raccordo per la dichiarazione IRAP. |
| CODICE CLASSE PROFESSIONISTA | A | 10 | 145 | 154 | Raccordo per dichiarazione professionisti. |
| CODICE CLASSE IRAP PROFESSIONISTA| A | 10 | 155 | 164 | Raccordo per dichiarazione IRAP professionisti. |
| CODICE CLASSE IVA | A | 10 | 165 | 174 | Raccordo per la dichiarazione IVA. |
| CODICE CLASSE DATI STUDI SETTORE| A | 10 | 175 | 184 | Raccordo per gli Studi di Settore. |
| NUMERO COLONNA REG. CRONOLOGICO | N | 4 | 185 | 188 | Colonna su registro cronologico per professionisti. |
| NUMERO COLONNA REG. INCASSI/PAG | N | 4 | 189 | 192 | Colonna su registro incassi/pagamenti per professionisti. |
| CONTO DARE (CEE) | A | 12 | 193 | 204 | Conto di destinazione nel bilancio CEE (sezione Dare). |
| CONTO AVERE (CEE) | A | 12 | 205 | 216 | Conto di destinazione nel bilancio CEE (sezione Avere). |
| NATURA CONTO | A | 4 | 217 | 220 | Codice che definisce la natura del conto (es. Cassa, Banca). |
| GESTIONE BENI AMMORTIZZABILI | A | 1 | 221 | 221 | M=Materiali, I=Immateriali, S=Fondo Svalutazione. |
| PERC. DED. MANUT. (999.99) | N | 6 | 222 | 227 | Percentuale di deducibilità per costi di manutenzione. |
| GRUPPO | A | 1 | 228 | 228 | A=Attività, C=Costo, P=Passività, R=Ricavo. |
| DETTAGLIO CLIENTE/FORNITORE | A | 1 | 229 | 229 | 1=Cliente, 2=Fornitore, 3=Entrambi. |
| DESCRIZIONE BILANCIO DARE | A | 60 | 230 | 289 | Descrizione da usare nei report di bilancio (sezione Dare). |
| DESCRIZIONE BILANCIO AVERE | A | 60 | 290 | 349 | Descrizione da usare nei report di bilancio (sezione Avere). |
| **UTILIZZA DESCRIZIONE LOCALE (X)** | A | 1 | 350 | 350 | Flag (X) per usare la descrizione personalizzata che segue. |
| **DESCRIZIONE LOCALE** | A | 40 | 351 | 390 | Descrizione personalizzata per la singola azienda. |
| **CONSIDERA NEL BILANCIO SEMPLIF. (X)**| A | 1 | 391 | 391 | Flag (X) per includere questo conto nel bilancio per semplificate. |
| CRLF | E | 2 | 392 | 393 | Fine record. |

---
### 2. Cosa Rappresenta il File?

Il file `CONTIAZI.TXT` rappresenta il **livello di personalizzazione del Piano dei Conti per una specifica azienda**. Mentre `CONTIGEN.TXT` è il piano dei conti standard (uguale per tutti), questo file contiene le "eccezioni" o "variazioni" che un'azienda vuole applicare.

Le sue caratteristiche chiave sono:
*   **Specificità per Azienda:** I campi `CODICE FISCALE AZIENDA` e `SUBCODICE AZIENDA` legano ogni record in questo file a un'entità legale precisa.
*   **Sovrascrittura dei Dati:** La presenza di un record in questo file per un dato `CODIFICA` (codice conto) indica al software di contabilità di usare le informazioni contenute in questo record (es. la `DESCRIZIONE`, i raccordi fiscali, etc.) al posto di quelle presenti nel piano dei conti standard (`CONTIGEN.TXT`).
*   **Personalizzazione Estesa:** Permette non solo di modificare i dati esistenti, ma anche di aggiungere informazioni specifiche, come una `DESCRIZIONE LOCALE` che ha senso solo per quella azienda, senza alterare il conto standard.
*   **Logica Gerarchica:** Mantiene la stessa struttura gerarchica (Mastro, Conto, Sottoconto) del piano dei conti generico, permettendo di personalizzare qualsiasi livello della struttura.

In sintesi, questo tracciato serve a rendere flessibile il piano dei conti, adattandolo alle necessità informative, operative e fiscali di ogni singola azienda gestita, senza dover duplicare o modificare la struttura di base.

---
### 3. Relazioni con gli Altri Tracciati

Il `CONTIAZI.TXT` agisce come un "layer" di personalizzazione che si interpone tra il piano dei conti standard e i file operativi.

| File Sorgente | Campo Chiave Sorgente | File Destinazione | Campo Chiave Destinazione | Descrizione della Relazione |
| :--- | :--- | :--- | :--- | :--- |
| **CONTIAZI.TXT** | `CODICE FISCALE AZIENDA` + `CODIFICA` | **CONTIGEN.TXT** | `CODIFICA` | **Relazione di Override**: `CONTIAZI.TXT` sovrascrive, per una data azienda, le impostazioni del conto definito in `CONTIGEN.TXT`. Se un conto non ha una voce corrispondente in `CONTIAZI.TXT`, si usano i dati di default da `CONTIGEN.TXT`. |
| **CONTIAZI.TXT** / **CONTIGEN.TXT** | `CODIFICA` | **PNRIGCON.TXT** | `CONTO` | I movimenti contabili in `PNRIGCON.TXT` usano il `CONTO` per registrare un importo. Il sistema deve prima verificare se esiste una personalizzazione in `CONTIAZI.TXT` per quel conto e azienda; in caso contrario, usa la definizione da `CONTIGEN.TXT`. |
| **CONTIAZI.TXT** / **CONTIGEN.TXT** | `CODIFICA` | **PNRIGIVA.TXT** | `CONTROPARTITA` | La contropartita IVA in `PNRIGIVA.TXT` è un conto di costo o ricavo. La sua descrizione, il suo gruppo e i raccordi fiscali vengono letti da `CONTIAZI.TXT` (se esiste) o da `CONTIGEN.TXT`. |
| **CONTIAZI.TXT** / **CONTIGEN.TXT** | `CODIFICA` | **A_CLIFOR.TXT** | `SOTTOCONTO CLIENTE` / `FORNITORE` | L'anagrafica cliente/fornitore si collega a un sottoconto patrimoniale. Le proprietà di questo sottoconto possono essere quelle standard o quelle personalizzate dall'azienda tramite `CONTIAZI.TXT`. |

---
### 4. Codice TypeScript per il Parsing

Ecco un esempio di codice TypeScript per interpretare una riga del file `CONTIAZI.TXT` e trasformarla in un oggetto strutturato, tenendo conto dei nuovi campi.

```typescript
// Interfaccia che rappresenta i dati strutturati di un conto personalizzato per azienda
interface IPianoDeiContiAziendale {
  codiceFiscaleAzienda: string;
  subcodiceAzienda: string;
  livello: 'Mastro' | 'Conto' | 'Sottoconto';
  codifica: string;
  descrizione: string;
  tipo: 'Patrimoniale' | 'Economico' | 'Conto d\'ordine' | 'Cliente' | 'Fornitore';
  sigla?: string;
  utilizzaDescrizioneLocale: boolean;
  descrizioneLocale?: string;
  consideraBilancioSemplificato: boolean;
  // Aggiungere qui altri campi del tracciato se necessario per completezza
  // ...
}

/**
 * Esegue il parsing di una singola riga del file CONTIAZI.TXT
 * @param line Una stringa corrispondente a una riga del file
 * @returns Un oggetto IPianoDeiContiAziendale
 */
function parseContoAziendale(line: string): IPianoDeiContiAziendale {
  if (line.length < 391) {
    throw new Error("La riga non ha la lunghezza minima richiesta di 391 caratteri.");
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
  
  const contoAziendale: IPianoDeiContiAziendale = {
    codiceFiscaleAzienda: line.substring(3, 19).trim(),
    subcodiceAzienda: line.substring(19, 20).trim(),
    livello: getLivello(line.substring(21, 22)),
    codifica: line.substring(22, 32).trim(),
    tipo: getTipo(line.substring(32, 33)),
    descrizione: line.substring(33, 93).trim(),
    sigla: line.substring(93, 105).trim() || undefined,
    utilizzaDescrizioneLocale: getFlag(350),
    descrizioneLocale: line.substring(350, 390).trim() || undefined,
    consideraBilancioSemplificato: getFlag(391),
  };

  // Se il flag 'utilizzaDescrizioneLocale' non è attivo, il campo descrizioneLocale non dovrebbe essere considerato.
  if (!contoAziendale.utilizzaDescrizioneLocale) {
      contoAziendale.descrizioneLocale = undefined;
  }

  return contoAziendale;
}

/**
 * Esegue il parsing di un intero file di testo del Piano dei Conti Aziendale.
 * @param fileContent Contenuto del file CONTIAZI.TXT
 * @returns Un array di oggetti IPianoDeiContiAziendale
 */
function parseFileContiAziendali(fileContent: string): IPianoDeiContiAziendale[] {
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => parseContoAziendale(line));
}
```