[dev:client] 18:39:42 [vite] hmr update /src/pages/Impostazioni.tsx, /src/index.css
[dev:server] C:\001-Progetti Davide\commessa-control-hub\server\routes\database.ts:110
[dev:server]   const backupDir = path.join(__dirname, '..', '..', 'backups');
[dev:server]                               ^
[dev:server] 
[dev:server] 
[dev:server] ReferenceError: __dirname is not defined
[dev:server]     at <anonymous> (C:\001-Progetti Davide\commessa-control-hub\server\routes\database.ts:110:31)
[dev:server]     at Layer.handle [as handle_request] (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\layer.js:95:5)
[dev:server]     at next (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\route.js:149:13)
[dev:server]     at Route.dispatch (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\route.js:119:3)
[dev:server]     at Layer.handle [as handle_request] (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\layer.js:95:5)
[dev:server]     at C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\index.js:284:15
[dev:server]     at Function.process_params (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\index.js:346:12)
[dev:server]     at next (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\index.js:280:10)
[dev:server]     at Function.handle (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\index.js:175:3)
[dev:server]     at router (C:\001-Progetti Davide\commessa-control-hub\node_modules\express\lib\router\index.js:47:12)
[dev:server] 
[dev:server] Node.js v22.16.0
[dev:client] 18:42:05 [vite] http proxy error: /api/database/backup
[dev:client] Error: read ECONNRESET
[dev:client]     at TCP.onStreamRead (node:internal/stream_base_commons:216:20)
