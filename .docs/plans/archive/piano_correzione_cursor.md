# Piano di Correzione Template Importazione - Commessa Control Hub

## 🚨 **PROBLEMA IDENTIFICATO**

I template di importazione nel database hanno **FieldDefinition con mapping errati** (start, length, type) perché creati senza i tracciati ufficiali. Questo causa:
- Date importate come "01/01/1970" 
- Importi errati o zero
- Campi non mappati correttamente
- Impossibilità di validare l'importazione end-to-end

## 📊 **STATO ATTUALE**
- ✅ Architettura database corretta e completa
- ✅ Sistema di importazione funzionante 
- ✅ Parser a larghezza fissa implementato
- ❌ **FieldDefinition errate nei template**
- ❌ Importazione produce dati incorretti

## 🎯 **OBIETTIVO**
Correggere tutti i template di importazione con i mapping esatti dai tracciati ufficiali per ottenere un'importazione dati perfettamente funzionante.

---

## 📋 **TASKS DA ESEGUIRE**

### **TASK 1: Backup e Preparazione**
**File:** `prisma/seed.ts`
**Obiettivo:** Preparare l'ambiente per le correzioni

1. Fare backup del file `prisma/seed.ts` corrente
2. Verificare che il server di sviluppo sia spento
3. Assicurarsi che il database PostgreSQL sia in esecuzione

---

### **TASK 2: Correzione Template `anagrafica_clifor`**
**File:** `prisma/seed.ts` (linee template anagrafica_clifor)
**Tracciato di riferimento:** `A_CLIFOR.TXT` (338 bytes)

**Sostituire le FieldDefinition esistenti con:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'anagrafica_clifor',
    modelName: 'Cliente', // Gestirà entrambi tramite logica custom
    fields: { create: [
      { nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },           // [21-32]
      { nomeCampo: 'codiceFiscale', start: 32, length: 16, type: 'string' },        // [33-48]
      { nomeCampo: 'tipoConto', start: 49, length: 1, type: 'string' },             // [50-50] C/F/E
      { nomeCampo: 'piva', start: 82, length: 11, type: 'string' },                 // [83-93]
      { nomeCampo: 'nome', start: 94, length: 60, type: 'string' },                 // [95-154]
      { nomeCampo: 'cognome', start: 154, length: 20, type: 'string' },             // [155-174]
      { nomeCampo: 'nomePersona', start: 174, length: 20, type: 'string' },         // [175-194]
      { nomeCampo: 'sesso', start: 194, length: 1, type: 'string' },                // [195-195]
      { nomeCampo: 'dataNascita', start: 195, length: 8, type: 'date' },            // [196-203] GGMMAAAA
      { nomeCampo: 'indirizzo', start: 216, length: 30, type: 'string' }            // [217-246]
    ] },
  }
});
```

---

### **TASK 3: Correzione Template `piano_dei_conti`**
**File:** `prisma/seed.ts` (linee template piano_dei_conti)
**Tracciato di riferimento:** `CONTIGEN.TXT` (388 bytes)

**Sostituire le FieldDefinition esistenti con:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'piano_dei_conti',
    modelName: 'Conto',
    fields: { create: [
      { nomeCampo: 'livello', start: 4, length: 1, type: 'string' },                // [5-5] 1=Mastro, 2=Conto, 3=Sottoconto
      { nomeCampo: 'codice', start: 5, length: 10, type: 'string' },                // [6-15] MMCCSSSSSS
      { nomeCampo: 'nome', start: 15, length: 60, type: 'string' },                 // [16-75] Descrizione
      { nomeCampo: 'tipo', start: 75, length: 1, type: 'string' },                  // [76-76] P/E/O/C/F
      { nomeCampo: 'sigla', start: 76, length: 12, type: 'string' },                // [77-88]
      { nomeCampo: 'controlloSegno', start: 88, length: 1, type: 'string' },        // [89-89] A=Avere, D=Dare
      { nomeCampo: 'gruppo', start: 256, length: 1, type: 'string' }                // [257-257] A/C/N/P/R/V/Z
    ] },
  }
});
```

---

### **TASK 4: Correzione Template `causali`**
**File:** `prisma/seed.ts` (linee template causali)
**Tracciato di riferimento:** `CAUSALI.TXT` (171 bytes)

**Sostituire le FieldDefinition esistenti con:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'causali',
    modelName: 'CausaleContabile',
    fields: { create: [
      { nomeCampo: 'externalId', start: 4, length: 6, type: 'string' },             // [5-10] Codice causale
      { nomeCampo: 'nome', start: 10, length: 40, type: 'string' },                 // [11-50] Descrizione
      { nomeCampo: 'tipoMovimento', start: 50, length: 1, type: 'string' },         // [51-51] C=Contabile, I=Contabile/Iva
      { nomeCampo: 'tipoAggiornamento', start: 51, length: 1, type: 'string' },     // [52-52] I/P/F
      { nomeCampo: 'dataInizio', start: 52, length: 8, type: 'date' },              // [53-60] GGMMAAAA
      { nomeCampo: 'dataFine', start: 60, length: 8, type: 'date' },                // [61-68] GGMMAAAA
      { nomeCampo: 'tipoRegistroIva', start: 68, length: 1, type: 'string' },       // [69-69] A/C/V
      { nomeCampo: 'noteMovimento', start: 101, length: 60, type: 'string' }        // [102-161]
    ] },
  }
});
```

---

### **TASK 5: Correzione Template `codici_iva`**
**File:** `prisma/seed.ts` (linee template codici_iva)
**Tracciato di riferimento:** `CODICIVA.TXT` (162 bytes)

**Sostituire le FieldDefinition esistenti con:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'codici_iva',
    modelName: 'CodiceIva',
    fields: { create: [
      { nomeCampo: 'externalId', start: 4, length: 4, type: 'string' },             // [5-8] Codice IVA
      { nomeCampo: 'descrizione', start: 8, length: 40, type: 'string' },           // [9-48] Descrizione
      { nomeCampo: 'tipoCalcolo', start: 48, length: 1, type: 'string' },           // [49-49] N/O/A/I/S/T/E/V
      { nomeCampo: 'aliquota', start: 49, length: 6, type: 'number' },              // [50-55] 999.99
      { nomeCampo: 'indetraibilita', start: 55, length: 3, type: 'number' },        // [56-58] Percentuale
      { nomeCampo: 'note', start: 58, length: 40, type: 'string' },                 // [59-98]
      { nomeCampo: 'dataInizio', start: 98, length: 8, type: 'date' },              // [99-106] GGMMAAAA
      { nomeCampo: 'dataFine', start: 106, length: 8, type: 'date' }                // [107-114] GGMMAAAA
    ] },
  }
});
```

---

### **TASK 6: Correzione Template `condizioni_pagamento`**
**File:** `prisma/seed.ts` (linee template condizioni_pagamento)
**Tracciato di riferimento:** `CODPAGAM.TXT` (68 bytes)

**Sostituire le FieldDefinition esistenti con:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'condizioni_pagamento',
    modelName: 'CondizionePagamento',
    fields: { create: [
      { nomeCampo: 'externalId', start: 4, length: 8, type: 'string' },             // [5-12] Codice pagamento
      { nomeCampo: 'descrizione', start: 12, length: 40, type: 'string' },          // [13-52] Descrizione
      { nomeCampo: 'contoIncassoPagamento', start: 52, length: 10, type: 'string' }, // [53-62]
      { nomeCampo: 'suddivisione', start: 64, length: 1, type: 'string' },          // [65-65] D/T
      { nomeCampo: 'inizioScadenza', start: 65, length: 1, type: 'string' },        // [66-66] D/F/R/P/N
      { nomeCampo: 'numeroRate', start: 66, length: 2, type: 'number' }             // [67-68]
    ] },
  }
});
```

---

### **TASK 7: Correzione Template `scritture_contabili` (MULTI-FILE)**
**File:** `prisma/seed.ts` (sezione scritture_contabili con fileIdentifier)
**Tracciati di riferimento:** `PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT`, `MOVANAC.TXT`

**Sostituire l'intero template con:**
```typescript
// Template per importazione scritture contabili (multi-file)
const scrittureContabiliFields: any = [
  // === PNTESTA.TXT (445 bytes) ===
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'externalId', start: 20, length: 12, type: 'string' },              // [21-32]
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'causaleId', start: 39, length: 6, type: 'string' },                // [40-45]
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataRegistrazione', start: 85, length: 8, type: 'date' },          // [86-93] GGMMAAAA
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 99, length: 16, type: 'string' }, // [100-115]
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataDocumento', start: 128, length: 8, type: 'date' },             // [129-136] GGMMAAAA
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numeroDocumento', start: 136, length: 12, type: 'string' },        // [137-148]
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'totaleDocumento', start: 172, length: 12, type: 'number' },        // [173-184]
  { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'noteMovimento', start: 192, length: 60, type: 'string' },          // [193-252]

  // === PNRIGCON.TXT (312 bytes) ===
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },              // [4-15]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'progressivoRigo', start: 15, length: 3, type: 'number' },         // [16-18]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'tipoConto', start: 18, length: 1, type: 'string' },               // [19-19] C/F/spazio
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'clienteFornitoreCodiceFiscale', start: 19, length: 16, type: 'string' }, // [20-35]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'conto', start: 48, length: 10, type: 'string' },                  // [49-58]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoDare', start: 58, length: 12, type: 'number' },            // [59-70]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoAvere', start: 70, length: 12, type: 'number' },           // [71-82]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'note', start: 82, length: 60, type: 'string' },                   // [83-142]
  { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'movimentiAnalitici', start: 247, length: 1, type: 'string' },     // [248-248] 0/1

  // === PNRIGIVA.TXT (173 bytes) ===
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },              // [4-15]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codiceIva', start: 15, length: 4, type: 'string' },               // [16-19]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'contropartita', start: 19, length: 10, type: 'string' },          // [20-29]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 29, length: 12, type: 'number' },             // [30-41]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 41, length: 12, type: 'number' },                // [42-53]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'importoLordo', start: 89, length: 12, type: 'number' },           // [90-101]
  { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'note', start: 101, length: 60, type: 'string' },                  // [102-161]

  // === MOVANAC.TXT (34 bytes) ===
  { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'externalId', start: 3, length: 12, type: 'string' },               // [4-15]
  { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'progressivoRigoContabile', start: 15, length: 3, type: 'number' }, // [16-18]
  { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'centroDiCosto', start: 18, length: 4, type: 'string' },            // [19-22]
  { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'parametro', start: 22, length: 12, type: 'number' }                // [23-34]
];

await prisma.importTemplate.create({
  data: {
    nome: 'scritture_contabili',
    modelName: null, // Gestito da logica custom
    fields: { create: scrittureContabiliFields },
  }
});
```

---

### **TASK 8: Reset e Seeding Database**
**Obiettivo:** Applicare le correzioni al database

1. Eseguire reset completo del database:
   ```bash
   npx prisma migrate reset
   ```

2. Confermare il reset quando richiesto

3. Eseguire il nuovo seeding:
   ```bash
   npx prisma db seed
   ```

4. Verificare che non ci siano errori nel seeding

---

### **TASK 9: Test di Verifica**
**Obiettivo:** Verificare che le correzioni funzionino

1. Avviare il server di sviluppo:
   ```bash
   npm run dev
   ```

2. Avviare il server backend (se separato):
   ```bash
   npm run server
   ```

3. Navigare alla pagina di importazione nell'applicazione

4. Verificare che i template siano presenti e corretti

5. Testare un'importazione di prova (se disponibili file di esempio)

---

### **TASK 10: Verifica Struttura Dati**
**Obiettivo:** Confermare che i dati importati siano corretti

1. Accedere alla pagina "Database" nell'applicazione

2. Verificare che le tabelle contengano i dati corretti

3. Controllare che:
   - Le date non siano "01/01/1970"
   - Gli importi siano numerici e corretti
   - I testi siano leggibili e non troncati
   - Le relazioni tra tabelle funzionino

---

### **✅ TASK 11: Correzione Nomi Campi in importUtils.ts**
**Stato:** **COMPLETATO** ✅
**File:** `server/lib/importUtils.ts`
**Problema:** Il file utilizzava ancora i vecchi nomi dei campi (es. `id_registrazione`, `codice_causale`) invece dei nuovi nomi definiti nei template corretti (es. `externalId`, `causaleId`)

**Correzioni applicate:**
- `id_registrazione` → `externalId`
- `codice_causale` → `causaleId` 
- `data_registrazione` → `dataRegistrazione`
- `id_cliente_fornitore` → `clienteFornitoreCodiceFiscale`
- `data_documento` → `dataDocumento`
- `numero_documento` → `numeroDocumento`
- `id_registrazione_riga` → `externalId`
- `codice_conto` → `conto`
- `descrizione_riga` → `note`
- `importo_dare` → `importoDare`
- `importo_avere` → `importoAvere`
- `codice_iva` → `codiceIva`
- `codice_commessa` → `centroDiCosto`
- `codice_voce_analitica` → `parametro`
- `importo_allocato` → `parametro`

**Risultato:** L'errore `TypeError: Cannot read properties of undefined (reading 'trim')` è stato risolto. Il parser ora restituisce i dati con i nomi corretti e `importUtils.ts` li elabora correttamente.

---

## ✅ **RISULTATO ATTESO**

Dopo aver completato tutti i task:
- ✅ Template di importazione con mapping corretti
- ✅ Importazione dati funzionante al 100%
- ✅ Date, importi e testi importati correttamente
- ✅ Dashboard che mostra dati realistici
- ✅ Flusso completo import → storage → visualizzazione funzionante
- ✅ Nomi dei campi allineati tra template e logica di elaborazione

---

## 🚨 **NOTE IMPORTANTI**

1. **Backup**: Sempre fare backup prima delle modifiche
2. **Indici Array**: I tracciati usano indici 1-based, nel codice usiamo 0-based (quindi start = posizione_tracciato - 1)
3. **Tipi di dato**: 
   - `'string'` per testi
   - `'number'` per importi e numeri
   - `'date'` per date in formato GGMMAAAA
4. **Test incrementale**: Testare ogni template dopo la correzione
5. **Cursor IDE**: Utilizzare le funzionalità di auto-completamento e refactoring di Cursor per velocizzare il lavoro
6. **Coerenza nomi campi**: Verificare sempre che i nomi dei campi nei template corrispondano a quelli utilizzati nel codice di elaborazione