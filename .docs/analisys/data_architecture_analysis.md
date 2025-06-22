# 🏗️ ANALISI ARCHITETTURA DATI E FLUSSO OPERATIVO

## 🎯 DOMANDA FONDAMENTALE
**"Abbiamo un'architettura dei dati solida?"** - La risposta è **PARZIALMENTE SÌ, ma con criticità da risolvere**.

## 📊 STATO ATTUALE DELL'ARCHITETTURA

### ✅ **PUNTI DI FORZA**
1. **Separazione logica chiara** tra dati interni e importati
2. **Campo `externalId`** su tutte le entità per tracciabilità
3. **Foreign key constraints** configurati correttamente
4. **Transazioni** per garantire integrità
5. **Sistema di template** flessibile per importazioni

### ⚠️ **CRITICITÀ IDENTIFICATE**
1. **Nessun ordine obbligatorio** di importazione
2. **Mancanza di validazioni** sui dati minimi richiesti
3. **Relazioni deboli** tra dati interni/esterni
4. **Possibili foreign key violations** se importi in ordine sbagliato
5. **Nessun controllo di dipendenze** tra anagrafiche

## 🗂️ MAPPATURA DATI ATTUALI

### **DATI INTERNI (Gestione Commesse)**
```
Commessa ←→ Cliente (FOREIGN KEY OBBLIGATORIA!)
├── BudgetVoce ←→ VoceAnalitica
├── Allocazione ←→ VoceAnalitica
└── Budget totale calcolato
```

### **DATI ESTERNI (Importati da Gestionale)**
```
ScritturaContabile → Fornitore (OPZIONALE - SET NULL)
├── RigaScrittura → Conto (OBBLIGATORIA!)
│   ├── RigaIva → CodiceIva
│   └── Allocazione → Commessa + VoceAnalitica
└── CausaleContabile (riferimento string)
```

### **PONTE TRA INTERNO/ESTERNO**
```
Allocazione = PONTE CRITICO
├── rigaScritturaId → Dati Esterni
├── commessaId → Dati Interni
└── voceAnaliticaId → Condiviso
```

## 🚨 PROBLEMI ARCHITETTURALI CRITICI

### **1. DIPENDENZE NON GESTITE**
**Scenario problematico:**
- Importi `ScritturaContabile` che riferisce `Conto` "1010"
- Ma non hai ancora importato il `Piano dei Conti`
- **RISULTATO:** Foreign key violation!

**Stato attuale:** ❌ Non gestito

### **2. COMMESSE ORFANE**
**Scenario problematico:**
- Crei `Commessa` collegata a `Cliente` "CLI001"
- Ma il cliente è solo nel sistema generico
- Importi clienti reali e il "CLI001" viene sovrascritto
- **RISULTATO:** Commessa punta a cliente sbagliato!

**Stato attuale:** ❌ Non gestito

### **3. ALLOCAZIONI INCONSISTENTI**
**Scenario problematico:**
- `Allocazione` riferisce `VoceAnalitica` "COST001"
- Importi file `MOVANAC.TXT` che ha codici diversi
- **RISULTATO:** Allocazioni disconnesse!

**Stato attuale:** ❌ Non gestito

## 🔧 SOLUZIONI ARCHITETTURALI

### **SOLUZIONE 1: Flusso Guidato di Importazione (RACCOMANDATO)**

#### **Ordine Obbligatorio:**
```
FASE 1: Anagrafiche di Base (prerequisiti)
├── 1. Piano dei Conti (CONTIGEN.TXT) - CRITICO
├── 2. Clienti/Fornitori (A_CLIFOR.TXT) - CRITICO  
├── 3. Causali (CAUSALI.TXT) - IMPORTANTE
├── 4. Codici IVA (CODICIVA.TXT) - OPZIONALE
└── 5. Condizioni Pagamento (CODPAGAM.TXT) - OPZIONALE

FASE 2: Voci Analitiche (ponte)
├── Configurazione manuale delle voci
└── Mapping con codici esterni

FASE 3: Commesse (configurazione interna)
├── Creazione commesse
├── Collegamento ai clienti REALI
└── Configurazione budget

FASE 4: Scritture Contabili (transazioni)
├── PNTESTA.TXT + PNRIGCON.TXT + PNRIGIVA.TXT
└── MOVANAC.TXT (allocazioni alle commesse)
```

#### **Controlli di Validazione:**
- ✅ Verifica esistenza anagrafiche prima di passare alla fase successiva
- ✅ Controlli di integrità referenziale
- ✅ Warning se mancano dati critici
- ✅ Blocco importazione se dipendenze non soddisfatte

### **SOLUZIONE 2: Sistema di Mapping Intelligente**

#### **Tabelle di Mapping:**
```sql
CREATE TABLE MappingClienti (
  externalId TEXT PRIMARY KEY,
  internalClienteId TEXT,
  stato ENUM('TEMPORARY', 'CONFIRMED', 'MAPPED')
);

CREATE TABLE MappingVociAnalitiche (
  externalCode TEXT PRIMARY KEY,
  internalVoceId TEXT,
  descrizioneEsterna TEXT
);
```

#### **Logica di Riconciliazione:**
- **Prima importazione:** Crea record temporanei
- **Seconda importazione:** Aggiorna/mappa ai record reali
- **Riconciliazione:** UI per collegare manualmente dati ambigui

### **SOLUZIONE 3: Validazioni Backend Robuste**

#### **API Endpoint `/api/validate-system`:**
```typescript
{
  status: 'ready' | 'incomplete' | 'error',
  checks: {
    pianoDeiConti: { count: 3190, status: 'ok' },
    clienti: { count: 0, status: 'missing', required: true },
    fornitori: { count: 0, status: 'missing', required: false },
    commesse: { count: 0, status: 'warning', message: 'Nessuna commessa configurata' },
    scritture: { 
      count: 746, 
      status: 'warning', 
      issues: ['12 scritture riferiscono conti inesistenti', '5 fornitori non trovati']
    }
  },
  suggestions: [
    'Importa anagrafiche clienti prima di configurare commesse',
    'Configura almeno 3 voci analitiche per il controllo commesse'
  ]
}
```

## 📋 FLUSSO OPERATIVO PROPOSTO

### **FASE SETUP (Prima volta)**
1. **Import Wizard guidato** con validazioni step-by-step
2. **Controllo dipendenze** automatico
3. **Dashboard di salute sistema** sempre visibile

### **FASE OPERATIVA (Uso quotidiano)**
1. **Dashboard principale** mostra stato del sistema
2. **Alert automatici** per inconsistenze
3. **Re-importazione** gestita con merge intelligente
4. **Backup automatici** prima di ogni importazione

### **FASE MANUTENZIONE**
1. **Strumenti di riconciliazione** per dati ambigui
2. **Report di inconsistenze** periodici
3. **Cleanup automatico** di dati orfani

## 🚨 RACCOMANDAZIONI IMMEDIATE

### **PRIORITÀ CRITICA (da implementare subito)**
1. **Implementare controlli di validazione** prima delle importazioni
2. **Creare wizard guidato** per il primo setup
3. **Aggiungere dashboard di sistema** per monitorare salute dati
4. **Implementare backup automatici** prima di ogni importazione

### **PRIORITÀ ALTA (prossime settimane)**
1. **Sistema di mapping** per riconciliazione dati
2. **Alert automatici** per inconsistenze
3. **Strumenti di cleanup** per dati orfani
4. **Documentazione utente** per flusso operativo

### **PRIORITÀ MEDIA (futuro)**
1. **Versioning dei dati** importati
2. **Audit trail** completo delle modifiche
3. **Sistema di rollback** per importazioni problematiche

## 💡 ARCHITETTURA TARGET

### **Principi Guida:**
- ✅ **Fail-safe:** Il sistema non deve mai andare in stato inconsistente
- ✅ **User-friendly:** L'utente deve essere guidato nel processo
- ✅ **Fault-tolerant:** Errori di importazione non devono corrompere dati esistenti
- ✅ **Transparent:** Lo stato del sistema deve essere sempre visibile
- ✅ **Recoverable:** Sempre possibile tornare a uno stato funzionante

### **Risultato Finale:**
Un sistema che **"funziona sempre"** indipendentemente dall'ordine di importazione o da errori dell'utente, con guidance automatica per raggiungere uno stato ottimale.

## 🎯 CONCLUSIONE

**L'architettura di base è SOLIDA**, ma **manca il layer di controllo operativo**. 

Il sistema attuale è come **"un'auto senza cinture di sicurezza"** - funziona perfettamente se guidi bene, ma un piccolo errore può causare grossi problemi.

**NEXT STEP:** Implementare il wizard guidato e le validazioni di sistema per trasformare l'architettura da "delicata ma potente" a "robusta e user-friendly".