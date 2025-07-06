[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] 📊 Conto 6015009430 → Voce Analitica: Costi per Servizi
[dev:server] Errore ricerca entità collegata per conto 2010000015: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 2010000013: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] 📊 Conto 6015000751 → Voce Analitica: Costi per Servizi
[dev:server] Errore ricerca entità collegata per conto 2010000013: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 2010000472: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] 📊 Conto 6015000130 → Voce Analitica: Costi per Servizi
[dev:server] Errore ricerca entità collegata per conto 2010000472: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 2010000472: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] 📊 Conto 6015000130 → Voce Analitica: Costi per Servizi
[dev:server] Errore ricerca entità collegata per conto 2010000472: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000046: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000052: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000007: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000047: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000011: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000034: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000046: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000051: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000046: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000050: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] 📊 Conto 6016000330 → Voce Analitica: Costi Operativi
[dev:server] 📊 Conto 6016000340 → Voce Analitica: Costi Operativi
[dev:server] 📊 Conto 6016000300 → Voce Analitica: Costi Operativi
[dev:server] Errore ricerca entità collegata per conto 2010000265: PrismaClientInitializationError:
[dev:server] Invalid `prisma.fornitore.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:50
[dev:server]
[dev:server]   204
[dev:server]   205 if (tipo === 'FORNITORE') {
[dev:server]   206   // Cerca fornitore per ID esterno che corrisponde al sottoconto      
[dev:server] → 207   const fornitore = await prisma.fornitore.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:207:27)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] Errore ricerca entità collegata per conto 1410000003: PrismaClientInitializationError:
[dev:server] Invalid `prisma.cliente.findFirst()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:46
[dev:server]
[dev:server]   224   }
[dev:server]   225 } else if (tipo === 'CLIENTE') {
[dev:server]   226   // Cerca cliente per ID esterno che corrisponde al sottoconto        
[dev:server] → 227   const cliente = await prisma.cliente.findFirst(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server]     at _n.handleRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:7227)
[dev:server]     at _n.handleAndLogRequestError (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (G:\HSC\Reale\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116)
[dev:server]     at async ContoClassificationService.cercaEntitaCollegata (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:227:25)
[dev:server]     at async ContoClassificationService.classificaConto (G:\HSC\Reale\commessa-control-hub\server\import-engine\core\services\ContoClassificationService.ts:170:25)    
[dev:server]     at async applicaClassificazioneAutomatica (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:167:33)
[dev:server]     at async transformScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:122:3)   
[dev:server]     at async ImportScrittureContabiliWorkflow.execute (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\workflows\importScrittureContabiliWorkflow.ts:154:31)
[dev:server]     at async ScrittureContabiliHandler.importScrittureContabili (G:\HSC\Reale\commessa-control-hub\server\import-engine\orchestration\handlers\scrittureContabiliHandler.ts:122:22) {
[dev:server]   clientVersion: '5.16.2',
[dev:server]   errorCode: undefined
[dev:server] }
[dev:server] ✅ Classificazione completata: 1940/1940 conti (100%)
[dev:server] 🔗 Entità collegate trovate: 99
[dev:server] 🔧 Creando tutte le entità Prisma...
[dev:server] 
[dev:server] ❌ ERRORE DURANTE L'IMPORT
[dev:server] ================================================================================
[dev:server] 💥 Errore:
[dev:server] Invalid `prisma.conto.findMany()` invocation in
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\transformation\transformers\scrittureContabiliTransformer.ts:408:45
[dev:server]
[dev:server]   405
[dev:server]   406 // --- CONTI ---
[dev:server]   407 const contiIds = Array.from(entitaSet.conti);
[dev:server] → 408 const contiEsistenti = await prisma.conto.findMany(
[dev:server] Too many database connections opened: FATAL: sorry, too many clients already 
[dev:server] ⏱️  Durata parziale: 9830ms
[dev:server] 🔍 Job ID: 5a0a2268-5244-45e1-bbec-6ee84ec96a6c
[dev:server] ================================================================================
[dev:server]
[dev:server] [2025-07-06T21:56:12.074Z] [ERROR] [5a0a2268-5244-45e1-bbec-6ee84ec96a6c] Job import_scritture_contabili failed {
[dev:server]   jobType: 'import_scritture_contabili',
[dev:server]   duration: undefined,
[dev:server]   errorMessage: '\n' +
[dev:server]     'Invalid `prisma.conto.findMany()` invocation in\n' +
[dev:server]     'G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\transformation\\transformers\\scrittureContabiliTransformer.ts:408:45\n' +
[dev:server]     '\n' +
[dev:server]     '  405 \n' +
[dev:server]     '  406 // --- CONTI ---\n' +
[dev:server]     '  407 const contiIds = Array.from(entitaSet.conti);\n' +
[dev:server]     '→ 408 const contiEsistenti = await prisma.conto.findMany(\n' +
[dev:server]     'Too many database connections opened: FATAL: sorry, too many clients already',
[dev:server]   errorStack: 'PrismaClientInitializationError: \n' +
[dev:server]     'Invalid `prisma.conto.findMany()` invocation in\n' +
[dev:server]     'G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\transformation\\transformers\\scrittureContabiliTransformer.ts:408:45\n' +
[dev:server]     '\n' +
[dev:server]     '  405 \n' +
[dev:server]     '  406 // --- CONTI ---\n' +
[dev:server]     '  407 const contiIds = Array.from(entitaSet.conti);\n' +
[dev:server]     '→ 408 const contiEsistenti = await prisma.conto.findMany(\n' +
[dev:server]     'Too many database connections opened: FATAL: sorry, too many clients already\n' +
[dev:server]     '    at _n.handleRequestError (G:\\HSC\\Reale\\commessa-control-hub\\node_modules\\@prisma\\client\\runtime\\library.js:122:7227)\n' +
[dev:server]     '    at _n.handleAndLogRequestError (G:\\HSC\\Reale\\commessa-control-hub\\node_modules\\@prisma\\client\\runtime\\library.js:122:6235)\n' +
[dev:server]     '    at _n.request (G:\\HSC\\Reale\\commessa-control-hub\\node_modules\\@prisma\\client\\runtime\\library.js:122:5919)\n' +
[dev:server]     '    at async l (G:\\HSC\\Reale\\commessa-control-hub\\node_modules\\@prisma\\client\\runtime\\library.js:131:9116)\n' +
[dev:server]     '    at async creaEntitaDipendenti (G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\transformation\\transformers\\scrittureContabiliTransformer.ts:408:26)\n' +
[dev:server]     '    at async creaTutteLeEntita (G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\transformation\\transformers\\scrittureContabiliTransformer.ts:369:28)\n' +
[dev:server]     '    at async transformScrittureContabili (G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\transformation\\transformers\\scrittureContabiliTransformer.ts:131:24)\n' +
[dev:server]     '    at async ImportScrittureContabiliWorkflow.execute (G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\orchestration\\workflows\\importScrittureContabiliWorkflow.ts:154:31)\n' +
[dev:server]     '    at async ScrittureContabiliHandler.importScrittureContabili (G:\\HSC\\Reale\\commessa-control-hub\\server\\import-engine\\orchestration\\handlers\\scrittureContabiliHandler.ts:122:22)'
[dev:server] }