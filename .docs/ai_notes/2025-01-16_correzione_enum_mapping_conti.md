# Correzione Enum Mapping Piano dei Conti

**Data**: 16 Gennaio 2025  
**Problema**: Il filtro "Ricavo" nell'endpoint `/impostazioni/conti` non restituiva risultati  
**Stato**: ✅ Risolto

## Problema Identificato

### Sintomi
- L'endpoint `/api/conti?tipo=Ricavo` restituiva array vuoto
- Il filtro "Ricavo" nella pagina `/impostazioni/conti` non mostrava risultati
- I conti di tipo Ricavo venivano classificati erroneamente come "Economico"

### Analisi Root Cause
Il problema era dovuto a **due discrepanze** nel mapping degli enum tra il tracciato CONTIGEN.TXT e il codice:

#### 1. Decoder `determineTipoConto` (contoDecoders.ts)
```typescript
// ❌ LOGICA ERRATA (precedente)
case 'E': 
    if (codice?.startsWith('6')) { // I costi iniziano per 6
        return TipoConto.Costo;
    }
    if (codice?.startsWith('7')) { // I ricavi iniziano per 7
        return TipoConto.Ricavo;
    }
    return TipoConto.Economico;
```

#### 2. Finalizzazione `finalizeConti` (finalization.ts)
```typescript
// ❌ LOGICA ERRATA (precedente)
switch (sc.tipo) {
    case 'C': tipoConto = 'Costo'; break;
    case 'R': tipoConto = 'Ricavo'; break;
    case 'L': tipoConto = 'Cliente'; break;  // ❌ ERRORE: dovrebbe essere 'C'
    case 'E': tipoConto = 'Economico'; break; // ❌ Non distingue Costo/Ricavo
}
```

## Documentazione Tracciato CONTIGEN.md

Secondo la documentazione ufficiale del tracciato CONTIGEN.TXT:

### Campi Rilevanti
- **TIPO** (posizione 76): P=Patrimoniale, E=Economico, O=Ordine, C=Cliente, F=Fornitore
- **GRUPPO** (posizione 257): A=Attività, C=Costo, P=Passività, R=Ricavo

### Logica Corretta
Per distinguere Costo/Ricavo nei conti economici:
- `TIPO='E'` + `GRUPPO='C'` = **Costo**
- `TIPO='E'` + `GRUPPO='R'` = **Ricavo**

## Correzioni Implementate

### 1. Decoder `determineTipoConto`
```typescript
// ✅ LOGICA CORRETTA (dopo correzione)
export function determineTipoConto(tipoChar?: string | null, codice?: string | null, gruppo?: string | null): TipoConto {
    const tipo = tipoChar?.trim().toUpperCase();
    const gruppoNorm = gruppo?.trim().toUpperCase();
    
    switch (tipo) {
        case 'P': return TipoConto.Patrimoniale;
        case 'E': 
            // Usa il campo GRUPPO per distinguere Costo/Ricavo (logica corretta dal tracciato)
            if (gruppoNorm === 'C') {
                return TipoConto.Costo;
            }
            if (gruppoNorm === 'R') {
                return TipoConto.Ricavo;
            }
            // Fallback alla logica precedente basata sui prefissi del codice
            if (codice?.startsWith('6')) {
                return TipoConto.Costo;
            }
            if (codice?.startsWith('7')) {
                return TipoConto.Ricavo;
            }
            return TipoConto.Economico;
        case 'C': return TipoConto.Cliente;
        case 'F': return TipoConto.Fornitore;
        case 'O': return TipoConto.Ordine;
        default: return TipoConto.Patrimoniale;
    }
}
```

### 2. Finalizzazione `finalizeConti`
```typescript
// ✅ LOGICA CORRETTA (dopo correzione)
switch (sc.tipo) {
    case 'P': tipoConto = 'Patrimoniale'; break;
    case 'C': tipoConto = 'Cliente'; break; // Corretto: C = Cliente
    case 'F': tipoConto = 'Fornitore'; break;
    case 'O': tipoConto = 'Ordine'; break;
    case 'E': 
        // Per conti economici, usa il campo GRUPPO per distinguere Costo/Ricavo
        if (sc.gruppo === 'C') {
            tipoConto = 'Costo';
        } else if (sc.gruppo === 'R') {
            tipoConto = 'Ricavo';
        } else {
            tipoConto = 'Economico';
        }
        break;
    default: tipoConto = 'Economico';
}
```

## File Modificati

### `/server/import-engine/transformation/decoders/contoDecoders.ts`
- Aggiornata funzione `determineTipoConto()` per supportare parametro `gruppo`
- Implementata logica prioritaria basata sul campo GRUPPO dal tracciato
- Mantenuto fallback per compatibilità con logica precedente

### `/server/lib/finalization.ts`
- Corretta mappatura `tipo='C'` → `Cliente` (era erroneamente `'L'`)
- Implementata logica per distinguere Costo/Ricavo usando `sc.gruppo`
- Allineata alla documentazione del tracciato CONTIGEN.md

## Impatto della Correzione

### Prima della Correzione
- Conti con `TIPO='E'` e `GRUPPO='R'` → classificati come `Economico`
- Filtro "Ricavo" → risultato vuoto
- Mappatura errata: `tipo='L'` → `Cliente`

### Dopo la Correzione
- Conti con `TIPO='E'` e `GRUPPO='R'` → classificati come `Ricavo`
- Filtro "Ricavo" → risultati corretti
- Mappatura corretta: `tipo='C'` → `Cliente`

## Schema di Mapping Corretto

| Tracciato CONTIGEN | Database TipoConto | Descrizione |
|-------------------|-------------------|-------------|
| TIPO='P' | Patrimoniale | Conti patrimoniali |
| TIPO='C' | Cliente | Conti clienti |
| TIPO='F' | Fornitore | Conti fornitori |
| TIPO='O' | Ordine | Conti d'ordine |
| TIPO='E' + GRUPPO='C' | Costo | Conti di costo |
| TIPO='E' + GRUPPO='R' | Ricavo | Conti di ricavo |
| TIPO='E' + GRUPPO='A' | Economico | Conti economici generici |

## Testing Requirements

Per verificare la correzione:

1. **Reimport del piano dei conti** - Necessario per aggiornare classificazioni esistenti
2. **Test endpoint API** - Verificare che `/api/conti?tipo=Ricavo` restituisca risultati
3. **Test interfaccia utente** - Verificare funzionamento filtro nella pagina `/impostazioni/conti`
4. **Verifica data consistency** - Controllare che tutti i conti siano classificati correttamente

## Risultati Test (16 Gennaio 2025)

### ✅ Test Riusciti
- **Clean slate reset** - Eseguito con successo
- **Reimport piano dei conti** - Dati aggiornati con nuove logiche
- **Finalizzazione** - Applicata correttamente

### ✅ Verifica API Endpoint
```bash
curl -s "http://localhost:3001/api/conti?tipo=Ricavo"
```

**Risultato**: 
- ✅ Restituisce conti con `"tipo":"Ricavo"`
- ✅ Conti hanno `"gruppo":"R"` (corretto dal tracciato)
- ✅ Esempio: `"nome":"VALORE DELLA PRODUZIONE E RICAVI VARI"` con `"codice":"55"`

### ✅ Correzione Validata
La correzione funziona perfettamente:
1. I conti di ricavo sono ora classificati correttamente
2. L'endpoint `/api/conti?tipo=Ricavo` restituisce risultati
3. La logica è allineata al tracciato CONTIGEN.md

---

*Questa correzione risolve definitivamente il problema di classificazione dei conti di ricavo nel sistema, allineando il codice alla documentazione ufficiale del tracciato CONTIGEN.TXT.*