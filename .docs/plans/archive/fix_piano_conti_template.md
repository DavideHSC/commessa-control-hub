# 🎯 TASK: Correggere Template Piano dei Conti (CONTIGEN.TXT)

## 📋 OBIETTIVO
Sistemare il template `piano_dei_conti` per importare correttamente il file `CONTIGEN.TXT` (388 bytes) che contiene il piano dei conti del cliente.

## 🔍 PROBLEMA ATTUALE
Il template `piano_dei_conti` nel seed ha campi probabilmente sbagliati che non corrispondono al tracciato ufficiale.

## 📊 TRACCIATO UFFICIALE CONTIGEN.TXT (388 bytes)

### Campi Principali da Mappare:
- **[6-15]** CODIFICA (MM/MMCC/MMCCSSSSSS) - 10 caratteri → `codice` (id univoco)
- **[16-75]** DESCRIZIONE - 60 caratteri → `nome` 
- **[76-76]** TIPO - 1 carattere → `tipo`
  - `P` = Patrimoniale
  - `E` = Economico  
  - `O` = Conto d'ordine
  - `C` = Cliente
  - `F` = Fornitore
- **[5-5]** LIVELLO - 1 carattere → informativo (1=Mastro, 2=Conto, 3=Sottoconto)

## 🔧 OPERAZIONI DA ESEGUIRE

### 1. VERIFICARE TEMPLATE ATTUALE
**File:** `prisma/seed.ts`

**Trovare la sezione:**
```typescript
await prisma.importTemplate.create({
  data: {
    nome: 'piano_dei_conti',
    modelName: 'Conto',
    fields: { create: [ 
      // VERIFICARE SE I CAMPI SONO CORRETTI
    ] },
  }
});
```

### 2. CORREGGERE I CAMPI DEL TEMPLATE
**Campi corretti (ricorda: start dal tracciato -1 per indice array):**

```typescript
fields: { create: [
  { nomeCampo: 'codice', start: 5, length: 10 },    // CODIFICA (pos 6-15)
  { nomeCampo: 'nome', start: 15, length: 60 },     // DESCRIZIONE (pos 16-75)  
  { nomeCampo: 'tipoChar', start: 75, length: 1 },  // TIPO (pos 76) - campo temporaneo
  { nomeCampo: 'livello', start: 4, length: 1 }     // LIVELLO (pos 5) - informativo
] }
```

### 3. AGGIORNARE LOGICA DI IMPORTAZIONE
**File:** `server/routes/importAnagrafiche.ts`

**Aggiungere logica speciale per `piano_dei_conti`:**

```typescript
if (templateName === 'piano_dei_conti') {
  await prisma.$transaction(async (tx) => {
    for (const record of parsedData) {
      // Mappa il tipo carattere a TipoConto enum
      let tipo: TipoConto;
      switch (record.tipoChar?.trim()) {
        case 'P': tipo = 'Patrimoniale'; break;
        case 'E': tipo = record.codice?.startsWith('1') ? 'Ricavo' : 'Costo'; break;
        case 'C': tipo = 'Cliente'; break;
        case 'F': tipo = 'Fornitore'; break;
        default: tipo = 'Patrimoniale'; break;
      }

      const dataToUpsert = {
        id: record.codice?.trim() || 'UNKNOWN',
        externalId: record.codice?.trim(),
        codice: record.codice?.trim(),
        nome: record.nome?.trim() || 'Conto senza nome',
        tipo: tipo,
        richiedeVoceAnalitica: false,
        vociAnaliticheAbilitateIds: [],
        contropartiteSuggeriteIds: []
      };

      // Skip se codice vuoto
      if (!dataToUpsert.codice) continue;

      await tx.conto.upsert({
        where: { id: dataToUpsert.id },
        update: dataToUpsert,
        create: dataToUpsert,
      });
    }
  });
  
  return res.status(200).json({ 
    message: `Importazione piano dei conti completata.` 
  });
}
```

### 4. VERIFICARE ENUM TipoConto
**File:** `prisma/schema.prisma`

**Assicurarsi che l'enum sia corretto:**
```prisma
enum TipoConto {
  Costo
  Ricavo
  Patrimoniale
  Fornitore
  Cliente
}
```

### 5. RE-SEED E TEST
**Comandi da eseguire:**

1. **Re-seed del database:**
   ```bash
   npx prisma db seed
   ```

2. **Verifica template in Database → Template Management**

3. **Test importazione:**
   - Import → Passo 1 → "Anagrafica Piano dei Conti"
   - Caricare file `CONTIGEN.TXT`
   - Eseguire importazione

4. **Verificare risultati in Database → Piano dei Conti**

## 🎯 RISULTATO ATTESO
- Template `piano_dei_conti` con campi corretti
- Importazione file `CONTIGEN.TXT` che popola tabella `Conto`
- Codici conto delle 746 scritture esistenti ora hanno nomi descrittivi
- Base per collegare tutte le altre anagrafiche

## ⚠️ PUNTI CRITICI
- **Campo `codice`** deve essere univoco e non vuoto (chiave primaria)
- **Mappatura `tipo`** deve rispettare l'enum TipoConto del database  
- **Trimming spazi** fondamentale per i file a larghezza fissa
- **Gestione errori** per record malformati senza bloccare l'importazione

## 🧪 VERIFICA SUCCESSO
Dopo l'importazione, andando in Database → Piano dei Conti dovresti vedere:
- Lista completa dei conti contabili del cliente
- Nomi descrittivi invece di codici numerici
- Tipi di conto classificati correttamente
- Possibilità di collegare le scritture esistenti ai nomi dei conti