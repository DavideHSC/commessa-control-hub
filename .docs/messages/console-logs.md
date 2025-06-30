[dev:server] Server in esecuzione sulla porta 3001
[dev:server] 🔍 DEBUG HANDLER: Files ricevuti: 4
[dev:server] 🔍 DEBUG HANDLER: File "movanac" - 14796 bytes
[dev:server] 🔍 DEBUG HANDLER: File "pnrigcon" - 609160 bytes
[dev:server] 🔍 DEBUG HANDLER: File "pnrigiva" - 37800 bytes
[dev:server] 🔍 DEBUG HANDLER: File "pntesta" - 709446 bytes
[dev:server] 🚨 HANDLER: Eseguendo workflow...
[dev:server]
[dev:server] ================================================================================
[dev:server] 🚀 PARSER 6: SCRITTURE CONTABILI - Avvio Import Multi-File
[dev:server] ================================================================================
[dev:server] [2025-06-30T13:21:15.019Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Job import_scritture_contabili started { jobType: 'import_scritture_contabili', metadata: undefined }
[dev:server]
[dev:server] 📋 FASE 1: ACQUISIZIONE DATI
[dev:server] ──────────────────────────────────────────────────
[dev:server] 🔍 DEBUG: File ricevuti:
[dev:server]   - pnTesta: 709446 bytes
[dev:server]   - pnRigCon: 609160 bytes
[dev:server]   - pnRigIva: 37800 bytes
[dev:server]   - movAnac: 14796 bytes
[dev:server] [2025-06-30T13:21:15.019Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Iniziando parsing multi-file...
[dev:server] [2025-06-30T13:21:15.019Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Utilizzando definizioni di campo statiche dal codice.
[dev:server] [Parser] Parsing completato. 746 record estratti dal file.
[dev:server] [Parser] Parsing completato. 1940 record estratti dal file.
[dev:server] [Parser] Parsing completato. 216 record estratti dal file.
[dev:server] [Parser] Parsing completato. 411 record estratti dal file.
[dev:server] ✅ Parsing completato:
[dev:server]    📄 PNTESTA.TXT:    746 record (testate)
[dev:server]    📄 PNRIGCON.TXT:  1940 record (righe contabili)
[dev:server]    📄 PNRIGIVA.TXT:   216 record (righe IVA)
[dev:server]    📄 MOVANAC.TXT:    411 record (allocazioni)
[dev:server]    📊 TOTALE:        3313 record estratti
[dev:server]
[dev:server] 🔍 FASE 2: VALIDAZIONE E PULIZIA DATI
[dev:server] ──────────────────────────────────────────────────
[dev:server] [2025-06-30T13:21:15.073Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Iniziando validazione dati...
[dev:server] ✅ Validazione completata:
[dev:server]    ✓ Testate valide:         746 / 746
[dev:server]    ✓ Righe contabili valide: 1940 / 1940
[dev:server]    ✓ Righe IVA valide:       216 / 216
[dev:server]    ✓ Allocazioni valide:     411 / 411
[dev:server]    📊 TOTALE VALIDI:        3313 record
[dev:server]    ❌ Record scartati:          0 record (→ DLQ)
[dev:server]
[dev:server] 🔄 FASE 3: TRASFORMAZIONE BUSINESS LOGIC
[dev:server] ──────────────────────────────────────────────────
[dev:server] [2025-06-30T13:21:15.416Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Iniziando trasformazione business logic...
[dev:server] 🔧 Transformer COMPLETO: Creazione di TUTTE le entità...
[dev:server] 📋 Organizzando 746 testate...
[dev:server] ✅ Testate organizzate. Prime 5 chiavi: [
[dev:server]   '012025110001',
[dev:server]   '012025110002',
[dev:server]   '012025110003',
[dev:server]   '012025110004',
[dev:server]   '012025110005'
[dev:server] ]
[dev:server] 💰 Associando 1940 righe contabili...
[dev:server] ✅ 1940/1940 righe contabili associate
[dev:server] 📊 Associando 216 righe IVA...
[dev:server] ✅ 216/216 righe IVA associate
[dev:server] 🏭 Associando 411 allocazioni...
[dev:server] ✅ 411/411 allocazioni associate
[dev:server] 🔧 Creando tutte le entità Prisma...
[dev:server] ✅ Transformer COMPLETO: 746 scritture complete create
[dev:server]    📊 Righe contabili: 1940
[dev:server]    💰 Righe IVA: 216
[dev:server]    🏭 Allocazioni: 411
[dev:server] ✅ Trasformazione completata:
[dev:server]    📝 Scritture create:         746
[dev:server]    💰 Righe contabili create:  1940
[dev:server]    📊 Righe IVA create:         216
[dev:server]    🏭 Allocazioni create:       411
[dev:server]
[dev:server] 💾 FASE 4: PERSISTENZA ATOMICA
[dev:server] ──────────────────────────────────────────────────
[dev:server] [2025-06-30T13:21:15.452Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Iniziando persistenza con staging-commit...
[dev:server] [2025-06-30T13:21:15.453Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 💾 PERSISTENZA COMPLETA: Salvataggio di tutte le entità
[dev:server] [2025-06-30T13:21:15.544Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ Cliente di sistema (cliente_sistema) assicurato.
[dev:server] [2025-06-30T13:21:15.544Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 🏢 Creazione 93 fornitori...
[dev:server] [2025-06-30T13:21:20.558Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 📋 Creazione 21 causali...
[dev:server] [2025-06-30T13:21:21.405Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 🏦 Creazione 253 conti...
[dev:server] [2025-06-30T13:21:31.321Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 📊 Creazione 25 codici IVA...
[dev:server] [2025-06-30T13:21:32.694Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 🏭 Creazione 7 commesse...
[dev:server] [2025-06-30T13:21:33.100Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 📈 Creazione 1 voci analitiche...
[dev:server] [2025-06-30T13:21:33.156Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 📝 Upsert 746 scritture contabili...
[dev:server] [2025-06-30T13:22:18.651Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ 746 scritture processate con upsert
[dev:server] [2025-06-30T13:22:18.652Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 💰 Upsert 1940 righe contabili...
[dev:server] [2025-06-30T13:24:27.078Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ 1940 righe contabili processate con upsert
[dev:server] [2025-06-30T13:24:27.078Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 🧾 Upsert 216 righe IVA...
[dev:server] [2025-06-30T13:24:40.084Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ 216 righe IVA processate con upsert
[dev:server] [2025-06-30T13:24:40.084Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] 🎯 Upsert 411 allocazioni...
[dev:server] [2025-06-30T13:25:10.117Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ 411 allocazioni processate con upsert
[dev:server] [2025-06-30T13:25:10.118Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] ✅ PERSISTENZA COMPLETA: Tutte le entità salvate con successo!
[dev:server] 
[dev:server] 🎉 RIEPILOGO FINALE
[dev:server] ================================================================================
[dev:server] ✅ Import completato con successo in 235138ms
[dev:server] 📊 Performance: 14 record/secondo
[dev:server]
[dev:server] 📈 STATISTICHE FINALI:
[dev:server]    🎯 Scritture contabili create:   746
[dev:server]    🏢 Fornitori creati:              93
[dev:server]    📋 Causali contabili create:      21
[dev:server]    💰 Righe contabili elaborate:   1940
[dev:server]    🏭 Allocazioni elaborate:        411
[dev:server]    ❌ Record con errori (DLQ):        0
[dev:server]
[dev:server] 🚀 ARCHITETTURA ENTERPRISE: Parser 6/6 COMPLETATO!
[dev:server] ================================================================================
[dev:server]
[dev:server] [2025-06-30T13:25:10.157Z] [INFO] [3e70b9b9-f575-4679-83ea-13d19a154caf] Job import_scritture_contabili completed successfully {
[dev:server]   jobType: 'import_scritture_contabili',
[dev:server]   duration: undefined,
[dev:server]   stats: {
[dev:server]     filesProcessed: 4,
[dev:server]     scrittureImportate: 746,
[dev:server]     righeContabiliOrganizzate: 1940,
[dev:server]     righeIvaOrganizzate: 216,
[dev:server]     allocazioniOrganizzate: 411,
[dev:server]     erroriValidazione: 0,
[dev:server]     fornitoriCreati: 93,
[dev:server]     causaliCreate: 21
[dev:server]   },
[dev:server]   successRate: 0
[dev:server] }