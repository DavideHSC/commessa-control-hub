# Contesto Progetto Parser Dati Contabili

## Situazione Attuale

### App di Test (Parser Standalone)
- **Nome**: `parser-dati-contabili-gemini`
- **Tecnologie**: React + TypeScript + Vite
- **Stato**: ✅ **FUNZIONANTE**

### App Principale (Gestionale Commesse)
- **Nome**: commessa-control-hub
- **Scopo**: Gestionale completo per commesse aziendali
- **Stato**: ✅ **FUNZIONANTE** - Parser movimenti corretto

## Problema da Risolvere

Il **parser dei file dei movimenticontabili** nell'app principale non funziona correttamente. Per questo è stata creata l'app di test standalone per:

1. **Sviluppare e testare** la logica di parsing in isolamento
2. **Verificare** che i file vengano elaborati correttamente  
3. **Confrontare** il codice funzionante con quello buggato
4. **Integrare** la soluzione nell'app principale

## Architettura App di Test Funzionante

### Struttura Files
```
G:/Progetti Web/parser-dati-contabili-gemini
├── components/
│   ├── DataTable.tsx
│   ├── FileStatus.tsx  
│   ├── FileUploader.tsx
│   └── icons.tsx
├── services/
│   ├── exporter.ts
│   ├── parser.ts      ← LOGICA PRINCIPALE
│   └── validator.ts   ← RICONOSCIMENTO FILE
├── App.tsx
├── types.ts
└── package.json
```

### Componenti Chiave

#### validator.ts
- **Scopo**: Riconoscere automaticamente i 4 tipi di file dal contenuto, ma questa è una caratteristica sviluppata appositamente per l'app di test
- **Metodo**: Pattern matching su posizioni specifiche dei campi
- **Stato**: ✅ Funziona correttamente

#### parser.ts  
- **Scopo**: Elaborare i file e creare struttura dati relazionale
- **Funzione Principale**: `parseDatiContabili()`
- **Output**: Array di `IMovimentoCompleto[]`
- **Stato**: ✅ Funziona correttamente - quadrature e relazioni OK

#### Tipi TypeScript
```typescript
interface IMovimentoCompleto {
  testata: ITestata;
  righeContabili: IRigaContabile[];
  righeIva: IRigaIva[];
}
```

## Sommario del Processo di Debug e Correzione

Il processo di debug e correzione del parser delle scritture contabili è stato un esempio significativo di come le discrepanze tra le definizioni dei dati, il parsing e la validazione possano generare errori complessi. La strategia adottata ha previsto un confronto sistematico con un'applicazione di test funzionante e l'isolamento dei problemi attraverso test mirati.

### Difficoltà Incontrate e Soluzioni

1.  **Incoerenza dei Tipi tra Parser e Validazione (Zod)**
    *   **Problema:** Inizialmente, i campi numerici e data venivano parsati dal `fixedWidthParser` con un tipo (es. `number` o `Date` object), ma gli schemi Zod `raw` si aspettavano un tipo diverso (es. `string`). Questo generava errori come "Expected number, received nan" o "Expected string, received date".
    *   **Soluzione:** Abbiamo uniformato il comportamento del `fixedWidthParser` per restituire sempre stringhe per tutti i campi (numerici, data, booleani) e abbiamo adattato gli schemi Zod `raw` di conseguenza. Le trasformazioni (`currencyTransform`, `dateTransform`, `flagTransform`) sono state applicate negli schemi `validated` per convertire le stringhe raw nei tipi desiderati.

2.  **Disallineamento Nomi Campi tra Definizione e Schema Zod**
    *   **Problema:** Un campo (`insDatiMovimentiAnalitici`) era definito correttamente nel `FieldDefinition` ma aveva un nome diverso (`movimentiAnalitici`) nello schema Zod `rawPnRigConSchema`, causando errori "Required" o "Expected string, received undefined".
    *   **Soluzione:** Abbiamo allineato il nome del campo nello schema Zod al nome corretto (`insDatiMovimentiAnalitici`).

3.  **Validazione Fallita delle Testate (`PNTESTA.TXT`)**
    *   **Problema:** Nessuna testata superava la validazione Zod, impedendo la correlazione con le righe e generando errori "Riga externalId="..." non trova testata". Questo era una conseguenza dei problemi di tipizzazione dei campi data e numerici.
    *   **Soluzione:** La risoluzione dei problemi di tipizzazione (punto 1) ha permesso alle testate di superare la validazione, sbloccando l'intero processo di importazione.

### Consigli per Evitare Problemi Futuri

*   **Definizione Chiara dei Tipi in Ogni Fase:** Assicurarsi che ci sia una chiara comprensione e coerenza dei tipi di dati in ogni fase del pipeline di elaborazione (parsing raw, schemi raw, schemi validati, modelli finali). Documentare esplicitamente i tipi attesi e prodotti in ogni passaggio.
*   **Test di Validazione Isolati:** Creare test unitari o script di validazione dedicati per ogni schema Zod, eseguendoli con dati reali o rappresentativi. Questo permette di identificare e isolare rapidamente i problemi di validazione senza dover eseguire l'intero workflow.
*   **Logging Dettagliato degli Errori Zod:** Utilizzare il logging completo degli errori Zod (come `JSON.stringify(error, null, 2)`) per ottenere messaggi d'errore precisi che indichino il percorso del campo problematico e il tipo atteso/ricevuto. Questo accelera notevolmente la diagnosi.
*   **Approccio Iterativo e Incrementale:** Affrontare i problemi uno alla volta, verificando ogni correzione prima di passare al successivo. Questo evita l'accumulo di errori e rende il debug più gestibile.
*   **Fonte di Verità Unica per le Specifiche:** Mantenere un documento aggiornato (come questo `fix_scrritture_contabili_parser_04.md`) che funga da fonte di verità per le specifiche dei file e le logiche di trasformazione. Questo riduce le ambiguità e facilita la collaborazione.


## Specifiche Tecniche dei File da Parsare sulle quali è stata sviluppata la logica di parsing
drll'App di Test (Parser Standalone)

Ecco un'analisi dettagliata e completa, con tabelle che rappresentano fedelmente ogni campo di ogni tracciato, compreso il calcolo delle posizioni di inizio e fine di ogni campo per maggiore chiarezza.

### 1. Rappresentazione Completa dei Tracciati (formato Excel-like)

Di seguito, la struttura completa di ogni file, con tutti i campi, come se fosse rappresentata in un foglio di calcolo.

#### **File 1: PNTESTA.TXT**
*   **Scopo:** Testata della registrazione contabile. Contiene i dati generali del movimento.
*   **Lunghezza Record:** 445 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato |
| **CODICE FISCALE (Azienda)** | A | 16 | 4 | 19 | Codice Fiscale dell'azienda che registra |
| **SUBCODICE FISCALE (Azienda)** | A | 1 | 20 | 20 | Subcodice dell'azienda |
| **CODICE UNIVOCO DI SCARICAMENTO**| A | 12 | 21 | 32 | **CHIAVE PRIMARIA:** Codice univoco che lega Testata, Righe e IVA |
| CODICE ATTIVITA | A | 2 | 33 | 34 | Codice attività contabile |
| ESERCIZIO | A | 5 | 35 | 39 | Esercizio contabile |
| CODICE CAUSALE | A | 6 | 40 | 45 | Codice della causale contabile (es. FA, RI) |
| DESCRIZIONE CAUSALE | A | 40 | 46 | 85 | Descrizione facoltativa della causale |
| DATA REGISTRAZIONE (GGMMAAAA) | N | 8 | 86 | 93 | Data di registrazione del movimento |
| CODICE ATTIVITA IVA | A | 2 | 94 | 95 | Codice attività IVA |
| TIPO REGISTRO IVA | A | 1 | 96 | 96 | A=Acquisti, C=Corrispettivi, V=Vendite |
| CODICE NUMERAZIONE IVA | A | 3 | 97 | 99 | Codice per la numerazione del registro IVA |
| CLIENTE/FORNITORE CODICE FISCALE| A | 16 | 100 | 115 | Codice Fiscale del cliente/fornitore principale |
| CLIENTE/FORNITORE SUBCODICE | A | 1 | 116 | 116 | Subcodice del cliente/fornitore |
| CLIENTE/FORNITORE SIGLA | A | 12 | 117 | 128 | Sigla/Codice interno del cliente/fornitore |
| DOCUMENTO DATA (GGMMAAAA) | N | 8 | 129 | 136 | Data del documento (es. data fattura) |
| DOCUMENTO NUMERO | A | 12 | 137 | 148 | Numero del documento |
| DOCUMENTO BIS | A | 1 | 149 | 149 | Eventuale suffisso del numero documento |
| DATA REGISTRO IVA (GGMMAAAA) | N | 8 | 150 | 157 | Data di registrazione sul registro IVA |
| PROTOCOLLO NUMERO | N | 6 | 158 | 163 | Numero di protocollo IVA |
| PROTOCOLLO BIS | A | 1 | 164 | 164 | Eventuale suffisso del protocollo |
| DATA COMPETENZA LIQUID. IVA | N | 8 | 165 | 172 | Data competenza per la liquidazione IVA |
| TOTALE DOCUMENTO | N | 12 | 173 | 184 | Importo totale del documento |
| DATA COMPETENZA CONTABILE | N | 8 | 185 | 192 | Data di competenza economica |
| NOTE MOVIMENTO | A | 60 | 193 | 252 | Note generali della registrazione |
| DATA PLAFOND (GGMMAAAA) | N | 8 | 253 | 260 | Data per la gestione del Plafond IVA |
| ANNO PRO-RATA | N | 4 | 261 | 264 | Anno per la gestione del Pro-Rata IVA |
| RITENUTE | N | 12 | 265 | 276 | Importo ritenute effettuate |
| ENASARCO | N | 12 | 277 | 288 | Importo contributi Enasarco |
| TOTALE IN VALUTA | N | 12 | 289 | 300 | Importo totale del documento in valuta |
| CODICE VALUTA | A | 4 | 301 | 304 | Codice della valuta estera |
| CODICE NUMERAZIONE IVA VENDITE | A | 3 | 305 | 307 | Dati per autofattura |
| PROTOCOLLO NUMERO (Autofattura) | N | 6 | 308 | 313 | Dati per autofattura |
| PROTOCOLLO BIS (Autofattura) | A | 1 | 314 | 314 | Dati per autofattura |
| VERSAMENTO DATA (GGMMAAAA) | N | 8 | 315 | 322 | Data versamento ritenute |
| VERSAMENTO TIPO | A | 1 | 323 | 323 | 0=F24/F23, 1=Tesoreria |
| VERSAMENTO MODELLO | A | 1 | 324 | 324 | 0-3 (Nessuno, Banca, etc.) |
| VERSAMENTO ESTREMI | A | 16 | 325 | 340 | Estremi del versamento |
| STATO | A | 1 | 341 | 341 | D=Definitiva, P=Provvisoria, V=Da verificare |
| TIPO GESTIONE PARTITE | A | 1 | 342 | 342 | Gestione partite/scadenzario (A, B, C, D) |
| CODICE PAGAMENTO | A | 8 | 343 | 350 | Codice per la creazione automatica delle rate |
| CODICE ATTIVITA IVA (Partita) | A | 2 | 351 | 352 | Dati della fattura da incassare/pagare |
| TIPO REGISTRO IVA (Partita) | A | 1 | 353 | 353 | Dati della fattura da incassare/pagare |
| CODICE NUMERAZIONE IVA (Partita)| A | 3 | 354 | 356 | Dati della fattura da incassare/pagare |
| CLI/FOR CODICE FISCALE (Partita)| A | 16 | 357 | 372 | Dati della fattura da incassare/pagare |
| CLI/FOR SUBCODICE (Partita) | A | 1 | 373 | 373 | Dati della fattura da incassare/pagare |
| CLI/FOR SIGLA (Partita) | A | 12 | 374 | 385 | Dati della fattura da incassare/pagare |
| DOCUMENTO DATA (Partita) | N | 8 | 386 | 393 | Dati della fattura da incassare/pagare |
| DOCUMENTO NUMERO (Partita) | A | 12 | 394 | 405 | Dati della fattura da incassare/pagare |
| DOCUMENTO BIS (Partita) | A | 1 | 406 | 406 | Dati della fattura da incassare/pagare |
| CLI/FOR (INTRA) CODICE FISCALE | A | 16 | 407 | 422 | Dati Intrastat |
| CLI/FOR (INTRA) SUBCODICE | A | 1 | 423 | 423 | Dati Intrastat |
| CLI/FOR (INTRA) SIGLA | A | 12 | 424 | 435 | Dati Intrastat |
| TIPO MOVIMENTO INTRASTAT | A | 2 | 436 | 437 | AA, AZ, VV, VZ |
| DOCUMENTO OPERAZIONE (GGMMAAAA)| N | 8 | 438 | 445 | Data operazione Intrastat |
| CRLF | E | 2 | 446 | 447 | Fine record |

---
#### **File 2: PNRIGCON.TXT**
*   **Scopo:** Righe contabili del movimento (Dare/Avere).
*   **Lunghezza Record:** 312 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato |
| **CODICE UNIVOCO DI SCARICAMENTO**| A | 12 | 4 | 15 | **CHIAVE ESTERNA:** Lega questa riga alla sua testata in PNTESTA.TXT |
| **PROGRESSIVO NUMERO RIGO** | N | 3 | 16 | 18 | **CHIAVE PRIMARIA (composta):** Identifica univocamente la riga |
| TIPO CONTO | A | 1 | 19 | 19 | C=Cliente, F=Fornitore |
| CLIENTE/FORNITORE CODICE FISCALE| A | 16 | 20 | 35 | Identificativo se TIPO CONTO = C/F |
| CLIENTE/FORNITORE SUBCODICE | A | 1 | 36 | 36 | Subcodice |
| CLIENTE/FORNITORE SIGLA | A | 12 | 37 | 48 | Sigla/Codice interno |
| CONTO | A | 10 | 49 | 58 | Codice conto del piano dei conti (es. costo, ricavo) |
| IMPORTO DARE | N | 12 | 59 | 70 | Importo in Dare |
| IMPORTO AVERE | N | 12 | 71 | 82 | Importo in Avere |
| NOTE | A | 60 | 83 | 142 | Note specifiche della riga contabile |
| INS. DATI COMPETENZA CONTABILE | N | 1 | 143 | 143 | 1=Se presenti i campi seguenti |
| DATA INIZIO COMPETENZA | N | 8 | 144 | 151 | Data inizio competenza economica della riga |
| DATA FINE COMPETENZA | N | 8 | 152 | 159 | Data fine competenza economica della riga |
| NOTE DI COMPETENZA | A | 60 | 160 | 219 | Note relative alla competenza |
| DATA REGISTRAZIONE APERTURA | N | 8 | 220 | 227 | Facoltativo |
| CONTO DA RILEVARE (MOVIMENTO 1) | A | 10 | 228 | 237 | Facoltativo |
| CONTO DA RILEVARE (MOVIMENTO 2) | A | 10 | 238 | 247 | Facoltativo |
| **INS. DATI MOVIMENTI ANALITICI**| N | 1 | 248 | 248 | **FLAG:** 1=Se esistono righe collegate in MOVANAC.TXT |
| DATA INIZIO COMPETENZA (Analit.)| N | 8 | 249 | 256 | Dati per movimenti analitici |
| DATA FINE COMPETENZA (Analit.) | N | 8 | 257 | 264 | Dati per movimenti analitici |
| INS. DATI STUDI DI SETTORE | N | 1 | 265 | 265 | Flag per Studi di Settore |
| STATO MOVIMENTO STUDI | A | 1 | 266 | 266 | G=Generato, M=Manuale |
| ESERCIZIO DI RILEVANZA FISCALE | A | 5 | 267 | 271 | Esercizio per la rilevanza fiscale |
| DETTAGLIO CLI/FOR CODICE FISCALE| A | 16 | 272 | 287 | Dettaglio cliente/fornitore |
| DETTAGLIO CLI/FOR SUBCODICE | A | 1 | 288 | 288 | Dettaglio cliente/fornitore |
| DETTAGLIO CLI/FOR SIGLA | A | 12 | 289 | 300 | Dettaglio cliente/fornitore |
| SIGLA CONTO | A | 12 | 301 | 312 | Alternativa al campo CONTO (pos. 49) |
| CRLF | E | 2 | 313 | 314 | Fine record |

---
#### **File 3: PNRIGIVA.TXT**
*   **Scopo:** Dettaglio dei castelletti IVA associati al movimento.
*   **Lunghezza Record:** 173 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato |
| **CODICE UNIVOCO DI SCARICAMENTO**| A | 12 | 4 | 15 | **CHIAVE ESTERNA:** Lega questa riga alla sua testata in PNTESTA.TXT |
| CODICE IVA | A | 4 | 16 | 19 | Codice IVA (aliquota, esenzione, etc.) |
| CONTROPARTITA | A | 10 | 20 | 29 | Codice conto della contropartita IVA |
| IMPONIBILE | N | 12 | 30 | 41 | Importo imponibile |
| IMPOSTA | N | 12 | 42 | 53 | Importo dell'imposta IVA |
| IMPOSTA INTRATTENIMENTI | N | 12 | 54 | 65 | Imposta per spese di intrattenimento |
| IMPONIBILE 50% CORR. NON CONS. | N | 12 | 66 | 77 | Dettaglio per calcoli specifici (corrispettivi) |
| IMPOSTA NON CONSIDERATA | N | 12 | 78 | 89 | Dettaglio per calcoli specifici |
| IMPORTO LORDO | N | 12 | 90 | 101 | Totale lordo della riga IVA |
| NOTE | A | 60 | 102 | 161 | Note specifiche della riga IVA |
| SIGLA CONTROPARTITA | A | 12 | 162 | 173 | Alternativa al campo CONTROPARTITA (pos. 20) |
| CRLF | E | 2 | 174 | 175 | Fine record |

---
#### **File 4: MOVANAC.TXT**
*   **Scopo:** Dettaglio dei centri di costo (contabilità analitica).
*   **Lunghezza Record:** 34 Bytes (+CRLF)

| Nome Campo | Tipo | Lun | Inizio | Fine | Descrizione |
| :--- | :--- | :-: | :---: | :---: |:--- |
| FILLER | A | 3 | 1 | 3 | Spazio non utilizzato |
| **CODICE UNIVOCO DI SCARICAMENTO**| A | 12 | 4 | 15 | **CHIAVE ESTERNA:** Lega al movimento generale in PNTESTA.TXT |
| **PROGRESSIVO NUMERO RIGO CONT.**| N | 3 | 16 | 18 | **CHIAVE ESTERNA:** Lega al rigo specifico in PNRIGCON.TXT |
| CENTRO DI COSTO | A | 4 | 19 | 22 | Codice del centro di costo |
| PARAMETRO | N | 12 | 23 | 34 | Importo da attribuire al centro di costo |
| CRLF | E | 2 | 35 | 36 | Fine record |

---
### 2. Cosa Rappresentano i File?

Questi file rappresentano, in modo strutturato e relazionale, tutti i dati necessari per importare **registrazioni di prima nota contabile complesse**.

*   **PNTESTA.TXT**: È la "Testata" della registrazione. Contiene i dati comuni a tutto il movimento, come la data, la causale, i dati del documento (fattura), il cliente/fornitore principale e i totali. Ogni record in questo file rappresenta una singola operazione contabile (es. una fattura di acquisto).
*   **PNRIGCON.TXT**: Sono le "Righe Contabili" del movimento. Descrive la scrittura in partita doppia (Dare/Avere). Ogni registrazione in `PNTESTA` avrà una o più righe corrispondenti in questo file, la cui somma Dare/Avere deve quadrare.
*   **PNRIGIVA.TXT**: Sono le "Righe IVA". Dettagliano il "castelletto IVA" della registrazione. Se il movimento è fiscalmente rilevante ai fini IVA, ci saranno una o più righe in questo file che specificano imponibili e imposte per ogni aliquota.
*   **MOVANAC.TXT**: Sono i "Movimenti Analitici". Dettagliano la suddivisione di un costo o di un ricavo su specifici "Centri di Costo". Questa è una dimensione aggiuntiva per la contabilità analitica/gestionale.

---
### 3. & 4. Relazioni tra i File

I file sono strettamente relazionati tra loro attraverso campi chiave, formando una struttura gerarchica.

La relazione principale è garantita dal campo **`CODICE UNIVOCO DI SCARICAMENTO`**, presente in tutti e quattro i file. Questo codice agisce come un "ID di transazione" che lega insieme tutte le parti di una singola registrazione contabile.

Ecco uno schema delle relazioni:

| File Sorgente | Campo Chiave Sorgente | File Destinazione | Campo Chiave Destinazione | Tipo Relazione | Descrizione |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PNTESTA.TXT** | `CODICE UNIVOCO...` | **PNRIGCON.TXT** | `CODICE UNIVOCO...` | **Uno-a-Molti** | Una testata può avere molte righe contabili (Dare/Avere). |
| **PNTESTA.TXT** | `CODICE UNIVOCO...` | **PNRIGIVA.TXT** | `CODICE UNIVOCO...` | **Uno-a-Molti** | Una testata può avere molte righe IVA (diverse aliquote). |
| **PNRIGCON.TXT**| `CODICE UNIVOCO...` + `PROGRESSIVO NUMERO RIGO` | **MOVANAC.TXT** | `CODICE UNIVOCO...` + `PROGRESSIVO NUMERO RIGO CONT.` | **Uno-a-Molti** | Una singola riga contabile (es. un costo) può essere suddivisa su più centri di costo. |

---
### 5. Possono Rappresentare un Unico "Movimento" Contabile?

**Assolutamente sì.**

Messi insieme, questi quattro file non solo possono, ma sono **progettati per rappresentare un unico movimento contabile completo** in tutte le sue sfaccettature:

1.  **Si parte dalla Testata (`PNTESTA.TXT`)**: Definisce l'operazione generale (es. "Registrazione Fattura Acquisto N. 123 del 15/11/2023 dal Fornitore X").
2.  **Si dettagliano le Righe Contabili (`PNRIGCON.TXT`)**: Si specificano i conti e gli importi in partita doppia.
    *   *Riga 1*: Costo merci (DARE) € 1.000
    *   *Riga 2*: IVA su acquisti (DARE) € 220
    *   *Riga 3*: Fornitore X (AVERE) € 1.220
3.  **Si dettaglia l'IVA (`PNRIGIVA.TXT`)**: Si specifica il calcolo IVA.
    *   *Riga 1*: Imponibile € 1.000, Imposta € 220, Codice IVA 22%.
4.  **Si dettaglia la Contabilità Analitica (`MOVANAC.TXT`)**: Se la riga del costo merci deve essere ripartita, si aggiungono i dettagli.
    *   *Riga 1*: Legata alla riga "Costo merci" di `PNRIGCON`, Centro di Costo "AMM", Importo € 400.
    *   *Riga 2*: Legata alla riga "Costo merci" di `PNRIGCON`, Centro di Costo "PROD", Importo € 600.

La struttura gerarchica e le chiavi di relazione permettono al software di importazione di ricostruire l'intera scrittura contabile, dai dati generali fino al minimo dettaglio gestionale, come un unico, coerente "movimento".