# 🔧 ISTRUZIONI PER CORREGGERE IL TEMPLATE anagrafica_clifor

## 🎯 PROBLEMA IDENTIFICATO
Il template `anagrafica_clifor` nel database ha campi completamente sbagliati che non corrispondono al tracciato ufficiale del file `A_CLIFOR.TXT` (338 bytes).

## 📋 OPERAZIONI DA ESEGUIRE

### 1. VERIFICA ESISTENZA FILE BACKEND
**File da controllare:** `server/routes/importAnagrafiche.ts`

**Azione:** 
- Se il file NON ESISTE → Crealo seguendo la struttura di `server/routes/importScrittureContabili.ts`
- Se il file ESISTE → Verificare che gestisca correttamente il template `anagrafica_clifor`

### 2. CORREZIONE TEMPLATE NEL DATABASE SEED
**File da modificare:** `prisma/seed.ts`

**Trovare la sezione:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'anagrafica_clifor',
    modelName: 'Cliente', // Gestirà entrambi tramite logica custom
    fields: { create: [ 
      // CAMPI ATTUALI SBAGLIATI DA SOSTITUIRE
    ] },
  }
});
```

**Sostituire COMPLETAMENTE i campi con quelli del tracciato ufficiale:**

I campi corretti sono (basati sul tracciato A_CLIFOR.TXT):
- **start: 20, length: 12** → `externalId` (CODICE UNIVOCO DI SCARICAMENTO)
- **start: 32, length: 16** → `codiceFiscale` (CODICE FISCALE CLIENTE/FORNITORE)  
- **start: 49, length: 1** → `tipo` (TIPO CONTO: C/F/E)
- **start: 82, length: 11** → `piva` (PARTITA IVA)
- **start: 94, length: 60** → `nome` (DENOMINAZIONE/RAGIONE SOCIALE)

**ATTENZIONE:** Gli indici nel tracciato partono da 1, nel codice partono da 0, quindi sottrarre 1 da ogni start.

### 3. VERIFICA LOGICA DI IMPORTAZIONE
**File da controllare:** `server/routes/importAnagrafiche.ts`

**Verificare che esista la logica speciale per `anagrafica_clifor`:**
- Deve leggere il campo `tipo` per distinguere se creare un Cliente (C) o Fornitore (F)
- Deve gestire correttamente i campi `externalId`, `codiceFiscale`, `piva`, `nome`
- Deve usare transazioni per garantire consistenza

### 4. RE-SEED DEL DATABASE
**Dopo aver corretto il seed:**

1. **Eliminare i template errati:**
   ```bash
   # Nel database, eliminare il template anagrafica_clifor esistente
   ```

2. **Ricreare il seed:**
   ```bash
   npx prisma db seed
   ```

3. **Verificare nel Database → Template Management** che il template `anagrafica_clifor` abbia i campi corretti

### 5. TEST DELL'IMPORTAZIONE
**Dopo le correzioni:**

1. Andare in **Import → Passo 1**
2. Selezionare **"Anagrafica Clienti/Fornitori (A_CLIFOR.TXT)"**
3. Caricare il file `A_CLIFOR.TXT` del cliente
4. Eseguire l'importazione
5. Verificare in **Database → Clienti** e **Database → Fornitori** che i dati siano stati importati

## ⚠️ PUNTI CRITICI DA NON SBAGLIARE

### Campo `tipo` (posizione 50 nel tracciato = start: 49 nel codice)
- **C** = Cliente → inserire in tabella `Cliente`
- **F** = Fornitore → inserire in tabella `Fornitore`  
- **E** = Entrambi → inserire in ENTRAMBE le tabelle

### Campo `piva` (posizione 83-93 nel tracciato = start: 82, length: 11)
- È di tipo **NUMERICO** nel tracciato
- Deve essere trattato come stringa nel database
- Verificare che non sia vuoto prima dell'inserimento

### Campo `externalId` (posizione 21-32 nel tracciato = start: 20, length: 12)
- È la chiave per collegare con le scritture contabili esistenti
- DEVE essere univoco e non vuoto
- Usarlo come `id` del record (dopo trim degli spazi)

### Gestione errori
- Saltare i record con dati mancanti critici (externalId vuoto)
- Loggare gli errori senza interrompere l'intero processo
- Usare transazioni per rollback in caso di errori gravi

## 🧪 VERIFICA FINALE
Dopo tutte le correzioni, il risultato atteso è:
- Template `anagrafica_clifor` con campi corretti nel database
- Importazione del file `A_CLIFOR.TXT` che popola le tabelle Cliente e Fornitore
- Dati reali visibili nelle sezioni Database del pannello admin

## 📝 NOTE IMPORTANTI
- **NON** modificare altri template che funzionano già
- **NON** toccare le 746 scritture contabili già importate
- Verificare che i campi abbiano i **nomi corretti** per essere utilizzati dalla logica backend
- Assicurarsi che gli **start index siano corretti** (tracciato parte da 1, codice da 0)