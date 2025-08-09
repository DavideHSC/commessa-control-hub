# Piano di Refactoring Frontend: Architettura a Workflow

**Versione:** 1.0
**Data:** 2025-08-09
**Obiettivo:** Riscrivere il frontend per interagire correttamente con il backend enterprise (V2), gestendo workflow asincroni complessi in modo robusto, manutenibile e scalabile.

---

##  milestone 1: Fondamenta del Workflow V2 (Scritture Contabili)

### ✅ **Task 1.1: Creazione dell'Hook Logico (`useImportScritture.ts`)**
*   **Stato:** COMPLETATO
*   **Descrizione:** Creato un custom hook React per incapsulare tutta la logica di gestione del workflow di importazione delle scritture contabili, inclusi upload, polling dello stato tramite `jobId` e gestione degli errori.
*   **File Creato:** `src/new_hooks/useImportScritture.ts`.

### ✅ **Task 1.2: Creazione della UI "Cockpit" (`NewImport.tsx`)**
*   **Stato:** COMPLETATO
*   **Descrizione:** Sviluppata una pagina React che utilizza l'hook `useImportScritture`. La UI renderizza dinamicamente lo stato del workflow (`idle`, `polling`, `completed`, `failed`) e visualizza i log in tempo reale.
*   **File Creato/Modificato:** `src/new_pages/NewImport.tsx`.

### ✅ **Task 1.3: Integrazione e Trapianto UI**
*   **Stato:** COMPLETATO
*   **Descrizione:** Unita la UI ricca recuperata da una versione precedente con la logica robusta dell'hook `useImportScritture`, ottenendo un componente finale che è sia funzionale che esteticamente valido.
*   **File Modificato:** `src/new_pages/NewImport.tsx`.

### ✅ **Task 2.1: Arricchimento del Backend per il Report Finale**
*   **Stato:** COMPLETATO
*   **Descrizione:** Modificato l'handler del backend (`scrittureContabiliHandler.ts`) per includere un report statistico dettagliato nella risposta dell'endpoint `/job/:jobId` quando un'importazione è completata con successo.
*   **File Modificato:** `server/import-engine/orchestration/handlers/scrittureContabiliHandler.ts`.

### ✅ **Task 2.2: Integrazione del Report nel Frontend**
*   **Stato:** COMPLETATO
*   **Descrizione:** Aggiornato l'hook `useImportScritture` e la pagina `NewImport.tsx` per ricevere, salvare e visualizzare il report dettagliato post-importazione, utilizzando un componente `<Accordion>` per una presentazione chiara.
*   **File Modificati:** `src/new_hooks/useImportScritture.ts`, `src/new_pages/NewImport.tsx`.

---

## milestone 2: Estensione e Pulizia

### ✅ **Task 3.1: Creazione dell'Hook per il "Piano dei Conti"**
*   **Stato:** COMPLETATO
*   **Descrizione:** Creato l'hook `useImportPianoDeiConti.ts` per gestire il workflow di importazione più semplice del piano dei conti, senza polling e con gestione diretta della risposta.
*   **File Creato:** `src/new_hooks/useImportPianoDeiConti.ts`.

### ✅ **Task 3.2: Integrazione del Nuovo Workflow nella UI**
*   **Stato:** COMPLETATO
*   **Descrizione:** La pagina `NewImport.tsx` è stata rifattorizzata per utilizzare entrambi gli hook (`useImportScritture` e `useImportPianoDeiConti`). Utilizza una logica di "activeWorkflow" per selezionare lo stato corretto da visualizzare e adatta la UI (upload singolo/multiplo, report semplice/complesso) in base al tipo di importazione selezionato.
*   **File Modificato:** `src/new_pages/NewImport.tsx`.

### 🎯 **Task 3.3 (Revisione Sicura): Archiviazione del Codice Legacy**
*   **Stato:** **ATTIVO**
*   **Obiettivo:** Isolare e deprecare il codice V1 senza eliminarlo, per garantire la possibilità di confronto e rollback.
*   **Istruzioni Dettagliate:**

    1.  **Archiviazione Componenti Legacy (Frontend):**
        *   Crea una nuova cartella: `src/_legacy`.
        *   **Sposta (non eliminare)** la vecchia pagina di importazione in questa cartella: `src/pages/Import.tsx` → `src/_legacy/Import_page_v1.tsx`.
        *   **Sposta** l'hook non più utilizzato: `src/new_hooks/useApi.ts` → `src/_legacy/useApi_hook_v1.ts`.
        *   Nel file di routing principale (es. `App.tsx`), **commenta o rimuovi** la route che puntava alla vecchia pagina `Import.tsx`.

    2.  **Archiviazione Route Legacy (Backend):**
        *   Crea una nuova cartella: `server/routes/_legacy`.
        *   **Sposta (non eliminare)** i seguenti file di routing V1 in questa cartella:
            *   `server/routes/importAnagrafiche.ts` → `server/routes/_legacy/importAnagrafiche.ts`
            *   `server/routes/importConti.ts` → `server/routes/_legacy/importConti.ts`
            *   `server/routes/importContiAziendale.ts` → `server/routes/_legacy/importContiAziendale.ts`
            *   `server/routes/importPrimaNota.ts` → `server/routes/_legacy/importPrimaNota.ts`
            *   `server/routes/importScritture.ts` → `server/routes/_legacy/importScritture.ts`
            *   Elimina `importScritture.ts.bak` se esiste, è solo un backup.

    3.  **Disattivazione Route Legacy (Backend):**
        *   Nel file di avvio del server (es. `server/index.ts`), individua le righe `app.use('/api/import...', ...)` che fanno riferimento alle vecchie route.
        *   **Non eliminarle. Commentale** aggiungendo `// DEPRECATED V1 ROUTE - ` all'inizio della riga. Esempio:
            ```typescript
            // DEPRECATED V1 ROUTE - import { oldImportRouter } from './routes/importScritture';
            // DEPRECATED V1 ROUTE - app.use('/api/importScritture', oldImportRouter);
            ```

    4.  **Commit di Sicurezza:**
        *   **Obiettivo:** Creare un punto di salvataggio chiaro prima di procedere.
        *   **Azione:** Dopo aver completato i passaggi precedenti, esegui un `commit` con il seguente messaggio: `refactor: Archive and deprecate V1 import logic and routes`.

---

## milestone 3: Completamento Funzionalità di Import

### 🔲 **Task 4.1: Implementazione Workflow "Anagrafiche Clienti/Fornitori"**
*   **Stato:** Da Dettagliare
*   **Obiettivo:** Creare l'hook e integrare nella UI il workflow per l'importazione delle anagrafiche.

### 🔲 **Task 4.2: Implementazione Workflow "Causali", "IVA", "Pagamenti"**
*   **Stato:** Da Dettagliare
*   **Obiettivo:** Implementare i restanti workflow di importazione, che probabilmente seguiranno lo stesso pattern semplificato del Piano dei Conti.

---

## milestone 4: Revisione Finale e Documentazione

### 🔲 **Task 5.1: Test End-to-End Completo**
*   **Stato:** Da Dettagliare
*   **Obiettivo:** Eseguire test completi su tutti i workflow di importazione per garantire stabilità e coerenza.

### 🔲 **Task 5.2: Aggiornamento Documentazione Interna (`README.md`)**
*   **Stato:** Da Dettagliare
*   **Obiettivo:** Aggiornare tutti i `README.md` rilevanti per riflettere la nuova architettura del frontend e la pulizia del backend.