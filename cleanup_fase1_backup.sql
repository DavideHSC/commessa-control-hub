-- ============================================
-- FASE 1: BACKUP E ANALISI (SICURO DA ESEGUIRE)
-- ============================================

-- Crea tabelle di backup
CREATE TABLE IF NOT EXISTS backup_scritture AS 
SELECT * FROM "ScritturaContabile";

CREATE TABLE IF NOT EXISTS backup_righe AS 
SELECT * FROM "RigaScrittura";

CREATE TABLE IF NOT EXISTS backup_allocazioni AS 
SELECT * FROM "Allocazione";

-- Conta i backup creati
SELECT 
    'BACKUP CREATI' as fase,
    (SELECT COUNT(*) FROM backup_scritture) as scritture_backup,
    (SELECT COUNT(*) FROM backup_righe) as righe_backup,
    (SELECT COUNT(*) FROM backup_allocazioni) as allocazioni_backup;

-- Identifica duplicati (SOLO VISUALIZZAZIONE)
SELECT 
    'DUPLICATI SCRITTURE' as tipo,
    "externalId", 
    COUNT(*) as count_duplicates,
    STRING_AGG("id", ', ') as ids_duplicati
FROM "ScritturaContabile" 
WHERE "externalId" IS NOT NULL
GROUP BY "externalId"
HAVING COUNT(*) > 1
ORDER BY count_duplicates DESC
LIMIT 10;

-- Righe orfane (SOLO VISUALIZZAZIONE)
SELECT 
    'RIGHE ORFANE' as tipo,
    COUNT(*) as count_orfane
FROM "RigaScrittura" 
WHERE "scritturaContabileId" NOT IN (
    SELECT "id" FROM "ScritturaContabile"
);