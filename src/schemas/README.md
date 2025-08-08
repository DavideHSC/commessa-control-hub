# Schemi di Validazione (`/schemas`)

Questa directory contiene gli schemi di validazione dei dati definiti utilizzando la libreria **Zod**. Questi schemi sono fondamentali per garantire la correttezza e l'integrità dei dati manipolati nel frontend, specialmente nei form.

## File Principali

-   `database.ts`: Questo file è il cuore della validazione dei dati. Contiene una collezione completa di schemi Zod che mappano le principali entità del database (es. `clienteSchema`, `contoSchema`, `commessaSchema`). Questi schemi vengono utilizzati in tutta l'applicazione per validare i dati provenienti dalle API e, soprattutto, per validare l'input degli utenti nei form di creazione e modifica.

-   `regolaRipartizioneSchema.ts`: Definisce uno schema specifico per la validazione dei dati del form di creazione e modifica delle regole di ripartizione. 