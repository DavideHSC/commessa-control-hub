import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../app.js';

// --- SETUP ---
const app = createApp();
const prisma = new PrismaClient();

describe('End-to-End Workflow Test - Staging to Production', () => {

  beforeEach(async () => {
    console.log('\n🧼 Pulizia completa database per test end-to-end...');
    
    // Pulizia completa in ordine corretto per rispettare le foreign keys
    await prisma.$transaction([
      // Prima le tabelle dipendenti
      prisma.allocazione.deleteMany({}),
      prisma.rigaIva.deleteMany({}),
      prisma.rigaScrittura.deleteMany({}),
      prisma.scritturaContabile.deleteMany({}),
      prisma.budgetVoce.deleteMany({}),
      prisma.commessa.deleteMany({}),
      prisma.voceAnalitica.deleteMany({}),
      prisma.cliente.deleteMany({}),
      prisma.fornitore.deleteMany({}),
      prisma.causaleContabile.deleteMany({}),
      prisma.codiceIva.deleteMany({}),
      prisma.condizionePagamento.deleteMany({}),
      prisma.conto.deleteMany({}),
      
      // Poi le tabelle di staging
      prisma.stagingAllocazione.deleteMany({}),
      prisma.stagingRigaIva.deleteMany({}),
      prisma.stagingRigaContabile.deleteMany({}),
      prisma.stagingTestata.deleteMany({}),
      prisma.stagingAnagrafica.deleteMany({}),
      prisma.stagingCausaleContabile.deleteMany({}),
      prisma.stagingCodiceIva.deleteMany({}),
      prisma.stagingCondizionePagamento.deleteMany({}),
      prisma.stagingConto.deleteMany({})
    ]);
    
    console.log('✅ Database pulito per test end-to-end.');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('dovrebbe completare tutto il workflow: staging → finalizzazione → produzione', async () => {
    // FASE 1: POPOLIAMO LE TABELLE DI STAGING CON DATI MINIMAL MA COMPLETI
    console.log('\n📋 FASE 1: Popolazione tabelle staging...');

    // Cliente di sistema necessario per le commesse
    await prisma.cliente.create({
      data: {
        id: 'system_customer_01',
        nome: 'Cliente di Sistema',
        externalId: 'SYS-CUST'
      }
    });

    // Causale contabile
    await prisma.stagingCausaleContabile.create({
      data: {
        codiceCausale: 'VEN01',
        descrizione: 'Vendite Test',
        tipoMovimento: 'V',
        tipoAggiornamento: 'A'
      }
    });

    // Codice IVA
    await prisma.stagingCodiceIva.create({
      data: {
        codice: 'IVA22',
        descrizione: 'IVA 22%',
        aliquota: '22,00'
      }
    });

    // Condizioni pagamento
    await prisma.stagingCondizionePagamento.create({
      data: {
        codicePagamento: 'PAG30',
        descrizione: 'Pagamento a 30 giorni',
        numeroRate: '1'
      }
    });

    // Anagrafica cliente
    await prisma.stagingAnagrafica.create({
      data: {
        codiceUnivoco: 'CLI001',
        tipoSoggetto: 'C',
        denominazione: 'Cliente Test S.r.l.',
        partitaIva: '12345678901',
        codiceFiscaleClifor: 'CLITST01',
        sottocontoCliente: '1001',
        codiceAnagrafica: 'CLI001'
      }
    });

    // Piano dei conti
    await prisma.stagingConto.create({
      data: {
        codice: '4001',
        descrizione: 'Ricavi Vendite',
        tipo: 'E',
        gruppo: 'R',
        codiceFiscaleAzienda: 'AZIENDA01'
      }
    });

    // Testata movimento
    await prisma.stagingTestata.create({
      data: {
        codiceUnivocoScaricamento: 'MOV001',
        esercizio: '2024',
        codiceAzienda: 'AZIENDA01',
        codiceCausale: 'VEN01',
        descrizioneCausale: 'Vendite Test',
        dataRegistrazione: '20241201',
        tipoRegistroIva: 'V',
        clienteFornitoreCodiceFiscale: 'CLITST01',
        clienteFornitoreSigla: 'CLI001',
        dataDocumento: '20241201',
        numeroDocumento: '001',
        totaleDocumento: '1220,00'
      }
    });

    // Riga contabile (usando solo i campi essenziali e presenti nel modello)
    await prisma.stagingRigaContabile.create({
      data: {
        codiceUnivocoScaricamento: 'MOV001',
        tipoConto: 'C',
        clienteFornitoreCodiceFiscale: 'CLITST01',
        clienteFornitoreSubcodice: '',
        clienteFornitoreSigla: 'CLI001',
        conto: '4001',
        importoDare: '0,00',
        importoAvere: '1000,00',
        note: 'Ricavo test',
        insDatiCompetenzaContabile: '',
        externalId: 'MOV001',
        progressivoRigo: '1',
        dataFineCompetenza: '',
        dataFineCompetenzaAnalit: '',
        dataInizioCompetenza: '',
        dataInizioCompetenzaAnalit: '',
        dataRegistrazioneApertura: '',
        noteDiCompetenza: '',
        contoDaRilevareMovimento1: '',
        contoDaRilevareMovimento2: '',
        insDatiMovimentiAnalitici: '',
        insDatiStudiDiSettore: '',
        statoMovimentoStudi: '',
        esercizioDiRilevanzaFiscale: '',
        dettaglioCliForCodiceFiscale: '',
        dettaglioCliForSubcodice: '',
        dettaglioCliForSigla: '',
        siglaConto: ''
      }
    });

    // Riga IVA
    await prisma.stagingRigaIva.create({
      data: {
        codiceUnivocoScaricamento: 'MOV001',
        codiceIva: 'IVA22',
        contropartita: '2601',
        imponibile: '1000,00',
        imposta: '220,00',
        impostaNonConsiderata: '0,00',
        importoLordo: '1220,00',
        note: 'IVA su ricavo test',
        siglaContropartita: '',
        impostaIntrattenimenti: '0,00',
        imponibile50CorrNonCons: '0,00'
      }
    });

    // Allocazione (solo campi presenti nel modello)
    await prisma.stagingAllocazione.create({
      data: {
        codiceUnivocoScaricamento: 'MOV001',
        progressivoRigoContabile: '1',
        centroDiCosto: 'COMM001',
        parametro: 'RICAVI_VENDITA'
      }
    });

    console.log('✅ Tabelle staging popolate con dati test.');

    // FASE 2: VERIFICA STATO INIZIALE
    const initialStagingCount = await prisma.$transaction([
      prisma.stagingTestata.count(),
      prisma.stagingRigaContabile.count(),
      prisma.stagingRigaIva.count(),
      prisma.stagingAllocazione.count(),
      prisma.stagingCausaleContabile.count(),
      prisma.stagingCodiceIva.count(),
      prisma.stagingAnagrafica.count()
    ]);

    expect(initialStagingCount).toEqual([1, 1, 1, 1, 1, 1, 1]);
    console.log('✅ Stato iniziale staging verificato.');

    // FASE 3: CHIAMATA ENDPOINT DI FINALIZZAZIONE
    console.log('\n⚡ FASE 3: Esecuzione finalizzazione tramite API...');

    const finalizationResponse = await request(app)
      .post('/api/staging/finalize')
      .expect(200);

    console.log('✅ Risposta finalizzazione ricevuta:', finalizationResponse.body.message);

    // FASE 4: VERIFICA FINALIZZAZIONE COMPLETATA
    console.log('\n🔍 FASE 4: Verifica risultati finalizzazione...');

    // Verifica che le tabelle di produzione siano state popolate
    const productionCounts = await prisma.$transaction([
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.cliente.count(), // Dovrebbe essere 2: sistema + test
      prisma.conto.count(),
      prisma.scritturaContabile.count(),
      prisma.rigaScrittura.count(),
      prisma.rigaIva.count(),
      prisma.allocazione.count()
    ]);

    console.log('📊 Conteggi produzione:', {
      causali: productionCounts[0],
      codiciIva: productionCounts[1], 
      clienti: productionCounts[2],
      conti: productionCounts[3],
      scritture: productionCounts[4],
      righeScritture: productionCounts[5],
      righeIva: productionCounts[6],
      allocazioni: productionCounts[7]
    });

    // VERIFICHE SPECIFICHE
    expect(productionCounts[0]).toBeGreaterThanOrEqual(1); // Causali
    expect(productionCounts[1]).toBeGreaterThanOrEqual(1); // Codici IVA
    expect(productionCounts[2]).toBeGreaterThanOrEqual(2); // Clienti (sistema + test)
    expect(productionCounts[3]).toBeGreaterThanOrEqual(1); // Conti
    expect(productionCounts[4]).toBeGreaterThanOrEqual(1); // Scritture
    expect(productionCounts[5]).toBeGreaterThanOrEqual(1); // Righe scritture
    expect(productionCounts[6]).toBeGreaterThanOrEqual(1); // Righe IVA
    expect(productionCounts[7]).toBeGreaterThanOrEqual(1); // Allocazioni

    // FASE 5: VERIFICA INTEGRITÀ DATI
    console.log('\n🔬 FASE 5: Verifica integrità dati...');

    // Verifica che la scrittura contabile sia stata creata correttamente
    const scritture = await prisma.scritturaContabile.findMany({
      include: {
        righe: true,
        causale: true
      }
    });

    expect(scritture).toHaveLength(1);
    expect(scritture[0].externalId).toBe('MOV001');
    expect(scritture[0].righe).toHaveLength(1);
    expect(scritture[0].causale?.codice).toBe('VEN01');

    // Verifica che la riga IVA sia collegata correttamente
    const righeIva = await prisma.rigaIva.findMany({
      include: {
        codiceIva: true,
        rigaScrittura: true
      }
    });

    expect(righeIva).toHaveLength(1);
    expect(righeIva[0].imponibile).toBe(1000.00);
    expect(righeIva[0].imposta).toBe(220.00);
    expect(righeIva[0].codiceIva.codice).toBe('IVA22');

    // Verifica che l'allocazione sia stata creata con commessa e voce analitica
    const allocazioni = await prisma.allocazione.findMany({
      include: {
        commessa: true,
        voceAnalitica: true,
        rigaScrittura: true
      }
    });

    expect(allocazioni).toHaveLength(1);
    expect(allocazioni[0].importo).toBe(1000.00); // Importo della riga avere
    expect(allocazioni[0].tipoMovimento).toBe('RICAVO_EFFETTIVO');
    expect(allocazioni[0].commessa.nome).toContain('COMM001');
    expect(allocazioni[0].voceAnalitica.nome).toBe('RICAVI_VENDITA');

    console.log('✅ Integrità dati verificata - tutti i collegamenti sono corretti!');

    // FASE 6: VERIFICA PERFORMANCE
    console.log('\n⚡ FASE 6: Verifica performance...');
    
    // Il test dovrebbe completare in tempi ragionevoli
    const responseTime = finalizationResponse.header['x-response-time'];
    if (responseTime) {
      const timeMs = parseInt(responseTime.replace('ms', ''));
      expect(timeMs).toBeLessThan(10000); // Max 10 secondi
      console.log(`✅ Performance OK: ${timeMs}ms`);
    }

    console.log('\n🎉 TEST END-TO-END COMPLETATO CON SUCCESSO!');
    console.log('   ✓ Dati migrati da staging a produzione');
    console.log('   ✓ Relazioni mantenute correttamente'); 
    console.log('   ✓ Allocazioni create automaticamente');
    console.log('   ✓ Performance accettabile');

  }, 30000); // 30 secondi timeout per il test completo

  it('dovrebbe gestire correttamente dati mancanti senza fallire', async () => {
    // Test semplificato che verifica la robustezza del sistema
    console.log('\n🧪 Test gestione dati mancanti...');

    // Popoliamo solo dati minimi necessari per il pre-check
    await Promise.all([
      prisma.stagingCausaleContabile.create({
        data: { codiceCausale: 'MIN01', descrizione: 'Minima', tipoMovimento: 'V', tipoAggiornamento: 'A' }
      }),
      prisma.stagingCodiceIva.create({
        data: { codice: 'IVA0', descrizione: 'IVA 0%', aliquota: '0,00' }
      }),
      prisma.stagingCondizionePagamento.create({
        data: { codicePagamento: 'CONT', descrizione: 'Contanti', numeroRate: '1' }
      }),
      prisma.stagingAnagrafica.create({
        data: { 
          codiceUnivoco: 'MIN001', tipoSoggetto: 'C', denominazione: 'Cliente Minimo',
          partitaIva: '', codiceFiscaleClifor: '', sottocontoCliente: '', codiceAnagrafica: ''
        }
      }),
      prisma.stagingConto.create({
        data: { codice: '1000', descrizione: 'Conto Minimo', tipo: 'P', gruppo: '', codiceFiscaleAzienda: 'AZIENDA01' }
      }),
      prisma.stagingTestata.create({
        data: {
          codiceUnivocoScaricamento: 'MIN001',
          esercizio: '2024',
          codiceAzienda: 'AZIENDA01',
          codiceCausale: 'MIN01',
          descrizioneCausale: 'Minima'
        }
      })
    ]);

    // La finalizzazione dovrebbe completarsi anche con dati minimi
    const response = await request(app)
      .post('/api/staging/finalize')
      .expect(200);

    expect(response.body.message).toContain('finalizzazione completata');
    console.log('✅ Sistema robusto - gestione dati minimi verificata');
  });
});