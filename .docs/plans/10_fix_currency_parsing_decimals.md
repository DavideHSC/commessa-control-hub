# Piano 10: Fix Currency Parsing - Risoluzione Problemi Decimali Importi

**Data**: 2025-01-16  
**Priorità**: 🔴 CRITICA  
**Stato**: 📝 PIANIFICATO  

## 🎯 PROBLEMA IDENTIFICATO

### Descrizione
Le scritture contabili importate mostrano **sbilanciamenti contabili** con movimenti Dare/Avere non quadrati. Esempio dall'interfaccia utente:
- **Movimento 02/01/2025 - Causale PAGA**: Dare €25.75, Avere €2500.75 (dovrebbe quadrare)

### Causa Root
Il **currencyTransform** nel validator delle scritture contabili applica erroneamente la logica "decimali impliciti" anche ai file di prima nota che hanno **decimali espliciti**.

**File sorgente (PNRIGCON.TXT):**
```
0120251105221  1890000450        2500     → €25.00  ✅ CORRETTO  
0120251105222  6015004700        0.75     → €0.75   ✅ CORRETTO
0120251105223  2205000102         2500.75 → €2500.75 ❌ DIVENTA €25.00
```

**Codice problematico (`scrittureContabiliValidator.ts`):**
```typescript
const currencyTransform = z.string().transform((val) => {
  // Handle implicit decimals (e.g., "12345" -> 123.45)
  if (!cleaned.includes('.')) {
    return parsed / 100;  // ❌ SEMPRE DIVIDE PER 100
  }
  return parseFloat(cleaned); // ✅ GESTISCE DECIMALI ESPLICITI
});
```

### Impatto
- ❌ Scritture contabili sbilanciate nel database
- ❌ Dati contabili inaffidabili per l'analisi delle commesse
- ❌ Impossibilità di fare riconciliazioni corrette

---

## 🚀 STRATEGIA DI RISOLUZIONE

### Approccio
**Fix mirato** del `currencyTransform` con:
1. **Rimozione** della logica decimali impliciti per file di prima nota
2. **Mantenimento** della conversione standard (virgola→punto, parseFloat)
3. **Test** con dati reali per validazione
4. **Verifica** pareggio contabile post-fix

### Fasi di Implementazione

---

## 📋 FASE 1: ANALISI E PREPARAZIONE
**Durata**: 30 minuti  
**Obiettivo**: Verificare l'entità del problema e preparare l'ambiente di test

### Passi:
1. **Backup del database attuale**
2. **Creazione script di test** per validare i dati prima/dopo
3. **Identificazione di tutti i file** che usano `currencyTransform`
4. **Documentazione esempi** di dati problematici

### Deliverable:
- [ ] Script di backup database
- [ ] Script di test validation importi
- [ ] Lista file coinvolti
- [ ] Esempi documentati del problema

---

## 📋 FASE 2: FIX CURRENCY TRANSFORM
**Durata**: 45 minuti  
**Obiettivo**: Correggere la logica di parsing degli importi

### Passi:
1. **Modifica `currencyTransform`** per rimuovere decimali impliciti
2. **Creazione `currencyTransformExplicit`** per file di prima nota
3. **Aggiornamento validator** scritture contabili
4. **Test unitari** della nuova logica

### Codice Target:
```typescript
// NUOVO: Per file con decimali espliciti (prima nota)
const currencyTransformExplicit = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });

// ESISTENTE: Per file con decimali impliciti (mantenuto per altri file)
const currencyTransformImplicit = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    if (!cleaned.includes('.')) {
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed / 100;
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });
```

### Deliverable:
- [ ] `currencyTransformExplicit` implementato
- [ ] Validator aggiornato
- [ ] Test unitari passanti

---

## 📋 FASE 3: TEST E VALIDAZIONE
**Durata**: 30 minuti  
**Obiettivo**: Verificare che il fix risolva il problema senza introdurre regressioni

### Passi:
1. **Re-import** dei dati di test problematici
2. **Verifica pareggio** contabile delle scritture
3. **Controllo altri tipi** di import (anagrafiche, causali, etc.)
4. **Test regressione** su dati esistenti

### Validazioni:
- ✅ Movimento 012025110522: Dare €25.75 = Avere €25.75
- ✅ Nessun breaking change su altri import
- ✅ Tutte le scritture quadrate (Dare = Avere)

### Deliverable:
- [ ] Report validazione pre/post fix
- [ ] Conferma pareggio contabile
- [ ] Test regressione completo

---

## 📋 FASE 4: DEPLOYMENT E MONITORAGGIO
**Durata**: 15 minuti  
**Obiettivo**: Applicare il fix in produzione e monitorare i risultati

### Passi:
1. **Deploy** del fix in ambiente di sviluppo
2. **Re-import completo** dei dati di prima nota
3. **Verifica frontend** che i movimenti siano quadrati
4. **Documentazione** del fix per future reference

### Deliverable:
- [ ] Fix applicato in produzione
- [ ] Dati contabili corretti e quadrati
- [ ] Documentazione aggiornata

---

## 🔍 CRITERI DI SUCCESSO

### Verifiche Post-Fix:
1. **Pareggio Contabile**: Tutte le scritture con Dare = Avere (tolleranza ±€0.01)
2. **Dati Corretti**: Gli importi corrispondono esattamente ai file sorgente
3. **No Regressioni**: Altri import (anagrafiche, causali) funzionano ancora
4. **UI Consistente**: Frontend mostra movimenti quadrati

### Metriche:
- **Scritture Sbilanciate**: Da ~10+ a 0
- **Accuratezza Importi**: 100% corrispondenza file sorgente
- **Import Success Rate**: >95% per tutti i tipi di file

---

## 🚨 RISCHI E MITIGAZIONI

### Rischi Identificati:
1. **Breaking Changes**: Altri file potrebbero usare decimali impliciti
   - **Mitigazione**: Test separati per ogni tipo di file
2. **Perdita Dati**: Modifica retrospettiva dei dati esistenti
   - **Mitigazione**: Backup completo prima delle modifiche
3. **Regressioni**: Altri import potrebbero rompersi
   - **Mitigazione**: Test suite completa pre/post deployment

### Rollback Plan:
- Ripristino backup database
- Revert codice al commit precedente
- Re-test sistema esistente

---

## 📚 DOCUMENTAZIONE DI RIFERIMENTO

### File Coinvolti:
- `server/import-engine/acquisition/validators/scrittureContabiliValidator.ts`
- `.docs/tracciati-analizzati/movimenti_contabili.md`
- Dati test: `.docs/dati_cliente/prima_nota/PNRIGCON.TXT`

### Standard di Riferimento:
- **PNRIGCON.TXT**: Posizioni 59-70 (DARE), 71-82 (AVERE)
- **Formato Decimali**: Espliciti con punto (es. "2500.75")
- **Logica Contabile**: Σ(Dare) = Σ(Avere) per ogni scrittura

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### Pre-Fix:
- [ ] Backup database completato
- [ ] Script di test preparati
- [ ] Esempi problematici documentati
- [ ] Ambiente di test pronto

### Durante Fix:
- [ ] `currencyTransformExplicit` implementato
- [ ] Validator aggiornato con nuova funzione
- [ ] Test unitari scritti e passanti
- [ ] Codice committed e pushato

### Post-Fix:
- [ ] Dati re-importati con successo
- [ ] Pareggio contabile verificato
- [ ] Test regressione completato
- [ ] Frontend aggiornato e funzionante

### Completamento:
- [ ] Documentazione aggiornata
- [ ] Piano di monitoraggio attivo
- [ ] Team informato delle modifiche
- [ ] Metriche di successo raggiunte

---

**Note**: Questo fix è **critico** per l'affidabilità dell'applicazione. I dati contabili devono essere accurati al 100% per supportare l'analisi delle commesse. 