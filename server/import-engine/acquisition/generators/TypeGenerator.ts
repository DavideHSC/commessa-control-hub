import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Helper per capitalizzare e rimuovere caratteri non validi per un nome di interfaccia
function toInterfaceName(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
  const parts = sanitized.split('_');
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

async function generateTypes() {
  console.log('🔌 Connessione al database...');
  await prisma.$connect();
  console.log('✅ Connesso.');

  console.log('📚 Lettura dei template di importazione dal database...');
  const templates = await prisma.importTemplate.findMany({
    include: {
      fieldDefinitions: {
        orderBy: {
          start: 'asc',
        },
      },
    },
  });
  console.log(`✅ Trovati ${templates.length} template.`);

  let content = `// ATTENZIONE: Questo file è generato automaticamente. NON MODIFICARE A MANO.\n`;
  content += `// Eseguire 'npm run generate:import-types' per rigenerarlo.\n\n`;

  for (const template of templates) {
    if (!template.name) {
        console.warn(`⚠️ Template con id '${template.id}' saltato perché non ha un nome.`);
        continue;
    }
    if (template.fieldDefinitions.length === 0) {
      console.warn(`⚠️ Template '${template.name}' saltato perché non ha campi definiti.`);
      continue;
    }

    const interfaceName = `Raw${toInterfaceName(template.name)}`;
    console.log(`✨ Generazione interfaccia: ${interfaceName}`);

    content += `export interface ${interfaceName} {\n`;
    for (const field of template.fieldDefinitions) {
      // Per ora, tutti i campi sono stringhe perché letti da un file di testo.
      // La validazione e coercizione avverrà in un secondo momento.
      if (field.fieldName) {
        content += `  ${field.fieldName}: string;\n`;
      }
    }
    content += `}\n\n`;
  }

  // Definisce il percorso di output relativo allo script corrente
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputPath = path.resolve(__dirname, '../../core/types/generated.ts');
  
  console.log(`✍️  Scrittura dei tipi nel file: ${outputPath}`);
  await fs.writeFile(outputPath, content, 'utf-8');

  console.log('✅ Generazione dei tipi completata con successo!');

  await prisma.$disconnect();
}

generateTypes().catch((e) => {
  console.error('❌ Errore durante la generazione dei tipi:', e);
  prisma.$disconnect();
  process.exit(1);
}); 