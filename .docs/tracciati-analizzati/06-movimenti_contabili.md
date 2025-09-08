Analisi dettagliata e completa, con tabelle che rappresentano fedelmente ogni campo di ogni tracciato, compreso anche calcolo della posizione finale di ogni campo per maggiore chiarezza.

### 1. Rappresentazione Completa dei Tracciati (formato Excel-like)

Di seguito, la struttura completa di ogni file, con tutti i campi, come se fosse rappresentata in un foglio di calcolo.

#### **File 1: PNTESTA.TXT**

- **Scopo:** Testata della registrazione contabile. Contiene i dati generali del movimento.
- **Lunghezza Record:** 445 Bytes (+CRLF)

| Nome Campo                         | Tipo | Lun | Inizio | Fine | Descrizione                                                       |
| :--------------------------------- | :--- | :-: | :----: | :--: | :---------------------------------------------------------------- |
| FILLER                             | A    |  3  |   1    |  3   | Spazio non utilizzato                                             |
| **CODICE FISCALE (Azienda)**       | A    | 16  |   4    |  19  | Codice Fiscale dell'azienda che registra                          |
| **SUBCODICE FISCALE (Azienda)**    | A    |  1  |   20   |  20  | Subcodice dell'azienda                                            |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12  |   21   |  32  | **CHIAVE PRIMARIA:** Codice univoco che lega Testata, Righe e IVA |
| CODICE ATTIVITA                    | A    |  2  |   33   |  34  | Codice attività contabile                                         |
| ESERCIZIO                          | A    |  5  |   35   |  39  | Esercizio contabile                                               |
| CODICE CAUSALE                     | A    |  6  |   40   |  45  | Codice della causale contabile (es. FA, RI)                       |
| DESCRIZIONE CAUSALE                | A    | 40  |   46   |  85  | Descrizione facoltativa della causale                             |
| DATA REGISTRAZIONE (GGMMAAAA)      | N    |  8  |   86   |  93  | Data di registrazione del movimento                               |
| CODICE ATTIVITA IVA                | A    |  2  |   94   |  95  | Codice attività IVA                                               |
| TIPO REGISTRO IVA                  | A    |  1  |   96   |  96  | A=Acquisti, C=Corrispettivi, V=Vendite                            |
| CODICE NUMERAZIONE IVA             | A    |  3  |   97   |  99  | Codice per la numerazione del registro IVA                        |
| CLIENTE/FORNITORE CODICE FISCALE   | A    | 16  |  100   | 115  | Codice Fiscale del cliente/fornitore principale                   |
| CLIENTE/FORNITORE SUBCODICE        | A    |  1  |  116   | 116  | Subcodice del cliente/fornitore                                   |
| CLIENTE/FORNITORE SIGLA            | A    | 12  |  117   | 128  | Sigla/Codice interno del cliente/fornitore                        |
| DOCUMENTO DATA (GGMMAAAA)          | N    |  8  |  129   | 136  | Data del documento (es. data fattura)                             |
| DOCUMENTO NUMERO                   | A    | 12  |  137   | 148  | Numero del documento                                              |
| DOCUMENTO BIS                      | A    |  1  |  149   | 149  | Eventuale suffisso del numero documento                           |
| DATA REGISTRO IVA (GGMMAAAA)       | N    |  8  |  150   | 157  | Data di registrazione sul registro IVA                            |
| PROTOCOLLO NUMERO                  | N    |  6  |  158   | 163  | Numero di protocollo IVA                                          |
| PROTOCOLLO BIS                     | A    |  1  |  164   | 164  | Eventuale suffisso del protocollo                                 |
| DATA COMPETENZA LIQUID. IVA        | N    |  8  |  165   | 172  | Data competenza per la liquidazione IVA                           |
| TOTALE DOCUMENTO                   | N    | 12  |  173   | 184  | Importo totale del documento                                      |
| DATA COMPETENZA CONTABILE          | N    |  8  |  185   | 192  | Data di competenza economica                                      |
| NOTE MOVIMENTO                     | A    | 60  |  193   | 252  | Note generali della registrazione                                 |
| DATA PLAFOND (GGMMAAAA)            | N    |  8  |  253   | 260  | Data per la gestione del Plafond IVA                              |
| ANNO PRO-RATA                      | N    |  4  |  261   | 264  | Anno per la gestione del Pro-Rata IVA                             |
| RITENUTE                           | N    | 12  |  265   | 276  | Importo ritenute effettuate                                       |
| ENASARCO                           | N    | 12  |  277   | 288  | Importo contributi Enasarco                                       |
| TOTALE IN VALUTA                   | N    | 12  |  289   | 300  | Importo totale del documento in valuta                            |
| CODICE VALUTA                      | A    |  4  |  301   | 304  | Codice della valuta estera                                        |
| CODICE NUMERAZIONE IVA VENDITE     | A    |  3  |  305   | 307  | Dati per autofattura                                              |
| PROTOCOLLO NUMERO (Autofattura)    | N    |  6  |  308   | 313  | Dati per autofattura                                              |
| PROTOCOLLO BIS (Autofattura)       | A    |  1  |  314   | 314  | Dati per autofattura                                              |
| VERSAMENTO DATA (GGMMAAAA)         | N    |  8  |  315   | 322  | Data versamento ritenute                                          |
| VERSAMENTO TIPO                    | A    |  1  |  323   | 323  | 0=F24/F23, 1=Tesoreria                                            |
| VERSAMENTO MODELLO                 | A    |  1  |  324   | 324  | 0-3 (Nessuno, Banca, etc.)                                        |
| VERSAMENTO ESTREMI                 | A    | 16  |  325   | 340  | Estremi del versamento                                            |
| STATO                              | A    |  1  |  341   | 341  | D=Definitiva, P=Provvisoria, V=Da verificare                      |
| TIPO GESTIONE PARTITE              | A    |  1  |  342   | 342  | Gestione partite/scadenzario (A, B, C, D)                         |
| CODICE PAGAMENTO                   | A    |  8  |  343   | 350  | Codice per la creazione automatica delle rate                     |
| CODICE ATTIVITA IVA (Partita)      | A    |  2  |  351   | 352  | Dati della fattura da incassare/pagare                            |
| TIPO REGISTRO IVA (Partita)        | A    |  1  |  353   | 353  | Dati della fattura da incassare/pagare                            |
| CODICE NUMERAZIONE IVA (Partita)   | A    |  3  |  354   | 356  | Dati della fattura da incassare/pagare                            |
| CLI/FOR CODICE FISCALE (Partita)   | A    | 16  |  357   | 372  | Dati della fattura da incassare/pagare                            |
| CLI/FOR SUBCODICE (Partita)        | A    |  1  |  373   | 373  | Dati della fattura da incassare/pagare                            |
| CLI/FOR SIGLA (Partita)            | A    | 12  |  374   | 385  | Dati della fattura da incassare/pagare                            |
| DOCUMENTO DATA (Partita)           | N    |  8  |  386   | 393  | Dati della fattura da incassare/pagare                            |
| DOCUMENTO NUMERO (Partita)         | A    | 12  |  394   | 405  | Dati della fattura da incassare/pagare                            |
| DOCUMENTO BIS (Partita)            | A    |  1  |  406   | 406  | Dati della fattura da incassare/pagare                            |
| CLI/FOR (INTRA) CODICE FISCALE     | A    | 16  |  407   | 422  | Dati Intrastat                                                    |
| CLI/FOR (INTRA) SUBCODICE          | A    |  1  |  423   | 423  | Dati Intrastat                                                    |
| CLI/FOR (INTRA) SIGLA              | A    | 12  |  424   | 435  | Dati Intrastat                                                    |
| TIPO MOVIMENTO INTRASTAT           | A    |  2  |  436   | 437  | AA, AZ, VV, VZ                                                    |
| DOCUMENTO OPERAZIONE (GGMMAAAA)    | N    |  8  |  438   | 445  | Data operazione Intrastat                                         |
| CRLF                               | E    |  2  |  446   | 447  | Fine record                                                       |

---

#### **File 2: PNRIGCON.TXT**

- **Scopo:** Righe contabili del movimento (Dare/Avere).
- **Lunghezza Record:** 312 Bytes (+CRLF)

| Nome Campo                         | Tipo | Lun | Inizio | Fine | Descrizione                                                          |
| :--------------------------------- | :--- | :-: | :----: | :--: | :------------------------------------------------------------------- |
| FILLER                             | A    |  3  |   1    |  3   | Spazio non utilizzato                                                |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12  |   4    |  15  | **CHIAVE ESTERNA:** Lega questa riga alla sua testata in PNTESTA.TXT |
| **PROGRESSIVO NUMERO RIGO**        | N    |  3  |   16   |  18  | **CHIAVE PRIMARIA (composta):** Identifica univocamente la riga      |
| TIPO CONTO                         | A    |  1  |   19   |  19  | C=Cliente, F=Fornitore                                               |
| CLIENTE/FORNITORE CODICE FISCALE   | A    | 16  |   20   |  35  | Identificativo se TIPO CONTO = C/F                                   |
| CLIENTE/FORNITORE SUBCODICE        | A    |  1  |   36   |  36  | Subcodice                                                            |
| CLIENTE/FORNITORE SIGLA            | A    | 12  |   37   |  48  | Sigla/Codice interno                                                 |
| CONTO                              | A    | 10  |   49   |  58  | Codice conto del piano dei conti (es. costo, ricavo)                 |
| IMPORTO DARE                       | N    | 12  |   59   |  70  | Importo in Dare                                                      |
| IMPORTO AVERE                      | N    | 12  |   71   |  82  | Importo in Avere                                                     |
| NOTE                               | A    | 60  |   83   | 142  | Note specifiche della riga contabile                                 |
| INS. DATI COMPETENZA CONTABILE     | N    |  1  |  143   | 143  | 1=Se presenti i campi seguenti                                       |
| DATA INIZIO COMPETENZA             | N    |  8  |  144   | 151  | Data inizio competenza economica della riga                          |
| DATA FINE COMPETENZA               | N    |  8  |  152   | 159  | Data fine competenza economica della riga                            |
| NOTE DI COMPETENZA                 | A    | 60  |  160   | 219  | Note relative alla competenza                                        |
| DATA REGISTRAZIONE APERTURA        | N    |  8  |  220   | 227  | Facoltativo                                                          |
| CONTO DA RILEVARE (MOVIMENTO 1)    | A    | 10  |  228   | 237  | Facoltativo                                                          |
| CONTO DA RILEVARE (MOVIMENTO 2)    | A    | 10  |  238   | 247  | Facoltativo                                                          |
| **INS. DATI MOVIMENTI ANALITICI**  | N    |  1  |  248   | 248  | **FLAG:** 1=Se esistono righe collegate in MOVANAC.TXT               |
| DATA INIZIO COMPETENZA (Analit.)   | N    |  8  |  249   | 256  | Dati per movimenti analitici                                         |
| DATA FINE COMPETENZA (Analit.)     | N    |  8  |  257   | 264  | Dati per movimenti analitici                                         |
| INS. DATI STUDI DI SETTORE         | N    |  1  |  265   | 265  | Flag per Studi di Settore                                            |
| STATO MOVIMENTO STUDI              | A    |  1  |  266   | 266  | G=Generato, M=Manuale                                                |
| ESERCIZIO DI RILEVANZA FISCALE     | A    |  5  |  267   | 271  | Esercizio per la rilevanza fiscale                                   |
| DETTAGLIO CLI/FOR CODICE FISCALE   | A    | 16  |  272   | 287  | Dettaglio cliente/fornitore                                          |
| DETTAGLIO CLI/FOR SUBCODICE        | A    |  1  |  288   | 288  | Dettaglio cliente/fornitore                                          |
| DETTAGLIO CLI/FOR SIGLA            | A    | 12  |  289   | 300  | Dettaglio cliente/fornitore                                          |
| SIGLA CONTO                        | A    | 12  |  301   | 312  | Alternativa al campo CONTO (pos. 49)                                 |
| CRLF                               | E    |  2  |  313   | 314  | Fine record                                                          |

---

#### **File 3: PNRIGIVA.TXT**

- **Scopo:** Dettaglio dei castelletti IVA associati al movimento.
- **Lunghezza Record:** 173 Bytes (+CRLF)

| Nome Campo                         | Tipo | Lun | Inizio | Fine | Descrizione                                                          |
| :--------------------------------- | :--- | :-: | :----: | :--: | :------------------------------------------------------------------- |
| FILLER                             | A    |  3  |   1    |  3   | Spazio non utilizzato                                                |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12  |   4    |  15  | **CHIAVE ESTERNA:** Lega questa riga alla sua testata in PNTESTA.TXT |
| CODICE IVA                         | A    |  4  |   16   |  19  | Codice IVA (aliquota, esenzione, etc.)                               |
| CONTROPARTITA                      | A    | 10  |   20   |  29  | Codice conto della contropartita IVA                                 |
| IMPONIBILE                         | N    | 12  |   30   |  41  | Importo imponibile                                                   |
| IMPOSTA                            | N    | 12  |   42   |  53  | Importo dell'imposta IVA                                             |
| IMPOSTA INTRATTENIMENTI            | N    | 12  |   54   |  65  | Imposta per spese di intrattenimento                                 |
| IMPONIBILE 50% CORR. NON CONS.     | N    | 12  |   66   |  77  | Dettaglio per calcoli specifici (corrispettivi)                      |
| IMPOSTA NON CONSIDERATA            | N    | 12  |   78   |  89  | Dettaglio per calcoli specifici                                      |
| IMPORTO LORDO                      | N    | 12  |   90   | 101  | Totale lordo della riga IVA                                          |
| NOTE                               | A    | 60  |  102   | 161  | Note specifiche della riga IVA                                       |
| SIGLA CONTROPARTITA                | A    | 12  |  162   | 173  | Alternativa al campo CONTROPARTITA (pos. 20)                         |
| CRLF                               | E    |  2  |  174   | 175  | Fine record                                                          |

---

#### **File 4: MOVANAC.TXT**

- **Scopo:** Dettaglio dei centri di costo (contabilità analitica).
- **Lunghezza Record:** 34 Bytes (+CRLF)

| Nome Campo                         | Tipo | Lun | Inizio | Fine | Descrizione                                                   |
| :--------------------------------- | :--- | :-: | :----: | :--: | :------------------------------------------------------------ |
| FILLER                             | A    |  3  |   1    |  3   | Spazio non utilizzato                                         |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12  |   4    |  15  | **CHIAVE ESTERNA:** Lega al movimento generale in PNTESTA.TXT |
| **PROGRESSIVO NUMERO RIGO CONT.**  | N    |  3  |   16   |  18  | **CHIAVE ESTERNA:** Lega al rigo specifico in PNRIGCON.TXT    |
| CENTRO DI COSTO                    | A    |  4  |   19   |  22  | Codice del centro di costo                                    |
| PARAMETRO                          | N    | 12  |   23   |  34  | Importo da attribuire al centro di costo                      |
| CRLF                               | E    |  2  |   35   |  36  | Fine record                                                   |

---

### 2. Cosa Rappresentano i File?

Questi file rappresentano, in modo strutturato e relazionale, tutti i dati necessari per importare **registrazioni di prima nota contabile complesse**.

- **PNTESTA.TXT**: È la "Testata" della registrazione. Contiene i dati comuni a tutto il movimento, come la data, la causale, i dati del documento (fattura), il cliente/fornitore principale e i totali. Ogni record in questo file rappresenta una singola operazione contabile (es. una fattura di acquisto).
- **PNRIGCON.TXT**: Sono le "Righe Contabili" del movimento. Descrive la scrittura in partita doppia (Dare/Avere). Ogni registrazione in `PNTESTA` avrà una o più righe corrispondenti in questo file, la cui somma Dare/Avere deve quadrare.
- **PNRIGIVA.TXT**: Sono le "Righe IVA". Dettagliano il "castelletto IVA" della registrazione. Se il movimento è fiscalmente rilevante ai fini IVA, ci saranno una o più righe in questo file che specificano imponibili e imposte per ogni aliquota.
- **MOVANAC.TXT**: Sono i "Movimenti Analitici". Dettagliano la suddivisione di un costo o di un ricavo su specifici "Centri di Costo". Questa è una dimensione aggiuntiva per la contabilità analitica/gestionale.

---

### 3. & 4. Relazioni tra i File

I file sono strettamente relazionati tra loro attraverso campi chiave, formando una struttura gerarchica.

La relazione principale è garantita dal campo **`CODICE UNIVOCO DI SCARICAMENTO`**, presente in tutti e quattro i file. Questo codice agisce come un "ID di transazione" che lega insieme tutte le parti di una singola registrazione contabile.

Ecco uno schema delle relazioni:

| File Sorgente    | Campo Chiave Sorgente                           | File Destinazione | Campo Chiave Destinazione                             | Tipo Relazione  | Descrizione                                                                            |
| :--------------- | :---------------------------------------------- | :---------------- | :---------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------- |
| **PNTESTA.TXT**  | `CODICE UNIVOCO...`                             | **PNRIGCON.TXT**  | `CODICE UNIVOCO...`                                   | **Uno-a-Molti** | Una testata può avere molte righe contabili (Dare/Avere).                              |
| **PNTESTA.TXT**  | `CODICE UNIVOCO...`                             | **PNRIGIVA.TXT**  | `CODICE UNIVOCO...`                                   | **Uno-a-Molti** | Una testata può avere molte righe IVA (diverse aliquote).                              |
| **PNRIGCON.TXT** | `CODICE UNIVOCO...` + `PROGRESSIVO NUMERO RIGO` | **MOVANAC.TXT**   | `CODICE UNIVOCO...` + `PROGRESSIVO NUMERO RIGO CONT.` | **Uno-a-Molti** | Una singola riga contabile (es. un costo) può essere suddivisa su più centri di costo. |

---

### 5. Possono Rappresentare un Unico "Movimento" Contabile?

**Assolutamente sì.**

Messi insieme, questi quattro file non solo possono, ma sono **progettati per rappresentare un unico movimento contabile completo** in tutte le sue sfaccettature:

1.  **Si parte dalla Testata (`PNTESTA.TXT`)**: Definisce l'operazione generale (es. "Registrazione Fattura Acquisto N. 123 del 15/11/2023 dal Fornitore X").
2.  **Si dettagliano le Righe Contabili (`PNRIGCON.TXT`)**: Si specificano i conti e gli importi in partita doppia.
    - _Riga 1_: Costo merci (DARE) € 1.000
    - _Riga 2_: IVA su acquisti (DARE) € 220
    - _Riga 3_: Fornitore X (AVERE) € 1.220
3.  **Si dettaglia l'IVA (`PNRIGIVA.TXT`)**: Si specifica il calcolo IVA.
    - _Riga 1_: Imponibile € 1.000, Imposta € 220, Codice IVA 22%.
4.  **Si dettaglia la Contabilità Analitica (`MOVANAC.TXT`)**: Se la riga del costo merci deve essere ripartita, si aggiungono i dettagli.
    - _Riga 1_: Legata alla riga "Costo merci" di `PNRIGCON`, Centro di Costo "AMM", Importo € 400.
    - _Riga 2_: Legata alla riga "Costo merci" di `PNRIGCON`, Centro di Costo "PROD", Importo € 600.

La struttura gerarchica e le chiavi di relazione permettono al software di importazione di ricostruire l'intera scrittura contabile, dai dati generali fino al minimo dettaglio gestionale, come un unico, coerente "movimento".

### 6. Dati da importare

Cconcateniamo i dati dai quattro tracciati che abbiamo analizzato in precedenza: `MOVANAC.TXT`, `PNRIGIVA.TXT`, `PNRIGCON.TXT` e `PNTESTA.TXT`.

l'approccio sarà il seguente:

1.  **Scrivere il codice TypeScript come richiesto.** Questo codice conterrà la logica per interpretare ogni riga di testo in base ai tracciati record, estrarre i dati e assemblarli in oggetti strutturati che rappresentano i movimenti contabili completi.
2.  **Eseguire la logica di parsing utilizzando Python.** Poiché il mio ambiente esegue codice Python, implementerò la stessa logica di parsing in Python per processare i tuoi dati e restituire il risultato strutturato in formato JSON.
3.  **Presentare i risultati.** Ti fornirò prima il codice TypeScript come riferimento, seguito dal codice Python eseguibile e infine l'output JSON che rappresenta i movimenti contabili completi e relazionati.

#### 1. Codice TypeScript per il Parsing

Ecco come sarebbe strutturato il codice in TypeScript per eseguire questa operazione.
ATTENZIONE: Questo codice è SOLO a scopo illustrativo.

```typescript
// Definizione delle interfacce per una rappresentazione strutturata dei dati
interface IMovimentoAnalitico {
  codiceUnivoco: string;
  progressivoRigo: number;
  centroDiCosto: string;
  parametro: number;
}

interface IRigaIva {
  codiceUnivoco: string;
  codiceIva: string;
  contropartita: string;
  imponibile: number;
  imposta: number;
  note: string;
}

interface IRigaContabile {
  codiceUnivoco: string;
  progressivoRigo: number;
  tipoConto?: string;
  codiceFiscaleCliFor?: string;
  conto: string;
  importoDare: number;
  importoAvere: number;
  note: string;
  movimentiAnalitici: IMovimentoAnalitico[];
}

interface ITestata {
  codiceFiscaleAzienda: string;
  codiceUnivoco: string;
  codiceCausale: string;
  dataRegistrazione: string;
  totaleDocumento: number;
  noteMovimento: string;
}

interface IMovimentoCompleto {
  testata: ITestata;
  righeContabili: IRigaContabile[];
  righeIva: IRigaIva[];
}

// Funzione principale di parsing (logica concettuale)
function parseDatiContabili(
  testaData: string,
  righeConData: string,
  righeIvaData: string,
  movAnacData: string
): IMovimentoCompleto[] {
  const movimenti = new Map<string, IMovimentoCompleto>();

  // 1. Parsing delle Testate (PNTESTA.TXT)
  testaData.split("\n").forEach((line) => {
    if (line.trim().length === 0) return;
    const codiceUnivoco = line.substring(20, 32).trim();
    const testata: ITestata = {
      codiceFiscaleAzienda: line.substring(3, 19).trim(),
      codiceUnivoco: codiceUnivoco,
      codiceCausale: line.substring(39, 45).trim(),
      dataRegistrazione: line.substring(85, 93).trim(),
      totaleDocumento:
        parseFloat(line.substring(172, 184).trim().replace(",", ".")) || 0,
      noteMovimento: line.substring(192, 252).trim(),
    };
    movimenti.set(codiceUnivoco, {
      testata: testata,
      righeContabili: [],
      righeIva: [],
    });
  });

  // 2. Parsing Righe Contabili (PNRIGCON.TXT)
  righeConData.split("\n").forEach((line) => {
    if (line.trim().length === 0) return;
    const codiceUnivoco = line.substring(3, 15).trim();
    const movimento = movimenti.get(codiceUnivoco);
    if (movimento) {
      const riga: IRigaContabile = {
        codiceUnivoco: codiceUnivoco,
        progressivoRigo: parseInt(line.substring(15, 18).trim(), 10) || 0,
        conto: line.substring(48, 58).trim(),
        importoDare:
          parseFloat(line.substring(58, 70).trim().replace(",", ".")) || 0,
        importoAvere:
          parseFloat(line.substring(70, 82).trim().replace(",", ".")) || 0,
        note: line.substring(82, 142).trim(),
        movimentiAnalitici: [],
      };
      movimento.righeContabili.push(riga);
    }
  });

  // 3. Parsing Righe IVA (PNRIGIVA.TXT)
  righeIvaData.split("\n").forEach((line) => {
    if (line.trim().length === 0) return;
    const codiceUnivoco = line.substring(3, 15).trim();
    const movimento = movimenti.get(codiceUnivoco);
    if (movimento) {
      const riga: IRigaIva = {
        codiceUnivoco: codiceUnivoco,
        codiceIva: line.substring(15, 19).trim(),
        contropartita: line.substring(19, 29).trim(),
        imponibile:
          parseFloat(line.substring(29, 41).trim().replace(",", ".")) || 0,
        imposta:
          parseFloat(line.substring(41, 53).trim().replace(",", ".")) || 0,
        note: line.substring(101, 161).trim(),
      };
      movimento.righeIva.push(riga);
    }
  });

  // 4. Parsing Movimenti Analitici (MOVANAC.TXT)
  movAnacData.split("\n").forEach((line) => {
    if (line.trim().length === 0) return;
    const codiceUnivoco = line.substring(3, 15).trim();
    const progressivoRigo = parseInt(line.substring(15, 18).trim(), 10);
    const movimento = movimenti.get(codiceUnivoco);
    if (movimento) {
      const rigaContabile = movimento.righeContabili.find(
        (r) => r.progressivoRigo === progressivoRigo
      );
      if (rigaContabile) {
        const analitico: IMovimentoAnalitico = {
          codiceUnivoco: codiceUnivoco,
          progressivoRigo: progressivoRigo,
          centroDiCosto: line.substring(18, 22).trim(),
          parametro:
            parseFloat(line.substring(22, 34).trim().replace(",", ".")) || 0,
        };
        rigaContabile.movimentiAnalitici.push(analitico);
      }
    }
  });

  return Array.from(movimenti.values());
}
```

#### 2. Esecuzione del Parsing con Python

Ora eseguo la logica descritta sopra utilizzando Python per fornirti l'output effettivo basato sui tuoi dati. Ho suddiviso il tuo input nei quattro blocchi di dati corrispondenti ai file.
