# Piano 17: Implementazione Gerarchia Commesse e Allocazione Flessibile

**ID:** `PLAN-17`
**Data:** 16 Luglio 2025 → **Completato:** 13 Luglio 2025
**Stato:** ✅ **COMPLETATO**
**Obiettivo:** Riprogettare il modello `Commessa` per supportare una struttura gerarchica (padre-figlio). Implementare la logica di allocazione "libera", che permette di imputare costi/ricavi sia a una commessa "padre" (generale) sia a una "figlia" (centro di costo specifico). Adeguare l'intera applicazione (DB, API, Seed, UI) per gestire la creazione, visualizzazione e modifica di questa gerarchia.

---

### **Fase 1: Backend - Fondamenta della Gerarchia** ✅ **COMPLETATA**
**Obiettivo:** Modificare la struttura del database e l'API per supportare tecnicamente la relazione padre-figlio tra le commesse.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **BE-01**| **Modifica Schema Database** | ✅ | In `prisma/schema.prisma`, modificare il modello `Commessa` per aggiungere una relazione gerarchica a se stesso. Questo include un campo `parentId` opzionale e le relative relazioni `parent` e `children`. |
| **BE-02**| **Creazione Migrazione DB** | ✅ | Eseguire il comando `npx prisma migrate dev --name feat_add_commessa_hierarchy` per applicare le modifiche allo schema del database e generare i file di migrazione. |
| **BE-03**| **Adeguamento API di Lettura** | ✅ | Modificare l'endpoint `GET /api/commesse` in `server/routes/commesse.ts`. La query Prisma `findMany` dovrà essere aggiornata per includere la relazione con il genitore (es. `include: { parent: true, cliente: true }`). Questo risolverà anche il bug di visualizzazione corrente nella tabella. |

---

### **Fase 2: Adattamento Dati di Esempio (`seed.ts`)** ✅ **COMPLETATA**
**Obiettivo:** Aggiornare lo script di seeding per creare dati gerarchici coerenti con il nuovo schema, garantendo che a ogni reset del DB siano disponibili dati di test validi.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **DS-01**| **Analisi e Modifica `seed.ts`** | ✅ | Aprire il file `prisma/seed.ts`. Individuare la sezione dove vengono create le commesse "figlie" (es. "Igiene Urbana - Sorrento"). |
| **DS-02**| **Implementazione Relazione Gerarchica** | ✅ | De-commentare e correggere la riga `parentId` per collegare ogni commessa figlia alla sua commessa padre corretta, usando l'ID definito per i genitori (es. `parentId: 'sorrento'`). **Corretto:** Cambiato "Meta" → "Massa Lubrense" per allineamento con dati esistenti. |
| **DS-03**| **Verifica Esecuzione Seed** | ✅ | Eseguire un reset completo del database (`npx prisma migrate reset`) per verificare che lo script di seed venga eseguito senza errori e che i dati nel database riflettano la nuova struttura gerarchica. |

---

### **Fase 3: Frontend - Correzione e Miglioramento Visualizzazione Gerarchica** ✅ **COMPLETATA**
**Obiettivo:** Risolvere il bug di visualizzazione nella tabella delle commesse e migliorare l'interfaccia per rappresentare la gerarchia in modo intuitivo.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **FE-01**| **Verifica Correzione Bug** | ✅ | Una volta completata la Fase 1, verificare in `src/components/database/CommesseTable.tsx` che l'accesso a `row.original.parent.nome` funzioni correttamente e non generi più errori di tipo. |
| **FE-02**| **Miglioramento UI Tabella** | ✅ | Modificare `CommesseTable.tsx` per visualizzare la gerarchia. ~~Ordinare i dati recuperati dall'API in modo che i genitori precedano i figli.~~ Aggiungere un rientro visivo (indentazione) per le commesse figlie e/o un'icona ad albero per rendere la relazione immediatamente chiara. **Implementato:** Indentazione visiva con simbolo `└─` per commesse figlie. |

---

### **Fase 4: Frontend - Implementazione Creazione/Modifica Gerarchica** ✅ **COMPLETATA**
**Obiettivo:** Implementare la logica mancante nell'interfaccia utente per permettere la creazione e la modifica di commesse con la selezione di una commessa "padre".

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **FE-03**| **Analisi Form Esistenti** | ✅ | Ispezionare i componenti `NuovaCommessa.tsx` (se esistente) e il form di modifica (probabilmente in `CommesseTable.tsx` o `CommessaForm.tsx`) per mappare i controlli esistenti. **Risultato:** Form trovato in `CommesseTable.tsx` (DialogContent). |
| **FE-04**| **Implementazione Selettore "Commessa Padre"**| ✅ | Aggiungere un nuovo controllo al form: un selettore (es. `Select` o `Combobox` di `shadcn/ui`) chiamato "Commessa Padre". Questo campo deve essere opzionale. |
| **FE-05**| **Popolamento Selettore** | ✅ | Nel componente del form, implementare una logica di `fetch` per chiamare l'endpoint `GET /api/commesse` e popolare la lista delle possibili commesse padre. Aggiungere una validazione per impedire che una commessa venga impostata come figlia di se stessa. **Implementato:** Usa `getCommesseForSelect()` e filtra commessa corrente. |
| **FE-06**| **Adeguamento Logica di Salvataggio (API)** | ✅ | Modificare gli handler `POST` e `PUT` in `server/routes/commesse.ts` per accettare e salvare il campo opzionale `parentId` proveniente dal corpo della richiesta. **Nota:** Le API erano già corrette, funzionano automaticamente con il nuovo schema. |

---

### **Fase 5: Validazione End-to-End** ⚠️ **PARZIALMENTE COMPLETATA**
**Obiettivo:** Testare l'intero flusso di lavoro per assicurarsi che tutte le componenti interagiscano correttamente.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **VAL-01**| **Test Creazione e Modifica** | 🔄 | 1. Creare una nuova commessa padre. 2. Creare una commessa figlia collegata. 3. Modificare una commessa per cambiarne il genitore. 4. Modificare una commessa per rimuovere il genitore. **Stato:** Pronto per test utente. |
| **VAL-02**| **Test Allocazione Libera** | ⏭️ | Dalla pagina di Prima Nota o Riconciliazione, verificare che sia possibile allocare un costo sia a una commessa padre che a una commessa figlia. **Stato:** Da testare in fase successiva. |
| **VAL-03**| **Test di Regressione** | ⏭️ | Verificare che le modifiche non abbiano introdotto bug in altre aree, come la dashboard o i report esistenti. **Stato:** Da verificare durante uso normale. |

---

## **🆕 ATTIVITÀ AGGIUNTIVE COMPLETATE** (Non nel piano originale)

### **Correzione Tipi TypeScript**
**Problema risolto:** Gli errori TypeScript iniziali erano causati da un disallineamento tra tipi backend e frontend.

| Task | Stato | Descrizione |
| :--- | :---: | :--- |
| **Correzione API Commesse** | ✅ | Creato tipo `CommessaWithRelations` in `src/api/commesse.ts` per includere `{ cliente, parent, children, budget }`. |
| **Correzione API Conti** | ✅ | Creato tipo `ContoWithRelations` in `src/api/conti.ts` per includere `{ vociAnalitiche }`. |
| **Aggiornamento Backend Conti** | ✅ | Aggiunto `include: { vociAnalitiche: true }` negli endpoint POST/PUT di `server/routes/conti.ts`. |
| **Aggiornamento Frontend** | ✅ | Sostituiti tipi locali con tipi importati in `CommesseTable.tsx` e `ContiTable.tsx`. |
| **Aggiornamento Schema Validazione** | ✅ | Aggiunto campo `parentId: z.string().optional().nullable()` al `commessaSchema` in `src/schemas/database.ts`. |

### **Miglioramenti UX**
| Task | Stato | Descrizione |
| :--- | :---: | :--- |
| **Validazione Anti-cicli** | ✅ | Implementato filtro per impedire che una commessa sia padre di se stessa nel selettore. |
| **Opzione "Nessuna"** | ✅ | Aggiunta opzione esplicita "Nessuna (commessa principale)" nel selettore parent. |
| **Styling Gerarchico** | ✅ | Font bold per commesse padre, indentazione e simbolo per figlie nella tabella. | 