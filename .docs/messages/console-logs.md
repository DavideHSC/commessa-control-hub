[dev:server] Errore nel recupero delle statistiche del database: PrismaClientKnownRequestError: 
[dev:server] Invalid `prisma.scritturaContabile.count()` invocation in
[dev:server] C:\001-Progetti Davide\commessa-control-hub\server\routes\stats.ts:20:33
[dev:server]
[dev:server]   17   codiciIvaCount,
[dev:server]   18   condizioniPagamentoCount,
[dev:server]   19 ] = await prisma.$transaction([
[dev:server] → 20   prisma.scritturaContabile.count(
[dev:server] Can't reach database server at `192.168.1.200:5433`
[dev:server]
[dev:server] Please make sure your database server is running at `192.168.1.200:5433`.
[dev:server]     at _n.handleRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6927)
[dev:server]     at _n.handleAndLogRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116) {
[dev:server]   code: 'P1001',
[dev:server]   clientVersion: '5.16.2',
[dev:server]   meta: {
[dev:server]     modelName: 'ScritturaContabile',
[dev:server]     database_host: '192.168.1.200',
[dev:server]     database_port: 5433
[dev:server]   }
[dev:server] }
[dev:server] PrismaClientKnownRequestError: 
[dev:server] Invalid `prisma.scritturaContabile.findMany()` invocation in
[dev:server] C:\001-Progetti Davide\commessa-control-hub\server\routes\registrazioni.ts:75:33
[dev:server]
[dev:server]   72 };
[dev:server]   73
[dev:server]   74 const [scritture, totalCount] = await prisma.$transaction([
[dev:server] → 75   prisma.scritturaContabile.findMany(
[dev:server] Can't reach database server at `192.168.1.200:5433`
[dev:server]
[dev:server] Please make sure your database server is running at `192.168.1.200:5433`.
[dev:server]     at _n.handleRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6927)
[dev:server]     at _n.handleAndLogRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116) {
[dev:server]   code: 'P1001',
[dev:server]   clientVersion: '5.16.2',
[dev:server]   meta: {
[dev:server]     modelName: 'ScritturaContabile',
[dev:server]     database_host: '192.168.1.200',
[dev:server]     database_port: 5433
[dev:server]   }
[dev:server] }
[dev:server] Errore nel recupero delle statistiche del database: PrismaClientKnownRequestError: 
[dev:server] Invalid `prisma.scritturaContabile.count()` invocation in
[dev:server] C:\001-Progetti Davide\commessa-control-hub\server\routes\stats.ts:20:33
[dev:server]
[dev:server]   17   codiciIvaCount,
[dev:server]   18   condizioniPagamentoCount,
[dev:server]   19 ] = await prisma.$transaction([
[dev:server] → 20   prisma.scritturaContabile.count(
[dev:server] Can't reach database server at `192.168.1.200:5433`
[dev:server]
[dev:server] Please make sure your database server is running at `192.168.1.200:5433`.
[dev:server]     at _n.handleRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6927)
[dev:server]     at _n.handleAndLogRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116) {
[dev:server]   code: 'P1001',
[dev:server]   clientVersion: '5.16.2',
[dev:server]   meta: {
[dev:server]     modelName: 'ScritturaContabile',
[dev:server]     database_host: '192.168.1.200',
[dev:server]     database_port: 5433
[dev:server]   }
[dev:server] }
[dev:server] PrismaClientKnownRequestError: 
[dev:server] Invalid `prisma.scritturaContabile.findMany()` invocation in
[dev:server] C:\001-Progetti Davide\commessa-control-hub\server\routes\registrazioni.ts:75:33
[dev:server]
[dev:server]   72 };
[dev:server]   73
[dev:server]   74 const [scritture, totalCount] = await prisma.$transaction([
[dev:server] → 75   prisma.scritturaContabile.findMany(
[dev:server] Can't reach database server at `192.168.1.200:5433`
[dev:server]
[dev:server] Please make sure your database server is running at `192.168.1.200:5433`.
[dev:server]     at _n.handleRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6927)
[dev:server]     at _n.handleAndLogRequestError (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:6235)
[dev:server]     at _n.request (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:122:5919)
[dev:server]     at async l (C:\001-Progetti Davide\commessa-control-hub\node_modules\@prisma\client\runtime\library.js:131:9116) {
[dev:server]   code: 'P1001',
[dev:server]   clientVersion: '5.16.2',
[dev:server]   meta: {
[dev:server]     modelName: 'ScritturaContabile',
[dev:server]     database_host: '192.168.1.200',
[dev:server]     database_port: 5433
[dev:server]   }
[dev:server] }