# Piano di Risoluzione Debito Tecnico

Questo documento traccia i problemi tecnici noti che sono stati identificati e la cui risoluzione è stata rimandata per non bloccare lo sviluppo di altre funzionalità.

---

## 1. Errori di Build nelle Rotte di Importazione

-   **Data Identificazione**: 25/07/2024
-   **File Coinvolti**:
    -   `server/routes/importScritture.ts`
    -   `server/routes/importTemplates.ts`

### Descrizione del Problema

Il comando `npm run build` fallisce a causa di una serie di errori di tipo TypeScript in questi due file. L'analisi ha rivelato che gli errori sono causati da un'incoerenza tra il codice dell'applicazione e lo schema del database definito in `prisma/schema.prisma` per il modello `ImportTemplate`.

**Dettagli Tecnici:**

1.  **Disallineamento dei Campi**: Il codice prova a utilizzare un campo `name` e una relazione `fields` che non esistono più nel modello `ImportTemplate`.
2.  **Schema Attuale**: Lo schema Prisma corrente definisce questi attributi come `modelName` e `fieldDefinitions`.
3.  **Tentativi di Correzione**: Abbiamo tentato di risolvere il problema rigenerando il Prisma Client (`npx prisma generate`) e aggiornando il codice. Tuttavia, questo ha portato a ulteriori errori, suggerendo un problema più profondo (es. l'uso di `findUnique` su `modelName` che, nonostante sia `@unique` nello schema, non viene riconosciuto come tale dal client obsoleto).

### Azione Corrente

Per evitare di bloccare l'implementazione della funzionalità di importazione della prima nota, si è deciso di **rimandare la correzione** di questi errori di build.

### Piano di Risoluzione Futuro

1.  **Verifica e Rigenerazione Client**: Assicurarsi che il comando `npx prisma generate` venga eseguito e completato con successo, per garantire che il Prisma Client sia perfettamente allineato allo schema.
2.  **Refactoring Mirato**: Eseguire un refactoring completo dei file `importScritture.ts` e `importTemplates.ts`, sostituendo tutte le occorrenze di `name` con `modelName` e di `fields` con `fieldDefinitions`.
3.  **Verifica Query**: Controllare che le query Prisma utilizzate siano corrette (es. `findUnique({ where: { modelName: '...' } })`).
4.  **Build Completa**: Eseguire nuovamente `npm run build` per confermare la risoluzione del problema. 