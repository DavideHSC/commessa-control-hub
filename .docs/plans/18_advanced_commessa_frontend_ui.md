# Piano 18: UI Avanzata per la Gestione delle Commesse - Frontend Completo

**ID:** `PLAN-18`
**Data:** 13 Luglio 2025
**Stato:** 🚧 **IN IMPLEMENTAZIONE** - Fase 1 ✅ COMPLETATA, avvio Fase 2
**Obiettivo:** Implementare la migliore UI possibile per la gestione delle commesse, trasformando le pagine `/commesse` e `/dashboard` in un sistema di controllo avanzato che integri tutti i dati contabili importati e la gerarchia commesse implementata nel Piano 17.

---

## **Contesto e Analisi Situazione Attuale**

### **Stato Completato (Piano 17)**
✅ **Backend completamente implementato:**
- Gerarchia commesse (padre-figlio) con relazioni
- Sistema di allocazione flessibile
- Database con tutte le entità necessarie (VoceAnalitica, Allocazione, BudgetVoce, RegolaRipartizione)
- Pagina tecnica `/database` funzionante per amministratori

### **Stato Attuale delle Pagine Utente**
**❌ Pagina `/commesse`:**
- Vista semplificata ad accordion (Comuni → Attività)
- Non mostra dati finanziari reali
- Non integra i movimenti contabili importati
- Non sfrutta la potenza del sistema analitico

**❌ Dashboard `/`:**
- KPI generici e statici
- Tabella commesse senza drill-down
- Non mostra analisi per centri di costo
- Mancano grafici e visualizzazioni avanzate

**❌ Pagina dettaglio `/commesse/:id`:**
- Vista basilare budget e movimenti
- Non mostra analisi comparative
- Manca il controllo gerarchico padre-figlio
- Non integra le funzionalità di assegnazione

### **Dati Disponibili (da Dialogo Tecnico)**
Dall'analisi del file `frontend_visualization_tips-and_other_info.md` emerge che il sistema ha accesso a:

1. **Movimenti Contabili Classificati:**
   - Costi Effettivi (FTRI, FRS) vs Stimati (FTDR)
   - Ricavi Effettivi (FTEM, FTS) vs di Competenza (FTDE)
   - Ripartizioni automatiche (MOVANAC.TXT) quando presenti

2. **Classificazione Analitica:**
   - Voci di Costo: Materiali, Manodopera, Servizi, Utenze, ecc.
   - Voci di Ricavo: Prestazioni Contrattuali, Ricavi Accessori, ecc.
   - Centri di Costo: Commesse gerarchiche padre-figlio

3. **Logica di Allocazione:**
   - Priorità: MOVANAC.TXT → Regole DETTANAL → Assegnazione Manuale
   - Filtri per escludere movimenti finanziari (INC, PAGA)
   - Mappatura Piano dei Conti → Voci Analitiche

---

## **Fase 1: Riprogettazione Dashboard Principale** 
**Obiettivo:** Trasformare la dashboard in un centro di controllo operativo con KPI reali e visualizzazioni avanzate.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **DB-01** | **Implementare KPI Dinamici Reali** | ✅ | **COMPLETATO** - Implementati 8 KPI avanzati con calcoli reali: Marginalità, Budget vs Consuntivo, Movimenti non allocati, Performance mensile con colori intelligenti e icone. |
| **DB-02** | **Aggiungere Grafici Interattivi** | ✅ | **COMPLETATO** - Integrati grafici Recharts: Trend performance 6 mesi (combinato), Top commesse per margine, Distribuzione finanziaria con progress bar dinamica. |
| **DB-03** | **Vista Gerarchica Commesse** | ✅ | **COMPLETATO** - Implementata vista accordion per commesse padre-figlio: Totali consolidati, drill-down attività, KPI per livello, navigazione intuitiva. |
| **DB-04** | **Sezione Alert e Notifiche** | ✅ | **COMPLETATO** - Sistema alert intelligente: Commesse critiche, budget sforati, movimenti pending, statistiche rapide, quick actions. |
| **DB-05** | **Filtri e Periodo Temporale** | ✅ | **COMPLETATO** - Sistema filtri avanzato: Range date con calendario, filtro clienti, stato commesse, tipo (padre/figlio), range margine, ricerca testuale con applicazione real-time. |

---

## **Fase 2: Potenziamento Pagina Commesse**
**Obiettivo:** Trasformare la vista semplice in un sistema di gestione avanzato con controllo finanziario integrato.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **CM-01** | **Vista a Schede con Performance** | 📋 | Riprogettare l'interfaccia con card per ogni commessa padre che mostri: Marginalità, Avanzamento %, Trend mensile, Stato finanziario (positivo/negativo). |
| **CM-02** | **Sistema di Drill-Down Avanzato** | 📋 | Implementare navigazione multi-livello: Comune → Attività → Dettaglio Finanziario con possibilità di espandere/collassare e mostrare sub-totali aggregati. |
| **CM-03** | **Indicatori Visivi di Stato** | 📋 | Aggiungere sistema di colori e icone: Verde (margine positivo), Giallo (attenzione), Rosso (perdita), Badge per stato (attiva/completata/sospesa). |
| **CM-04** | **Azioni Rapide per Commessa** | 📋 | Implementare menu contestuale: "Alloca Movimenti", "Modifica Budget", "Esporta Report", "Assegna Costi Non Allocati". |
| **CM-05** | **Vista Comparativa** | 📋 | Aggiungere modalità di visualizzazione per confrontare: Performance tra commesse simili, Andamento temporale, Benchmark settoriali. |

---

## **Fase 3: Pagina Dettaglio Commessa Avanzata**
**Obiettivo:** Creare una pagina di dettaglio che sia un vero centro di controllo per la singola commessa.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **CD-01** | **Dashboard Finanziaria Integrata** | 📋 | Implementare sezione con: Riepilogo P&L della commessa, Analisi budget vs consuntivo, Cash flow e previsioni, Breakdown per voce analitica. |
| **CD-02** | **Timeline Movimenti Contabili** | 📋 | Creare visualizzazione cronologica dei movimenti con: Filtri per tipo (costi/ricavi), Dettaglio allocazioni, Link alle registrazioni originali, Possibilità di modificare allocazioni. |
| **CD-03** | **Gestione Gerarchica Visual** | 📋 | Per commesse padre: Vista ad albero delle sottocommesse, Consolidamento automatico dei dati, Possibilità di redistribuire costi tra figli. |
| **CD-04** | **Sezione Analisi e Forecasting** | 📋 | Implementare: Trend analysis dei costi, Proiezioni a finire, Analisi scostamenti, Suggerimenti per ottimizzazione. |
| **CD-05** | **Centro di Allocazione Intelligente** | 📋 | Creare interfaccia per: Visualizzare movimenti non allocati, Suggerimenti automatici di allocazione, Batch processing per allocazioni multiple, Regole personalizzate. |

---

## **Fase 4: Integrazione Sistema di Allocazione**
**Obiettivo:** Completare il cuore dell'applicazione rendendo l'allocazione dei costi un processo fluido e integrato.

**🔍 STATO ATTUALE RILEVATO:**
- ✅ **Database Schema**: Completo con modelli Allocazione, VoceAnalitica, RegolaRipartizione
- ✅ **Import Workflow**: Robusto sistema di staging con validazione (PNTESTA, PNRIGCON, PNRIGIVA, MOVANAC)
- ✅ **Frontend UI**: Interfaccia riconciliazione avanzata già implementata
- ✅ **Gestione Configurazione**: Voci analitiche e regole di ripartizione operative
- ❌ **API Backend**: Mancano completamente le API `/api/reconciliation/*`
- ❌ **Logica Allocazione**: Processo di riconciliazione e allocazione non implementato
- ❌ **Finalizzazione Scritture**: `finalizeScritture()` non implementata
- ❌ **Automazioni MOVANAC**: Collegamento allocazioni pre-definite non attivo

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **AL-01** | **Widget Movimenti da Allocare** | 📋 | **IMPLEMENTARE:** API per contare movimenti non allocati + componente sempre visibile con KPI real-time: Numero movimenti pending, Importo totale non allocato, Quick action per aprire wizard allocazione. |
| **AL-02** | **Wizard Allocazione Guidata** | 📋 | **IMPLEMENTARE:** API `/api/reconciliation/run` con logica a 3 livelli + completare `finalizeScritture()` + attivare automazioni MOVANAC/DETTANAL. Processo: 1. Auto-allocazione MOVANAC, 2. Applicazione regole DETTANAL, 3. Riconciliazione manuale con suggerimenti. |
| **AL-03** | **Sistema di Regole Intelligenti** | 📋 | **ESTENDERE:** Pattern recognition per fornitori ricorrenti + auto-suggest basato su storico allocazioni + validazione automatica. Utilizzare RegolaRipartizione esistente come base. |
| **AL-04** | **Audit Trail e Correzioni** | 📋 | **IMPLEMENTARE:** Sistema completo per tracking modifiche allocazioni + storico + possibilità annullare/correggere + note e giustificazioni + report di controllo. |

**🎯 PRIORITÀ CRITICHE:**
1. **Implementare API Riconciliazione** - `/api/reconciliation/run`, `/manual-allocation`, `/finalize`
2. **Completare Finalizzazione Scritture** - Collegare `StagingRigaContabile` → `RigaScrittura`
3. **Attivare Automazioni** - Processare dati `MOVANAC.TXT` per allocazioni pre-definite
4. **Logica Allocazione Automatica** - Utilizzare `RegolaRipartizione` per allocazioni automatiche

---

## **Fase 5: Funzionalità Avanzate e Reportistica**
**Obiettivo:** Aggiungere funzionalità di alto livello per controllo manageriale e reportistica.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **RP-01** | **Export e Report Personalizzati** | 📋 | Implementare: Export Excel con template, PDF report automatici, Email scheduling, Template personalizzabili per cliente. |
| **RP-02** | **Sistema di Budget Planning** | 📋 | Creare interfaccia per: Pianificazione budget annuale, Revisioni periodiche, Scenario analysis, Confronto con anni precedenti. |
| **RP-03** | **Analytics e Machine Learning** | 📋 | Integrare: Previsioni automatiche basate su storico, Anomaly detection su costi, Raccomandazioni ottimizzazione, Pattern analysis clienti. |
| **RP-04** | **Mobile-First Responsive** | 📋 | Assicurare: Piena funzionalità su mobile, Progressive Web App, Offline capabilities, Notifiche push per alert. |
| **RP-05** | **Sistema di Autorizzazioni** | 📋 | Implementare: Ruoli utente (Manager, Contabile, Visualizzatore), Permessi granulari per commessa, Workflow di approvazione, Audit completo azioni. |

---

## **Fase 6: UX/UI e Performance**
**Obiettivo:** Ottimizzare l'esperienza utente e le performance del sistema.

| ID | Task | Stato | Descrizione |
| :-- | :--- | :---: | :--- |
| **UX-01** | **Design System Coerente** | 📋 | Creare: Componenti UI riutilizzabili, Color palette specifica per finanza, Iconografia consistente, Tipografia ottimizzata. |
| **UX-02** | **Ottimizzazione Performance** | 📋 | Implementare: Lazy loading per dati pesanti, Caching intelligente, Paginazione server-side, Ottimizzazione query database. |
| **UX-03** | **Accessibility e Usabilità** | 📋 | Garantire: Compatibilità screen reader, Navigazione da tastiera, Contrasti colori conformi, Tour guidato per nuovi utenti. |
| **UX-04** | **Feedback System** | 📋 | Implementare: Loading states informativi, Error handling user-friendly, Success feedback, Help contestuale. |

---

## **Specifiche Tecniche Chiave**

### **Architettura Componenti - STATO ATTUALE**
```
src/
├── components/
│   ├── commessa/
│   │   ├── ✅ CommessaActionMenu.tsx (menu azioni rapide)
│   │   ├── ✅ StatusIndicators.tsx (KPI visuali avanzati)
│   │   ├── ✅ ComparativeView.tsx (analisi comparative)
│   │   └── ❌ AllocationWizard.tsx (DA IMPLEMENTARE)
│   ├── dashboard/
│   │   ├── ✅ CompactHeader.tsx (KPI dinamici)
│   │   ├── ✅ HierarchicalCommesseTable.tsx (vista gerarchica)
│   │   ├── ✅ FilterControls.tsx (filtri avanzati)
│   │   └── ✅ SidebarPanel.tsx (alerts e notifiche)
│   ├── admin/
│   │   ├── ✅ AllocationForm.tsx (form allocazione manuale)
│   │   ├── ✅ AllocationCell.tsx (celle allocazione rapida)
│   │   ├── ✅ ReconciliationTable.tsx (tabella riconciliazione)
│   │   ├── ✅ ReconciliationSummary.tsx (dashboard riepilogo)
│   │   ├── ✅ RegoleRipartizioneManager.tsx (gestione regole)
│   │   └── ✅ VociAnaliticheManager.tsx (gestione voci analitiche)
│   ├── database/
│   │   ├── ✅ StagingXXXTable.tsx (tabelle staging complete)
│   │   └── ✅ FinalizationStatus.tsx (stato finalizzazione)
│   └── dialogs/
│       ├── ✅ EditBudgetDialog.tsx (modifica budget)
│       └── ❌ AllocationWizardDialog.tsx (DA IMPLEMENTARE)
```

### **Backend API - STATO ATTUALE**
```
server/
├── routes/
│   ├── ✅ staging.ts (gestione completa staging)
│   ├── ✅ voci-analitiche.ts (CRUD voci analitiche)
│   ├── ✅ regole-ripartizione.ts (CRUD regole)
│   ├── ✅ dashboard.ts (KPI e performance)
│   ├── ✅ commesse.ts (gestione commesse)
│   └── ❌ reconciliation.ts (DA IMPLEMENTARE)
├── lib/
│   ├── ✅ finalization.ts (finalizzazione base)
│   ├── ✅ importUtils.ts (utilities import)
│   └── ❌ reconciliationEngine.ts (DA IMPLEMENTARE)
└── import-engine/
    ├── ✅ workflows/ (ImportScrittureContabiliWorkflow)
    ├── ✅ validators/ (validazione Zod completa)
    └── ✅ persistence/ (DLQ service)
```

### **Database Schema - IMPLEMENTATO**
```sql
-- ✅ CORE ALLOCATION MODELS
model Allocazione {
  importo         Float
  tipoMovimento   String
  dataMovimento   DateTime
  rigaScrittura   RigaScrittura
  commessa        Commessa
  voceAnalitica   VoceAnalitica
}

-- ✅ BUSINESS LOGIC MODELS  
model VoceAnalitica {
  conti           Conto[]
  regole          RegolaRipartizione[]
  allocazioni     Allocazione[]
}

model RegolaRipartizione {
  percentuale     Float
  conto           Conto
  commessa        Commessa
  voceAnalitica   VoceAnalitica
}

-- ✅ STAGING MODELS (COMPLETO)
model StagingTestata
model StagingRigaContabile  
model StagingRigaIva
model StagingAllocazione    -- DA MOVANAC.TXT
model StagingConto
model StagingAnagrafica
```

### **Integrazione API**
- Estendere API esistenti per supportare nuovi endpoint aggregati
- Implementare caching Redis per performance
- WebSocket per aggiornamenti real-time su allocazioni
- GraphQL per query complesse multi-tabella

### **Tecnologie Aggiuntive**
- **Chart.js/Recharts:** Per grafici interattivi
- **React Query:** Per gestione stato server ottimizzata  
- **Framer Motion:** Per animazioni fluide
- **React Hook Form:** Per form complessi di allocazione
- **Zustand:** Per stato globale UI

---

## **Criteri di Successo**

1. **Usabilità:** Un contabile deve poter allocare 100 movimenti in meno di 10 minuti
2. **Performance:** Dashboard deve caricare in <2 secondi con 1000+ commesse
3. **Accuratezza:** Zero errori di calcolo su marginalità e budget
4. **Adoptabilità:** 90% degli utenti deve completare il primo flusso senza aiuto
5. **Business Value:** Riduzione 50% tempo per controllo mensile commesse

---

## **Note di Implementazione**

### **Priorità di Sviluppo**
1. **Alta:** Fase 1 (Dashboard), Fase 2 (Commesse) 
2. **Media:** Fase 3 (Dettaglio), Fase 4 (Allocazione)
3. **Bassa:** Fase 5 (Analytics), Fase 6 (UX)

### **Considerations Speciali**
- Mantenere compatibilità con pagina `/database` esistente
- Prevedere migrazione graduale dalla UI attuale
- Testare intensivamente con dati reali del cliente
- Documentare pattern per future estensioni

**Estimato di Sviluppo:** 4-6 settimane per implementazione completa
**Team Suggerito:** 1 Frontend Developer + 1 UX/UI Designer + testing con utenti finali