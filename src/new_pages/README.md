# Nuove Pagine (`/new_pages`)

Questa directory contiene i componenti React che rappresentano le pagine principali della **nuova architettura** dell'applicazione. Ogni file corrisponde a una rotta specifica definita in `App.tsx` sotto il prefisso `/new`.

Queste pagine utilizzano i nuovi componenti (`/new_components`), i nuovi hooks (`/new_hooks`) e i nuovi contesti (`/new_context`) per offrire un'esperienza utente più moderna e una base di codice più manutenibile.

## Pagine Principali

-   `NewDashboard.tsx`: La nuova dashboard principale, che mostra KPI riassuntivi e una tabella delle commesse recenti.
-   `NewCommesse.tsx`: La pagina per la gestione dell'elenco delle commesse, con funzionalità di ricerca, filtro e la possibilità di creare e modificare commesse.
-   `NewCommessaDettaglio.tsx`: La pagina di dettaglio di una singola commessa, che mostra KPI specifici, grafici di andamento e l'elenco delle allocazioni.
-   `NewImport.tsx`: La nuova interfaccia per l'importazione dei file di dati, con una gestione migliorata del caricamento e del feedback all'utente.
-   `NewStaging.tsx`: Una pagina dedicata alla visualizzazione e gestione dei dati nelle tabelle di staging, prima della loro finalizzazione. Permette di monitorare il processo di importazione e di avviare la finalizzazione.
-   `NewDatabase.tsx`: Una pagina di amministrazione per visualizzare le statistiche e i dati delle tabelle di produzione.
-   `NewRiconciliazione.tsx`: La nuova interfaccia per il processo di riconciliazione e allocazione manuale dei movimenti contabili.
-   `NewSettings.tsx`: La nuova pagina delle impostazioni, dove è possibile configurare voci analitiche, regole di ripartizione e altre opzioni di sistema.
-   `index.ts`: Esporta tutte le pagine per un'importazione pulita nel file di routing `App.tsx`. 