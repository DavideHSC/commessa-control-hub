# Piano 16: Finalizzazione Unificata e Refactoring UI di Staging

**Stato:** 📝 PIANIFICATO
**Obiettivo Finale:** Trasformare il processo di finalizzazione in un'operazione singola, orchestrata e trasparente. Riprogettare la pagina di staging per offrire una visione completa e chiara di tutti i dati importati, e risolvere i bug minori dell'interfaccia.

---

### **Fase 1: Backend - Evoluzione del Workflow di Finalizzazione**
**Obiettivo:** Far evolvere l'endpoint di finalizzazione esistente per gestire l'intero processo in modo sequenziale e sicuro, comunicando lo stato di avanzamento tramite Server-Sent Events (SSE).

| ID | Task | Descrizione |
| :-- | :--- | :--- |
| **BE-01**| **Rifattorizzare Endpoint Esistente** | Spostare la logica da `server/routes/reconciliation.ts` a `server/routes/staging.ts`. Rinominare l'endpoint `POST /api/reconciliation/finalize-conti` in `POST /api/staging/finalize` per riflettere la sua nuova responsabilità globale. |
| **BE-02**| **Implementare Pre-Check Dati** | All'inizio del nuovo endpoint `finalize`, implementare una logica di controllo che verifichi che **tutte** le tabelle di staging necessarie (`StagingConto`, `StagingTestata`, `StagingAnagrafica`, etc.) contengano dati. Se una tabella chiave è vuota, l'API deve restituire un errore specifico (es. "Errore: mancano le anagrafiche"), impedendo l'avvio del processo. |
| **BE-03**| **Creare Endpoint Eventi (SSE)** | Creare una nuova rotta `GET /api/staging/events` che stabilirà una connessione Server-Sent Events (SSE). Il frontend si connetterà a questo endpoint per ricevere aggiornamenti in tempo reale sullo stato del processo di finalizzazione. |
| **BE-04**| **Orchestrare la Finalizzazione Sequenziale con SSE** | Modificare l'endpoint `finalize` per eseguire la finalizzazione di ogni entità **una alla volta**. Dopo ogni passo, invierà un messaggio tramite il canale SSE. L'ordine corretto sarà: 1. Anagrafiche 2. Causali 3. Codici IVA 4. Condizioni Pagamento 5. Piano dei Conti 6. Scritture. Esempio di evento: `data: {"step": "conti", "status": "completed", "count": 3190}`. |
| **BE-05**| **Creare Logiche di Finalizzazione Mancanti** | Attualmente esiste solo la logica per finalizzare il Piano dei Conti. Questo task consiste nel **creare le funzioni di servizio mancanti** per le altre entità (Anagrafiche, Causali, etc.), seguendo il pattern consolidato: `delete from production where...` + `createMany from staging`. |

---

### **Fase 2: Frontend - Refactoring Pagina di Staging**
**Obiettivo:** Trasformare la pagina `/staging` in una dashboard chiara e funzionale, riutilizzando i componenti esistenti della pagina `/database` per garantire coerenza visiva e funzionale.

| ID | Task | Descrizione |
| :-- | :--- | :--- |
| **FE-01**| **Estrarre Layout a Tab Riutilizzabile** | Analizzare `src/pages/Database.tsx` ed estrarre la logica che gestisce il layout a tab verticali in un nuovo componente riutilizzabile, ad esempio `src/components/layout/TabbedViewLayout.tsx`. Questo componente accetterà come prop un array di oggetti "tab" (es. `[{ title: 'Nome Tab', component: <MioComponente /> }]`). |
| **FE-02**| **Adattare Pagina Esistente** | Rifattorizzare `src/pages/Database.tsx` per utilizzare il nuovo componente `TabbedViewLayout.tsx`, assicurandosi che il comportamento rimanga identico per evitare regressioni. |
| **FE-03**| **Implementare Nuova Pagina di Staging** | Modificare `src/pages/Staging.tsx` per utilizzare a sua volta il componente `TabbedViewLayout.tsx`. Verrà configurato per mostrare una tab per ogni tabella di staging (`Piano dei Conti`, `Scritture`, `Anagrafiche`, etc.). |
| **FE-04**| **Adattare Tabelle Dati Esistenti** | Adattare i componenti esistenti come `StagingContiTable.tsx` e `StagingScrittureTable.tsx` e crearne di nuovi per le altre entità di staging, da inserire come contenuto di ogni tab. |
| **FE-05**| **Implementare Pulsante e Status di Finalizzazione** | Aggiungere un singolo pulsante "Avvia Finalizzazione". Al click, invocherà l'API `POST /api/staging/finalize`. Aggiungere un componente `FinalizationStatus.tsx` che si collegherà all'endpoint SSE (`/api/staging/events`) per mostrare i messaggi di avanzamento in tempo reale ricevuti dal backend. |

---

### **Fase 3: Frontend - Correzione Bug della Sidebar**
**Obiettivo:** Risolvere il problema di highlighting errato nella sidebar per un'esperienza utente impeccabile.

| ID | Task | Descrizione |
| :-- | :--- | :--- |
| **BUG-01**| **Analizzare e Correggere Logica di Highlighting** | Ispezionare `src/components/Sidebar.tsx`. Il problema è quasi certamente una condizione di match del percorso troppo generica (es. `location.pathname.startsWith('/da')`). Modificare la logica di attivazione del link per usare un confronto più specifico del `pathname` che non possa creare ambiguità tra `/database` e `/dati-di-staging`. | 