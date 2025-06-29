# Informazioni Progetto 

## Prospetto dei Parser Implementati

Di seguito è riportato un riepilogo dei parser implementati nell'applicazione per l'importazione dei dati legacy dal sistema Contabilità Evolution. Ogni parser è responsabile della lettura e trasformazione di uno o più file a larghezza fissa in un formato strutturato per il database.

### 1. Parser Anagrafiche (Clienti e Fornitori)

Questo parser gestisce l'importazione delle anagrafiche dei clienti e dei fornitori.

-   **File Sorgente**: `A_CLIFOR.TXT`
-   **Logica di Parsing**: `server/lib/importers/anagraficaCliForImporter.ts`
-   **Modelli Database Coinvolti**: `Cliente`, `Fornitore`
-   **Endpoint API**: L'importazione viene gestita tramite un endpoint generico che smista i dati a questo handler in base al template di importazione selezionato (es. `anagrafiche_cli_for`).
-   **Note**: Il parser distingue tra clienti, fornitori o entrambi (tipo conto 'E') e smista i dati nelle tabelle corrette. Contiene logica per mappare circa 40 campi, incluse decodifiche per dati fiscali specifici dei fornitori.
-   **File Correlati**:
    -   `server/lib/businessDecoders.ts`: Contiene le funzioni per decodificare i valori legacy (es. tipo soggetto, sesso, tipo ritenuta).
    -   `prisma/schema.prisma`: Definisce i modelli `Cliente` e `Fornitore` in cui i dati vengono salvati.
    -   `server/lib/fixedWidthParser.ts`: Utilizzato indirettamente, in quanto la rotta di importazione generica usa questa utility per fornire i dati pre-parsati a questo handler.

### 2. Parser Causali Contabili

Questo parser importa la tabella delle causali contabili utilizzate nelle registrazioni.

-   **File Sorgente**: `CAUSALI.TXT`
-   **Logica di Parsing**: `server/lib/importers/causaliImporter.ts`
-   **Modelli Database Coinvolti**: `CausaleContabile`
-   **Endpoint API**: L'importazione viene gestita tramite l'endpoint di importazione generico, che invoca `handleCausaliImport`.
-   **Note**: Oltre al parsing, arricchisce i dati con descrizioni leggibili utilizzando le funzioni di decodifica presenti in `server/lib/businessDecoders.ts`.
-   **File Correlati**:
    -   `server/lib/businessDecoders.ts`: Fornisce le funzioni per tradurre i codici legacy (es. tipo movimento, gestione partite) in descrizioni significative.
    -   `prisma/schema.prisma`: Definisce il modello `CausaleContabile` per lo storage dei dati.

### 3. Parser Codici IVA

Questo parser importa la tabella dei codici IVA con le relative aliquote e configurazioni.

-   **File Sorgente**: `CODICIVA.TXT`
-   **Logica di Parsing**: `server/lib/importers/codiciIvaImporter.ts`
-   **Modelli Database Coinvolti**: `CodiceIva`
-   **Endpoint API**: L'importazione è gestita dall'endpoint generico che, in base al template, invoca `handleCodiciIvaImport`.
-   **Note**: Si occupa della mappatura dei campi principali come codice, descrizione, aliquota e date di validità.
-   **File Correlati**:
    -   `server/lib/importUtils.ts`: Utilizzato per funzioni di utilità durante il processo di importazione.
    -   `server/lib/businessDecoders.ts`: Utilizzato per decodifiche di base.
    -   `prisma/schema.prisma`: Definisce il modello `CodiceIva` dove i dati vengono memorizzati.

### 4. Parser Condizioni di Pagamento

Questo parser importa le modalità di pagamento definite nel sistema legacy.

-   **File Sorgente**: `CODPAGAM.TXT`
-   **Logica di Parsing**: `server/lib/importers/condizioniPagamentoImporter.ts`
-   **Modelli Database Coinvolti**: `CondizionePagamento`
-   **Endpoint API**: Utilizza l'endpoint di importazione generico che richiama la funzione `processCondizioniPagamento`.
-   **Note**: Converte i flag di testo (es. 'X') in valori booleani per il database.
-   **File Correlati**:
    -   `server/lib/fixedWidthParser.ts`: Contiene le definizioni delle statistiche (`ImportStats`) usate dalla funzione.
    -   `prisma/schema.prisma`: Definisce il modello `CondizionePagamento` per il salvataggio.

### 5. Parser Piano dei Conti

Questo parser è responsabile dell'importazione dell'intero piano dei conti aziendale.

-   **File Sorgente**: `CONTIGEN.TXT`
-   **Logica di Parsing**: `server/lib/importers/pianoDeiContiImporter.ts`
-   **Modelli Database Coinvolti**: `Conto`
-   **Endpoint API**: Richiamato tramite l'endpoint di importazione generico che invoca `handlePianoDeiContiImport`.
-   **Note**: Contiene logica complessa per determinare la gerarchia (Mastro, Conto, Sottoconto) e il tipo di conto (Patrimoniale, Economico, ecc.), replicando le logiche del gestionale di provenienza.
-   **File Correlati**:
    -   `server/lib/businessDecoders.ts`: Essenziale per decodificare livelli, tipi, gruppi e altri codici del piano dei conti.
    -   `prisma/schema.prisma`: Definisce il modello `Conto` in cui viene salvata l'intera struttura.

### 6. Parser Unificato (Scritture di Prima Nota)

Questo è il parser più complesso, in quanto orchestra la lettura coordinata di più file per ricostruire le registrazioni contabili complete.

-   **File Sorgente**:
    -   `PNTESTA.TXT` (Testate delle registrazioni)
    -   `PNRIGCON.TXT` (Righe contabili)
    -   `PNRIGIVA.TXT` (Righe IVA, opzionale)
    -   `MOVANAC.TXT` (Movimenti analitici/centri di costo, opzionale)
-   **Logica di Parsing**:
    -   **Endpoint e Coordinamento**: `server/routes/importScritture.ts`
    -   **Funzione di Parsing Generica**: `server/lib/fixedWidthParser.ts`
    -   **Logica di Salvataggio**: `server/lib/importUtils.ts` (in particolare `processScrittureInBatches`)
-   **Modelli Database Coinvolti**: `Scrittura`, `RigaScrittura`, `RigaIvaScrittura`, `AllocazioneAnalitica`
-   **Endpoint API**: `POST /api/import-scritture`
-   **Note**: Il processo è dinamico e basato su un template di importazione (`scritture_contabili`) che definisce i tracciati per ogni file. L'endpoint accetta un upload multiplo, associa ogni file al suo tracciato, esegue il parsing e infine correla i dati in memoria (testate con le loro righe) prima di salvarli nel database in modo transazionale.
-   **File Correlati**:
    -   `server/lib/fixedWidthParser.ts`: Contiene la logica centrale `parseFixedWidth` per leggere i file a larghezza fissa in base ai template.
    -   `server/lib/importUtils.ts`: Ospita la funzione `processScrittureInBatches` che orchestra il salvataggio coordinato di testate e righe nel database.
    -   `prisma/schema.prisma`: Definisce i modelli `Scrittura`, `RigaScrittura`, `RigaIvaScrittura` e `AllocazioneAnalitica` che compongono la registrazione contabile.
    -   `prisma/seed.ts` (o il database): Contiene le definizioni dei campi (`FieldDefinition`) per ogni file, lette dal modello `ImportTemplate`, che costituiscono la guida per il parser.
    -   `multer`: Middleware Node.js utilizzato per gestire l'upload dei file (`multipart/form-data`).

### 7. Gestione Dinamica dei Template di Importazione

Oltre ai parser stessi, il sistema è dotato di una funzionalità completa per la gestione dei template di importazione tramite un'interfaccia utente dedicata.

-   **Funzionalità**: Permette agli amministratori di creare, visualizzare, modificare ed eliminare i template di importazione a larghezza fissa direttamente dalla UI. Ogni template è composto da un nome e da una serie di definizioni di campo (nome, inizio, lunghezza, tipo, identificatore file).
-   **Componenti Frontend**:
    -   `src/components/admin/ImportTemplatesAdmin.tsx`: Componente principale che mostra la tabella dei template, gestisce la paginazione, la ricerca e le azioni di alto livello.
    -   `src/components/admin/TemplateFormDialog.tsx`: Dialogo modale che contiene il form per la creazione e la modifica dei template e dei loro campi.
    -   `src/components/admin/import-templates-columns.tsx`: Definisce la struttura delle colonne e le azioni (Modifica, Elimina) per la tabella dei template.
-   **Endpoint API**: `server/routes/importTemplates.ts`
    -   `GET /api/import-templates`: Recupera la lista dei template con paginazione e ricerca.
    -   `POST /api/import-templates`: Crea un nuovo template.
    -   `PUT /api/import-templates/:id`: Aggiorna un template esistente.
    -   `DELETE /api/import-templates/:id`: Elimina un template.
-   **Modelli Database Coinvolti**:
    -   `ImportTemplate`: Modello padre che rappresenta un singolo template (es. `anagrafica_clifor`).
    -   `FieldDefinition`: Modello figlio che rappresenta un singolo campo all'interno di un template.
-   **File Correlati**:
    -   `src/api/importTemplates.ts`: Contiene le funzioni client (wrapper di `fetch`) per interagire con gli endpoint API dal frontend.
    -   `src/hooks/useAdvancedTable.ts`: Hook personalizzato che astrae la logica per la gestione di tabelle avanzate con paginazione, ricerca e ordinamento lato server.

---

### **Visione Architetturale Evoluta per una Piattaforma di Importazione Dati Enterprise-Grade**

L'architettura attuale, basata su template dinamici, offre una notevole flessibilità. Tuttavia, per elevare il sistema a un livello superiore di affidabilità e manutenibilità, è necessario evolvere verso un modello che sposi questa flessibilità con la robustezza della tipizzazione statica e una rigorosa separazione delle responsabilità.

Questa visione si fonda su quattro pilastri fondamentali:
1.  **Garanzia di Correttezza (Correctness by Design)**: Sfruttare il compilatore e gli strumenti statici per prevenire errori prima ancora che il codice venga eseguito.
2.  **Flussi di Dati Unidirezionali e Prevedibili**: Rendere ogni fase del processo di importazione chiara, isolata e facilmente testabile.
3.  **Integrità Transazionale Assoluta (Transactional Integrity)**: Assicurare che il database non possa mai trovarsi in uno stato inconsistente o corrotto.
4.  **Osservabilità Totale (Total Observability)**: Avere piena visibilità su ogni operazione, trasformando gli errori da problemi a informazioni utili.

Di seguito, dettaglio come applicare questi principi per trasformare la codebase.

#### **1. Livello di Acquisizione: Parsing Type-Safe e Validazione a Stadi**

L'obiettivo è trasformare i file di testo a larghezza fissa in strutture dati tipizzate e validate, pronte per essere elaborate.

**1.1. Da Template a Tipi: La Generazione Automatica di Codice**

L'idea di generare tipi dai template nel database è il cardine di questa visione. Formalizziamola:

*   **Azione Concreta**: Introdurre uno script nel `package.json` (es. `npm run generate:types`). Questo script, eseguito durante la build o manualmente, si occuperà di:
    1.  Connettersi al database usando Prisma Client.
    2.  Leggere tutti i modelli `ImportTemplate` e le relative `FieldDefinition`.
    3.  Generare dinamicamente un file TypeScript, ad esempio `server/lib/generated-import-types.ts`.
*   **Output Generato**: Questo file esporterà interfacce TypeScript che rappresentano la struttura "grezza" di ogni file di import. Ad esempio:
    ```typescript
    // server/lib/generated-import-types.ts (file generato, non modificare a mano)
    export interface RawAnagraficaClifor {
      TIPO_CONTO: string;
      CODICE_CONTO: string;
      RAGIONE_SOCIALE: string;
      // ...tutti gli altri campi come stringhe
    }

    export interface RawPnTesta {
      CODICE_UNIVOCO: string;
      DATA_REGISTRAZIONE: string;
      // ... e così via
    }
    ```
*   **Impatto sul Codice**: La funzione `fixedWidthParser` diventerà una funzione generica (`parseFixedWidth<T>(...)`). Il suo utilizzo garantirà che l'output sia immediatamente tipizzato, con pieno supporto dell'IDE e controllo a tempo di compilazione.

**1.2. Validazione e Coercizione con Schemi (Zod)**

I dati "grezzi" sono stringhe. Il passo successivo è validarli e convertirli nei tipi corretti (date, numeri, booleani).

*   **Azione Concreta**: Utilizzare una libreria di validazione come **Zod**. Per ogni interfaccia generata, definiremo uno schema Zod che descriva le regole di validazione e coercizione.
    ```typescript
    // In un file dedicato, es: server/lib/validators/anagraficaValidator.ts
    import { z } from 'zod';

    export const validatedAnagraficaSchema = z.object({
      TIPO_CONTO: z.string().length(1),
      CODICE_CONTO: z.coerce.number(),
      RAGIONE_SOCIALE: z.string().trim(),
      // ... validatori per ogni campo
    });

    export type ValidatedAnagrafica = z.infer<typeof validatedAnagraficaSchema>;
    ```
*   **Flusso**: Dopo il parsing, ogni riga viene processata dallo schema Zod. Se la validazione fallisce, la riga originale e il motivo dell'errore vengono deviati verso una *Dead Letter Queue*, senza interrompere l'importazione delle righe valide.

#### **2. Livello di Trasformazione: Logica di Business Pura e Isolata**

Questo è il cuore del sistema, dove i dati validati vengono trasformati in modelli pronti per il database.

*   **Azione Concreta**: Creare una directory `server/lib/transformers`. Ogni file qui sarà un "Transformation Service" dedicato a un singolo tipo di import.
    ```typescript
    // server/lib/transformers/anagraficaTransformer.ts
    import { businessDecoders } from '../businessDecoders';
    import type { ValidatedAnagrafica } from '../validators/anagraficaValidator';
    import type { Prisma } from '@prisma/client';

    export function transformAnagrafica(
      records: ValidatedAnagrafica[]
    ): { clienti: Prisma.ClienteCreateInput[], fornitori: Prisma.FornitoreCreateInput[] } {
      const clienti = [];
      const fornitori = [];

      for (const record of records) {
        // Qui risiede la logica di business:
        // 1. Chiamate a businessDecoders
        // 2. Logica condizionale (es. se TIPO_CONTO è 'C', 'F' o 'E')
        // 3. Creazione dei campi per Prisma
        const commonData = { /* ... */ };
        if (record.TIPO_CONTO === 'C' || record.TIPO_CONTO === 'E') {
          clienti.push({ ...commonData, /* ...dati specifici cliente */ });
        }
        if (record.TIPO_CONTO === 'F' || record.TIPO_CONTO === 'E') {
          fornitori.push({ ...commonData, /* ...dati specifici fornitore */ });
        }
      }
      return { clienti, fornitori };
    }
    ```
*   **Vantaggi**:
    *   **Testabilità Perfetta**: Queste funzioni sono pure. Ricevono dati in un formato, ne restituiscono un altro. Possono essere testate con unit test al 100% senza dipendenze esterne (no file, no DB).
    *   **Separazione Netta**: Il parsing si occupa dei byte, la validazione della forma, la trasformazione del significato.

#### **3. Livello di Persistenza: Transazioni Inattaccabili e Staging**

La scrittura su database deve essere un'operazione atomica: o tutto o niente.

**3.1. Transazioni Universali e Pattern "Staging-Commit"**

Per import complessi e multi-file, come le scritture contabili (`PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT`, `MOVANAC.TXT`), l'uso di tabelle di staging intermedie è la strategia più robusta.

*   **Flusso Operativo per le Scritture Contabili**:
    1.  **Inizio Transazione**: `prisma.$transaction(async (tx) => { ... });`
    2.  **Parsing & Validazione**: Processa tutti i file in memoria. Le righe errate vengono inviate alla Dead Letter Queue.
    3.  **Inserimento in Staging**: Inserisci i dati trasformati in tabelle temporanee (`StagingScrittura`, `StagingRigaScrittura`, etc.) usando l'istanza transazionale `tx`.
    4.  **Validazione di Integrità Relazionale**: Esegui query all'interno della transazione per verificare la coerenza dei dati *tra* le tabelle di staging. (Es: `SELECT * FROM StagingRigaScrittura WHERE testataId NOT IN (SELECT id FROM StagingScrittura)`). Se questa query restituisce risultati, lancia un errore per avviare il rollback.
    5.  **Commit Atomico**: Se la validazione passa, sposta i dati dalle tabelle di staging a quelle di produzione con query `INSERT INTO ... SELECT ...`.
    6.  **Pulizia**: Svuota le tabelle di staging.
*   **Beneficio**: Il database di produzione non è mai esposto a dati parziali. L'intera operazione, che può coinvolgere milioni di righe da file diversi, è una singola unità di lavoro atomica.

**3.2. Dead Letter Queue (DLQ) come Strumento Diagnostico**

La tabella `ImportErrors` deve evolvere da un semplice log a uno strumento interattivo.

*   **Schema Avanzato**: `ImportError` dovrebbe contenere:
    *   `importJobId`: Per raggruppare tutti gli errori di una singola esecuzione.
    *   `sourceFileName`: Il nome del file di origine.
    *   `rowNumber`: Il numero di riga.
    *   `rowData`: Il contenuto testuale originale della riga.
    *   `errorStage`: Lo stadio in cui è avvenuto l'errore (`parsing`, `validation`, `transformation`, `integrity_check`).
    *   `errorMessage`: Il messaggio di errore dettagliato.
*   **Interfaccia Utente**: Creare una sezione "Gestione Errori Import" nella UI per permettere a un amministratore di visualizzare, analizzare e, in futuro, potenzialmente correggere e ri-processare i record falliti.

#### **Conclusione**

Adottare questa architettura trasforma il processo di importazione da una serie di script a un **flusso di lavoro ingegnerizzato, resiliente e trasparente**. I vantaggi sono tangibili:

*   **Manutenibilità**: Ogni parte del sistema ha una sola responsabilità ed è facile da modificare e testare in isolamento.
*   **Affidabilità**: La combinazione di type-safety, validazione e transazioni garantisce la massima integrità dei dati.
*   **Trasparenza**: La DLQ e un logging strutturato (non trattato in dettaglio ma implicito) forniscono una visibilità completa su cosa funziona e cosa no.

Questa visione, pur richiedendo un investimento iniziale per il refactoring, pone le fondamenta per una codebase capace di evolvere e adattarsi a future complessità con un rischio operativo drasticamente ridotto.