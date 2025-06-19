# Commessa Control Hub

**Commessa Control Hub** è un'applicazione web progettata per la contabilità e il controllo di gestione per commessa. L'applicazione consente di monitorare i costi e i ricavi, confrontare i dati a consuntivo con il budget e analizzare la redditività di ogni progetto.

Questo progetto è stato sviluppato con:
- **Vite**
- **TypeScript**
- **React**
- **shadcn/ui** per i componenti UI
- **Tailwind CSS** per lo styling
- **Prisma** come ORM per l'interazione con il database
- **PostgreSQL** come database

---

## 🚀 Guida all'Installazione e Avvio

Per eseguire il progetto in locale, è necessario avere installato **Node.js** e **npm**.

### 1. Clonare il Repository

Clona il repository sul tuo sistema locale:
```sh
git clone <URL_DEL_TUO_REPOSITORY_GIT>
cd commessa-control-hub
```

### 2. Installare le Dipendenze

Installa tutte le dipendenze del progetto:
```sh
npm install
```

### 3. Configurazione dell'Ambiente

L'applicazione richiede una connessione a un database PostgreSQL.

- Crea una copia del file `.env.example` e rinominala in `.env`. Se `.env.example` non esiste, crea un nuovo file `.env`.
- Modifica il file `.env` con la stringa di connessione al tuo database:

```env
# Esempio di stringa di connessione per PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 4. Migrazione e Seeding del Database

Una volta configurata la connessione, è necessario preparare il database con lo schema corretto e popolarlo con i dati iniziali di esempio.

- **Applica le migrazioni:** Questo comando crea le tabelle nel tuo database basandosi sul file `prisma/schema.prisma`.
  ```sh
  npx prisma migrate dev
  ```
- **Esegui il seeding:** Questo comando popola il database con dati di esempio (commesse, voci analitiche, ecc.) definiti in `prisma/seed.ts`.
  ```sh
  npx prisma db seed
  ```

### 5. Avviare il Server di Sviluppo

Infine, avvia il server di sviluppo di Vite:
```sh
npm run dev
```

L'applicazione sarà ora accessibile all'indirizzo `http://localhost:5173` (o la porta indicata nel terminale).

---

## 📖 Struttura del Progetto

- **`/src`**: Contiene tutto il codice sorgente dell'applicazione.
  - **`/api`**: Logica per le chiamate al database (tramite Prisma).
  - **`/components`**: Componenti React riutilizzabili.
  - **`/data`**: Dati mock usati per il seeding.
  - **`/pages`**: Componenti che rappresentano le diverse pagine dell'applicazione.
  - **`/types`**: Definizioni dei tipi e delle interfacce TypeScript.
- **`/prisma`**: Contiene la configurazione di Prisma.
  - **`schema.prisma`**: Define il modello dei dati del database.
  - **`/migrations`**: Contiene gli script di migrazione del database generati da Prisma.
  - **`seed.ts`**: Script per popolare il database con dati di esempio.
- **`README.md`**: Questo file.

## Project info

**URL**: https://lovable.dev/projects/ef2458ac-7133-483b-b73b-b4eb90211041

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ef2458ac-7133-483b-b73b-b4eb90211041) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ef2458ac-7133-483b-b73b-b4eb90211041) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
