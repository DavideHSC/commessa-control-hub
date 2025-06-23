import 'dotenv/config'; // Carica le variabili d'ambiente
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

// Importa le rotte
import clientiRoutes from './routes/clienti';
import fornitoriRoutes from './routes/fornitori';
import registrazioniRoutes from './routes/registrazioni';
import dashboardRoutes from './routes/dashboard';
import databaseRoutes from './routes/database';
import importScrittureRoutes from './routes/importScritture';
import importAnagraficheRoutes from './routes/importAnagrafiche';
import causaliRoutes from './routes/causali';
import vociAnaliticheRoutes from './routes/vociAnalitiche';
import contiRoutes from './routes/conti';
import commesseRoutes from './routes/commesse';
import importTemplatesRoutes from './routes/importTemplates';
import codiciIvaRoutes from './routes/codiciIva';
import condizioniPagamentoRoutes from './routes/condizioniPagamento';
import systemRoutes from './routes/system';
import statsRoutes from './routes/stats';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Registra le rotte
app.use('/api/clienti', clientiRoutes);
app.use('/api/fornitori', fornitoriRoutes);
app.use('/api/registrazioni', registrazioniRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/import/scritture', importScrittureRoutes);
app.use('/api/import/anagrafica', importAnagraficheRoutes);
app.use('/api/causali', causaliRoutes);
app.use('/api/voci-analitiche', vociAnaliticheRoutes);
app.use('/api/conti', contiRoutes);
app.use('/api/commesse', commesseRoutes);
app.use('/api/import-templates', importTemplatesRoutes);
app.use('/api/codici-iva', codiciIvaRoutes);
app.use('/api/condizioni-pagamento', condizioniPagamentoRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/database/stats', statsRoutes);

// Endpoint di base per testare il server
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Commessa Control Hub API' });
});

// Gestione errori globale (esempio base)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Qualcosa è andato storto!');
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});

// Gestione della chiusura del processo
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const router = Router();
router.use('/dashboard', dashboardRoutes);
router.use('/voci-analitiche', vociAnaliticheRoutes);
router.use('/import-templates', importTemplatesRoutes);
router.use('/import-scritture', importScrittureRoutes);
router.use('/system', systemRoutes);

export default router; 