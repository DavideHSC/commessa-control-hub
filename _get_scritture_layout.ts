import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const template = await prisma.importTemplate.findUnique({
    where: {
      name: 'scritture_contabili',
    },
    include: {
      fieldDefinitions: {
        orderBy: [
          {
            fileIdentifier: 'asc',
          },
          {
            start: 'asc',
          },
        ],
      },
    },
  });

  if (!template) {
    console.log("Template 'scritture_contabili' non trovato.");
    return;
  }

  console.log(`Definizioni per il template: '${template.name}' (ID: ${template.id})`);
  console.table(
    template.fieldDefinitions.map((def) => ({
      file: def.fileIdentifier,
      field: def.fieldName,
      start: def.start,
      length: def.length,
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 