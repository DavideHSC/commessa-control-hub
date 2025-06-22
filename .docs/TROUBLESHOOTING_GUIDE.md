# Guida alla Risoluzione dei Problemi di Compilazione e Refactoring

Questo documento descrive un approccio sistematico per affrontare e risolvere errori di compilazione complessi e interdipendenti, basato sull'esperienza di refactoring del progetto `commessa-control-hub`. L'obiettivo è stabilizzare la codebase, semplificarla e prevenire l'introduzione di errori a cascata.

---

## Fase 1: Analisi e Pianificazione

L'errore più grande è agire d'impulso. Prima di scrivere una singola riga di codice, è fondamentale avere un quadro completo della situazione.

1.  **Stop & Analyse (Fermati e Analizza):** Resisti alla tentazione di correggere gli errori man mano che compaiono. Un approccio "tappa-buchi" spesso introduce più problemi di quanti ne risolva.

2.  **Censimento Completo degli Errori:**
    *   Esegui il linter o il processo di build (`npm run lint`, `npm run build`) per ottenere una lista completa e non filtrata di **tutti** gli errori e warning presenti.
    *   Copia questa lista in un file di testo. Sarà la tua checklist.

3.  **Identifica le Cause Radice:**
    *   Leggi la lista degli errori e cerca dei pattern. Gli errori sono concentrati in un'area specifica? Si ripetono in più file?
    *   Presta particolare attenzione agli errori in file "centrali" o "condivisi", come:
        *   **Hooks personalizzati** (`src/hooks/`)
        *   **Definizioni di Tipi** (`src/types/`, `src/schemas/`)
        *   **Funzioni API e file indice** (`src/api/`, `src/api/index.ts`)
    *   Un errore in uno di questi file è quasi sempre la causa di decine di errori a cascata in altri componenti.

4.  **Formula un Piano d'Azione:**
    *   Raggruppa gli errori per causa radice.
    *   Definisci un ordine di intervento, partendo dai problemi più profondi e risalendo verso la superficie. Un buon ordine è:
        1.  **Pulizia (Quick Wins):** Rimuovi tutte le importazioni e le variabili dichiarate ma non utilizzate. È un'operazione a basso rischio che riduce il "rumore" e migliora la leggibilità del codice.
        2.  **Correzione dei Tipi e Schemi:** Risolvi eventuali problemi nei file di tipi (`types/`) e schemi (`schemas/`). Tipi scorretti o incompleti sono una fonte comune di errori.
        3.  **Correzione degli Hooks e API:** Affronta i bug negli hooks personalizzati e nelle funzioni di chiamata API. La stabilità di questi file è cruciale per il funzionamento dell'intera applicazione.
        4.  **Correzione dei Componenti:** Una volta che le fondamenta (tipi, hooks, API) sono solide, passa a correggere i bug specifici all'interno dei singoli componenti. Molti degli errori qui saranno già scomparsi dopo aver sistemato i punti precedenti.

---

## Fase 2: Esecuzione Controllata

Procedi con calma e metodo, seguendo il piano.

1.  **Una Fase alla Volta:** Completa una fase del piano prima di passare alla successiva. Ad esempio, non iniziare a correggere i componenti finché non hai finito la pulizia generale.

2.  **Verifica e Convalida:** Dopo ogni modifica significativa (es. la correzione di un hook), **ri-esegui il linter/build** per confermare che gli errori correlati siano spariti e che non ne siano stati introdotti di nuovi.

3.  **Leggi i Messaggi di Errore con Attenzione:** I messaggi di errore sono i tuoi migliori amici. Non interpretarli superficialmente.
    *   *Esempio concreto:* L'errore `Property 'data' does not exist on type 'X'` è un indizio chiarissimo che si sta cercando di accedere a una proprietà su un oggetto che non la possiede. La soluzione non è forzare il tipo con `as any`, ma capire perché l'oggetto ha una forma diversa da quella attesa (es. una risposta API paginata che restituisce `{ data: [...] }` invece di `[...]`).

4.  **Isola il Problema:** Se non riesci a capire un errore, isolalo. Crea una versione semplificata del codice in un file a parte o commenta parti del componente finché l'errore non scompare. Questo ti aiuterà a individuare la riga o il blocco di codice esatto che causa il problema.

---

## Fase 3: Lezioni Apprese (Checklist Pratica)

Dall'esperienza su questo progetto, ecco una checklist di controlli da effettuare:

-   **[ ] Le funzioni API restituiscono un array o un oggetto?**
    *   Le funzioni che usano `fetchPaginatedData` restituiscono un oggetto `{ data: T[], totalCount: number, ... }`. Ricorda di accedere a `.data`.

-   **[ ] I tipi e gli schemi (Zod) sono completi?**
    *   Quando aggiungi un campo a un form o a una tabella, assicurati di aggiornare anche lo schema Zod corrispondente (`baseSchema` in `schemas/database.ts`). Errori di validazione o di tipo spesso nascono da lì.

-   **[ ] Tutte le funzioni sono esportate correttamente dal file indice?**
    *   Se crei una nuova funzione in un modulo (es. `addRegistrazione` in `api/registrazioni.ts`), assicurati di aggiungerla anche all'esportazione nel file `api/index.ts`.

-   **[ ] Le dipendenze in `useEffect` sono corrette?**
    *   Un `useEffect` senza un array di dipendenze corretto può causare loop infiniti di ricaricamento, specialmente se esegue chiamate API.

-   **[ ] Stai usando variabili/import non necessari?**
    *   Esegui una pulizia finale per rimuovere tutto ciò che non serve. Mantiene il codice pulito e previene futuri errori.

-   **[ ] Il comando di build usa il `tsconfig.json` corretto?**
    *   Se compaiono errori di compilazione sul server relativi a `esModuleInterop` o altre opzioni del compilatore, verifica che lo script di build (es. in `package.json`) stia usando il file di configurazione corretto per quella parte del progetto (es. `tsc -p server/tsconfig.json` invece di un generico `tsc server/index.ts`). 