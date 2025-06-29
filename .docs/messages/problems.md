> commessa-control-hub@0.0.0 dev
> concurrently "npm:dev:server" "npm:dev:client"

[dev:server] 
[dev:server] > commessa-control-hub@0.0.0 dev:server
[dev:server] > tsx watch -r dotenv/config server/index.ts
[dev:server] 
[dev:client] 
[dev:client] > commessa-control-hub@0.0.0 dev:client
[dev:client] > vite
[dev:client] 
[dev:client] 
[dev:client]   VITE v5.4.19  ready in 453 ms
[dev:client] 
[dev:client]   ➜  Local:   http://localhost:8080/
[dev:client]   ➜  Network: http://192.168.1.224:8080/
[dev:client]   ➜  Network: http://172.18.96.1:8080/
[dev:client]   ➜  Network: http://172.31.48.1:8080/
[dev:server] 
[dev:server] node:internal/modules/run_main:123
[dev:server]     triggerUncaughtException(
[dev:server]     ^
[dev:server] Error [TransformError]: Transform failed with 1 error:
[dev:server] G:\HSC\Reale\commessa-control-hub\server\import-engine\acquisition\definitions\scrittureContabiliDefinitions.ts:99:6: ERROR: Expected "]" but found ":"
[dev:server]     at failureErrorWithLog (G:\HSC\Reale\commessa-control-hub\node_modules\esbuild\lib\main.js:1463:15)     
[dev:server]     at G:\HSC\Reale\commessa-control-hub\node_modules\esbuild\lib\main.js:734:50
[dev:server]     at responseCallbacks.<computed> (G:\HSC\Reale\commessa-control-hub\node_modules\esbuild\lib\main.js:601:9)
[dev:server]     at handleIncomingPacket (G:\HSC\Reale\commessa-control-hub\node_modules\esbuild\lib\main.js:656:12)     
[dev:server]     at Socket.readFromStdout (G:\HSC\Reale\commessa-control-hub\node_modules\esbuild\lib\main.js:579:7)     
[dev:server]     at Socket.emit (node:events:518:28)
[dev:server]     at addChunk (node:internal/streams/readable:561:12)
[dev:server]     at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
[dev:server]     at Readable.push (node:internal/streams/readable:392:5)
[dev:server]     at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
[dev:server]
[dev:server] Node.js v22.16.0

PROBLEMI DEL FILE @server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts:
[{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'type' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 99,
	"startColumn": 3,
	"endLineNumber": 99,
	"endColumn": 7,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ','.",
	"source": "ts",
	"startLineNumber": 99,
	"startColumn": 7,
	"endLineNumber": 99,
	"endColumn": 8,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ','.",
	"source": "ts",
	"startLineNumber": 99,
	"startColumn": 18,
	"endLineNumber": 99,
	"endColumn": 19,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 99,
	"startColumn": 19,
	"endLineNumber": 99,
	"endColumn": 20,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 16,
	"endLineNumber": 100,
	"endColumn": 39,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'length' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 41,
	"endLineNumber": 100,
	"endColumn": 47,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 47,
	"endLineNumber": 100,
	"endColumn": 48,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 49,
	"endLineNumber": 100,
	"endColumn": 51,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'start' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 53,
	"endLineNumber": 100,
	"endColumn": 58,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 58,
	"endLineNumber": 100,
	"endColumn": 59,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 60,
	"endLineNumber": 100,
	"endColumn": 62,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'end' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 64,
	"endLineNumber": 100,
	"endColumn": 67,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 67,
	"endLineNumber": 100,
	"endColumn": 68,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 69,
	"endLineNumber": 100,
	"endColumn": 71,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'type' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 73,
	"endLineNumber": 100,
	"endColumn": 77,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 77,
	"endLineNumber": 100,
	"endColumn": 78,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 100,
	"startColumn": 89,
	"endLineNumber": 100,
	"endColumn": 90,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 18,
	"endLineNumber": 101,
	"endColumn": 32,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'length' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 34,
	"endLineNumber": 101,
	"endColumn": 40,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 40,
	"endLineNumber": 101,
	"endColumn": 41,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 42,
	"endLineNumber": 101,
	"endColumn": 44,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'start' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 46,
	"endLineNumber": 101,
	"endColumn": 51,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 51,
	"endLineNumber": 101,
	"endColumn": 52,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 53,
	"endLineNumber": 101,
	"endColumn": 55,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'end' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 57,
	"endLineNumber": 101,
	"endColumn": 60,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 60,
	"endLineNumber": 101,
	"endColumn": 61,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 62,
	"endLineNumber": 101,
	"endColumn": 65,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'type' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 67,
	"endLineNumber": 101,
	"endColumn": 71,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 71,
	"endLineNumber": 101,
	"endColumn": 72,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 101,
	"startColumn": 83,
	"endLineNumber": 101,
	"endColumn": 84,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 16,
	"endLineNumber": 102,
	"endColumn": 22,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'length' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 24,
	"endLineNumber": 102,
	"endColumn": 30,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 30,
	"endLineNumber": 102,
	"endColumn": 31,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 32,
	"endLineNumber": 102,
	"endColumn": 34,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'start' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 36,
	"endLineNumber": 102,
	"endColumn": 41,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 41,
	"endLineNumber": 102,
	"endColumn": 42,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 43,
	"endLineNumber": 102,
	"endColumn": 46,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'end' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 48,
	"endLineNumber": 102,
	"endColumn": 51,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 51,
	"endLineNumber": 102,
	"endColumn": 52,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 102,
	"startColumn": 58,
	"endLineNumber": 102,
	"endColumn": 59,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 16,
	"endLineNumber": 103,
	"endColumn": 36,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'length' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 38,
	"endLineNumber": 103,
	"endColumn": 44,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 44,
	"endLineNumber": 103,
	"endColumn": 45,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 46,
	"endLineNumber": 103,
	"endColumn": 48,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'start' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 50,
	"endLineNumber": 103,
	"endColumn": 55,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 55,
	"endLineNumber": 103,
	"endColumn": 56,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2695",
	"severity": 8,
	"message": "Il lato sinistro dell'operatore virgola non è usato e non ha effetti collaterali.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 57,
	"endLineNumber": 103,
	"endColumn": 60,
	"tags": [
		1
	],
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Il nome 'end' non è stato trovato.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 62,
	"endLineNumber": 103,
	"endColumn": 65,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "È previsto ';'.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 65,
	"endLineNumber": 103,
	"endColumn": 66,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 103,
	"startColumn": 72,
	"endLineNumber": 103,
	"endColumn": 73,
	"modelVersionId": 1
},{
	"resource": "/g:/HSC/Reale/commessa-control-hub/server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "È prevista la dichiarazione o l'istruzione.",
	"source": "ts",
	"startLineNumber": 104,
	"startColumn": 1,
	"endLineNumber": 104,
	"endColumn": 2,
	"modelVersionId": 1
}]