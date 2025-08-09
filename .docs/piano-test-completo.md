# 🧪 Piano di Test Completo - Commessa Control Hub

## 📋 Obiettivo
Testare sistematicamente **tutte le funzionalità** dell'applicazione per identificare:
- 🐛 **Malfunzionamenti**: Errori, crash, comportamenti anomali
- 🔍 **Incongruenze**: Dati inconsistenti, logiche contraddittorie
- 📝 **Incompletezze**: Funzionalità mancanti o parziali
- 🎨 **Problemi UX**: Interfaccia confusa, workflow non intuitivi

---

## 🗺️ Mappa dell'Applicazione

### Sezioni Principali
1. **🏠 Dashboard** - Pagina principale con overview
2. **🏗️ Commesse** - Gestione progetti e sotto-progetti
3. **📊 Prima Nota** - Registrazioni contabili
4. **📥 Importa Dati** - Caricamento dati da file
5. **🔄 Riconciliazione** - Allocazione automatica/manuale
6. **🏗️ Database** - Visualizzazione tabelle
7. **🔄 Dati di Staging** - Controllo pre-finalizzazione
8. **📈 Registro Modifiche** - Audit trail
9. **⚙️ Impostazioni** - Configurazioni sistema

### Funzionalità Trasversali
- **🔍 Ricerca e Filtri** - In tutte le tabelle
- **📋 Paginazione** - Per dataset grandi
- **📊 Ordinamento** - Per tutte le colonne
- **📱 Responsive** - Su diversi dispositivi
- **🔄 Aggiornamento Tempo Reale** - Widget e dashboard

---

## 🧪 Piano di Test Dettagliato

### **Fase 1: Test Infrastruttura Base**

#### 1.1 Test Avvio Applicazione
- [ ] **Server Backend**: Avvio senza errori sulla porta 3001
- [ ] **Client Frontend**: Avvio senza errori sulla porta 8080
- [ ] **Database**: Connessione Prisma funzionante
- [ ] **Console**: Nessun errore JavaScript critico
- [ ] **Network**: Tutte le API rispondono correttamente

#### 1.2 Test Navigazione Base
- [ ] **Menu Sidebar**: Tutte le voci cliccabili
- [ ] **Routing**: Ogni pagina si carica senza errori
- [ ] **Breadcrumbs**: Navigazione coerente
- [ ] **Back/Forward**: Funzionamento browser
- [ ] **Refresh**: Stato conservato dopo F5

#### 1.3 Test Responsive
- [ ] **Desktop**: Layout corretto su schermi grandi
- [ ] **Tablet**: Adattamento medio schermo
- [ ] **Mobile**: Usabilità su smartphone
- [ ] **Sidebar**: Collasso/espansione funzionante
- [ ] **Tabelle**: Scroll orizzontale quando necessario

---

### **Fase 2: Test Dashboard (🏠)**

#### 2.1 Test Caricamento Iniziale
- [ ] **Velocità**: Caricamento entro 3 secondi
- [ ] **Statistiche**: Tutti i widget mostrano dati
- [ ] **Grafici**: Rendering corretto
- [ ] **Aggiornamento**: Auto-refresh funzionante
- [ ] **Errori**: Gestione elegante se dati mancanti

#### 2.2 Test Widget Commesse
- [ ] **Contatori**: Numeri coerenti con database
- [ ] **Filtri Periodo**: Cambio dati in base al range
- [ ] **Drill-down**: Click su widget apre dettaglio
- [ ] **Stati**: Distinzione attive/chiuse/in preparazione
- [ ] **Performance**: Calcolo percentuali corretto

#### 2.3 Test Grafici
- [ ] **Rendering**: Tutti i grafici si visualizzano
- [ ] **Interattività**: Hover e click funzionanti
- [ ] **Dati**: Coerenza con fonte dati
- [ ] **Responsive**: Adattamento a schermo
- [ ] **Colori**: Palette consistente

#### 2.4 Test Widget Allocazione
- [ ] **Statistiche Tempo Reale**: Aggiornamento durante allocazioni
- [ ] **Percentuali**: Calcolo corretto completamento
- [ ] **Movimenti**: Conteggio allocati/non allocati
- [ ] **SSE**: Server-Sent Events funzionanti
- [ ] **Refresh**: Aggiornamento manuale

---

### **Fase 3: Test Commesse (🏗️)**

#### 3.1 Test Visualizzazione Lista
- [ ] **Caricamento**: Tabella si popola correttamente
- [ ] **Colonne**: Tutti i campi visibili
- [ ] **Paginazione**: Navigazione tra pagine
- [ ] **Ordinamento**: Click su header ordina
- [ ] **Ricerca**: Filtro testuale funzionante

#### 3.2 Test Creazione Commessa
- [ ] **Form**: Tutti i campi accessibili
- [ ] **Validazione**: Controllo campi obbligatori
- [ ] **Cliente**: Selezione da dropdown
- [ ] **Date**: Picker funzionante
- [ ] **Salvataggio**: Persistenza in database
- [ ] **Redirect**: Dopo salvataggio va a lista

#### 3.3 Test Modifica Commessa
- [ ] **Caricamento**: Dati esistenti pre-popolati
- [ ] **Modifica**: Cambio valori possibile
- [ ] **Validazione**: Controlli attivi
- [ ] **Salvataggio**: Aggiornamento persistente
- [ ] **Storico**: Modifiche tracciate

#### 3.4 Test Gerarchia Commesse
- [ ] **Commessa Padre**: Selezione funzionante
- [ ] **Visualizzazione**: Struttura ad albero
- [ ] **Indentazione**: Livelli visibili
- [ ] **Navigazione**: Drill-down padre/figli
- [ ] **Eliminazione**: Gestione dipendenze

#### 3.5 Test Dettaglio Commessa
- [ ] **Caricamento**: Tutti i dati visibili
- [ ] **Schede**: Navigazione tra tab
- [ ] **Movimenti**: Lista movimenti associati
- [ ] **Performance**: Calcoli economici
- [ ] **Grafici**: Visualizzazione andamento

---

### **Fase 4: Test Prima Nota (📊)**

#### 4.1 Test Visualizzazione Movimenti
- [ ] **Tabella**: Caricamento completo
- [ ] **Filtri**: Per data, conto, importo
- [ ] **Ricerca**: Descrizione movimenti
- [ ] **Ordinamento**: Per tutte le colonne
- [ ] **Paginazione**: Navigazione dataset

#### 4.2 Test Nuova Registrazione
- [ ] **Form**: Tutti i campi disponibili
- [ ] **Dare/Avere**: Bilanciamento automatico
- [ ] **Conti**: Selezione da piano conti
- [ ] **Causali**: Dropdown funzionante
- [ ] **Validazione**: Controllo saldi
- [ ] **Salvataggio**: Persistenza corretta

#### 4.3 Test Modifica Registrazione
- [ ] **Caricamento**: Valori esistenti
- [ ] **Modifica**: Cambio dati possibile
- [ ] **Ribilanciamento**: Dare/avere coerenti
- [ ] **Salvataggio**: Aggiornamento database
- [ ] **Allocazioni**: Mantenimento collegamenti

#### 4.4 Test Allocazione Diretta
- [ ] **Selezione**: Movimento da allocare
- [ ] **Commessa**: Scelta da lista
- [ ] **Importo**: Calcolo automatico
- [ ] **Salvataggio**: Creazione allocazione
- [ ] **Aggiornamento**: Riflesso in tabelle

---

### **Fase 5: Test Importa Dati (📥)**

#### 5.1 Test Template Management
- [ ] **Download**: Tutti i template disponibili
- [ ] **Struttura**: Colonne corrette
- [ ] **Formato**: CSV UTF-8 funzionante
- [ ] **Esempi**: Dati di esempio validi
- [ ] **Documentazione**: Istruzioni chiare

#### 5.2 Test Upload File
- [ ] **Drag & Drop**: Trascinamento funzionante
- [ ] **Selezione**: File picker attivo
- [ ] **Validazione**: Controllo formato
- [ ] **Preview**: Anteprima dati
- [ ] **Errori**: Messaggi comprensibili

#### 5.3 Test Importazione Anagrafiche
- [ ] **Template**: Struttura corretta
- [ ] **Validazione**: Controlli campi
- [ ] **Duplicati**: Gestione record esistenti
- [ ] **Tipo**: Distinzione Cliente/Fornitore
- [ ] **Staging**: Caricamento area temporanea

#### 5.4 Test Importazione Piano dei Conti
- [ ] **Struttura**: Gerarchia conti
- [ ] **Codici**: Univocità garantita
- [ ] **Livelli**: Struttura ad albero
- [ ] **Configurazioni**: Rilevanza per commesse
- [ ] **Staging**: Caricamento corretto

#### 5.5 Test Importazione Causali
- [ ] **Codici**: Univocità causali
- [ ] **Descrizioni**: Testi completi
- [ ] **Tipo Movimento**: Classificazione
- [ ] **Configurazioni**: Parametri IVA
- [ ] **Staging**: Persistenza temporanea

#### 5.6 Test Importazione Movimenti
- [ ] **Bilanciamento**: Dare = Avere
- [ ] **Date**: Formato corretto
- [ ] **Riferimenti**: Conti e causali esistenti
- [ ] **Numeri**: Parsing importi
- [ ] **Staging**: Caricamento completo

#### 5.7 Test Monitoraggio Importazione
- [ ] **Barra Progresso**: Aggiornamento real-time
- [ ] **Log Errori**: Messaggi dettagliati
- [ ] **Interruzione**: Possibilità di stop
- [ ] **Completamento**: Notifica fine processo
- [ ] **Statistiche**: Riepilogo importazione

---

### **Fase 6: Test Riconciliazione (🔄)**

#### 6.1 Test Allocazione Automatica Livello 1
- [ ] **Avvio**: Processo si avvia
- [ ] **Causali**: Allocazione per causale
- [ ] **Percentuali**: Calcolo corretto
- [ ] **Monitoraggio**: Progresso visibile
- [ ] **Completamento**: Statistiche aggiornate

#### 6.2 Test Allocazione Automatica Livello 2
- [ ] **Regole**: Applicazione regole configurate
- [ ] **Priorità**: Ordine applicazione
- [ ] **Percentuali**: Ripartizione corretta
- [ ] **Conflitti**: Gestione regole sovrapposte
- [ ] **Risultati**: Allocazioni create

#### 6.3 Test Allocazione Automatica Livello 3
- [ ] **AI**: Suggerimenti intelligenti
- [ ] **Pattern**: Riconoscimento storici
- [ ] **Confidence**: Punteggi affidabilità
- [ ] **Apprendimento**: Miglioramento continuo
- [ ] **Fallback**: Gestione no-match

#### 6.4 Test Widget Tempo Reale
- [ ] **SSE**: Server-Sent Events attivi
- [ ] **Aggiornamento**: Dati in tempo reale
- [ ] **Statistiche**: Contatori live
- [ ] **Performance**: Nessun lag
- [ ] **Disconnessione**: Gestione errori rete

#### 6.5 Test Wizard Allocazione Manuale
- [ ] **Avvio**: Wizard si apre
- [ ] **Step**: Navigazione sequenziale
- [ ] **Validazione**: Controlli per step
- [ ] **Anteprima**: Preview allocazioni
- [ ] **Conferma**: Salvataggio finale

#### 6.6 Test Allocazione Rapida
- [ ] **Selezione**: Movimento da allocare
- [ ] **Commessa**: Scelta rapida
- [ ] **Importo**: Calcolo automatico
- [ ] **Salvataggio**: Persistenza immediata
- [ ] **Feedback**: Conferma operazione

---

### **Fase 7: Test Database (🏗️)**

#### 7.1 Test Visualizzazione Tabelle
- [ ] **Clienti**: Caricamento e visualizzazione
- [ ] **Fornitori**: Tutti i campi visibili
- [ ] **Commesse**: Gerarchia e stati
- [ ] **Piano dei Conti**: Struttura ad albero
- [ ] **Causali**: Lista completa
- [ ] **Scritture**: Movimenti con dettagli

#### 7.2 Test Ricerca Globale
- [ ] **Funzionamento**: Ricerca in tutte le tabelle
- [ ] **Velocità**: Risposta rapida
- [ ] **Rilevanza**: Risultati pertinenti
- [ ] **Evidenziazione**: Highlight termini
- [ ] **Paginazione**: Navigazione risultati

#### 7.3 Test Filtri Avanzati
- [ ] **Per Tabella**: Filtri specifici
- [ ] **Combinazione**: Filtri multipli
- [ ] **Reset**: Cancellazione filtri
- [ ] **Persistenza**: Mantenimento stato
- [ ] **Performance**: Velocità filtri

#### 7.4 Test Ordinamento
- [ ] **Tutte le Colonne**: Click su header
- [ ] **ASC/DESC**: Inversione ordine
- [ ] **Indicatori**: Frecce ordinamento
- [ ] **Persistenza**: Mantenimento ordine
- [ ] **Performance**: Velocità ordinamento

#### 7.5 Test Esportazione
- [ ] **Excel**: Export formato .xlsx
- [ ] **CSV**: Export formato .csv
- [ ] **Filtri**: Esportazione filtrata
- [ ] **Completezza**: Tutti i dati
- [ ] **Formattazione**: Leggibilità file

---

### **Fase 8: Test Dati di Staging (🔄)**

#### 8.1 Test Navigazione Tabelle
- [ ] **Anagrafiche**: Caricamento e navigazione
- [ ] **Piano dei Conti**: Visualizzazione completa
- [ ] **Causali**: Tabella funzionante
- [ ] **Codici IVA**: Dati e formattazione
- [ ] **Condizioni Pagamento**: Campi completi
- [ ] **Scritture**: Movimenti staging

#### 8.2 Test Funzionalità Tabelle
- [ ] **Paginazione**: Navigazione pagine
- [ ] **Ricerca**: Filtro in ogni tabella
- [ ] **Ordinamento**: Click header colonne
- [ ] **Responsive**: Scroll orizzontale
- [ ] **Conteggi**: Statistiche accurate

#### 8.3 Test Aggiornamento Conteggi
- [ ] **Pulsante**: Refresh funzionante
- [ ] **Velocità**: Aggiornamento rapido
- [ ] **Accuratezza**: Numeri corretti
- [ ] **Indicatore**: Loading durante refresh
- [ ] **Errori**: Gestione problemi

#### 8.4 Test Processo Finalizzazione
- [ ] **Pre-check**: Controllo dati sufficienti
- [ ] **Avvio**: Processo si avvia
- [ ] **Monitoring**: Barra progresso
- [ ] **Step**: Progressione fasi
- [ ] **Completamento**: Notifica fine

#### 8.5 Test Finalizzazione per Tabella
- [ ] **Anagrafiche**: Trasferimento Cliente/Fornitore
- [ ] **Piano dei Conti**: Mapping configurazioni
- [ ] **Causali**: Trasferimento completo
- [ ] **Codici IVA**: Aliquote e parametri
- [ ] **Condizioni Pagamento**: Tutti i campi
- [ ] **Scritture**: Movimenti contabili

---

### **Fase 9: Test Registro Modifiche (📈)**

#### 9.1 Test Visualizzazione Audit
- [ ] **Caricamento**: Tabella log completa
- [ ] **Ordinamento**: Per data/ora
- [ ] **Filtri**: Per utente/azione/periodo
- [ ] **Ricerca**: Filtro descrizione
- [ ] **Paginazione**: Navigazione storico

#### 9.2 Test Dettagli Modifiche
- [ ] **Dialog**: Apertura dettagli
- [ ] **Informazioni**: Utente, IP, timestamp
- [ ] **Valori**: Before/after comparison
- [ ] **Formattazione**: JSON leggibile
- [ ] **Chiusura**: Dialog dismissable

#### 9.3 Test Funzionalità Ripristino
- [ ] **Disponibilità**: Solo per azioni valide
- [ ] **Conferma**: Dialog di sicurezza
- [ ] **Processo**: Rollback funzionante
- [ ] **Nuovo Log**: Creazione entry rollback
- [ ] **Feedback**: Notifica completamento

#### 9.4 Test Statistiche Audit
- [ ] **Conteggi**: Totale modifiche
- [ ] **Recenti**: Ultime 24 ore
- [ ] **Ripristini**: Disponibili
- [ ] **Aggiornamento**: Refresh automatico
- [ ] **Accuratezza**: Numeri corretti

---

### **Fase 10: Test Impostazioni (⚙️)**

#### 10.1 Test Configurazione Conti
- [ ] **Caricamento**: Lista completa conti
- [ ] **Rilevanza**: Toggle per commesse
- [ ] **Voci Analitiche**: Associazione
- [ ] **Ricerca**: Filtro per codice/nome
- [ ] **Salvataggio**: Persistenza configurazioni

#### 10.2 Test Voci Analitiche
- [ ] **Tabella**: Visualizzazione voci
- [ ] **Creazione**: Nuova voce analitica
- [ ] **Modifica**: Aggiornamento esistente
- [ ] **Eliminazione**: Controllo dipendenze
- [ ] **Validazione**: Campi obbligatori

#### 10.3 Test Regole Ripartizione
- [ ] **Lista**: Visualizzazione regole
- [ ] **Creazione**: Nuova regola
- [ ] **Percentuali**: Validazione 0-100%
- [ ] **Priorità**: Ordinamento regole
- [ ] **Attivazione**: Toggle on/off

#### 10.4 Test Form Regole
- [ ] **Selezione Conto**: Dropdown funzionante
- [ ] **Selezione Commessa**: Lista aggiornata
- [ ] **Percentuale**: Slider/input numerico
- [ ] **Descrizione**: Campo testo
- [ ] **Validazione**: Controlli completezza

---

### **Fase 11: Test Funzionalità Trasversali**

#### 11.1 Test Performance Generale
- [ ] **Caricamento Pagine**: < 3 secondi
- [ ] **Tabelle Grandi**: > 1000 records
- [ ] **Ricerche**: Risposta rapida
- [ ] **Filtri**: Applicazione veloce
- [ ] **Export**: Tempi ragionevoli

#### 11.2 Test Gestione Errori
- [ ] **Network**: Disconnessione internet
- [ ] **Server**: Backend offline
- [ ] **Database**: Connessione persa
- [ ] **Timeout**: Richieste lunghe
- [ ] **Validation**: Dati invalidi

#### 11.3 Test Sicurezza
- [ ] **Input Validation**: Campi form
- [ ] **SQL Injection**: Protezione query
- [ ] **XSS**: Sanitizzazione output
- [ ] **CSRF**: Protezione form
- [ ] **File Upload**: Validazione file

#### 11.4 Test Usabilità
- [ ] **Feedback**: Messaggi utente
- [ ] **Loading**: Indicatori caricamento
- [ ] **Consistenza**: UI coerente
- [ ] **Accessibilità**: Supporto screen reader
- [ ] **Keyboard**: Navigazione tastiera

---

### **Fase 12: Test Integrazione**

#### 12.1 Test Workflow Completo
- [ ] **Setup**: Configurazione → Commessa → Regole
- [ ] **Import**: Anagrafiche → Conti → Movimenti
- [ ] **Staging**: Controllo → Finalizzazione
- [ ] **Allocation**: Automatica → Manuale
- [ ] **Monitoring**: Dashboard → Report

#### 12.2 Test Coerenza Dati
- [ ] **Riferimenti**: Integrità relazionale
- [ ] **Calcoli**: Somme e percentuali
- [ ] **Stati**: Consistenza tra tabelle
- [ ] **Aggregazioni**: Dashboard vs dettagli
- [ ] **Storico**: Audit trail completo

#### 12.3 Test Scenari Reali
- [ ] **Utente Nuovo**: Onboarding completo
- [ ] **Operazioni Quotidiane**: Workflow standard
- [ ] **Gestione Errori**: Recovery da problemi
- [ ] **Volumi**: Stress test con molti dati
- [ ] **Concorrenza**: Utenti multipli

---

## 📊 Metodologia di Test

### 🎯 **Approccio Sistematico**
1. **Test Sequenziale**: Seguire ordine delle fasi
2. **Documentazione**: Annotare ogni problema trovato
3. **Classificazione**: Severità (Critico/Alto/Medio/Basso)
4. **Riproduzione**: Step per riprodurre bug
5. **Verifica**: Conferma fix dopo correzione

### 📋 **Checklist per Ogni Test**
- [ ] **Preparazione**: Ambiente pulito e dati di test
- [ ] **Esecuzione**: Seguire step precisi
- [ ] **Risultato**: Atteso vs Ottenuto
- [ ] **Documentazione**: Screenshot e descrizione
- [ ] **Priorità**: Classificazione problema

### 🐛 **Gestione Bug**
1. **Rilevamento**: Identificazione problema
2. **Documentazione**: Descrizione dettagliata
3. **Riproduzione**: Step per replicare
4. **Classificazione**: Severità e priorità
5. **Assegnazione**: Responsabile fix
6. **Verifica**: Test dopo correzione

### 📈 **Metriche di Successo**
- **Copertura**: % funzionalità testate
- **Qualità**: Numero bug critici trovati
- **Performance**: Tempi di risposta
- **Usabilità**: Facilità d'uso
- **Stabilità**: Assenza crash

---

## 🎯 **Deliverable Attesi**

### 📋 **Report di Test**
- **Riepilogo Esecutivo**: Stato generale applicazione
- **Funzionalità Testate**: Lista completa con status
- **Bug Identificati**: Classificati per severità
- **Raccomandazioni**: Priorità di fix
- **Metriche**: Performance e copertura

### 🔧 **Lista Correzioni**
- **Critici**: Da fixare immediatamente
- **Alti**: Da correggere prima del rilascio
- **Medi**: Miglioramenti prossima versione
- **Bassi**: Wishlist future

### 📊 **Dashboard Qualità**
- **Percentuale Successo**: Funzionalità OK
- **Trend Stabilità**: Miglioramento nel tempo
- **Coverage**: Copertura test
- **Performance**: Benchmark tempi

---

*Questo piano di test è progettato per essere **esaustivo** e **sistematico**. Seguendo tutte le fasi, avremo la certezza che ogni funzionalità dell'applicazione sia stata testata approfonditamente.*

**Sei pronto per iniziare questo "viaggio di test" attraverso l'intera applicazione?**