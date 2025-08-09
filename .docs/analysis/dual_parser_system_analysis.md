# Analisi del Sistema di Parsing Duale

**Data Inizio:** 02/08/2024
**Obiettivo:** Comprendere le cause dell'instabilità del sistema di importazione duale per il Piano dei Conti e i Movimenti Contabili.

---

### **Fase 1: Analisi del Flusso di Importazione del Piano dei Conti**

#### **Step 1.1: Analisi dell'Endpoint API (`server/routes/importConti.ts`)**

*   **Rilevamento:** È stato identificato un singolo endpoint API (`POST /api/import-conti`) che gestisce l'upload di un file.
*   **Logica:** Il sistema non si basa su endpoint separati, ma implementa una logica "intelligente" per determinare il tipo di file.
*   **Meccanismo di Riconoscimento:**
    *   Viene letta la prima riga del file caricato.
    *   Si ispeziona un segmento di testo dalla posizione 3 alla 19.
    *   Se il segmento contiene dati non vuoti (interpretati come un Codice Fiscale), il file viene classificato come **"Aziendale"**.
    *   Altrimenti, viene classificato come **"Standard"**.
*   **Invocazione Workflow:**
    *   **Aziendale** -> `importPianoDeiContiAziendaleWorkflow`
    *   **Standard** -> `importPianoDeiContiWorkflow`

*   **Considerazioni:**
    *   Questa euristica è il punto centrale di biforcazione della logica. Un'errata classificazione del file potrebbe inviarlo al workflow sbagliato, causando potenzialmente un crash.
    *   Il crash del "vecchio" parser (standard) potrebbe essere dovuto al fatto che un file "nuovo" viene erroneamente classificato come "standard" e inviato al workflow non corretto.

---

#### **Step 1.2: Analisi del Workflow Standard (`server/import-engine/orchestration/workflows/importPianoDeiContiWorkflow.ts`)**

*   **Rilevamento:** Questo workflow orchestra il processo di importazione per i file classificati come "Standard".
*   **Logica di Parsing:**
    *   Invoca una funzione generica, `parseFixedWidth`.
    *   Questa funzione non ha una logica di parsing cablata nel codice, ma si basa su una definizione di template recuperata dal database. Il nome del template usato qui è `'piano_dei_conti'`.
*   **Logica di Salvataggio (Upsert):**
    *   Esegue un `upsert` sulla tabella `Conto`.
    *   La condizione di `upsert` è `where: { codice_codiceFiscaleAzienda: { codice: record.codice, codiceFiscaleAzienda: '' } }`.
*   **Considerazioni:**
    *   **Punto di Fragilità Critico:** Il successo dell'intero workflow dipende dalla corrispondenza esatta tra la struttura del file "standard" e la definizione del template `'piano_dei_conti'` salvata nel database.
    *   **Ipotesi sul Crash:** Se la definizione del template nel database è stata alterata (magari per supportare il nuovo formato "aziendale") o è semplicemente errata, la funzione `parseFixedWidth` produrrà record malformati. Questi record, quando passati alla logica di validazione o di salvataggio (es. con un `codice` nullo o fuori posto), possono facilmente causare il crash descritto.
    *   La logica di `upsert` con `codiceFiscaleAzienda: ''` conferma che questo workflow è stato progettato per un piano dei conti "globale", non specifico per un'azienda.

---

### **Step 1.3: Riferimenti e Materiali di Analisi**

*   **Obiettivo:** Documentare i file e i tracciati forniti per l'analisi.
*   **Data:** 02/08/2024

*   **Documentazione Originale (Gestionale):**
    *   Guida Generale: `@/docs/dati_cliente/tracciati/Import_Export file ascii.txt`
    *   Tracciato Piano Conti Standard: `@/docs/dati_cliente/tracciati/CONTIGEN.TXT`

*   **Documentazione di Analisi (Prodotta):**
    *   Analisi Tracciato Standard: `@/docs/tracciati-analizzati/CONTIGEN.md`
    *   Analisi Tracciato Aziendale: `@/docs/tracciati-analizzati/CONTIAZI.md`

*   **File Dati di Esempio:**
    *   Piano Conti Standard: `@/docs/dati_cliente/dati_esempio/ContiGen.txt`
    *   Piano Conti Aziendale: `@/docs/dati_cliente/dati_reali/penisola/ContiAzi.txt`

*   **Considerazioni:**
    *   Questi file costituiscono la "ground truth" per la nostra analisi. Ogni implementazione dei parser dovrà essere validata rispetto a questi tracciati e file di esempio.
    *   Il file `Import_Export file ascii.txt` è la nostra guida di riferimento principale e contiene la distinzione tra `CONTIGEN.TXT` (generale) e `CONTIAZI.TXT` (per azienda).

---

### **Fase 2: Validazione Ipotesi e Debug**

#### **Step 2.1: Analisi del Seeding del Template (`prisma/seed.ts`)**

*   **Rilevamento:** È stata individuata la definizione del template `'piano_dei_conti'` all'interno dello script di seed del database.
*   **Analisi Comparativa:** La definizione dei campi nel file `seed.ts` (posizioni `start`, `end`, `length`) è stata confrontata con il tracciato ufficiale `CONTIGEN.TXT`.
*   **Risultato:** **Corrispondenza Perfetta.** La definizione del template nel database è corretta e riflette fedelmente il tracciato del file standard.
*   **Considerazioni:**
    *   **Ipotesi Invalida:** La causa del crash non è un errore nella definizione del template di importazione. Il parser è configurato correttamente per leggere un file `CONTIGEN.TXT`.
    *   **Nuova Ipotesi:** Il problema risiede a un livello superiore. È altamente probabile che un file in formato "Aziendale" (`CONTIAZI.TXT`) venga erroneamente classificato come "Standard" e quindi inviato al workflow sbagliato (`importPianoDeiContiWorkflow`). Il parser, aspettandosi una struttura `CONTIGEN`, legge il file `CONTIAZI` con offset errati, generando dati inconsistenti che portano al crash durante la validazione o l'inserimento nel database.

---

#### **Step 2.2: Test della Logica di Rilevamento**

*   **Azione:** È stata esaminata la prima riga del file di esempio `ContiAzi.txt` e su di essa è stata simulata la logica di rilevamento presente nell'endpoint API.
*   **Logica Applicata:** `firstLine.substring(3, 19).trim()`
*   **Risultato:** L'estrazione sulla prima riga di `ContiAzi.txt` produce correttamente il codice fiscale `'03684671211'`. La variabile `isAziendale` viene quindi impostata a `true`.
*   **Conclusione:** **La logica di rilevamento funziona come previsto.** Un file `ContiAzi.txt` viene correttamente identificato come "Aziendale".
*   **Considerazioni:**
    *   **Seconda Ipotesi Invalida:** Anche questa ipotesi viene scartata. Il problema non sembra essere un'errata classificazione dei file.
    *   **Nuova Direzione:** Se la logica di selezione funziona e instrada correttamente i file, allora dobbiamo considerare due possibilità rimanenti:
        1.  Il file `CONTIGEN.TXT` che causa il crash quando viene importato ha qualche anomalia non visibile che lo fa classificare erroneamente come "Aziendale" (improbabile ma possibile).
        2.  Il vero problema risiede nel workflow a cui i file vengono inviati. Poiché l'obiettivo è far funzionare il nuovo formato, il punto debole deve trovarsi all'interno di `importPianoDeiContiAziendaleWorkflow`. È questo workflow che, pur ricevendo il file corretto, non riesce a processarlo come atteso, causando i problemi a valle che hai descritto (mancata associazione delle causali, ecc.).

---

### **Fase 3: Analisi del Workflow Aziendale**

#### **Step 3.1: Analisi del Workflow (`importPianoDeiContiAziendaleWorkflow.ts`)**

*   **Rilevamento:** È stato analizzato il workflow per l'importazione del piano dei conti aziendale.
*   **Logica:** Il workflow è strutturalmente corretto e parallelo a quello standard. Esegue parsing, validazione, trasformazione e salvataggio in sequenza.
*   **Componenti Chiave:**
    *   Parser: `parseFixedWidth` (lo stesso del workflow standard).
    *   Template: Usa il nome `'piano_dei_conti_aziendale'`.
    *   Logica di Salvataggio: Esegue un `upsert` basato sulla coppia `codice` + `codiceFiscaleAzienda`, che è corretto per la gestione di conti personalizzati.
*   **Considerazioni:**
    *   Il workflow in sé non presenta errori logici evidenti nel suo flusso.
    *   **Ipotesi Focalizzata:** Il problema deve risiedere in uno dei componenti che il workflow utilizza. L'indiziato più probabile è la **definizione del template `'piano_dei_conti_aziendale'`**. Se questa definizione, contenuta nel file di seed, non corrisponde esattamente al tracciato del file `CONTIAZI.TXT`, il parser produrrà dati errati. Questi dati, a loro volta, causeranno il fallimento della validazione o, peggio, dell'inserimento nel database, portando ai problemi osservati. La seconda possibilità, meno probabile, è un bug nelle funzioni di validazione/trasformazione.

---

#### **Step 3.2: Analisi del Seeding del Template Aziendale (`prisma/seed.ts`)**

*   **Azione:** È stato analizzato l'intero file `prisma/seed.ts` alla ricerca della definizione del template `'piano_dei_conti_aziendale'`.
*   **Risultato:** **DEFINIZIONE MANCANTE.** Il file di seed crea i template per tutti gli altri tipi di importazione, ma non esiste alcuna definizione per `'piano_dei_conti_aziendale'`.
*   **Conclusione:** **Questa è la causa principale del problema.** Quando il workflow aziendale viene invocato, cerca un template che non esiste nel database. La funzione di parsing non ha le istruzioni per interpretare il file `CONTIAZI.TXT` e l'intero processo di importazione si interrompe.
*   **Considerazioni:**
    *   L'instabilità percepita del sistema "duale" deriva da questo. Il ramo "standard" è probabilmente funzionante, ma il ramo "aziendale" è incompleto, portando al fallimento dell'importazione per i nuovi file.
    *   La soluzione consiste nell'aggiungere la definizione del template mancante al file di seed e rieseguire il seeding del database.
    
---

### **Fase 4: Analisi Importazione Movimenti Contabili**

#### **Step 4.1: Analisi del Problema Post-Import**

*   **Azione:** È stata analizzata l'immagine fornita dall'utente relativa alla modifica di una scrittura contabile (`scrittura_012025130524`) dopo l'importazione del piano dei conti aziendale e dei movimenti.
*   **Rilevamento:**
    1.  Il campo `Causale Contabile` nella testata della registrazione è vuoto.
    2.  I campi `Conto` in tutte le righe contabili sono vuoti e non associati.
*   **Conclusione:** Il processo di importazione dei movimenti sta leggendo i file, ma **fallisce nella fase di "lookup" e associazione delle relazioni**. Non riesce a trovare nel database la causale contabile e i conti corrispondenti agli ID/codici presenti nei file di importazione.
*   **Prossimo Passo:** Analizzare il workflow di importazione delle scritture contabili per identificare dove e perché questo processo di lookup fallisce.

---

#### **Step 4.2: Analisi della Rotta di Importazione (`server/routes/importScritture.ts`)**

*   **Azione:** È stato analizzato il file che gestisce l'endpoint API per l'importazione delle scritture.
*   **Rilevamento:**
    1.  A differenza del flusso per il piano dei conti, questa rotta **non utilizza** la nuova architettura a "workflow", ma si affida a una logica implementata direttamente e a funzioni di utilità.
    2.  La rotta recupera correttamente dal database il template `scritture_contabili`.
    3.  Esegue il parsing dei vari file (`PNTESTA`, `PNRIGCON`, ecc.) in modo separato.
    4.  L'intera logica di elaborazione, associazione e salvataggio dei dati è delegata a una funzione esterna: `processScrittureInBatches`, importata dal file `server/lib/importUtils.js`.
*   **Conclusione:** Il punto nevralgico dell'analisi si sposta sul file `importUtils.js`. È lì che risiede la logica di business che dovrebbe associare i dati tra loro, ed è lì che si verifica il fallimento.

---

#### **Step 4.3: Analisi della Logica di Business (`server/lib/importUtils.ts`)**

*   **Azione:** È stata analizzata la funzione `processScrittureInBatches` che contiene la logica di salvataggio.
*   **Rilevamento Critico:**
    1.  **Lookup Causale:** Il codice **non esegue alcun lookup** per la causale contabile. L'ID viene preso dal file e inserito direttamente, il che causa un riferimento rotto se l'ID non corrisponde esattamente a una causale valida nel database.
    2.  **Lookup Conto (Causa Principale):** La logica che cerca e crea i conti è **errata**. Utilizza un `codiceFiscaleAzienda` hardcoded come stringa vuota (`''`).
*   **Conclusione Definitiva:** La funzione di importazione **non è consapevole del contesto multi-aziendale**. Cerca i conti solo nel piano dei conti "generale", ignorando completamente il piano dei conti specifico dell'azienda importato da `ContiAzi.txt`. Questo causa il mancato abbinamento di tutti i conti.
*   **Soluzione:** È necessario modificare il flusso di importazione per:
    1.  Determinare il `codiceFiscaleAzienda` dai file di input (probabilmente `PNTESTA.TXT`).
    2.  Passare questo codice fiscale alla funzione `processScrittureInBatches`.
    3.  Utilizzare questo codice fiscale per eseguire il lookup dei conti nel contesto aziendale corretto.
    4.  Implementare un lookup robusto anche per le causali contabili. 



# Riepilogo Operazioni effettuate sul Database dalla procedura di importazione dei Movimenti Contabili

---

## 1. Tabella `Fornitore`
*   **Operazione:** `upsert` (crea se non esiste, altrimenti non fa nulla).
*   **Condizione:** Cerca tramite `externalId` (che corrisponde al `clienteFornitoreCodiceFiscale` dal file `PNTESTA.TXT`).
*   **Campi Scritte** (in caso di creazione):
    *   `externalId`: `clienteFornitoreCodiceFiscale` dalla testata.
    *   `nome`: Un valore generato, es. "Fornitore importato - `[externalId]`".

---

## 2. Tabella `CausaleContabile`
*   **Operazione:** `findUnique` (solo lettura).
*   **Condizione:** Cerca tramite `codice` (che corrisponde al `causaleId` dal file `PNTESTA.TXT`).
*   **Scopo:** Recupera l'ID interno della causale. Se non la trova, l'intera transazione per quella scrittura fallisce. **Non crea nuove causali.**

---

## 3. Tabella `ScritturaContabile` (la testata della registrazione)
*   **Operazione:** `upsert`.
*   **Condizione:** Cerca tramite `externalId` (l'ID della testata dal file `PNTESTA.TXT`).
*   **Campi Scritte:**
    *   `externalId`: ID della testata.
    *   `data`: `dataRegistrazione` dalla testata.
    *   `descrizione`: Un valore generato, es. "Importazione - `[externalId]`".
    *   `causaleId`: L'ID della causale trovato al punto 2.
    *   `dataDocumento`: `dataDocumento` dalla testata.
    *   `numeroDocumento`: `numeroDocumento` dalla testata.
    *   `fornitoreId`: L'ID del fornitore trovato al punto 1 (può essere nullo).

---

## 4. Tabella `Conto`
*   **Operazione:** `upsert`.
*   **Condizione:** Cerca usando una chiave composta da `codice` (il codice del conto dal file `PNRIGCON.TXT`) e `codiceFiscaleAzienda` (passato alla funzione). *Questo è il fix cruciale che lega il conto all'azienda corretta.*
*   **Campi Scritte** (in caso di creazione):
    *   `codice`: Il codice del conto.
    *   `codiceFiscaleAzienda`: Il codice fiscale dell'azienda a cui appartiene il conto.
    *   `nome`: Un valore generato, es. "Conto importato - `[codice]`".
    *   `tipo`: Valore fisso `Patrimoniale`.
    *   `richiedeVoceAnalitica`: Valore fisso `false`.

---

## 5. Tabella `RigaScrittura` (le righe della registrazione)
*   **Operazione:** `create` (crea sempre una nuova riga).
*   **Campi Scritte:**
    *   `scritturaContabileId`: L'ID della `ScritturaContabile` creata al punto 3.
    *   `descrizione`: Il campo `note` dal file `PNRIGCON.TXT`.
    *   `dare`: `importoDare` dal file.
    *   `avere`: `importoAvere` dal file.
    *   `contoId`: L'ID del `Conto` trovato/creato al punto 4.

---

### Sezioni Opzionali

Le seguenti operazioni vengono eseguite solo se sono presenti i file corrispondenti.

#### 6. Tabella `CodiceIva` (opzionale, se presente `PNRIGIVA.TXT`)
*   **Operazione:** `upsert`.
*   **Condizione:** Cerca tramite `externalId` (il `codiceIva` dal file `PNRIGIVA.TXT`).
*   **Campi Scritte** (in caso di creazione):
    *   `externalId`: Il codice IVA.
    *   `codice`: Il codice IVA.
    *   `descrizione`: Valore generato, es. "IVA importata - `[codiceIva]`".
    *   `aliquota`: Valore fisso `0`.

#### 7. Tabella `RigaIva` (opzionale, se presente `PNRIGIVA.TXT`)
*   **Operazione:** `create`.
*   **Campi Scritte:**
    *   `rigaScritturaId`: L'ID della `RigaScrittura` creata al punto 5.
    *   `imponibile`: `imponibile` dal file.
    *   `imposta`: `imposta` dal file.
    *   `codiceIvaId`: L'ID del `CodiceIva` trovato/creato al punto 6.

#### 8. Tabella `VoceAnalitica` (opzionale, se presente `MOVANAC.TXT`)
*   **Operazione:** `upsert`.
*   **Condizione:** Cerca tramite `nome` (il parametro dal file `MOVANAC.TXT`).
*   **Campi Scritte** (in caso di creazione):
    *   `nome`: Il valore del parametro.

#### 9. Tabella `Commessa` (opzionale, se presente `MOVANAC.TXT`)
*   **Operazione:** `upsert`.
*   **Condizione:** Cerca tramite `nome` (il `centroDiCosto` dal file `MOVANAC.TXT`).
*   **Campi Scritte** (in caso di creazione):
    *   `nome`: Il centro di costo.
    *   `clienteId`: Un ID cliente di sistema fisso (`SYSTEM_CUSTOMER_ID`).

#### 10. Tabella `Allocazione` (opzionale, se presente `MOVANAC.TXT`)
*   **Operazione:** `create`.
*   **Campi Scritte:**
    *   `rigaScritturaId`: L'ID della `RigaScrittura` creata al punto 5.
    *   `importo`: Il parametro `importo` dal file.
    *   `commessaId`: L'ID della `Commessa` trovata/creata al punto 9.
    *   `voceAnaliticaId`: L'ID della `VoceAnalitica` trovata/creata al punto 8.



#### Mappatura diretta file → tabella principale

I file di testo di origine sono strutturati in modo denormalizzato e basato su codici, mentre lo schema Prisma rappresenta la struttura finale, normalizzata e relazionale del database. Di seguito viene fornita una mappatura chiara tra ciascun file di input e la tabella di destinazione principale nello schema, con dettaglio dei campi e della logica di mapping.

---

##### **1. PNTESTA.TXT → ScritturaContabile**

Questo file rappresenta la testata della registrazione contabile. La sua controparte naturale è la tabella `ScritturaContabile`.

| Campo in PNTESTA.TXT           | Campo in ScritturaContabile | Logica di Mapping                                                                                  |
|-------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------|
| CODICE UNIVOCO DI SCARICAMENTO| externalId                  | Corrispondenza diretta. Identificativo esterno della registrazione.                                |
| CODICE CAUSALE                | causaleId                   | Lookup: il codice (es. "FA") viene usato per cercare l'ID nella tabella `CausaleContabile`.        |
| DATA REGISTRAZIONE            | data                        | Corrispondenza diretta (dopo conversione in formato data).                                         |
| DATA DOCUMENTO                | dataDocumento               | Corrispondenza diretta (dopo conversione).                                                         |
| DOCUMENTO NUMERO              | numeroDocumento             | Corrispondenza diretta.                                                                            |
| CLIENTE/FORNITORE CODICE FISCALE | fornitoreId              | Lookup: il codice fiscale viene usato per cercare l'ID nella tabella `Fornitore`.                  |
| NOTE MOVIMENTO                | descrizione                 | Corrispondenza diretta.                                                                            |
| Altri campi                   | (Nessun campo diretto)      | Ignorati (es. ESERCIZIO, STATO, CODICE ATTIVITA IVA, ecc.).                                        |

---

##### **2. PNRIGCON.TXT → RigaScrittura**

Questo file contiene le righe contabili (Dare/Avere) del movimento. Ogni riga diventa un record nella tabella `RigaScrittura`.

| Campo in PNRIGCON.TXT          | Campo in RigaScrittura      | Logica di Mapping                                                                                  |
|-------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------|
| CODICE UNIVOCO DI SCARICAMENTO| scritturaContabileId        | Relazione padre-figlio: collega la riga alla sua testata (`ScritturaContabile`).                   |
| CONTO                         | contoId                     | Lookup: il codice conto (es. "411001") viene usato per cercare l'ID nella tabella `Conto`.         |
| IMPORTO DARE                  | dare                        | Corrispondenza diretta.                                                                            |
| IMPORTO AVERE                 | avere                       | Corrispondenza diretta.                                                                            |
| NOTE                          | descrizione                 | Corrispondenza diretta.                                                                            |
| INS. DATI MOVIMENTI ANALITICI | (Nessun campo)              | Flag logico: se vale '1', la procedura cerca una riga corrispondente in `MOVANAC.TXT`.             |
| CLIENTE/FORNITORE CODICE FISCALE | clienteId / fornitoreId  | Lookup: se presente, popola la relazione con il cliente/fornitore.                                 |

---

##### **3. PNRIGIVA.TXT → RigaIva**

Questo file descrive il castelletto IVA. Ogni riga diventa un record nella tabella `RigaIva`.

| Campo in PNRIGIVA.TXT          | Campo in RigaIva            | Logica di Mapping                                                                                  |
|-------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------|
| CODICE UNIVOCO DI SCARICAMENTO| rigaScritturaId             | Relazione complessa: il file lega la riga IVA alla testata, ma lo schema la lega a una `RigaScrittura` specifica. La logica di importazione deve fare un'ipotesi su quale riga contabile associare. |
| CODICE IVA                    | codiceIvaId                 | Lookup: il codice (es. "22") viene usato per cercare l'ID nella tabella `CodiceIva`.               |
| IMPONIBILE                    | imponibile                  | Corrispondenza diretta.                                                                            |
| IMPOSTA                       | imposta                     | Corrispondenza diretta.                                                                            |
| CONTROPARTITA                 | (Nessun campo diretto)      | Ignorato.                                                                                          |

---

##### **4. MOVANAC.TXT → Allocazione**

Questo file contiene la suddivisione dei costi/ricavi per la contabilità analitica. Ogni riga diventa un record nella tabella `Allocazione`.

| Campo in MOVANAC.TXT           | Campo in Allocazione        | Logica di Mapping                                                                                  |
|-------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------|
| CODICE UNIVOCO + PROG. NUMERO RIGO | rigaScritturaId         | Relazione padre-figlio: la coppia di chiavi lega l'allocazione alla specifica `RigaScrittura`.     |
| CENTRO DI COSTO                | commessaId                  | Lookup: il codice del centro di costo viene usato per cercare l'ID nella tabella `Commessa`.       |
| PARAMETRO (importo)            | importo                     | Corrispondenza diretta.                                                                            |
| PARAMETRO (voce analitica)     | voceAnaliticaId             | Lookup implicito: il tracciato non ha un campo dedicato, la procedura usa il valore del campo PARAMETRO anche per cercare (o creare) una `VoceAnalitica` corrispondente. Questo è un punto critico e fonte di possibili ambiguità. |

---

#### Riepilogo visivo

| File di Origine   | Tabella Prisma Principale |
|-------------------|--------------------------|
| PNTESTA.TXT       | ScritturaContabile        |
| PNRIGCON.TXT      | RigaScrittura             |
| PNRIGIVA.TXT      | RigaIva                   |
| MOVANAC.TXT       | Allocazione               |

---

Questa mappatura chiarisce come i dati dei file vengono "tradotti" nella struttura relazionale del database. Il piano proposto mira a semplificare il processo, salvando i codici grezzi direttamente nelle tabelle e gestendo i lookup in un secondo momento, rendendo il flusso più trasparente e meno soggetto a errori.