# Orchestration Layer

Questo livello agisce come il "direttore d'orchestra" dell'Import Engine. La sua responsabilità è coordinare i tre layer sottostanti (Acquisition, Transformation, Persistence) per eseguire un intero processo di importazione, dall'inizio alla fine.

## Struttura della Cartella

-   **`/handlers/`**: Contiene gli handler per le rotte API (Express.js) che avviano i workflow.
-   **`/middleware/`**: Destinata a contenere middleware specifici per le rotte di importazione (es. gestione avanzata di file upload) (attualmente vuota).
-   **`/workflows/`**: Definisce i workflow completi, che rappresentano la sequenza di passi per ogni tipo di importazione.
-   `README.md`: Questo file.

---

### Sottocartelle

#### `/handlers/`

Questa cartella contiene gli handler HTTP che collegano le API REST ai workflow di importazione. Ogni handler è responsabile di:
1.  Ricevere la richiesta HTTP (spesso con file in `multipart/form-data`).
2.  Eseguire una validazione di base sulla richiesta (presenza del file, tipo, ecc.).
3.  Estrarre il contenuto del file.
4.  Invocare il workflow corrispondente.
5.  Formattare la risposta (successo o errore) da inviare al client.

-   `anagraficaHandler.ts`: Gestisce l'importazione delle anagrafiche.
-   `causaleContabileHandler.ts`: Gestisce l'importazione delle causali contabili.
-   `codiceIvaHandler.ts`: Gestisce l'importazione dei codici IVA.
-   `condizioniPagamentoHandler.ts`: Gestisce l'importazione delle condizioni di pagamento.
-   `pianoDeiContiHandler.ts`: Un handler "intelligente" che determina se il file è un piano dei conti standard o aziendale e avvia il workflow corretto.
-   `scrittureContabiliHandler.ts`: Un handler più complesso che gestisce l'upload multi-file per le scritture contabili (testate, righe, IVA, analitici).

#### `/workflows/`

Questa è la cartella logica più importante del layer. Ogni file definisce un workflow, ovvero una funzione che orchestra l'intero processo per un tipo specifico di importazione. Il pattern tipico di un workflow è:
1.  **Acquisition**: Invoca il parser per ottenere dati grezzi dal contenuto del file.
2.  **Validation**: Utilizza gli schemi Zod per validare e pulire i dati grezzi.
3.  **(Opzionale) Transformation**: Esegue logiche di business per trasformare i dati validati nel formato richiesto dal database.
4.  **Persistence**: Salva i dati trasformati nella tabella di staging o direttamente nella tabella di produzione, spesso all'interno di una transazione per garantire l'atomicità.

-   `importAnagraficheWorkflow.ts`: Orchestra l'import delle anagrafiche.
-   `importCausaliContabiliWorkflow.ts`: Orchestra l'import delle causali.
-   `importCodiceIvaWorkflow.ts`: Orchestra l'import dei codici IVA.
-   `importCondizioniPagamentoWorkflow.ts`: Orchestra l'import delle condizioni di pagamento.
-   `importPianoDeiContiWorkflow.ts`: Workflow per il piano dei conti standard.
-   `importPianoDeiContiAziendaleWorkflow.ts`: Workflow per il piano dei conti aziendale.
-   `importScrittureContabiliWorkflow.ts`: Il workflow più complesso, che coordina il parsing e la validazione di quattro file interconnessi per importare le scritture contabili. 