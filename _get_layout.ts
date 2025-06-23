import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getPnrIgconLayout() {
  const template = await prisma.importTemplate.findUnique({
    where: { name: 'scritture_contabili' },
  });

  if (!template) {
    console.error("Template 'scritture_contabili' non trovato.");
    return;
  }

  const definitions = await prisma.fieldDefinition.findMany({
    where: {
      templateId: template.id,
      fileIdentifier: 'PNRIGCON.TXT',
    },
    orderBy: {
      start: 'asc',
    },
  });
  console.log("Definizioni attuali per PNRIGCON.TXT nel DB:");
  console.table(
    definitions.map(d => ({
      nomeCampo: d.fieldName,
      start: d.start,
      length: d.length,
      type: d.format,
    }))
  );
}

getPnrIgconLayout()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 