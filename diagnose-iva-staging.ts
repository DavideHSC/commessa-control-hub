#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseIvaStaging() {
  console.log('🔍 DIAGNOSI DATI IVA NELLE TABELLE DI STAGING\n');
  
  try {
    // 1. Count totale righe IVA
    const totalRigheIva = await prisma.stagingRigaIva.count();
    console.log(`📊 Totale righe IVA in staging: ${totalRigheIva}`);
    
    // 2. Count righe IVA con codiceUnivocoScaricamento vuoto (il campo è String non nullable)
    const emptyCodeCount = await prisma.stagingRigaIva.count({
      where: {
        codiceUnivocoScaricamento: ''
      }
    });
    console.log(`❌ Righe IVA con codiceUnivocoScaricamento vuoto: ${emptyCodeCount}`);
    
    // 3. Sample di righe IVA (prime 5) per vedere la struttura
    const sampleRigheIva = await prisma.stagingRigaIva.findMany({
      take: 5,
      select: {
        id: true,
        codiceUnivocoScaricamento: true,
        codiceIva: true,
        contropartita: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 CAMPIONE RIGHE IVA (prime 5):');
    sampleRigheIva.forEach((riga, index) => {
      console.log(`  ${index + 1}. ID: ${riga.id}`);
      console.log(`     codiceUnivocoScaricamento: "${riga.codiceUnivocoScaricamento}"`);
      console.log(`     codiceIva: "${riga.codiceIva}"`);
      console.log(`     contropartita: "${riga.contropartita}"`);
      console.log(`     createdAt: ${riga.createdAt}`);
      console.log('');
    });
    
    // 4. Count totale testate
    const totalTestate = await prisma.stagingTestata.count();
    console.log(`📊 Totale testate in staging: ${totalTestate}`);
    
    // 5. Sample di testate (prime 5) per vedere codiceUnivocoScaricamento
    const sampleTestate = await prisma.stagingTestata.findMany({
      take: 5,
      select: {
        id: true,
        codiceUnivocoScaricamento: true,
        codiceCausale: true,
        dataRegistrazione: true,
        createdAt: true
      }
    });
    
    console.log('📋 CAMPIONE TESTATE (prime 5):');
    sampleTestate.forEach((testata, index) => {
      console.log(`  ${index + 1}. ID: ${testata.id}`);
      console.log(`     codiceUnivocoScaricamento: "${testata.codiceUnivocoScaricamento}"`);
      console.log(`     codiceCausale: "${testata.codiceCausale}"`);
      console.log(`     dataRegistrazione: "${testata.dataRegistrazione}"`);
      console.log(`     createdAt: ${testata.createdAt}`);
      console.log('');
    });
    
    // 6. Check per codiciUnivocoScaricamento che esistono nelle testate ma non nelle righe IVA
    console.log('🔗 VERIFICA COLLEGAMENTI TESTATE ↔ RIGHE IVA:');
    
    const testateIds = await prisma.stagingTestata.findMany({
      select: { codiceUnivocoScaricamento: true },
      take: 10
    });
    
    for (const testata of testateIds) {
      const righeIvaCollegate = await prisma.stagingRigaIva.count({
        where: {
          codiceUnivocoScaricamento: testata.codiceUnivocoScaricamento
        }
      });
      console.log(`  Testata "${testata.codiceUnivocoScaricamento}" → ${righeIvaCollegate} righe IVA collegate`);
    }
    
    // 7. Check per righe IVA orfane (codice non esistente nelle testate)
    const righeIvaUniqueIds = await prisma.stagingRigaIva.findMany({
      select: { codiceUnivocoScaricamento: true },
      distinct: ['codiceUnivocoScaricamento'],
      take: 10
    });
    
    console.log('\n🔍 VERIFICA RIGHE IVA ORFANE (primi 10 codici):');
    for (const rigaIva of righeIvaUniqueIds) {
      if (rigaIva.codiceUnivocoScaricamento) {
        const testataExists = await prisma.stagingTestata.count({
          where: {
            codiceUnivocoScaricamento: rigaIva.codiceUnivocoScaricamento
          }
        });
        
        const status = testataExists > 0 ? '✅ OK' : '❌ ORFANA';
        console.log(`  Riga IVA "${rigaIva.codiceUnivocoScaricamento}" → ${status}`);
      } else {
        console.log(`  Riga IVA con codice vuoto → ❌ PROBLEMA`);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante la diagnosi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui la diagnosi
diagnoseIvaStaging().catch(console.error);