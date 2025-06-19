# Piano di Sviluppo - Commessa Control Hub

Questo documento delinea le fasi e i task necessari per trasformare il prototipo in una demo efficace, focalizzata sugli automatismi di contabilità per commessa.

---

### ✅ Fase 0: Setup e Pulizia del Progetto (Completata)
- [x] Installare le dipendenze del progetto `@/commessa-control-hub`.
- [x] Avviare correttamente il server di sviluppo.

---

### ✅ Fase 1: Modellazione dei Dati e Tipi Core (Completata)
- [x] **Task 1.1:** Creare un file `src/types/index.ts` che conterrà tutte le interfacce e i tipi di dato del nostro dominio.
- [x] **Task 1.2:** Definire le interfacce di base: `CentroDiCosto`, `PianoDeiConti`.
- [x] **Task 1.3:** Definire l'interfaccia `Commessa`, includendo la struttura per il `budget`.
- [x] **Task 1.4:** Definire l'interfaccia `CausaleContabile` con `datiPrimari` e `templateScrittura`.
- [x] **Task 1.5:** Definire le interfacce per la `ScritturaContabile`, le sue righe (`RigaScrittura`) e `Allocazione`.

---

### ✅ Fase 2: Dati Mock e Simulazione Backend (Completata)
- [x] **Task 2.1:** Creare un file `src/data/mock.ts` per ospitare i nostri dati di demo.
- [x] **Task 2.2:** Popolare `mock.ts` con dati realistici ispirati al file Excel del cliente.
- [x] **Task 2.3:** Creare un semplice layer API `src/api/index.ts` che simuli le chiamate asincrone.
- [x] **Task 2.4:** "Oscurare" la UI: Rimuovere o disabilitare dalla `Sidebar` e dal router le pagine non necessarie.

---

### ✅ Fase 3: Implementazione della "Prima Nota Intelligente" (Completata)
- [x] **Task 3.1:** Trasformare la pagina `NuovaRegistrazionePrimaNota.tsx` nel cuore della demo.
- [x] **Task 3.2:** Sviluppare la UI per la selezione della causale e l'inserimento dei dati primari.
- [x] **Task 3.3:** Implementare l'automatismo "Genera Scrittura" basato sui template delle causali.
- [x] **Task 3.4:** Sviluppare la modale e la logica per l'allocazione analitica degli importi su commesse e centri di costo.
- [x] **Task 3.5:** Refactoring completo del componente per allinearlo alla nuova architettura dati.

---

### ✅ Fase 4: Chiusura del Flusso Dati (CREATE e READ) - ✅ COMPLETATA

**Obiettivo:** Implementare la logica per salvare le nuove scritture contabili e visualizzarle in una tabella, completando il ciclo "crea-leggi".

**Stato:** ✅ **Completata**

- ✅ **API di Persistenza:** Creato un servizio API fittizio in `src/api/registrazioni.ts` che simula il salvataggio dei dati in memoria (un array locale).
- ✅ **Salvataggio Dati:** Integrata la chiamata API nel componente `NuovaRegistrazionePrimaNota.tsx` per salvare la scrittura generata.
- ✅ **Notifiche Utente:** Aggiunto il componente `sonner` per fornire feedback visivo all'utente dopo il salvataggio (`"Registrazione salvata con successo!"`).
- ✅ **Visualizzazione Dati:** Trasformata la pagina `PrimaNota.tsx` da un segnaposto a una tabella funzionale (`<DataTable />`) che carica e visualizza l'elenco delle registrazioni salvate dal servizio API.
- ✅ **Bug Fixing:** Risolti tutti gli errori di tipo nel file `src/data/mock.ts` che erano emersi dopo il refactoring dei tipi, garantendo la coerenza del codice.

---

### ✅ Fase 4.5: Refactoring Concettuale e Miglioramento UX dell'Allocazione

**Obiettivo:** Risolvere un'incongruenza concettuale nella logica di allocazione, migliorare l'usabilità del componente e allinearlo pienamente alla visione strategica del progetto.

**Stato:** ✅ **Completata**

- ✅ **Correzione Concettuale:** Risolta l'incongruenza fondamentale che consentiva di allocare ricavi a centri di costo. Ora la logica è unificata e contabilisticamente corretta.
- ✅ **Refactoring a "Voce Analitica":** Sostituito il termine e il concetto di `CentroDiCosto` con `VoceAnalitica` in tutto il modello dati (`types.ts`), nei dati mock (`mock.ts`) e nell'interfaccia utente (`NuovaRegistrazionePrimaNota.tsx`), per una maggiore chiarezza e flessibilità.
- ✅ **Implementazione Automatismi Avanzati:** Attivata la logica, già prevista dal piano, per cui il sistema ora:
    - **Suggerisce automaticamente** la `VoceAnalitica` più pertinente all'apertura della modale di allocazione.
    - **Filtra l'elenco** delle voci analitiche per mostrare solo quelle rilevanti per il conto selezionato.
- ✅ **Miglioramenti UX:** Ottimizzato il flusso di inserimento per le allocazioni multiple. Aggiungendo una nuova riga, il sistema ora pre-compila la commessa, la voce analitica e l'importo a saldo, velocizzando drasticamente l'operatività.

---

### 🎯 Fase 5: La Dashboard di Controllo (VIEW)

**Obiettivo:** Trasformare la pagina `Dashboard.tsx` in un cruscotto di controllo di gestione che mostri i dati aggregati per ogni commessa, confrontando **Budget vs. Consuntivo**.

**Stato:** ⏳ **Da iniziare**

**Passi Previsti:**
1.  **Analisi Iniziale**: Leggere il contenuto attuale di `commessa-control-hub/src/pages/Dashboard.tsx` per capire la sua struttura di base.
2.  **Definizione Dati Dashboard**: Definire una nuova struttura dati in `src/types/index.ts` per contenere i dati aggregati necessari (es. `DashboardData`). Questa struttura dovrebbe contenere, per ogni commessa, il budget totale, il consuntivo totale e il dettaglio per centro di costo.
3.  **Logica di Aggregazione**: Creare una nuova funzione (`getDashboardData`) nel layer API che:
    - Prende in input tutte le commesse e tutte le registrazioni contabili.
    - Calcola i dati aggregati per la dashboard.
    - Restituisce i dati nel formato definito al punto 2.
4.  **Integrazione UI**: Modificare `Dashboard.tsx` per:
    - Chiamare la nuova funzione API per ottenere i dati aggregati.
    - Visualizzare i dati in modo chiaro e intuitivo, usando i componenti ShadCN/UI (es. `Card`, `Table`, `Chart`) per mostrare il confronto Budget vs. Consuntivo per ogni commessa.

---

### ⏳ Fase 6: Finalizzazione e Aggiornamento (Prossimi Passi)
- [ ] **Task 6.1:** Eseguire un'attività di pulizia del codice per risolvere tutti i `linting error` residui emersi durante il refactoring (`data/mock.ts`, `CommessaDettaglio.tsx`).
- [ ] **Task 6.2:** Aggiornare la documentazione e le guide di utilizzo del progetto.
- [ ] **Task 6.3:** Eseguire test di regressione per garantire che il sistema funzioni correttamente anche in condizioni di carico elevato.
- [ ] **Task 6.4:** (Opzionale) Aggiungere un grafico a barre o a torta per una rappresentazione visuale immediata della composizione dei costi. 