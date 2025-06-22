# Fase 2 - Piano Analisi e Reportistica Avanzata

## 1. Analisi dello Stato Attuale della Codebase

Valutiamo le fondamenta su cui costruiremo le nuove funzionalità di analisi.

### a. Modello Dati (`prisma/schema.prisma`)
*   **Stato Attuale:** Il modello dati è **molto ben strutturato** per supportare analisi complesse. Le relazioni tra `Commessa`, `ScritturaContabile`, `RigaScrittura` e `Allocazione` sono solide e permettono di navigare dai costi/ricavi alle commesse di competenza.
*   **Valutazione:** L'infrastruttura dati è **pronta**. Non sono necessarie modifiche significative allo schema per questa fase.

### b. Interfaccia Utente (`src/pages/`)
*   **Stato Attuale:**
    *   **Dashboard (`Dashboard.tsx`):** Esiste una dashboard di alto livello che mostra KPI aggregati e una lista di commesse con la loro redditività totale.
    *   **Mancanza di Dettaglio:** Non esiste una pagina dedicata al dettaglio di una singola commessa. L'utente non può "cliccare" su una commessa dalla dashboard per vederne i dettagli.
    *   **Mancanza di Reportistica:** Non esiste una sezione "Report" dedicata.
    *   **Filtri Assenti:** La dashboard mostra tutti i dati, senza possibilità di filtrare per periodo, cliente, ecc.
*   **Valutazione:** Abbiamo un buon punto di partenza, ma la UI attuale è **insufficiente** per un'analisi approfondita. Le funzionalità di drill-down e filtro sono completamente assenti.

### c. Logica di Business e API (`server/`)
*   **Stato Attuale:** La rotta `server/routes/dashboard.ts` contiene la logica per aggregare i dati a livello di commessa. Le altre rotte (`conti.ts`, `clienti.ts`, etc.) forniscono accesso CRUD di base alle singole tabelle.
*   **Valutazione:** La logica API attuale è **troppo semplice**. Manca il supporto per parametri avanzati come filtri per data, paginazione e ricerca testuale, che sono prerequisiti fondamentali per costruire un'interfaccia di reportistica performante.

## 2. Identificazione delle Lacune Funzionali

1.  **Manca una pagina di Dettaglio Commessa** che funga da centro di controllo per un singolo progetto.
2.  **Mancano le API e i componenti UI per il drill-down**, ovvero la capacità di navigare da un dato aggregato (es. costo totale) alle transazioni che lo compongono.
3.  **Mancano le API e i componenti UI per filtri dinamici** (in particolare per periodo).

## 3. Piano d'Azione

### Task 2.1: Creare la Pagina di Dettaglio Commessa
- **Azione:** Sviluppare una nuova pagina e la relativa rotta dinamica.
- **Dettagli:**
    1.  Creare una nuova rotta in `App.tsx`: `/commesse/:commessaId`.
    2.  Creare un nuovo componente pagina `src/pages/CommessaDettaglio.tsx`.
    3.  Questa pagina dovrà caricare tutti i dati relativi a una singola commessa (dettagli, budget, scritture allocate).
    4.  Creare un nuovo endpoint API `GET /api/commesse/:id` che restituisca tutte queste informazioni in un'unica chiamata.
- **Verifica:** Navigando a `/commesse/ID_VALIDO` si visualizzano le informazioni specifiche di quella commessa.

### Task 2.2: Implementare la Tabella delle Scritture Allocate (Drill-Down)
- **Azione:** Sviluppare un componente tabella avanzato e integrarlo.
- **Dettagli:**
    1.  **Implementare il piano `ux_table_improvements_plan.md`:** Questo diventa un **sotto-task critico** di questa fase. È necessario aggiornare l'endpoint `GET /api/registrazioni` per supportare la paginazione, il filtro per `commessaId`, e la ricerca.
    2.  Creare un nuovo componente `ScrittureTable.tsx` che utilizzi il nuovo `AdvancedDataTable`.
    3.  Integrare questa tabella nella pagina `CommessaDettaglio.tsx` per mostrare l'elenco di tutte le righe di costo e ricavo associate a quella commessa.
- **Verifica:** Dalla pagina di dettaglio, l'utente può vedere, cercare e paginare tutte le transazioni che compongono i totali di costo/ricavo.

### Task 2.3: Potenziare la Dashboard Principale con Filtri
- **Azione:** Aggiungere controlli di filtro alla dashboard esistente.
- **Dettagli:**
    1.  Aggiungere alla UI di `Dashboard.tsx` due controlli: un **Date Range Picker** per selezionare l'intervallo di date e un **Combobox** per selezionare un cliente specifico.
    2.  Modificare l'endpoint `GET /api/dashboard` per accettare i parametri opzionali `startDate`, `endDate`, e `clienteId`.
    3.  Aggiornare la logica di calcolo nel backend per tenere conto di questi filtri quando si aggregano i dati.
- **Verifica:** Selezionando un periodo o un cliente sulla dashboard, i KPI e l'elenco delle commesse si aggiornano per riflettere solo i dati pertinenti. 