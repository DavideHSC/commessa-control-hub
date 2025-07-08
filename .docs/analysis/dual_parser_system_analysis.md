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