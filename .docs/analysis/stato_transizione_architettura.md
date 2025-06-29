# Analisi Dettagliata dello Stato di Transizione Architetturale

**Data:** 29 Luglio 2024
**Autore:** Gemini AI Assistant

## 1. Riepilogo Esecutivo

Questa analisi è il risultato di una scansione ricorsiva dell'intera codebase, eseguita per determinare con precisione lo stato della transizione dall'architettura legacy alla nuova architettura "Enterprise" per l'importazione dei dati.

La conclusione principale è che **la transizione architetturale è quasi del tutto completata e tutti i parser, incluso quello delle Scritture Contabili, sono stati migrati con successo al nuovo `import-engine`**.

L'architettura legacy (`server/lib/importers`, `server/routes/import*.ts`) rimane presente nella codebase ma è di fatto **obsoleta**. Serve ora solo come potenziale riferimento o per retrocompatibilità temporanea, ma non è più attivamente utilizzata dai nuovi endpoint v2.

L'obiettivo primario è ora la **pulizia sicura** di tutti i componenti legacy per finalizzare la transizione e ridurre il debito tecnico.

---

## 2. Analisi Strutturale File per File

### `/server/` - Backend e Logica di Business

#### `/server/import-engine/` (Nuova Architettura)
Questa directory contiene interamente la nuova architettura. Tutti i file al suo interno sono da considerarsi **attivi, corretti e da mantenere**.

-   **File:** `import-engine/acquisition/**`
    -   **Scopo:** Livello di acquisizione dati (Parsing, Validazione, Generazione Tipi).
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere.

-   **File:** `import-engine/core/**`
    -   **Scopo:** Infrastruttura di base (Errori, Jobs, Tipi, Telemetria).
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere.

-   **File:** `import-engine/orchestration/**`
    -   **Scopo:** Coordinamento dei flussi di importazione (Handlers API, Workflows). Contiene la logica per tutti i 6 tipi di import, incluso `importScrittureContabiliWorkflow.ts`.
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere.

-   **File:** `import-engine/persistence/**`
    -   **Scopo:** Livello di persistenza (Dead Letter Queue, Transazioni).
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere.

-   **File:** `import-engine/transformation/**`
    -   **Scopo:** Livello di trasformazione (Business Logic pura, Decoders, Mappers).
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere.

#### `/server/lib/` (Architettura Legacy e Utility Condivise)
Questa directory contiene principalmente codice legacy che è stato sostituito dalla nuova architettura.

-   **File:** `lib/importers/**`
    -   **Scopo:** Contiene i vecchi parser monolitici per anagrafiche, causali, ecc.
    -   **Architettura:** **Legacy / Obsoleta**.
    -   **Azione:** **Rimuovere**. La logica è stata riscritta e migliorata in `import-engine/transformation/transformers`.

-   **File:** `lib/fixedWidthParser.ts`
    -   **Scopo:** Vecchio parser a larghezza fissa.
    -   **Architettura:** **Legacy / Obsoleta**. Il nuovo motore usa `import-engine/acquisition/parsers/typeSafeFixedWidthParser.ts`.
    -   **Azione:** **Rimuovere**.

-   **File:** `lib/importUtils.ts`
    -   **Scopo:** Conteneva la logica di batch processing per le scritture (`processScrittureInBatches`).
    -   **Architettura:** **Legacy / Obsoleta**.
    -   **Azione:** **Rimuovere**. La nuova logica è in `importScrittureContabiliWorkflow.ts`.

-   **File:** `lib/businessDecoders.ts`
    -   **Scopo:** Contiene le funzioni di decodifica per i valori legacy.
    -   **Architettura:** **Legacy / In fase di migrazione**. Parte della logica potrebbe essere ancora utilizzata, ma il target è averla tutta in `import-engine/transformation/decoders`.
    -   **Azione:** Verificare se qualche componente esterno lo utilizza ancora. Altrimenti, **Rimuovere** dopo aver garantito che tutta la logica sia stata migrata.

-   **File:** `lib/jobManager.ts`
    -   **Scopo:** Gestore di job basilare.
    -   **Architettura:** **Legacy / Obsoleta**. Il nuovo motore ha `import-engine/core/jobs/ImportJob.ts`.
    -   **Azione:** **Rimuovere**.

#### `/server/routes/` (Endpoint API)
Qui coesistono i vecchi e i nuovi endpoint.

-   **File:** `routes/v2/**`
    -   **Scopo:** Nuovi endpoint API versionati che utilizzano l' `import-engine`.
    -   **Architettura:** **Nuova Architettura**.
    -   **Azione:** Mantenere. Sono questi gli endpoint che l'applicazione dovrebbe usare.

-   **File:** `routes/importAnagrafiche.ts`
    -   **Scopo:** Endpoint legacy per import anagrafiche.
    -   **Architettura:** **Legacy / Obsoleta**.
    -   **Azione:** **Rimuovere**. Sostituito dagli handler in `routes/v2/`.

-   **File:** `routes/importPrimaNota.ts`, `routes/importScritture.ts`, `importScritture.ts.bak`
    -   **Scopo:** Endpoint legacy per l'importazione delle scritture contabili.
    -   **Architettura:** **Legacy / Obsoleta**.
    -   **Azione:** **Rimuovere**. Sostituito dal nuovo workflow e handler v2.

-   **File:** `routes/clienti.ts`, `routes/commesse.ts`, `routes/conti.ts`, etc.
    -   **Scopo:** Endpoint API standard dell'applicazione per le operazioni CRUD.
    -   **Architettura:** **Applicazione Standard**. Non fanno parte del sistema di importazione.
    -   **Azione:** Mantenere.

#### Altri file in `/server/`

-   **File:** `server/index.ts`
    -   **Scopo:** Entry point del server Express.
    -   **Architettura:** **Configurazione**.
    -   **Azione:** Mantenere, ma verificare che non ci siano più `import` a rotte legacy.

-   **File:** `server/debug_*.js`, `server/temp_test_script.js`
    -   **Scopo:** Script temporanei di debug.
    -   **Architettura:** **Utility / Da Pulire**.
    -   **Azione:** **Rimuovere**.

---

### `/src/` - Frontend (React)

La codebase del frontend è in gran parte disaccoppiata dalla logica di importazione del backend, eccetto per le chiamate API.

-   **File:** `src/**`
    -   **Scopo:** Interfaccia Utente dell'applicazione.
    -   **Architettura:** **Frontend**.
    -   **Azione:** Verificare che tutte le chiamate API relative all'importazione (es. da `src/pages/Import.tsx`) puntino ai nuovi endpoint `/api/v2/` e non più a quelli legacy. Non sono necessarie modifiche strutturali legate al refactoring del backend.

---

### `/prisma/` - Database

-   **File:** `prisma/schema.prisma`
    -   **Scopo:** Definizione dello schema del database.
    -   **Architettura:** **Configurazione / Condivisa**. Supporta sia la vecchia che la nuova architettura. Contiene già le tabelle di staging (`ImportScritturaTestata`, etc.) e i modelli `ImportTemplate` e `FieldDefinition` che sono il cuore del nuovo motore.
    -   **Azione:** Mantenere. Eventuali pulizie di campi usati solo dal legacy potranno essere fatte in un secondo momento.

-   **File:** `prisma/migrations/**`
    -   **Scopo:** Cronologia delle migrazioni del database.
    -   **Architettura:** **Configurazione**.
    -   **Azione:** Mantenere.

-   **File:** `prisma/seed.ts`
    -   **Scopo:** Script per popolare il database con dati iniziali, in particolare i `ImportTemplate` necessari alla nuova architettura.
    -   **Architettura:** **Configurazione / Tool**.
    -   **Azione:** Mantenere e aggiornare secondo le necessità.

-   **File:** `prisma/*.sql`
    -   **Scopo:** Script SQL manuali per operazioni di manutenzione.
    -   **Architettura:** **Utility / Tool**.
    -   **Azione:** Mantenere, ma verificare se sono ancora necessari dopo la piena adozione del nuovo sistema.

---

### `/` - Root del Progetto

-   **File:** `package.json`, `docker-compose.yml`, `tsconfig.json`, `eslint.config.js`, etc.
    -   **Scopo:** File di configurazione del progetto.
    -   **Architettura:** **Configurazione Progetto**.
    -   **Azione:** Mantenere. Verificare che non ci siano script in `package.json` che facciano riferimento a file legacy.

-   **File:** `struttura.js`, `struttura2.js`, `struttura_old.js`
    -   **Scopo:** Probabilmente script di analisi o utility.
    -   **Architettura:** **Utility / Da Pulire**.
    -   **Azione:** Analizzare il contenuto e, se non più utili, **Rimuovere**.

---

## 3. Piano di Azione Raccomandato

1.  **Backup/Branching**: Prima di procedere con la rimozione, creare un branch Git di backup (es. `legacy-archive`) per preservare il codice obsoleto in caso di necessità.

2.  **Rimozione Graduale delle Rotte Legacy**:
    -   Eliminare i file `server/routes/importAnagrafiche.ts` e `server/routes/importScritture.ts` e simili.
    -   Aggiornare `server/index.ts` per rimuovere i riferimenti a queste rotte.

3.  **Rimozione dei Vecchi Importer**:
    -   Eliminare l'intera cartella `server/lib/importers`.
    -   Eliminare i file `server/lib/fixedWidthParser.ts` e `server/lib/importUtils.ts`.

4.  **Consolidamento dei Decoders**:
    -   Analizzare `server/lib/businessDecoders.ts`.
    -   Spostare qualsiasi logica di decodifica ancora valida e non duplicata nella directory `server/import-engine/transformation/decoders/`.
    -   Una volta svuotato, eliminare `server/lib/businessDecoders.ts`.

5.  **Pulizia Finale**:
    -   Rimuovere tutti gli script di debug e di utility non più necessari (`debug_*`, `temp_*`, `struttura_*`).
    -   Eseguire test di regressione completi per assicurarsi che l'applicazione funzioni come previsto utilizzando esclusivamente la nuova architettura. 