import express from 'express';
import multer from 'multer';
import { handlePianoDeiContiImportV2 } from '../import-engine/orchestration/handlers/pianoDeiContiHandler';
import { importPianoDeiContiAziendaleWorkflow } from '../import-engine/orchestration/workflows/importPianoDeiContiAziendaleWorkflow';
import { importPianoDeiContiWorkflow } from '../import-engine/orchestration/workflows/importPianoDeiContiWorkflow';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Endpoint "intelligente" per l'importazione del Piano dei Conti.
 * Determina automaticamente il tipo di file (standard o aziendale)
 * ispezionando il contenuto e avvia il workflow corretto.
 */
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }

    const fileContent = req.file.buffer.toString('latin1');
    const firstLine = fileContent.split('\\n')[0] ?? '';

    // Heuristica per determinare il tipo di file:
    // Il file CONTIAZI ha il codice fiscale dell'azienda nelle prime righe.
    // Il file CONTIGEN in quella posizione ha spazi vuoti.
    const potentialFiscalCode = firstLine.substring(3, 19).trim();
    const isAziendale = potentialFiscalCode.length > 0;

    console.log(`[Import Conti] Rilevato file ${isAziendale ? 'Aziendale' : 'Standard'} (ID: '${potentialFiscalCode}')`);

    try {
        let result;
        if (isAziendale) {
            result = await importPianoDeiContiAziendaleWorkflow(fileContent);
        } else {
            result = await importPianoDeiContiWorkflow(fileContent);
        }
        
        return res.status(200).json({
            message: `Importazione piano dei conti ${isAziendale ? 'aziendale' : 'standard'} completata!`,
            ...result,
        });

    } catch (error) {
        console.error(`[Import Conti] Errore fatale durante il workflow:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
        return res.status(500).json({
            message: 'Errore interno del server durante l\'importazione.',
            error: errorMessage,
        });
    }
});

export default router; 