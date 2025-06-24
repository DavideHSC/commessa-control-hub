# =============================================================================
# SCRIPT PER LA CREAZIONE DI UN BACKUP DEL DATABASE POSTGRESQL
# =============================================================================
#
# Istruzioni:
# 1. VERIFICA E MODIFICA IL PERCORSO DI POSTGRESQL QUI SOTTO.
#    Assicurati che il percorso in $PsqlBinPath corrisponda a dove hai
#    installato PostgreSQL sulla tua macchina.
#
# 2. ESECUZIONE:
#    - Apri un terminale PowerShell in questa cartella.
#    - Esegui il comando: .\create_backup.ps1
#
# =============================================================================

# --- CONFIGURAZIONE (MODIFICA QUESTA PARTE) ---

# ->>> IMPORTANTE: Controlla e modifica questo percorso! <<<---
# Deve puntare alla cartella 'bin' della tua installazione di PostgreSQL.
$PsqlBinPath = "C:\Program Files\PostgreSQL\16\bin"

# Stringa di connessione al database.
$DatabaseUrl = "postgresql://dev_user:Remotepass1@192.168.1.200:5433/dev_main_db?schema=public"

# --- FINE CONFIGURAZIONE ---


# --- LOGICA DELLO SCRIPT (NON MODIFICARE) ---

# Costruisce il percorso completo per pg_dump.exe
$PgDumpExe = Join-Path $PsqlBinPath "pg_dump.exe"

# Prende la directory corrente dello script e definisce la cartella di backup
$CurrentDir = (Get-Location).Path
$BackupDir = Join-Path $CurrentDir "backups"

# Crea la cartella di backup se non esiste
if (-not (Test-Path $BackupDir)) {
    Write-Host "Cartella 'backups' non trovata. La creo in: $BackupDir"
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Controlla se pg_dump.exe esiste nel percorso specificato
if (-not (Test-Path $PgDumpExe)) {
    Write-Host ""
    Write-Host "ERRORE: Impossibile trovare 'pg_dump.exe' al percorso:" -ForegroundColor Red
    Write-Host "$PgDumpExe" -ForegroundColor Red
    Write-Host "Verifica la variabile `$PsqlBinPath` all'interno dello script." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Genera un timestamp per il nome del file (es. 20240624_103000)
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "backup_$Timestamp.sql"

Write-Host "Avvio del backup del database in formato SQL..." -ForegroundColor Cyan
Write-Host "Origine: $DatabaseUrl"
Write-Host "Destinazione: $BackupFile"

try {
    # Esegue il comando pg_dump per un output SQL semplice
    # Rimuoviamo i flag -F c e -b per ottenere un file di testo
    & $PgDumpExe -d $DatabaseUrl -v -f $BackupFile
    
    Write-Host ""
    Write-Host "********************************************************" -ForegroundColor Green
    Write-Host "Backup creato con successo!" -ForegroundColor Green
    Write-Host "Il file è stato salvato in: $BackupFile" -ForegroundColor Green
    Write-Host "********************************************************"
}
catch {
    Write-Host ""
    Write-Host "ERRORE durante l'esecuzione di pg_dump:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} 