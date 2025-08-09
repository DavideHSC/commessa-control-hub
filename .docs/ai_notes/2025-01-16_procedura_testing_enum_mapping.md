# Procedura di Testing - Correzione Enum Mapping Piano dei Conti

**Data**: 16 Gennaio 2025  
**Correzione**: Fix enum mapping per conti di tipo Ricavo  
**Prerequisiti**: Correzione implementata nei file `contoDecoders.ts` e `finalization.ts`

## Fasi di Testing

### Fase 1: Preparazione Database
**Obiettivo**: Assicurarsi che il database rifletta le nuove logiche di classificazione

#### 1.1 Backup Database (Opzionale ma Consigliato)
```bash
# Backup del database prima del testing
pg_dump -h localhost -U postgres -d commessa_control_hub > backup_pre_fix.sql
```

#### 1.2 Clean Slate Reset
```bash
# Avvia il server di sviluppo
cd /mnt/g/HSC/Reale/commessa-control-hub
npm run dev
```

**Chiamata API di Reset:**
```bash
curl -X POST http://localhost:3000/api/system/finalization/clean-slate
```

#### 1.3 Reimport Piano dei Conti
```bash
# Importa nuovamente il piano dei conti con le nuove logiche
curl -X POST http://localhost:3000/api/import/piano-conti \
  -H "Content-Type: multipart/form-data" \
  -F "file=@.docs/dati_cliente/dati_esempio/ContiGen.txt"
```

#### 1.4 Finalizzazione
```bash
# Esegui la finalizzazione per applicare le nuove logiche
curl -X POST http://localhost:3000/api/system/finalization/finalize-all
```

### Fase 2: Verifica Database
**Obiettivo**: Controllare che i conti siano classificati correttamente

#### 2.1 Query di Verifica SQL
```sql
-- Verifica distribuzione per tipo dopo la correzione
SELECT tipo, COUNT(*) as count
FROM "Conto" 
GROUP BY tipo 
ORDER BY count DESC;

-- Verifica conti di ricavo specifici
SELECT codice, nome, tipo, gruppo
FROM "Conto" 
WHERE tipo = 'Ricavo' 
LIMIT 10;

-- Verifica conti economici rimanenti
SELECT codice, nome, tipo, gruppo
FROM "Conto" 
WHERE tipo = 'Economico' 
LIMIT 10;

-- Verifica staging vs produzione
SELECT 
    s.tipo as staging_tipo,
    s.gruppo as staging_gruppo,
    c.tipo as produzione_tipo,
    COUNT(*) as count
FROM staging_conti s
JOIN "Conto" c ON s.codice = c.codice
GROUP BY s.tipo, s.gruppo, c.tipo
ORDER BY count DESC;
```

#### 2.2 Verifica tramite API
**Nota**: I test curl devono essere eseguiti dall'utente (Claude su WSL, progetto su Windows)

```bash
# Test endpoint conti - tutti i tipi
curl "http://localhost:3001/api/conti"

# Test filtro Ricavo (questo dovrebbe ora restituire risultati)
curl "http://localhost:3001/api/conti?tipo=Ricavo"

# Test filtro Costo
curl "http://localhost:3001/api/conti?tipo=Costo"

# Test filtro Economico (dovrebbe essere ridotto)
curl "http://localhost:3001/api/conti?tipo=Economico"
```

### Fase 3: Test Interfaccia Utente
**Obiettivo**: Verificare che l'interfaccia web funzioni correttamente

#### 3.1 Test Pagina Configurazione Conti
1. Navigare a `http://localhost:3000/impostazioni/conti`
2. Verificare che la pagina carichi senza errori
3. Testare il filtro dropdown per "Tipo"
4. Selezionare "Ricavo" e verificare che vengano mostrati risultati
5. Verificare che i conti mostrati abbiano effettivamente tipo "Ricavo"

#### 3.2 Test Filtri
```javascript
// Test da console browser sulla pagina /impostazioni/conti
// Verifica che i filtri funzionino correttamente

// 1. Clicca sul filtro tipo
document.querySelector('[data-testid="tipo-filter"]').click();

// 2. Seleziona "Ricavo"
document.querySelector('[data-value="Ricavo"]').click();

// 3. Verifica che ci siano risultati
const results = document.querySelectorAll('[data-testid="conto-row"]');
console.log(`Conti di tipo Ricavo trovati: ${results.length}`);
```

### Fase 4: Test Regressione
**Obiettivo**: Assicurarsi che non ci siano regressioni negli altri tipi di conto

#### 4.1 Test Tutti i Tipi di Conto
```bash
# Test sistematico di tutti i tipi
for tipo in "Costo" "Ricavo" "Patrimoniale" "Cliente" "Fornitore" "Economico" "Ordine"; do
  count=$(curl -s "http://localhost:3000/api/conti?tipo=$tipo" | jq '.data | length')
  echo "$tipo: $count conti"
done
```

#### 4.2 Verifica Coerenza Dati
```sql
-- Verifica che non ci siano incongruenze nei dati
SELECT 
    COUNT(*) as total_conti,
    SUM(CASE WHEN tipo = 'Ricavo' THEN 1 ELSE 0 END) as ricavi,
    SUM(CASE WHEN tipo = 'Costo' THEN 1 ELSE 0 END) as costi,
    SUM(CASE WHEN tipo = 'Economico' THEN 1 ELSE 0 END) as economici
FROM "Conto";

-- Verifica che i conti di ricavo abbiano effettivamente gruppo = 'R'
SELECT COUNT(*) as ricavi_con_gruppo_r
FROM "Conto" 
WHERE tipo = 'Ricavo' AND gruppo = 'R';

-- Verifica che i conti di costo abbiano effettivamente gruppo = 'C'
SELECT COUNT(*) as costi_con_gruppo_c
FROM "Conto" 
WHERE tipo = 'Costo' AND gruppo = 'C';
```

### Fase 5: Test Performance
**Obiettivo**: Verificare che le modifiche non abbiano impatti negativi sulle performance

#### 5.1 Test Tempo di Risposta
```bash
# Test tempo di risposta per filtri
time curl -s "http://localhost:3000/api/conti?tipo=Ricavo" > /dev/null
time curl -s "http://localhost:3000/api/conti?tipo=Costo" > /dev/null
time curl -s "http://localhost:3000/api/conti" > /dev/null
```

#### 5.2 Test Carico
```bash
# Test carico con più richieste simultanee
for i in {1..10}; do
  curl -s "http://localhost:3000/api/conti?tipo=Ricavo" &
done
wait
```

## Criteri di Successo

### ✅ Risultati Attesi
1. **Filtro Ricavo**: Deve restituire conti con `tipo='Ricavo'`
2. **Filtro Costo**: Deve restituire conti con `tipo='Costo'`
3. **Filtro Economico**: Deve restituire solo conti non classificabili come Costo/Ricavo
4. **Coerenza Dati**: Tutti i conti devono avere una classificazione corretta
5. **Performance**: Nessun degradamento delle performance
6. **UI**: Interfaccia utente deve funzionare senza errori

### ❌ Condizioni di Fallimento
1. Filtro "Ricavo" restituisce array vuoto
2. Incongruenze tra staging e produzione
3. Errori nell'interfaccia utente
4. Degradamenti significativi delle performance
5. Classificazioni errate di conti esistenti

## Rollback Procedure

Se il testing fallisce:

1. **Ripristina backup database**:
```bash
psql -h localhost -U postgres -d commessa_control_hub < backup_pre_fix.sql
```

2. **Reverta modifiche codice**:
```bash
git checkout HEAD~1 -- server/import-engine/transformation/decoders/contoDecoders.ts
git checkout HEAD~1 -- server/lib/finalization.ts
```

3. **Riavvia server**:
```bash
npm run dev
```

## Documentazione Risultati

Dopo il testing, aggiornare questo documento con:
- [ ] Risultati delle query SQL
- [ ] Screenshot dell'interfaccia utente
- [ ] Metriche di performance
- [ ] Eventuali problemi riscontrati
- [ ] Azioni correttive implementate

---

*Seguire questa procedura assicura che la correzione funzioni correttamente e non introduca regressioni nel sistema.*