# Contesto Progetto Parser Causali Contabili

## Situazione Iniziale

Dopo aver risolto i problemi del parser delle scritture contabili, il database è stato resettato e ripopolato. Al tentativo di importare le causali contabili, il parser ha iniziato a fallire, scartando tutti i record.

## Problema da Risolvere

Il parser delle causali contabili, precedentemente funzionante, ha smesso di elaborare correttamente i file `Causali.txt` dopo le modifiche apportate ai componenti condivisi con il parser delle scritture contabili.

## Sommario del Processo di Debug e Correzione

Il processo di debug ha rivelato che le modifiche globali per migliorare la robustezza del sistema di parsing avevano introdotto una regressione nel parser delle causali, principalmente a causa di un disallineamento tra le aspettative del parser generico (`fixedWidthParser`) e la mappatura delle definizioni dei campi.

### Difficoltà Incontrate e Soluzioni

1.  **Errore `P2022`: Colonna `FieldDefinition.end` mancante nel database**
    *   **Problema:** Dopo le modifiche al modello `FieldDefinition` (aggiunta del campo `end`) e il reset del database, il seeder (`prisma/seed.ts`) non riusciva a creare i template perché il database non era sincronizzato con il nuovo schema.
    *   **Soluzione:** È stata eseguita una migrazione Prisma (`npx prisma migrate dev`) per aggiornare lo schema del database, aggiungendo la colonna `end` alla tabella `FieldDefinition`. Successivamente, il seeder è stato aggiornato per includere il campo `end` in tutte le definizioni dei campi durante la creazione dei template.

2.  **Errore `curl: (26) read error getting mime data`**
    *   **Problema:** Il comando `curl` standard su Windows ha mostrato problemi nella lettura del file locale quando tentava di inviarlo come `form-data`.
    *   **Soluzione:** È stato creato uno script Node.js (`server/upload_causali.js`) per gestire l'upload del file in modo più robusto, aggirando le limitazioni di `curl` in quell'ambiente specifico.

3.  **Campi Parsati come `unknown` e `validRecords: 0`**
    *   **Problema:** Dopo l'invio riuscito del file, il server ha indicato che 0 record erano validi. I log hanno rivelato che il `fixedWidthParser` stava restituendo oggetti con chiavi `unknown` invece dei nomi dei campi corretti (es. `codiceCausale`). Questo accadeva perché la mappatura delle `FieldDefinition` in `server/routes/importAnagrafiche.ts` assegnava il `fieldName` a una proprietà `name` invece di `fieldName` quando passava le definizioni a `parseFixedWidth`.
    *   **Soluzione:** La mappatura in `server/routes/importAnagrafiche.ts` è stata corretta per assicurare che il `fieldName` fosse passato correttamente alla funzione `parseFixedWidth`.

### Consigli per Evitare Problemi Futuri

*   **Coerenza dei Nomi dei Campi:** Mantenere una coerenza rigorosa nei nomi dei campi attraverso tutte le fasi del pipeline (definizioni, parsing, validazione, modelli di database). Evitare ridenominazioni implicite o mappature che non siano strettamente necessarie.
*   **Test di Integrazione per Componenti Condivisi:** Quando si modificano componenti o utility condivise (come `fixedWidthParser` o le trasformazioni Zod), è fondamentale eseguire test di regressione su tutti i moduli che dipendono da essi, non solo su quello che si sta attivamente sviluppando.
*   **Logging Dettagliato e Mirato:** Utilizzare `console.log` o un sistema di logging più sofisticato per ispezionare i dati in punti chiave del flusso di elaborazione. Questo aiuta a identificare esattamente dove i dati deviano dalle aspettative.
*   **Ambiente di Sviluppo Coerente:** Essere consapevoli delle specificità dell'ambiente di sviluppo (es. Windows, Node.js ES Modules) e adattare gli strumenti (es. `curl` vs script Node.js) di conseguenza per evitare problemi di tooling che mascherano i bug reali.
*   **Revisione del Codice:** Una revisione incrociata del codice, specialmente per le modifiche a componenti condivisi, può aiutare a individuare disallineamenti e regressioni prima che causino problemi in produzione.

## Specifiche Tecniche dei File da Parsare

Le specifiche tecniche dei file da parsare (PNTESTA.TXT, PNRIGCON.TXT, PNRIGIVA.TXT, MOVANAC.TXT) rimangono invariate e sono dettagliate nel documento `fix_scrritture_contabili_parser_04.md`.

Per le causali contabili, le definizioni dei campi sono state allineate con il file `Causali.txt` e sono gestite dinamicamente tramite i template di importazione nel database.