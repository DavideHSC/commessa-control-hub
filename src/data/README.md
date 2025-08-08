# Dati Statici e Mock (`/data`)

Questa directory contiene dati statici o di mock utilizzati principalmente per lo sviluppo, i test e il seeding iniziale dell'applicazione.

## File Principali

-   `mock.ts`: Questo file esporta una serie di array di oggetti che rappresentano dati di esempio per le principali entità dell'applicazione, come:
    -   `vociAnalitiche`: Un elenco di centri di costo/ricavo.
    -   `pianoDeiConti`: Un estratto del piano dei conti, arricchito con metadati per suggerire la voce analitica corretta.
    -   `commesse`: Un elenco di commesse di esempio, complete di budget suddiviso per voce analitica.
    -   `scrittureContabili`: Un esempio di registrazione contabile di prima nota.

Questi dati sono fondamentali per poter eseguire l'applicazione in un ambiente di sviluppo senza una connessione a un database reale o prima che i dati vengano importati. 