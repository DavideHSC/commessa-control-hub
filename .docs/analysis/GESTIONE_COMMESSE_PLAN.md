# Piano d'Azione Professionale per la Gestione Commesse

Questo documento sostituisce ogni piano precedente. È il risultato di un'analisi approfondita e riflette le nostre decisioni strategiche. L'obiettivo è fornire una roadmap chiara, onesta e attuabile, senza supposizioni.

## 1. Visione e Principi Rifondati

Le nostre discussioni strategiche non sono andate perse. Le riaffermiamo qui come pilastri del nostro lavoro:

1.  **Principio di Robustezza (La tua Guida):** L'applicazione deve essere *intelligente*. Non deve mai fallire in modo inatteso. Se i dati necessari per un'azione non esistono (es. mancano i clienti per creare una commessa), il sistema deve **guidare l'utente**, spiegando il problema e offrendo la soluzione (es. un link diretto alla pagina di importazione).
2.  **Da Prima Nota a Centro di Riconciliazione:** Abbandoniamo l'inserimento manuale delle scritture. Il flusso corretto è: **Importazione -> Riconciliazione**. La pagina "Prima Nota" diventerà il hub dove gli utenti allocano le scritture importate e non ancora assegnate.
3.  **Focus sull'Esperienza:** Ogni funzionalità deve essere progettata partendo dall'esperienza utente, non solo dall'esistenza tecnica di un pezzo di codice.

## 2. Stato Attuale Reale (Analisi Onesta)

Questa è la situazione attuale, senza filtri.

-   **Backend:**
    -   L'endpoint `POST /api/commesse` per creare una commessa **esiste ed è funzionante**.
    -   L'endpoint `GET /api/system/status` per verificare i prerequisiti **esiste ed è funzionante**.
-   **Frontend:**
    -   La pagina `src/pages/NuovaCommessa.tsx` **esiste ed è un componente quasi completo**. Contiene già il form, la validazione, e la logica per la gestione del budget.
-   **IL VERO PROBLEMA (Il "Gap"):**
    -   **Non esiste alcun link o pulsante nell'interfaccia utente** per accedere alla pagina "Nuova Commessa". La funzionalità è un'isola, irraggiungibile per l'utente.
    -   La logica di robustezza (il controllo dello stato del sistema) è presente nel codice della pagina, ma **non è mai stata testata** e non è garantito che presenti all'utente un messaggio guida chiaro in caso di prerequisiti mancanti.

## 3. Piano d'Azione Operativo e Sequenziale

Procederemo in fasi ordinate. Non passeremo alla fase successiva finché la precedente non sarà completata, testata e approvata.

---

### **FASE 1: Attivare la Creazione della Commessa**

**Obiettivo:** Rendere la pagina `NuovaCommessa` una funzionalità viva, accessibile e robusta.

*   **Azione 1.1: Rendere la pagina accessibile.**
    *   **Cosa:** Aggiungerò un pulsante "Nuova Commessa".
    *   **Dove:** Nella pagina principale delle commesse (`src/pages/Commesse.tsx`), sopra la tabella. Questo fornisce un punto di accesso contestuale.
    *   **File da modificare:** `src/pages/Commesse.tsx`.

*   **Azione 1.2: Implementare e Testare la Robustezza.**
    *   **Cosa:** Verificherò e, se necessario, migliorerò la logica di "guardia" nella pagina `NuovaCommessa.tsx`.
    *   **Come:** Quando la pagina si carica, il check a `/api/system/status` deve funzionare così:
        *   **SE `needsInitialization` è `true`:** Il form **non** viene mostrato. Al suo posto, l'utente vedrà un componente di "stato vuoto" chiaro e ben visibile.
        *   **Messaggio:** "Per creare una commessa è necessario aver importato almeno i Clienti e le Voci Analitiche."
        *   **Azione:** Il componente mostrerà un pulsante "Vai all'Importazione" che porta l'utente a `/import`.
    *   **File da modificare:** `src/pages/NuovaCommessa.tsx`.

*   **Azione 1.3: Test di Accettazione della Fase 1.**
    *   **Scenario A (Dati mancanti):**
        1. Navigare alla pagina `/commesse`.
        2. Cliccare su "Nuova Commessa".
        3. **Verificare** che appaia il messaggio di guida e il link alla pagina di import.
    *   **Scenario B (Dati presenti):**
        1. Navigare alla pagina `/commesse`.
        2. Cliccare su "Nuova Commessa".
        3. **Verificare** che il form di creazione appaia correttamente.
        4. Creare una commessa di test completa di budget.
        5. **Verificare** che, dopo il salvataggio, si venga reindirizzati alla lista delle commesse e che la nuova commessa sia presente.

---

### **FASE 2: Il Centro di Riconciliazione (Visione Strategica)**

*Dopo e solo dopo il completamento della Fase 1.*

**Obiettivo:** Trasformare la pagina "Prima Nota" in un hub per allocare le scritture importate.
*   **Azione 2.1 (Backend):** Creare un endpoint `GET /api/registrazioni/non-allocate` che restituisca solo le scritture di costo/ricavo non ancora associate a una commessa.
*   **Azione 2.2 (UI/UX):** Rifattorizzare la pagina `PrimaNota.tsx`:
    *   Rinominare il file e la rotta in `riconciliazione`.
    *   Cambiare la fonte dati per usare il nuovo endpoint.
    *   Progettare e implementare un'interfaccia (es. modale o riga espandibile) per permettere l'allocazione rapida di ogni scrittura a una commessa e voce analitica.

---

### **FASE 3: Cruscotto di Commessa e Analisi**

*Dopo il completamento della Fase 2.*

**Obiettivo:** Fornire una visione chiara e immediata della performance di ogni commessa.
*   **Azione 3.1 (Backend):** Creare un endpoint `GET /api/commesse/:id/dashboard` che restituisca dati aggregati (es. totale budget, totale consuntivo, scostamenti per voce analitica).
*   **Azione 3.2 (UI/UX):** Progettare e costruire la pagina di dettaglio della commessa (`CommessaDettaglio.tsx`) che visualizzi questi dati tramite KPI, tabelle e grafici.

---

Questo è il piano. È concreto, sequenziale e basato sulle nostre conclusioni. Attendo la tua approvazione per iniziare con l'**Azione 1.1**. 