# Piano di Sviluppo - Commessa Control Hub

Questo documento delinea le fasi e i task necessari per trasformare il prototipo in una demo efficace, focalizzata sugli automatismi di contabilità per commessa.

---

### ✅ Fase 0: Setup e Pulizia del Progetto (Completata)
- [x] Installare le dipendenze del progetto `@/commessa-control-hub`.
- [x] Avviare correttamente il server di sviluppo.

---

### ✅ Fase 1: Modellazione dei Dati e Tipi Core (Completata)
- [x] **Task 1.1:** Creare un file `src/types/index.ts` che conterrà tutte le interfacce e i tipi di dato del nostro dominio.
- [x] **Task 1.2:** Definire le interfacce di base: `CentroDiCosto`, `PianoDeiConti`.
- [x] **Task 1.3:** Definire l'interfaccia `Commessa`, includendo la struttura per il `budget`.
- [x] **Task 1.4:** Definire l'interfaccia `CausaleContabile` con `datiPrimari` e `templateScrittura`.
- [x] **Task 1.5:** Definire le interfacce per la `ScritturaContabile`, le sue righe (`RigaScrittura`) e `Allocazione`.

---

### ✅ Fase 2: Dati Mock e Simulazione Backend (Completata)
- [x] **Task 2.1:** Creare un file `src/data/mock.ts` per ospitare i nostri dati di demo.
- [x] **Task 2.2:** Popolare `mock.ts` con dati realistici ispirati al file Excel del cliente.
- [x] **Task 2.3:** Creare un semplice layer API `src/api/index.ts` che simuli le chiamate asincrone.
- [x] **Task 2.4:** "Oscurare" la UI: Rimuovere o disabilitare dalla `Sidebar` e dal router le pagine non necessarie.

---

### ✅ Fase 3: Implementazione della "Prima Nota Intelligente" (Completata)
- [x] **Task 3.1:** Trasformare la pagina `NuovaRegistrazionePrimaNota.tsx` nel cuore della demo.
- [x] **Task 3.2:** Sviluppare la UI per la selezione della causale e l'inserimento dei dati primari.
- [x] **Task 3.3:** Implementare l'automatismo "Genera Scrittura" basato sui template delle causali.
- [x] **Task 3.4:** Sviluppare la modale e la logica per l'allocazione analitica degli importi su commesse e centri di costo.
- [x] **Task 3.5:** Refactoring completo del componente per allinearlo alla nuova architettura dati.

---

### ✅ Fase 4: Chiusura del Flusso Dati (CREATE e READ) - ✅ COMPLETATA

**Obiettivo:** Implementare la logica per salvare le nuove scritture contabili e visualizzarle in una tabella, completando il ciclo "crea-leggi".

**Stato:** ✅ **Completata**

- ✅ **API di Persistenza:** Creato un servizio API fittizio in `src/api/registrazioni.ts` che simula il salvataggio dei dati in memoria (un array locale).
- ✅ **Salvataggio Dati:** Integrata la chiamata API nel componente `NuovaRegistrazionePrimaNota.tsx` per salvare la scrittura generata.
- ✅ **Notifiche Utente:** Aggiunto il componente `sonner` per fornire feedback visivo all'utente dopo il salvataggio (`"Registrazione salvata con successo!"`).
- ✅ **Visualizzazione Dati:** Trasformata la pagina `PrimaNota.tsx` da un segnaposto a una tabella funzionale (`<DataTable />`) che carica e visualizza l'elenco delle registrazioni salvate dal servizio API.
- ✅ **Bug Fixing:** Risolti tutti gli errori di tipo nel file `src/data/mock.ts` che erano emersi dopo il refactoring dei tipi, garantendo la coerenza del codice.

---

### ✅ Fase 4.5: Refactoring Concettuale e Miglioramento UX dell'Allocazione

**Obiettivo:** Risolvere un'incongruenza concettuale nella logica di allocazione, migliorare l'usabilità del componente e allinearlo pienamente alla visione strategica del progetto.

**Stato:** ✅ **Completata**

- ✅ **Correzione Concettuale:** Risolta l'incongruenza fondamentale che consentiva di allocare ricavi a centri di costo. Ora la logica è unificata e contabilisticamente corretta.
- ✅ **Refactoring a "Voce Analitica":** Sostituito il termine e il concetto di `CentroDiCosto` con `VoceAnalitica` in tutto il modello dati (`types.ts`), nei dati mock (`mock.ts`) e nell'interfaccia utente (`NuovaRegistrazionePrimaNota.tsx`), per una maggiore chiarezza e flessibilità.
- ✅ **Implementazione Automatismi Avanzati:** Attivata la logica, già prevista dal piano, per cui il sistema ora:
    - **Suggerisce automaticamente** la `VoceAnalitica` più pertinente all'apertura della modale di allocazione.
    - **Filtra l'elenco** delle voci analitiche per mostrare solo quelle rilevanti per il conto selezionato.
- ✅ **Miglioramenti UX:** Ottimizzato il flusso di inserimento per le allocazioni multiple. Aggiungendo una nuova riga, il sistema ora pre-compila la commessa, la voce analitica e l'importo a saldo, velocizzando drasticamente l'operatività.

---

### ✅ Fase 4.8: Completamento Ciclo CRUD (UPDATE e DELETE)

**Obiettivo:** Implementare le funzionalità mancanti per la gestione completa delle scritture contabili, consentendo la modifica e l'eliminazione delle registrazioni esistenti.

**Stato:** ✅ **Completata**

- ✅ **Funzionalità di Modifica (Update):**
    - Aggiunta l'icona "Modifica" e la relativa logica nella tabella della `PrimaNota.tsx`.
    - Riutilizzato e adattato il componente `NuovaRegistrazionePrimaNota.tsx` per funzionare anche in modalità di modifica, pre-caricando i dati della registrazione selezionata.
    - Implementate le funzioni API `getRegistrazioneById` e `updateRegistrazione` per recuperare e salvare i dati modificati.
    - Perfezionata la UX in modalità modifica, nascondendo elementi non pertinenti (es. "Generazione Automatica") e garantendo il corretto caricamento di tutti i dati.

- ✅ **Funzionalità di Eliminazione (Delete):**
    - Aggiunto il pulsante "Elimina" nella tabella della `PrimaNota.tsx`.
    - Implementata la funzione API `deleteRegistrazione`.
    - Integrato un `AlertDialog` di conferma per prevenire eliminazioni accidentali.

- ✅ **Bug Fixing e Validazione:**
    - Corretto un bug che permetteva il salvataggio di righe di registrazione incomplete.
    - Implementato un flusso di avviso per guidare l'utente a completare le allocazioni mancanti prima del salvataggio.
    - Risolto un bug critico che impediva il salvataggio corretto delle allocazioni modificate.

---

### ✅ Fase 5: La Dashboard di Controllo (VIEW)

**Obiettivo:** Trasformare la pagina `Dashboard.tsx` in un cruscotto di controllo di gestione che mostri i dati aggregati per ogni commessa, confrontando **Budget vs. Consuntivo**.

**Stato:** ✅ **Completata**

**Lavoro Svolto:**
- ✅ **Definizione Struttura Dati:** Create nuove interfacce (`DashboardData`, `CommessaDashboard`) in `src/types/index.ts` per modellare i dati aggregati.
- ✅ **Logica di Aggregazione Dati:** Implementata una nuova funzione `getDashboardData` in `src/api/dashboard.ts` che recupera commesse e registrazioni, calcola totali di budget, consuntivo e scostamenti per ogni commessa e per voce analitica.
- ✅ **Sviluppo Interfaccia Utente:** La pagina `Dashboard.tsx` è stata completamente riprogettata. Ora carica i dati in modo asincrono, mostra uno stato di caricamento (`skeleton`), e presenta i dati attraverso:
    - Un riepilogo con `Card` per i totali generali.
    - Un componente `Accordion` per visualizzare ogni commessa singolarmente.
    - Una `Table` di dettaglio per ogni commessa, che mostra il confronto Budget/Consuntivo/Scostamento per ogni voce analitica.
    - Una `Progress` bar per un colpo d'occhio immediato sull'avanzamento dei costi.

---

### ✅ Fase 6: Connessione al Database e Refactoring API

**Obiettivo:** Sostituire il sistema di dati mock in memoria con una vera connessione al database `postgres_dev_server` (PostgreSQL), rendendo i dati persistenti tramite l'ORM Prisma.

**Stato:** ✅ **Completata**

- ✅ **Installazione e Configurazione di Prisma:** Installate e configurate le dipendenze, inizializzato Prisma e definito lo schema dati in `schema.prisma`.
- ✅ **Migrazione e Connessione:** Eseguita la migrazione iniziale del database e configurata la connessione tramite il file `.env`.
- ✅ **Risoluzione Problemi di Seeding:** Affrontato e risolto un complesso problema di esecuzione dello script di seed (`npx prisma db seed`) causato da conflitti tra moduli ESM e CommonJS, configurazioni di `tsconfig`, e versioni dei pacchetti. La soluzione ha richiesto:
    - L'adozione di `tsx` per l'esecuzione dello script.
    - La correzione del path di output del client Prisma in `schema.prisma`.
    - Il pinning di versioni stabili per i pacchetti `prisma` e `@prisma/client`.
    - La modifica dello script per usare `upsert` e garantire l'idempotenza.
- ✅ **Refactoring del Layer API:** Sostituita la logica mock nei file `src/api/*.ts` con chiamate reali al database tramite il client di Prisma. Questo include tutte le operazioni CRUD per le registrazioni e la logica di aggregazione dati per la dashboard.

---

### ✅ Fase 8: Refactoring Architetturale (Creazione API Server)

**Obiettivo:** Centralizzare tutta la logica di accesso ai dati in un server API dedicato (Express.js) all'interno del progetto, disaccoppiando le responsabilità tra frontend e backend e preparando il terreno per una futura separazione.

**Stato:** ✅ **Completata**

- ✅ **Creazione Struttura Server:** Creata la cartella `server/` per ospitare tutta la logica backend, inclusa l'istanza di Express e le definizioni delle rotte.
- ✅ **Sviluppo API Endpoints:** Implementate tutte le rotte API necessarie per servire i dati al frontend, sostituendo completamente l'accesso diretto ai dati mock o a funzioni simulate. Le rotte create includono:
    - `/api/clienti` (CRUD completo)
    - `/api/fornitori` (CRUD completo)
    - `/api/dashboard`
    - `/api/registrazioni` (CRUD completo)
    - `/api/database` (per la visualizzazione delle tabelle)
    - `/api/causali`
- ✅ **Configurazione Proxy:** Modificato il file `vite.config.ts` per configurare un proxy che reindirizza tutte le chiamate da `/api` al server Express in esecuzione sulla porta `3001`, astraendo completamente l'URL del backend per il client.
- ✅ **Refactoring del Frontend:** Aggiornate tutte le chiamate nel layer API del frontend (`src/api/*.ts`) per utilizzare percorsi relativi (`/api/...`), eliminando gli ultimi residui di dati mock (es. `causaliContabili`) e facendo affidamento esclusivamente sul nuovo server backend.
- ✅ **Bug Fixing:** Risolto un errore critico 404 sulla pagina `/database` causato dalla mancanza di una rotta API dedicata, che è stata implementata e registrata correttamente.

---

### ✅ Fase 8.5: Implementazione Importazione Dati Esterni

**Obiettivo:** Implementare una funzionalità robusta per l'importazione di dati contabili da file di testo a larghezza fissa, come specificato nel `PIANO_IMPORTAZIONE_DATI.md`.

**Stato:** ✅ **Completata**

- ✅ **Estensione Schema DB:** Modificato lo schema Prisma per supportare importazioni multi-file, aggiungendo un `fileIdentifier` alle definizioni dei campi.
- ✅ **Logica di Parsing Avanzata:** Sviluppata una logica di backend per orchestrare il parsing di file multipli (`PNTESTA`, `PNRIGCON`, etc.), mappando correttamente le relazioni tra le varie entità.
- ✅ **Importazione Transazionale:** Garantita l'integrità dei dati utilizzando `prisma.$transaction` per l'intero processo di salvataggio.
- ✅ **Refactoring UI di Importazione:** Riscritto completamente il componente `Import.tsx` per supportare la selezione dinamica di template e il caricamento di file multipli, migliorando drasticamente l'usabilità della funzione.

---

### Fase 8.6: Aggiunta del Flusso di Anteprima per l'Importazione

**Obiettivo:** Aumentare la sicurezza e il controllo del processo di importazione introducendo un passaggio di anteprima e conferma prima del salvataggio definitivo dei dati.

**Stato:** 📝 **Pianificato**

- [ ] **Task 8.6.1:** Modificare l'endpoint API di importazione per supportare una modalità "dry run" (esecuzione a secco) che analizzi i file e restituisca un riepilogo senza salvare i dati.
- [ ] **Task 8.6.2:** Creare un nuovo endpoint API (o modificare l'esistente) per eseguire il "commit" dei dati pre-analizzati solo dopo la conferma dell'utente.
- [ ] **Task 8.6.3:** Aggiornare l'interfaccia utente di `Import.tsx` per mostrare una vista di anteprima con il riepilogo dei dati e richiedere una conferma esplicita prima di avviare il salvataggio definitivo.

---

### ✅ Fase 8.7: Potenziamento Amministrazione Database (CRUD Completo)

**Obiettivo:** Trasformare la pagina di amministrazione da una semplice visualizzazione a una vera interfaccia di gestione per le anagrafiche principali del sistema.

**Stato:** ✅ **Completata**

- ✅ **CRUD per Voci Analitiche:** Creazione delle rotte backend, del layer API frontend e del componente UI con tabella e modale di gestione.
- ✅ **CRUD per Piano dei Conti:** Implementazione della logica completa, inclusa la gestione di tipi di dato complessi (enum, booleani, relazioni) nel form di modifica/creazione.
- ✅ **CRUD per Commesse:** Sviluppo della gestione delle commesse, includendo la selezione del cliente e la visualizzazione del budget aggregato.
- ✅ **Debugging Robusto:** Risoluzione di una serie di errori complessi legati alla configurazione di TypeScript, all'avvio del server (`dotenv`) e all'allineamento dei tipi di dato tra frontend, backend e script di seed, garantendo la stabilità della nuova funzionalità.

---

### Fase 9: Separazione Fisica Progetti (Decoupling)

**Obiettivo:** Completare il processo di refactoring separando fisicamente il frontend (Vite/React) e il backend (Express/Prisma) in due progetti distinti con repository e pipeline di deployment individuali.

**Stato:** 📝 **Pianificato**

- [ ] **Task 9.1:** Creare un nuovo repository dedicato esclusivamente all'API backend (`commessa-control-hub-api`).
- [ ] **Task 9.2:** Spostare la cartella `server`, lo schema `prisma`, il file `.env` e le relative dipendenze nel nuovo progetto backend.
- [ ] **Task 9.3:** Configurare il server backend per gestire CORS in modo più granulare, accettando richieste solo dal dominio del frontend in produzione.
- [ ] **Task 9.4:** Rimuovere la cartella `server` e tutte le dipendenze di backend dal progetto frontend originale.
- [ ] **Task 9.5:** Aggiornare il layer API del frontend per effettuare chiamate a un URL assoluto definito tramite variabili d'ambiente (es. `process.env.VITE_API_URL`).
- [ ] **Task 9.6:** Definire due pipeline di deployment separate: una per il frontend (su un servizio di hosting statico come Vercel/Netlify) e una per il backend (su una piattaforma come Render/Heroku).

---

### Fase 10: Miglioramenti Futuri e Quality of Life

**Obiettivo:** Raccogliere idee e possibili miglioramenti non critici da implementare per migliorare l'usabilità e la manutenibilità dell'applicazione.

**Stato:** 📝 **Pianificato**

- [ ] **Task 10.1:** Rendere la lista delle tabelle nella pagina di **Amministrazione Database** dinamica, recuperando l'elenco direttamente dal backend per evitare aggiornamenti manuali del frontend quando lo schema del database cambia.
- [ ] **Task 10.2:** Creare un'interfaccia utente nella sezione di **Amministrazione Database** per visualizzare e gestire i template di importazione (`ImportTemplate`) e le loro definizioni di campo (`FieldDefinition`), eliminando la necessità di gestirli tramite lo script di seed. 