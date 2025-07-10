# Piano di Refactoring v2.1: Flusso End-to-End

**Stato:** In Corso
**Obiettivo Finale:** Sostituire l'instabile sistema di importazione diretta con un robusto flusso "Staging -> Riconciliazione", e al termine del processo, rimuovere completamente ogni residuo tecnico della vecchia implementazione per garantire un'architettura pulita e manutenibile.

---

### **Fase 1: Stabilizzazione e Visibilità (Creazione Staging Layer)**
**Obiettivo:** Separare l'ingestion dei dati dalla logica di business per rendere l'importazione robusta, veloce e immediatamente verificabile.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **1.1**| **Refactoring Database** | ✅ Completato | Create le tabelle `StagingConto`, `StagingTestata`, `StagingRigaContabile`, `StagingRigaIva`, `StagingAllocazione` in `prisma/schema.prisma`. |
| **1.2**| **Semplificazione Backend** | ✅ Completato | Modificati i workflow di importazione (`importPianoDeiContiWorkflow`, `importScrittureContabiliWorkflow`) per eseguire solo `createMany` sulle tabelle di staging, eliminando logiche di `upsert` e `lookup`. |
| **1.3**| **Creazione Endpoint di Staging** | 🟡 In Corso | Creare endpoint di **sola lettura** (es. `GET /api/staging/conti`) per esporre i dati grezzi con paginazione, ricerca e ordinamento. |
| **1.4**| **Creazione Viste Frontend** | 🟡 In Corso | Implementare una sezione dedicata (es. pagina "Dati di Staging") per visualizzare i dati importati, utilizzando i nuovi endpoint. |

---

### **Fase 2: Sviluppo del Processo di Riconciliazione**
**Obiettivo:** Creare il "ponte" logico e l'interfaccia utente per trasferire i dati dallo staging alle tabelle di produzione in modo controllato, validato e trasparente.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **2.1**| **Progettazione UI di Riconciliazione** | ⬜ Pending | Disegnare l'interfaccia utente che permetterà di avviare il processo di riconciliazione e di visualizzarne i risultati, inclusi report di errore dettagliati. |
| **2.2**| **Implementazione Logica di Riconciliazione** | ⬜ Pending | Implementare gli endpoint di backend (es. `POST /api/reconciliation/run`) che leggono i dati dallo staging, eseguono validazioni e lookup, e li trasferiscono nelle tabelle finali. |
| **2.3**| **Collegamento Frontend-Backend** | ⬜ Pending | Sviluppare i componenti frontend per interagire con la logica di riconciliazione e mostrare i risultati all'utente. |

---

### **Fase 3: Epurazione e Adozione Finale**
**Obiettivo:** Dismettere e rimuovere completamente la vecchia logica di importazione una volta che il nuovo flusso è validato e operativo, eliminando duplicazioni e debito tecnico.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **3.1**| **Pulizia Backend** | ⬜ Pending | Rimuovere codice legacy come la funzione `processScrittureInBatches` e svuotare i vecchi `transformer` non più necessari. Le rotte di import originali diventeranno semplici wrapper per la logica di staging. |
| **3.2**| **Pulizia Frontend** | ⬜ Pending | Semplificare la pagina di `Import` originale. Il suo unico scopo sarà l'upload e il reindirizzamento alla pagina di Staging. Rimuovere stati e logiche legati al vecchio processo. |
| **3.3**| **Pulizia Database** | ⬜ Pending | Scrivere ed eseguire uno script una-tantum per eliminare dalle tabelle di produzione i dati "placeholder" o inconsistenti creati dalla vecchia logica, se necessario. |
| **3.4**| **Revisione Finale** | ⬜ Pending | Eseguire un'analisi finale del codice per assicurarsi che non siano rimasti "fossili" della vecchia implementazione. | 