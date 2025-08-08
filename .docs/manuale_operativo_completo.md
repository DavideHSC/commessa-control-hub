# Manuale Operativo Completo - CommessaHub

**Data**: 17 Gennaio 2025  
**Versione**: 1.0  
**Scopo**: Guida operativa per la gestione di una commessa dall'inizio alla fine

---

## 🔍 INVENTARIO COMPLETO FUNZIONALITÀ

### **1. API ENDPOINTS DISPONIBILI**

#### **Navigazione Principale**
- `GET /api/dashboard` - Dashboard principale con KPI
- `GET /api/commesse` - Elenco commesse con CRUD
- `GET /api/commesse-performance` - Performance commesse
- `GET /api/registrazioni` - Prima nota contabile

#### **Import e Gestione Dati**
- `POST /api/import/scritture` - Import movimenti contabili
- `POST /api/import/conti` - Import piano dei conti
- `POST /api/import/anagrafiche` - Import clienti/fornitori
- `POST /api/v2/import/piano-dei-conti` - Import piano conti v2
- `POST /api/v2/import/clienti-fornitori` - Import anagrafiche v2
- `POST /api/v2/import/codici-iva` - Import codici IVA
- `POST /api/v2/import/causali-contabili` - Import causali
- `POST /api/v2/import/condizioni-pagamento` - Import condizioni pagamento

#### **Riconciliazione e Allocazione**
- `POST /api/reconciliation/run` - Esecuzione riconciliazione
- `POST /api/reconciliation/finalize` - Finalizzazione riconciliazione
- `POST /api/smart-allocation/suggest` - Suggerimenti smart allocation
- `POST /api/smart-allocation/validate` - Validazione allocazioni
- `POST /api/smart-allocation/learn` - Apprendimento patterns

#### **Gestione Configurazione**
- `GET|POST|PUT|DELETE /api/clienti` - Gestione clienti
- `GET|POST|PUT|DELETE /api/fornitori` - Gestione fornitori
- `GET|POST|PUT|DELETE /api/conti` - Gestione piano dei conti
- `GET|POST|PUT|DELETE /api/causali` - Gestione causali contabili
- `GET|POST|PUT|DELETE /api/codici-iva` - Gestione codici IVA
- `GET|POST|PUT|DELETE /api/voci-analitiche` - Gestione voci analitiche
- `GET|POST|PUT|DELETE /api/regole-ripartizione` - Gestione regole ripartizione

#### **Staging e Finalizzazione**
- `GET /api/staging/conti` - Visualizza conti in staging
- `GET /api/staging/anagrafiche` - Visualizza anagrafiche in staging
- `GET /api/staging/scritture` - Visualizza scritture in staging
- `POST /api/staging/finalize` - Finalizzazione da staging a produzione
- `GET /api/staging/stats` - Statistiche staging

#### **Sistema e Audit**
- `GET /api/system/status` - Stato sistema
- `POST /api/system/reset-database` - Reset database
- `POST /api/system/consolidate-scritture` - Consolidamento scritture
- `GET /api/allocation/audit` - Audit trail allocazioni
- `POST /api/allocation/audit/rollback` - Rollback operazioni

#### **Import Templates**
- `GET|POST|PUT|DELETE /api/import-templates` - Gestione template import

### **2. PAGINE FRONTEND DISPONIBILI**

#### **Navigazione Principale**
- `/` - Dashboard principale
- `/commesse` - Elenco commesse
- `/prima-nota` - Prima nota contabile

#### **Servizi**
- `/import` - Import dati
- `/riconciliazione` - Riconciliazione e allocazione
- `/audit-trail` - Registro modifiche
- `/database` - Gestione database
- `/staging` - Dati provvisori

#### **Impostazioni**
- `/impostazioni` - Operazioni di sistema
- `/impostazioni/conti` - Configurazione conti
- `/impostazioni/voci-analitiche` - Voci analitiche
- `/impostazioni/regole-ripartizione` - Regole ripartizione

#### **Pagine Specifiche**
- `/commesse/:id` - Dettaglio commessa
- `/analisi-comparative` - Analisi comparative
- `/nuova-commessa` - Creazione nuova commessa
- `/nuova-registrazione-prima-nota` - Nuova registrazione

### **3. COMPONENTI SPECIALIZZATI**

#### **Dialogs e Modali**
- `EditBudgetDialog` - Modifica budget commesse
- `TemplateFormDialog` - Gestione template import
- `EditBudgetDialog` - Modifica budget
- `ContoForm` - Form gestione conti
- `VoceAnaliticaForm` - Form voci analitiche

#### **Tabelle Avanzate**
- `AdvancedDataTable` - Tabella con filtri, ordinamento, paginazione
- `ReconciliationTable` - Tabella riconciliazione
- `HierarchicalCommesseTable` - Tabella gerarchica commesse
- `StagingAnagraficheTable` - Tabella anagrafiche staging

#### **Componenti Analitici**
- `ChartContainer` - Container per grafici
- `KpiWidget` - Widget KPI
- `PerformanceCommessaCard` - Card performance commessa
- `SmartSuggestions` - Suggerimenti smart allocation

---

## 📖 MANUALE OPERATIVO: GESTIONE COMMESSA COMPLETA

### **SCENARIO**: Nuovo utente che deve gestire una commessa dall'inizio alla fine

**Obiettivo**: Completare tutto il workflow di gestione commessa
**Punto di partenza**: Applicazione aperta per la prima volta
**Dati necessari**: File tracciati del cliente (CONTIGEN.TXT, A_CLIFOR.TXT, PNTESTA.TXT, etc.)

---

## 🚀 STEP 1: PRIMO ACCESSO E ORIENTAMENTO

### **1.1 Apertura Applicazione**
1. Apri browser e vai a `http://localhost:3000`
2. Visualizzi la **Dashboard** principale
3. Nella sidebar sinistra vedi le sezioni:
   - **Navigazione**: Dashboard, Commesse, Prima Nota
   - **Servizi**: Import Dati, Riconciliazione, Audit Trail, Database, Staging
   - **Impostazioni**: Sistema, Conti, Voci Analitiche, Regole Ripartizione

### **1.2 Verifica Stato Sistema**
1. Clicca su **"Impostazioni"** → **"Operazioni di Sistema"**
2. Controlla lo **Status Sistema** (dovrebbe essere "Online")
3. Verifica la presenza di **dati di esempio** nelle varie sezioni

---

## 📊 STEP 2: SETUP INIZIALE DEL SISTEMA

### **2.1 Import Piano dei Conti**
1. Vai a **"Importa Dati"** dalla sidebar
2. Seleziona tab **"Piano dei Conti"**
3. Clicca **"Seleziona File"** e carica `CONTIGEN.TXT`
4. Configura i parametri:
   - **Encoding**: UTF-8 o Windows-1252
   - **Separatore**: Fixed-width
5. Clicca **"Importa"**
6. Attendi completamento import
7. Verifica risultato in **"Staging"** → **"Conti"**

### **2.2 Import Anagrafiche Clienti/Fornitori**
1. Sempre in **"Importa Dati"**
2. Seleziona tab **"Anagrafiche"**
3. Carica file `A_CLIFOR.TXT`
4. Configura template se necessario
5. Esegui import
6. Verifica in **"Staging"** → **"Anagrafiche"**

### **2.3 Import Causali e Codici**
1. Ripeti processo per:
   - **Causali Contabili**: `CAUSALI.TXT`
   - **Codici IVA**: `CODICIVA.TXT`
   - **Condizioni Pagamento**: `CODPAGAM.TXT`
2. Verifica tutti i dati in **"Staging"**

---

## 🎯 STEP 3: CONFIGURAZIONE COMMESSE

### **3.1 Creazione Voci Analitiche**
1. Vai a **"Impostazioni"** → **"Voci Analitiche"**
2. Clicca **"Aggiungi Voce Analitica"**
3. Crea le seguenti voci:
   - **Nome**: "Costi Diretti", **Tipo**: "Costo"
   - **Nome**: "Costi Indiretti", **Tipo**: "Costo"
   - **Nome**: "Ricavi Diretti", **Tipo**: "Ricavo"
   - **Nome**: "Margine Operativo", **Tipo**: "Ricavo"
4. Salva ogni voce

### **3.2 Configurazione Regole Ripartizione**
1. Vai a **"Impostazioni"** → **"Regole di Ripartizione"**
2. Clicca **"Aggiungi Regola"**
3. Configura regola esempio:
   - **Nome**: "Ripartizione Costi Generali"
   - **Condizione**: Conto inizia con "6"
   - **Azione**: Distribuisci per percentuale
   - **Percentuali**: 60% Costi Diretti, 40% Costi Indiretti
4. Salva regola

### **3.3 Creazione Commessa**
1. Vai a **"Commesse"**
2. Clicca **"Nuova Commessa"** (se presente) o usa API
3. Compila:
   - **Nome**: "Comune di Sorrento"
   - **Descrizione**: "Commessa principale per il comune di Sorrento"
   - **Cliente**: Seleziona cliente importato
   - **Data Inizio**: Data corrente
   - **Data Fine**: Data futura
4. Salva commessa

---

## 💾 STEP 4: FINALIZZAZIONE DATI STAGING

### **4.1 Verifica Dati Staging**
1. Vai a **"Dati Provvisori"** (Staging)
2. Controlla ogni sezione:
   - **Conti**: Verifica importazione piano conti
   - **Anagrafiche**: Verifica clienti/fornitori
   - **Causali**: Verifica causali contabili
   - **Codici IVA**: Verifica codici IVA
3. Annota eventuali errori o dati mancanti

### **4.2 Finalizzazione Staging → Produzione**
1. Nella pagina **"Staging"**
2. Clicca **"Finalizza Tutti i Dati"**
3. Seleziona opzioni:
   - ✅ **Finalizza Conti**
   - ✅ **Finalizza Anagrafiche**
   - ✅ **Finalizza Causali**
   - ✅ **Finalizza Codici IVA**
4. Conferma finalizzazione
5. Attendi completamento (può richiedere alcuni minuti)

### **4.3 Verifica Finalizzazione**
1. Vai a **"Database"**
2. Controlla che i dati siano stati trasferiti:
   - **Conti**: Dovrebbero essere visibili con enum corretti
   - **Clienti/Fornitori**: Presenti e collegati
   - **Causali**: Disponibili per uso
3. Verifica filtri funzionanti (es. conti di tipo "Ricavo")

---

## 📈 STEP 5: IMPORT MOVIMENTI CONTABILI

### **5.1 Preparazione Import Scritture**
1. Vai a **"Importa Dati"**
2. Seleziona tab **"Scritture Contabili"**
3. Prepara i file:
   - `PNTESTA.TXT` - Testate movimenti
   - `PNRIGCON.TXT` - Righe contabili
   - `PNRIGIVA.TXT` - Righe IVA
   - `MOVANAC.TXT` - Movimenti analitici

### **5.2 Import Movimenti**
1. Trascina i file nella zona di upload
2. Configura parametri import:
   - **Esercizio**: Anno corrente
   - **Azienda**: Codice azienda
   - **Modalità**: Incrementale o Completo
3. Clicca **"Avvia Import"**
4. Monitora progress bar
5. Verifica log errori se presenti

### **5.3 Verifica Import**
1. Vai a **"Staging"** → **"Scritture"**
2. Controlla dati importati:
   - **Testate**: Numero movimenti importati
   - **Righe Contabili**: Dettaglio movimenti
   - **Righe IVA**: Gestione IVA
   - **Allocazioni**: Centri di costo
3. Verifica coerenza dati

---

## 🎯 STEP 6: FINALIZZAZIONE MOVIMENTI

### **6.1 Finalizzazione Scritture Contabili**
1. In **"Staging"** clicca **"Finalizza Scritture"**
2. Seleziona opzioni:
   - ✅ **Crea Scritture Contabili**
   - ✅ **Crea Righe Scrittura**
   - ✅ **Crea Righe IVA**
   - ✅ **Crea Allocazioni**
3. Avvia finalizzazione
4. Monitora progress (può richiedere tempo)

### **6.2 Verifica Finalizzazione**
1. Vai a **"Database"**
2. Controlla tabelle popolate:
   - **Scritture Contabili**: Movimenti finalizzati
   - **Righe Scrittura**: Dettaglio contabile
   - **Allocazioni**: Collegamenti a commesse
3. Verifica numeriche coerenti

---

## 🔄 STEP 7: RICONCILIAZIONE E ALLOCAZIONE

### **7.1 Processo Riconciliazione**
1. Vai a **"Riconciliazione"**
2. Visualizzi dashboard riconciliazione con:
   - **Movimenti da Riconciliare**: Conteggio
   - **Allocazioni Automatiche**: Suggerimenti
   - **Allocazioni Manuali**: Da completare
3. Clicca **"Avvia Riconciliazione"**

### **7.2 Smart Allocation**
1. Nella sezione **"Smart Allocation"**
2. Rivedi suggerimenti automatici:
   - **Allocazioni per Pattern**: Basate su storico
   - **Allocazioni per Regole**: Regole configurate
   - **Allocazioni per Similarità**: ML-based
3. Approva o modifica allocazioni
4. Clicca **"Applica Allocazioni"**

### **7.3 Allocazione Manuale**
1. Per movimenti non allocati automaticamente:
2. Seleziona movimento dalla tabella
3. Clicca **"Alloca Manualmente"**
4. Scegli:
   - **Commessa**: Destinazione allocazione
   - **Voce Analitica**: Tipologia costo/ricavo
   - **Percentuale**: Se ripartizione
5. Salva allocazione

---

## 💰 STEP 8: GESTIONE BUDGET COMMESSE

### **8.1 Definizione Budget**
1. Vai a **"Commesse"**
2. Trova la commessa creata
3. Clicca menu **"Azioni"** → **"Modifica Budget"**
4. Nel dialog che si apre:
   - **Voce**: Seleziona "Costi Diretti"
   - **Importo**: 50.000 €
   - **Note**: "Budget costi diretti progetto"
5. Aggiungi altre voci:
   - **Costi Indiretti**: 30.000 €
   - **Ricavi Diretti**: 100.000 €
6. Salva budget

### **8.2 Verifica Budget**
1. Torna all'elenco commesse
2. Verifica che i valori budget siano aggiornati
3. Controlla calcoli automatici:
   - **Margine**: (Ricavi - Costi) / Ricavi
   - **Avanzamento**: Costi / Budget

---

## 📊 STEP 9: MONITORAGGIO E REPORTING

### **9.1 Dashboard Performance**
1. Vai a **"Dashboard"**
2. Visualizza KPI aggiornati:
   - **Ricavi Totali**: Somma commesse
   - **Costi Totali**: Somma allocazioni
   - **Margine Medio**: Performance globale
   - **Commesse Attive**: Stato progetti
3. Controlla grafici:
   - **Trend Mensile**: Evoluzione performance
   - **Distribuzione Costi**: Per commessa
   - **Margini per Cliente**: Profittabilità

### **9.2 Analisi Commesse**
1. Vai a **"Commesse"**
2. Per ogni commessa visualizzi:
   - **Budget vs Consuntivo**: Confronto
   - **Margine**: Percentuale
   - **Avanzamento**: Progresso progetto
   - **Stato**: In corso, Completato, etc.
3. Usa menu **"Azioni"** per:
   - **Analisi Rapida**: Grafici specifici
   - **Esporta Report**: PDF/Excel
   - **Alloca Movimenti**: Nuove allocazioni

### **9.3 Reports Avanzati**
1. Usa **"Analisi Comparative"** per:
   - **Confronto Commesse**: Performance relative
   - **Trend Temporali**: Evoluzione nel tempo
   - **Analisi Margini**: Profittabilità dettagliata
2. Esporta report in vari formati

---

## 🔍 STEP 10: AUDIT E CONTROLLO

### **10.1 Audit Trail**
1. Vai a **"Registro Modifiche"**
2. Controlla log delle operazioni:
   - **Import Dati**: Timestamp e risultati
   - **Finalizzazioni**: Passaggi staging→produzione
   - **Allocazioni**: Modifiche manuali
   - **Budget**: Aggiornamenti budget
3. Usa filtri per ricerche specifiche

### **10.2 Verifica Coerenza**
1. Vai a **"Database"**
2. Controlla statistiche:
   - **Conti**: Numeriche per tipo
   - **Scritture**: Totali dare/avere
   - **Allocazioni**: Copertura movimenti
   - **Budget**: Coerenza con allocazioni
3. Identifica eventuali discrepanze

---

## ⚠️ PUNTI CRITICI E POTENZIALI PROBLEMI

### **Problemi Comuni**
1. **Import Fallisce**: Verifica encoding file e formato
2. **Finalizzazione Bloccata**: Controlla foreign key e duplicati
3. **Allocazioni Mancanti**: Verifica configurazione regole
4. **Budget Zero**: Controlla se budget è stato definito
5. **Performance Slow**: Controlla dimensioni dataset

### **Soluzioni Rapide**
1. **Reset Parziale**: Usa operazioni di sistema
2. **Cleanup Database**: Elimina dati corrotti
3. **Ri-finalizzazione**: Ripeti processo staging
4. **Backup/Restore**: Usa funzioni database

---

## 🎯 CHECKLIST COMPLETAMENTO

### **Setup Sistema** ✅
- [ ] Piano dei conti importato e finalizzato
- [ ] Anagrafiche clienti/fornitori importate
- [ ] Causali e codici configurati
- [ ] Voci analitiche create
- [ ] Regole ripartizione configurate

### **Gestione Commesse** ✅
- [ ] Commessa creata e configurata
- [ ] Budget definito per voci analitiche
- [ ] Collegamenti cliente configurati

### **Movimenti Contabili** ✅
- [ ] Scritture contabili importate
- [ ] Movimenti finalizzati in produzione
- [ ] Allocazioni create e verificate

### **Riconciliazione** ✅
- [ ] Processo riconciliazione completato
- [ ] Smart allocation configurato
- [ ] Allocazioni manuali completate

### **Monitoring** ✅
- [ ] Dashboard funzionante con KPI
- [ ] Reports disponibili
- [ ] Audit trail attivo

---

## 🔧 FUNZIONALITÀ AVANZATE

### **Funzioni Nascoste/Avanzate**
1. **API dirette**: Chiamate REST per operazioni batch
2. **Import Templates**: Configurazione template personalizzati
3. **Webhooks**: Notifiche automatiche (se implementate)
4. **Bulk Operations**: Operazioni multiple (se implementate)
5. **Advanced Filters**: Filtri complessi nelle tabelle

### **Configurazioni Avanzate**
1. **Regole ML**: Configurazione algoritmi smart allocation
2. **Audit Rules**: Configurazione audit personalizzato
3. **Performance Tuning**: Ottimizzazioni database
4. **Backup Automatici**: Scheduling backup

---

## 📝 NOTE FINALI

### **Questo manuale copre:**
- ✅ Workflow completo gestione commessa
- ✅ Tutti i passaggi critici
- ✅ Verifica di ogni funzionalità
- ✅ Troubleshooting comune
- ✅ Checklist completamento

### **Da testare nel walkthrough:**
1. Ogni step deve funzionare come descritto
2. Identificare punti dove l'utente potrebbe perdersi
3. Verificare che tutte le funzionalità siano accessibili
4. Controllare che i dati fluiscano correttamente
5. Identificare funzionalità "nascoste" o poco accessibili

### **Obiettivo finale:**
Un utente che segue questo manuale deve essere in grado di gestire completamente una commessa dall'import dati iniziale fino al reporting finale, senza dover consultare codice o documentazione tecnica.

---

*Versione 1.0 - Gennaio 2025*
*Questo manuale sarà validato tramite test completo del workflow descritto*