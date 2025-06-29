# Piano di Test e Validazione - Parser Scritture Contabili

**ID:** `PLAN-06`
**Data:** 29 Giugno 2025
**Obiettivo:** Verificare la correttezza, la completezza e la robustezza del parser delle scritture contabili, che orchestra l'importazione dei file `PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT` e `MOVANAC.TXT`.

---

#### **FASE 1: Test di Esecuzione e Controllo Errori Generici (Smoke Test)**

*   **STATO:** ✅ **COMPLETATA**
*   **Obiettivo:** Verificare che il processo di importazione si avvii e si completi senza errori bloccanti a livello di applicazione.
*   **Azione 1.1:** Preparare una richiesta `curl` (o simile) per l'endpoint `POST /api/v2/import/scritture-contabili`, includendo i 4 file di dati necessari.
*   **Azione 1.2:** Eseguire la richiesta e monitorare i log del server.
*   **Criteri di Successo:**
    *   ✅ La richiesta HTTP deve restituire uno stato `200 OK`.
    *   ✅ I log del server non devono mostrare errori fatali (es. crash dell'applicazione, eccezioni non gestite).
    *   ✅ I log devono indicare che il workflow è stato avviato e completato, fornendo statistiche di base (es. "X testate elaborate").
*   **Note:** Test eseguito con successo in data 29/06/2025. I log hanno confermato l'avvio e il completamento del job con 0 errori.

---

#### **FASE 2: Analisi di Completezza dei Dati (Controllo Quantitativo)**

*   **STATO:** ✅ **COMPLETATA**
*   **Obiettivo:** Verificare che il numero di record creati nel database corrisponda al numero di record presenti nei file di origine.
*   **Azione 2.1:** Analizzare le statistiche restituite dalla API e/o dai log per contare i record creati per ogni entità (`ScritturaContabile`, `RigaScrittura`, `RigaIva`, `Allocazione`).
*   **Azione 2.2:** Confrontare questi numeri con il numero di righe presenti nei rispettivi file di input.
*   **Criteri di Successo:**
    *   ✅ Il numero di `ScritturaContabile` create deve corrispondere al numero di righe in `PNTESTA.TXT`.
    *   ✅ Il numero di `RigaScrittura` create deve corrispondere al numero di righe in `PNRIGCON.TXT`.
    *   ✅ Il numero di `RigaIva` create deve corrispondere al numero di righe in `PNRIGIVA.TXT`.
    *   ✅ Il numero di `Allocazione` create deve corrispondere al numero di righe in `MOVANAC.TXT`.
*   **Note:** Test eseguito con successo in data 29/06/2025. I log hanno confermato la corrispondenza 1:1 tra le righe dei file e i record validati e creati.

---

#### **FASE 3: Analisi di Correttezza delle Relazioni (Controllo Qualitativo)**

*   **STATO:** ⌛ **DA ESEGUIRE**
*   **Obiettivo:** Verificare che i dati siano stati non solo creati, ma anche collegati correttamente tra loro, rispettando l'integrità referenziale.
*   **Azione 3.1:** Eseguire query dirette sul database (o tramite un'interfaccia di amministrazione) per verificare le relazioni.
*   **Criteri di Successo:**
    *   ✅ Ogni `RigaScrittura` deve avere una `scritturaContabileId` che punta a una `ScritturaContabile` valida.
    *   ✅ Ogni `RigaIva` deve avere una `rigaScritturaId` che punta a una `RigaScrittura` valida.
    *   ✅ Ogni `Allocazione` deve avere una `rigaScritturaId` che punta a una `RigaScrittura` valida.
    *   ✅ Non devono esistere record "orfani".

---

#### **FASE 4: Analisi di Accuratezza dei Dati (Controllo di Merito)**

*   **STATO:** ⌛ **DA ESEGUIRE**
*   **Obiettivo:** Verificare che i singoli campi siano stati parsati e salvati con i valori corretti.
*   **Azione 4.1:** Selezionare un campione di 3-5 movimenti contabili complessi dai file di origine.
*   **Azione 4.2:** Tracciare questi movimenti end-to-end: dal file di testo, attraverso il parser, fino al record salvato nel database.
*   **Criteri di Successo:**
    *   ✅ Le date devono essere corrette.
    *   ✅ Gli importi (Dare, Avere, Imponibile, Imposta) devono essere corretti.
    *   ✅ Le descrizioni e le note devono corrispondere.
    *   ✅ I codici (conto, causale, IVA, centro di costo) devono essere corretti.

---

### **Appendice: Cronistoria del Debug e Lezioni Apprese**

Questa sezione serve come memoria storica per il debug del parser. Se si verificano nuovamente errori durante l'importazione, consultare questa guida prima di tentare nuove soluzioni.

**Problema Iniziale:** Il parser falliva con una serie di errori di validazione Zod apparentemente slegati, che cambiavano a ogni tentativo di fix. L'errore più comune era `Riga non trova testata`, indicando un problema a monte nella validazione del file `PNTESTA.TXT`.

**Diagnosi Errata Iniziale:** Inizialmente si è tentato di far gestire la conversione dei tipi (date, booleani, numeri) direttamente al `fixedWidthParser`. Questo approccio si è rivelato **errato** e ha causato una cascata di errori `invalid_type` tra il parser e i validatori Zod.

**La Soluzione Corretta (Architettura a 3 Strati):**

La soluzione definitiva, ricostruita analizzando una precedente sessione di debug di successo, si basa su una chiara separazione dei compiti:

1.  **Definizioni Semplici (`scrittureContabiliDefinitions.ts`):**
    *   **Insight:** Tutti i campi, indipendentemente dal loro tipo logico (data, numero, booleano), devono essere definiti come `type: 'string'`.
    *   **Azione Correttiva:** Assicurarsi che nessuna definizione contenga `type: 'date'`, `type: 'boolean'` o `type: 'number'`.

2.  **Parser Semplice (`fixedWidthParser.ts`):**
    *   **Insight:** Il parser non deve fare alcuna magia. Il suo unico compito è estrarre le porzioni di stringa dal file a larghezza fissa, così come sono.
    *   **Azione Correttiva:** Rimuovere qualsiasi logica di conversione (`moment(..).toDate()`, `parseInt`, `parseFloat`, controlli booleani) dal parser. Deve semplicemente eseguire `line.substring(...)` e assegnare il valore.

3.  **Validatori Zod Intelligenti (`scrittureContabiliValidator.ts`):**
    *   **Insight:** Qui risiede tutta l'intelligenza. La validazione avviene in due passaggi:
        *   **Schema `raw...Schema`:** Deve aspettarsi di ricevere solo stringhe (`z.string().nullable()`), rispecchiando l'output grezzo del parser.
        *   **Schema `validated...Schema`:** Utilizza delle utility di trasformazione (`dateTransform`, `currencyTransform`, `flagTransform`) per convertire le stringhe grezze nei tipi di dato finali e puliti (`Date`, `number`, `boolean`).
    *   **Azione Correttiva:**
        *   Verificare che gli schemi `raw...` contengano solo `z.string()`.
        *   Verificare che le utility `transform` partano da `z.string()` e gestiscano i casi limite (es. stringhe vuote, '00000000' per le date).
        *   Verificare che gli schemi `validated...` usino queste utility.
    *   **Dettaglio Cruciale:** Assicurarsi che il campo `externalId` in **tutti** gli schemi `validated` abbia la trasformazione `.trim()` per evitare errori di join a causa di spazi bianchi residui.

**Guida Rapida alla Diagnosi Futura:**

*   **Errore `Expected <type>, received string`:** Il problema è quasi certamente nel validatore. Lo schema `raw...` si aspetta un tipo complesso invece di una stringa.
*   **Errore `Expected string, received <type>`:** Il problema è nel parser (o nelle definizioni). Sta erroneamente convertendo un tipo, mentre dovrebbe solo estrarre stringhe.
*   **Errore `non trova testata`:** Il problema è quasi sempre uno `space mismatch` sul campo `externalId`. Verificare che `.trim()` sia applicato in modo coerente sia in `validatedPnTestaSchema` sia negli schemi delle righe di dettaglio.
*   **Errore `NaN` su un importo:** Il `currencyTransform` non sta gestendo correttamente un caso limite (es. stringa vuota o non numerica).

---
