# API Routes (`/routes`)

Questa cartella è responsabile della definizione di tutti gli endpoint dell'API REST del server. Ogni file in questa directory corrisponde a un gruppo di rotte correlate a una specifica risorsa o funzionalità dell'applicazione.

## Struttura della Cartella

-   **`/v2/`**: [Vedi README](./v2/README.md) - Contiene gli endpoint per la nuova architettura dell'Import Engine (API v2), che segue un pattern più robusto e strutturato.

---

### Endpoints Principali (API v1 - Legacy e Attuali)

#### Gestione Anagrafiche e Dati di Base
-   `clienti.ts`: Gestisce le operazioni CRUD (Create, Read, Update, Delete) per i clienti.
-   `fornitori.ts`: Gestisce le operazioni CRUD per i fornitori.
-   `conti.ts`: Fornisce endpoint per la gestione del piano dei conti, incluso il toggle per la rilevanza analitica.
-   `causali.ts`: API per le causali contabili.
-   `codiciIva.ts`: API per i codici IVA.
-   `condizioniPagamento.ts`: API per le condizioni di pagamento.
-   `vociAnalitiche.ts`: Gestisce le operazioni CRUD per le voci di costo/ricavo analitiche.
-   `regoleRipartizione.ts`: API per creare e gestire le regole di ripartizione automatica dei costi.

#### Gestione Commesse e Performance
-   `commesse.ts`: Endpoint per le operazioni CRUD sulle commesse, gestendo anche la loro struttura gerarchica.
-   `commesseWithPerformance.ts`: Un endpoint specializzato che calcola e restituisce dati di performance aggregati per le commesse (costi, ricavi, margini).
-   `dashboard.ts`: Fornisce i dati aggregati necessari per popolare la dashboard principale, inclusi KPI e trend.

#### Importazione Dati (Legacy)
-   `importAnagrafiche.ts`: Gestisce l'upload e l'importazione di vari file anagrafici (clienti, fornitori, causali, ecc.) utilizzando la logica legacy.
-   `importConti.ts`: Endpoint "intelligente" che rileva il tipo di file del piano dei conti (standard o aziendale) e avvia il workflow di importazione corretto.
-   `importContiAziendale.ts`: (Potenzialmente obsoleto) Endpoint specifico per l'importazione del piano dei conti aziendale.
-   `importPrimaNota.ts`: (Legacy) Gestisce l'importazione multi-file delle scritture contabili (prima nota) e le salva nelle tabelle di staging.
-   `importScritture.ts`: (Legacy) Endpoint che orchestra l'importazione delle scritture contabili basandosi su template definiti nel database.
-   `importTemplates.ts`: API per la gestione dei template di importazione a larghezza fissa.

#### Funzionalità Avanzate e di Sistema
-   `registrazioni.ts`: Gestisce le operazioni CRUD per le scritture contabili, incluse le righe e le relative allocazioni.
-   `reconciliation.ts`: Endpoint per il processo di riconciliazione, che identifica i movimenti da allocare e gestisce la finalizzazione manuale.
-   `smartAllocation.ts`: API per il sistema di suggerimenti intelligenti, che analizza pattern storici per proporre allocazioni.
-   `auditTrail.ts`: Fornisce endpoint per tracciare e visualizzare un log di audit delle operazioni effettuate (attualmente con dati mock).
-   `staging.ts`: API per visualizzare i dati nelle tabelle di staging e per avviare il processo di finalizzazione che trasferisce i dati da staging a produzione.
-   `database.ts`: Fornisce endpoint di utilità per visualizzare lo stato generale del database ed eseguire operazioni come backup e pulizia di tabelle.
-   `stats.ts`: Endpoint che restituisce statistiche aggregate sul numero di record presenti nelle principali tabelle del database.
-   `system.ts`: Fornisce endpoint per monitorare lo stato del sistema, resettare il database ed eseguire operazioni di consolidamento dei dati.
-   `reset-finalization.ts`: Contiene endpoint di emergenza per resettare lo stato di processi di finalizzazione bloccati e per la pulizia selettiva delle tabelle. 