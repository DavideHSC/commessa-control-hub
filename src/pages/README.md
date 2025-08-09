# Pagine (Architettura Legacy) (`/pages`)

Questa directory contiene i componenti React che rappresentano le pagine principali dell'applicazione, basate sull'architettura **legacy**. Ogni file corrisponde a una rotta specifica e assembla vari componenti per costruire una vista completa per l'utente.

## Struttura della Cartella

-   **`/impostazioni/`**: Contiene le pagine relative alla configurazione dell'applicazione (es. gestione delle voci analitiche, regole di ripartizione).

---

## Pagine Principali

-   `Index.tsx`: La pagina di ingresso principale, che probabilmente reindirizza alla dashboard.
-   `Dashboard.tsx`: La dashboard principale dell'applicazione, che offre una vista d'insieme con KPI e grafici.
-   `Commesse.tsx`: Pagina per la visualizzazione e gestione dell'elenco delle commesse.
-   `CommessaDettaglio.tsx`: Vista di dettaglio per una singola commessa.
-   `Database.tsx`: Una pagina che funge da "hub" per visualizzare e gestire le anagrafiche di base (clienti, fornitori, conti, etc.) tramite una vista a tab.
-   `Import.tsx`: L'interfaccia utente per avviare i processi di importazione dei dati (legacy).
-   `Riconciliazione.tsx`: La pagina dedicata al processo di riconciliazione manuale delle scritture contabili.
-   `Staging.tsx`: Pagina per visualizzare e gestire i dati presenti nelle tabelle di staging prima della finalizzazione.
-   `AuditTrail.tsx`: Visualizza il log delle operazioni di riconciliazione.
-   `NotFound.tsx`: La pagina 404 mostrata quando una rotta non viene trovata.
-   `PrimaNota.tsx`: Pagina per la gestione delle scritture di prima nota.
-   `NuovaRegistrazionePrimaNota.tsx`: Form per l'inserimento di una nuova registrazione.

## Pagine di Impostazioni (`/impostazioni`)

-   `ConfigurazioneConti.tsx`: Interfaccia per configurare la rilevanza analitica dei conti.
-   `RegoleRipartizione.tsx`: Pagina per creare e gestire le regole di ripartizione automatica.
-   `VociAnalitiche.tsx`: Pagina per la gestione delle voci di costo/ricavo. 