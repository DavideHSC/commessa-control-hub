# Piano Strategico: Refactoring della Logica di Importazione Anagrafiche

**ID:** `PLAN-07`
**Data:** 29 Giugno 2025
**Obiettivo:** Abbandonare la strategia di importazione "distruggi e ricrea" per tutte le anagrafiche, sostituendola con una logica non distruttiva di tipo **Upsert (Update or Insert)**, nel pieno rispetto delle regole di integrità referenziale e di business emerse dall'analisi dei tracciati.

---

### **1. Analisi del Problema**
*   **Problema:** L'attuale workflow di importazione per le anagrafiche (in particolare `A_CLIFOR.TXT`) è stato progettato con una logica distruttiva. Prima di inserire i nuovi dati, tenta di eliminare record esistenti da tabelle correlate, come `Commessa` e `ScritturaContabile`.
*   **Impatto:** Questo causa un errore `Foreign key constraint failed` non appena nel sistema esistono dati collegati (es. scritture contabili importate con successo). Questo non è un bug, ma il **comportamento corretto** di un database che protegge la propria integrità. L'approccio attuale blocca completamente l'aggiornamento delle anagrafiche in un sistema operativo.
*   **Causa Radice:** Difetto di progettazione. La strategia "cancella e sostituisci" è valida solo per il primissimo popolamento di un database vuoto, ma è insostenibile e pericolosa per la manutenzione ordinaria.

---

### **2. Principi Guida (Aggiornati dall'Analisi)**

*   **Integrità dei Dati Sopra Ogni Cosa:** Nessuna operazione di importazione di un'anagrafica (es. Clienti) deve mai poter causare la cancellazione di dati appartenenti a un altro dominio (es. Scritture Contabili).
*   **Gerarchia delle Chiavi:** La logica di collegamento deve rispettare la precedenza definita dai tracciati: il **Codice Fiscale** è il metodo primario di identificazione, la **Sigla** è il metodo di fallback.
*   **Idempotenza:** La logica di Upsert è l'unica strategia accettabile. Deve garantire che rieseguire un'importazione più volte produca sempre lo stesso risultato finale, aggiornando i record se esistono e creandoli se non esistono.

---

### **3. Piano d'Azione Dettagliato**

L'intervento si concentrerà sulla revisione di tutti i workflow di importazione delle anagrafiche.

#### **FASE 1: Refactoring Critico del Workflow `importAnagraficheWorkflow` (`A_CLIFOR.TXT`)**

*   **STATO:** 🟥 **DA ESEGUIRE (Priorità Massima)**
*   **File Coinvolto:** `server/import-engine/orchestration/workflows/importAnagraficheWorkflow.ts`
*   **Obiettivo:** Rendere l'importazione di Clienti e Fornitori non distruttiva e allineata alle regole di business.
*   **Analisi Specifica del File:** L'ispezione del codice ha confermato la presenza di un blocco `prisma.$transaction` che esegue `deleteMany` su 6 tabelle (incluse `Commessa` e `ScritturaContabile`) prima di procedere con `create` per Clienti e Fornitori. Questa è la sezione da rifattorizzare.
*   **Azione 1.1 (Rimozione Logica Distruttiva):**
    *   Individuare ed **eliminare** senza alcuna esitazione l'intero blocco di comandi `deleteMany` (attualmente alle righe 188-199 del file). La nuova logica di upsert lo renderà completamente obsoleto.
*   **Azione 1.2 (Verifica e Adeguamento Schema Prisma):**
    *   Prima di implementare l'upsert, verificare nel file `prisma/schema.prisma` che i campi scelti come identificatori univoci (es. `piva`, `codiceFiscale`) siano contrassegnati come `@unique`. Se così non fosse, creare una nuova migrazione per aggiungervi il vincolo.
*   **Azione 1.3 (Implementazione Logica Upsert):**
    *   Modificare la fase di persistenza dei dati all'interno della transazione.
    *   Sostituire i cicli che usano `prisma.cliente.create` e `prisma.fornitore.create` con chiamate a `prisma.cliente.upsert` e `prisma.fornitore.upsert`.
    *   **Chiave di `upsert`**: Implementare una logica di selezione della chiave. La clausola `where` dell'upsert dovrà usare `piva` se presente, altrimenti `codiceFiscale`. I record privi di entrambi gli identificatori verranno skippati e loggati come avviso.
    *   **Payload `create` e `update`**: Il payload sarà lo stesso oggetto `cliente` o `fornitore` sia per la creazione che per l'aggiornamento.
*   **Criteri di Successo:**
    *   ✅ L'importazione di `A_CLIFOR.TXT` deve completarsi con successo anche se sono presenti scritture contabili e commesse nel database.
    *   ✅ I clienti/fornitori esistenti devono essere aggiornati con i nuovi dati in base al loro identificatore univoco.
    *   ✅ I nuovi clienti/fornitori devono essere creati.
    *   ✅ Nessun dato relativo a commesse o scritture deve essere stato alterato o cancellato.

#### **FASE 2: Revisione e Allineamento degli Altri Workflow di Anagrafiche**

*   **STATO:** 🟡 **IN CORSO (2/4 completati)**
*   **Obiettivo:** Assicurarsi che nessun altro workflow di importazione di anagrafiche utilizzi una strategia distruttiva e che gestiscano correttamente le logiche di business specifiche (es. validità temporale).
*   **Workflow da Ispezionare:**
    *   ✅ `importCausaliContabiliWorkflow.ts` - **COMPLETATO**
    *   ✅ `importCodiciIvaWorkflow.ts` - **COMPLETATO**
    *   🟧 `importCondizioniPagamentoWorkflow.ts` - **DA ANALIZZARE**
    *   🟧 `importPianoDeiContiWorkflow.ts` - **DA ANALIZZARE**
*   **Azione 2.1 (Analisi):**
    *   Per ciascun workflow, verificare:
        1.  Se esegue operazioni di `deleteMany` all'inizio del processo.
        2.  Se considera i campi di validità temporale (`dataInizioValidita`, `dataFineValidita`) dove presenti.
*   **Azione 2.2 (Correzione se Necessario):**
    *   Se viene trovata una logica distruttiva, applicare lo stesso pattern di refactoring della Fase 1: rimuovere il `deleteMany` e sostituire `create` con `upsert`.
    *   **Logica di business avanzata:** Per i workflow con validità temporale (es. Causali, Codici IVA), l'operazione di `upsert` non è sufficiente. La logica dovrà essere più sofisticata per gestire la storicizzazione, potenzialmente disattivando i record vecchi (`dataFineValidita = oggi`) e creandone di nuovi, invece di sovrascriverli.
*   **Criteri di Successo:**
    *   ✅ Tutti i workflow di importazione delle anagrafiche sono non distruttivi e idempotent.
    *   ✅ I workflow gestiscono correttamente la validità temporale dei record, garantendo che le ricerche future possano trovare il record corretto per una data specifica.

---

### **4. Stato di Avanzamento e Insight**

#### **Workflow `importAnagraficheWorkflow` (`A_CLIFOR.TXT`)**
*   **STATO:** ✅ **COMPLETATA**
*   **INSIGHTS / PROBLEMI INCONTRATI:**
    *   L'analisi dello `schema.prisma` ha rivelato che `piva` e `codiceFiscale` non avevano un vincolo di unicità. Si è scelto di usare `externalId` come chiave per l'operazione `upsert`, non richiedendo modifiche allo schema.
    *   Durante i test è emerso un errore di `Transaction Timeout` (`P2028`) a causa dell'elevato numero di operazioni di scrittura. Il problema è stato risolto aumentando il parametro `timeout` nella chiamata `prisma.$transaction`.
    *   Le statistiche di output sono state migliorate per distinguere i record **creati** da quelli **aggiornati**.

#### **Workflow `importCausaliContabiliWorkflow` (`CAUSALI.TXT`)**
*   **STATO:** ✅ **COMPLETATA**
*   **INSIGHTS / PROBLEMI INCONTRATI:**
    *   L'analisi iniziale ha mostrato che il workflow non era distruttivo, ma usava `createMany` con `skipDuplicates`, impedendo l'aggiornamento dei record esistenti. La logica è stata sostituita con un ciclo di `upsert`.
    *   Durante i test è emerso un errore di parsing delle date (`Expected ISO-8601 DateTime`). La causa principale era duplice:
        1.  Un bug nella funzione di conversione delle date nel file `causaleContabileValidator.ts`.
        2.  L'interfaccia utente stava chiamando una rotta API deprecata che usava un vecchio script di importazione non allineato alla nuova architettura.
    *   **Soluzione Adottata:** Il bug nel validatore è stato corretto. Si è preso atto che il test deve essere eseguito sulla rotta corretta (`/api/v2/...`) che invoca il nuovo workflow, rendendo obsoleto l'intervento sui vecchi script.

#### **Workflow `importCodiciIvaWorkflow` (`CODICIVA.TXT`)**
*   **STATO:** ✅ **COMPLETATA**
*   **INSIGHTS / PROBLEMI INCONTRATI:**
    *   **Problema Architetturale Maggiore:** Il workflow esistente aveva un'architettura completamente diversa e incompatibile rispetto ai workflow funzionanti (anagrafiche e causali). Questo ha causato un lungo processo di debug e refactoring.
    *   **Problemi Specifici Incontrati e Soluzioni:**
        1.  **Errore di Conversione Dati nel Transformer:** Il `codiceIvaTransformer.ts` non convertiva i campi numerici da stringa a numero, causando `Expected Float or Null, provided String`. **Soluzione:** Implementata logica di conversione per tutti i campi numerici e booleani.
        2.  **Interfaccia Utente su Rotta Deprecata:** Durante i test, l'interfaccia chiamava la vecchia rotta API (`/api/import/anagrafiche/codici_iva`) invece della nuova (`/api/v2/import/codici-iva`). **Soluzione:** Aggiornato il frontend per usare la rotta V2 corretta.
        3.  **Handler Incompatibile:** Il `codiceIvaHandler.ts` seguiva un pattern completamente diverso dai handler funzionanti, passando parametri errati al workflow. **Soluzione:** Riscritto il handler per seguire esattamente il pattern del `anagraficaHandler.ts` che funziona.
        4.  **Workflow con Architettura Errata:** Il workflow originale si aspettava un `filePath` invece del `fileContent`, aveva interfacce complesse e non seguiva il pattern consolidato. **Soluzione:** Riscritto completamente il workflow per seguire il pattern semplice e funzionante del `importCausaliContabiliWorkflow.ts`.
        5.  **Errore di Nomenclatura Template:** Il workflow cercava il template `'codici-iva'` (con trattino) ma nel database era salvato come `'codici_iva'` (con underscore), causando 0 record processati. **Soluzione:** Corretto il nome del template nel workflow.
    *   **Pattern di Refactoring Adottato:** Invece di cercare di riparare l'architettura esistente, si è scelto di riscrivere completamente il workflow seguendo pedissequamente il pattern consolidato e funzionante delle causali contabili.
    *   **Lezioni Apprese per il Futuro:**
        *   **Principio di Coerenza:** Prima di modificare un workflow che non funziona, analizzare sempre un workflow simile che funziona e seguire esattamente lo stesso pattern.
        *   **Verifica Nomenclatura:** Sempre verificare che i nomi dei template nel codice corrispondano esattamente a quelli nel database.
        *   **Test su Rotta Corretta:** Assicurarsi che l'interfaccia utente stia chiamando la rotta API corretta (V2) e non quella deprecata.
        *   **Architettura Semplice:** Preferire sempre l'architettura più semplice e consolidata: `fileContent` → `parseFixedWidth` → `validator` → `transformer` → `upsert`.

---

### **5. Guida al Troubleshooting per Problemi Simili**

#### **Checklist per Debug di Workflow di Importazione Non Funzionanti:**

1.  **Verifica Rotta API:**
    *   L'interfaccia utente sta chiamando `/api/v2/import/[entity]` o la vecchia rotta deprecata?
    *   Controllare in `src/pages/Import.tsx` l'URL della chiamata `fetch`.

2.  **Verifica Nome Template:**
    *   Il nome del template nel workflow corrisponde esattamente a quello nel database?
    *   Controllare in `prisma/seed.ts` il campo `name` del template.
    *   Verificare che non ci siano discrepanze tra trattini (`-`) e underscore (`_`).

3.  **Verifica Pattern del Handler:**
    *   Il handler segue lo stesso pattern dei handler funzionanti?
    *   Confrontare con `anagraficaHandler.ts` o `causaleContabileHandler.ts`.
    *   Il handler passa `fileContent` al workflow, non `filePath` o altri parametri complessi?

4.  **Verifica Pattern del Workflow:**
    *   Il workflow segue il pattern semplice: `fileContent` → `parseFixedWidth` → `validator` → `transformer` → `upsert`?
    *   Confrontare con `importCausaliContabiliWorkflow.ts` che è il pattern di riferimento.

5.  **Verifica Transformer:**
    *   Il transformer converte correttamente i tipi di dati (stringhe → numeri, stringhe → booleani)?
    *   Controllare che non ci siano errori di tipo `Expected Float or Null, provided String`.

6.  **Verifica Validator:**
    *   Il validator gestisce correttamente le conversioni di data e i campi booleani?
    *   Controllare le funzioni di preprocessing (`toDate`, `toBoolean`, etc.).

#### **Pattern di Refactoring Raccomandato:**

Quando un workflow non funziona, **NON** tentare di ripararlo pezzo per pezzo. Invece:

1.  Identificare un workflow simile che funziona (es. `importCausaliContabiliWorkflow.ts`).
2.  Copiare l'intera struttura del workflow funzionante.
3.  Adattare solo i nomi delle entità, dei campi e dei template.
4.  Mantenere identica l'architettura, la gestione degli errori e il flusso di dati.

Questo approccio è molto più veloce e affidabile del debug incrementale.

---

### **6. Considerazioni sull'Interfaccia Utente**

*   **Impatto:** Inizialmente nullo. Queste modifiche sono a livello di backend.
*   **Opportunità Futura:** L'interfaccia di importazione potrebbe essere migliorata per dare all'utente un feedback più chiaro su quanti record sono stati creati (`created`) e quanti aggiornati (`updated`), invece di un generico "record importati". Questo, tuttavia, è un miglioramento successivo e non bloccante. 