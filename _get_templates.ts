import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.importTemplate.findMany({
    select: {
      id: true,
      name: true,
      modelName: true,
    },
  });
  console.log('Template di importazione presenti nel database:');
  console.table(templates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 