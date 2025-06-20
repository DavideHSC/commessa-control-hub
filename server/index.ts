import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Importa le rotte
import clientiRoutes from './routes/clienti';
import fornitoriRoutes from './routes/fornitori';
import registrazioniRoutes from './routes/registrazioni';
import dashboardRoutes from './routes/dashboard';
import databaseRoutes from './routes/database';
import importRoutes from './routes/import';
import causaliRoutes from './routes/causali';
import vociAnaliticheRoutes from './routes/vociAnalitiche';
import contiRoutes from './routes/conti';
import commesseRoutes from './routes/commesse';

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
app.use('/api/import', importRoutes);
app.use('/api/causali', causaliRoutes);
app.use('/api/voci-analitiche', vociAnaliticheRoutes);
app.use('/api/conti', contiRoutes);
app.use('/api/commesse', commesseRoutes);


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