// 

import 'dotenv/config';
import { createApp } from './app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = createApp();

const PORT = process.env.PORT || 3001;

// --- Avvio del Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server in esecuzione sulla porta ${PORT}`);
});

// --- Gestione Chiusura Pulita ---
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Server disconnesso dal database e spento.');
  process.exit(0);
});