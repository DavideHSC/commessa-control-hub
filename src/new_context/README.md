# Contesti React (`/new_context`)

Questa directory, parte della nuova architettura, contiene i "Context" di React. I contesti sono utilizzati per la gestione dello stato globale o condiviso tra componenti distanti nell'albero dei componenti, evitando il "prop drilling".

## File Principali

-   `CommessaContext.tsx`: Questo file definisce un contesto specifico per la gestione temporanea delle modifiche alle commesse. In particolare, permette di:
    -   **Tracciare le modifiche**: Mantiene uno stato locale delle modifiche apportate a una o più commesse, senza ancora salvarle permanentemente nel backend.
    -   **Simulare l'aggiornamento**: Fornisce una funzione `getCommessa` che "unisce" i dati originali di una commessa con le modifiche temporanee, permettendo all'interfaccia di riflettere subito i cambiamenti.
    -   **Persistenza tra navigazioni**: Poiché lo stato è gestito in un contesto che "avvolge" l'applicazione, le modifiche non vengono perse navigando tra le pagine.
    -   Questo approccio è utile per simulare un'esperienza utente reattiva in attesa che le API di `UPDATE` siano pienamente implementate nel backend. 