import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPnrigivaTemplate() {
  console.log('🔍 ANALISI TEMPLATE PNRIGIVA...\n');
  
  try {
    // Cerca i template che potrebbero contenere PNRIGIVA
    const templates = await prisma.importTemplate.findMany({
      where: {
        name: {
          contains: 'PNRIGIVA'
        }
      },
      include: {
        fieldDefinitions: {
          orderBy: { start: 'asc' }
        }
      }
    });
    
    console.log(`📋 Templates trovati: ${templates.length}\n`);
    
    for (const template of templates) {
      console.log(`📊 TEMPLATE: ${template.name}`);
      console.log(`   Descrizione: ${template.description}`);
      console.log(`   Definizioni campi: ${template.fieldDefinitions.length}\n`);
      
      // Cerca il campo codiceIva
      const codiceIvaField = template.fieldDefinitions.find(fd => 
        fd.fieldName?.toLowerCase().includes('iva') || 
        fd.fieldName?.toLowerCase().includes('codice')
      );
      
      if (codiceIvaField) {
        console.log(`🎯 CAMPO CODICE IVA TROVATO:`);
        console.log(`   Nome campo: ${codiceIvaField.fieldName}`);
        console.log(`   Start: ${codiceIvaField.start}`);
        console.log(`   Length: ${codiceIvaField.length}`);
        console.log(`   End: ${codiceIvaField.end || 'N/A'}`);
        console.log(`   Formato: ${codiceIvaField.format || 'N/A'}`);
        
        // Test del parsing con la riga di esempio
        const testLine = "   01202511072510  1850000050     1419.60      141.96";
        console.log(`\n🧪 TEST CON RIGA:`);
        console.log(`   Riga: "${testLine}"`);
        console.log(`   Lunghezza riga: ${testLine.length}`);
        
        const startIndex = codiceIvaField.start - 1;
        const extracted = testLine.substring(startIndex, startIndex + codiceIvaField.length);
        console.log(`   Estratto (pos ${codiceIvaField.start}-${codiceIvaField.start + codiceIvaField.length - 1}): "${extracted}"`);
        console.log(`   Dopo trim(): "${extracted.trim()}"`);
        
        // Mostra anche quello che dovrebbe essere estratto secondo il tracciato
        const correctExtracted = testLine.substring(15, 19); // pos 16-19 (0-based: 15-18)
        console.log(`   CORRETTO (pos 16-19): "${correctExtracted}"`);
        
      } else {
        console.log('❌ Campo codiceIva non trovato');
      }
      
      console.log('\n📝 TUTTI I CAMPI:');
      template.fieldDefinitions.forEach((fd, idx) => {
        console.log(`   ${idx + 1}. ${fd.fieldName} - Start: ${fd.start}, Length: ${fd.length}, End: ${fd.end || 'N/A'}`);
      });
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    // Se non trova template specifici, cerca tutti i template che potrebbero includere PNRIGIVA
    if (templates.length === 0) {
      console.log('🔍 Nessun template specifico PNRIGIVA trovato. Cerco template generici...\n');
      
      const allTemplates = await prisma.importTemplate.findMany({
        include: {
          fieldDefinitions: {
            where: { fileIdentifier: 'PNRIGIVA.TXT' },
            orderBy: { start: 'asc' }
          }
        }
      });
      
      console.log(`📋 Template con definizioni PNRIGIVA.TXT: ${allTemplates.length}\n`);
      
      for (const template of allTemplates) {
        if (template.fieldDefinitions.length > 0) {
          console.log(`📊 TEMPLATE: ${template.name} (con fileIdentifier PNRIGIVA.TXT)`);
          console.log(`   Definizioni: ${template.fieldDefinitions.length}\n`);
          
          const codiceIvaField = template.fieldDefinitions.find(fd => 
            fd.fieldName?.toLowerCase().includes('iva') || 
            fd.fieldName?.toLowerCase().includes('codice')
          );
          
          if (codiceIvaField) {
            console.log(`🎯 CAMPO CODICE IVA:`);
            console.log(`   Nome: ${codiceIvaField.fieldName}`);
            console.log(`   Start: ${codiceIvaField.start}, Length: ${codiceIvaField.length}`);
            
            // Test parsing
            const testLine = "   01202511072510  1850000050     1419.60      141.96";
            const startIndex = codiceIvaField.start - 1;
            const extracted = testLine.substring(startIndex, startIndex + codiceIvaField.length);
            console.log(`   Estratto: "${extracted.trim()}"`);
            console.log(`   Dovrebbe essere: "${testLine.substring(15, 19)}"`);
          }
          
          console.log('\n📝 TUTTI I CAMPI:');
          template.fieldDefinitions.forEach((fd, idx) => {
            console.log(`   ${idx + 1}. ${fd.fieldName} - Start: ${fd.start}, Length: ${fd.length}`);
          });
          console.log('\n' + '='.repeat(50) + '\n');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPnrigivaTemplate().catch(console.error);