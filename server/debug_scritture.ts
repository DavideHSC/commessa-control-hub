import { PrismaClient } from '@prisma/client';
import { parseFixedWidth, FieldDefinition } from './lib/fixedWidthParser';

const prisma = new PrismaClient();

async function debugScritture() {
  console.log('🔬 DEBUG TYPESCRIPT - SCRIPT SCRITTURE');
  console.log('=' .repeat(60));
  
  try {
    // 1. Recupera il template esistente
    const importTemplate = await prisma.importTemplate.findFirst({
      where: { name: 'scritture_contabili' },
      include: { fieldDefinitions: true },
    });

    if (!importTemplate || !importTemplate.fieldDefinitions) {
      console.error('❌ Template scritture_contabili non trovato');
      return;
    }
    
    console.log(`✅ Template trovato con ${importTemplate.fieldDefinitions.length} field definitions`);
    
    // 2. Raggruppa le definizioni per fileIdentifier
    const definitionsByFile = importTemplate.fieldDefinitions.reduce((acc, field) => {
      if (field.fileIdentifier) {
        if (!acc[field.fileIdentifier]) {
          acc[field.fileIdentifier] = [];
        }
        acc[field.fileIdentifier].push({
          name: field.fieldName || '',
          start: field.start,
          length: field.length,
          type: (field.format || 'string') as 'string' | 'number' | 'date',
        });
      }
      return acc;
    }, {} as Record<string, FieldDefinition[]>);
    
    console.log('📋 File definitions trovate:', Object.keys(definitionsByFile));
    
    // 3. Usa gli stessi dati di test del Python (TUTTI E 4 I FILE)
    const samplePntestaLine = "000123456789012345X123456789012345ABCAAA2025CAUS01CAUSALE DI TEST MOLTO LUNGA    2512202502AACAU0123456789ABCDEF123456789012SIGLA_TEST  2412202412345       D2412202412345 D2412202410000240000002412202412345678901234567890123456789012345678901234567890123456789012340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    
    const samplePnrigconLine = "000123456789012001C123456789ABCDEF 123456789  1234567890  12345678900120000012345678901234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001                                                                                                                                                             0";
    
    // Righe IVA più lunghe (173 bytes)
    const samplePnrigivaLine = "000123456789012IV01CONTROP123  12345678901 12345678901 12345678901 12345678901 12345678901 12345678901 12345678901 NOTE RIGA IVA 12345678901234567890123456789012345678901234567890123456789 SIGLA_CTR123";
    
    // Movimenti analitici più corti (34 bytes)  
    const sampleMovanacLine = "000123456789012001CC01123456789012";
    
    // 4. Test parsing PNTESTA
    if (definitionsByFile['PNTESTA.TXT']) {
      console.log('\n🔍 PNTESTA - PARSING TYPESCRIPT:');
      console.log(`📏 Lunghezza riga test: ${samplePntestaLine.length}`);
      
      const pntestaDefinitions = definitionsByFile['PNTESTA.TXT'];
      console.log(`📝 Field definitions (${pntestaDefinitions.length}):`);
      pntestaDefinitions.forEach(def => {
        console.log(`  ${def.name}: start=${def.start}, length=${def.length}, type=${def.type}`);
      });
      
      try {
        const parsedPntesta = parseFixedWidth(samplePntestaLine, pntestaDefinitions);
        console.log('\n📊 RISULTATO PARSING:');
        parsedPntesta.forEach((record, index) => {
          console.log(`Record ${index + 1}:`);
          Object.entries(record as Record<string, unknown>).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(25)} = '${value}'`);
          });
        });
      } catch (error) {
        console.error('❌ Errore nel parsing PNTESTA:', error);
      }
    }
    
    // 5. Test parsing PNRIGCON
    if (definitionsByFile['PNRIGCON.TXT']) {
      console.log('\n🔍 PNRIGCON - PARSING TYPESCRIPT:');
      console.log(`📏 Lunghezza riga test: ${samplePnrigconLine.length}`);
      
      const pnrigconDefinitions = definitionsByFile['PNRIGCON.TXT'];
      console.log(`📝 Field definitions (${pnrigconDefinitions.length}):`);
      pnrigconDefinitions.forEach(def => {
        console.log(`  ${def.name}: start=${def.start}, length=${def.length}, type=${def.type}`);
      });
      
      try {
        const parsedPnrigcon = parseFixedWidth(samplePnrigconLine, pnrigconDefinitions);
        console.log('\n📊 RISULTATO PARSING:');
        parsedPnrigcon.forEach((record, index) => {
          console.log(`Record ${index + 1}:`);
          Object.entries(record as Record<string, unknown>).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(25)} = '${value}'`);
          });
        });
      } catch (error) {
        console.error('❌ Errore nel parsing PNRIGCON:', error);
      }
    }
    
    // 6. Test parsing PNRIGIVA
    if (definitionsByFile['PNRIGIVA.TXT']) {
      console.log('\n🔍 PNRIGIVA - PARSING TYPESCRIPT:');
      console.log(`📏 Lunghezza riga test: ${samplePnrigivaLine.length}`);
      
      const pnrigivaDefinitions = definitionsByFile['PNRIGIVA.TXT'];
      console.log(`📝 Field definitions (${pnrigivaDefinitions.length}):`);
      pnrigivaDefinitions.forEach(def => {
        console.log(`  ${def.name}: start=${def.start}, length=${def.length}, type=${def.type}`);
      });
      
      try {
        const parsedPnrigiva = parseFixedWidth(samplePnrigivaLine, pnrigivaDefinitions);
        console.log('\n📊 RISULTATO PARSING:');
        parsedPnrigiva.forEach((record, index) => {
          console.log(`Record ${index + 1}:`);
          Object.entries(record as Record<string, unknown>).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(25)} = '${value}'`);
          });
        });
      } catch (error) {
        console.error('❌ Errore nel parsing PNRIGIVA:', error);
      }
    }

    // 7. Test parsing MOVANAC
    if (definitionsByFile['MOVANAC.TXT']) {
      console.log('\n🔍 MOVANAC - PARSING TYPESCRIPT:');
      console.log(`📏 Lunghezza riga test: ${sampleMovanacLine.length}`);
      
      const movanacDefinitions = definitionsByFile['MOVANAC.TXT'];
      console.log(`📝 Field definitions (${movanacDefinitions.length}):`);
      movanacDefinitions.forEach(def => {
        console.log(`  ${def.name}: start=${def.start}, length=${def.length}, type=${def.type}`);
      });
      
      try {
        const parsedMovanac = parseFixedWidth(sampleMovanacLine, movanacDefinitions);
        console.log('\n📊 RISULTATO PARSING:');
        parsedMovanac.forEach((record, index) => {
          console.log(`Record ${index + 1}:`);
          Object.entries(record as Record<string, unknown>).forEach(([key, value]) => {
            console.log(`  ${key.padEnd(25)} = '${value}'`);
          });
        });
      } catch (error) {
        console.error('❌ Errore nel parsing MOVANAC:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugScritture().catch(console.error); 