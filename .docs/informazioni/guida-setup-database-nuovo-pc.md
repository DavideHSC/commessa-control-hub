# 🗄️ Guida: Setup Database su Nuovo PC

**Progetto**: Commessa Control Hub v1  
**Database**: PostgreSQL + Prisma ORM  
**Data**: 2025-09-11

---

## 📋 Panoramica

Quando ti sposti a lavorare su questo progetto su un altro PC, hai due elementi da gestire:

1. **📂 Codebase** → Git repository (già sai come fare)
2. **🗄️ Database** → PostgreSQL con struttura e dati

Il progetto usa **Prisma ORM** che semplifica enormemente la gestione del database tra diversi ambienti.

---

## 🎯 Scenario: Nuovo PC

### **Quello che hai già:**

- ✅ Codice dal repository Git
- ✅ Struttura database (migrations in `prisma/migrations/`)
- ✅ Schema database (`prisma/schema.prisma`)

### **Quello che devi configurare:**

- 🔧 PostgreSQL sul nuovo PC
- 🔧 File `.env` con connection string
- 🔧 Applicare migrations per creare la struttura
- 🔧 Decidere se portare i dati esistenti o ripartire

---

## 🛠️ Setup Completo Step-by-Step

### **STEP 1: Installa PostgreSQL**

#### **Opzione A: Installazione Locale**

```bash
# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crea utente e database
sudo -u postgres psql
postgres=# CREATE USER dev_user WITH PASSWORD 'Remotepass1';
postgres=# CREATE DATABASE dev_main_db OWNER dev_user;
postgres=# GRANT ALL PRIVILEGES ON DATABASE dev_main_db TO dev_user;
postgres=# \q
```

#### **Opzione B: Docker (Raccomandato)**

```bash
# Scarica e avvia PostgreSQL in container
docker run --name postgres-dev \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=Remotepass1 \
  -e POSTGRES_DB=dev_main_db \
  -p 5433:5432 \
  -d postgres:15

# Verifica che sia attivo
docker ps
```

### **STEP 2: Configura File .env**

Il file `.env` contiene la connection string per il database. **Non sovrascriverlo** se esiste già, ma verifica che punti al tuo ambiente locale.

```bash
# Nel file .env del progetto
DATABASE_URL="postgresql://dev_user:Remotepass1@localhost:5433/dev_main_db?schema=public"
```

**Note sulla connection string:**

- `dev_user` = username database
- `Remotepass1` = password
- `localhost` = host (il tuo PC)
- `5433` = porta (default PostgreSQL è 5432, ma nel progetto usa 5433)
- `dev_main_db` = nome database

### **STEP 3: Installa Dipendenze e Genera Client**

```bash
# Nella cartella del progetto
npm install

# Genera il client Prisma (importante!)
npx prisma generate
```

### **STEP 4: Applica la Struttura Database**

Prisma gestisce automaticamente la struttura del database attraverso le **migrations**.

```bash
# Applica tutte le migrations (crea le tabelle)
npx prisma migrate deploy

# Verifica che sia tutto ok
npx prisma db push
```

Questo comando:

- ✅ Legge tutte le migration dalla cartella `prisma/migrations/`
- ✅ Applica in ordine cronologico tutte le modifiche
- ✅ Crea tutte le tabelle, colonne, indici, relazioni
- ✅ Porta il database alla versione più recente

### **STEP 5: Popola con Dati Iniziali**

Il progetto ha un seed script che inserisce i dati base necessari:

```bash
# Esegue il seed (dati iniziali)
npm run db:seed
```

Il seed inserisce:

- 👥 Cliente e fornitore di sistema
- 🏢 Commesse di default (Sorrento, Vico Equense, etc.)
- 📊 Dati base per il funzionamento dell'applicazione

---

## 🔄 Gestione Dati Esistenti

Hai **due opzioni** per i dati:

### **Opzione A: Solo Dati Essenziali (RACCOMANDATO)**

- ✅ **Veloce**: Setup in 5 minuti
- ✅ **Pulito**: Database fresco senza dati sporchi
- ✅ **Funzionale**: Tutto quello che serve per sviluppare

**Procedura:**

```bash
# Dopo aver applicato le migrations
npm run db:seed
```

**Cosa ottieni:**

- Commesse base configurate
- Clienti/fornitori di sistema
- Struttura completa funzionante
- Ambiente pronto per test e sviluppo

### **Opzione B: Backup Completo dei Dati**

Se vuoi portare **TUTTI** i dati dal PC precedente:

#### **1. Crea Backup dal PC Originale**

```bash
# Sul PC dove hai già i dati
pg_dump -h localhost -p 5433 -U dev_user -d dev_main_db > backup_database.sql
```

#### **2. Ripristina sul Nuovo PC**

```bash
# Sul nuovo PC, dopo aver fatto STEP 1-4
# Prima resetta il database
npx prisma migrate reset --force

# Poi ripristina i dati
psql -h localhost -p 5433 -U dev_user -d dev_main_db < backup_database.sql
```

**Vantaggi Opzione B:**

- 📊 Tutti i movimenti contabili esistenti
- 👥 Tutte le anagrafiche inserite
- 🏢 Commesse con dati reali
- 📈 Storico completo delle allocazioni

**Svantaggi Opzione B:**

- ⏱️ Più tempo per setup
- 💾 File backup può essere grande
- 🔧 Più passaggi da eseguire

---

## ✅ Verifica Setup

Dopo aver completato il setup, verifica che tutto funzioni:

### **1. Testa Connessione Database**

```bash
npx prisma studio
```

Si aprirà un'interfaccia web per esplorare il database.

### **2. Avvia l'Applicazione**

```bash
# Avvia server di sviluppo
npm run dev
```

### **3. Controlla Dati Base**

Dovresti vedere:

- 🏢 Commesse create (Sorrento, Vico Equense, etc.)
- 👥 Cliente/fornitore di sistema
- 📊 Tabelle create correttamente

---

## 🔧 Troubleshooting Comune

### **Errore: "Can't reach database server"**

```bash
# Verifica che PostgreSQL sia avviato
# Se Docker:
docker ps
docker start postgres-dev

# Se installazione locale:
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### **Errore: "Authentication failed"**

- ✅ Controlla username/password nel file `.env`
- ✅ Verifica che l'utente esista nel database

### **Errore: "Database does not exist"**

```bash
# Crea il database manualmente
sudo -u postgres createdb -O dev_user dev_main_db
```

### **Errore: "Migration failed"**

```bash
# Resetta completamente e riprova
npx prisma migrate reset --force
npx prisma migrate deploy
```

---

## 📋 Checklist Finale

Quando hai finito il setup, dovresti avere:

- ✅ PostgreSQL installato e avviato
- ✅ Database `dev_main_db` creato
- ✅ File `.env` configurato con connection string corretta
- ✅ Dipendenze npm installate
- ✅ Client Prisma generato (`npx prisma generate`)
- ✅ Migrations applicate (`npx prisma migrate deploy`)
- ✅ Dati iniziali inseriti (`npm run db:seed`)
- ✅ Applicazione avviata e funzionante (`npm run dev`)

---

## 💡 Consigli Pro

### **Per Sviluppo:**

- 🔧 Usa **Opzione A** (solo dati essenziali)
- 🐳 Preferisci **Docker** per PostgreSQL (isolamento e pulizia)
- 📊 Usa `npx prisma studio` per esplorare i dati

### **Per Testing su Dati Reali:**

- 📦 Usa **Opzione B** (backup completo)
- 💾 Tieni backup aggiornati periodicamente
- 🔄 Usa script di reset rapido per test ripetuti

### **Performance:**

- ⚡ PostgreSQL in Docker è rapido per sviluppo
- 📈 Per dataset grandi (>10K records) considera PostgreSQL nativo
- 🗄️ Database separato per staging/test vs sviluppo

---

## 🎯 Riassunto Veloce

**Per setup rapido (5 minuti):**

```bash
# 1. Avvia PostgreSQL
docker run --name postgres-dev -e POSTGRES_USER=dev_user -e POSTGRES_PASSWORD=Remotepass1 -e POSTGRES_DB=dev_main_db -p 5433:5432 -d postgres:15

# 2. Configura progetto
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# 3. Verifica
npm run dev
```

**Il database sarà pronto e funzionante con tutti i dati necessari per lo sviluppo!**

---

_Guida creata per Commessa Control Hub v1 - Setup database multi-PC_
