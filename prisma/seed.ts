// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { runSeed } from '../server/lib/seedingLogic.js';

const prisma = new PrismaClient();

async function main() {
  await runSeed(prisma);
}

main()
  .catch((e) => {
    console.error('ERRORE DURANTE IL SEEDING:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 