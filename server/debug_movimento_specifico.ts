/**
 * DEBUG SPECIFICO: Analisi movimento 02/01/2025 - Causale FRS
 * Questo script cerca di capire perché il movimento appare sbilanciato
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMovimentoSpecifico() {
  console.log('🔍 DEBUG: Movimento del 02/01/2025 - Causale FRS');
  console.log('='.repeat(60));
  
  try {
    // 1. Cerca TUTTE le scritture del 02/01/2025 con causale FRS
    const scrittureProblematiche = await prisma.scritturaContabile.findMany({
      where: {
        data: {
          gte: new Date('2025-01-02T00:00:00.000Z'),
          lt: new Date('2025-01-03T00:00:00.000Z')
        },
        causale: {
          id: 'FRS'
        }
      },
      include: {
        righe: {
          include: {
            conto: true
          }
        },
        causale: true,
        fornitore: true
      }
    });

    if (scrittureProblematiche.length === 0) {
      console.log('❌ Nessuna scrittura trovata nel database per il 02/01/2025');
      return;
    }

    console.log(`\n📄 TROVATE ${scrittureProblematiche.length} SCRITTURE DEL 02/01/2025:`);

    // Analizza ogni scrittura
    for (let i = 0; i < scrittureProblematiche.length; i++) {
      const scrittura = scrittureProblematiche[i];
      
      console.log(`\n--- SCRITTURA ${i + 1} ---`);
      console.log(`   ID: ${scrittura.id}`);
      console.log(`   External ID: ${scrittura.externalId}`);
      console.log(`   Data: ${scrittura.data}`);
      console.log(`   Descrizione: ${scrittura.descrizione}`);
      console.log(`   Causale: ${scrittura.causale?.id || 'N/A'}`);
      console.log(`   Fornitore: ${scrittura.fornitore?.id || 'N/A'}`);

      console.log('\n💰 RIGHE CONTABILI:');
      let totaleDare = 0;
      let totaleAvere = 0;

      scrittura.righe.forEach((riga, idx) => {
        console.log(`   Riga ${idx + 1}:`);
        console.log(`     Conto: ${riga.conto?.codice || 'N/A'} - ${riga.conto?.nome || 'N/A'}`);
        console.log(`     Descrizione: ${riga.descrizione}`);
        console.log(`     Dare: €${(riga.dare || 0).toFixed(2)}`);
        console.log(`     Avere: €${(riga.avere || 0).toFixed(2)}`);
        
        totaleDare += Number(riga.dare);
        totaleAvere += Number(riga.avere);
      });

      console.log('\n📊 TOTALI:');
      console.log(`   Totale Dare:  €${totaleDare.toFixed(2)}`);
      console.log(`   Totale Avere: €${totaleAvere.toFixed(2)}`);
      console.log(`   Differenza:   €${Math.abs(totaleDare - totaleAvere).toFixed(2)}`);
      console.log(`   Pareggia: ${Math.abs(totaleDare - totaleAvere) < 0.01 ? '✅ SÌ' : '❌ NO'}`);

      // 2. Verifica se ci sono righe di staging non consolidate per questa scrittura
      console.log('\n🔍 VERIFICA STAGING:');
      const righeStaging = await prisma.importScritturaRigaContabile.findMany({
        where: {
          codiceUnivocoScaricamento: scrittura.externalId || undefined
        }
      });

      console.log(`   Righe in staging: ${righeStaging.length}`);
      if (righeStaging.length > 0) {
        let stagingDare = 0;
        let stagingAvere = 0;
        
        righeStaging.forEach((riga, idx) => {
          console.log(`   Staging ${idx + 1}:`);
          console.log(`     Conto: ${riga.codiceConto}`);
          console.log(`     Dare: €${riga.importoDare?.toFixed(2) || '0.00'}`);
          console.log(`     Avere: €${riga.importoAvere?.toFixed(2) || '0.00'}`);
          
          stagingDare += Number(riga.importoDare || 0);
          stagingAvere += Number(riga.importoAvere || 0);
        });
        
        console.log(`   Staging Totali:`);
        console.log(`     Dare:  €${stagingDare.toFixed(2)}`);
        console.log(`     Avere: €${stagingAvere.toFixed(2)}`);
        console.log(`     Pareggia: ${Math.abs(stagingDare - stagingAvere) < 0.01 ? '✅ SÌ' : '❌ NO'}`);
      }
    }

    // 3. Cerca anche scritture con importo totale di 38.52 (dall'immagine)
    console.log('\n🔍 RICERCA SCRITTURE CON IMPORTO €38.52:');
    const scrittureConImportoSpecifico = await prisma.scritturaContabile.findMany({
      where: {
        righe: {
          some: {
            OR: [
              { dare: 38.52 },
              { avere: 38.52 }
            ]
          }
        }
      },
      include: {
        righe: {
          include: {
            conto: true
          }
        },
        causale: true,
        fornitore: true
      }
    });

    if (scrittureConImportoSpecifico.length > 0) {
      console.log(`   Trovate ${scrittureConImportoSpecifico.length} scritture con importo €38.52:`);
      scrittureConImportoSpecifico.forEach((scrittura, idx) => {
        console.log(`   ${idx + 1}. ID: ${scrittura.id}, Data: ${scrittura.data}, ExternalID: ${scrittura.externalId}`);
      });
    } else {
      console.log(`   Nessuna scrittura trovata con importo €38.52`);
    }

  } catch (error) {
    console.error('❌ Errore durante il debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui il debug
debugMovimentoSpecifico().catch(console.error); 