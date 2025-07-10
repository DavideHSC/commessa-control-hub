# Piano di Refactoring del Sistema di Importazione v2.0

**Stato:** Definitivo
**Obiettivo:** Ristrutturare completamente tutti i flussi di importazione (Piano dei Conti e Movimenti Contabili) per seguire un approccio "Extract-Load" (EL). L'obiettivo è eliminare la logica complessa di trasformazione e relazione durante l'importazione, a favore di un salvataggio diretto dei dati grezzi in tabelle di "staging". Questo garantirà robustezza, velocità e prevedibilità.

---

### **Fase 1: Refactoring del Database - Creazione delle Tabelle di Staging**

Questa fase prepara il database a ricevere i dati grezzi senza vincoli relazionali.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **1.1**| **Creazione Tabella `StagingConto`**| 🟡 In Corso | Aggiungere a `prisma/schema.prisma` una nuova tabella per i dati del Piano dei Conti. La tabella includerà tutti i campi presenti sia in `CONTIGEN.TXT` che in `CONTIAZI.TXT`, rendendoli tutti opzionali (`String?`). Sarà definita una **chiave composita univoca** `@@unique([codice, codiceFiscaleAzienda])` per gestire correttamente entrambi i tracciati. |
| **1.2**| **Creazione Tabelle Staging Movimenti**| ⬜ Pending | Creare le tabelle `StagingTestata`, `StagingRigaContabile`, `StagingRigaIva`, `StagingAllocazione`. Ognuna sarà una rappresentazione 1:1 dei campi dei rispettivi file (`PNTESTA`, `PNRIGCON`, ecc.), usando solo tipi di dato semplici (`String?`, `Float?`). |
| **1.3**| **Esecuzione Migrazione Database** | ⬜ Pending | Applicare le nuove tabelle al database tramite una migrazione Prisma. |

---

### **Fase 2: Refactoring del Codice - Logica di Importazione Semplificata**

Questa fase adatta il codice per usare la nuova struttura di staging.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **2.1**| **Semplificazione Workflow Piano dei Conti** | ⬜ Pending | Modificare `importPianoDeiContiWorkflow` e `importPianoDeiContiAziendaleWorkflow`. La loro unica responsabilità sarà chiamare il parser e poi eseguire una singola operazione `prisma.stagingConto.createMany()` per salvare i dati in blocco. |
| **2.2**| **Semplificazione Workflow Movimenti** | ⬜ Pending | Modificare `processScrittureInBatches` (o sostituirla). Dovrà solo eseguire `createMany` sulle nuove tabelle di staging (`StagingTestata`, `StagingRigaContabile`, ecc.), senza più `upsert`, `lookup` o logica di creazione "al volo". |
| **2.3**| **Rimozione/Svuotamento Transformers**| ⬜ Pending | Le funzioni nei file "transformer" verranno eliminate o ridotte al minimo indispensabile (es. conversioni di formato base), poiché non ci sono più trasformazioni complesse da eseguire. |
| **2.4**| **Commit e Push delle Modifiche** | ⬜ Pending | Consolidare tutte le modifiche del refactoring nel branch `refactor/simplification-import-logic`. |

---

### **Fase 3: Passi Futuri (Post-Refactoring)**

Una volta che l'importazione grezza sarà stabile, definiremo i passi successivi.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **3.1**| **Progettazione Processo di "Reconciliation"** | ⬜ Pending | Definire uno script o un'interfaccia utente che legga i dati dalle tabelle di staging, esegua le validazioni e i lookup, e li trasferisca nelle tabelle finali. Questo processo fornirà report di errore chiari (es. "Causale non trovata", "Conto mancante"). |
| **3.2**| **Pulizia Dati Esistenti** | ⬜ Pending | Valutare se sia necessario pulire le tabelle di produzione dai dati "sporchi" creati dai vecchi parser. | 