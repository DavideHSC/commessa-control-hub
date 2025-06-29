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

*   **STATO:** 🟧 **DA ANALIZZARE**
*   **Obiettivo:** Assicurarsi che nessun altro workflow di importazione di anagrafiche utilizzi una strategia distruttiva e che gestiscano correttamente le logiche di business specifiche (es. validità temporale).
*   **Workflow da Ispezionare:**
    *   `importCausaliContabiliWorkflow.ts`
    *   `importCodiciIvaWorkflow.ts`
    *   `importCondizioniPagamentoWorkflow.ts`
    *   `importPianoDeiContiWorkflow.ts`
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

### **4. Considerazioni sull'Interfaccia Utente**

*   **Impatto:** Inizialmente nullo. Queste modifiche sono a livello di backend.
*   **Opportunità Futura:** L'interfaccia di importazione potrebbe essere migliorata per dare all'utente un feedback più chiaro su quanti record sono stati creati (`created`) e quanti aggiornati (`updated`), invece di un generico "record importati". Questo, tuttavia, è un miglioramento successivo e non bloccante. 