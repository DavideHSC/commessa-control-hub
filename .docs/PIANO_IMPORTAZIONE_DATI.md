# Piano di Sviluppo - Importazione Dati da Gestionale Esterno

Questo documento delinea le fasi e i task necessari per implementare la funzionalità di importazione dei dati contabili forniti dal cliente in formato a larghezza fissa.

---

### ✅ Fase 1: Adeguamento del Database

**Obiettivo:** Modificare lo schema del database (`schema.prisma`) per renderlo compatibile con la struttura dei dati da importare, aggiungendo i modelli e i campi mancanti.

**Stato:** ✅ **Completata**

- [x] **Task 1.1:** Aggiunto il modello `CodiceIva` per l'anagrafica dei codici IVA.
- [x] **Task 1.2:** Aggiunto il modello `CondizionePagamento` per le condizioni di pagamento.
- [x] **Task 1.3:** Aggiunto il modello `RigaIva` per i dettagli IVA delle scritture e collegarlo a `RigaScrittura`.
- [x] **Task 1.4:** Aggiornato il modello `ScritturaContabile` aggiungendo i campi `dataDocumento` e `numeroDocumento`.
- [x] **Task 1.5:** Aggiornato i modelli `Cliente` e `Fornitore` aggiungendo il campo `codiceFiscale`.
- [x] **Task 1.6:** Aggiunti i modelli `ImportTemplate` e `FieldDefinition` per supportare un'importazione dinamica basata su template.
- [x] **Task 1.7:** Eseguita la migrazione del database con `prisma migrate dev` per applicare le modifiche.

---

### ✅ Fase 2: Sviluppo del Parser a Larghezza Fissa

**Obiettivo:** Creare un modulo TypeScript generico e riutilizzabile per effettuare il parsing dei file a larghezza fissa basandosi su una mappa di definizione dei campi.

**Stato:** ✅ **Completata**

- [x] **Task 2.1:** Implementata la logica di parsing direttamente all'interno della rotta API `server/routes/import.ts`, in quanto funzionalità puramente backend.
- [x] **Task 2.2:** Definita l'interfaccia interna `FieldDefinition` per la mappa dei campi.
- [x] **Task 2.3:** Implementata la funzione principale `parseFixedWidth<T>` che processa il contenuto del file.
- [x] **Task 2.4:** Aggiunta la gestione per il trimming e la conversione di tipi (string, number, date).

---

### ✅ Fase 3: Importazione Dinamica delle Anagrafiche

**Obiettivo:** Creare un servizio API dinamico per importare i dati anagrafici basandosi su template definiti nel database.

**Stato:** ✅ **Completata**

- [x] **Task 3.1:** Creato un endpoint API generico `/api/import/:templateName` che gestisce l'upload del file.
- [x] **Task 3.2:** Implementata la logica lato server per:
    - Recuperare dal DB il `ImportTemplate` corrispondente al nome del template.
    - Usare il `fixed-width-parser` con le definizioni del template.
    - Salvare i dati nella tabella corretta in base al template.
- [x] **Task 3.3:** Implementata la logica di importazione per i template: `causali`, `codici_iva`, `condizioni_pagamento`, `clienti_fornitori`.
- [x] **Task 3.4:** Aggiornata la pagina `Import.tsx` nella UI per permettere all'utente di selezionare un template e caricare il file corrispondente.

---

### ✅ Fase 4: Importazione delle Scritture Contabili

**Obiettivo:** Sviluppare il processo di importazione orchestrato per le scritture contabili, che correla i dati provenienti da molteplici file.

**Stato:** ✅ **Completata**

- [x] **Task 4.1:** Creato un nuovo template di importazione (`scritture_contabili`) con un campo `fileIdentifier` per distinguere le definizioni dei vari file (`PNTESTA.TXT`, `PNRIGCON.TXT`, etc.) nello script di seed.
- [x] **Task 4.2:** Esteso l'endpoint API `/api/import` per gestire upload di file multipli tramite `multer.array()`.
- [x] **Task 4.3:** Sviluppata la logica lato server che processa i file nell'ordine corretto, mappando le relazioni tra testate, righe contabili, righe IVA e allocazioni analitiche.
- [x] **Task 4.4:** Assicurato che l'intero processo di salvataggio sia avvolto in una transazione `prisma.$transaction` per garantire la consistenza dei dati.
- [x] **Task 4.5:** Eseguito un refactoring completo della pagina `Import.tsx`, implementando la selezione dinamica del template e la gestione dell'upload di file multipli per il template delle scritture.

---

### Fase 5: Refactoring e Consolidamento Tecnico

**Obiettivo:** Semplificare la logica di importazione, migliorare la manutenibilità del codice e rendere il sistema più robusto e facile da testare, separando le responsabilità.

**Stato:** 📝 **Pianificato**

- [ ] **Task 5.1:** Estrarre la logica del parser a larghezza fissa (`parseFixedWidth`) in un file dedicato `server/lib/fixedWidthParser.ts` per promuovere la riusabilità.
- [ ] **Task 5.2:** Sostituire l'endpoint generico `/api/import/:templateName` con rotte specifiche e più chiare:
    - [ ] Creare una rotta `server/routes/importScritture.ts` con endpoint `POST /api/import/scritture` per il solo import delle scritture contabili.
    - [ ] Creare una rotta `server/routes/importAnagrafiche.ts` con endpoint `POST /api/import/anagrafica/:modelName` per le anagrafiche.
- [ ] **Task 5.3:** Eseguire il refactoring del file `server/index.ts` per utilizzare le nuove rotte dedicate.
- [ ] **Task 5.4:** Rimuovere il vecchio file `server/routes/import.ts` e l'endpoint obsoleto `/api/import/csv` una volta che la nuova struttura sarà verificata.
- [ ] **Task 5.5:** Aggiornare il frontend (`src/pages/Import.tsx`) per utilizzare i nuovi endpoint.
- [ ] **Task 5.6:** Validare l'intero flusso di importazione end-to-end con i dati del cliente.

---

### Fase 6: Stabilizzazione e Flusso Guidato di Importazione

**Obiettivo:** Risolvere le cause profonde degli errori di importazione, rendere il processo robusto a dati incompleti e guidare l'utente attraverso una sequenza logica per garantire l'integrità referenziale.

**Stato:** 📝 **Pianificato**

- [ ] **Task 6.1:** Eseguire un reset completo del database (`npx prisma migrate reset`) per garantire una partenza pulita e coerente.
- [ ] **Task 6.2:** Aggiungere un "Fornitore di Sistema" allo script `prisma/seed.ts` per usarlo come fallback, simile al "Cliente di Sistema".
- [ ] **Task 6.3:** Rendere la funzione `saveDataInTransaction` più robusta, aggiungendo un `upsert` per i Fornitori per prevenire errori di foreign key.
- [ ] **Task 6.4:** Ridisegnare l'interfaccia `src/pages/Import.tsx` trasformandola in un processo a passi (wizard) che obblighi l'utente a importare prima le anagrafiche e poi le scritture contabili.
- [ ] **Task 6.5:** Eseguire un test finale completo seguendo il nuovo flusso guidato. 