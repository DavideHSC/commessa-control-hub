Iniziamo con l'analisi della cartella `prisma`.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/prisma**

**Scopo Principale della Cartella**: Questa cartella è il centro di controllo per tutto ciò che riguarda il database. Contiene la definizione dello schema del database, gli script per popolarlo con dati iniziali (seeding) e la configurazione TypeScript necessaria per eseguire questi script. È il punto di partenza per comprendere la struttura dei dati dell'intera applicazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/prisma/schema.prisma**

**Scopo Principale**: Questo file è la **fonte unica di verità** (Single Source of Truth) per la struttura del database. Definisce ogni tabella, campo, relazione, indice e tipo di dato che l'applicazione utilizzerà. Prisma utilizza questo schema per generare il client TypeScript type-safe (`@prisma/client`) e per creare e gestire le migrazioni del database.

**Analisi Dettagliata**:
Il file definisce un generatore (`client`) e una fonte dati (`datasource`), configurati per un database PostgreSQL. Successivamente, definisce i seguenti `model` ed `enum`, ognuno dei quali mappa una tabella o un tipo di dato nel database.

*   **`model Cliente`**:
    *   **Utilizzo**: Rappresenta l'anagrafica dei clienti dell'azienda. Ogni commessa è obbligatoriamente legata a un cliente.
    *   **Campi Chiave**: `id` (chiave primaria), `externalId` (identificativo univoco dal sistema esterno, cruciale per l'importazione), `nome`, `piva`.
    *   **Note**: Contiene numerosi campi `nullable` (es. `codiceFiscale`, `comune`) che vengono popolati durante l'importazione da file legacy. I campi con suffisso `Desc` (es. `tipoContoDesc`) sono destinati a contenere la decodifica leggibile dei codici legacy importati. La relazione `commesse` indica che un cliente può avere molte commesse.

*   **`model Fornitore`**:
    *   **Utilizzo**: Rappresenta l'anagrafica dei fornitori. Le scritture contabili di costo sono spesso associate a un fornitore.
    *   **Campi Chiave**: Simile a `Cliente`, con `id` e `externalId`. Contiene molti più campi specifici per la gestione fiscale e contributiva (es. `soggettoRitenuta`, `enasarco`, `percContributoCassaPrev`).
    *   **Note**: La struttura è molto simile a quella di `Cliente`, suggerendo che un'anagrafica potrebbe essere sia cliente che fornitore, anche se qui sono modellati come entità separate.

*   **`model VoceAnalitica`**:
    *   **Utilizzo**: Definisce le categorie per la contabilità analitica. È il cuore della classificazione dei costi e dei ricavi. Ogni movimento finanziario rilevante per una commessa viene mappato a una di queste voci (es. "Materiale di Consumo", "Manodopera Diretta", "Ricavi da Prestazioni").
    *   **Campi Chiave**: `id`, `nome` (univoco), `tipo` (stringa che indica 'Costo' o 'Ricavo').
    *   **Relazioni**: Ha una relazione molti-a-molti con `Conto`, una uno-a-molti con `Allocazione`, `BudgetVoce` e `RegolaRipartizione`.

*   **`model RegolaRipartizione`**:
    *   **Utilizzo**: Tabella strategica per automatizzare l'allocazione. Permette di definire regole fisse come: "Quando trovi un costo sul conto X, alloca il Y% di esso alla commessa Z sulla voce analitica W".
    *   **Campi Chiave**: `id`, `descrizione`, `percentuale`, `contoId`, `commessaId`, `voceAnaliticaId`. La combinazione `contoId`, `commessaId`, `voceAnaliticaId` è univoca per evitare regole duplicate.

*   **`model Conto`**:
    *   **Utilizzo**: Rappresenta il piano dei conti aziendale. Ogni riga di una scrittura contabile è associata a un conto.
    *   **Campi Chiave**: `id`, `codice`, `nome`, `tipo` (un `enum` `TipoConto`), `isRilevantePerCommesse` (flag booleano fondamentale per filtrare i conti da includere nel processo di riconciliazione).
    *   **Note**: La relazione molti-a-molti con `VoceAnalitica` permette di associare più categorie di costo/ricavo a un singolo conto. Il campo `codiceFiscaleAzienda` permette di avere personalizzazioni del piano dei conti per diverse aziende gestite dal sistema.

*   **`model Commessa`**:
    *   **Utilizzo**: L'entità centrale del sistema. Rappresenta un progetto, un contratto o un centro di costo/ricavo.
    *   **Campi Chiave**: `id`, `externalId`, `nome`, `clienteId` (collegamento a `Cliente`), `parentId` (relazione ricorsiva per creare gerarchie padre-figlio).
    *   **Note**: La relazione `CommessaHierarchy` su `parent` e `children` è ciò che permette di strutturare le commesse in modo gerarchico (es. Comune di Sorrento -> Servizio Igiene Urbana).

*   **`model BudgetVoce`**:
    *   **Utilizzo**: Definisce il budget per una specifica `VoceAnalitica` all'interno di una `Commessa`.
    *   **Campi Chiave**: `id`, `importo`, `commessaId`, `voceAnaliticaId`. La combinazione `commessaId` e `voceAnaliticaId` è univoca.

*   **`model ScritturaContabile`**:
    *   **Utilizzo**: Rappresenta la testata di una registrazione contabile (es. una fattura). Aggrega una o più righe di scrittura.
    *   **Campi Chiave**: `id`, `data`, `causaleId`, `fornitoreId`, `externalId`.
    *   **Note**: Il campo `datiAggiuntivi` di tipo `Json` è una scelta flessibile per memorizzare metadati che non hanno una colonna strutturata, come visto in `NuovaRegistrazionePrimaNota.tsx`.

*   **`model RigaScrittura`**:
    *   **Utilizzo**: Rappresenta una singola linea di una registrazione contabile (movimento Dare/Avere).
    *   **Campi Chiave**: `id`, `scritturaContabileId` (collegamento alla testata), `contoId` (collegamento al piano dei conti), `dare`, `avere`.

*   **`model Allocazione`**:
    *   **Utilizzo**: È la tabella più importante per il controllo di gestione. Lega una `RigaScrittura` (un costo o un ricavo) a una `Commessa` e a una `VoceAnalitica`. È il risultato finale del processo di riconciliazione.
    *   **Campi Chiave**: `id`, `importo`, `tipoMovimento`, `rigaScritturaId`, `commessaId`, `voceAnaliticaId`, `dataMovimento`.

*   **`model CodiceIva`**:
    *   **Utilizzo**: Definisce le anagrafiche dei codici IVA, con le relative aliquote, descrizioni e logiche fiscali.
    *   **Campi Chiave**: `id`, `externalId`, `codice`, `descrizione`, `aliquota`.
    *   **Note**: Contiene numerosi campi booleani e stringa per gestire casistiche fiscali complesse (es. `splitPayment`, `reverseCharge`, `plafondAcquisti`).

*   **`enum TipoMovimentoAnalitico`**:
    *   **Utilizzo**: Definisce i tipi di movimento possibili nella tabella `Allocazione`. Distingue tra costi/ricavi effettivi (da scritture), stimati e a budget.
    *   **Valori**: `COSTO_EFFETTIVO`, `RICAVO_EFFETTIVO`, `COSTO_STIMATO`, `RICAVO_STIMATO`, `COSTO_BUDGET`, `RICAVO_BUDGET`.

*   **`model CondizionePagamento`**:
    *   **Utilizzo**: Definisce le anagrafiche delle condizioni di pagamento (es. "Bonifico 30gg", "Ri.Ba. 60gg").
    *   **Campi Chiave**: `id`, `externalId`, `codice`, `descrizione`.

*   **`model RigaIva`**:
    *   **Utilizzo**: Dettaglia l'imponibile e l'imposta per uno specifico `CodiceIva` all'interno di una `RigaScrittura`.
    *   **Campi Chiave**: `id`, `imponibile`, `imposta`, `codiceIvaId`, `rigaScritturaId`.

*   **`model CausaleContabile`**:
    *   **Utilizzo**: Definisce le causali dei movimenti contabili (es. "Fattura Acquisto", "Pagamento Fornitore").
    *   **Campi Chiave**: `id`, `codice`, `descrizione`, `externalId`.
    *   **Note**: Similmente ad altre anagrafiche, contiene campi `Desc` per la decodifica di codici legacy.

*   **`model CampoDatiPrimari`**:
    *   **Utilizzo**: Parte del sistema di template per la generazione automatica di scritture. Definisce un campo di input (es. "Totale Fattura") necessario per un `VoceTemplateScrittura`.
    *   **Campi Chiave**: `id`, `nome`, `tipo` (enum `TipoCampo`), `voceTemplateId`.

*   **`model VoceTemplateScrittura`**:
    *   **Utilizzo**: Definisce una riga di un template di scrittura. Specifica se la riga va in Dare o Avere, quale `Conto` usare e come calcolare l'importo (`formulaImporto`).
    *   **Campi Chiave**: `id`, `sezione` (enum `SezioneScrittura`), `formulaImporto` (enum `FormulaImporto`), `templateId`.

*   **`model ImportTemplate`**:
    *   **Utilizzo**: Tabella principale per la configurazione delle importazioni. Ogni record rappresenta un tipo di importazione (es. "causali", "scritture_contabili").
    *   **Campi Chiave**: `id`, `name` (univoco), `modelName`.

*   **`model FieldDefinition`**:
    *   **Utilizzo**: Dettaglio di `ImportTemplate`. Ogni record definisce un campo da estrarre da un file a larghezza fissa, specificandone nome, posizione (`start`, `length`) e formato.
    *   **Campi Chiave**: `id`, `templateId`, `fieldName`, `start`, `length`.

*   **`model ImportLog`**:
    *   **Utilizzo**: Tabella per la registrazione dei log delle operazioni di importazione. Utile per il monitoraggio e il debugging.
    *   **Campi Chiave**: `id`, `timestamp`, `templateName`, `status`, `rowCount`.

*   **`model WizardState`**:
    *   **Utilizzo**: Probabilmente usata per guidare l'utente attraverso un processo di setup iniziale o un wizard di configurazione.
    *   **Campi Chiave**: `id`, `userId`, `step`, `completed`.

*   **`model StagingConto`**:
    *   **Utilizzo**: Tabella di staging per i dati del piano dei conti importati dai file `CONTIGEN.TXT` e `CONTIAZI.TXT`. I campi sono per lo più stringhe per accogliere i dati grezzi.
    *   **Campi Chiave**: `id`, `codice`, `codiceFiscaleAzienda`.

*   **`model StagingTestata`**:
    *   **Utilizzo**: Tabella di staging per le testate delle scritture contabili importate dal file `PNTESTA.TXT`.
    *   **Campi Chiave**: `id`, `codiceUnivocoScaricamento`.

*   **`model StagingRigaContabile`**:
    *   **Utilizzo**: Tabella di staging per le righe contabili importate dal file `PNRIGCON.TXT`.
    *   **Campi Chiave**: `id`, `codiceUnivocoScaricamento`, `progressivoRigo`.

*   **`model ImportAllocazione`**:
    *   **Utilizzo**: Tabella di staging per le allocazioni analitiche importate dal file `MOVANAC.TXT`.
    *   **Campi Chiave**: `id`, `importScritturaRigaContabileId`, `commessaId`.

*   **`model ImportScritturaRigaIva`**:
    *   **Utilizzo**: Tabella di staging per le righe IVA importate dal file `PNRIGIVA.TXT`.
    *   **Campi Chiave**: `id`, `codiceUnivocoScaricamento`, `riga`.

*   **`model StagingCodiceIva`**:
    *   **Utilizzo**: Tabella di staging per i codici IVA importati dal file `CODICIVA.TXT`.
    *   **Campi Chiave**: `id`, `codice`.

*   **`model StagingCausaleContabile`**:
    *   **Utilizzo**: Tabella di staging per le causali contabili importate dal file `CAUSALI.TXT`.
    *   **Campi Chiave**: `id`, `codiceCausale`.

*   **`model StagingCondizionePagamento`**:
    *   **Utilizzo**: Tabella di staging per le condizioni di pagamento importate dal file `CODPAGAM.TXT`.
    *   **Campi Chiave**: `id`, `codicePagamento`.

*   **`model StagingAnagrafica`**:
    *   **Utilizzo**: Tabella di staging per le anagrafiche clienti/fornitori importate dal file `A_CLIFOR.TXT`.
    *   **Campi Chiave**: `id`, `codiceUnivoco`.

*   **`enum TipoConto`**:
    *   **Utilizzo**: Definisce i tipi di conto possibili.
    *   **Valori**: `Costo`, `Ricavo`, `Patrimoniale`, `Fornitore`, `Cliente`, `Economico`, `Ordine`.

*   **`enum TipoCampo`**:
    *   **Utilizzo**: Definisce i tipi di campo per i form dinamici dei template.
    *   **Valori**: `number`, `select`, `text`, `date`.

*   **`enum SezioneScrittura`**:
    *   **Utilizzo**: Definisce la sezione di una riga di scrittura (Dare o Avere).
    *   **Valori**: `Dare`, `Avere`.

*   **`enum FormulaImporto`**:
    *   **Utilizzo**: Definisce come calcolare l'importo in un template di scrittura.
    *   **Valori**: `imponibile`, `iva`, `totale`.

*   **`enum FileType`**:
    *   **Utilizzo**: Definisce i tipi di file che possono essere importati.
    *   **Valori**: `CSV`, `XLSX`, `PDF`, `TXT`, `JSON`, `XML`.

**Interazioni e Connessioni**:
*   **Importato da**: Nessun file importa direttamente `schema.prisma`. È usato dal tool `prisma` per generare il client.
*   **Importa**: Definisce le fondamenta per `@prisma/client`, che è importato in quasi tutti i file del backend (`server/**/*.ts`) e nello script di seed (`prisma/seed.ts`).
*   **Tabelle Database**: Definisce **tutte** le tabelle del database PostgreSQL.

**Appunti per il Manuale**:
*   **(Utente)**: "Il cuore del sistema è organizzato attorno alle **Commesse**. Ogni spesa (costo) e ogni incasso (ricavo) viene tracciato e, attraverso un processo chiamato **allocazione**, viene collegato a una o più commesse. Questo permette di sapere esattamente quanto sta costando e quanto sta rendendo ogni singolo progetto."
*   **(Sviluppatore)**: Lo schema è la fonte di verità. Ogni modifica alla struttura dei dati deve partire da qui. Notare l'uso estensivo di `externalId` per mantenere la coerenza con i sistemi legacy durante l'importazione. La presenza di tabelle di `Staging` (es. `StagingConto`) e di `Produzione` (es. `Conto`) è un pattern architetturale chiave (Staging-Commit) per garantire l'integrità dei dati. La relazione ricorsiva in `Commessa` è fondamentale per la struttura gerarchica. Il flag `isRilevantePerCommesse` sul modello `Conto` è il perno del processo di riconciliazione. I modelli `ImportTemplate` e `FieldDefinition` rendono il sistema di parsing configurabile via DB.

---

### **File: G:/HSC/Reale/commessa-control-hub/prisma/seed.ts**

**Scopo Principale**: Popolare il database con un set di dati iniziale, essenziale per il corretto funzionamento dell'applicazione e per fornire un ambiente di demo/sviluppo preconfigurato.

**Analisi Dettagliata**:
Lo script esegue una serie di operazioni sequenziali per preparare il database.

1.  **Inizializzazione**: Importa il `PrismaClient` e definisce delle costanti per ID di sistema (`SYSTEM_CUSTOMER_ID`, `SYSTEM_SUPPLIER_ID`).
2.  **Pulizia Selettiva**: Esegue `prisma.commessa.deleteMany({})`. Questo è importante: ad ogni esecuzione del seed, le commesse esistenti vengono cancellate per essere ricreate da capo, garantendo uno stato pulito.
3.  **Creazione Entità di Sistema**: Utilizza `upsert` (aggiorna se esiste, altrimenti crea) per garantire la presenza di un cliente e un fornitore di sistema. Questi sono probabilmente usati come fallback durante le importazioni se un'anagrafica non viene trovata.
4.  **Creazione Dati Cliente Demo**: Crea (o aggiorna) l'anagrafica del cliente "PENISOLAVERDE SPA" e le sue commesse principali ("Comune di Sorrento", "Comune di Massa Lubrense", ecc.) e figlie ("Igiene Urbana - Sorrento"). Questo dimostra la struttura gerarchica delle commesse.
5.  **Creazione Voci Analitiche di Base**: Pulisce (`deleteMany`) e poi ricrea (`createMany`) un set standard di `VoceAnalitica`. Questo è fondamentale perché le allocazioni dei costi/ricavi dipendono da queste categorie. I valori includono 'Materiale di Consumo', 'Carburanti e Lubrificanti', 'Utenze', 'Lavorazioni Esterne', 'Spese Generali / di Struttura', 'Pulizie di Cantiere', 'Oneri e Spese Accessorie', 'Smaltimento Rifiuti Speciali', 'Manutenzione Mezzi', 'Consulenze Tecniche/Legali', 'Servizi Generici di Cantiere', 'Manodopera Diretta', 'Oneri su Manodopera', 'Ricavi da Prestazioni Contrattuali', 'Rettifiche Negative su Ricavi (NC)', 'Ricavi Accessori'.
6.  **Creazione Template di Importazione**: Questa è la sezione più critica dello script.
    *   **Logica "Delete-and-Create"**: Per ogni template (es. `causali`, `codici_iva`), lo script prima cerca e cancella un template esistente con lo stesso nome e le sue `fieldDefinitions` associate. Questo assicura che il seed aggiorni sempre le definizioni all'ultima versione presente nel codice, prevenendo inconsistenze.
    *   **Definizione Programmatica**: Le regole per leggere i file a larghezza fissa sono definite qui, in codice. Per ogni template, viene creato un record in `ImportTemplate` e tanti record in `FieldDefinition` quanti sono i campi da mappare.
    *   **Mapping Preciso**: Ogni `FieldDefinition` contiene `fieldName`, `start`, `length`, `end` e talvolta `format` (es. `date:DDMMYYYY`, `boolean`). Le posizioni sono basate sui tracciati record dei file legacy. Il commento "POSIZIONI CORRETTE Python → TypeScript" indica un'attenzione particolare alla conversione degli indici (spesso base 0 in Python e base 1 nei tracciati). Vengono definiti i template per: `causali`, `condizioni_pagamento`, `codici_iva`, `piano_dei_conti`, `piano_dei_conti_aziendale`, `scritture_contabili`, `anagrafica_clifor`.

**Interazioni e Connessioni**:
*   **Importa**: `@prisma/client` per interagire con il DB.
*   **Scrive su DB**: Interagisce con le tabelle `Commessa`, `Cliente`, `Fornitore`, `VoceAnalitica`, `ImportTemplate`, `FieldDefinition`.
*   **Esecuzione**: Viene eseguito dal comando `npx prisma db seed` o indirettamente da `npx prisma migrate reset`, come definito nello script `db:reset` del `package.json`.

**Appunti per il Manuale**:
*   **(Utente)**: "Al primo avvio o dopo un reset, l'applicazione viene pre-caricata con dati dimostrativi relativi al cliente 'PENISOLAVERDE SPA' e alle sue commesse. Questo ambiente può essere usato per familiarizzare con le funzionalità del sistema."
*   **(Sviluppatore)**: Questo script è la fonte di verità per la configurazione iniziale. Le definizioni per il parsing dei file a larghezza fissa sono codificate qui, non in un file di configurazione esterno. Qualsiasi modifica alla struttura dei file di importazione richiede un aggiornamento di questo script. La logica `delete-and-create` per i template garantisce che il seeding sia un'operazione idempotente e aggiorni sempre le definizioni all'ultima versione.

---

### **File: G:/HSC/Reale/commessa-control-hub/prisma/tsconfig.json**

**Scopo Principale**: È un file di configurazione TypeScript specifico per la cartella `prisma`. Dice al compilatore TypeScript come trattare i file `.ts` presenti in questa directory (in questo caso, principalmente `seed.ts`).

**Analisi Dettagliata**:
*   **`"module": "CommonJS"`**: Impostazione cruciale. Indica a TypeScript di compilare il file `seed.ts` in un modulo JavaScript di tipo CommonJS, che è il formato standard utilizzato da Node.js. Questo è necessario perché il comando `prisma db seed` esegue lo script di seed in un ambiente Node.js.
*   **`"target": "ES2020"`**: Specifica che il codice JavaScript generato deve essere compatibile con le funzionalità di ECMAScript 2020.
*   **`"strict": true`**: Abilita tutte le opzioni di controllo stretto dei tipi di TypeScript, promuovendo un codice più robusto e meno propenso a errori.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Strumenti come `tsx` o `ts-node` quando viene eseguito il comando `npx prisma db seed`.
*   **Contesto**: Fornisce le regole di compilazione per lo script `seed.ts`.

**Appunti per il Manuale**:
*   **(Utente)**: Questo file non è rilevante per l'utente finale.
*   **(Sviluppatore)**: File di configurazione standard di TypeScript per garantire che lo script di seed venga compilato in un formato (CommonJS) eseguibile dall'ambiente Node.js utilizzato da Prisma. È un dettaglio infrastrutturale.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server**

**Scopo Principale della Cartella**: Questa directory contiene tutto il codice del backend dell'applicazione. È un server Node.js costruito con il framework Express, responsabile della gestione delle API, della logica di business, dell'interazione con il database tramite Prisma e dell'elaborazione delle importazioni di dati.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/.eslintrc.json**

**Scopo Principale**: Questo file configura ESLint, uno strumento di "linting" che analizza il codice TypeScript del server per trovare e correggere problemi stilistici e potenziali errori di programmazione.

**Analisi Dettagliata**:
*   **`"extends": ["@typescript-eslint/recommended"]`**: Indica che la configurazione di base eredita le regole raccomandate dal plugin ESLint per TypeScript.
*   **`"parser": "@typescript-eslint/parser"`**: Specifica che ESLint deve usare il parser di TypeScript per analizzare il codice, permettendogli di comprendere la sintassi specifica di TypeScript.
*   **`"parserOptions"`**:
    *   `"project": "./tsconfig.json"`: Collega ESLint alla configurazione di TypeScript del progetto. Questo permette a ESLint di usare le informazioni sui tipi per regole più avanzate.
*   **`"rules"`**: Definisce le personalizzazioni delle regole:
    *   `"@typescript-eslint/no-explicit-any": "off"`: Disabilita la regola che vieta l'uso del tipo `any`. Questa scelta, sebbene a volte necessaria per flessibilità, riduce la sicurezza dei tipi.
    *   `"@typescript-eslint/explicit-function-return-type": "off"`: Disabilita l'obbligo di specificare esplicitamente il tipo di ritorno di ogni funzione.
    *   `"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]`: Segnala come errore le variabili non utilizzate, ma ignora quelle il cui nome inizia con un underscore (`_`), una convenzione comune per indicare parametri intenzionalmente non usati.
*   **`"env"`**: Specifica gli ambienti in cui il codice verrà eseguito (`node` e `es6`), permettendo a ESLint di riconoscere le variabili globali e le funzionalità specifiche di questi ambienti.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Lo strumento ESLint, tipicamente eseguito tramite lo script `npm run lint` definito in `package.json`.
*   **Contesto**: Applica le regole di qualità del codice a tutti i file TypeScript all'interno della cartella `server`.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo file definisce gli standard di codifica per il backend. È importante conoscerlo per scrivere codice coerente con il resto del progetto. La disabilitazione di `no-explicit-any` e `explicit-function-return-type` suggerisce una preferenza per una scrittura più rapida a discapito di una maggiore rigorosità dei tipi, un trade-off di cui essere consapevoli.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/debug_currency_validation.ts**

**Scopo Principale**: È uno script di test e validazione isolato, creato specificamente per diagnosticare e risolvere un problema nella conversione delle stringhe di valuta in numeri.

**Analisi Dettagliata**:
*   **Problema Indagato**: Lo script evidenzia un problema con i "decimali impliciti". I file di importazione legacy rappresentano valori come `123.45` con la stringa `"12345"`. La logica di parsing iniziale divideva sempre per 100, causando errori quando il decimale era esplicito (es. `"2500.75"` diventava `25.0075`).
*   **Logica di Test**:
    1.  **`currencyTransformCurrent`**: Definisce la funzione di trasformazione Zod problematica.
    2.  **`currencyTransformExplicit`**: Definisce la nuova funzione corretta, che gestisce correttamente sia i decimali impliciti che quelli espliciti.
    3.  **`testCases`**: Un array di casi di test che include stringhe vuote, interi, valori con virgola e, soprattutto, i casi reali che causavano il problema.
    4.  **`runValidationTest()`**: Esegue i test su entrambe le funzioni (vecchia e nuova), stampando un output chiaro che confronta il risultato ottenuto con quello atteso e segnalando gli errori.
    5.  **`testProblematicMovement()`**: Simula l'impatto del bug su una scrittura contabile reale, mostrando come la vecchia logica portava a uno sbilanciamento dei totali Dare/Avere, mentre la nuova li bilancia correttamente.

**Interazioni e Connessioni**:
*   **Importa**: `zod`.
*   **Utilizzato da**: Eseguito manualmente da uno sviluppatore per il debugging. Non è parte del flusso normale dell'applicazione.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo script è un eccellente esempio di come affrontare un bug complesso in modo isolato. Dimostra l'importanza di scrivere test unitari (anche se informali come in questo caso) per validare la logica di trasformazione dei dati. Rivela una sfida chiave affrontata durante lo sviluppo: la gestione di formati di dati legacy incoerenti.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/debug_movimento_specifico.ts**

**Scopo Principale**: È uno script di debugging per analizzare una specifica scrittura contabile (quella del 02/01/2025 con causale FRS) che presentava problemi di sbilanciamento.

**Analisi Dettagliata**:
*   **Logica di Debug**:
    1.  **Query Specifica**: Cerca nel database di produzione (`ScritturaContabile`) tutte le registrazioni che corrispondono ai criteri del problema (data e causale).
    2.  **Analisi Dettagliata**: Per ogni scrittura trovata, stampa tutti i dettagli della testata e delle righe, ricalcolando i totali Dare e Avere per verificare lo sbilanciamento.
    3.  **Confronto con Staging**: Esegue una query sulla tabella di staging (`ImportScritturaRigaContabile`) usando l'`externalId` della scrittura problematica. Questo permette di confrontare i dati finalizzati con quelli grezzi importati, per capire se l'errore è stato introdotto durante il processo di finalizzazione.
    4.  **Ricerca per Importo**: Esegue un'ulteriore query per trovare tutte le scritture che contengono un importo specifico (€38.52), un altro modo per isolare il movimento problematico.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`.
*   **Utilizzato da**: Eseguito manualmente da uno sviluppatore per il debugging.
*   **Interagisce con DB**: Legge dalle tabelle `ScritturaContabile`, `RigaScrittura`, `Conto`, `Causale`, `Fornitore` e `ImportScritturaRigaContabile`.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo script è un ottimo esempio di approccio diagnostico a un problema di integrità dei dati. La strategia di confrontare i dati di produzione con quelli di staging è fondamentale per individuare il punto esatto in cui un errore viene introdotto nel flusso di importazione/finalizzazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/debug_scritture.ts**

**Scopo Principale**: È uno script di debugging per testare il parsing dei file di prima nota (`PNTESTA`, `PNRIGCON`, ecc.) utilizzando le definizioni dei campi memorizzate nel database.

**Analisi Dettagliata**:
*   **Logica di Test**:
    1.  **Recupero Template**: Si connette al DB e recupera l' `ImportTemplate` con nome `scritture_contabili` e tutte le sue `fieldDefinitions` associate.
    2.  **Raggruppamento Definizioni**: Riorganizza le definizioni per `fileIdentifier` (es. 'PNTESTA.TXT', 'PNRIGCON.TXT'), creando una mappa di definizioni per ogni file.
    3.  **Dati di Test**: Utilizza delle stringhe di esempio (`sample...Line`) che simulano una riga di ogni file di prima nota.
    4.  **Parsing Individuale**: Per ogni file, se trova le definizioni corrispondenti, stampa le definizioni che sta per usare e poi esegue il parsing della riga di esempio con la funzione `parseFixedWidth`.
    5.  **Output Dettagliato**: Stampa il risultato del parsing campo per campo, permettendo allo sviluppatore di verificare visivamente se ogni campo è stato estratto correttamente in base alle definizioni del DB.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`, `parseFixedWidth`.
*   **Utilizzato da**: Eseguito manualmente da uno sviluppatore per testare la configurazione del parsing delle scritture.
*   **Interagisce con DB**: Legge dalle tabelle `ImportTemplate` e `FieldDefinition`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo script è essenziale per validare la correttezza delle configurazioni dei template di importazione nel database. Permette di testare le definizioni dei campi senza dover eseguire un intero ciclo di importazione, accelerando notevolmente il processo di configurazione e debugging dei parser.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/index.ts**

**Scopo Principale**: È il punto di ingresso (entry point) principale dell'applicazione backend. Avvia il server Express e monta tutte le rotte API.

**Analisi Dettagliata**:
*   **Inizializzazione**:
    *   `import 'dotenv/config'`: Carica le variabili d'ambiente dal file `.env` all'avvio.
    *   Crea un'istanza dell'app Express e del `PrismaClient`.
    *   Definisce la porta del server, leggendola da `process.env.PORT` o usando `3001` come fallback.
*   **Middleware**:
    *   `app.use(cors())`: Abilita il Cross-Origin Resource Sharing, permettendo al frontend (che gira su una porta diversa in sviluppo) di fare richieste al backend.
    *   `app.use(express.json())`: Abilita il parsing dei body delle richieste in formato JSON.
*   **Montaggio Rotte**:
    *   Utilizza `app.use('/api/...')` per montare ogni router specifico su un percorso base. Ad esempio, tutte le rotte definite in `clientiRoutes` saranno disponibili sotto `/api/clienti`.
    *   Monta sia le rotte "legacy" che le nuove rotte V2 (`/api/v2/import`).
*   **Rotta di Test**: Include una rotta di test (`/test-import-scritture`) che avvia manualmente il workflow di importazione delle scritture, utile per il debugging.
*   **Gestione Errori**: Include un middleware di gestione degli errori globale che cattura qualsiasi errore non gestito nelle rotte e restituisce una risposta di errore 500.
*   **Avvio e Chiusura**: Avvia il server con `app.listen()` e gestisce la chiusura pulita (`prisma.$disconnect()`) quando il processo riceve un segnale di interruzione (`SIGINT`).

**Interazioni e Connessioni**:
*   **Importa**: `express`, `cors`, `PrismaClient`, e tutti i file di rotta da `server/routes`.
*   **Contesto**: È il file eseguito da `npm run dev:server` o `npm run start:server` per avviare l'intero backend.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo è il file principale del backend. Per aggiungere un nuovo set di endpoint, è necessario creare un nuovo file di rotta, importarlo qui e registrarlo con `app.use()`. La rotta di test `/test-import-scritture` è un ottimo punto di partenza per il debugging dei workflow.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/temp_test_script.ts**

**Scopo Principale**: È uno script temporaneo, molto simile a `debug_scritture.ts`, creato per eseguire un test end-to-end del `ImportScrittureContabiliWorkflow`.

**Analisi Dettagliata**:
*   **Logica**: Lo script è quasi identico alla rotta di test in `index.ts`.
    1.  Inizializza i servizi necessari (`PrismaClient`, `DLQService`, `TelemetryService`).
    2.  Crea un'istanza del `ImportScrittureContabiliWorkflow`.
    3.  Legge il contenuto dei 4 file di prima nota dal filesystem.
    4.  Li raggruppa in un oggetto `files`.
    5.  Chiama il metodo `workflow.execute(files)`.
    6.  Stampa il risultato finale o l'errore sulla console.

**Interazioni e Connessioni**:
*   **Importa**: `ImportScrittureContabiliWorkflow` e i suoi servizi dipendenti.
*   **Utilizzato da**: Eseguito manualmente da uno sviluppatore.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è ridondante data la presenza della rotta di test in `index.ts` e degli altri script di debug. Probabilmente è stato creato per un test rapido e potrebbe essere rimosso per pulizia del codice.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/tsconfig.json**

**Scopo Principale**: File di configurazione del compilatore TypeScript per il progetto server.

**Analisi Dettagliata**:
*   **`"target": "ES2022"`**: Compila il codice in JavaScript compatibile con lo standard ECMAScript 2022.
*   **`"module": "ESNext"`**: Utilizza il sistema di moduli ECMAScript moderno (import/export).
*   **`"outDir": "./dist"`**: Specifica che i file JavaScript compilati verranno salvati nella cartella `dist`.
*   **`"rootDir": "."`**: Indica che la radice del codice sorgente è la cartella corrente (`server`).
*   **`"strict": true`**: Abilita tutte le opzioni di controllo stretto dei tipi.
*   **`"esModuleInterop": true`**: Permette una migliore interoperabilità tra moduli CommonJS e ES Modules.
*   **`"paths"`**: Definisce degli alias per i percorsi di importazione.
    *   `"@/*": ["../src/*"]`: Permette di importare file dal frontend (es. per i tipi condivisi) usando `@/`.
    *   `"@shared-types/*": ["../types/*"]`: Alias specifico per i tipi condivisi.
*   **`"ts-node": { "esm": true }`**: Configurazione specifica per `ts-node` per fargli gestire correttamente i moduli ES.
*   **`"include": ["**/*.ts"]`**: Dice al compilatore di includere tutti i file `.ts` nella cartella e nelle sue sottocartelle.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Il compilatore TypeScript (`tsc`) quando viene eseguito lo script `npm run build:server`, e da `tsx` durante lo sviluppo (`npm run dev:server`).
*   **Contesto**: Governa come l'intero backend viene compilato da TypeScript a JavaScript.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: File di configurazione standard ma cruciale. Gli alias nei `paths` sono importanti da conoscere per capire da dove provengono certi import. La configurazione del modulo come `ESNext` indica un approccio moderno alla gestione dei moduli in Node.js.

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/import-engine**

**Scopo Principale della Cartella**: Questa directory contiene il **motore di importazione** dei dati, un sistema modulare e robusto progettato per gestire l'acquisizione, la validazione, la trasformazione e la persistenza dei dati provenienti da file legacy a larghezza fissa. La sua architettura a layer (Acquisition, Transformation, Persistence, Orchestration) è una best practice che garantisce manutenibilità e testabilità.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/README.md**

**Scopo Principale**: Fornisce una panoramica di alto livello della filosofia e degli obiettivi dell'Import Engine.

**Analisi Dettagliata**:
Il README dichiara che questa directory contiene la "nuova architettura enterprise per l'importazione dei dati". Elenca i principi di progettazione che la guidano:
*   **Correctness by Design**: Progettazione che previene errori a monte.
*   **Flussi di dati unidirezionali**: I dati fluiscono in una sola direzione (Acquisition -> Transformation -> Persistence), rendendo il processo prevedibile.
*   **Integrità transazionale**: Le operazioni sul database sono atomiche.
*   **Osservabilità totale**: Il sistema fornisce log e metriche per monitorare ogni fase.

**Interazioni e Connessioni**:
*   Questo file è puramente documentale. Non ha interazioni dirette con il codice.

**Appunti per il Manuale**:
*   **(Utente)**: "Il sistema utilizza un motore avanzato per importare i dati, garantendo che siano corretti e coerenti prima di essere utilizzati per le analisi."
*   **(Sviluppatore)**: Questo README è la "dichiarazione d'intenti" dell'architettura. È il punto di partenza per comprendere la logica dietro la suddivisione in layer. Il flusso unidirezionale è un concetto chiave da tenere a mente quando si naviga il codice.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/import-engine/orchestration**

**Scopo Principale della Cartella**: Questa directory agisce come il "direttore d'orchestra" dell'Import Engine. La sua responsabilità è coordinare i tre layer sottostanti (Acquisition, Transformation, Persistence) per eseguire un intero processo di importazione. Contiene la logica di alto livello che definisce la sequenza di operazioni per ogni tipo di import.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/orchestration/README.md**

**Scopo Principale**: Descrive il ruolo e la struttura del layer di orchestrazione.

**Analisi Dettagliata**:
Il README chiarisce che questo layer è il "direttore d'orchestra" e che coordina i layer sottostanti. Specifica il contenuto delle sue sottocartelle:
*   **`workflows`**: Definisce i processi completi per ogni tipo di importazione.
*   **`handlers`**: Contiene gli handler per le rotte API che avviano i workflow.
*   **`middleware`**: Previsto per middleware specifici (anche se attualmente non ci sono file).

**Interazioni e Connessioni**:
*   File puramente documentale.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo README è la guida per capire la suddivisione delle responsabilità all'interno del layer di orchestrazione. Se si deve capire come una richiesta HTTP si traduce in un processo di importazione, questo è il punto di partenza.

---
---

### **Sottocartella: `handlers`**

**Scopo Principale della Sottocartella**: Contiene i gestori delle richieste HTTP (Express handlers). Ogni handler è responsabile di ricevere una richiesta API (tipicamente un upload di file), estrarre i dati necessari (il contenuto del file) e avviare il workflow di importazione corrispondente. Fa da ponte tra il mondo HTTP e la logica di business interna.

---

*   **File: `anagraficaHandler.ts`**
    *   **Scopo Principale**: Gestisce le richieste API per l'importazione delle anagrafiche (`A_CLIFOR.TXT`).
    *   **Analisi Dettagliata**:
        *   **`handleAnagraficaImport`**: Funzione principale che riceve `req` e `res`. Esegue la validazione dell'upload del file (presenza, estensione). Converte il buffer del file in una stringa e invoca `executeAnagraficheImportWorkflow`. Al termine, formatta la risposta HTTP (200 OK o 4xx/5xx in caso di errore) con un payload JSON strutturato che include statistiche e messaggi.
        *   **`handleAnagraficaTemplateInfo`**: Gestisce una rotta `GET` secondaria che fornisce metadati sul template di importazione, utile per il frontend o per scopi diagnostici.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama `executeAnagraficheImportWorkflow`.

*   **File: `causaleContabileHandler.ts`**
    *   **Scopo Principale**: Gestisce la richiesta API per l'importazione delle causali contabili (`CAUSALI.TXT`).
    *   **Analisi Dettagliata**: Simile al precedente, valida il file, estrae il contenuto e chiama `runImportCausaliContabiliWorkflow`. Gestisce la risposta HTTP in base all'esito del workflow.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama `runImportCausaliContabiliWorkflow`.

*   **File: `codiceIvaHandler.ts`**
    *   **Scopo Principale**: Gestisce la richiesta API per l'importazione dei codici IVA (`CODICIVA.TXT`).
    *   **Analisi Dettagliata**: Segue lo stesso pattern degli altri handler: validazione file, estrazione contenuto, chiamata a `runImportCodiciIvaWorkflow`, gestione risposta.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama `runImportCodiciIvaWorkflow`.

*   **File: `condizioniPagamentoHandler.ts`**
    *   **Scopo Principale**: Gestisce la richiesta API per l'importazione delle condizioni di pagamento (`CODPAGAM.TXT`).
    *   **Analisi Dettagliata**: Segue il pattern standard: validazione file, estrazione contenuto, chiamata a `runImportCondizioniPagamentoWorkflow`, gestione risposta.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama `runImportCondizioniPagamentoWorkflow`.

*   **File: `pianoDeiContiHandler.ts`**
    *   **Scopo Principale**: Gestisce la richiesta API per l'importazione del piano dei conti (sia `CONTIGEN.TXT` che `CONTIAZI.TXT`).
    *   **Analisi Dettagliata**: Questo handler è più "intelligente" degli altri.
        *   **`determineFileType`**: Contiene una funzione helper che ispeziona il nome del file caricato per determinare se si tratta di un piano dei conti "aziendale" o "standard".
        *   **Dispatching**: In base al tipo di file rilevato, invoca il workflow corretto: `importPianoDeiContiAziendaleWorkflow` o `importPianoDeiContiWorkflow`.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama uno dei due workflow per il piano dei conti.

*   **File: `scrittureContabiliHandler.ts`**
    *   **Scopo Principale**: Gestisce la richiesta API complessa per l'importazione delle scritture contabili, che coinvolge file multipli.
    *   **Analisi Dettagliata**:
        *   **Configurazione `multer`**: Definisce una configurazione `multer` specifica per questo handler, permettendo l'upload di fino a 4 file con una dimensione massima di 50MB.
        *   **`createRouter()`**: Utilizza un pattern factory per creare e restituire un router Express. Questo permette di definire più rotte correlate (es. per il POST dell'import, per il GET dello stato del job, per il GET degli errori).
        *   **`importScrittureContabili`**: L'handler per la richiesta `POST`. Riceve un array di file, li mappa ai nomi attesi (`pntesta`, `pnrigcon`, ecc.), valida la presenza dei file obbligatori e infine chiama `workflow.execute()` passando i buffer dei file.
        *   **`getJobStatus` e `getJobErrors`**: Handler per le rotte `GET` che permettono di interrogare lo stato e gli errori di un job di importazione specifico, utilizzando `TelemetryService` e `DLQService`.
    *   **Interazioni e Connessioni**: Utilizzato da `server/routes/v2/import.ts`. Chiama `importScrittureContabiliWorkflow`. Utilizza `DLQService` e `TelemetryService`.

**Appunti per il Manuale (Generali per gli Handlers)**:
*   **(Sviluppatore)**: Gli handlers in questa cartella rappresentano il confine tra il mondo esterno (HTTP) e la logica di business interna. La loro responsabilità è limitata a: 1. Validare la richiesta HTTP e i file. 2. Estrarre i dati necessari. 3. Invocare il workflow appropriato. 4. Formattare la risposta HTTP. Tutta la logica di elaborazione è delegata ai workflow.

---
---

### **Sottocartella: `workflows`**

**Scopo Principale della Sottocartella**: Contiene la logica di orchestrazione end-to-end per ogni tipo di importazione. Un workflow definisce la sequenza di passaggi: parsing, validazione, trasformazione (se presente) e persistenza.

---

*   **File: `importAnagraficheWorkflow.ts`**
    *   **Scopo Principale**: Orchestra l'importazione del file `A_CLIFOR.TXT` nella tabella di staging.
    *   **Analisi Dettagliata**:
        1.  **Parsing**: Chiama `parseFixedWidth` per convertire il contenuto del file in un array di oggetti `RawAnagrafica`.
        2.  **Validazione**: Itera sui record parsati e usa `rawAnagraficaSchema.safeParse` per validare ogni record. I record falliti vengono raccolti in un array di errori.
        3.  **Persistenza**: Prima esegue un `deleteMany` sulla tabella `StagingAnagrafica` per pulirla, poi esegue un `createMany` per inserire in blocco tutti i record validati.
        4.  **Risultato**: Restituisce un oggetto `AnagraficheImportResult` con statistiche dettagliate sull'operazione.

*   **File: `importCausaliContabiliWorkflow.ts`**: Segue lo stesso identico pattern di `importAnagraficheWorkflow.ts`, ma per le causali, utilizzando `causaleContabileValidator` e salvando in `StagingCausaleContabile`.

*   **File: `importCodiceIvaWorkflow.ts`**: Segue lo stesso pattern, ma per i codici IVA, utilizzando `rawCodiceIvaSchema` e salvando in `StagingCodiceIva`.

*   **File: `importCondizioniPagamentoWorkflow.ts`**: Segue lo stesso pattern, ma per le condizioni di pagamento, utilizzando `rawCondizionePagamentoSchema` e salvando in `StagingCondizionePagamento`.

*   **File: `importPianoDeiContiAziendaleWorkflow.ts`**: Workflow specifico per `CONTIAZI.TXT`. Utilizza `validatedPianoDeiContiAziendaleSchema` e, prima di salvare, esegue un `deleteMany` mirato solo ai record con lo stesso `codiceFiscaleAzienda`, per non interferire con altri piani dei conti aziendali.

*   **File: `importPianoDeiContiWorkflow.ts`**: Workflow per `CONTIGEN.TXT`. Utilizza `validatedPianoDeiContiSchema` e, prima di salvare, esegue un `deleteMany` sui record dove `codiceFiscaleAzienda` è vuoto (identificativo dei conti standard).

*   **File: `importScrittureContabiliWorkflow.ts`**:
    *   **Scopo Principale**: Orchestra l'importazione coordinata dei 4 file di prima nota.
    *   **Analisi Dettagliata**:
        1.  **Job Tracking**: Crea un `ImportJob` e usa `TelemetryService` per loggare ogni fase.
        2.  **Parsing Multi-File**: Chiama `parseFixedWidth` per ogni file (`PNTESTA`, `PNRIGCON`, ecc.), utilizzando le definizioni corrette. Ha una logica per rilevare automaticamente il formato (vecchio/nuovo) del file `PNRIGIVA.TXT` basandosi sulla lunghezza della prima riga.
        3.  **Validazione Multi-File**: Itera sui dati di ogni file e li valida usando gli schemi Zod corrispondenti, registrando gli errori nella DLQ tramite `dlqService`.
        4.  **Pulizia Staging**: Esegue una pulizia mirata delle tabelle di staging, eliminando solo i record che stanno per essere re-importati (basandosi sugli `externalIds` delle testate).
        5.  **Persistenza in Staging**: Esegue `createMany` per ogni tabella di staging (`StagingTestata`, `StagingRigaContabile`, ecc.) per salvare i dati validati.
        6.  **Risultato**: Restituisce un oggetto `ImportScrittureContabiliResult` con statistiche dettagliate.

**Appunti per il Manuale (Generali per i Workflows)**:
*   **(Sviluppatore)**: I workflow sono il cuore della logica di importazione. Sono progettati per essere atomici e resilienti. Il pattern comune è: **Parse -> Validate -> Persist to Staging**. Il workflow delle scritture è l'esempio più complesso e mostra come gestire dipendenze tra file e logica di pulizia selettiva. Ogni workflow è un'unità di lavoro isolata e testabile.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/import-engine/core**

**Scopo Principale della Cartella**: Contiene i componenti di base e le infrastrutture condivise che supportano tutti gli altri layer dell'Import Engine.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/core/README.md**

**Scopo Principale**: Descrive il contenuto e lo scopo della cartella `core`.

**Analisi Dettagliata**:
Il README specifica che questa directory contiene:
*   **types**: Tipi generati e interfacce condivise.
*   **errors**: Un sistema per errori strutturati (attualmente non implementato con file specifici, ma il concetto è presente).
*   **jobs**: Gestione e tracciamento dei processi di importazione.
*   **telemetry**: Logging strutturato e monitoraggio.

**Interazioni e Connessioni**:
*   File documentale.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questa cartella contiene le fondamenta dell'Import Engine. Quando si cerca una definizione di tipo condivisa o la logica di gestione dei job, questo è il posto giusto dove guardare.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/core/jobs/ImportJob.ts**

**Scopo Principale**: Definisce una classe `ImportJob` per rappresentare e gestire il ciclo di vita di un singolo processo di importazione.

**Analisi Dettagliata**:
*   **Classe `ImportJob`**:
    *   **Proprietà**:
        *   `id`: Un UUID univoco generato per ogni job.
        *   `type`: Una stringa che identifica il tipo di importazione (es. 'import_scritture_contabili').
        *   `createdAt`: Timestamp di creazione.
        *   `status`: Lo stato attuale del job (`pending`, `running`, `completed`, `failed`, `cancelled`).
        *   `metrics`: Un oggetto `ImportJobMetrics` per tracciare le performance (tempi di inizio/fine, durata, record processati/falliti).
        *   `error`: Contiene l'oggetto `Error` in caso di fallimento.
        *   `metadata`: Un oggetto per dati contestuali aggiuntivi.
    *   **Metodi**:
        *   `create(type, metadata)`: Metodo statico (factory) per creare una nuova istanza di `ImportJob`.
        *   `start()`: Imposta lo stato a `running` e registra l'ora di inizio.
        *   `complete(finalMetrics)`: Imposta lo stato a `completed`, calcola la durata e aggiorna le metriche finali.
        *   `fail(error)`: Imposta lo stato a `failed`, registra l'errore e calcola la durata.
        *   `cancel()`: Imposta lo stato a `cancelled`.
        *   `updateMetrics(metrics)`: Permette di aggiornare le metriche durante l'esecuzione del job.
        *   `getSummary()`: Restituisce un riassunto pulito dello stato e delle metriche del job.
        *   `isFinished()`, `isRunning()`, `getSuccessRate()`: Metodi di utilità per interrogare lo stato del job.

**Interazioni e Connessioni**:
*   **Importa**: `uuid` per generare ID univoci.
*   **Utilizzato da**: Viene istanziato all'inizio di ogni workflow (es. in `importScrittureContabiliWorkflow.ts`) per tracciare l'intera operazione. È strettamente legato al `TelemetryService`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La classe `ImportJob` è fondamentale per l'osservabilità. Ogni processo di importazione è incapsulato in un `ImportJob`, fornendo un ID univoco per il tracciamento dei log e delle metriche. Quando si crea un nuovo workflow di importazione, la prima operazione dovrebbe essere `ImportJob.create()`.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/core/telemetry/TelemetryService.ts**

**Scopo Principale**: Fornisce un servizio centralizzato per il logging strutturato e il monitoraggio dei job di importazione.

**Analisi Dettagliata**:
*   **Classe `TelemetryService`**:
    *   **Proprietà**: `events` (un array in memoria che funge da buffer per gli eventi di log).
    *   **Interfaccia `TelemetryEvent`**: Definisce la struttura di ogni evento di log, che include `timestamp`, `level` (`debug`, `info`, `warn`, `error`), `jobId`, `message` e `metadata` opzionali.
    *   **Metodi di Logging**: Fornisce metodi specifici per ogni fase del ciclo di vita di un job (`logJobStart`, `logJobSuccess`, `logJobError`) e per i livelli di log generici (`logInfo`, `logWarning`, `logError`, `logDebug`).
    *   **Metodo `log()` Privato**: È il cuore del servizio. Crea l'oggetto `TelemetryEvent`, lo aggiunge all'array `events` e lo stampa anche sulla console, formattandolo in modo leggibile.
    *   **Metodi di Recupero**: `getEventsForJob(jobId)` e `getEventsByLevel(level)` permettono di interrogare gli eventi registrati.
    *   **Metodo `cleanup(maxEvents)`**: Un semplice meccanismo di gestione della memoria per evitare che l'array `events` cresca indefinitamente.
    *   **Metodo `getStats()`**: Fornisce statistiche aggregate sul logging (conteggio totale, per livello, errori recenti).

**Interazioni e Connessioni**:
*   **Importa**: La classe `ImportJob` per tipizzare i parametri dei metodi.
*   **Utilizzato da**: Viene istanziato e passato a tutti i workflow (es. in `scrittureContabiliHandler.ts`). Ogni workflow lo utilizza per registrare le varie fasi del processo.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo servizio è il sistema nervoso dell'Import Engine. Ogni passaggio significativo in un workflow dovrebbe essere loggato tramite questo servizio, associandolo al `jobId` corretto. Questo permette di ricostruire l'intera esecuzione di un'importazione per il debugging. L'output sulla console è utile per lo sviluppo locale, mentre la struttura `TelemetryEvent` è pensata per essere inviata a sistemi di logging esterni (come Datadog, New Relic) in un ambiente di produzione.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/import-engine/core/types/generated.ts**

**Scopo Principale**: Contiene le interfacce TypeScript che rappresentano la struttura dei dati grezzi letti dai file a larghezza fissa. Questo file è **generato automaticamente**.

**Analisi Dettagliata**:
*   **Avviso di Generazione Automatica**: L'intestazione del file avverte chiaramente che non deve essere modificato a mano, ma rigenerato tramite lo script `npm run generate:import-types`.
*   **Convenzione di Nomenclatura**: Ogni interfaccia segue il pattern `Raw{NomeTemplate}`, ad esempio `RawPianoDeiConti`, `RawCausali`. Questo chiarisce che rappresentano i dati "grezzi", prima di qualsiasi trasformazione o validazione complessa.
*   **Struttura delle Interfacce**: Ogni interfaccia elenca i campi (`fieldName`) definiti nel `FieldDefinition` del template corrispondente nel database. Tutti i campi sono di tipo `string`, poiché il parser a larghezza fissa legge inizialmente tutto come testo.
*   **Interfacce Definite**:
    *   `RawPianoDeiContiAziendale`
    *   `RawCausali`
    *   `RawCondizioniPagamento`
    *   `RawCodiciIva`
    *   `RawPianoDeiConti`
    *   `RawScrittureContabili`
    *   `RawAnagraficaClifor`

**Interazioni e Connessioni**:
*   **Generato da**: `server/import-engine/acquisition/generators/TypeGenerator.ts`.
*   **Utilizzato da**:
    *   I parser (es. `typeSafeFixedWidthParser.ts`) per fornire un tipo di ritorno `T`.
    *   I validatori Zod (es. `anagraficaValidator.ts`) per definire lo schema di input (`rawAnagraficaSchema`).
    *   I workflow (es. `importAnagraficheWorkflow.ts`) per tipizzare i dati ricevuti dal parser.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è una conseguenza diretta della configurazione dei template nel database (`ImportTemplate` e `FieldDefinition`). Se si modifica un template (aggiungendo o rinominando un campo), è **obbligatorio** eseguire `npm run generate:import-types` per aggiornare queste interfacce e mantenere la coerenza dei tipi in tutto l'Import Engine. Non modificare mai questo file manualmente.

---

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/lib**

**Scopo Principale della Cartella**: Questa directory contiene librerie di utilità e la logica di importazione "legacy" (pre-Import Engine). Mentre il nuovo `import-engine` è progettato per essere il futuro, questa cartella contiene ancora codice funzionante e cruciale per molte delle attuali funzionalità di importazione e di business logic. È una cartella di transizione che ospita sia codice vecchio che nuovo.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importers/anagraficaCliForImporter.ts**

**Scopo Principale**: Contiene la logica di business per trasformare e salvare i dati grezzi delle anagrafiche clienti/fornitori nelle tabelle di produzione `Cliente` e `Fornitore`.

**Analisi Dettagliata**:
*   **`anagraficaCliForFields`**: Definisce lo schema a larghezza fissa per il file `A_CLIFOR.TXT`. Questa definizione è legacy e probabilmente verrà sostituita da quella nel database (`ImportTemplate`).
*   **Interfaccia `AnagraficaCliForRecord`**: Definisce la struttura del record dopo il parsing iniziale.
*   **Funzione `handleAnagraficaCliForImport`**:
    1.  **Trasformazione**: Itera sui record parsati. Per ogni record, applica una logica di trasformazione complessa.
    2.  **Decodifica**: Utilizza le funzioni da `businessDecoders` (es. `decodeTipoContoAnagrafica`) per convertire i codici legacy in valori leggibili e booleani (es. `eCliente: record.tipoConto === 'C'`).
    3.  **Smistamento**: In base al campo `tipoConto` ('C', 'F', o 'E' per entrambi), decide se creare un record nella tabella `Cliente`, `Fornitore` o in entrambe.
    4.  **Persistenza**: Utilizza `prisma.$transaction` per eseguire le operazioni di `upsert` in modo atomico. L'operazione di `upsert` (aggiorna o crea) garantisce che i record esistenti vengano aggiornati e i nuovi vengano creati, usando `externalId` come chiave.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`, `fixedWidthParser`, `businessDecoders`, `importUtils`.
*   **Utilizzato da**: Rotte di importazione legacy (probabilmente `importAnagrafiche.ts`, anche se ora il flusso passa per l'Import Engine). La logica qui è un precursore di quella che si trova in `importAnagraficheWorkflow.ts`.
*   **Scrive su DB**: Tabelle `Cliente` e `Fornitore`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file rappresenta la logica di importazione di "prima generazione". È un ottimo riferimento per capire la mappatura dettagliata tra i campi del file `A_CLIFOR.TXT` e i modelli `Cliente`/`Fornitore` di Prisma. La nuova architettura (`Import Engine`) mira a rendere questa logica più modulare e testabile, separando parsing, validazione e trasformazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importers/causaliImporter.ts**

**Scopo Principale**: Contiene la logica di business per trasformare e salvare i dati delle causali contabili.

**Analisi Dettagliata**:
*   **Funzione `transformRawCausale`**: Prende un record grezzo e lo trasforma in un oggetto strutturato pronto per il database. Applica tutte le funzioni di decodifica da `businessDecoders` per arricchire il dato (es. `decodeTipoMovimento`, `decodeGestionePartite`). Converte anche i flag stringa ('X') in booleani.
*   **Funzione `handleCausaliImport`**:
    1.  Itera sui dati parsati.
    2.  Chiama `transformRawCausale` per ogni record.
    3.  Usa `prisma.causaleContabile.upsert` per salvare i dati, usando `externalId` come chiave. Questo rende l'operazione di importazione idempotente (può essere eseguita più volte senza creare duplicati).
*   **Funzione `processCausali`**: Sembra una versione alternativa o precedente della logica di importazione, meno completa di `handleCausaliImport`.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`, `businessDecoders`, `importUtils`.
*   **Utilizzato da**: Rotte di importazione legacy.
*   **Scrive su DB**: Tabella `CausaleContabile`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Simile all'importer delle anagrafiche, questo file incapsula la logica di trasformazione specifica per le causali. È un esempio chiaro di come i dati grezzi vengono arricchiti con descrizioni leggibili e tipi di dato corretti prima del salvataggio.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importers/codiciIvaImporter.ts**

**Scopo Principale**: Contiene la logica di business per trasformare e salvare i dati dei codici IVA.

**Analisi Dettagliata**:
*   **Funzione `handleCodiciIvaImport`**:
    1.  Itera sui dati parsati.
    2.  Estrae l'`externalId` dal campo `codice`.
    3.  Esegue una mappatura diretta dei campi, con una conversione per `aliquota` da stringa a numero.
    4.  Usa `prisma.codiceIva.upsert` per salvare i dati.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`, `businessDecoders`.
*   **Utilizzato da**: Rotte di importazione legacy.
*   **Scrive su DB**: Tabella `CodiceIva`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo importer è più semplice degli altri, indicando che la trasformazione per i codici IVA è meno complessa e richiede principalmente la conversione dei tipi.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importers/condizioniPagamentoImporter.ts**

**Scopo Principale**: Contiene la logica di business per trasformare e salvare i dati delle condizioni di pagamento.

**Analisi Dettagliata**:
*   **Funzione `processCondizioniPagamento`**:
    1.  Itera sui dati parsati in batch.
    2.  Estrae l'`externalId` dal `codicePagamento`.
    3.  Esegue una mappatura dei campi, convertendo `numeroRate` in intero e i flag `calcolaGiorniCommerciali` e `consideraPeriodiChiusura` da 'X' a booleano.
    4.  Usa `prisma.condizionePagamento.upsert` per il salvataggio.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`.
*   **Utilizzato da**: Rotte di importazione legacy.
*   **Scrive su DB**: Tabella `CondizionePagamento`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Anche questo è un importer relativamente semplice, focalizzato sulla corretta tipizzazione dei dati prima dell'inserimento nel database.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importers/pianoDeiContiImporter.ts**

**Scopo Principale**: Contiene la logica di business per trasformare e salvare i dati del piano dei conti.

**Analisi Dettagliata**:
*   **Funzioni Helper**:
    *   `formatCodificaGerarchica`: Formatta il codice del conto in base al suo livello (Mastro, Conto, Sottoconto).
    *   `determinaTipoConto`: Logica di business cruciale che determina il tipo di conto (`Costo`, `Ricavo`, `Patrimoniale`, ecc.) basandosi sul codice legacy e sul codice numerico del conto.
*   **Funzione `handlePianoDeiContiImport`**:
    1.  Itera sui dati parsati.
    2.  Applica le funzioni helper e i decodificatori da `businessDecoders` per trasformare ogni record.
    3.  Crea un oggetto `cleanData` che mappa esattamente i campi del modello Prisma `Conto`.
    4.  Usa `prisma.conto.upsert` per salvare i dati.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`, `businessDecoders`.
*   **Utilizzato da**: Rotte di importazione legacy.
*   **Scrive su DB**: Tabella `Conto`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La funzione `determinaTipoConto` è un esempio perfetto di logica di business "nascosta" che è fondamentale per il funzionamento del sistema. Senza questa traduzione, il sistema non potrebbe distinguere correttamente tra costi e ricavi.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/businessDecoders.ts**

**Scopo Principale**: Fornisce una libreria centralizzata di funzioni "pure" per decodificare i valori stringa legacy in descrizioni leggibili o tipi di dato strutturati.

**Analisi Dettagliata**:
*   **Purezza**: Ogni funzione prende un codice stringa come input e restituisce una stringa o un oggetto decodificato, senza effetti collaterali. Questo le rende facili da testare e riutilizzare.
*   **Copertura**: Contiene decodificatori per quasi tutti i codici presenti nei file di importazione:
    *   **Causali**: `decodeTipoMovimento`, `decodeTipoRegistroIva`, `decodeGestionePartite`.
    *   **Codici IVA**: `decodeTipoCalcolo`, `decodePlafondAcquisti`.
    *   **Piano dei Conti**: `decodeLivello`, `decodeTipoConto`, `decodeGruppo`.
    *   **Anagrafiche**: `decodeTipoContoAnagrafica`, `decodeTipoSoggetto`.
    *   **Condizioni Pagamento**: `decodeSuddivisione`, `decodeInizioScadenza`.
*   **Utility Generiche**: Include anche funzioni di utilità come `decodeBooleanFlag`, `decodeDateFromString`, `decodeDecimal`, che sono usate in più punti.

**Interazioni e Connessioni**:
*   **Importa**: Nessuna dipendenza esterna (a parte `moment` in una versione precedente, ora non più).
*   **Utilizzato da**: Tutti i file `importers` in `server/lib/importers` e i nuovi `transformers` in `server/import-engine/transformation`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è un dizionario della logica di business legacy. Quando si incontra un codice enigmatico in un file di dati, la sua funzione di decodifica si trova qui. È uno dei file più importanti per la manutenibilità del sistema.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/finalization.ts**

**Scopo Principale**: Contiene la logica per finalizzare i dati, ovvero trasferirli dalle tabelle di staging alle tabelle di produzione dopo la validazione.

**Analisi Dettagliata**:
*   **Funzioni Esportate**: `finalizeAnagrafiche`, `finalizeCausaliContabili`, `finalizeCodiciIva`, `finalizeCondizioniPagamento`, `finalizeConti`.
*   **Pattern "Staging-Commit"**: Ogni funzione implementa questo pattern:
    1.  **Lettura da Staging**: Legge tutti i record dalla tabella di staging corrispondente (es. `prisma.stagingAnagrafica.findMany()`).
    2.  **Trasformazione/Mappatura**: Converte i dati grezzi (solitamente stringhe) nei tipi di dato corretti per il modello di produzione (es. `parseFloat`, `parseInt`, `new Date()`).
    3.  **Pulizia Produzione**: Esegue un `deleteMany` sulla tabella di produzione, filtrando per gli `externalId` che stanno per essere importati. Questo previene duplicati e assicura che l'importazione sia un aggiornamento completo.
    4.  **Scrittura in Produzione**: Usa `createMany` per inserire in blocco i dati trasformati.
    5.  **Transazionalità**: L'uso di `prisma.$transaction` garantisce che le operazioni di pulizia e inserimento per un dato tipo di anagrafica siano atomiche: o vanno a buon fine entrambe, o nessuna delle due.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`.
*   **Utilizzato da**: La rotta `/api/staging/finalize` in `server/routes/staging.ts`.
*   **Interagisce con DB**: Legge da tutte le tabelle `Staging*` e scrive su tutte le tabelle di produzione corrispondenti.

**Appunti per il Manuale**:
*   **(Utente)**: "Il pulsante 'Finalizza' avvia un processo sicuro che trasferisce i dati importati e controllati nel sistema principale, rendendoli disponibili per le analisi."
*   **(Sviluppatore)**: Questo file è il cuore del processo di commit. La logica `deleteMany` + `createMany` dentro una transazione è una strategia di "upsert massivo". È fondamentale che la mappatura dei dati da staging a produzione sia corretta e completa qui dentro.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/fixedWidthParser.ts**

**Scopo Principale**: Fornisce le funzioni di base per il parsing di file di testo a larghezza fissa.

**Analisi Dettagliata**:
*   **Interfaccia `FieldDefinition`**: Definisce la struttura di un campo: `fieldName`, `start`, `length`, `type`, `format`.
*   **Funzione `readFileWithFallbackEncoding`**: Funzione robusta che tenta di leggere un file usando diversi encoding (`utf-8`, `latin1`, `ascii`), replicando il comportamento dei parser Python per massima compatibilità con i file legacy.
*   **Funzione `validateRecordLength`**: Controlla che una riga di testo abbia la lunghezza attesa, basandosi su una configurazione `RECORD_VALIDATIONS`.
*   **Funzione `processWithErrorHandling`**: Un wrapper che itera sulle righe di un file, applica una funzione di elaborazione (`processor`) a ogni riga e gestisce gli errori in modo "graceful" (registra l'errore e continua), invece di interrompere l'intero processo.
*   **Funzione `parseFixedWidth` (Legacy)**: La versione originale del parser. Semplice e diretta, ma meno robusta.
*   **Funzione `parseFixedWidthRobust`**: La versione evoluta che orchestra le altre funzioni helper per fornire un parsing resiliente e con statistiche dettagliate.

**Interazioni e Connessioni**:
*   **Importa**: `fs/promises`, `iconv-lite`.
*   **Utilizzato da**: `typeSafeFixedWidthParser.ts` (che a sua volta è usato da tutti i workflow dell'Import Engine) e dalle rotte di importazione legacy.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file contiene l'implementazione a basso livello del parsing. La funzione chiave è `parseFixedWidthRobust`, che combina lettura, validazione ed elaborazione con gestione degli errori. È la base su cui poggia tutto il layer di "Acquisition" del nuovo Import Engine.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/importUtils.ts**

**Scopo Principale**: Fornisce un insieme di funzioni di utilità riutilizzabili per i processi di importazione.

**Analisi Dettagliata**:
*   **`processScrittureToStaging`**: Una funzione di alto livello (ora probabilmente obsoleta) che orchestra il parsing e il salvataggio delle scritture contabili nelle tabelle di staging.
*   **`convertDateString`**: Converte una stringa `DDMMYYYY` in un oggetto `Date` di JavaScript, gestendo i casi di stringhe vuote o non valide.
*   **`parseBooleanFlag`**: Converte una stringa (solitamente 'X') in un valore booleano.
*   **`parseDecimalString`**: Converte una stringa in un numero, gestendo la virgola come separatore decimale.
*   **`parseBooleanPythonic`**: Una versione più flessibile di `parseBooleanFlag` che accetta più caratteri per rappresentare `true`.

**Interazioni e Connessioni**:
*   **Importa**: `PrismaClient`.
*   **Utilizzato da**: Vari file `importers` e `transformers` per standardizzare la conversione dei tipi di dato.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Libreria di utility per le conversioni di tipo comuni nei file legacy. Centralizzare queste funzioni qui evita la duplicazione del codice e garantisce un comportamento coerente in tutto il sistema di importazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/lib/jobManager.ts**

**Scopo Principale**: Fornisce una classe `JobManager` per la gestione in memoria dello stato dei processi asincroni (job).

**Analisi Dettagliata**:
*   **Classe `JobManager`**: Implementa il pattern Singleton (esportando un'unica istanza `jobManager`).
*   **Interfaccia `Job`**: Definisce la struttura di un job con `id`, `status` (`pending`, `processing`, `completed`, `failed`), `progress`, `total`, `message`, e `result`/`error`.
*   **EventEmitter**: Estende `EventEmitter` di Node.js per notificare i listener (come un endpoint SSE) ogni volta che lo stato di un job viene aggiornato.
*   **Metodi**: `create`, `update`, `get`, `cleanup`. Il metodo `cleanup` è importante perché rimuove i job completati dalla memoria dopo un timeout per prevenire memory leak.

**Interazioni e Connessioni**:
*   **Importa**: `EventEmitter`.
*   **Utilizzato da**: Probabilmente dalle rotte che gestiscono processi lunghi, come la finalizzazione, per fornire feedback in tempo reale all'interfaccia utente.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo `JobManager` è un semplice ma efficace sistema di gestione dello stato in memoria per operazioni asincrone. È la base per fornire feedback in tempo reale all'utente durante operazioni lunghe come la finalizzazione dei dati di staging. È un precursore del sistema più strutturato `ImportJob` + `TelemetryService` usato nel nuovo Import Engine.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/routes**

**Scopo Principale della Cartella**: Questa cartella contiene la definizione di tutte le rotte API dell'applicazione. Ogni file corrisponde a una risorsa specifica (es. `clienti.ts`, `commesse.ts`) e definisce gli endpoint per le operazioni CRUD (Create, Read, Update, Delete) su quella risorsa. Utilizza il framework Express.js per gestire le richieste HTTP.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/v2/import.ts**

**Scopo Principale**: Definisce gli endpoint per la **nuova architettura di importazione (v2)**, centralizzando tutte le operazioni di importazione sotto un unico percorso `/api/v2/import`.

**Analisi Dettagliata**:
*   **Architettura**: Questo file agisce come un "router principale" per l'importazione. Invece di contenere la logica, importa e utilizza gestori (`handler`) specifici per ogni tipo di anagrafica.
*   **Middleware `multer`**: Configura `multer` per gestire l'upload di file in memoria (`memoryStorage`), con un limite di dimensione e un filtro per accettare solo file `.txt`.
*   **Servizi Condivisi**: Istanzia i servizi `DLQService` e `TelemetryService` per passarli ai gestori, centralizzando la gestione degli errori e del logging.
*   **Endpoint Specifici**:
    *   `POST /piano-dei-conti`: Gestito da `handlePianoDeiContiImportV2`.
    *   `POST /condizioni-pagamento`: Gestito da `handleCondizioniPagamentoImportV2`.
    *   `POST /codici-iva`: Gestito da `handleCodiceIvaImport`.
    *   `POST /causali-contabili`: Gestito da `handleCausaleContabileImport`.
    *   `POST /clienti-fornitori`: Gestito da `handleAnagraficaImport`.
    *   `POST /scritture-contabili`: Utilizza un router dedicato (`createScrittureContabiliRouter`) per gestire la complessità dell'importazione multi-file.
*   **Endpoint di Monitoraggio**:
    *   `GET /status`: Fornisce metadati sull'API v2, elencando gli endpoint disponibili e le feature dell'architettura.
    *   `GET /health`: Un endpoint di health-check che restituisce lo stato dei servizi dipendenti.
    *   `GET /stats`: Fornisce statistiche aggregate sui job di importazione.
    *   `POST /cleanup`: Un endpoint di sistema per la pulizia dei log vecchi.
*   **Error Handling**: Include un middleware di gestione degli errori specifico per questo router, che gestisce elegantemente gli errori di `multer` (es. file troppo grande) e altri errori interni.

**Interazioni e Connessioni**:
*   **Importa**: `express`, `multer`, `PrismaClient`, e tutti gli handler e i servizi dall'**Import Engine**.
*   **Utilizzato da**: `server/index.ts`, che lo monta sul percorso `/api/v2/import`.
*   **Interagisce con DB**: Indirettamente, tramite i workflow chiamati dagli handler.

**Appunti per il Manuale**:
*   **(Utente)**: "La sezione 'Importa Dati' dell'applicazione comunica con un sistema avanzato sul server (API v2) progettato per gestire in modo sicuro e affidabile i file caricati."
*   **(Sviluppatore)**: Questo file è il punto di ingresso per tutta la nuova logica di importazione. È un ottimo esempio di come strutturare le API in modo pulito, delegando la logica di business a gestori e workflow specifici. La presenza di endpoint di `/health` e `/stats` è una best practice per sistemi enterprise.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/v2/causali.ts**

**Scopo Principale**: Definisce un endpoint specifico per l'importazione delle causali contabili, utilizzando il nuovo gestore dell'Import Engine.

**Analisi Dettagliata**:
*   **Specializzazione**: Questo file è un "sub-router". La sua unica responsabilità è definire la rotta `POST /import/causali-contabili`.
*   **Logica**:
    1.  Usa il middleware `multer` per gestire l'upload del singolo file.
    2.  Passa la richiesta e la risposta all'handler `handleCausaleContabileImport`, che contiene tutta la logica.

**Interazioni e Connessioni**:
*   **Importa**: `express`, `multer`, `handleCausaleContabileImport`.
*   **Utilizzato da**: Questo file sembra essere un residuo o una versione alternativa. La rotta che definisce (`/import/causali-contabili`) è già definita in `routes/v2/import.ts`. Potrebbe essere ridondante.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è probabilmente obsoleto o parte di una refactoring precedente. La sua funzionalità è stata centralizzata in `routes/v2/import.ts`. Andrebbe verificato se è ancora in uso e, in caso contrario, rimosso per pulizia del codice.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/causali.ts**

**Scopo Principale**: Fornisce gli endpoint API CRUD (Create, Read, Update, Delete) per la risorsa `CausaleContabile`.

**Analisi Dettagliata**:
*   **`GET /`**: Recupera un elenco di causali contabili. Supporta paginazione (`page`, `limit`), ricerca (`search`), ordinamento (`sortBy`, `sortOrder`) e un flag `all=true` per recuperare tutti i record senza paginazione.
*   **`POST /`**: Crea una nuova causale contabile.
*   **`PUT /:id`**: Aggiorna una causale contabile esistente, identificata dal suo ID.
*   **`DELETE /:id`**: Elimina una causale contabile.

**Interazioni e Connessioni**:
*   **Importa**: `express`, `PrismaClient`.
*   **Utilizzato da**: `server/index.ts` (montato su `/api/causali`). Consumato dai componenti del frontend come `CausaliTable.tsx` per visualizzare e gestire i dati.
*   **Interagisce con DB**: Esegue operazioni CRUD sulla tabella `CausaleContabile`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Endpoint standard per la gestione delle anagrafiche. La logica di paginazione e ricerca è un pattern ripetuto in molte altre rotte (es. `clienti.ts`, `fornitori.ts`).

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/clienti.ts**

**Scopo Principale**: Fornisce gli endpoint API CRUD per la risorsa `Cliente`.

**Analisi Dettagliata**:
*   **`GET /`**: Recupera un elenco di clienti con paginazione, ricerca e ordinamento. La ricerca avviene su `nome`, `externalId`, `piva`, `codiceFiscale` e `sottocontoCliente`.
*   **`POST /`**: Crea un nuovo cliente.
*   **`PUT /:id`**: Aggiorna un cliente esistente.
*   **`DELETE /:id`**: Elimina un cliente. Include una gestione specifica degli errori Prisma: se si tenta di eliminare un cliente collegato a una commessa (`P2003`), restituisce un errore 409 (Conflict) con un messaggio chiaro.

**Interazioni e Connessioni**:
*   **Importa**: `express`, `PrismaClient`.
*   **Utilizzato da**: `server/index.ts` (montato su `/api/clienti`). Consumato da `ClientiTable.tsx`.
*   **Interagisce con DB**: Esegue operazioni CRUD sulla tabella `Cliente`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Ottimo esempio di gestione robusta degli errori di integrità referenziale nel `DELETE`. Invece di un generico errore 500, fornisce un feedback specifico all'utente.

---

*Nota: Le rotte `codiciIva.ts`, `commesse.ts`, `condizioniPagamento.ts`, `conti.ts`, `fornitori.ts`, `regoleRipartizione.ts`, `vociAnalitiche.ts` seguono un pattern CRUD identico a `clienti.ts` e `causali.ts`, ognuna sulla propria risorsa. Le analizzerò evidenziando solo le differenze significative.*

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/codiciIva.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `CodiceIva`.
**Analisi Dettagliata**: Segue il pattern CRUD standard. Nessuna particolarità degna di nota rispetto agli altri.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/commesse.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `Commessa`.
**Analisi Dettagliata**:
*   **`GET /`**: Oltre ai filtri standard, include nella risposta le relazioni `cliente`, `budget`, `parent`, e `children`, fornendo un oggetto completo.
*   **`POST /`**: Gestisce la creazione di una commessa e delle sue voci di budget associate in un'unica transazione, garantendo l'atomicità.
*   **`PUT /:id`**: Gestisce l'aggiornamento della commessa e la sostituzione completa delle voci di budget associate, sempre in modo transazionale.
*   **`GET /select`**: Fornisce un endpoint ottimizzato che restituisce solo `id` e `nome` delle commesse, utile per popolare le dropdown nel frontend senza caricare dati superflui.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/commesseWithPerformance.ts**

**Scopo Principale**: Fornisce un endpoint specializzato che restituisce le commesse arricchite con dati di performance calcolati (KPI).

**Analisi Dettagliata**:
*   **Logica Complessa**: Questo non è un semplice endpoint CRUD. Esegue una logica di aggregazione complessa:
    1.  Carica commesse, clienti e tutte le scritture.
    2.  Per ogni commessa, calcola totali di costi e ricavi iterando sulle scritture allocate.
    3.  Calcola KPI derivati come `margine` e `percentualeAvanzamento`.
    4.  Consolida i totali delle commesse figlie nelle rispettive commesse padre.
*   **Ottimizzazione**: Crea una `Map` dei clienti per un lookup efficiente.
*   **Output**: Restituisce una struttura dati gerarchica (`commessePadre` con `figlie` annidate) pronta per essere visualizzata in componenti come `HierarchicalCommesseTable.tsx`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: `CommessaDettaglio.tsx`, `ComparativeAnalysis.tsx`.
*   **Interagisce con DB**: Legge da `Commessa`, `Cliente`, `ScritturaContabile`, `RigaScrittura`, `Allocazione`, `Conto`, `BudgetVoce`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo endpoint è un esempio di "Backend for Frontend" (BFF). Invece di far fare i calcoli pesanti al client, il server esegue le aggregazioni e fornisce al frontend una struttura dati già pronta per la visualizzazione. Questo migliora drasticamente le performance del client.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/condizioniPagamento.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `CondizionePagamento`.
**Analisi Dettagliata**: Segue il pattern CRUD standard.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/conti.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `Conto`.
**Analisi Dettagliata**:
*   **`GET /`**: Oltre ai filtri standard, supporta un filtro `rilevanti=true` per recuperare solo i conti marcati come `isRilevantePerCommesse`.
*   **`PATCH /:id/toggle-rilevanza`**: Un endpoint specifico per modificare solo il flag `isRilevantePerCommesse`, più efficiente di un `PUT` completo.
*   **`GET /select`**: Endpoint ottimizzato per le dropdown.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/dashboard.ts**

**Scopo Principale**: Fornisce un singolo endpoint che aggrega tutti i dati necessari per popolare la dashboard principale.

**Analisi Dettagliata**:
*   **Aggregazione Massiva**: Simile a `commesseWithPerformance`, questo endpoint esegue una grande quantità di calcoli sul server.
*   **Calcolo KPI**: Calcola KPI globali come `ricaviTotali`, `costiTotali`, `margineLordoMedio`, `commesseConMargineNegativo`, `movimentiNonAllocati`.
*   **Calcolo Trend**: Elabora i dati per creare serie temporali (es. `ricaviMensili`) e classifiche (`topCommesse`).
*   **Output Strutturato**: Restituisce un singolo oggetto JSON (`DashboardData`) che contiene tutto ciò di cui il componente `Dashboard.tsx` ha bisogno per renderizzare se stesso, minimizzando il numero di chiamate API dal frontend.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Altro eccellente esempio di pattern BFF. La logica di calcolo dei KPI è centralizzata qui, rendendo il componente frontend molto più semplice e focalizzato sulla sola visualizzazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/database.ts**

**Scopo Principale**: Fornisce endpoint per operazioni di amministrazione a livello di database.

**Analisi Dettagliata**:
*   **`GET /`**: Recupera un riepilogo completo di quasi tutte le tabelle principali, utile per una vista d'insieme.
*   **`DELETE /scritture`**: Endpoint pericoloso che svuota le tabelle `ScritturaContabile` e le sue dipendenti (`Allocazione`, `RigaIva`, `RigaScrittura`) in una transazione.
*   **`DELETE /codici-iva`**, **`DELETE /condizioni-pagamento`**: Endpoint simili per la pulizia di altre tabelle anagrafiche.
*   **`POST /backup`**: Endpoint di sistema che utilizza il comando `pg_dump` della riga di comando per creare un backup fisico del database.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questi endpoint sono destinati a un pannello di amministrazione. La rotta di backup è un esempio di interazione tra il server Node.js e i comandi del sistema operativo sottostante.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/fornitori.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `Fornitore`.
**Analisi Dettagliata**: Segue il pattern CRUD standard, con gestione degli errori di integrità referenziale come in `clienti.ts`.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/importAnagrafiche.ts**

**Scopo Principale**: Endpoint **legacy** per l'importazione di vari tipi di anagrafiche.

**Analisi Dettagliata**:
*   **Routing Dinamico**: Usa un parametro `:templateName` per gestire diversi tipi di importazione con un unico blocco di codice.
*   **Logica Legacy**: Chiama direttamente gli `importers` dalla cartella `server/lib/importers`.
*   **Obsolescenza**: Questo approccio è stato superato dalla nuova architettura in `/api/v2/import`, che è più modulare e robusta.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questa rotta è un esempio della "vecchia" architettura di importazione. È probabile che venga deprecata o rimossa in futuro a favore degli endpoint v2.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/importConti.ts** e **importContiAziendale.ts**

**Scopo Principale**: Endpoint **legacy** per l'importazione del piano dei conti.
**Analisi Dettagliata**:
*   `importConti.ts` contiene una logica "intelligente" per distinguere tra file standard e aziendali e chiamare il workflow corretto.
*   `importContiAziendale.ts` sembra essere una versione precedente o ridondante della stessa logica.
*   Entrambi sono stati sostituiti dall'endpoint unificato `POST /api/v2/import/piano-dei-conti`.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/importPrimaNota.ts** e **importScritture.ts**

**Scopo Principale**: Endpoint **legacy** per l'importazione delle scritture contabili.
**Analisi Dettagliata**:
*   Contengono la logica di parsing e salvataggio diretto delle scritture, un approccio meno robusto rispetto al nuovo workflow che usa tabelle di staging.
*   Sono stati sostituiti dall'endpoint `POST /api/v2/import/scritture-contabili`.
*   La presenza di un file `.bak` (`importScritture.ts.bak`) suggerisce che c'è stata una fase di transizione e refactoring.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/importTemplates.ts**

**Scopo Principale**: Endpoint CRUD per la gestione dei template di importazione (`ImportTemplate` e `FieldDefinition`).
**Analisi Dettagliata**: Permette al frontend (in particolare a `ImportTemplatesAdmin.tsx`) di visualizzare, creare, modificare ed eliminare le configurazioni di parsing, rendendo il sistema flessibile senza dover modificare il codice del backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/registrazioni.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `ScritturaContabile`.
**Analisi Dettagliata**:
*   Questa rotta è il punto di accesso per la gestione manuale delle scritture dal frontend (es. da `NuovaRegistrazionePrimaNota.tsx`).
*   La logica di `PUT` è particolarmente complessa, in quanto gestisce l'aggiornamento, la creazione e l'eliminazione delle righe e delle allocazioni associate all'interno di una singola transazione per garantire la coerenza.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/regoleRipartizione.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `RegolaRipartizione`.
**Analisi Dettagliata**: Segue il pattern CRUD standard.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/staging.ts**

**Scopo Principale**: Fornisce endpoint per visualizzare i dati nelle tabelle di staging e per avviare il processo di finalizzazione.

**Analisi Dettagliata**:
*   **Endpoint di Lettura**: Fornisce rotte `GET` per ogni tabella di staging (`/conti`, `/anagrafiche`, ecc.), complete di paginazione e ricerca. Questo permette alla UI in `/pages/Staging.tsx` di visualizzare i dati importati.
*   **`GET /stats`**: Fornisce i conteggi dei record per ogni tabella di staging.
*   **`POST /finalize`**: Endpoint cruciale che avvia il processo di finalizzazione asincrono (tramite `runFinalizationProcess`). Risponde immediatamente con `202 Accepted` e poi il processo continua in background.
*   **`GET /events`**: Endpoint SSE (Server-Sent Events) che permette al frontend (`FinalizationStatus.tsx`) di ricevere aggiornamenti in tempo reale sullo stato del processo di finalizzazione.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: L'accoppiata `POST /finalize` (asincrono) e `GET /events` (SSE) è un pattern eccellente per gestire operazioni di lunga durata senza bloccare l'interfaccia utente e fornendo un feedback in tempo reale.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/stats.ts**

**Scopo Principale**: Fornisce un endpoint per ottenere statistiche aggregate (conteggi) dalle tabelle di produzione.
**Analisi Dettagliata**: Esegue un `prisma.$transaction` per contare i record in tutte le tabelle principali in un'unica chiamata al database, in modo efficiente.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/system.ts**

**Scopo Principale**: Fornisce endpoint per operazioni di sistema e di amministrazione di alto livello.

**Analisi Dettagliata**:
*   **`GET /status`**: Endpoint complesso che controlla lo stato generale del sistema, verifica la presenza di dati essenziali e restituisce lo stato dei passi di un potenziale "wizard" di configurazione.
*   **`POST /reset-database`**: Endpoint molto potente che esegue il comando `npx prisma migrate reset --force`, cancellando e ripopolando l'intero database.
*   **`POST /consolidate-scritture`**: Endpoint che legge i dati dalle tabelle di staging delle scritture e li trasferisce nelle tabelle di produzione (`ScritturaContabile`, `RigaScrittura`, ecc.). Questa è la logica di finalizzazione specifica per le scritture.
*   **`POST /clear-staging-scritture`**: Svuota solo le tabelle di staging relative alle scritture.
*   **`POST /seed-demo-data`**: Un endpoint di debug/setup che esegue un reset completo e poi popola il database importando e finalizzando tutti i file di esempio.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file contiene la logica più "pericolosa" e potente. L'endpoint `consolidate-scritture` è il pezzo mancante del puzzle di finalizzazione, gestendo la parte più complessa (le scritture multi-file).

---

### **File: G:/HSC/Reale/commessa-control-hub/server/routes/vociAnalitiche.ts**

**Scopo Principale**: Endpoint CRUD per la risorsa `VoceAnalitica`.
**Analisi Dettagliata**: Segue il pattern CRUD standard, con un endpoint `/select` ottimizzato per le dropdown.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/server/types**

**Scopo Principale della Cartella**: Questa directory definisce tipi e interfacce TypeScript personalizzati, specifici per il dominio dell'applicazione, che non sono direttamente generati da Prisma. Serve a creare strutture dati complesse e a garantire la coerenza dei tipi tra i vari moduli del backend, specialmente per le risposte delle API e i processi di elaborazione dati.

---

### **File: G:/HSC/Reale/commessa-control-hub/server/types/reconciliation.ts**

**Scopo Principale**: Definisce le strutture dati (interfacce e tipi) utilizzate specificamente nel processo di riconciliazione delle scritture contabili.

**Analisi Dettagliata**:

*   **Interfaccia `ReconciliationSummaryData`**:
    *   **Utilizzo**: Descrive l'oggetto di riepilogo che viene restituito dopo l'analisi di riconciliazione. Fornisce all'utente una visione d'insieme dei risultati.
    *   **Campi**:
        *   `totalScrittureToProcess`: Numero totale di scritture contabili analizzate.
        *   `totalRigheToProcess`: Numero totale di righe di costo/ricavo rilevanti all'interno di quelle scritture.
        *   `reconciledAutomatically`: Numero di righe che il sistema è riuscito ad allocare automaticamente (es. tramite regole di ripartizione).
        *   `needsManualReconciliation`: Numero di righe che non sono state allocate e richiedono un intervento manuale.

*   **Tipo `RigaDaRiconciliare`**:
    *   **Utilizzo**: Questo è un tipo di dato cruciale. Rappresenta una singola riga di scrittura contabile che non è stata allocata automaticamente e che deve essere presentata all'utente per l'allocazione manuale. È una DTO (Data Transfer Object) ottimizzata per la UI.
    *   **Campi**:
        *   `id`: L'ID della riga di staging originale (`StagingRigaContabile`), per poterla ricollegare.
        *   `externalId`: L'ID della scrittura a cui appartiene, per contesto.
        *   `data`: La data della registrazione.
        *   `descrizione`: La descrizione della riga.
        *   `importo`: L'importo da allocare (già calcolato come Dare o Avere).
        *   `conto`: Un oggetto nidificato con i dettagli del conto associato (`id`, `codice`, `nome`).
        *   `voceAnaliticaSuggerita`: Un oggetto nidificato che rappresenta il suggerimento del sistema per la `VoceAnalitica` da usare, se disponibile. Può essere `null`.

*   **Interfaccia `ReconciliationResult`**:
    *   **Utilizzo**: Definisce la struttura completa della risposta dell'API di riconciliazione.
    *   **Campi**:
        *   `message`: Un messaggio di stato per l'utente.
        *   `summary`: Un oggetto di tipo `ReconciliationSummaryData`.
        *   `righeDaRiconciliare`: Un array di oggetti `RigaDaRiconciliare`.
        *   `errors`: Un array di stringhe per eventuali errori avvenuti durante il processo.

*   **Interfaccia `AllocationStats`**:
    *   **Utilizzo**: Definisce la struttura dei dati per il widget di stato delle allocazioni nella dashboard.
    *   **Campi**:
        *   `unallocatedCount`: Numero totale di movimenti non allocati (sia in staging che finalizzati).
        *   `totalUnallocatedAmount`: Valore monetario totale dei movimenti non allocati.
        *   `totalMovements`: Numero totale di movimenti nel sistema.
        *   `finalizedCount`: Numero di movimenti già trasferiti nelle tabelle di produzione.
        *   `allocationPercentage`: La percentuale di movimenti totali che sono stati allocati.

**Interazioni e Connessioni**:
*   **Importa**: Nessuna dipendenza.
*   **Utilizzato da**:
    *   La rotta `/api/reconciliation` (`server/routes/reconciliation.ts`) usa questi tipi per definire la struttura delle sue risposte API.
    *   Il frontend, in particolare la pagina `Riconciliazione.tsx` e i componenti associati (`ReconciliationTable.tsx`, `ReconciliationSummary.tsx`), si aspetta di ricevere dati conformi a queste interfacce.
    *   La rotta `/api/staging/allocation-stats` (`server/routes/staging.ts`) usa `AllocationStats` per la sua risposta.

**Appunti per il Manuale**:
*   **(Utente)**: "Quando si avvia il processo di riconciliazione, il sistema analizza tutte le scritture e presenta un riepilogo. Le righe che non possono essere assegnate automaticamente vengono mostrate in una tabella, pronte per l'allocazione manuale."
*   **(Sviluppatore)**: Questi tipi sono il contratto tra il backend e il frontend per il flusso di riconciliazione. `RigaDaRiconciliare` è un ottimo esempio di DTO: non espone l'intero modello del database, ma solo i dati necessari e pre-elaborati per la UI, migliorando performance e sicurezza. Qualsiasi modifica alla logica di riconciliazione nel backend deve riflettersi in questi tipi per mantenere la coerenza con il frontend.

---
---

### **File: G:/HSC/Reale/commessa-control-hub/.env**

**Scopo Principale**: Contiene le variabili d'ambiente sensibili e specifiche per ogni ambiente di esecuzione (sviluppo, produzione, ecc.).

**Analisi Dettagliata**:
*   **`DATABASE_URL`**: L'unica variabile definita è la stringa di connessione al database PostgreSQL.
*   **Configurazioni Multiple**: Il file mostra due configurazioni commentate, una per "Ufficio" e una per "Casa". Questo indica che lo sviluppatore cambia la stringa di connessione a seconda di dove sta lavorando. La stringa specifica l'utente (`dev_user`), la password (`Remotepass1`), l'host (`192.168.1.200` o `localhost`), la porta (`5433`), il nome del database (`dev_main_db`) e lo schema (`public`).
*   **Sicurezza**: Questo file non dovrebbe mai essere committato su un repository Git pubblico, poiché contiene credenziali. La sua presenza in `.gitignore` è fondamentale.

**Interazioni e Connessioni**:
*   **Utilizzato da**:
    *   **Prisma**: Legge automaticamente questo file per sapere a quale database connettersi durante le migrazioni, il seeding e l'esecuzione del client.
    *   **Node.js Server**: Il pacchetto `dotenv` (importato in `server/index.ts`) carica queste variabili in `process.env`, rendendole disponibili al codice del backend.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo è il primo file da configurare per far funzionare il progetto in locale. È necessario creare una copia da `.env.example` (se esistesse) o crearlo da zero e inserire la stringa di connessione al proprio database PostgreSQL locale o remoto.

---

### **File: G:/HSC/Reale/commessa-control-hub/.gitignore**

**Scopo Principale**: Specifica quali file e cartelle devono essere ignorati da Git, il sistema di controllo di versione.

**Analisi Dettagliata**:
*   **Logs**: Ignora tutti i file di log (`*.log`, `npm-debug.log*`, ecc.).
*   **Dipendenze**: Ignora la cartella `node_modules`, che contiene le dipendenze installate e può essere rigenerata con `npm install`.
*   **Build Artifacts**: Ignora le cartelle di output della compilazione (`dist`, `dist-ssr`).
*   **File Locali**: Ignora i file di configurazione specifici dell'editor di codice (`.vscode/`, `.idea`, `.DS_Store`) per evitare conflitti tra gli ambienti di sviluppo dei diversi programmatori.
*   **File Generati**: Ignora i file JavaScript compilati (`*.js`, `*.cjs`) e la cartella del client Prisma generato (`/generated/prisma`).
*   **Dati Sensibili/Grandi**: Ignora un file `.zip` specifico nei documenti, probabilmente per evitare di committare file binari di grandi dimensioni.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Git.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante.
*   **(Sviluppatore)**: File di configurazione standard ma vitale per mantenere il repository pulito e focalizzato solo sul codice sorgente.

---

### **File: G:/HSC/Reale/commessa-control-hub/components.json**

**Scopo Principale**: È il file di configurazione per la CLI di `shadcn/ui`.

**Analisi Dettagliata**:
*   **`"style": "default"`**: Specifica lo stile di base dei componenti.
*   **`"tsx": true`**: Indica che i componenti devono essere generati come file `.tsx` (TypeScript con JSX).
*   **`"tailwind"`**: Contiene la configurazione relativa a Tailwind CSS, specificando il percorso del file di configurazione (`tailwind.config.ts`), del file CSS di base (`src/index.css`) e il colore di base (`slate`).
*   **`"aliases"`**: Definisce gli alias di percorso (es. `@/components`) che vengono utilizzati negli import per rendere il codice più pulito e meno dipendente da percorsi relativi complessi. Questi alias devono corrispondere a quelli definiti in `tsconfig.json`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: La CLI di `shadcn/ui` quando si esegue il comando per aggiungere un nuovo componente (es. `npx shadcn-ui@latest add button`).

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file definisce come `shadcn/ui` deve interagire con il progetto. Se si volesse cambiare la struttura delle cartelle o il colore di base, le modifiche andrebbero fatte qui.

---

### **File: G:/HSC/Reale/commessa-control-hub/docker-compose.yml**

**Scopo Principale**: Definisce e configura i servizi necessari per eseguire l'applicazione in un ambiente containerizzato tramite Docker Compose.

**Analisi Dettagliata**:
*   **Servizio `postgres_dev`**:
    *   **`image: postgres:15-alpine`**: Utilizza un'immagine ufficiale di PostgreSQL versione 15, basata su Alpine Linux (una distribuzione leggera).
    *   **`environment`**: Imposta le variabili d'ambiente all'interno del container per configurare l'utente, la password e il nome del database. Queste credenziali corrispondono a quelle nel file `.env`.
    *   **`ports: - "5433:5432"`**: Mappa la porta `5433` della macchina host alla porta `5432` (la porta di default di PostgreSQL) all'interno del container. Questo permette all'applicazione Node.js (in esecuzione sull'host) di connettersi al database nel container.
    *   **`volumes: - postgres_dev_data:/var/lib/postgresql/data`**: Crea un volume Docker chiamato `postgres_dev_data` e lo monta nella directory dove PostgreSQL salva i suoi dati. Questo garantisce che i dati del database persistano anche se il container viene fermato e riavviato.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Lo strumento `docker-compose` (es. con il comando `docker-compose up`).
*   **Contesto**: Fornisce un modo standard e riproducibile per avviare il database necessario per lo sviluppo locale, senza doverlo installare direttamente sulla macchina host.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Per avviare il database necessario allo sviluppo, è sufficiente eseguire `docker-compose up -d` nella radice del progetto. Questo avvierà un container PostgreSQL pre-configurato e pronto per essere usato dall'applicazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/index.html**

**Scopo Principale**: È il file HTML di base che funge da punto di ingresso per l'applicazione frontend.

**Analisi Dettagliata**:
*   **Struttura HTML Standard**: Contiene i tag `<html>`, `<head>`, `<body>`.
*   **Meta Tag**: Include metadati per il titolo, la descrizione, l'autore e le anteprime per i social media (Open Graph e Twitter Cards).
*   **`<div id="root"></div>`**: Questo è l'elemento cruciale. È il container in cui l'intera applicazione React verrà montata.
*   **`<script type="module" src="/src/main.tsx"></script>`**: Questo tag carica ed esegue lo script di entry point del frontend (`main.tsx`), che a sua volta avvia React.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Vite Dev Server e dal processo di build per servire l'applicazione.
*   **Contesto**: È la "pagina bianca" su cui viene costruita dinamicamente tutta l'interfaccia utente tramite JavaScript.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: File di setup standard per un'applicazione React. Raramente necessita di modifiche, a meno che non si debbano aggiungere script esterni o fogli di stile globali direttamente nell'HTML.

---

### **File: G:/HSC/Reale/commessa-control-hub/package.json**

**Scopo Principale**: È il file manifesto del progetto Node.js. Definisce le proprietà del progetto, le dipendenze e gli script eseguibili.

**Analisi Dettagliata**:
*   **`"name": "commessa-control-hub"`**: Il nome del progetto.
*   **`"dependencies"`**: Elenca tutte le librerie necessarie per l'esecuzione dell'applicazione (es. `react`, `express`, `@prisma/client`, `zod`).
*   **`"devDependencies"`**: Elenca le librerie usate solo durante lo sviluppo (es. `vite`, `typescript`, `eslint`, `nodemon`).
*   **`"scripts"`**: Definisce comandi personalizzati eseguibili con `npm run <nome_script>`:
    *   `"dev"`: Avvia contemporaneamente (`concurrently`) il server di sviluppo del backend (`dev:server`) e del frontend (`dev:client`).
    *   `"dev:server"`: Usa `tsx` per avviare il server Node.js con hot-reloading.
    *   `"build"`: Esegue la compilazione sia del server che del client.
    *   `"generate:import-types"`: Esegue lo script per generare i tipi TypeScript dai template del DB.
    *   `"db:reset"`: Esegue il comando `prisma migrate reset`, che cancella il DB, applica le migrazioni e lancia il seed.

**Interazioni e Connessioni**:
*   **Utilizzato da**: `npm` (Node Package Manager) per installare le dipendenze e eseguire gli script.
*   **Contesto**: È il file centrale per la gestione del progetto e delle sue dipendenze.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è la "ricetta" del progetto. La sezione `"scripts"` è particolarmente importante perché documenta i comandi standard per sviluppare, compilare e gestire il progetto.

---

### **File: G:/HSC/Reale/commessa-control-hub/package-lock.json**

**Scopo Principale**: Fissa le versioni esatte di ogni dipendenza (e delle loro sotto-dipendenze) installata nel progetto.

**Analisi Dettagliata**:
*   **File Generato**: Questo file è generato e gestito automaticamente da `npm`.
*   **Riproducibilità**: Garantisce che ogni sviluppatore che esegue `npm install` ottenga esattamente la stessa versione di ogni pacchetto, prevenendo problemi dovuti a versioni diverse delle librerie.

**Interazioni e Connessioni**:
*   **Utilizzato da**: `npm`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Non modificare mai questo file manualmente. Va committato nel repository per garantire build consistenti e riproducibili su macchine diverse e in ambienti di CI/CD.

---

### **File: G:/HSC/Reale/commessa-control-hub/README.md**

**Scopo Principale**: Fornisce una panoramica introduttiva del progetto, le istruzioni di installazione e la struttura di base.

**Analisi Dettagliata**:
*   **Panoramica**: Descrive brevemente lo scopo dell'applicazione e lo stack tecnologico.
*   **Guida all'Installazione**: Fornisce i passaggi sequenziali per configurare l'ambiente di sviluppo locale.
*   **Struttura del Progetto**: Offre una descrizione di alto livello delle cartelle principali.
*   **Informazioni Aggiuntive**: Include link e informazioni relative alla piattaforma "Lovable" che potrebbe essere stata usata per generare o gestire il codice.

**Interazioni e Connessioni**:
*   File puramente documentale.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: È il primo file da leggere quando si approccia il progetto per la prima volta. Fornisce il contesto e le istruzioni essenziali per iniziare.

---

### **File: G:/HSC/Reale/commessa-control-hub/tailwind.config.ts**

**Scopo Principale**: File di configurazione per il framework CSS Tailwind.

**Analisi Dettagliata**:
*   **`darkMode: ["class"]`**: Abilita il tema scuro basato sulla presenza di una classe `dark` sull'elemento `<html>`.
*   **`content`**: Specifica a Tailwind quali file analizzare per trovare le classi di utilità utilizzate, in modo da includere solo il CSS necessario nel bundle finale.
*   **`theme.extend`**: Personalizza ed estende il tema di default di Tailwind.
    *   **`colors`**: Definisce colori personalizzati (es. `primary`, `secondary`, `sidebar`) utilizzando le variabili CSS definite in `src/index.css`. Questo collega la configurazione di Tailwind al design system dell'applicazione.
    *   **`keyframes` e `animation`**: Definisce animazioni personalizzate (es. `accordion-down`, `accordion-up`) utilizzate dai componenti di `shadcn/ui`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Il processo di build di Tailwind CSS.
*   **Contesto**: Permette di personalizzare l'aspetto e il comportamento del framework CSS per adattarlo al design del progetto.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Se si ha bisogno di aggiungere un nuovo colore, una nuova spaziatura o un nuovo font al sistema di design, questo è il file da modificare.

---

### **File: G:/HSC/Reale/commessa-control-hub/tsconfig.json** e **tsconfig.node.json**

**Scopo Principale**: File di configurazione del compilatore TypeScript.

**Analisi Dettagliata**:
*   **`tsconfig.json` (Radice)**: È un file "solution-style". Non contiene opzioni di compilazione, ma usa `references` per puntare agli altri file `tsconfig` del progetto (`tsconfig.app.json` per il frontend e `tsconfig.node.json` per il backend). Questo permette di gestire un progetto monorepo con configurazioni diverse per frontend e backend.
*   **`tsconfig.node.json`**:
    *   **`"extends": "./tsconfig.json"`**: Eredita la configurazione di base.
    *   **`"outDir": "./dist/server"`**: Specifica la cartella di output per il JavaScript compilato del server.
    *   **`"module": "CommonJS"`**: Impostazione chiave che dice a TypeScript di generare moduli CommonJS, adatti per l'esecuzione con Node.js.
    *   **`"include": ["server/**/*.ts", "prisma/**/*.ts"]`**: Specifica che questa configurazione si applica a tutti i file TypeScript nelle cartelle `server` e `prisma`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Il compilatore TypeScript (`tsc`) e gli strumenti di sviluppo come VS Code per il type-checking.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La struttura con `references` è tipica dei monorepo e indica una chiara separazione tra la configurazione del frontend e quella del backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/tsconfig.node.tsbuildinfo**

**Scopo Principale**: È un file di cache generato dal compilatore TypeScript.

**Analisi Dettagliata**:
*   **File di Cache**: Contiene informazioni sull'ultima compilazione (quali file sono stati compilati, le loro dipendenze, ecc.).
*   **Scopo**: Viene utilizzato da TypeScript per accelerare le compilazioni successive, ricompilando solo i file che sono cambiati.
*   **Generato Automaticamente**: Non deve essere modificato manualmente né, in genere, committato nel controllo di versione (anche se qui non è in `.gitignore`).

**Interazioni e Connessioni**:
*   **Utilizzato da**: Il compilatore TypeScript (`tsc`) quando viene eseguito con l'opzione `--build`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: File generato. Può essere tranquillamente ignorato o eliminato; verrà ricreato alla successiva compilazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/vite.config.ts**

**Scopo Principale**: File di configurazione per Vite, il build tool e server di sviluppo per il frontend.

**Analisi Dettagliata**:
*   **`server.proxy`**: Questa è una configurazione cruciale per lo sviluppo. Dice al server di sviluppo di Vite (che gira, ad esempio, sulla porta 8080) di inoltrare qualsiasi richiesta che inizia con `/api` al backend Node.js in esecuzione su `http://localhost:3001`. Questo risolve i problemi di CORS in sviluppo senza dover configurare il backend in modo complesso.
*   **`plugins`**: Registra i plugin utilizzati da Vite, come `@vitejs/plugin-react-swc` (per la compilazione veloce di React) e `lovable-tagger` (uno strumento di sviluppo specifico).
*   **`resolve.alias`**: Definisce gli alias di percorso (es. `@` che punta a `./src`), permettendo import puliti come `import { Button } from '@/components/ui/button'`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: Vite, quando vengono eseguiti i comandi `npm run dev:client` o `npm run build:client`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La configurazione del `proxy` è la parte più importante da capire in questo file per lo sviluppo locale. Spiega come il frontend e il backend, pur girando su porte diverse, possono comunicare senza problemi.
---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/types**

**Scopo Principale della Cartella**: Questa directory ha lo scopo di definire tipi e interfacce TypeScript personalizzati che possono essere condivisi tra il frontend (`src`) e il backend (`server`). Centralizzare i tipi in questo modo aiuta a garantire la coerenza e la sicurezza dei tipi attraverso l'intera applicazione, specialmente per le strutture dati che vengono scambiate tramite le API.

---

### **File: G:/HSC/Reale/commessa-control-hub/types/index.ts**

**Scopo Principale**: Definisce e riesporta una serie di tipi e interfacce TypeScript personalizzati, utilizzati per strutturare i dati in modo più specifico rispetto ai modelli base di Prisma, specialmente per le risposte delle API e per i dati aggregati.

**Analisi Dettagliata**:

*   **`export * from '@prisma/client';`**: Questa riga è molto importante. Riesporta tutti i tipi generati da Prisma (come `Commessa`, `Cliente`, `Conto`, ecc.). Ciò significa che qualsiasi file che importa da `types/index.ts` può accedere direttamente ai modelli del database, creando un unico punto di accesso per i tipi di dati.

*   **`CommessaWithRelations`**:
    *   **Definizione**: `Commessa & { cliente: Cliente | null; padre: Commessa | null; figlie: Commessa[]; totale_costi: number; totale_ricavi: number; };`
    *   **Utilizzo**: Estende il modello base `Commessa` di Prisma aggiungendo le relazioni (`cliente`, `parent`, `children`) e campi calcolati (`totale_costi`, `totale_ricavi`). Questo tipo rappresenta una commessa completa di tutti i suoi dati correlati e aggregati, come viene probabilmente restituita da alcuni endpoint API.
    *   **Nota**: La presenza di `totale_costi` e `totale_ricavi` suggerisce che c'è una logica nel backend che calcola questi valori prima di inviare i dati al frontend.

*   **`StagingContoWithRelations`**:
    *   **Definizione**: `StagingConto;`
    *   **Utilizzo**: Attualmente è solo un alias per il tipo `StagingConto` di Prisma. Potrebbe essere stato creato come segnaposto per future estensioni.

*   **`RegistrazioneWithRelations`**:
    *   **Definizione**: `ScritturaContabile & { righe: (RigaScrittura & { conto: Conto; })[]; };`
    *   **Utilizzo**: Rappresenta una `ScritturaContabile` completa, dove ogni elemento dell'array `righe` include anche l'oggetto `Conto` associato. Questo è utile per visualizzare il nome e il codice del conto direttamente nella UI senza query aggiuntive.

*   **`ContoForUI`**:
    *   **Definizione**: `{ id: string; codice: string; nome: string; }`
    *   **Utilizzo**: Un tipo semplificato per rappresentare un conto in contesti dove sono necessari solo i dati essenziali, come in una lista di selezione.

*   **`VoceAnaliticaWithRelations`**:
    *   **Definizione**: `VoceAnalitica & { conti: ContoForUI[]; }`
    *   **Utilizzo**: Rappresenta una `VoceAnalitica` con l'elenco dei conti associati, utilizzando il tipo semplificato `ContoForUI`.

*   **`TableStats`**:
    *   **Definizione**: `{[tableName: string]: { count: number; name: string; };}`
    *   **Utilizzo**: Definisce la struttura dell'oggetto che contiene le statistiche sul numero di record per ogni tabella del database.

*   **Tipi per la Riconciliazione (`ReconciliationSummaryData`, `RigaDaRiconciliare`, `ReconciliationResult`)**:
    *   **Utilizzo**: Questi tipi sono fondamentali per il processo di riconciliazione. Definiscono la struttura esatta dei dati scambiati tra il backend (che esegue l'analisi) e il frontend (che visualizza i risultati).
    *   **`RigaDaRiconciliare`**: È un tipo di dato "ViewModel" molto specifico. Non corrisponde a un singolo modello del database, ma è una composizione di dati provenienti da `StagingRigaContabile`, `Conto` e `VoceAnalitica` (suggerita), ottimizzata per essere visualizzata nella tabella di riconciliazione.

*   **`AllocationStats`**:
    *   **Utilizzo**: Definisce la struttura dei dati per il widget delle statistiche di allocazione, come visto in `AllocationWidget.tsx`.

*   **Tipi per la Dashboard (`CommessaDashboard`, `DashboardData`)**:
    *   **Utilizzo**: Definiscono la struttura complessa dei dati aggregati necessari per la pagina della Dashboard.
    *   **`CommessaDashboard`**: Simile a `CommessaWithPerformance`, rappresenta una commessa con tutti i suoi KPI calcolati (margine, avanzamento, ecc.) e le sue figlie annidate.
    *   **`DashboardData`**: È il tipo "contenitore" per l'intera risposta dell'endpoint `/api/dashboard`, che include i KPI globali, i dati per i trend e l'elenco delle commesse.

**Interazioni e Connessioni**:
*   **Importa**: `@prisma/client`.
*   **Utilizzato da**:
    *   **Frontend**: Molti componenti e pagine (`Dashboard.tsx`, `Riconciliazione.tsx`, ecc.) importano questi tipi per garantire la coerenza con i dati ricevuti dalle API.
    *   **Backend**: Anche se non direttamente importato (a causa della configurazione di `tsconfig`), il backend produce dati che devono corrispondere a queste strutture, specialmente per gli endpoint `dashboard` e `reconciliation`. La condivisione di questi tipi (magari tramite un workspace monorepo) sarebbe una best practice.

**Appunti per il Manuale**:
*   **(Utente)**: Non rilevante per l'utente finale.
*   **(Sviluppatore)**: Questo file è cruciale per la type-safety dell'applicazione. Definisce i "contratti di dati" tra il frontend e il backend. Quando si lavora su una feature che richiede dati aggregati o con relazioni complesse, è qui che si dovrebbe definire il tipo di dato atteso. La distinzione tra i tipi di modello base di Prisma (es. `Commessa`) e i tipi arricchiti (es. `CommessaDashboard`) è un concetto importante: il primo rappresenta la struttura del DB, il secondo rappresenta i dati come vengono consumati dalla UI.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/api**

**Scopo Principale della Cartella**: Questa directory funge da **Data Access Layer (DAL)** per l'applicazione frontend. Contiene tutte le funzioni che comunicano con le API del backend. Centralizzare qui la logica di comunicazione disaccoppia i componenti React dai dettagli implementativi delle chiamate di rete (es. URL degli endpoint, header, gestione degli errori), rendendo il codice più pulito, manutenibile e facile da testare.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/index.ts**

**Scopo Principale**: È il file di ingresso principale per il layer API del frontend. Definisce un client `axios` centralizzato, funzioni di utilità per il fetching dei dati e riesporta le funzioni specifiche definite negli altri file della cartella.

**Analisi Dettagliata**:
*   **`apiClient`**: Viene creata un'istanza di `axios` con una `baseURL` impostata a `/api`. Questo significa che tutte le chiamate fatte tramite questo client saranno relative a quell'URL (es. `apiClient.get('/clienti')` farà una richiesta a `/api/clienti`). Questo è utile perché il server di sviluppo Vite è configurato con un proxy che inoltra tutte le richieste `/api` al backend Node.js in esecuzione sulla porta 3001.
*   **`PaginatedResponse<T>`**: Un'interfaccia generica che definisce la struttura standard delle risposte paginate dal backend, contenente i dati (`data`) e le informazioni sulla paginazione (`pagination`).
*   **`fetchData<T>`**: Una funzione helper generica che incapsula la logica di una chiamata `fetch`, la gestione degli errori di base e il parsing della risposta JSON.
*   **`fetchPaginatedData<T>`**: Una funzione helper costruita sopra `fetchData` per gestire specificamente le chiamate ad endpoint paginati.
*   **Esportazione Funzioni API**: Il file esporta una serie di funzioni per recuperare dati da vari endpoint (es. `getScrittureContabili`, `getCommesse`, `getDashboardData`). Queste funzioni usano le utility `fetchData` o `fetchPaginatedData`.
*   **Riesportazione Modulare**: Utilizza la sintassi `export * as ...` per raggruppare ed esportare tutte le funzioni definite negli altri file della cartella (es. `causali.ts`, `clienti.ts`), permettendo di importarle in modo strutturato da altre parti dell'applicazione (es. `import { clienti } from '@/api'`).

**Interazioni e Connessioni**:
*   **Importa**: `axios`, `qs`, e i tipi da `@prisma/client` e `../types`.
*   **Utilizzato da**: Qualsiasi componente o hook React che necessiti di interagire con il backend. È il punto di accesso unificato per tutte le chiamate API.
*   **Consuma API**: Effettua chiamate a quasi tutti gli endpoint definiti in `/server/routes`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è il cuore del layer di comunicazione del frontend. Qualsiasi nuova entità o endpoint del backend dovrebbe avere la sua funzione di accesso definita qui o in un file dedicato all'interno di questa cartella. L'uso di un `apiClient` centralizzato è una best practice che facilita la gestione di configurazioni globali come autenticazione (token), header e interceptor per la gestione degli errori.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/causali.ts**

**Scopo Principale**: Fornisce funzioni CRUD (Create, Read, Update, Delete) per l'entità `CausaleContabile`.

**Analisi Dettagliata**:
*   **`getCausali()`**: Recupera l'elenco delle causali.
*   **`createCausale(data)`**: Invia una richiesta `POST` per creare una nuova causale.
*   **`updateCausale(id, data)`**: Invia una richiesta `PUT` per aggiornare una causale esistente.
*   **`deleteCausale(id)`**: Invia una richiesta `DELETE` per eliminare una causale.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/causali.ts`.
*   **Utilizzato da**: Componenti come `CausaliTable.tsx` e il suo hook `useCrudTable` per popolare la tabella e gestire le operazioni di modifica.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è un esempio pulito di come dovrebbe essere strutturato un modulo API per una singola risorsa. Ogni funzione corrisponde a un'operazione CRUD standard.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/clienti.ts**

**Scopo Principale**: Fornisce funzioni CRUD per l'entità `Cliente`.

**Analisi Dettagliata**:
*   Contiene le funzioni standard `getClienti`, `createCliente`, `updateCliente`, `deleteCliente`.
*   La gestione degli errori è più dettagliata rispetto ad altri file: nel `catch` dei metodi `create` e `update`, tenta di leggere il messaggio di errore specifico dalla risposta del backend (`errorData.error`).

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/clienti.ts`.
*   **Utilizzato da**: `ClientiTable.tsx` e `NuovaCommessa.tsx` (per popolare la dropdown dei clienti).

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Un altro esempio di modulo API standard per una risorsa.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/codiciIva.ts**

**Scopo Principale**: Fornisce funzioni CRUD per l'entità `CodiceIva`.

**Analisi Dettagliata**:
*   Definisce un'interfaccia locale `CodiceIva`. Questo potrebbe indicare che la struttura usata nel frontend è una semplificazione del modello completo di Prisma, o che è stato scritto prima che i tipi fossero condivisi in modo più robusto.
*   Implementa le funzioni CRUD standard: `getCodiciIva`, `createCodiceIva`, `updateCodiceIva`, `deleteCodiceIva`.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/codiciIva.ts`.
*   **Utilizzato da**: `CodiciIvaTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La presenza di un'interfaccia locale `CodiceIva` è un potenziale punto di refactoring. Sarebbe meglio importare il tipo direttamente da `@prisma/client` o da un file di tipi condiviso (`@shared-types`) per garantire la coerenza tra frontend e backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/commesse.ts**

**Scopo Principale**: Fornisce funzioni CRUD per l'entità `Commessa`.

**Analisi Dettagliata**:
*   **`CommessaWithRelations`**: Definisce un tipo che include le relazioni (cliente, parent, children, budget), rispecchiando i dati che il backend restituisce.
*   **`getCommesse()`**: Recupera l'elenco delle commesse con le loro relazioni.
*   **`createCommessa(data)`**: Invia i dati per creare una nuova commessa.
*   **`updateCommessa(id, data)`**: Aggiorna una commessa esistente.
*   **`deleteCommessa(id)`**: Elimina una commessa.
*   **`getCommesseForSelect()`**: Una funzione ottimizzata che recupera solo `id` e `nome` delle commesse, ideale per popolare menu a tendina senza caricare dati superflui.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/commesse.ts`.
*   **Utilizzato da**: `CommesseTable.tsx`, `CommessaDettaglio.tsx`, `NuovaCommessa.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La funzione `getCommesseForSelect` è un'ottima pratica di ottimizzazione. Evita di caricare l'intero oggetto `Commessa` con tutte le sue relazioni quando serve solo per una lista di selezione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/commessePerformance.ts**

**Scopo Principale**: Definisce i tipi e la funzione per recuperare i dati delle commesse arricchiti con i KPI di performance.

**Analisi Dettagliata**:
*   **`CommessaWithPerformance`**: Un'interfaccia dettagliata che rappresenta una commessa con tutti i suoi dati calcolati (ricavi, costi, margine, percentualeAvanzamento). È il tipo di dato fondamentale per la Dashboard e le viste di analisi.
*   **`CommessePerformanceResponse`**: Definisce la struttura della risposta dell'API, che include l'array di commesse e un elenco di clienti.
*   **`getCommesseWithPerformance()`**: Funzione che chiama l'endpoint `/api/commesse-performance` per ottenere questi dati aggregati.

**Interazioni e Connessioni**:
*   **Consuma API**: Chiama l'endpoint definito in `server/routes/commesseWithPerformance.ts`.
*   **Utilizzato da**: Componenti di alto livello come `Dashboard.tsx` e `ComparativeAnalysis.tsx` che necessitano di dati già elaborati per la visualizzazione.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo endpoint è un esempio di come il backend possa eseguire calcoli complessi e aggregazioni per sollevare il frontend da questo compito. Invece di far calcolare i KPI al client, il server li fornisce già pronti, migliorando le performance e centralizzando la logica di business.

---
---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/condizioniPagamento.ts**

**Scopo Principale**: Fornisce le funzioni CRUD (Create, Read, Update, Delete) per l'entità `CondizionePagamento`.

**Analisi Dettagliata**:
*   **Interfaccia `CondizionePagamento`**: Definisce un tipo locale per l'entità. Questo è un punto da notare, poiché sarebbe preferibile usare un tipo condiviso con il backend.
*   **`getCondizioniPagamento()`**: Invia una richiesta `GET` a `/api/condizioni-pagamento` per recuperare l'elenco di tutte le condizioni di pagamento.
*   **`createCondizionePagamento(data)`**: Invia una richiesta `POST` per creare una nuova condizione di pagamento.
*   **`updateCondizionePagamento(id, data)`**: Invia una richiesta `PUT` per aggiornare una condizione di pagamento esistente, identificata dal suo `id`.
*   **`deleteCondizionePagamento(id)`**: Invia una richiesta `DELETE` per eliminare una condizione di pagamento.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/condizioniPagamento.ts`.
*   **Utilizzato da**: `CondizioniPagamentoTable.tsx` attraverso l'hook `useCrudTable` per gestire tutte le operazioni sulla tabella.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Modulo API standard per la gestione della risorsa `CondizionePagamento`. La definizione di un tipo locale `CondizionePagamento` invece di importarlo da un'area condivisa (come `@shared-types` o `@prisma/client`) è una potenziale fonte di disallineamento tra frontend e backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/conti.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `Conto` e funzionalità specifiche per la configurazione della rilevanza analitica.

**Analisi Dettagliata**:
*   **`ContoWithRelations`**: Definisce un tipo che include la relazione con `vociAnalitiche`, rispecchiando la struttura dati restituita dal backend.
*   **`getConti(params)`**: Funzione per recuperare i conti in modo paginato, con supporto per filtri e ordinamento.
*   **`createConto(conto)` / `updateConto(id, conto)` / `deleteConto(id)`**: Funzioni CRUD standard.
*   **`toggleContoRelevance(id, isRilevante)`**: Funzione specifica che invia una richiesta `PATCH` all'endpoint `/api/conti/:id/toggle-rilevanza`. Questa è un'azione mirata che modifica solo il flag booleano `isRilevantePerCommesse`, senza dover inviare l'intero oggetto `Conto`.
*   **`getContiPerSelezione()`**: Funzione ottimizzata che chiama l'endpoint `/api/conti/select` per recuperare solo i campi necessari (`id`, `codice`, `nome`) per popolare le dropdown, migliorando le performance.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/conti.ts`.
*   **Utilizzato da**: `ContiTable.tsx` per le operazioni CRUD e `ContiRelevanceForm.tsx` per la funzione `toggleContoRelevance`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: L'uso di un endpoint `PATCH` per `toggleContoRelevance` è una buona pratica RESTful, poiché modifica solo un attributo specifico della risorsa. La funzione `getContiPerSelezione` è un altro esempio di ottimizzazione per ridurre il carico di dati non necessari sull'interfaccia utente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/database.ts**

**Scopo Principale**: Contiene funzioni per operazioni a livello di intere tabelle del database, come lo svuotamento.

**Analisi Dettagliata**:
*   **`clearScrittureContabili()`**: Invia una richiesta `DELETE` all'endpoint `/api/database/scritture`. Questa funzione è utilizzata per pulire completamente la tabella delle scritture contabili e le relative tabelle collegate (allocazioni, righe iva).
*   **`clearCondizioniPagamento()`**: Invia una richiesta `DELETE` all'endpoint `/api/database/condizioni-pagamento` per svuotare la tabella corrispondente.
*   **Gestione Toast**: Entrambe le funzioni integrano la visualizzazione di notifiche (toast) all'utente per comunicare l'esito dell'operazione, sia in caso di successo che di errore.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/database.ts`.
*   **Utilizzato da**: Componenti di amministrazione come `ScrittureTable.tsx` e `CondizioniPagamentoTable.tsx` per fornire funzionalità di pulizia all'utente.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file raggruppa operazioni "pericolose" o di manutenzione. È una buona pratica isolarle in un modulo dedicato per gestirle con maggiore attenzione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/fornitori.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `Fornitore`.

**Analisi Dettagliata**:
*   Implementa le funzioni standard `getFornitori`, `createFornitore`, `updateFornitore`, `deleteFornitore`.
*   La gestione degli errori è robusta, cercando di estrarre messaggi specifici dalle risposte del backend in caso di fallimento.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/fornitori.ts`.
*   **Utilizzato da**: `FornitoriTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Modulo API standard per la risorsa `Fornitore`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/importTemplates.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `ImportTemplate`.

**Analisi Dettagliata**:
*   **`ImportTemplateWithRelations`**: Definisce un tipo che include la relazione con `fieldDefinitions`.
*   Implementa le funzioni CRUD standard: `getImportTemplates`, `createImportTemplate`, `updateImportTemplate`, `deleteImportTemplate`.
*   La funzione `createImportTemplate` e `updateImportTemplate` gestiscono correttamente l'invio dei dati annidati (`fieldDefinitions`).

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/importTemplates.ts`.
*   **Utilizzato da**: `ImportTemplatesAdmin.tsx` per gestire la configurazione dei template di importazione.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo modulo permette all'interfaccia di amministrazione di modificare dinamicamente le regole di parsing dei file, che è una funzionalità molto potente e flessibile.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/reconciliation.ts**

**Scopo Principale**: Contiene le funzioni per interagire con il processo di riconciliazione del backend.

**Analisi Dettagliata**:
*   **Tipi Condivisi**: Importa i tipi `ReconciliationSummary`, `RigaDaRiconciliare`, `ReconciliationResult` da `@shared-types/index`, garantendo coerenza tra frontend e backend.
*   **`runReconciliation()`**: Invia una richiesta `POST` all'endpoint `/reconciliation/run`. Questa chiamata non invia dati, ma funge da "trigger" per avviare il processo di analisi sul server.
*   **`saveManualAllocation(payload)`**: Invia una richiesta `POST` a `/reconciliation/manual-allocation` con i dati dell'allocazione manuale inseriti dall'utente. Il payload contiene l'ID della riga da allocare e un array di allocazioni.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/reconciliation.ts`.
*   **Utilizzato da**: La pagina `Riconciliazione.tsx` per avviare il processo e salvare le allocazioni manuali.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo modulo è il punto di contatto per una delle logiche di business più importanti. `runReconciliation` è un'azione di comando, mentre `saveManualAllocation` è un'operazione di scrittura dati.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/registrazioni.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `ScritturaContabile` (chiamata "Registrazione" nel frontend).

**Analisi Dettagliata**:
*   Implementa le funzioni standard `getRegistrazioni`, `getRegistrazioneById`, `addRegistrazione`, `updateRegistrazione`, `deleteRegistrazione`.
*   La funzione `updateRegistrazione` è particolarmente complessa, poiché deve gestire l'aggiornamento, la creazione e l'eliminazione delle righe e delle allocazioni annidate all'interno di una singola transazione, come si vede nell'implementazione del backend in `server/routes/registrazioni.ts`.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/registrazioni.ts`.
*   **Utilizzato da**: `PrimaNota.tsx` e `NuovaRegistrazionePrimaNota.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La gestione delle scritture contabili è complessa a causa delle sue relazioni annidate. La logica di aggiornamento nel backend (`server/routes/registrazioni.ts`) che gestisce le righe da creare, aggiornare ed eliminare è un punto critico da comprendere.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/regoleRipartizione.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `RegolaRipartizione`.

**Analisi Dettagliata**:
*   **`RegolaRipartizioneInput`**: Riesporta il tipo Zod definito in `schemas/regolaRipartizioneSchema.ts`, garantendo che i dati inviati al backend siano validati prima della chiamata API.
*   Implementa le funzioni CRUD standard: `getRegoleRipartizione`, `createRegolaRipartizione`, `updateRegolaRipartizione`, `deleteRegolaRipartizione`.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/regoleRipartizione.ts`.
*   **Utilizzato da**: `RegoleRipartizioneManager.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: L'uso di uno schema Zod condiviso per la validazione del form e la tipizzazione dell'input della API è una pratica eccellente che riduce gli errori e migliora la coerenza.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/api/vociAnalitiche.ts**

**Scopo Principale**: Fornisce le funzioni CRUD per l'entità `VoceAnalitica`.

**Analisi Dettagliata**:
*   Implementa le funzioni CRUD standard: `getVociAnalitiche`, `createVoceAnalitica`, `updateVoceAnalitica`, `deleteVoceAnalitica`.
*   Include la funzione ottimizzata `getVociAnalitichePerSelezione` per popolare le dropdown.
*   Le funzioni `create` e `update` gestiscono l'invio di `contiIds`, un array di ID per gestire la relazione molti-a-molti con i conti.

**Interazioni e Connessioni**:
*   **Consuma API**: Interagisce con gli endpoint definiti in `server/routes/vociAnalitiche.ts`.
*   **Utilizzato da**: `VociAnaliticheManager.tsx` e vari form che necessitano di selezionare una voce analitica.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La gestione della relazione molti-a-molti (`contiIds`) è un dettaglio implementativo importante da notare. Il backend dovrà interpretare questo array per creare o aggiornare correttamente i collegamenti nella tabella di join.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/pages**

**Scopo Principale della Cartella**: Questa directory contiene i componenti React che rappresentano le pagine complete dell'applicazione. Ogni file qui corrisponde a una rotta specifica definita in `App.tsx`. Queste pagine orchestrano la visualizzazione dei dati, gestiscono lo stato a livello di pagina e assemblano componenti più piccoli (da `/src/components`) per costruire l'interfaccia utente finale.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/impostazioni/ConfigurazioneConti.tsx**

**Scopo Principale**: Fornisce l'interfaccia utente per configurare quali conti del piano dei conti sono rilevanti per il controllo di gestione delle commesse.

**Analisi Dettagliata**:
*   **Componente Principale**: `ConfigurazioneContiPage`.
*   **Logica**: Questo componente è un semplice "wrapper". La sua unica responsabilità è renderizzare il titolo della pagina e il componente `ContiRelevanceForm` da `/src/components/admin/ContiRelevanceForm.tsx`, che contiene tutta la logica di visualizzazione e interazione.
*   **Separazione delle Responsabilità**: La struttura è ottima. La pagina (`Page`) si occupa del layout generale della sezione, mentre il componente (`Form`) si occupa della logica specifica della tabella e delle interazioni.

**Interazioni e Connessioni**:
*   **Importa**: Il componente `ContiRelevanceForm`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/impostazioni/conti`.

**Appunti per il Manuale**:
*   **(Utente)**: "In questa sezione, puoi specificare quali conti di costo e ricavo devono essere presi in considerazione durante l'allocazione dei movimenti alle commesse. Abilitando un conto, ogni movimento registrato su di esso dovrà essere associato a una commessa."
*   **(Sviluppatore)**: Questa pagina è un "container" per il componente `ContiRelevanceForm`. La logica di business (chiamate API per attivare/disattivare la rilevanza) è incapsulata all'interno di `ContiRelevanceForm`, mantenendo questo componente di pagina pulito e focalizzato sulla presentazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/impostazioni/RegoleRipartizione.tsx**

**Scopo Principale**: Fornisce l'interfaccia utente per la gestione delle regole di ripartizione automatica dei costi/ricavi.

**Analisi Dettagliata**:
*   **Componente Principale**: `RegoleRipartizionePage`.
*   **Logica**: Simile alla pagina precedente, funge da contenitore per il componente `RegoleRipartizioneManager`, che gestisce la logica CRUD (Create, Read, Update, Delete) per le regole.
*   **Struttura**: Presenta un titolo e renderizza il componente manager.

**Interazioni e Connessioni**:
*   **Importa**: Il componente `RegoleRipartizioneManager`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/impostazioni/regole-ripartizione`.

**Appunti per il Manuale**:
*   **(Utente)**: "Qui puoi creare regole per automatizzare l'allocazione di costi e ricavi. Ad esempio, puoi impostare una regola per cui 'il 100% dei costi del conto X va sempre alla commessa Y sulla voce Z', semplificando il processo di riconciliazione."
*   **(Sviluppatore)**: Pagina contenitore. La logica di interazione con le API per le regole di ripartizione è gestita interamente da `RegoleRipartizioneManager`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/impostazioni/VociAnalitiche.tsx**

**Scopo Principale**: Fornisce l'interfaccia utente per la gestione delle voci analitiche (categorie di costo/ricavo).

**Analisi Dettagliata**:
*   **Componente Principale**: `VociAnalitichePage`.
*   **Logica**: È un wrapper che mostra un titolo e delega tutta la funzionalità al componente `VociAnaliticheManager`.

**Interazioni e Connessioni**:
*   **Importa**: Il componente `VociAnaliticheManager`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/impostazioni/voci-analitiche`.

**Appunti per il Manuale**:
*   **(Utente)**: "Le voci analitiche sono le categorie utilizzate per classificare costi e ricavi (es. 'Materiali', 'Manodopera', 'Consulenze'). In questa sezione puoi creare, modificare o eliminare queste categorie."
*   **(Sviluppatore)**: Pagina contenitore. La logica si trova in `VociAnaliticheManager`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/AuditTrail.tsx**

**Scopo Principale**: Visualizza il registro di tutte le modifiche e operazioni effettuate nel sistema, in particolare per le allocazioni.

**Analisi Dettagliata**:
*   **Componente Principale**: `AuditTrailPage`.
*   **Logica**: Funge da contenitore per il componente `AuditTrail` da `/src/components/allocation/AuditTrail.tsx`.
*   **Struttura**: Definisce il layout della pagina con un'intestazione (`header`) che include un'icona e il titolo "Registro Modifiche", e un'area principale (`main`) dove viene renderizzato il componente `AuditTrail` che contiene la tabella e la logica di visualizzazione dei log.

**Interazioni e Connessioni**:
*   **Importa**: Il componente `AuditTrail`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/audit-trail`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina mostra uno storico completo di tutte le operazioni importanti eseguite nel sistema, come la creazione o modifica di allocazioni. È utile per tracciare chi ha fatto cosa e quando."
*   **(Sviluppatore)**: Pagina contenitore. La logica di recupero e visualizzazione dei log di audit è incapsulata nel componente `AuditTrail`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/CommessaDettaglio.tsx**

**Scopo Principale**: Mostra una vista di dettaglio completa per una singola commessa, con KPI, grafici e tabelle di movimenti.

**Analisi Dettagliata**:
*   **Recupero Dati**: Utilizza l'`useEffect` hook per caricare tutti i dati necessari al primo render: i dettagli della commessa specifica (tramite `useParams` per ottenere l'ID dall'URL), l'elenco di tutte le commesse, le voci analitiche, le registrazioni e i dati di performance.
*   **Stato**: Gestisce numerosi stati locali (`commessa`, `commessaPerformance`, `vociAnalitiche`, `isLoading`).
*   **Logica di Business nel Frontend**: Contiene funzioni per calcolare e formattare dati (es. `formatCurrency`, `getHealthStatus`, `prepareChartData`). Questo indica che una parte della logica di presentazione e calcolo dei KPI risiede nel client.
*   **Componenti Assemblati**: Utilizza componenti specializzati da `/src/components/commesse` come `StatusIndicators` e `CommessaActionMenu` per costruire l'interfaccia.
*   **Interfaccia a Tab**: Usa il componente `Tabs` di shadcn/ui per suddividere le informazioni in sezioni: Panoramica, Analisi Finanziaria, Budget e Movimenti.
*   **Visualizzazione Dati**: Utilizza `recharts` per creare grafici (LineChart, BarChart, PieChart) e una `Table` per mostrare i movimenti allocati a quella commessa.
*   **Navigazione**: Fornisce link per tornare all'elenco delle commesse e per navigare ai dettagli di una specifica registrazione contabile.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, API da `@/api`, tipi da `@prisma/client`.
*   **Consuma API**: `getCommesse`, `getVociAnalitiche`, `getRegistrazioni`, `getCommesseWithPerformance`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/commesse/:id`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina è il cruscotto di una singola commessa. Qui puoi vedere a colpo d'occhio la sua salute finanziaria (margine, avanzamento), analizzare i trend di costi e ricavi nel tempo e visualizzare l'elenco di tutti i movimenti contabili che le sono stati attribuiti."
*   **(Sviluppatore)**: Questo è un componente "intelligente" e complesso. Gestisce un notevole caricamento di dati e contiene logica di presentazione. La funzione `prepareChartData` che simula i dati di trend è un punto da notare: in una versione futura, questi dati dovrebbero provenire direttamente dal backend per una maggiore accuratezza.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Commesse.tsx**

**Scopo Principale**: Visualizza l'elenco gerarchico di tutte le commesse principali (Comuni) e le relative attività (commesse figlie).

**Analisi Dettagliata**:
*   **Recupero Dati**: Utilizza `useEffect` per caricare i dati delle commesse con le loro performance tramite la funzione `getCommesseWithPerformance`.
*   **Struttura Gerarchica**: Il componente filtra i dati ricevuti per isolare le `commessePrincipali` (quelle senza `parentId`) e poi, per ognuna, renderizza le `attivitaAssociate` (le commesse figlie).
*   **Componente `Accordion`**: Utilizza il componente `Accordion` di shadcn/ui per creare una vista a espansione, dove ogni `AccordionItem` rappresenta una commessa padre.
*   **Visualizzazione Consolidata**: Per ogni commessa padre, mostra i KPI consolidati (che includono i totali delle figlie), mentre per le figlie mostra i dati specifici.
*   **Azioni Rapide**: Integra i componenti `CommessaActionMenu` e `QuickActions` per fornire un accesso rapido alle operazioni comuni (dettagli, modifica budget, ecc.) direttamente dalla lista.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `getCommesseWithPerformance` dall'API, componenti specifici come `StatusIndicators` e `CommessaActionMenu`.
*   **Consuma API**: `getCommesseWithPerformance`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/commesse`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina offre una visione d'insieme di tutti i progetti principali (Comuni). Puoi espandere ogni comune per vedere le attività specifiche associate e confrontare rapidamente le loro performance finanziarie."
*   **(Sviluppatore)**: La logica di consolidamento dei dati (somma dei ricavi/costi/budget delle figlie nel padre) è attualmente eseguita nel frontend (`server/routes/commesseWithPerformance.ts`). Questo è un dettaglio importante: se le performance dovessero essere ricalcolate, la logica si trova nel backend. La pagina si occupa solo di visualizzare questi dati pre-aggregati.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/ComparativeAnalysis.tsx**

**Scopo Principale**: Fornisce un'interfaccia avanzata per confrontare le performance di più commesse selezionate dall'utente.

**Analisi Dettagliata**:
*   **Gestione Stato Complessa**: Utilizza `useState` per gestire molteplici filtri: `comparisonType`, `selectedMetric`, `selectedCommesse`, `timeRange`, `searchTerm`, `clienteFilter`, `statoFilter`, `margineFilter`.
*   **Filtri Dinamici**: Usa `useEffect` per ricalcolare `filteredCommesse` ogni volta che i dati originali o uno dei filtri cambia.
*   **Selezione Multipla**: Permette all'utente di selezionare quali commesse includere nell'analisi tramite checkbox.
*   **Dati Derivati**: Utilizza `useMemo` per calcolare i dati per i grafici (`performanceData`, `temporalData`, `radarData`) solo quando le dipendenze cambiano, ottimizzando le performance.
*   **Visualizzazione Multipla**: Offre diverse modalità di confronto (`performance`, `temporal`, `benchmark`) attraverso un componente `Tabs`, ognuna con grafici specifici (`BarChart`, `ScatterChart`, `LineChart`, `RadarChart`).
*   **Dati di Benchmark**: Include dati di benchmark statici (`benchmarkData`) per confrontare le performance delle commesse con le medie di settore.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `getCommesseWithPerformance` dall'API, componenti specifici come `ComparativeView` e `StatusIndicators`.
*   **Consuma API**: `getCommesseWithPerformance`.
*   **Renderizzato da**: Non è presente in `App.tsx`, quindi potrebbe essere una pagina in sviluppo o accessibile da un'altra parte dell'applicazione (es. un pulsante nella pagina Commesse).

**Appunti per il Manuale**:
*   **(Utente)**: "Questa potente schermata ti permette di mettere a confronto diretto più commesse. Puoi analizzare le loro performance su diverse metriche (margine, budget, ROI), vedere come si sono comportate nel tempo e confrontarle con le medie del settore."
*   **(Sviluppatore)**: Questo è un componente molto complesso che gestisce una grande quantità di stato e logica di visualizzazione nel frontend. I dati di benchmark sono attualmente hard-coded; in futuro potrebbero provenire da un'API. La logica di filtraggio e calcolo dei dati derivati è un ottimo esempio di come `useEffect` e `useMemo` possano essere usati per creare interfacce reattive e performanti.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Dashboard.tsx**

**Scopo Principale**: Fornisce una panoramica di alto livello dello stato di salute di tutte le commesse e dei principali indicatori di performance (KPI).

**Analisi Dettagliata**:
*   **Recupero Dati**: Carica i dati aggregati tramite la funzione `getDashboardData`.
*   **Layout a Componenti**: La pagina è costruita assemblando componenti specializzati e riutilizzabili dalla cartella `/src/components/dashboard`:
    *   `CompactHeader`: Mostra i KPI principali e i controlli dei filtri.
    *   `HierarchicalCommesseTable`: Mostra la tabella gerarchica delle commesse.
    *   `SidebarPanel`: Un pannello laterale con statistiche rapide e alert.
    *   `MainChartsSection`: Contiene i grafici principali sui trend.
*   **Gestione Filtri**: Lo stato dei filtri (`filters`) è gestito qui e passato come prop ai componenti figli (`CompactHeader`), che a loro volta notificano le modifiche tramite la callback `onFiltersChange`.
*   **Dati Filtrati**: Utilizza `useMemo` per calcolare `filteredCommesse` in base ai filtri attivi, garantendo che i componenti figli ricevano sempre i dati corretti senza ricalcoli inutili.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI e componenti specifici della dashboard.
*   **Consuma API**: `getDashboardData`.
*   **Renderizzato da**: `App.tsx` come pagina principale (rotta `/`).

**Appunti per il Manuale**:
*   **(Utente)**: "La Dashboard è il tuo punto di partenza. Ti offre una visione immediata dei principali indicatori finanziari, ti avvisa se ci sono problemi critici e ti permette di vedere a colpo d'occhio la performance di tutte le tue commesse."
*   **(Sviluppatore)**: Questa pagina è un ottimo esempio di "Container Component". La sua responsabilità principale è recuperare i dati e gestire lo stato (filtri), mentre delega la visualizzazione a componenti "dumb" o di presentazione. Questo rende il codice pulito e facile da mantenere.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Database.tsx**

**Scopo Principale**: Fornisce un'interfaccia di amministrazione per visualizzare e gestire direttamente i dati di produzione e i template di importazione.

**Analisi Dettagliata**:
*   **Interfaccia a Tab**: Utilizza `TabbedViewLayout` per separare la gestione dei dati (`Gestione Dati`) dalla gestione dei template (`Gestione Template Import`).
*   **Recupero Statistiche**: Chiama l'API `/api/database/stats` per ottenere i conteggi dei record per ogni tabella e mostrarli come badge nelle linguette dei tab.
*   **Componenti Tabella**: Ogni tab renderizza un componente tabella specifico (es. `ClientiTable`, `CommesseTable`, `ContiTable`) che incapsula la logica per quella specifica entità.
*   **Gestione Template**: Il secondo tab renderizza `ImportTemplatesAdmin`, un componente dedicato alla gestione CRUD dei template di importazione.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `TabbedViewLayout`, e tutti i componenti tabella da `/src/components/database`.
*   **Consuma API**: `getDatabaseStats`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/database`.

**Appunti per il Manuale**:
*   **(Utente)**: "La sezione Database ti permette di consultare direttamente tutte le anagrafiche del sistema (clienti, fornitori, piano dei conti, ecc.). È uno strumento utile per la verifica e la ricerca puntuale dei dati."
*   **(Sviluppatore)**: Questa pagina funge da "hub" per tutti i componenti di gestione delle tabelle. La logica è ben incapsulata: la pagina recupera solo le statistiche generali, mentre ogni componente tabella gestisce le proprie chiamate API per dati, paginazione e operazioni CRUD.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Import.tsx**

**Scopo Principale**: Fornisce l'interfaccia utente per l'importazione dei file di anagrafica e delle scritture contabili.

**Analisi Dettagliata**:
*   **Separazione Logica**: L'interfaccia è divisa in due `Card` distinte: una per le anagrafiche e una per le scritture contabili.
*   **Import Anagrafiche**:
    *   Usa un `Select` per permettere all'utente di specificare il tipo di anagrafica da importare (es. 'Piano dei Conti', 'Codici IVA').
    *   L'endpoint della API viene costruito dinamicamente in base alla selezione (`/api/v2/import/${selectedAnagraficaTemplate}`).
*   **Import Scritture**:
    *   Usa un input file con l'attributo `multiple` per permettere il caricamento simultaneo di tutti i file necessari (PNTESTA, PNRIGCON, ecc.).
    *   La logica `handleScrittureImport` costruisce un `FormData` e associa ogni file al `fieldname` corretto atteso dal backend.
*   **Feedback Utente**: Utilizza `react-sonner` (tramite l'hook `useToast`) per fornire feedback immediato sull'esito delle operazioni di importazione.
*   **Report di Importazione**: Dopo un'importazione di scritture, visualizza una sezione di report dettagliata (`importReport`) che mostra statistiche e potenziali problemi, come la creazione di conti o fornitori "segnaposto".

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `axios` per le chiamate API.
*   **Consuma API**: Chiama gli endpoint sotto `/api/v2/import/`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/import`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa è la pagina da cui si caricano i dati dal gestionale esterno. È fondamentale seguire l'ordine: prima tutte le anagrafiche (clienti, conti, ecc.) e solo dopo le scritture contabili. Il sistema ti fornirà un resoconto dettagliato di ogni importazione."
*   **(Sviluppatore)**: La pagina utilizza le API v2, che sono gestite dal nuovo `Import Engine`. La logica di gestione dei file multipli per le scritture è un punto chiave. La visualizzazione del report post-importazione è una feature importante per la trasparenza del processo.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Impostazioni.tsx**

**Scopo Principale**: Pagina di ingresso per le operazioni di amministrazione del sistema, in particolare quelle che riguardano il database.

**Analisi Dettagliata**:
*   **Componente `SystemOperations`**: La logica e la UI sono state spostate nel componente `SystemOperations`. Questa pagina ora è un semplice wrapper.
*   **Azioni Critiche**: Fornisce accesso a due operazioni "pericolose":
    1.  **Azzera e Ripopola Database**: Esegue un reset completo del database, cancellando tutti i dati e ripopolandolo con i dati di `seed.ts`.
    2.  **Crea Backup Database**: Avvia un processo di backup del database sul server.
*   **Dialog di Conferma**: Utilizza il componente `AlertDialog` per chiedere una conferma esplicita all'utente prima di eseguire l'operazione di reset, una pratica di sicurezza fondamentale.
*   **Feedback**: Usa `useToast` per notificare l'utente dell'esito delle operazioni.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `useToast`, e le funzioni API `resetDatabase` e `backupDatabase`.
*   **Consuma API**: `/api/system/reset-database` e `/api/system/backup`.
*   **Renderizzato da**: `App.tsx` quando l'URL corrisponde a `/impostazioni`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa sezione contiene strumenti di amministrazione avanzati. L'opzione 'Azzera Database' deve essere usata con estrema cautela, poiché cancella tutti i dati. È consigliabile creare sempre un backup prima di procedere."
*   **(Sviluppatore)**: Questa pagina espone funzionalità di amministrazione critiche. La logica è semplice e diretta, ma le operazioni che invoca sul backend sono molto potenti.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Index.tsx**

**Scopo Principale**: Funge da componente di ingresso per la rotta radice (`/`).

**Analisi Dettagliata**:
*   Questo componente è un semplice wrapper che renderizza la pagina `Dashboard`.
*   È una pratica comune per mantenere pulito il file `App.tsx` e definire la pagina di default in un file separato.

**Interazioni e Connessioni**:
*   **Importa**: `Dashboard`.
*   **Renderizzato da**: `App.tsx` per la rotta `/`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Componente puramente strutturale. Definisce che la `Dashboard` è la pagina principale dell'applicazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/NotFound.tsx**

**Scopo Principale**: Visualizza una pagina di errore 404 quando l'utente naviga verso una rotta non esistente.

**Analisi Dettagliata**:
*   **Hook `useLocation`**: Utilizza l'hook di `react-router-dom` per ottenere il percorso non trovato.
*   **Logging dell'Errore**: Usa `useEffect` per loggare un errore nella console dello sviluppatore ogni volta che la pagina viene renderizzata. Questo è utile per il debugging per scoprire link non funzionanti o errori di navigazione.
*   **UI Semplice**: Mostra un messaggio di errore chiaro e un link per tornare alla homepage.

**Interazioni e Connessioni**:
*   **Renderizzato da**: `App.tsx` quando nessuna delle altre rotte corrisponde all'URL (`path="*"`).

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Pagina di fallback standard. Il logging dell'URL non trovato è una piccola ma utile aggiunta per il debugging.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/NuovaCommessa.tsx**

**Scopo Principale**: Fornisce il form per la creazione di una nuova commessa.

**Analisi Dettagliata**:
*   **Controllo Prerequisiti**: Prima di mostrare il form, usa `useEffect` per chiamare l'endpoint `/api/system/status` e verificare se i dati necessari (Clienti, Voci Analitiche) sono presenti. Se mancano, mostra un messaggio di avviso (`Alert`) con un link alla pagina di importazione. Questo previene errori e guida l'utente.
*   **Form Complesso**: Utilizza `react-hook-form` con `zodResolver` per una validazione robusta basata sullo `formSchema`.
*   **Array di Campi Dinamici**: Usa `useFieldArray` per gestire la sezione del budget, permettendo all'utente di aggiungere o rimuovere dinamicamente le voci di budget (coppia voce analitica - importo).
*   **Componenti Asincroni**: Popola le dropdown per "Cliente" e "Voce Analitica" utilizzando `useQuery` di TanStack Query per recuperare i dati in modo asincrono, mostrando uno stato di caricamento se necessario.
*   **Logica di Submit**: La funzione `onSubmit` invia i dati validati del form all'endpoint `POST /api/commesse`.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `react-hook-form`, `zod`, `axios`, `useQuery`.
*   **Consuma API**: `/api/system/status`, `/api/clienti`, `/api/voci-analitiche`, `POST /api/commesse`.
*   **Renderizzato da**: Non è presente in `App.tsx`, quindi probabilmente è una pagina in sviluppo o accessibile da un pulsante "Nuova Commessa" nella pagina `/commesse`.

**Appunti per il Manuale**:
*   **(Utente)**: "Per creare una nuova commessa, devi prima aver importato almeno le anagrafiche dei clienti e le voci analitiche. In questa pagina, inserisci i dati principali della commessa e definisci il suo budget iniziale, suddividendolo per le diverse categorie di costo e ricavo."
*   **(Sviluppatore)**: Questo componente è un ottimo esempio di form complesso in React. La gestione dei prerequisiti prima del rendering del form è una best practice per una buona UX. L'uso di `useFieldArray` è la soluzione standard per gestire input dinamici.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/NuovaRegistrazionePrimaNota.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa per la creazione e la modifica di una scrittura contabile manuale, inclusa l'allocazione analitica.

**Analisi Dettagliata**:
*   **Modalità Duale (Crea/Modifica)**: Il componente rileva la presenza di un `:id` nell'URL (`useParams`) per determinare se operare in modalità di creazione o di modifica.
*   **Caricamento Dati Massivo**: In `useEffect`, carica tutti i dati necessari per le dropdown (commesse, conti, causali, voci analitiche) e, in modalità modifica, carica i dati della registrazione specifica.
*   **Gestione Stato Complessa**: Utilizza `useState` per gestire lo stato della registrazione (`registrazione`), dei dati primari per gli automatismi (`datiPrimari`), delle selezioni (`causaleSelezionata`), e dello stato dei modali (`allocazioneRigaId`).
*   **Generazione Automatica**: Implementa la logica `handleGeneraScrittura` che, data una causale e un totale, popola automaticamente le righe della scrittura contabile in base a un template associato alla causale.
*   **Gestione Righe Dinamica**: Permette di aggiungere (`addRigaContabile`) e rimuovere (`removeRigaContabile`) righe contabili dinamicamente.
*   **Logica di Allocazione**:
    *   Un pulsante `Split` apre un modale (`Dialog`) per l'allocazione di una singola riga di costo/ricavo.
    *   Il modale permette di suddividere l'importo della riga su più commesse e voci analitiche.
    *   Include la validazione che la somma delle allocazioni corrisponda al totale della riga.
*   **Validazione e Feedback**: Controlla lo sbilancio tra Dare e Avere e avvisa l'utente se una riga di costo/ricavo non è stata allocata prima di salvare.

**Interazioni e Connessioni**:
*   **Importa**: Numerosi componenti UI, API, hook.
*   **Consuma API**: `getCommesse`, `getPianoDeiConti`, `getCausaliContabili`, `getVociAnalitiche`, `getRegistrazioneById`, `addRegistrazione`, `updateRegistrazione`.
*   **Renderizzato da**: `App.tsx` per le rotte `/prima-nota/nuova` e `/prima-nota/modifica/:id`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina permette di inserire manualmente una registrazione contabile. Puoi usare le causali predefinite per generare automaticamente le scritture (es. per una fattura fornitore) o compilarle riga per riga. Per ogni riga di costo o ricavo, puoi cliccare sull'icona di ripartizione per allocare l'importo a una o più commesse."
*   **(Sviluppatore)**: Questo è probabilmente il componente più complesso del frontend. Gestisce uno stato locale molto articolato e contiene una significativa logica di business. La gestione del formato numerico con `displayValues` separati dallo stato numerico è una tecnica comune per gestire input formattati (es. con virgola decimale) senza interferire con i calcoli.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/PrimaNota.tsx**

**Scopo Principale**: Visualizza l'elenco di tutte le scritture contabili registrate nel sistema.

**Analisi Dettagliata**:
*   **Recupero Dati**: Carica l'elenco delle registrazioni e il piano dei conti all'avvio.
*   **Visualizzazione Tabellare**: Mostra i dati in una tabella HTML standard.
*   **Calcoli in-place**: La funzione `getTotaliScrittura` calcola il totale e lo sbilancio di ogni scrittura al momento del rendering.
*   **Logica di Controllo**: La funzione `checkAllocazioneMancante` verifica se una scrittura contiene righe di costo/ricavo che non sono state ancora allocate, mostrando un'icona di avviso.
*   **Azioni per Riga**: Fornisce pulsanti per visualizzare (non implementato), modificare (naviga a `NuovaRegistrazionePrimaNota`) ed eliminare una registrazione (con dialog di conferma).

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, API `registrazioni` e `conti`.
*   **Consuma API**: `getRegistrazioni`, `getPianoDeiConti`, `deleteRegistrazione`.
*   **Renderizzato da**: `App.tsx` per la rotta `/prima-nota`.

**Appunti per il Manuale**:
*   **(Utente)**: "Qui trovi l'elenco di tutte le operazioni contabili. Puoi vedere rapidamente se una registrazione è bilanciata ('Quadrata') e se richiede ancora un'allocazione alle commesse (icona di avviso)."
*   **(Sviluppatore)**: Questo componente rappresenta una versione più semplice di una tabella dati, senza paginazione o filtri avanzati, a differenza delle tabelle nella sezione Database. Potrebbe essere un candidato per essere refattorizzato utilizzando l'hook `useAdvancedTable` per coerenza.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Riconciliazione.tsx**

**Scopo Principale**: Guida l'utente nel processo di allocazione manuale delle righe contabili che non sono state riconciliate automaticamente.

**Analisi Dettagliata**:
*   **Flusso di Lavoro**:
    1.  L'utente clicca su "Avvia Analisi" (`handleRunReconciliation`).
    2.  Viene chiamata l'API `POST /reconciliation/run`.
    3.  Il backend analizza le scritture e restituisce un riepilogo (`ReconciliationSummary`) e un elenco di righe che richiedono un intervento (`righeDaRiconciliare`).
    4.  I dati vengono visualizzati in una `ReconciliationTable`.
    5.  L'utente seleziona una riga (`handleRowClick`).
    6.  Vengono mostrati i dettagli della riga e i suggerimenti intelligenti dal componente `SmartSuggestions`.
    7.  L'utente compila il form di allocazione (`AllocationForm`) e salva (`handleSaveAllocations`).
    8.  La riga salvata viene rimossa dalla lista e i contatori vengono aggiornati.
*   **Componenti Specializzati**: La pagina orchestra diversi componenti complessi: `ReconciliationSummary`, `ReconciliationTable`, `SmartSuggestions`, `AllocationForm`.
*   **Stato Reattivo**: Lo stato `reconciliationResult` viene aggiornato dopo il salvataggio per rimuovere la riga completata, fornendo un feedback immediato all'utente.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, componenti specifici da `/src/components/admin` e `/src/components/allocation`.
*   **Consuma API**: `/reconciliation/run`, `/reconciliation/finalize`, `/smart-allocation/suggest`, `/smart-allocation/learn`.
*   **Renderizzato da**: `App.tsx` per la rotta `/riconciliazione`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina è il cuore del controllo di gestione. Dopo aver avviato l'analisi, il sistema ti mostrerà tutti i movimenti di costo e ricavo che non è riuscito ad allocare automaticamente. Seleziona ogni riga, usa i suggerimenti intelligenti se disponibili, e assegna l'importo alla commessa e alla voce analitica corretta."
*   **(Sviluppatore)**: Questa pagina implementa un flusso di lavoro interattivo complesso. La comunicazione tra i componenti (la tabella che seleziona una riga, il form che la riceve) è gestita tramite lo stato del componente `RiconciliazionePage`. L'integrazione con `SmartSuggestions` mostra un'architettura pronta per funzionalità di machine learning.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/pages/Staging.tsx**

**Scopo Principale**: Fornisce un'interfaccia per visualizzare i dati grezzi importati nelle tabelle di staging, prima che vengano finalizzati e trasferiti nel database di produzione.

**Analisi Dettagliata**:
*   **Layout a Tab**: Utilizza un componente personalizzato `TabbedViewLayout` per mostrare ogni tabella di staging in una scheda separata.
*   **Statistiche**: Chiama l'endpoint `/api/staging/stats` per recuperare il numero di record in ogni tabella di staging e lo visualizza come badge su ogni tab.
*   **Componenti Tabella Staging**: Ogni tab renderizza un componente tabella specifico (es. `StagingScrittureTable`, `StagingContiTable`) che è responsabile di recuperare e visualizzare i dati per quella singola tabella di staging.
*   **Processo di Finalizzazione**:
    *   Il pulsante "Avvia Finalizzazione" (`handleFinalize`) avvia il processo sul backend.
    *   Mostra un `AlertDialog` con il componente `FinalizationStatus`.
    *   `FinalizationStatus` si connette a un endpoint SSE (Server-Sent Events) (`/api/staging/events`) per ricevere aggiornamenti in tempo reale sullo stato di avanzamento del processo di finalizzazione, mostrando all'utente quale fase è in corso.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, `TabbedViewLayout`, e tutti i componenti tabella da `/src/components/database/Staging*`.
*   **Consuma API**: `/api/staging/stats`, `/api/staging/finalize`, e si connette all'endpoint SSE `/api/staging/events`.
*   **Renderizzato da**: `App.tsx` per la rotta `/staging`.

**Appunti per il Manuale**:
*   **(Utente)**: "Dopo aver importato un file, i dati vengono caricati in quest'area di 'pre-controllo'. Qui puoi verificare che i dati siano stati letti correttamente prima di renderli definitivi cliccando su 'Avvia Finalizzazione'."
*   **(Sviluppatore)**: L'uso di Server-Sent Events (SSE) per il feedback in tempo reale durante la finalizzazione è una scelta architetturale moderna e appropriata per processi asincroni di lunga durata. La pagina funge da orchestratore per i vari componenti di tabella di staging.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/admin**

**Scopo Principale della Cartella**: Questa directory raggruppa componenti React specifici per le funzionalità di amministrazione del sistema. Questi componenti sono utilizzati in pagine come "Impostazioni", "Database" e "Riconciliazione" per consentire agli utenti con privilegi elevati di configurare, gestire e monitorare i dati e le regole dell'applicazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/AllocationCell.tsx**

**Scopo Principale**: Fornisce un componente cella interattivo per la tabella di riconciliazione, permettendo l'allocazione rapida di una riga contabile a una commessa.

**Analisi Dettagliata**:
*   **Stato Locale**: Utilizza `useState` per gestire l'elenco delle commesse (`commesse`), la commessa selezionata dall'utente (`selectedCommessa`) e lo stato di caricamento (`isLoading`).
*   **Caricamento Dati**: All'interno di `useEffect`, esegue una chiamata API tramite `getCommesseForSelect` per popolare la dropdown delle commesse al momento del rendering del componente.
*   **Componenti UI**: Utilizza i componenti `Select` di shadcn/ui per creare il menu a tendina e un `Button` per salvare l'allocazione.
*   **Logica di Salvataggio (`handleSave`)**:
    1.  Controlla che una commessa sia stata selezionata.
    2.  Verifica la presenza di una `voceAnaliticaSuggeritaId` nella riga, che è un prerequisito per salvare.
    3.  Chiama la funzione API `saveManualAllocation` inviando l'ID della riga di staging, l'ID della voce analitica suggerita e l'allocazione (commessa selezionata e importo totale della riga).
    4.  Notifica l'esito dell'operazione all'utente tramite `toast`.
    5.  Chiama la funzione `onSaveSuccess` passata come prop per notificare al componente padre (la tabella) che l'operazione è andata a buon fine, permettendogli di rimuovere la riga dalla lista.

**Interazioni e Connessioni**:
*   **Importa**: `Row` da `@tanstack/react-table`, `RigaDaRiconciliare` e `saveManualAllocation` da `@/api/reconciliation`, `getCommesseForSelect` da `@/api/commesse`, e vari componenti UI.
*   **Utilizzato da**: `ReconciliationTable.tsx` (o un file di colonne come `riconciliazione-columns.tsx`) come cella personalizzata per la colonna delle azioni.
*   **Consuma API**: `/api/commesse/select` per ottenere la lista delle commesse. `/api/reconciliation/manual-allocation` per salvare l'allocazione.

**Appunti per il Manuale**:
*   **(Utente)**: "Nella tabella di riconciliazione, per ogni riga da allocare, è presente un menu a tendina che permette di assegnare rapidamente l'intero importo della riga a una specifica commessa."
*   **(Sviluppatore)**: Questo componente è un buon esempio di "cella intelligente" in una tabella. Incapsula la sua logica di fetching e salvataggio, comunicando con il componente padre tramite callback (`onSaveSuccess`). La dipendenza dalla `voceAnaliticaSuggeritaId` implica che il processo di analisi preliminare deve fornire questo suggerimento affinché l'allocazione rapida funzioni.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/AllocationForm.tsx**

**Scopo Principale**: Fornisce un form avanzato per l'allocazione di una singola riga contabile, permettendo la suddivisione (split) dell'importo su più commesse e voci analitiche.

**Analisi Dettagliata**:
*   **Stato Locale**: Gestisce un array di `allocations` che rappresenta le righe di suddivisione dell'importo.
*   **Sincronizzazione con Props**: Utilizza `useEffect` per inizializzare o resettare lo stato delle allocazioni ogni volta che la `scrittura` passata come prop cambia. Inizia con una singola riga di allocazione pre-compilata con l'intero importo della scrittura e la voce analitica suggerita.
*   **Logica di Suddivisione**:
    *   `handleAddSplit`: Aggiunge una nuova riga vuota all'array `allocations`.
    *   `handleRemoveSplit`: Rimuove una riga di allocazione.
    *   `handleAllocationChange`: Aggiorna lo stato di una specifica riga di allocazione quando l'utente modifica un campo (commessa, voce, importo).
*   **Validazione in Tempo Reale**: Usa `useMemo` per calcolare `totalAllocated` e `isTotalMismatch`. Questo permette di disabilitare il pulsante di salvataggio e mostrare un avviso se il totale delle allocazioni non corrisponde all'importo della scrittura.
*   **Logica di Salvataggio (`handleSave`)**:
    1.  Filtra le allocazioni per assicurarsi che siano complete (commessa, voce e importo definiti).
    2.  Controlla nuovamente che il totale corrisponda.
    3.  Se tutto è valido, chiama la funzione `onSave` passata come prop, inviando l'array di allocazioni finali.

**Interazioni e Connessioni**:
*   **Importa**: Tipi da `@shared-types/index`, componenti UI, `useToast`.
*   **Utilizzato da**: `Riconciliazione.tsx`, dove viene visualizzato quando un utente seleziona una riga da riconciliare.
*   **Consuma API**: Nessuna direttamente. La logica di salvataggio è delegata al componente padre tramite la callback `onSave`.

**Appunti per il Manuale**:
*   **(Utente)**: "Quando si seleziona una scrittura da allocare, appare un modulo dettagliato. Qui è possibile assegnare l'importo a una singola commessa o suddividerlo su più commesse e voci di costo/ricavo cliccando su 'Aggiungi Split'."
*   **(Sviluppatore)**: Questo è un componente "controllato" che gestisce uno stato complesso (un array di oggetti) e lo passa al genitore solo al momento del salvataggio. La validazione client-side sul totale dell'importo migliora l'esperienza utente prevenendo errori.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/ContiRelevanceForm.tsx**

**Scopo Principale**: Fornisce un'interfaccia tabellare per configurare quali conti del piano dei conti sono "rilevanti" per il controllo di gestione delle commesse.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Utilizza l'hook personalizzato per gestire la logica della tabella (paginazione, ricerca, ordinamento, filtri).
*   **Filtro per Tipo**: Include un componente `Select` per filtrare i conti per tipo (`Costo`, `Ricavo`), rendendo più facile la configurazione.
*   **Colonna `isRilevantePerCommesse`**:
    *   La colonna "Rilevante" contiene un componente `Switch`.
    *   Il `handleToggle` è definito direttamente all'interno della cella.
    *   Quando lo switch viene attivato/disattivato, chiama la funzione API `toggleContoRelevance`.
    *   In caso di successo, forza un `fetchData()` della tabella per mostrare lo stato aggiornato e visualizza un toast di conferma.

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, `toggleContoRelevance` dall'API, componenti UI.
*   **Utilizzato da**: `ConfigurazioneConti.tsx` nella sezione Impostazioni.
*   **Consuma API**: `/api/conti` per popolare la tabella e `/api/conti/:id/toggle-rilevanza` per aggiornare il flag.

**Appunti per il Manuale**:
*   **(Utente)**: "In questa schermata, è possibile specificare quali conti di costo e ricavo devono essere considerati nel calcolo della redditività delle commesse. Attivando l'interruttore 'Rilevante', quel conto verrà incluso nel processo di riconciliazione."
*   **(Sviluppatore)**: Questo componente dimostra un pattern efficace per la modifica "in-line" dei dati in una tabella. Invece di aprire un form modale, un'azione specifica (il toggle dello switch) scatena direttamente una chiamata API per aggiornare un singolo campo. Il refresh dei dati (`fetchData`) dopo l'operazione garantisce la coerenza della UI.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/FinalizationStatus.tsx**

**Scopo Principale**: Visualizza lo stato in tempo reale di un processo di finalizzazione dei dati di staging, utilizzando Server-Sent Events (SSE).

**Analisi Dettagliata**:
*   **Server-Sent Events (SSE)**: La logica chiave è in `useEffect`. Crea un'istanza di `EventSource` che si connette all'endpoint `/api/staging/events`.
    *   `onopen`: Gestisce l'apertura della connessione.
    *   `onmessage`: È il listener principale. Riceve i dati inviati dal server, li parsa (da JSON) e aggiorna lo stato del componente (`events` e `stepStatus`).
    *   `onerror`: Gestisce gli errori di connessione.
    *   **Cleanup**: La funzione di ritorno di `useEffect` chiude la connessione (`eventSource.close()`) quando il componente viene smontato, prevenendo memory leak.
*   **Stato Locale**:
    *   `events`: Un array che memorizza la cronologia di tutti gli eventi ricevuti.
    *   `stepStatus`: Un oggetto che mappa la chiave di ogni step (es. 'anagrafiche') al suo ultimo evento ricevuto, per un accesso rapido e per renderizzare lo stato corrente di ogni passaggio.
*   **Rendering Dinamico**: La UI itera su una costante `STEPS` e, per ogni step, visualizza l'icona e il messaggio corrispondenti allo stato attuale memorizzato in `stepStatus`.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`, dove viene mostrato all'interno di un `AlertDialog` quando l'utente avvia il processo di finalizzazione.
*   **Consuma API**: Si connette all'endpoint SSE `/api/staging/events`.

**Appunti per il Manuale**:
*   **(Utente)**: "Una volta avviata la finalizzazione, una finestra mostrerà l'avanzamento in tempo reale di ogni fase del processo, dal trasferimento delle anagrafiche fino alle scritture contabili."
*   **(Sviluppatore)**: Questo componente è un'implementazione client-side di una comunicazione real-time con il server tramite SSE. È una scelta eccellente per processi asincroni lunghi, poiché è più leggera dei WebSockets e permette al server di "spingere" aggiornamenti al client. La logica di gestione dello stato (`stepStatus`) è ben fatta per mostrare sempre l'ultimo aggiornamento per ogni fase.

---
---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/import-templates-columns.tsx**

**Scopo Principale**: Definisce la struttura e il rendering delle colonne per la tabella che visualizza i template di importazione.

**Analisi Dettagliata**:
*   **Funzione `getColumns`**: È una factory function che riceve come argomenti le callback `onEdit` e `onDelete`. Questo pattern permette di passare la logica di gestione degli eventi dal componente genitore (`ImportTemplatesAdmin`) direttamente alla definizione delle colonne, mantenendo il codice pulito e disaccoppiato.
*   **Definizione Colonne (`ColumnDef<ImportTemplate>`)**:
    *   **`name`**: Colonna per visualizzare il nome del template. Utilizza il componente `DataTableColumnHeader` per abilitare l'ordinamento.
    *   **`fieldDefinitions`**: Colonna calcolata che non mostra direttamente i dati, ma la loro lunghezza (`fields?.length || 0`). Questo fornisce un'informazione rapida sul numero di campi definiti per ogni template.
    *   **`actions`**: Colonna per le azioni. Utilizza il componente `DropdownMenu` di shadcn/ui per creare un menu contestuale per ogni riga. Le azioni "Modifica" ed "Elimina" invocano le callback `onEdit` e `onDelete` passate alla funzione `getColumns`, passando l'oggetto `template` della riga corrente.

**Interazioni e Connessioni**:
*   **Importa**: Tipi da `@tanstack/react-table`, `ImportTemplate` da `@prisma/client`, e vari componenti UI.
*   **Utilizzato da**: `ImportTemplatesAdmin.tsx`, che invoca `getColumns` per configurare la sua tabella.

**Appunti per il Manuale**:
*   **(Utente)**: La tabella dei template mostra il nome di ogni configurazione di importazione e quanti campi sono stati definiti per ciascuna. Un menu di azioni su ogni riga permette di modificarla o eliminarla.
*   **(Sviluppatore)**: L'uso di una factory function `getColumns` che accetta callback è una best practice per creare definizioni di colonne riutilizzabili e testabili, disaccoppiando la definizione della vista (le colonne) dalla logica di business (le funzioni `onEdit`/`onDelete`).

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/ImportTemplatesAdmin.tsx**

**Scopo Principale**: Componente manager che orchestra la visualizzazione e la gestione CRUD (Create, Read, Update, Delete) dei template di importazione.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Gestisce tutta la logica della tabella, inclusi stato di caricamento, paginazione, ricerca, ordinamento e fetching dei dati dall'endpoint `/api/import-templates`.
*   **Gestione Stato Modale**: Utilizza `useState` (`isDialogOpen`, `selectedTemplate`, `deletingTemplate`) per controllare l'apertura dei dialoghi per la creazione/modifica e per la conferma di eliminazione.
*   **Logica CRUD**:
    *   `handleEdit`: Imposta il template selezionato e apre il dialogo del form.
    *   `handleDelete`: Gestisce la logica di eliminazione, chiamando l'API `deleteImportTemplate` e mostrando un toast di notifica.
    *   `handleFormSubmit`: Funzione unica che gestisce sia la creazione (`createImportTemplate`) che l'aggiornamento (`updateImportTemplate`) in base alla presenza di `selectedTemplate`.
*   **Rendering**:
    *   Renderizza il componente `AdvancedDataTable`, passandogli le colonne e tutti i dati e le funzioni di callback necessari dall'hook `useAdvancedTable`.
    *   Renderizza il `TemplateFormDialog` per la modifica/creazione.
    *   Renderizza un `AlertDialog` per la conferma dell'eliminazione.

**Interazioni e Connessioni**:
*   **Importa**: Funzioni API da `@/api/importTemplates`, hook `useAdvancedTable`, componenti `AdvancedDataTable`, `TemplateFormDialog`, `AlertDialog`.
*   **Utilizzato da**: `Database.tsx`, dove viene renderizzato all'interno di una delle tab.
*   **Consuma API**: `/api/import-templates` (per GET, POST, PUT, DELETE).

**Appunti per il Manuale**:
*   **(Utente)**: "Questa sezione permette agli amministratori di configurare le regole con cui il sistema legge i file di testo. È possibile creare nuovi template, modificare quelli esistenti o eliminarli."
*   **(Sviluppatore)**: Questo componente è un ottimo esempio di come orchestrare la logica di una tabella CRUD complessa. Separa la logica di gestione dei dati (`useAdvancedTable`) dalla logica di interazione dell'utente (handler per edit/delete) e dalla UI (componenti `DataTable` e `Dialog`).

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/ReconciliationSummary.tsx**

**Scopo Principale**: Un componente di sola visualizzazione che presenta un riepilogo numerico dello stato del processo di riconciliazione.

**Analisi Dettagliata**:
*   **Componente Funzionale Semplice**: Riceve un oggetto `summary` di tipo `ReconciliationSummaryData` come prop.
*   **Struttura**: Utilizza un layout a griglia per mostrare quattro statistiche chiave:
    1.  `totalScrittureToProcess`: Totale scritture da analizzare.
    2.  `totalRigheToProcess`: Totale righe rilevanti all'interno di quelle scritture.
    3.  `reconciledAutomatically`: Quante righe sono state allocate automaticamente.
    4.  `needsManualReconciliation`: Quante righe richiedono un intervento manuale.
*   **Styling Condizionale**: Applica classi di colore diverse (es. `bg-green-50`, `bg-yellow-50`) per distinguere visivamente le statistiche positive da quelle che richiedono attenzione.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, tipo `ReconciliationSummaryData` da `@shared-types/index`.
*   **Utilizzato da**: `Riconciliazione.tsx`, dove viene visualizzato dopo che l'analisi di riconciliazione è stata eseguita.

**Appunti per il Manuale**:
*   **(Utente)**: "Dopo aver avviato l'analisi, un riepilogo mostra quante operazioni sono state gestite automaticamente dal sistema e quante richiedono la tua attenzione per essere allocate manualmente."
*   **(Sviluppatore)**: Componente "dumb" (o di presentazione) il cui unico scopo è renderizzare i dati che riceve. Non contiene logica di business o di stato.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/ReconciliationTable.tsx**

**Scopo Principale**: Visualizza la tabella delle righe contabili che necessitano di una riconciliazione manuale.

**Analisi Dettagliata**:
*   **Wrapper per `AdvancedDataTable`**: Questo componente è un wrapper specializzato attorno al componente generico `AdvancedDataTable`.
*   **Props**: Riceve i `data` (le righe da riconciliare), una callback `onRowClick` per gestire la selezione di una riga, e l'ID della riga attualmente selezionata (`selectedRowId`) per l'evidenziazione visiva.
*   **Colonne**: Importa la definizione delle colonne da `riconciliazione-columns.tsx`, mantenendo la configurazione della tabella separata.

**Interazioni e Connessioni**:
*   **Importa**: `AdvancedDataTable`, `riconciliazioneColumns`, `RigaDaRiconciliare`.
*   **Utilizzato da**: `Riconciliazione.tsx`, che gli passa i dati risultanti dal processo di analisi.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo componente dimostra come riutilizzare un componente generico (`AdvancedDataTable`) per un caso d'uso specifico, passandogli una configurazione di colonne su misura.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/RegolaRipartizioneForm.tsx**

**Scopo Principale**: Fornisce il form, all'interno di un dialogo modale, per creare o modificare una `RegolaRipartizione`.

**Analisi Dettagliata**:
*   **Form Management**: Utilizza `react-hook-form` con `zodResolver` per la gestione dello stato del form e la validazione basata sullo schema Zod `regolaRipartizioneSchema`.
*   **Stato Iniziale**: Usa `useEffect` per resettare i valori del form ogni volta che `initialData` cambia. Se `initialData` è presente, il form entra in modalità "modifica"; altrimenti, è in modalità "creazione".
*   **Componenti UI**: Utilizza componenti `Select` per permettere all'utente di scegliere `Conto`, `Commessa` e `VoceAnalitica` da liste pre-caricate.
*   **Submit**: La funzione `handleSubmit` del form è collegata alla prop `onSubmit`, delegando la logica di salvataggio al componente genitore.

**Interazioni e Connessioni**:
*   **Importa**: `react-hook-form`, `zodResolver`, `regolaRipartizioneSchema`, componenti UI.
*   **Utilizzato da**: `RegoleRipartizioneManager.tsx`, che lo renderizza e gli passa i dati e le callback necessarie.

**Appunti per il Manuale**:
*   **(Utente)**: "Da questa finestra è possibile creare o modificare una regola. È necessario specificare una descrizione, una percentuale e selezionare da menu a tendina il conto, la commessa e la voce analitica a cui applicare la regola."
*   **(Sviluppatore)**: Form standard basato su `react-hook-form` e `zod`. La logica è ben incapsulata e il componente è riutilizzabile sia per la creazione che per la modifica.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/regole-ripartizione-columns.tsx**

**Scopo Principale**: Definisce le colonne per la tabella che visualizza le regole di ripartizione.

**Analisi Dettagliata**:
*   **Factory Function `columns`**: Come per `import-templates-columns.tsx`, utilizza una funzione che accetta le callback `onEdit` e `onDelete` per disaccoppiare la vista dalla logica.
*   **Accesso a Dati Annidati**: Usa la notazione `accessorKey: 'conto.nome'` per accedere direttamente a proprietà di oggetti relazionati (es. il nome del conto associato), una funzionalità potente di `@tanstack/react-table`.
*   **Cella Azioni**: Implementa un `DropdownMenu` con le opzioni "Modifica" ed "Elimina" che invocano le rispettive callback.

**Interazioni e Connessioni**:
*   **Importa**: `ColumnDef` da `@tanstack/react-table`, `RegolaRipartizione` da `@prisma/client`, componenti UI.
*   **Utilizzato da**: `RegoleRipartizioneManager.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Esempio pulito di definizione di colonne per una tabella che visualizza dati relazionali. L'uso di `accessorKey` con notazione a punto semplifica notevolmente l'accesso ai dati annidati.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/RegoleRipartizioneManager.tsx**

**Scopo Principale**: Componente manager che orchestra la visualizzazione e la gestione CRUD delle `RegolaRipartizione`.

**Analisi Dettagliata**:
*   **Data Fetching**: Utilizza `@tanstack/react-query` (`useQuery`) per recuperare i dati necessari: le regole stesse, e le liste di conti, commesse e voci analitiche per popolare i `Select` nel form. Questo approccio gestisce automaticamente caching, refetching e stati di caricamento.
*   **Data Mutation**: Utilizza `useMutation` per le operazioni di creazione, aggiornamento ed eliminazione. La configurazione `onSuccess` invalida la query `regoleRipartizione`, forzando un refresh automatico della tabella dopo ogni operazione andata a buon fine.
*   **Stato e Logica**: Gestisce lo stato del form modale (`isFormOpen`, `selectedRule`) e contiene le funzioni handler (`handleAddNew`, `handleEdit`, `handleDelete`, `handleSubmit`) che collegano le azioni dell'utente alle mutazioni.

**Interazioni e Connessioni**:
*   **Importa**: Hook e tipi da `@tanstack/react-query`, tutte le API necessarie, componenti `DataTable` e `RegolaRipartizioneForm`.
*   **Utilizzato da**: `RegoleRipartizione.tsx` nella sezione Impostazioni.
*   **Consuma API**: `/api/regole-ripartizione`, `/api/conti/select`, `/api/commesse/select`, `/api/voci-analitiche/select`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa pagina permette di creare, modificare ed eliminare le regole automatiche che il sistema usa per suddividere i costi e i ricavi tra le varie commesse."
*   **(Sviluppatore)**: Questo componente è un eccellente esempio di come utilizzare `@tanstack/react-query` per gestire il data fetching e le mutazioni in un'applicazione React. L'invalidazione della query in `onSuccess` è il pattern chiave per mantenere la UI sincronizzata con lo stato del server.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/riconciliazione-columns.tsx**

**Scopo Principale**: Definisce le colonne per la tabella di riconciliazione manuale.

**Analisi Dettagliata**:
*   **Struttura Semplice**: Definisce le colonne per visualizzare i dati di una `RigaDaRiconciliare`.
*   **Campi Chiave**:
    *   `data`: Formatta il timestamp in una data leggibile.
    *   `descrizione`: Mostra la descrizione della riga.
    *   `conto.nome`: Accede al nome del conto relazionato.
    *   `importo`: Formatta il valore numerico come valuta.
    *   `voceAnaliticaSuggerita.nome`: Mostra il nome della voce analitica suggerita dal sistema.
*   **Ordinamento**: Utilizza `DataTableColumnHeader` per abilitare l'ordinamento su `data` e `importo`.

**Interazioni e Connessioni**:
*   **Importa**: Tipi da `@tanstack/react-table` e `@shared-types/index`, componenti UI.
*   **Utilizzato da**: `ReconciliationTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Definizione di colonne di sola lettura per una tabella di visualizzazione dati. L'uso di `@shared-types` è una buona pratica per garantire la coerenza dei tipi tra frontend e backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/SystemOperations.tsx**

**Scopo Principale**: Fornisce un componente UI per eseguire operazioni di sistema critiche, come il reset del database e il backup.

**Analisi Dettagliata**:
*   **Stato Locale**: Usa `useState` per tracciare lo stato di esecuzione delle operazioni (`isResetting`, `isBackingUp`) al fine di disabilitare i pulsanti e fornire feedback visivo.
*   **Handler di Eventi**:
    *   `handleReset`: Chiama l'API `resetDatabase` e gestisce l'esito (successo o errore) con notifiche `toast`.
    *   `handleBackup`: Chiama l'API `backupDatabase` e gestisce l'esito.
*   **UI di Conferma**: Utilizza il componente `AlertDialog` per richiedere una conferma esplicita all'utente prima di eseguire l'operazione distruttiva di reset del database.

**Interazioni e Connessioni**:
*   **Importa**: Funzioni API `resetDatabase`, `backupDatabase`, componenti UI.
*   **Utilizzato da**: `Impostazioni.tsx`.
*   **Consuma API**: `/api/system/reset-database`, `/api/database/backup`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa sezione contiene azioni potenti e potenzialmente distruttive. L'azzeramento del database cancellerà tutti i dati e riporterà il sistema allo stato iniziale. Il backup crea una copia di sicurezza di tutti i dati attuali."
*   **(Sviluppatore)**: Componente che incapsula azioni "pericolose". L'uso di un `AlertDialog` è fondamentale per prevenire azioni accidentali da parte dell'utente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/TemplateFormDialog.tsx**

**Scopo Principale**: Fornisce il form modale per creare e modificare i template di importazione, inclusa la gestione dinamica delle definizioni dei campi.

**Analisi Dettagliata**:
*   **Gestione Form Complesso**: Utilizza `useFieldArray` di `react-hook-form` per gestire dinamicamente l'array di `fieldDefinitions`. Questo permette all'utente di aggiungere e rimuovere righe di definizione dei campi direttamente nel form.
*   **Stato Iniziale**: `useEffect` popola il form con i dati del template selezionato (`initialData`) quando si apre in modalità modifica.
*   **Binding dei Campi**: Utilizza il componente `Controller` di `react-hook-form` per legare ogni input all'interno del `map` dei `fields` allo stato del form.
*   **Logica di Submit**: La logica di salvataggio è delegata al componente padre tramite la prop `onSubmit`.

**Interazioni e Connessioni**:
*   **Importa**: `react-hook-form`, `zodResolver`, componenti UI.
*   **Utilizzato da**: `ImportTemplatesAdmin.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo componente è un ottimo esempio di come gestire form dinamici con `react-hook-form`, in particolare per array di sotto-oggetti. `useFieldArray` è lo strumento chiave per questa funzionalità.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/VoceAnaliticaForm.tsx**

**Scopo Principale**: Fornisce il form modale per creare o modificare una `VoceAnalitica`.

**Analisi Dettagliata**:
*   **Form Semplice**: Un form standard gestito con `react-hook-form` e `zodResolver`.
*   **Campi**: Include input per `nome`, `descrizione` e un `Select` per il `tipo` ('Costo' o 'Ricavo').
*   **Logica**: Simile agli altri form, resetta i valori in base a `initialData` e delega il salvataggio al padre tramite `onSubmit`.

**Interazioni e Connessioni**:
*   **Importa**: `react-hook-form`, `zodResolver`, `voceSchema`, componenti UI.
*   **Utilizzato da**: `VociAnaliticheManager.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Esempio di un form CRUD di base.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/VociAnaliticheManager.tsx**

**Scopo Principale**: Componente manager per la gestione CRUD delle `VoceAnalitica`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue lo stesso pattern di `RegoleRipartizioneManager` e `ImportTemplatesAdmin`.
*   **Data Fetching e Mutation**: Utilizza `@tanstack/react-query` (`useQuery`, `useMutation`) per recuperare e modificare i dati, con invalidazione automatica della cache in caso di successo.
*   **Gestione Stato**: Usa `useState` per controllare l'apertura del form (`isFormOpen`) e la selezione dell'item da modificare (`selectedVoce`) o eliminare (`voceToDelete`).
*   **Rendering**: Orchestra i componenti `VociAnaliticheTable` (per la visualizzazione), `VoceAnaliticaForm` (per la modifica) e `AlertDialog` (per la conferma di eliminazione).

**Interazioni e Connessioni**:
*   **Importa**: Hook da `@tanstack/react-query`, API da `@/api/vociAnalitiche`, componenti `VociAnaliticheTable`, `VoceAnaliticaForm`, `AlertDialog`.
*   **Utilizzato da**: `VociAnalitiche.tsx` nella sezione Impostazioni.
*   **Consuma API**: `/api/voci-analitiche`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Un altro solido esempio di implementazione del pattern "Manager Component" che centralizza la logica di stato e le interazioni API per una specifica risorsa CRUD.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/admin/VociAnaliticheTable.tsx**

**Scopo Principale**: Definisce e renderizza la tabella per visualizzare le `VoceAnalitica`.

**Analisi Dettagliata**:
*   **Definizione Colonne**: Le colonne sono definite direttamente nel file.
    *   `tipo`: Utilizza il componente `Badge` per visualizzare il tipo ('Costo' o 'Ricavo') con uno stile condizionale (rosso per costo, default per ricavo).
    *   `actions`: Contiene i pulsanti per "Modifica" ed "Elimina".
*   **Passaggio Callback**: A differenza di altri file di colonne, qui le callback `onEdit` e `onDelete` vengono passate alla `DataTable` tramite la prop `meta`. Questo è un altro modo valido per fornire contesto e funzioni alle celle della tabella.

**Interazioni e Connessioni**:
*   **Importa**: Tipi da `@tanstack/react-table`, `VoceAnalitica` da `@prisma/client`, componenti UI.
*   **Utilizzato da**: `VociAnaliticheManager.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La definizione delle colonne direttamente nel file è un approccio alternativo alla factory function. Il passaggio di funzioni tramite `meta` è una caratteristica utile di TanStack Table per rendere le celle più interattive.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/allocation**

**Scopo Principale della Cartella**: Questa directory contiene i componenti React specifici per il processo di allocazione dei costi e dei ricavi. Questi componenti sono progettati per essere riutilizzabili in diverse parti dell'applicazione, come la dashboard o la pagina di riconciliazione, per fornire funzionalità interattive legate all'allocazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/allocation/AllocationWidget.tsx**

**Scopo Principale**: Fornisce un widget compatto e informativo che mostra lo stato attuale del processo di allocazione dei movimenti contabili.

**Analisi Dettagliata**:
*   **Stato e Caricamento Dati**:
    *   Utilizza `useState` per gestire lo stato delle statistiche (`stats`) e lo stato di caricamento (`loading`).
    *   Usa `useEffect` per chiamare la funzione API `getAllocationStats` al primo rendering del componente e successivamente imposta un `setInterval` per aggiornare automaticamente le statistiche ogni 30 secondi. Questo garantisce che il widget mostri dati quasi in tempo reale.
    *   La funzione di cleanup di `useEffect` (`return () => clearInterval(interval);`) è fondamentale per prevenire memory leak quando il componente viene smontato.
*   **Rendering Condizionale**:
    *   Mostra uno scheletro di caricamento (`<div className="animate-pulse ...">`) mentre i dati sono in fase di fetch.
    *   Mostra un messaggio di errore se il caricamento fallisce.
    *   Renderizza le statistiche complete solo quando `stats` è disponibile.
*   **Visualizzazione Dati**:
    *   `getStatusBadge`: Una funzione helper che restituisce un componente `Badge` con colore e icona diversi in base alla percentuale di allocazione, fornendo un feedback visivo immediato sullo stato del sistema ("Tutto Allocato", "Quasi Completo", "Richiede Attenzione").
    *   **Progress Bar**: Utilizza il componente `Progress` per mostrare graficamente la percentuale di allocazione.
    *   **Statistiche Chiave**: Mostra il numero di movimenti non allocati, il loro importo totale, il totale dei movimenti e il numero di movimenti finalizzati.
*   **Azione Utente**:
    *   Mostra un pulsante "Avvia Allocazione" solo se ci sono movimenti non allocati (`stats.unallocatedCount > 0`).
    *   Il pulsante può invocare una callback `onOpenWizard` (se fornita) o navigare direttamente alla pagina `/riconciliazione`.

**Interazioni e Connessioni**:
*   **Importa**: `getAllocationStats` dall'API, `AllocationStats` dai tipi condivisi, e vari componenti UI.
*   **Utilizzato da**: `SidebarPanel.tsx` nella dashboard, per dare all'utente una visione immediata dello stato delle allocazioni.
*   **Consuma API**: `/api/staging/allocation-stats`.

**Appunti per il Manuale**:
*   **(Utente)**: "Nella dashboard, un riquadro mostra in tempo reale quanti movimenti contabili devono ancora essere assegnati a una commessa. Un pulsante permette di avviare direttamente il processo di allocazione."
*   **(Sviluppatore)**: Questo è un ottimo esempio di widget "live". L'auto-aggiornamento tramite `setInterval` lo rende dinamico. La logica per determinare lo stato (`getStatusBadge`) e mostrare/nascondere il pulsante di azione lo rende un componente intelligente e contestuale.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/allocation/AuditTrail.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa per visualizzare, filtrare e analizzare il registro di tutte le modifiche (audit log) avvenute nel sistema.

**Analisi Dettagliata**:
*   **Struttura a Sotto-componenti**: Il file è ben strutturato con sotto-componenti interni:
    *   `AuditDetailsDialog`: Un dialogo modale che mostra i dettagli completi di una singola voce di log, inclusi i valori precedenti e nuovi in caso di aggiornamento.
    *   `RollbackDialog`: Un dialogo di conferma per l'operazione di ripristino di una modifica. Contiene la logica per chiamare l'API di rollback.
*   **Hook `useAdvancedTable`**: Il componente principale `AuditTrail` utilizza l'hook personalizzato per gestire la tabella dei log, con ordinamento predefinito per data decrescente.
*   **Colonne della Tabella (`auditColumns`)**:
    *   **Formattazione**: Formatta il timestamp, l'azione (con badge colorati) e il tipo di entità per una migliore leggibilità.
    *   **Azioni**: La colonna delle azioni renderizza i componenti `AuditDetailsDialog` e, condizionatamente, `RollbackDialog` solo se la voce di log è ripristinabile (`entry.canRollback`).
*   **Statistiche**: Il componente `AuditTrail` recupera e visualizza delle statistiche riassuntive (es. "Totale Modifiche", "Azioni Recenti") per dare una visione d'insieme.
*   **Gestione Rollback**:
    *   Il `RollbackDialog` gestisce la chiamata API a `/allocation/audit/rollback`.
    *   In caso di successo, ricarica la pagina (`window.location.reload()`) per riflettere lo stato ripristinato. Questa è una strategia semplice; un approccio più avanzato potrebbe invalidare selettivamente le query.

**Interazioni e Connessioni**:
*   **Importa**: `apiClient`, `useAdvancedTable`, `AdvancedDataTable`, e vari componenti UI.
*   **Utilizzato da**: `AuditTrailPage.tsx`.
*   **Consuma API**: `/api/allocation/audit` per ottenere la lista dei log, `/api/allocation/audit/stats` per le statistiche, e `/api/allocation/audit/rollback` per eseguire il ripristino.

**Appunti per il Manuale**:
*   **(Utente)**: "Il Registro Modifiche tiene traccia di ogni operazione significativa eseguita nel sistema. È possibile vedere chi ha fatto cosa e quando. Per alcune modifiche, è disponibile un'opzione per annullare l'operazione (ripristino)."
*   **(Sviluppatore)**: Questo componente implementa una funzionalità di audit trail fondamentale per sistemi enterprise. La separazione della logica nei sotto-componenti `AuditDetailsDialog` e `RollbackDialog` mantiene il codice pulito. La colonna delle azioni che mostra condizionatamente il pulsante di rollback è un buon esempio di UI contestuale.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/allocation/SmartSuggestions.tsx**

**Scopo Principale**: Fornisce un componente che, data una riga contabile, interroga il backend per ottenere suggerimenti di allocazione intelligenti e li presenta all'utente.

**Analisi Dettagliata**:
*   **Stato Locale**: Gestisce i suggerimenti ricevuti (`suggestions`), lo stato di caricamento (`loading`) e se l'analisi è già stata eseguita (`analyzed`).
*   **Logica di Fetching (`fetchSuggestions`)**:
    1.  Viene attivata da un pulsante "Genera Suggerimenti".
    2.  Invia una richiesta `POST` all'endpoint `/smart-allocation/suggest`, passando i dati della riga contabile (ID, conto, importo, descrizione).
    3.  Al successo, popola lo stato `suggestions` e mostra un toast di conferma.
*   **Rendering Condizionale**:
    *   Inizialmente, mostra solo il pulsante per avviare l'analisi.
    *   Durante il caricamento, il pulsante è disabilitato.
    *   Se l'analisi non produce suggerimenti, mostra un messaggio informativo.
    *   Se ci sono suggerimenti, li itera e li visualizza.
*   **Visualizzazione dei Suggerimenti**:
    *   Ogni suggerimento è presentato in una card separata.
    *   Utilizza icone e badge per distinguere il tipo di suggerimento (`rule`, `historical`, `pattern`).
    *   Mostra un badge di "confidenza" con un colore che varia in base al livello di affidabilità del suggerimento.
    *   Mostra dettagli chiari: commessa e voce analitica suggerite, e l'importo calcolato se basato su una percentuale.
    *   Fornisce un pulsante "Applica" che invoca la callback `onApplySuggestion` passata come prop.

**Interazioni e Connessioni**:
*   **Importa**: `apiClient`, componenti UI, `useToast`.
*   **Utilizzato da**: `Riconciliazione.tsx`, dove appare accanto al form di allocazione manuale quando una riga viene selezionata.
*   **Consuma API**: `/api/smart-allocation/suggest` per ottenere i suggerimenti e `/api/smart-allocation/learn` (chiamato dal genitore) per inviare feedback al modello.

**Appunti per il Manuale**:
*   **(Utente)**: "Quando devi allocare una riga, puoi chiedere al sistema dei suggerimenti intelligenti. Il sistema analizzerà lo storico e le regole per proporti le allocazioni più probabili, aiutandoti a velocizzare il lavoro."
*   **(Sviluppatore)**: Questo componente è l'interfaccia utente per il sistema di machine learning/euristiche del backend. La sua responsabilità è presentare in modo chiaro e attuabile i suggerimenti ricevuti. La comunicazione con il componente genitore avviene tramite la callback `onApplySuggestion`, disaccoppiando la visualizzazione dalla logica di applicazione effettiva del suggerimento nel form principale.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/commesse**

**Scopo Principale della Cartella**: Questa directory contiene componenti React specificamente progettati per la visualizzazione e l'interazione con i dati delle commesse. Questi componenti sono riutilizzabili e vengono impiegati in diverse pagine, come la lista delle commesse (`Commesse.tsx`) e la vista di dettaglio (`CommessaDettaglio.tsx`), per presentare informazioni complesse in modo chiaro e coerente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/commesse/CommessaActionMenu.tsx**

**Scopo Principale**: Fornisce un menu a tendina contestuale (`DropdownMenu`) con una serie di azioni rapide che possono essere eseguite su una singola commessa.

**Analisi Dettagliata**:
*   **Componente `CommessaActionMenu`**:
    *   **Props**: Riceve l'oggetto `commessa` (con dati di performance), una serie di funzioni di callback per le azioni (`onAllocateMovements`, `onEditBudget`, ecc.), e props per personalizzare l'aspetto (`variant`, `size`).
    *   **Rendering Dinamico del Trigger**: La funzione `renderTrigger` sceglie come visualizzare il pulsante di attivazione del menu in base alla prop `variant` ('default', 'compact', 'minimal'), rendendo il componente flessibile per diversi contesti UI.
    *   **Azioni Prioritarie**: La funzione `getPriorityActions` analizza lo stato della commessa (es. margine negativo, budget in esaurimento) e aggiunge dinamicamente delle voci di menu evidenziate per attirare l'attenzione dell'utente su problemi critici.
    *   **Struttura del Menu**: Il menu è organizzato logicamente con separatori e sottomenu (`DropdownMenuSub`) per raggruppare azioni simili (es. Esporta Report, Analisi Rapida).
*   **Componente `QuickActions`**:
    *   È una versione alternativa e più compatta che visualizza le azioni come una serie di pulsanti icona affiancati, invece di un menu a tendina. È ideale per contesti in cui lo spazio è limitato, come le righe di una tabella.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI di shadcn (`Button`, `DropdownMenu`, `Badge`), icone da `lucide-react`, e tipi `CommessaWithPerformance`, `CommessaDashboard`.
*   **Utilizzato da**: `CommessaDettaglio.tsx` (per il menu principale della pagina) e `Commesse.tsx` (il componente `QuickActions` viene usato nella tabella delle attività).
*   **Logica**: Non esegue chiamate API dirette, ma invoca le funzioni di callback passate come props, delegando l'esecuzione della logica ai componenti genitori.

**Appunti per il Manuale**:
*   **(Utente)**: "Accanto a ogni commessa, un menu 'Azioni' permette di accedere rapidamente a funzioni comuni come la modifica del budget, l'esportazione di report o l'avvio di analisi specifiche."
*   **(Sviluppatore)**: Questo componente è un ottimo esempio di come creare un'interfaccia utente contestuale e intelligente. La logica `getPriorityActions` che mostra alert dinamici direttamente nel menu delle azioni è una feature molto utile. La separazione in `CommessaActionMenu` e `QuickActions` dimostra una buona riusabilità del codice per diversi layout.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/commesse/ComparativeView.tsx**

**Scopo Principale**: Fornisce una vista complessa per il confronto di performance tra più commesse selezionate.

**Analisi Dettagliata**:
*   **Gestione Stato**: Utilizza `useState` per gestire i filtri selezionati dall'utente (`comparisonType`, `selectedMetric`, `selectedCommesse`, `timeRange`).
*   **Elaborazione Dati**: Utilizza `useMemo` per calcolare e preparare i dati per i grafici ogni volta che le commesse o i filtri cambiano. Questo ottimizza le performance evitando ricalcoli non necessari.
    *   `performanceData`: Filtra le commesse selezionate e calcola metriche derivate come `roi` e `efficienza`.
    *   `temporalData`: Simula un andamento temporale per le commesse selezionate (in un'applicazione reale, questi dati verrebbero dal backend).
    *   `radarData`: Prepara i dati per il grafico a radar, confrontando una singola commessa con un benchmark di settore (attualmente hardcodato).
*   **Componenti Grafici**: Fa un uso estensivo della libreria `recharts` per visualizzare i dati in vari formati: `BarChart`, `LineChart`, `ScatterChart`, `RadarChart`.
*   **Componente `ComparisonTable`**: Un sotto-componente definito localmente che renderizza una tabella dettagliata con le metriche di performance delle commesse selezionate.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, icone `lucide-react`, componenti `recharts`, e componenti di stato personalizzati come `StatusBadge`.
*   **Utilizzato da**: `ComparativeAnalysis.tsx`, che è la pagina dedicata a questa funzionalità.
*   **Logica**: Tutta la logica di calcolo e preparazione dei dati per la visualizzazione è contenuta all'interno del componente. Non effettua chiamate API dirette, ma riceve i dati come props.

**Appunti per il Manuale**:
*   **(Utente)**: "La vista comparativa permette di mettere a confronto più commesse su diverse metriche (margine, avanzamento, ROI). È possibile visualizzare i dati in forma di grafici a barre, andamenti temporali o confrontare una commessa con i benchmark di settore."
*   **(Sviluppatore)**: Questo è un componente di visualizzazione dati molto denso. L'uso di `useMemo` è cruciale per le performance. La simulazione dei dati temporali indica un'area dove il backend potrebbe essere esteso per fornire serie storiche reali. La struttura basata su `Tabs` permette di organizzare diverse viste complesse in modo ordinato.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/commesse/PerformanceCommessaCard.tsx**

**Scopo Principale**: Visualizza una "card" riassuntiva con i principali KPI di performance per una singola commessa.

**Analisi Dettagliata**:
*   **Componente di Presentazione**: È un componente progettato per mostrare informazioni in modo visivamente accattivante. Riceve tutti i dati necessari come props.
*   **Calcoli Interni**: Calcola metriche semplici come `margineAssoluto` e `budgetUtilizzato` direttamente al suo interno.
*   **Formattazione**: Utilizza funzioni helper locali (`formatCurrency`, `formatPercent`) per formattare i numeri in modo consistente.
*   **Logica di Stile Condizionale**: Usa funzioni helper (`getMargineColor`, `getStatoColor`) e logica ternaria per applicare stili diversi (colori, icone) in base ai valori dei KPI, fornendo un feedback visivo immediato sullo stato di salute della commessa.
*   **Struttura**: La card è divisa in sezioni chiare: un header con le informazioni anagrafiche, una griglia con i KPI principali, una barra di progresso per l'avanzamento e un footer con indicatori secondari.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI, icone `lucide-react`.
*   **Utilizzato da**: Potenzialmente in una dashboard o in una lista di commesse dove si vuole una vista più ricca rispetto a una semplice riga di tabella.

**Appunti per il Manuale**:
*   **(Utente)**: "Ogni commessa può essere visualizzata come una scheda riassuntiva che mostra a colpo d'occhio i dati più importanti: ricavi, costi, margine e stato di avanzamento."
*   **(Sviluppatore)**: Questo è un ottimo esempio di componente di presentazione riutilizzabile. È "dumb" nel senso che non gestisce stato o chiamate API, ma contiene una logica di visualizzazione significativa (formattazione e stili condizionali) che lo rende molto efficace.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/commesse/StatusIndicators.tsx**

**Scopo Principale**: Fornisce una serie di componenti `Badge` specializzati e riutilizzabili per visualizzare lo stato di una commessa in modo standardizzato e visivamente coerente.

**Analisi Dettagliata**:
*   **Logica di Business Centralizzata**: Le funzioni `getMarginStatus`, `getProgressStatus`, e `getCommessaStatus` incapsulano la logica di business per classificare lo stato di una commessa in base ai suoi KPI. Questo è fondamentale perché garantisce che la stessa logica venga applicata in ogni punto dell'applicazione in cui viene mostrato uno stato.
*   **Configurazioni di Stile**: Gli oggetti `marginConfig`, `progressConfig`, e `statusConfig` definiscono in un unico posto i colori, le icone e le etichette per ogni possibile stato. Questo rende facilissimo modificare l'aspetto di tutti gli indicatori di stato agendo solo su questo file.
*   **Componenti Badge Specializzati**:
    *   `MargineBadge`: Mostra il margine percentuale con un'icona e un colore che ne indicano la qualità.
    *   `ProgressBadge`: Mostra lo stato di avanzamento (es. "In Corso", "Completato").
    *   `StatusBadge`: Mostra lo stato generale della commessa (es. "Attiva", "Sospesa").
    *   `HealthBadge`: Calcola e mostra uno "score di salute" complessivo basato su più KPI.
*   **Componente `StatusIndicators`**: Un componente contenitore che raggruppa i vari badge per una visualizzazione compatta.

**Interazioni e Connessioni**:
*   **Importa**: Componente `Badge` e icone `lucide-react`.
*   **Utilizzato da**: Molti componenti in tutta l'applicazione, tra cui `CommessaDettaglio.tsx`, `ComparativeView.tsx`, `Commesse.tsx`. È un componente di utilità UI fondamentale.

**Appunti per il Manuale**:
*   **(Utente)**: "In tutta l'applicazione, lo stato delle commesse è indicato da etichette colorate (badge) che permettono di capire a colpo d'occhio se una commessa è in salute (verde/blu), richiede attenzione (giallo) o è in una situazione critica (rosso)."
*   **(Sviluppatore)**: Questo file è un eccellente esempio di come creare un "design system" a livello di componenti. Centralizzando qui tutta la logica di classificazione e stile, si garantisce coerenza visiva e si semplifica enormemente la manutenzione. Se si decide di cambiare la soglia per un margine "buono", basta modificare la funzione `getMarginStatus` in questo file e l'aggiornamento si rifletterà in tutta l'applicazione.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/dashboard**

**Scopo Principale della Cartella**: Questa directory contiene tutti i componenti React specializzati utilizzati per costruire la pagina della Dashboard. Questi componenti sono progettati per visualizzare dati aggregati, KPI (Key Performance Indicators), grafici e tabelle riassuntive, fornendo una panoramica immediata dello stato delle commesse.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/AlertsPanel.tsx**

**Scopo Principale**: Visualizza un pannello di avvisi prioritari basati sullo stato attuale dei dati, attirando l'attenzione dell'utente su situazioni critiche o che richiedono un intervento.

**Analisi Dettagliata**:
*   **Logica di Business nel Frontend**: La funzione `generatePriorityAlerts` contiene una logica di business significativa. Analizza i KPI passati come props (es. `commesseConMargineNegativo`, `budgetVsConsuntivo`) e genera dinamicamente un array di oggetti `AlertItem`.
*   **Prioritizzazione degli Alert**: Gli alert sono classificati come `critical` o `warning` e viene mostrato un numero limitato di essi (i primi 4), implicando una logica di priorità.
*   **Rendering Condizionale**:
    *   Se non ci sono alert, mostra un messaggio positivo di "Tutto OK!".
    *   Se ci sono alert, itera su di essi e renderizza un componente `Alert` di shadcn/ui per ciascuno.
*   **Stile Dinamico**: Lo stile di ogni alert (colore del bordo, icona, colore del testo) è determinato dinamicamente in base al tipo di alert (`error`, `warning`, `info`).
*   **Azioni Contestuali**: Ogni alert può avere un pulsante di azione (es. "Visualizza dettagli", "Alloca") che, se cliccato, può navigare l'utente alla pagina pertinente.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI (`Card`, `Badge`, `Button`, `Alert`), icone da `lucide-react`.
*   **Utilizzato da**: `SidebarPanel.tsx`, dove viene renderizzato come uno dei pannelli principali della sidebar della dashboard.
*   **Dati Ricevuti**: Riceve come props i `kpi` e l'elenco delle `commesse` per poter generare gli avvisi.

**Appunti per il Manuale**:
*   **(Utente)**: "Il pannello 'Alert Prioritari' nella dashboard ti avvisa automaticamente delle situazioni più importanti, come commesse in perdita o movimenti contabili che devono essere ancora assegnati, permettendoti di agire tempestivamente."
*   **(Sviluppatore)**: Questo componente è un ottimo esempio di come la logica di business possa risiedere anche nel frontend per scopi di visualizzazione. La funzione `generatePriorityAlerts` è un "motore di regole" lato client che traduce i dati grezzi in insight azionabili per l'utente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/ChartContainer.tsx**

**Scopo Principale**: Contiene una collezione di componenti grafico riutilizzabili, basati sulla libreria `recharts`, per visualizzare i dati della dashboard.

**Analisi Dettagliata**:
*   **Libreria Grafici**: Utilizza `recharts` per tutti i grafici, una scelta popolare per la creazione di grafici componibili in React.
*   **Componenti Grafico Specifici**:
    *   **`TrendChart`**: Un `LineChart` che mostra l'andamento di ricavi, costi e margine nel tempo. È un grafico composto che combina barre e linee su assi Y diversi (uno per gli importi in valuta, uno per le percentuali).
    *   **`TopCommesseChart`**: Un `BarChart` orizzontale che mostra le 5 migliori commesse per margine percentuale.
    *   **`KpiComparisonChart`**: Un `PieChart` (grafico a torta) che mostra la distribuzione tra ricavi e costi totali, accompagnato da un riepilogo testuale del margine assoluto.
*   **`ChartsGrid`**: Un componente contenitore che assembla i tre grafici precedenti in un layout a griglia.
*   **Formattazione**: Include funzioni di utilità locali (`formatCurrency`, `formatPercent`) per formattare i valori visualizzati nei tooltip e sugli assi dei grafici.

**Interazioni e Connessioni**:
*   **Importa**: Componenti da `recharts`, componenti UI (`Card`).
*   **Utilizzato da**: `MainChartsSection.tsx`, che utilizza questi componenti per costruire la sezione principale dei grafici della dashboard.
*   **Dati Ricevuti**: Ogni componente grafico riceve una porzione specifica dei dati `trends` o `kpi` necessari per il rendering.

**Appunti per il Manuale**:
*   **(Utente)**: "La dashboard include diversi grafici interattivi: un grafico principale mostra l'andamento di ricavi e costi nel tempo, un altro classifica le migliori commesse per redditività, e un terzo mostra la ripartizione generale tra entrate e uscite."
*   **(Sviluppatore)**: Questo file incapsula la complessità della configurazione di `recharts`. Ogni componente è specializzato per un tipo di visualizzazione. Notare l'uso di `ResponsiveContainer` per rendere i grafici adattabili alla dimensione del loro contenitore.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/CompactHeader.tsx**

**Scopo Principale**: Renderizza l'intestazione principale della dashboard, includendo il titolo, i KPI principali in linea e i controlli per i filtri.

**Analisi Dettagliata**:
*   **Layout Compatto**: Mostra i KPI più importanti (Commesse Attive, Ricavi, Margine, etc.) direttamente nell'header, fornendo una visione d'insieme immediata.
*   **Componente Filtri**: Integra il componente `FilterControls`, gestendone l'apertura e la chiusura (`isOpen`, `onToggle`). Passa le funzioni e i dati necessari (`filters`, `onFiltersChange`, `clienti`).
*   **Visualizzazione KPI**:
    *   Utilizza funzioni di formattazione (`formatCurrency`, `formatPercent`) per rendere i numeri più leggibili.
    *   Applica stili e icone condizionali per dare un feedback visivo immediato (es. colore verde/giallo/rosso per il margine, icona `TrendingUp`/`TrendingDown`).
*   **Componente Controllato**: Non gestisce lo stato dei filtri internamente, ma lo riceve come prop (`filters`) e notifica i cambiamenti tramite la callback `onFiltersChange`.

**Interazioni e Connessioni**:
*   **Importa**: `FilterControls`, componenti UI, icone.
*   **Utilizzato da**: `Dashboard.tsx` come componente header principale.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo componente è il "cruscotto" della dashboard. La scelta di visualizzare i KPI in linea è efficace per schermi larghi. L'integrazione del componente `FilterControls` mostra un buon pattern di composizione, dove un componente genitore (`CompactHeader`) gestisce la visibilità e il passaggio di dati a un componente figlio (`FilterControls`).

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/FilterControls.tsx**

**Scopo Principale**: Fornisce un pannello a comparsa (popover) con un set completo di controlli per filtrare i dati visualizzati nella dashboard.

**Analisi Dettagliata**:
*   **Interfaccia `DashboardFilters`**: Definisce la struttura dell'oggetto filtri, che include `dateRange`, `clienteId`, `statoCommessa`, `tipoCommessa`, `margineMin`, `margineMax`, e `searchText`.
*   **Stato Controllato**: Come `CompactHeader`, è un componente controllato. Riceve lo stato dei filtri (`filters`) e notifica i cambiamenti tramite `onFiltersChange`.
*   **Debouncing**: Utilizza l'hook `useDebounce` per il campo di ricerca testuale. Questo evita di scatenare un nuovo filtraggio ad ogni carattere digitato, migliorando le performance.
*   **Componenti UI Avanzati**:
    *   Usa `Popover` per mostrare i filtri in un pannello a comparsa.
    *   Usa `Calendar` in modalità `range` per la selezione dell'intervallo di date.
    *   Usa `Select` per i filtri a scelta singola (cliente, stato, tipo).
*   **Logica Filtri Attivi**: La funzione `getActiveFiltersCount` calcola e visualizza il numero di filtri attivi in un `Badge`, fornendo un feedback chiaro all'utente.

**Interazioni e Connessioni**:
*   **Importa**: `useDebounce`, componenti UI (`Popover`, `Calendar`, `Select`).
*   **Utilizzato da**: `CompactHeader.tsx`.

**Appunti per il Manuale**:
*   **(Utente)**: "Cliccando sul pulsante 'Filtri', è possibile affinare i dati visualizzati nella dashboard, cercando per nome, selezionando un periodo specifico, un cliente, uno stato o un tipo di commessa."
*   **(Sviluppatore)**: Componente ben strutturato per la gestione di filtri complessi. L'uso di `useDebounce` per l'input di ricerca è una best practice per ottimizzare le performance. La gestione dello stato è delegata al componente padre, rendendo `FilterControls` un componente di UI puro e riutilizzabile.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/HierarchicalCommesseTable.tsx**

**Scopo Principale**: Visualizza le commesse in una tabella gerarchica, dove le commesse principali (Comuni) possono essere espanse per mostrare le attività figlie associate.

**Analisi Dettagliata**:
*   **Componente `Accordion`**: Utilizza il componente `Accordion` di shadcn/ui come base per creare la struttura espandibile. Ogni `AccordionItem` rappresenta una commessa padre.
*   **Rendering Gerarchico**:
    *   Il componente principale itera solo sulle `commessePadre`.
    *   L'`AccordionTrigger` mostra i dati riassuntivi e i KPI della commessa padre.
    *   L'`AccordionContent` contiene la logica per renderizzare le commesse figlie (`attivitaAssociate`). Se non ci sono figlie, mostra un messaggio.
*   **Tabella Interna**: Le attività figlie sono renderizzate in una `Table` standard, fornendo una vista strutturata e dettagliata all'interno della riga espansa.
*   **Riutilizzo Componenti**: Fa un ottimo uso dei componenti `StatusIndicators` (`StatusBadge`, `MargineBadge`, `ProgressBadge`) e `QuickActions` per visualizzare lo stato e le azioni in modo coerente sia per le commesse padre che per quelle figlie.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI (`Accordion`, `Table`), componenti specifici (`StatusIndicators`, `QuickActions`).
*   **Utilizzato da**: `Dashboard.tsx` come tabella principale per la visualizzazione delle commesse.
*   **Dati Ricevuti**: Riceve l'array completo di `commesse` (con le figlie già annidate dal backend) e le filtra internamente per separare padri e figlie.

**Appunti per il Manuale**:
*   **(Utente)**: "La tabella principale delle commesse è organizzata per Comune. Cliccando su un Comune, è possibile espandere la riga per visualizzare tutte le attività specifiche (sotto-commesse) associate ad esso, con i relativi dati finanziari."
*   **(Sviluppatore)**: Questo componente è un'implementazione intelligente di una vista gerarchica usando un componente `Accordion`. La logica di consolidamento dei dati (calcolo dei totali per le commesse padre includendo le figlie) viene eseguita nel backend (`server/routes/commesseWithPerformance.ts`), semplificando notevolmente la logica di questo componente, che si concentra quasi esclusivamente sul rendering.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/KpiWidget.tsx**

**Scopo Principale**: Definisce un componente generico e riutilizzabile per visualizzare un singolo Key Performance Indicator (KPI) all'interno di una `Card`.

**Analisi Dettagliata**:
*   **Componente Generico**: È progettato per essere altamente configurabile tramite props: `title`, `value`, `description`, `trend`, `variant`, `icon`, `badge`.
*   **Stile Condizionale**: La funzione `getVariantStyles` applica classi CSS diverse in base alla prop `variant` (`success`, `warning`, `destructive`), cambiando il colore di sfondo e del bordo per dare un feedback visivo immediato.
*   **Iconografia Dinamica**: La funzione `getTrendIcon` seleziona l'icona appropriata (`TrendingUp`, `TrendingDown`) in base alla prop `trend`.
*   **`KpiGrid`**: Un componente esportato aggiuntivo che assembla una griglia di `KpiWidget`, mappando i dati dell'oggetto `kpi` ai props di ogni widget. Questo centralizza la configurazione della griglia di KPI.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI (`Card`, `Badge`), icone da `lucide-react`.
*   **Utilizzato da**: Non direttamente dalla pagina `Dashboard.tsx`, ma la sua logica è stata integrata in `CompactHeader.tsx` e `SidebarPanel.tsx` per visualizzare i KPI. È un componente di libreria interna.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: `KpiWidget` è un eccellente esempio di componente di UI riutilizzabile. Incapsula tutta la logica di visualizzazione per un singolo KPI. La presenza del componente `KpiGrid` suggerisce che inizialmente i KPI erano pensati per essere in una griglia separata, ma poi sono stati integrati nell'header compatto per un design più moderno.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/MainChartsSection.tsx**

**Scopo Principale**: Componente contenitore che assembla i grafici principali della dashboard in un layout a griglia.

**Analisi Dettagliata**:
*   **Composizione**: Non contiene logica di grafici complessa, ma importa e assembla i componenti specifici da `ChartContainer.tsx` (che è stato refattorizzato o non è più usato direttamente) e altri. La logica dei grafici è ora più probabilmente dentro `TrendChart`, `TopCommesseChart`, ecc.
*   **Struttura**: Utilizza un layout a griglia per posizionare il grafico principale (`ComposedChart` per il trend) e i grafici secondari (`BarChart` per le top commesse e un altro per la distribuzione finanziaria).
*   **Passaggio Dati**: Riceve i dati `trends` e `kpi` dal componente `Dashboard` e li passa come props ai componenti grafico figli.

**Interazioni e Connessioni**:
*   **Importa**: Componenti da `recharts`, componenti UI (`Card`).
*   **Utilizzato da**: `Dashboard.tsx` per renderizzare la sezione principale dei grafici.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo componente agisce come un "layout manager" per la sezione dei grafici. La sua responsabilità è l'orchestrazione e la disposizione dei componenti grafico, mentre la logica di rendering specifica di ogni grafico è delegata a componenti più piccoli e specializzati.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dashboard/SidebarPanel.tsx**

**Scopo Principale**: Renderizza il pannello laterale della dashboard, contenente widget informativi come lo stato delle allocazioni, le statistiche rapide e gli alert prioritari.

**Analisi Dettagliata**:
*   **Composizione di Widget**: Assembla diversi componenti informativi in un layout a colonna:
    1.  **`AllocationWidget`**: Un componente dedicato che mostra lo stato del processo di allocazione (vedi analisi separata).
    2.  **Statistiche Rapide**: Una `Card` che mostra KPI derivati, come il numero e la percentuale di commesse con margine positivo e la media dei ricavi.
    3.  **`AlertsPanel`**: Integra il pannello degli alert (analizzato in precedenza).
    4.  **Commesse Critiche**: Una `Card` che elenca specificamente le commesse con margine negativo, fornendo un accesso rapido ai casi problematici.
    5.  **Azioni Rapide**: Una `Card` con pulsanti che fungono da scorciatoie per le sezioni più importanti dell'applicazione (Gestione Commesse, Riconciliazione, Analisi Costi).
*   **Logica di Calcolo**: Contiene logica per calcolare le statistiche rapide (`getQuickStats`) e per filtrare le commesse problematiche (`getCommesseProblematiche`) dai dati ricevuti.

**Interazioni e Connessioni**:
*   **Importa**: `AllocationWidget`, componenti UI.
*   **Utilizzato da**: `Dashboard.tsx` come colonna laterale nel layout principale.
*   **Dati Ricevuti**: Riceve i `kpi` e l'elenco delle `commesse` per alimentare i suoi sotto-componenti e calcoli.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: La sidebar della dashboard non è solo un menu di navigazione, ma un vero e proprio pannello informativo. Questo componente orchestra diversi "widget" informativi, ognuno con uno scopo specifico. È il centro nevralgico per le informazioni che richiedono un'azione immediata da parte dell'utente.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/database**

**Scopo Principale della Cartella**: Questa directory contiene i componenti React responsabili della visualizzazione e della gestione delle tabelle di dati, sia quelle di produzione (es. `Clienti`, `Commesse`) sia quelle di staging (es. `StagingConti`). Ogni componente `...Table.tsx` tipicamente incapsula una tabella dati avanzata, un dialogo per la creazione/modifica e la logica per interagire con le API del backend.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/CausaliTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione delle `CausaleContabile`.

**Analisi Dettagliata**:
*   **Data Fetching**: Utilizza l'hook personalizzato `useAdvancedTable` per gestire il recupero dei dati paginati dall'endpoint `/api/causali`, includendo logica per ricerca, ordinamento e paginazione.
*   **Gestione CRUD**: Utilizza l'hook personalizzato `useCrudTable` per incapsulare la logica di creazione, modifica ed eliminazione. Questo hook gestisce lo stato dei dialoghi (`isDialogOpen`, `editingItem`, `deletingItem`), l'istanza del form (`react-hook-form`) e le chiamate API tramite le funzioni passate.
*   **Definizione Colonne**: Le colonne per la `AdvancedDataTable` sono definite direttamente nel componente. Vengono visualizzati campi chiave come `codice`, `nome`, `descrizione` e alcune delle loro proprietà decodificate (es. `tipoMovimentoDesc`, `gestionePartiteDesc`) per una migliore leggibilità.
*   **Form Modale**: Il dialogo per la creazione/modifica è complesso e utilizza un componente `Accordion` per raggruppare i numerosi campi di una causale in sezioni logiche (Informazioni Generali, Gestione IVA, Gestioni Speciali, Autofatture e Flags). Questo migliora notevolmente l'usabilità.
*   **Componenti UI**: Fa ampio uso di componenti `shadcn/ui` come `Card`, `Button`, `Dialog`, `AlertDialog`, `Form`, `Input`, `Switch` e `Accordion`.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/causali`, schema Zod da `@/schemas/database`, e vari componenti UI.
*   **Utilizzato da**: `Database.tsx`, dove viene renderizzato all'interno di una delle tab.
*   **Consuma API**: `/api/causali` per tutte le operazioni CRUD.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa tabella mostra tutte le causali contabili utilizzate dal sistema. È possibile cercare, ordinare, aggiungere nuove causali, modificare quelle esistenti o eliminarle. Il form di modifica è organizzato in sezioni per facilitare la configurazione di tutti i parametri fiscali e gestionali."
*   **(Sviluppatore)**: Questo componente è un eccellente esempio di come combinare gli hook personalizzati `useAdvancedTable` e `useCrudTable` per creare un'interfaccia CRUD complessa con pochissimo codice "boilerplate" nel componente stesso. La logica è quasi interamente astratta negli hooks. Il form con l'accordion è un buon pattern UI per gestire entità con molti campi.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/ClienteForm.tsx**

**Scopo Principale**: Definisce la struttura del form per la creazione e la modifica di un'anagrafica `Cliente`.

**Analisi Dettagliata**:
*   **Componente di Presentazione**: Questo componente non contiene logica di stato o di fetching dati. Il suo unico scopo è definire la struttura del form.
*   **`useFormContext`**: Utilizza questo hook di `react-hook-form` per accedere all'istanza del form creata nel componente genitore (`ClientiTable.tsx`). Questo permette di creare componenti form modulari.
*   **Struttura con `Accordion`**: Similmente a `CausaliTable`, raggruppa i campi in sezioni espandibili per una migliore organizzazione: Dati Anagrafici, Indirizzo, Contatti, Riferimenti Fiscali, Classificazione, Pagamenti, Sottoconti e Flags.
*   **Campi del Form**: Utilizza il componente `FormField` di `shadcn/ui` per collegare ogni `Input` e `Checkbox` allo stato del form gestito da `react-hook-form`.
*   **Gestione Valori Null**: Per i campi opzionali, usa `value={field.value ?? ''}` per evitare che React segnali un errore per il passaggio da un valore controllato (stringa) a uno non controllato (null/undefined).

**Interazioni e Connessioni**:
*   **Importa**: `useFormContext`, componenti `Accordion`, `FormField`, `Input`, `Checkbox`.
*   **Utilizzato da**: `ClientiTable.tsx`, che lo renderizza all'interno del suo `Dialog` di modifica/creazione.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo componente dimostra come creare un sotto-componente per un form complesso usando `useFormContext`. Questo pattern è utile per scomporre form di grandi dimensioni in parti più piccole e manutenibili, senza dover passare l'istanza del form tramite props.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/ClientiTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione dell'anagrafica `Cliente`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue lo stesso pattern di `CausaliTable.tsx`.
*   **Hook `useAdvancedTable`**: Gestisce il recupero dei dati paginati dall'endpoint `/api/clienti`.
*   **Hook `useCrudTable`**: Gestisce la logica CRUD, lo stato dei dialoghi e il form.
*   **Definizione Colonne**: Definisce le colonne per la tabella, mostrando `nome`, `externalId`, `piva`, `codiceFiscale` e le azioni.
*   **Rendering del Form**: All'interno del `Dialog`, renderizza il componente `ClienteForm` avvolto in un `Form` provider di `react-hook-form`, passandogli l'istanza del form creata dall'hook `useCrudTable`.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/clienti`, schema Zod da `@/schemas/database`, componente `ClienteForm` e vari componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/clienti` per tutte le operazioni CRUD.

**Appunti per il Manuale**:
*   **(Utente)**: "Da questa tabella è possibile visualizzare e gestire l'elenco di tutti i clienti. È possibile aggiungere, modificare o eliminare un cliente."
*   **(Sviluppatore)**: Esempio canonico di implementazione del pattern "Manager Component" per una risorsa CRUD. La separazione tra la logica del manager (`ClientiTable`), la struttura del form (`ClienteForm`) e la logica riutilizzabile (hooks) rende il codice molto organizzato.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/CodiciIvaTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione dei `CodiceIva`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue lo stesso pattern degli altri componenti `...Table.tsx`.
*   **Hooks**: Utilizza `useAdvancedTable` e `useCrudTable`.
*   **Definizione Colonne**: Mostra `codice`, `descrizione`, `aliquota` (formattata con '%'), `tipoCalcolo` e `externalId`.
*   **Form Modale**: Il form di creazione/modifica è molto esteso e ben organizzato tramite un `Accordion` per raggruppare i numerosi campi fiscali in sezioni tematiche (Dati Base, Flags Fiscali, Plafond, Territorialità, ecc.). Questo è essenziale data la complessità dell'entità `CodiceIva`.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/codiciIva`, schema Zod da `@/schemas/database`, e componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/codici-iva` per tutte le operazioni CRUD.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa sezione permette di gestire l'anagrafica dei codici IVA, configurando per ciascuno l'aliquota, la descrizione e tutti i parametri fiscali avanzati necessari per il calcolo corretto dell'imposta."
*   **(Sviluppatore)**: La complessità del form per `CodiceIva` riflette la complessità del modello Prisma sottostante. L'uso dell'accordion è una scelta UI obbligata per non sopraffare l'utente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/CommesseTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione delle `Commessa`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue lo stesso pattern.
*   **Caricamento Dati Aggiuntivi**: Oltre a usare `useAdvancedTable` per le commesse, utilizza `useEffect` per caricare separatamente la lista dei clienti e delle altre commesse (per il campo `parentId`), che serviranno a popolare le dropdown nel form.
*   **Definizione Colonne**:
    *   La colonna `nome` ha una logica di rendering personalizzata per mostrare un'indentazione (`└─`) per le commesse figlie, fornendo una visualizzazione gerarchica di base direttamente nella tabella.
    *   La colonna `parent.nome` utilizza l'accessor key con notazione a punto per mostrare il nome della commessa genitore.
*   **Form Modale**: Il form permette di selezionare il `clienteId` e il `parentId` da liste popolate con i dati caricati.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/commesse` e `@/api/clienti`, componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/commesse` (CRUD), `/api/clienti` (per il form), `/api/commesse/select` (per il form).

**Appunti per il Manuale**:
*   **(Utente)**: "Qui è possibile gestire l'elenco di tutti i progetti (commesse). Si possono creare commesse principali o sotto-commesse (attività) collegandole a una 'Commessa Padre'."
*   **(Sviluppatore)**: La logica di rendering per la gerarchia nella colonna `nome` è un semplice ma efficace miglioramento della UX. Il caricamento separato dei dati per i `Select` del form è un pattern comune quando si gestiscono entità con relazioni.

---
---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/CondizionePagamentoForm.tsx**

**Scopo Principale**: Definisce la struttura del form per la creazione e la modifica di una `CondizionePagamento`.

**Analisi Dettagliata**:
*   **Componente di Presentazione**: Similmente a `ClienteForm`, questo componente è puramente strutturale e non contiene logica di stato.
*   **`useFormContext`**: Utilizza questo hook per connettersi al form gestito dal componente genitore (`CondizioniPagamentoTable`).
*   **Funzioni Helper di Rendering**: Il componente definisce tre funzioni interne (`renderNumberField`, `renderTextField`, `renderSwitchField`) per ridurre la duplicazione del codice JSX nella definizione dei campi del form. Questo è un buon pattern per form con molti campi dello stesso tipo.
*   **Struttura con `Accordion`**: Organizza i campi in sezioni logiche: "Informazioni Principali", "Dettagli Rate e Scadenze", e "Configurazione Avanzata".
*   **Binding dei Campi**: Ogni campo è un `FormField` che lega un componente UI (`Input` o `Switch`) allo stato del form.

**Interazioni e Connessioni**:
*   **Importa**: `useFormContext`, componenti UI, schema Zod da `@/schemas/database`.
*   **Utilizzato da**: `CondizioniPagamentoTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: L'uso di funzioni helper per il rendering dei campi (`renderTextField`, ecc.) è una tecnica efficace per mantenere il codice del form pulito e leggibile, specialmente quando ci sono molti campi ripetitivi. L'uso di `useFormContext` permette di creare questo componente di form modulare e riutilizzabile.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/CondizioniPagamentoTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione delle `CondizionePagamento`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue il pattern standard visto negli altri componenti `...Table.tsx`.
*   **Hook `useAdvancedTable`**: Gestisce il recupero dei dati paginati dall'endpoint `/api/condizioni-pagamento`.
*   **Hook `useCrudTable`**: Gestisce la logica CRUD, lo stato dei dialoghi e il form.
*   **Definizione Colonne**: Definisce le colonne per la tabella, mostrando `id`, `descrizione`, `numeroRate`, `codice` e le azioni.
*   **Azione di Pulizia**: Include un `AlertDialog` per confermare l'operazione di svuotamento totale della tabella, che chiama l'API `clearCondizioniPagamento`.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/condizioniPagamento` e `@/api/database`, schema Zod, componente `CondizionePagamentoForm` e componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/condizioni-pagamento` (CRUD) e `/api/database/condizioni-pagamento` (DELETE all).

**Appunti per il Manuale**:
*   **(Utente)**: "Questa tabella elenca tutte le condizioni di pagamento disponibili nel sistema. È possibile aggiungerne di nuove, modificarle o eliminarle. È anche presente un'opzione per svuotare completamente l'elenco."
*   **(Sviluppatore)**: Implementazione standard del pattern manager per una risorsa CRUD.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/ContiTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione del piano dei conti (`Conto`).

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue il pattern standard.
*   **Caricamento Dati Aggiuntivi**: Oltre ai dati della tabella, carica con `useEffect` l'elenco completo delle `VociAnalitiche` da passare al form di modifica/creazione per popolare la relativa dropdown.
*   **Definizione Colonne**:
    *   Mostra campi chiave come `codice`, `nome`, `tipo`, `livello`, `gruppo`.
    *   La colonna `richiedeVoceAnalitica` visualizza un "Sì" o "No" basato sul valore booleano.
    *   La colonna `vociAnalitiche` mostra i nomi delle voci collegate, unendo l'array in una stringa.
*   **Azione di Pulizia**: Include un `AlertDialog` per l'operazione di svuotamento totale della tabella, che chiama l'API `/api/system/clear-conti`.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/conti` e `@/api/vociAnalitiche`, schema Zod, componente `ContoForm` e componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/conti` (CRUD), `/api/voci-analitiche` (per il form), `/api/system/clear-conti` (DELETE all).

**Appunti per il Manuale**:
*   **(Utente)**: "Questa sezione mostra il piano dei conti completo dell'azienda. Da qui è possibile gestire tutti i conti, specificando il loro tipo e le loro proprietà."
*   **(Sviluppatore)**: Componente manager standard. La gestione della relazione molti-a-molti con `VoceAnalitica` avviene nel form (`ContoForm`), che riceve l'elenco completo delle voci come prop.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/ContoForm.tsx**

**Scopo Principale**: Definisce la struttura del form per la creazione e la modifica di un `Conto`.

**Analisi Dettagliata**:
*   **Componente di Presentazione**: Come altri `...Form.tsx`, è un componente che definisce solo la UI del form.
*   **`useFormContext`**: Accede all'istanza del form dal genitore.
*   **Struttura con `Accordion`**: Organizza l'elevato numero di campi del piano dei conti in sezioni logiche: "Dati Principali", "Classificazione", "Validità Contabilità", "Collegamenti", "Classificazione Fiscale".
*   **Logica Condizionale**: Il `Select` per la `voceAnaliticaId` è disabilitato (`disabled={!form.watch('richiedeVoceAnalitica')}`) a meno che lo switch `richiedeVoceAnalitica` non sia attivo. `form.watch()` è un hook di `react-hook-form` che permette di reagire ai cambiamenti di valore di un campo.

**Interazioni e Connessioni**:
*   **Importa**: `useFormContext`, `VoceAnalitica` da `@prisma/client`, componenti UI, schema Zod.
*   **Utilizzato da**: `ContiTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: L'interfaccia utente di questo form è un buon esempio di come gestire un'entità con una grande quantità di attributi, utilizzando accordioni per non sovraccaricare l'utente. La logica di disabilitazione condizionale del campo `voceAnaliticaId` è una pratica UX efficace.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/FornitoreForm.tsx**

**Scopo Principale**: Definisce la struttura del form per la creazione e la modifica di un'anagrafica `Fornitore`.

**Analisi Dettagliata**:
*   **Componente di Presentazione**: Simile a `ClienteForm`, definisce la UI del form.
*   **`useFormContext`**: Accede all'istanza del form dal genitore (`FornitoriTable.tsx`).
*   **Struttura con `Accordion`**: Organizza i campi in sezioni: "Dati Anagrafici", "Indirizzo", "Contatti", "Riferimenti Fiscali", "Classificazione", "Ritenute e Contributi" (sezione specifica per i fornitori), "Quadro 770", "Pagamenti", "Sottoconti", "Flags".
*   **Gestione Tipi**: Gestisce correttamente la conversione dei valori per i campi numerici (es. `aliquota`) usando `parseFloat` nell'`onChange`.

**Interazioni e Connessioni**:
*   **Importa**: `useFormContext`, componenti UI, `FornitoreFormValues` dallo schema Zod.
*   **Utilizzato da**: `FornitoriTable.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo form è quasi identico a `ClienteForm` ma con l'aggiunta di sezioni specifiche per i dati fiscali dei fornitori. Questo suggerisce che in futuro i due form potrebbero essere unificati o composti da sotto-componenti condivisi per ridurre la duplicazione del codice.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/FornitoriTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia completa (CRUD) per la gestione dell'anagrafica `Fornitore`.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue il pattern standard.
*   **Hooks**: Utilizza `useAdvancedTable` e `useCrudTable`.
*   **Definizione Colonne**: Definisce le colonne per la tabella, mostrando `nome`, `externalId`, `piva`, `codiceFiscale` e le azioni.
*   **Rendering del Form**: All'interno del `Dialog`, renderizza il componente `FornitoreForm` avvolto in un `Form` provider.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable` e `useCrudTable`, API da `@/api/fornitori`, schema Zod, componente `FornitoreForm` e componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/fornitori` per tutte le operazioni CRUD.

**Appunti per il Manuale**:
*   **(Utente)**: "Da questa tabella è possibile visualizzare e gestire l'elenco di tutti i fornitori. È possibile aggiungere, modificare o eliminare un fornitore."
*   **(Sviluppatore)**: Implementazione standard del pattern manager per una risorsa CRUD.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/ScrittureTable.tsx**

**Scopo Principale**: Fornisce un'interfaccia per visualizzare le scritture contabili finalizzate e per eseguire azioni di massa su di esse.

**Analisi Dettagliata**:
*   **Pattern Manager**: Segue il pattern standard per la visualizzazione dei dati con `useAdvancedTable`.
*   **Azioni di Sistema**:
    *   **Consolida Import**: Un pulsante che triggera una `useMutation` per chiamare l'endpoint `/api/system/consolidate-scritture`. Questa azione sposta i dati dalle tabelle di staging delle scritture a quelle di produzione.
    *   **Svuota Scritture**: Un pulsante che, previa conferma tramite `AlertDialog`, chiama l'API `clearScrittureContabili` per eliminare tutte le scritture finalizzate.
*   **Definizione Colonne**: Mostra `data`, `descrizione`, la `causale` associata, il `fornitore` e un campo calcolato `totale`.
*   **Navigazione**: L'azione di "Modifica" non apre un dialogo, ma naviga (`navigate`) alla pagina `/prima-nota/modifica/:id`, riutilizzando il form di creazione per la modifica.

**Interazioni e Connessioni**:
*   **Importa**: Hook `useAdvancedTable`, `useMutation`, API da `@/api/registrazioni` e `@/api/database`, componenti UI.
*   **Utilizzato da**: `Database.tsx`.
*   **Consuma API**: `/api/registrazioni` (per GET e DELETE), `/api/system/consolidate-scritture` (POST), `/api/database/scritture` (DELETE all).

**Appunti per il Manuale**:
*   **(Utente)**: "Questa tabella elenca tutte le registrazioni contabili definitive. Da qui è possibile avviare il 'Consolidamento' per importare nuove scritture, o 'Svuotare' l'intero archivio."
*   **(Sviluppatore)**: Questo componente combina una visualizzazione dati con azioni di sistema potenti. L'uso di `useMutation` per l'azione di consolidamento è una buona pratica per gestire lo stato della chiamata asincrona (es. `isPending`).

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingAnagraficheTable.tsx**

**Scopo Principale**: Fornisce una tabella di **sola lettura** per visualizzare i dati grezzi importati nella tabella `StagingAnagrafica`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Utilizzato per recuperare e visualizzare i dati dall'endpoint `/api/staging/anagrafiche`.
*   **Definizione Colonne**: Le colonne sono definite per mappare i campi della tabella di staging, come `tipoSoggetto`, `denominazione`, `codiceFiscaleClifor`, `partitaIva`, ecc. Non è presente una colonna "Azioni" poiché la tabella è di sola visualizzazione.
*   **Badge per Tipo**: La colonna `tipoSoggetto` usa un `Badge` per distinguere visivamente Clienti ('C') e Fornitori ('F').

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/anagrafiche`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa tabella mostra un'anteprima dei dati di clienti e fornitori così come sono stati letti dal file di importazione, prima che vengano elaborati e salvati definitivamente nel sistema."
*   **(Sviluppatore)**: Componente di visualizzazione puro. Il suo scopo è diagnostico e di controllo, per permettere all'utente di verificare che il parsing del file sia avvenuto correttamente.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingCausaliTable.tsx**

**Scopo Principale**: Fornisce una tabella di sola lettura per i dati nella tabella `StagingCausaleContabile`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Recupera i dati dall'endpoint `/api/staging/causali`.
*   **Definizione Colonne**: Mappa i campi grezzi della tabella di staging, come `codiceCausale`, `descrizione`, `tipoMovimento`, `gestionePartite`, ecc.
*   **Badge per Flag**: Utilizza i `Badge` per visualizzare in modo più leggibile i flag booleani (es. `gestionePartite`).

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/causali`.

**Appunti per il Manuale**:
*   **(Utente)**: "Anteprima delle causali contabili importate dal file, prima della finalizzazione."
*   **(Sviluppatore)**: Componente di visualizzazione diagnostica per il processo di importazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingCodiciIvaTable.tsx**

**Scopo Principale**: Fornisce una tabella di sola lettura per i dati nella tabella `StagingCodiceIva`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Recupera i dati dall'endpoint `/api/staging/codici-iva`.
*   **Definizione Colonne**: Mappa i campi grezzi come `codice`, `descrizione`, `tipoCalcolo`, `aliquota`, ecc.
*   **Formattazione**: Formatta il campo `aliquota` aggiungendo il simbolo '%'.

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/codici-iva`.

**Appunti per il Manuale**:
*   **(Utente)**: "Anteprima dei codici IVA importati dal file, prima della finalizzazione."
*   **(Sviluppatore)**: Componente di visualizzazione diagnostica per il processo di importazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingCondizioniPagamentoTable.tsx**

**Scopo Principale**: Fornisce una tabella di sola lettura per i dati nella tabella `StagingCondizionePagamento`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Recupera i dati dall'endpoint `/api/staging/condizioni-pagamento`.
*   **Definizione Colonne**: Mappa i campi grezzi come `codicePagamento`, `descrizione`, `numeroRate`, e i flag booleani.
*   **Badge per Flag**: Usa i `Badge` per visualizzare i flag come "Sì" o "No".

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/condizioni-pagamento`.

**Appunti per il Manuale**:
*   **(Utente)**: "Anteprima delle condizioni di pagamento importate dal file, prima della finalizzazione."
*   **(Sviluppatore)**: Componente di visualizzazione diagnostica per il processo di importazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingContiTable.tsx**

**Scopo Principale**: Fornisce una tabella di sola lettura per i dati nella tabella `StagingConto`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Recupera i dati dall'endpoint `/api/staging/conti`.
*   **Definizione Colonne**: Definisce un numero elevato di colonne per visualizzare quasi tutti i campi presenti nella tabella di staging, permettendo un'analisi molto dettagliata dei dati importati. Include campi identificativi, descrittivi, di classificazione, di validità e fiscali.
*   **Formattazione**: Formatta la data di importazione (`importedAt`) in un formato leggibile.
*   **Stile**: Utilizza `min-w-[...]` e `truncate` per gestire la visualizzazione di molte colonne in uno spazio limitato, migliorando la leggibilità.

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/conti`.

**Appunti per il Manuale**:
*   **(Utente)**: "Questa tabella mostra un'anteprima molto dettagliata del piano dei conti così come letto dal file di importazione. Permette di verificare tutti i parametri prima di renderli definitivi."
*   **(Sviluppatore)**: La completezza delle colonne rende questo componente uno strumento di debug molto potente per il processo di importazione del piano dei conti.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/StagingScrittureTable.tsx**

**Scopo Principale**: Fornisce una tabella di sola lettura per le testate delle scritture contabili nella tabella `StagingTestata`.

**Analisi Dettagliata**:
*   **Hook `useAdvancedTable`**: Recupera i dati dall'endpoint `/api/staging/scritture`.
*   **Definizione Colonne**: Mostra i campi principali della testata di una scrittura: `codiceUnivocoScaricamento`, `descrizioneCausale`, `dataRegistrazione`, `numeroDocumento`, `totaleDocumento`, e il codice fiscale del cliente/fornitore.
*   **Formattazione Data**: Formatta correttamente il campo `dataRegistrazione` e `createdAt`.

**Interazioni e Connessioni**:
*   **Importa**: `useAdvancedTable`, `AdvancedDataTable`, componenti UI.
*   **Utilizzato da**: `StagingPage.tsx`.
*   **Consuma API**: `/api/staging/scritture`.

**Appunti per il Manuale**:
*   **(Utente)**: "Anteprima delle registrazioni contabili importate, prima della finalizzazione."
*   **(Sviluppatore)**: Componente di visualizzazione diagnostica per le testate delle scritture. Per un'analisi completa, sarebbe necessario un modo per visualizzare anche le righe contabili e IVA associate a ogni testata, magari tramite una riga espandibile.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/database/VoceAnaliticaForm.tsx**

**Scopo Principale**: Definisce il form per la creazione e la modifica di una `VoceAnalitica`.

**Analisi Dettagliata**:
*   **Componente Obsoleto/Duplicato**: Questo componente sembra essere una versione precedente o duplicata di `src/components/admin/VoceAnaliticaForm.tsx`. La logica è molto simile.
*   **Form Semplice**: Contiene campi per `nome` e `descrizione`. Manca il campo `tipo` ('Costo'/'Ricavo'), che è invece presente nella versione in `/admin`.
*   **Logica**: Gestisce il form con `react-hook-form` e `zodResolver`.

**Interazioni e Connessioni**:
*   **Importa**: `react-hook-form`, `zodResolver`, `voceSchema`, componenti UI.
*   **Utilizzato da**: Potenzialmente non utilizzato, dato che `VociAnaliticheManager.tsx` in `/admin` usa la sua versione del form.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è probabilmente un residuo di una precedente struttura del progetto. La versione in `src/components/admin/VoceAnaliticaForm.tsx` è più completa e probabilmente quella attualmente in uso. Questo file potrebbe essere candidato alla rimozione per pulizia del codice.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/dialogs**

**Scopo Principale della Cartella**: Contiene componenti React che rappresentano dialoghi modali complessi, utilizzati per interazioni specifiche che richiedono un input utente focalizzato, come la modifica di un budget.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/dialogs/EditBudgetDialog.tsx**

**Scopo Principale**: Fornisce un'interfaccia modale per modificare la ripartizione del budget di una commessa tra diverse voci analitiche.

**Analisi Dettagliata**:
*   **Stato Locale**: Utilizza `useState` per gestire `budgetItems`, un array che rappresenta le singole voci di budget che l'utente sta modificando.
*   **Logica di Ripartizione**:
    *   `totalBudget`: Calcola dinamicamente la somma degli importi inseriti dall'utente.
    *   `budgetDifference`: Calcola la differenza tra il budget ripartito e il budget totale della commessa, fornendo un feedback immediato all'utente.
    *   `handleAddItem`, `handleRemoveItem`, `handleUpdateItem`: Funzioni per manipolare l'array `budgetItems`, permettendo all'utente di aggiungere, rimuovere e modificare dinamicamente le righe di budget.
*   **UI Interattiva**:
    *   Mostra un riepilogo con "Budget Originale", "Budget Ripartito" e "Differenza".
    *   La "Differenza" cambia colore e icona (`getBudgetStatusColor`, `getBudgetStatusIcon`) in base all'entità dello scostamento, fornendo un feedback visivo immediato.
    *   Permette di aggiungere nuove voci di budget da una lista predefinita di `vociAnalitiche`.
*   **Salvataggio**: La logica di salvataggio è delegata al componente padre tramite la callback `onSave`, passando l'array aggiornato di `budgetItems`.

**Interazioni e Connessioni**:
*   **Importa**: `CommessaWithPerformance` dall'API, e vari componenti UI da `shadcn/ui`.
*   **Utilizzato da**: `CommessaDettaglio.tsx` o `CommessaActionMenu.tsx` (anche se non esplicitamente visibile nel codice fornito, è la sua collocazione logica). Viene attivato quando l'utente sceglie di modificare il budget di una commessa.
*   **Consuma API**: Nessuna direttamente. Riceve i dati della commessa come prop e restituisce i dati modificati tramite la callback `onSave`.

**Appunti per il Manuale**:
*   **(Utente)**: "Quando si modifica il budget di una commessa, si apre una finestra che permette di suddividere l'importo totale tra diverse categorie di costo o ricavo (voci analitiche). Il sistema mostra in tempo reale se la somma delle parti corrisponde al budget totale."
*   **(Sviluppatore)**: Componente "controllato" che gestisce uno stato locale complesso (un array di oggetti) e lo restituisce al genitore per la persistenza. La logica di validazione visuale in tempo reale (la differenza di budget) è un'ottima feature di UX. La lista di `vociAnalitiche` è attualmente hardcoded; in una versione futura, dovrebbe essere passata come prop o recuperata tramite API.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/components/layout**

**Scopo Principale della Cartella**: Contiene componenti React che definiscono la struttura e il layout generale delle pagine dell'applicazione.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/components/layout/TabbedViewLayout.tsx**

**Scopo Principale**: Fornisce un layout riutilizzabile per pagine che presentano contenuti organizzati in tab verticali.

**Analisi Dettagliata**:
*   **Componente Generico**: È progettato per essere riutilizzabile. Riceve un array di `TabConfig` come prop, dove ogni oggetto definisce una tab (chiave, etichetta, icona, componente da renderizzare, e un contatore opzionale).
*   **Stato Locale**: Usa `useState` per tenere traccia della `selectedTab` attiva.
*   **Struttura a Due Colonne**:
    1.  **Colonna Sinistra (Navigazione)**: Renderizza un elenco di `Button` che rappresentano le tab. Il pulsante della tab attiva ha uno stile diverso (`variant="secondary"`). Ogni pulsante, al click, aggiorna lo stato `selectedTab`. Mostra anche un `Badge` con il conteggio dei record, se fornito.
    2.  **Colonna Destra (Contenuto)**: Renderizza dinamicamente il componente associato alla tab attualmente selezionata (`tabs.find(t => t.key === selectedTab)?.component`).
*   **Gestione del Caricamento**: Mostra uno scheletro di caricamento (`Skeleton`) se la prop `isLoading` è `true`, migliorando l'esperienza utente durante il fetching iniziale dei dati.

**Interazioni e Connessioni**:
*   **Importa**: Componenti UI `Skeleton`, `Button`, `Badge`.
*   **Utilizzato da**: `Database.tsx` e `Staging.tsx` per organizzare le numerose tabelle di dati in un'interfaccia pulita e navigabile.

**Appunti per il Manuale**:
*   **(Utente)**: "Le sezioni Database e Staging utilizzano una vista a schede. Sulla sinistra si trova l'elenco delle tabelle disponibili, e cliccando su una di esse, il contenuto corrispondente viene visualizzato sulla destra."
*   **(Sviluppatore)**: Questo è un ottimo esempio di un componente di layout riutilizzabile. Astrarre la logica di navigazione a tab permette di mantenere i componenti delle pagine (come `Database.tsx`) focalizzati solo sul fornire la configurazione delle tab, senza doversi preoccupare della logica di rendering e di stato.

---
---

### **Cartella: G:/HSC/Reale/commessa-control-hub/src/schemas**

**Scopo Principale della Cartella**: Centralizza la definizione degli schemi di validazione utilizzando la libreria **Zod**. Questi schemi sono la "fonte di verità" per la forma dei dati nei form del frontend e sono cruciali per garantire che i dati inviati al backend siano corretti e completi.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/schemas/database.ts**

**Scopo Principale**: Definisce gli schemi Zod per le principali entità del database gestite tramite form nell'interfaccia utente.

**Analisi Dettagliata**:
*   **`baseSchema`**: Definisce uno schema di base con campi comuni (`nome`, `externalId`), ma non sembra essere utilizzato attivamente.
*   **`causaleSchema`**: Schema molto dettagliato per `CausaleContabile`. Definisce ogni campo con il suo tipo (stringa, data, booleano) e le relative regole di validazione (es. `min(2, ...)`). I campi opzionali sono marcati con `.optional().nullable()`.
*   **`codiceIvaSchema`**: Altro schema complesso che mappa tutti i campi del modello `CodiceIva`, inclusi i numerosi flag booleani e campi numerici.
*   **`condizioneSchema`**: Schema per `CondizionePagamento`.
*   **`contoSchema`**: Schema per `Conto`. Utilizza `z.nativeEnum(TipoConto)` per validare che il campo `tipo` corrisponda a uno dei valori dell'enum di Prisma.
*   **`commessaSchema`**: Schema per `Commessa`.
*   **`clienteSchema` e `fornitoreSchema`**: `fornitoreSchema` estende (`.extend`) `clienteSchema`, aggiungendo i campi specifici per i fornitori. Questo è un ottimo pattern per ridurre la duplicazione del codice tra due entità molto simili.
*   **Esportazione Tipi**: Per ogni schema, viene esportato anche il tipo TypeScript inferito (es. `export type ClienteFormValues = z.infer<typeof clienteSchema>;`), che viene poi utilizzato nei componenti per garantire la type-safety.

**Interazioni e Connessioni**:
*   **Importa**: `zod`, `TipoConto` da `@prisma/client`.
*   **Utilizzato da**: Tutti i componenti che contengono form di creazione/modifica (es. `ClientiTable.tsx`, `ContiTable.tsx`) e dall'hook `useCrudTable`, che lo usa nel `zodResolver` per validare i dati del form.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questa cartella è fondamentale per la validazione dei dati nel frontend. Qualsiasi modifica a un form di creazione/modifica di un'entità del database dovrebbe iniziare con un aggiornamento dello schema Zod corrispondente in questo file. L'uso di `zodResolver` in `useCrudTable` collega automaticamente questi schemi ai form di `react-hook-form`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/schemas/regolaRipartizioneSchema.ts**

**Scopo Principale**: Definisce lo schema di validazione Zod specifico per l'entità `RegolaRipartizione`.

**Analisi Dettagliata**:
*   **`regolaRipartizioneSchema`**: Definisce i campi necessari per una regola:
    *   `descrizione`: Stringa non vuota.
    *   `percentuale`: Numero compreso tra 0 e 100.
    *   `contoId`, `commessaId`, `voceAnaliticaId`: Stringhe non vuote, garantendo che l'utente abbia selezionato un valore dalle dropdown.
*   **`RegolaRipartizioneInput`**: Esporta il tipo inferito, che verrà utilizzato nel componente del form e nella chiamata API.

**Interazioni e Connessioni**:
*   **Importa**: `zod`.
*   **Utilizzato da**: `RegolaRipartizioneForm.tsx` (tramite `zodResolver`) e `useCrudTable` in `RegoleRipartizioneManager.tsx`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Isolare lo schema per una singola entità in un file dedicato è una buona pratica che mantiene il codice organizzato, specialmente quando gli schemi diventano più complessi.

---
---

### **Cartella Radice: G:/HSC/Reale/commessa-control-hub/src**

**Scopo Principale**: Contiene i file di configurazione e di entry point per l'applicazione frontend React.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/App.tsx**

**Scopo Principale**: È il componente radice dell'applicazione React. Configura i provider globali e il sistema di routing.

**Analisi Dettagliata**:
*   **Provider Globali**:
    *   `QueryClientProvider`: Fornisce il contesto per `@tanstack/react-query`, abilitando il caching delle chiamate API, il refetching automatico e la gestione dello stato del server.
    *   `TooltipProvider`: Abilita i tooltip in tutta l'applicazione.
    *   `BrowserRouter`: Abilita il routing lato client.
*   **Toaster**: Include i componenti `<Toaster />` (per `shadcn/ui`) e `<Sonner />` (per `sonner`), che sono i container dove verranno visualizzate le notifiche toast.
*   **Routing (`<Routes>` e `<Route>`)**:
    *   Definisce un `Layout` principale che avvolge tutte le pagine.
    *   Mappa ogni percorso URL (es. `/`, `/commesse`, `/commesse/:id`) al componente della pagina corrispondente (es. `Dashboard`, `Commesse`, `CommessaDettaglio`).
    *   Include una route "catch-all" (`path="*"`) che renderizza il componente `NotFound` per qualsiasi URL non corrispondente.

**Interazioni e Connessioni**:
*   **Importa**: Tutti i componenti di pagina da `/src/pages` e i provider necessari.
*   **Utilizzato da**: `main.tsx`, che lo renderizza nell'elemento `#root` dell'HTML.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo è il punto di partenza per capire la struttura di navigazione dell'applicazione. Per aggiungere una nuova pagina, è necessario creare il componente in `/pages` e aggiungere una nuova rotta qui.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/index.css**

**Scopo Principale**: Definisce gli stili CSS globali e le variabili di tema per l'applicazione, utilizzando le direttive di **Tailwind CSS**.

**Analisi Dettagliata**:
*   **Direttive `@tailwind`**: Importa i layer di base, dei componenti e delle utility di Tailwind CSS.
*   **Layer `@layer base`**:
    *   **:root**: Definisce le variabili CSS per il tema di default (chiaro). Specifica i colori per `background`, `foreground`, `primary`, `secondary`, `destructive`, `card`, `popover`, `border`, `input`, `ring`. Definisce anche il raggio dei bordi (`--radius`).
    *   **.dark**: Definisce le stesse variabili CSS ma con valori adatti per il tema scuro.
    *   **Stili di Base**: Applica stili globali di base, come il colore di sfondo e del testo al `<body>`.

**Interazioni e Connessioni**:
*   **Utilizzato da**: `main.tsx`, che lo importa per applicare gli stili a tutta l'applicazione.
*   **Configurazione**: La sua esistenza è referenziata in `tailwind.config.ts`.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo file è il centro del design system dell'applicazione. Per modificare un colore di base (es. il colore primario), la modifica va fatta qui, nelle variabili CSS. Questo garantisce coerenza in tutta la UI.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/main.tsx**

**Scopo Principale**: È il punto di ingresso (entry point) dell'applicazione React.

**Analisi Dettagliata**:
*   **`createRoot`**: Utilizza la nuova API di React 18 per renderizzare l'applicazione.
*   **Rendering del Componente Radice**: Seleziona l'elemento HTML con `id="root"` (definito in `index.html`) e vi renderizza all'interno il componente `<App />`.
*   **Importazione CSS**: Importa il file `index.css`, rendendo gli stili Tailwind disponibili globalmente.

**Interazioni e Connessioni**:
*   **Importa**: `React`, `createRoot` da `react-dom/client`, il componente `App` e il file `index.css`.
*   **Contesto**: È lo script referenziato in `index.html` che avvia l'intera applicazione React nel browser.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: Questo è il file che "accende" l'applicazione nel browser. Non viene modificato spesso, a meno che non si debbano aggiungere provider globali che devono avvolgere l'intera applicazione, anche al di fuori del `BrowserRouter`.

---

### **File: G:/HSC/Reale/commessa-control-hub/src/vite-env.d.ts**

**Scopo Principale**: È un file di dichiarazione dei tipi per TypeScript, specifico per progetti Vite.

**Analisi Dettagliata**:
*   **`/// <reference types="vite/client" />`**: Questa è una "triple-slash directive". Indica a TypeScript di includere le definizioni dei tipi fornite dal pacchetto `vite/client`. Questo permette a TypeScript di riconoscere funzionalità specifiche di Vite, come l'importazione di asset statici (es. `import logo from './logo.svg'`).

**Interazioni e Connessioni**:
*   **Utilizzato da**: Il compilatore TypeScript durante la fase di controllo dei tipi.

**Appunti per il Manuale**:
*   **(Sviluppatore)**: File di configurazione standard per un progetto Vite + TypeScript. Non richiede modifiche manuali.