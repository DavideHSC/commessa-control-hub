# Piano di Sistemazione Parser Scritture Contabili

## 🚨 **SITUAZIONE ATTUALE (CASINO COMBINATO)**

### Problemi Identificati:
1. **MVP vs Completo**: Ho implementato un transformer MVP che salva solo testate, ma l'utente vuole il parser completo
2. **Dati Corrotti**: Date null, descrizioni "5", righe contabili mancanti nel database
3. **Architettura Confusa**: Mixing tra pattern staging e persistenza diretta
4. **Transformer Incompleto**: Il transformer completo ha TODO e errori di schema
5. **Workflow Inconsistente**: Usa MVP ma dovrebbe usare completo
6. **Schema Prisma**: Non conosco la struttura esatta delle relazioni per RigaIva/Allocazioni

---

## 🎯 **OBIETTIVO FINALE**

**Parser Scritture Contabili Completo che:**
- Salva testate + righe contabili + righe IVA + allocazioni
- Usa pattern staging-commit corretto
- Mostra nel frontend scritture complete con dare/avere
- Mantiene integrità referenziale
- Gestisce pulizia dati duplicati

---

## 📋 **PIANO OPERATIVO DETTAGLIATO**

### **FASE 1: ANALISI E MAPPATURA SCHEMA**
**Obiettivo**: Capire esattamente come sono strutturate le relazioni nel database

#### Task 1.1: Analisi Schema Prisma
- [ ] Leggere modello `ScritturaContabile` completo
- [ ] Leggere modello `RigaScrittura` completo  
- [ ] Leggere modello `RigaIva` completo
- [ ] Leggere modello `Allocazione` completo
- [ ] Mappare tutte le relazioni e foreign keys
- [ ] Identificare i campi obbligatori vs opzionali

#### Task 1.2: Analisi Tabelle Staging
- [ ] Verificare struttura `ImportScritturaTestata`
- [ ] Verificare struttura `ImportScritturaRigaContabile`
- [ ] Verificare struttura `ImportScritturaRigaIva`
- [ ] Verificare struttura `ImportAllocazione`
- [ ] Capire il flusso staging → produzione esistente

#### Task 1.3: Analisi API Frontend
- [ ] Vedere come il frontend legge le scritture (`/api/registrazioni`)
- [ ] Capire che dati si aspetta (testate + righe + IVA?)
- [ ] Verificare se serve aggiornare anche l'API di lettura

---

### **FASE 2: DESIGN TRANSFORMER COMPLETO**
**Obiettivo**: Progettare la struttura corretta del transformer prima di implementare

#### Task 2.1: Design Interfacce
- [ ] Definire `ScrittureContabiliTransformResult` completa
- [ ] Includere tutti gli array: scritture, righe, righeIva, allocazioni
- [ ] Allineare `TransformationStats` con workflow
- [ ] Definire strutture per entità dipendenti

#### Task 2.2: Design Logica di Correlazione
- [ ] Capire come collegare RigaIva → RigaScrittura
- [ ] Capire come collegare Allocazione → RigaScrittura  
- [ ] Definire strategia per foreign keys e connect{}
- [ ] Gestire progressivi e identificatori univoci

#### Task 2.3: Design Pattern Persistenza
- [ ] Decidere: staging-commit o persistenza diretta?
- [ ] Se staging: definire flusso completo staging→produzione
- [ ] Se diretto: definire ordine creazione entità (FK dependencies)
- [ ] Gestire pulizia tabelle (quale pattern usare)

---

### **FASE 3: IMPLEMENTAZIONE TRANSFORMER COMPLETO**
**Obiettivo**: Implementare il transformer che crea TUTTE le entità

#### Task 3.1: Completare Funzione Principale
- [ ] Copiare logica funzionante dal MVP (organizzazione dati)
- [ ] Implementare creazione righe contabili complete
- [ ] Implementare creazione righe IVA con relazioni corrette
- [ ] Implementare creazione allocazioni con relazioni corrette

#### Task 3.2: Sistemare Date e Descrizioni
- [ ] Applicare fix delle date null (dal MVP)
- [ ] Applicare fix delle descrizioni vuote (dal MVP)
- [ ] Gestire tutti i campi nullable con fallback appropriati

#### Task 3.3: Gestione Entità Dipendenti
- [ ] Creare fornitori mancanti
- [ ] Creare causali mancanti
- [ ] Creare conti mancanti (se necessario)
- [ ] Creare codici IVA mancanti (se necessario)
- [ ] Creare commesse mancanti (per allocazioni)

#### Task 3.4: Validazione Integrità
- [ ] Controllare che ogni riga abbia una testata
- [ ] Controllare che ogni rigaIva abbia una riga contabile
- [ ] Controllare che ogni allocazione abbia una riga contabile
- [ ] Gestire errori di integrità referenziale

---

### **FASE 4: AGGIORNAMENTO WORKFLOW**
**Obiettivo**: Far usare il transformer completo al workflow

#### Task 4.1: Sostituire Transformer nel Workflow
- [ ] Cambiare import da MVP a completo
- [ ] Sistemare eventuali errori di interfaccia
- [ ] Aggiornare logging per riflettere operazioni complete

#### Task 4.2: Implementare Persistenza Completa
- [ ] Se staging: implementare salvataggio in tutte le tabelle staging
- [ ] Se diretto: implementare salvataggio in ordine corretto
- [ ] Gestire transazioni atomiche per tutto il set
- [ ] Implementare rollback in caso di errore

#### Task 4.3: Sistemare Pulizia Tabelle
- [ ] Implementare pulizia corretta (staging o produzione)
- [ ] Rispettare ordine foreign keys
- [ ] Testare che non ci siano errori di constraint

---

### **FASE 5: TESTING E VALIDAZIONE**
**Obiettivo**: Verificare che tutto funzioni end-to-end

#### Task 5.1: Test Import Completo
- [ ] Eseguire import con i 4 file di test
- [ ] Verificare che vengano create tutte le entità:
  - [ ] Testate scritture
  - [ ] Righe contabili (dare/avere)
  - [ ] Righe IVA
  - [ ] Allocazioni analitiche
  - [ ] Entità dipendenti (fornitori, causali, etc.)

#### Task 5.2: Test Frontend
- [ ] Verificare che il frontend mostri le scritture complete
- [ ] Controllare che le righe contabili appaiano
- [ ] Verificare dare/avere, date, descrizioni corrette
- [ ] Testare navigazione e dettagli

#### Task 5.3: Test Duplicati
- [ ] Eseguire import 2 volte
- [ ] Verificare che non ci siano duplicati
- [ ] Controllare che la pulizia funzioni
- [ ] Testare rollback in caso di errore

---

### **FASE 6: CLEANUP E DOCUMENTAZIONE**
**Obiettivo**: Pulire il codice e documentare

#### Task 6.1: Rimozione Codice Obsoleto
- [ ] Decidere se tenere o rimuovere transformer MVP
- [ ] Pulire TODO e commenti di debug
- [ ] Rimuovere imports non utilizzati

#### Task 6.2: Documentazione
- [ ] Documentare il flusso completo nel README
- [ ] Aggiornare architettura nel progetto_info.md
- [ ] Documentare le relazioni tra entità

---

## ⚠️ **RISCHI E ATTENZIONI**

### Rischi Tecnici:
1. **Schema Prisma**: Potrei non aver capito le relazioni corrette
2. **Foreign Keys**: Ordine di creazione entità critico
3. **Performance**: Molte entità da creare, potrebbe essere lento
4. **Transazioni**: Rischio di timeout su dataset grandi

### Rischi di Processo:
1. **Scope Creep**: Rischio di complicare troppo
2. **Breaking Changes**: Potrei rompere parser esistenti
3. **Testing**: Difficile testare tutte le combinazioni

### Mitigazioni:
- Procedere fase per fase con validazione
- Testare ogni fase prima di passare alla successiva
- Tenere backup del codice funzionante
- Documentare ogni scelta architetturale

---

## 🎯 **PRIORITÀ DI ESECUZIONE**

1. **FASE 1** (Critica): Senza capire lo schema, tutto il resto è inutile
2. **FASE 2** (Critica): Design corretto evita refactoring multipli
3. **FASE 3** (Alta): Implementazione core
4. **FASE 4** (Alta): Integration con workflow esistente
5. **FASE 5** (Media): Validazione e testing
6. **FASE 6** (Bassa): Cleanup finale

---

## 📅 **STIMA TEMPI**

- **FASE 1**: 1-2 ore (analisi)
- **FASE 2**: 1 ora (design)
- **FASE 3**: 3-4 ore (implementazione)
- **FASE 4**: 1-2 ore (integration)
- **FASE 5**: 2-3 ore (testing)
- **FASE 6**: 1 ora (cleanup)

**TOTALE STIMATO: 9-13 ore di lavoro focalizzato**

---

## ✅ **CRITERI DI SUCCESSO**

Il parser è considerato completo quando:
1. Import dei 4 file crea TUTTE le entità nel database
2. Frontend mostra scritture complete con righe contabili
3. Import multipli non creano duplicati
4. Performance accettabile (<5 secondi per dataset test)
5. Zero errori di integrità referenziale
6. Codice pulito e documentato 