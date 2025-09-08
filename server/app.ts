import 'dotenv/config'; // Manteniamo dotenv qui per coerenza
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// --- Importazione delle Rotte ---
import clientiRoutes from './routes/clienti.js';
import fornitoriRoutes from './routes/fornitori.js';
import registrazioniRoutes from './routes/registrazioni.js';
import contiRoutes from './routes/conti.js';
import commesseRoutes from './routes/commesse.js';
import commesseWithPerformanceRoutes from './routes/commesseWithPerformance.js';
import causaliRoutes from './routes/causali.js';
import codiciIvaRoutes from './routes/codiciIva.js';
import condizioniPagamentoRoutes from './routes/condizioniPagamento.js';
import vociAnaliticheRoutes from './routes/vociAnalitiche.js';
import dashboardRoutes from './routes/dashboard.js';
import regoleRipartizioneRoutes from './routes/regoleRipartizione.js';
import reconciliationRoutes from './routes/reconciliation.js';
import smartAllocationRoutes from './routes/smartAllocation.js';
import auditTrailRoutes from './routes/auditTrail.js';
import systemRoutes from './routes/system.js';
import stagingRoutes from './routes/staging.js';
import importTemplatesRoutes from './routes/importTemplates.js';
import databaseRoutes from './routes/database.js';
import importRouter from './routes/import.js';
import stagingAnalysisRouter from './staging-analysis/routes.js';

/**
 * Crea e configura l'istanza dell'applicazione Express.
 * Questo permette di importare l'app per i test senza avviarla.
 */
export function createApp() {
    const app = express();

    // --- Middleware ---
    app.use(cors());
    app.use(express.json());
    app.use(express.static('public'));

    // --- Registrazione delle Rotte API ---
    app.use('/api/clienti', clientiRoutes);
    app.use('/api/fornitori', fornitoriRoutes);
    app.use('/api/registrazioni', registrazioniRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/database', databaseRoutes);
    app.use('/api/causali', causaliRoutes);
    app.use('/api/voci-analitiche', vociAnaliticheRoutes);
    app.use('/api/regole-ripartizione', regoleRipartizioneRoutes);
    app.use('/api/conti', contiRoutes);
    app.use('/api/commesse', commesseRoutes);
    app.use('/api/commesse-performance', commesseWithPerformanceRoutes);
    app.use('/api/import-templates', importTemplatesRoutes);
    app.use('/api/codici-iva', codiciIvaRoutes);
    app.use('/api/condizioni-pagamento', condizioniPagamentoRoutes);
    app.use('/api/system', systemRoutes);
    app.use('/api/staging', stagingRoutes);
    app.use('/api/reconciliation', reconciliationRoutes);
    app.use('/api/smart-allocation', smartAllocationRoutes);
    app.use('/api/allocation/audit', auditTrailRoutes);
    app.use('/api/import', importRouter);
    app.use('/api/staging-analysis', stagingAnalysisRouter);

    app.get('/api', (req: Request, res: Response) => {
        res.json({ message: 'Commessa Control Hub API - Server is running' });
    });

    // --- Gestione Errori Globale ---
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Qualcosa è andato storto!');
    });
    
    return app;
}