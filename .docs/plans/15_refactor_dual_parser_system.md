# Piano di Refactoring v2.2: Flusso End-to-End con Logica di Staging

**Stato:** In Corso
**Obiettivo Finale:** Sostituire l'instabile sistema di importazione diretta con un robusto flusso "Staging -> Riconciliazione", e al termine del processo, rimuovere completamente ogni residuo tecnico della vecchia implementazione per garantire un'architettura pulita e manutenibile.

---

### **Fase 1: Stabilizzazione e Visibilità (Creazione Staging Layer)**
**Obiettivo:** Separare l'ingestion dei dati dalla logica di business per rendere l'importazione robusta, veloce e immediatamente verificabile.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **1.1**| **Refactoring Database** | ✅ Completato | Create le tabelle `StagingConto`, `StagingTestata`, `StagingRigaContabile`, `StagingRigaIva`, `StagingAllocazione` in `prisma/schema.prisma`. |
| **1.2**| **Semplificazione Backend** | ✅ Completato | Modificati i workflow di importazione (`importPianoDeiContiWorkflow`, `importScrittureContabiliWorkflow`) per eseguire solo `createMany` sulle tabelle di staging, eliminando logiche di `upsert` e `lookup`. |
| **1.3**| **Creazione Endpoint di Staging** | ✅ Completato | Creati endpoint di **sola lettura** (es. `GET /api/staging/conti`, `/api/staging/scritture`) per esporre i dati grezzi con paginazione, ricerca e ordinamento. |
| **1.4**| **Creazione Viste Frontend** | ✅ Completato | Implementata una sezione dedicata ("Dati di Staging") per visualizzare i dati importati. |
| **1.5**| **Correzione Visibilità Dati** | ✅ Completato | **(Non pianificato)** Estesa la tabella di staging dei conti per mostrare **tutte** le colonne importate, garantendo una validazione 1:1 con il file sorgente. |
| **1.6**| **Correzione Reset Database** | ✅ Completato | **(Non pianificato)** Aggiornata la funzione di sistema "Azzera e Ripopola" per includere lo svuotamento di tutte le nuove tabelle di staging. |
| **1.7**| **Ottimizzazione Performance Import**| ✅ Completato | **(Non pianificato)** Sostituita la logica di importazione con `upsert` (lenta) con un pattern `deleteMany` + `createMany` per ripristinare performance ottimali. |


---

### **Fase 2: Sviluppo del Processo di Riconciliazione**
**Obiettivo:** Creare il "ponte" logico e l'interfaccia utente per trasferire i dati dallo staging alle tabelle di produzione in modo controllato, validato e trasparente.

**Nota sulla Logica di Staging:** La tabella di staging contiene intenzionalmente una copia fedele dei dati dei file, inclusi record "duplicati" con chiavi diverse (es. conto '411' standard e conto '411' per una specifica azienda). Questo è voluto. Il processo di riconciliazione implementerà la logica di "override": per ogni entità, cercherà prima la versione specifica per l'azienda; se non la trova, utilizzerà la versione standard. Questo garantisce che non si perda nessuna informazione durante l'importazione e che la logica di business sia isolata e gestita in questa fase.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **2.1**| **Progettazione UI di Riconciliazione** | 🟡 In Corso | Disegnare l'interfaccia utente che permetterà di avviare il processo di riconciliazione e di visualizzarne i risultati, inclusi report di errore dettagliati. |
| **2.2**| **Implementazione Logica di Riconciliazione** | ✅ Completato | Implementato endpoint di backend (`POST /reconciliation/finalize-conti`) che trasferisce il piano dei conti dallo staging alla tabella finale. |
| **2.3**| **Collegamento Frontend-Backend** | ✅ Completato | Sviluppati i componenti frontend (pulsante di finalizzazione, tabella di configurazione conti) per interagire con la logica di riconciliazione. |

---

### **Fase 3: Epurazione e Adozione Finale**
**Obiettivo:** Dismettere e rimuovere completamente la vecchia logica di importazione una volta che il nuovo flusso è validato e operativo, eliminando duplicazioni e debito tecnico.

| ID | Task | Stato | Dettagli |
| :-- | :--- | :--- | :--- |
| **3.1**| **Pulizia Backend** | ✅ Completato | Rimosso codice legacy come la funzione `processScrittureInBatches` e svuotati i vecchi `transformer`. Le rotte di import sono ora wrapper per la logica di staging. |
| **3.2**| **Pulizia Frontend** | ✅ Completato | Semplificata la pagina di `Import` originale. Il suo unico scopo è l'upload e il reindirizzamento alla pagina di Staging. |
| **3.3**| **Pulizia Database** | ✅ Completato | Eseguite query SQL per eliminare i dati "placeholder" o inconsistenti creati dalla vecchia logica. |
| **3.4**| **Revisione Finale** | ✅ Completato | Eseguita analisi finale e refactoring di tutti i workflow di importazione per allinearli all'architettura di staging. | 