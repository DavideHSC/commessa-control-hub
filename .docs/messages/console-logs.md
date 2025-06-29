[dev:server] [IMPORT] Ricevuta richiesta per il template: anagrafica_clifor
[dev:server] [IMPORT] Ricevuto file: A_CLIFOR.TXT, dimensione: 239330 bytes
[dev:server] [IMPORT] Avvio nuovo workflow per anagrafica_clifor...
[dev:server] 🚀 Inizio workflow importazione anagrafiche
[dev:server] 📖 FASE 1: Parsing file A_CLIFOR.TXT...
[dev:server] [Parser] Caricamento template 'anagrafica_clifor' dal database...
[dev:server] [Parser] Caricato template con 40 field definitions
[dev:server] [Parser] File aperto con encoding: utf-8
[dev:server] [Parser] Inizio elaborazione 527 righe per template 'anagrafica_clifor'
[dev:server] [Parser] Elaborati 100 record...
[dev:server] [Parser] Elaborati 200 record...
[dev:server] [Parser] Elaborati 300 record...
[dev:server] [Parser] Elaborati 400 record...
[dev:server] [Parser] Elaborati 500 record...
[dev:server] [Parser] Parsing completato:
[dev:server]   - Record totali letti: 526
[dev:server]   - Record elaborati con successo: 526
[dev:server]   - Record con errori: 0
[dev:server] ✅ Parsing completato:
[dev:server]    - Righe totali: 526
[dev:server]    - Righe processate: 526
[dev:server]    - Righe con errori: 0
[dev:server] 🔍 FASE 2: Validazione e coercizione dati...
[dev:server] ✅ Validazione completata:
[dev:server]    - Record validi: 526
[dev:server]    - Errori validazione: 0
[dev:server] 🔄 FASE 3: Trasformazione e smistamento Cliente/Fornitore...
[dev:server] ✅ Trasformazione completata:
[dev:server]    - Clienti da creare: 52
[dev:server]    - Fornitori da creare: 487
[dev:server]    - Record "Entrambi": 13
[dev:server]    - Persone fisiche: 115
[dev:server]    - Società: 411
[dev:server] 💾 FASE 4: Salvataggio atomico nel database...
[dev:server] 🗑️  Eliminazione dati esistenti...
[dev:server] ❌ Errore durante l'importazione anagrafiche: 
[dev:server] Invalid `tx.commessa.deleteMany()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importAnagraficheWorkflow.ts:160:49
[dev:server]
[dev:server]   157
[dev:server]   158 // L'ordine di eliminazione è FONDAMENTALE per rispettare i vincoli di Foreign Key.
[dev:server]   159 // 1. Eliminiamo le tabelle che dipendono da Cliente e Fornitore.
[dev:server] → 160 const deletedCommesse = await tx.commessa.deleteMany(
[dev:server] Foreign key constraint failed on the field: `Allocazione_commessaId_fkey (index)`
[dev:server] Stack trace: PrismaClientKnownRequestError:
[dev:server] Invalid `tx.commessa.deleteMany()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importAnagraficheWorkflow.ts:160:49
[dev:server]
[dev:server]   157
[dev:server]   158 // L'ordine di eliminazione è FONDAMENTALE per rispettare i vincoli di Foreign Key.
[dev:server]   159 // 1. Eliminiamo le tabelle che dipendono da Cliente e Fornitore.
[dev:server] → 160 const deletedCommesse = await tx.commessa.deleteMany(
[dev:server] Foreign key constraint failed on the field: `Allocazione_commessaId_fkey (index)`
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6927)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)  
[dev:server]     at async <anonymous> (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importAnagraficheWorkflow.ts:160:31)
[dev:server]     at async Proxy._transactionWithCallback (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:7483)
[dev:server]     at async executeAnagraficheImportWorkflow (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importAnagraficheWorkflow.ts:154:5)
[dev:server]     at async <anonymous> (G:\HSC\Reale\commessa-control-hub\server\routes\importAnagrafiche.ts:42:28) {     
[dev:server]   code: 'P2003',
[dev:server]   clientVersion: '5.16.2',
[dev:server]   meta: {
[dev:server]     modelName: 'Commessa',
[dev:server]     field_name: 'Allocazione_commessaId_fkey (index)'
[dev:server]   }
[dev:server] }