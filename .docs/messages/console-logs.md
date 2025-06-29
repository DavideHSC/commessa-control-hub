$ curl http://localhost:3001/test-import-scritture
{"message":"Test completed","result":{"success":true,"jobId":"33ecfbe9-9a0c-4adb-9f79-2894fcc6001b","stats":{"filesProcessed":4,"scrittureImportate":746,"righeContabiliOrganizzate":1940,"righeIvaOrganizzate":216,"allocazioniOrganizzate":411,"erroriValidazione":0,"fornitoriCreati":93,"causaliCreate":21},"message":"Import completato con successo. 746 scritture importate."}}

SERVER:
[dev:server] Server in esecuzione sulla porta 3001
[dev:server] 
[dev:server] --- Starting ImportScrittureContabiliWorkflow Test ---
[dev:server] 
[dev:server] ================================================================================
[dev:server] 🚀 PARSER 6: SCRITTURE CONTABILI - Avvio Import Multi-File
[dev:server] ================================================================================
[dev:server] [2025-06-29T23:01:05.435Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Job import_scritture_contabili started { jobType: 'import_scritture_contabili', metadata: undefined }
[dev:server]
[dev:server] 📋 FASE 1: ACQUISIZIONE DATI
[dev:server] ──────────────────────────────────────────────────
[dev:server] 🔍 DEBUG: File ricevuti:
[dev:server]   - pnTesta: 709446 bytes
[dev:server]   - pnRigCon: 609160 bytes
[dev:server]   - pnRigIva: 37800 bytes
[dev:server]   - movAnac: 14796 bytes
[dev:server] [2025-06-29T23:01:05.437Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Iniziando parsing multi-file...    
[dev:server] [2025-06-29T23:01:05.437Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Utilizzando definizioni di campo statiche dal codice.
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
[dev:server] [2025-06-29T23:01:05.463Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Iniziando validazione dati...      
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
[dev:server] [2025-06-29T23:01:05.804Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Iniziando trasformazione business logic...
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
[dev:server] [2025-06-29T23:01:05.819Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Iniziando persistenza con staging-commit...
[dev:server] [2025-06-29T23:01:05.819Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 💾 PERSISTENZA COMPLETA: Salvataggio di tutte le entità
[dev:server] [2025-06-29T23:01:05.822Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🧹 Pulizia tabelle in ordine FK... 
[dev:server] [2025-06-29T23:01:05.843Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] ✅ Tutte le tabelle pulite
[dev:server] [2025-06-29T23:01:05.853Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] ✅ Cliente di sistema (cliente_sistema) assicurato.
[dev:server] [2025-06-29T23:01:05.853Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🏢 Creazione 93 fornitori...       
[dev:server] [2025-06-29T23:01:06.193Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 📋 Creazione 21 causali...
[dev:server] [2025-06-29T23:01:06.279Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🏦 Creazione 253 conti...
[dev:server] [2025-06-29T23:01:07.550Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 📊 Creazione 25 codici IVA...
[dev:server] [2025-06-29T23:01:07.713Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🏭 Creazione 7 commesse...
[dev:server] [2025-06-29T23:01:07.757Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 📈 Creazione 1 voci analitiche...
[dev:server] [2025-06-29T23:01:07.763Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 📝 Creazione 746 scritture contabili...
[dev:server] [2025-06-29T23:01:10.376Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 💰 Creazione 1940 righe contabili...
[dev:server] [2025-06-29T23:01:17.718Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🧾 Creazione 216 righe IVA...
[dev:server] [2025-06-29T23:01:18.502Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] 🎯 Creazione 411 allocazioni...
[dev:server] [2025-06-29T23:01:20.540Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] ✅ PERSISTENZA COMPLETA: Tutte le entità salvate con successo!
[dev:server]
[dev:server] 🎉 RIEPILOGO FINALE
[dev:server] ================================================================================
[dev:server] ✅ Import completato con successo in 15109ms
[dev:server] 📊 Performance: 219 record/secondo
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
[dev:server] [2025-06-29T23:01:20.544Z] [INFO] [33ecfbe9-9a0c-4adb-9f79-2894fcc6001b] Job import_scritture_contabili completed successfully {
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
[dev:server] ImportScrittureContabiliWorkflow Test Result: {
[dev:server]   "success": true,
[dev:server]   "jobId": "33ecfbe9-9a0c-4adb-9f79-2894fcc6001b",
[dev:server]   "stats": {
[dev:server]     "filesProcessed": 4,
[dev:server]     "scrittureImportate": 746,
[dev:server]     "righeContabiliOrganizzate": 1940,
[dev:server]     "righeIvaOrganizzate": 216,
[dev:server]     "allocazioniOrganizzate": 411,
[dev:server]     "erroriValidazione": 0,
[dev:server]     "fornitoriCreati": 93,
[dev:server]     "causaliCreate": 21
[dev:server]   },
[dev:server]   "message": "Import completato con successo. 746 scritture importate."
[dev:server] }
[dev:server] --- Finished ImportScrittureContabiliWorkflow Test ---
[dev:server]
