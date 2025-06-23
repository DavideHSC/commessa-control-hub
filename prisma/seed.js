// prisma/seed_clean.ts - Solo dati essenziali per il funzionamento
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const SYSTEM_CUSTOMER_ID = 'system_customer_01';
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';
async function main() {
    console.log('Inizio seeding (solo dati essenziali)...');
    // 1. Pulisce i dati esistenti
    console.log('Pulizia tabelle...');
    await prisma.allocazione.deleteMany({});
    await prisma.rigaScrittura.deleteMany({});
    await prisma.scritturaContabile.deleteMany({});
    await prisma.budgetVoce.deleteMany({});
    await prisma.commessa.deleteMany({});
    await prisma.voceTemplateScrittura.deleteMany({});
    await prisma.campoDatiPrimari.deleteMany({});
    await prisma.causaleContabile.deleteMany({});
    await prisma.conto.deleteMany({});
    await prisma.voceAnalitica.deleteMany({});
    await prisma.fornitore.deleteMany({});
    await prisma.cliente.deleteMany({});
    await prisma.importTemplate.deleteMany({});
    await prisma.fieldDefinition.deleteMany({});
    await prisma.condizionePagamento.deleteMany({});
    await prisma.codiceIva.deleteMany({});
    // 2. SOLO Cliente e Fornitore di sistema (necessari per importazioni)
    await prisma.cliente.create({
        data: {
            id: SYSTEM_CUSTOMER_ID,
            externalId: 'SYS-CUST',
            nome: 'Cliente di Sistema (per importazioni)',
        }
    });
    await prisma.fornitore.create({
        data: {
            id: SYSTEM_SUPPLIER_ID,
            externalId: 'SYS-SUPP',
            nome: 'Fornitore di Sistema (per importazioni)',
        }
    });
    console.log('Cliente e Fornitore di sistema creati.');
    // 3. SOLO Template di Importazione (essenziali per funzionamento)
    console.log('Creazione Template di Importazione...');
    // Template Causali
    await prisma.importTemplate.create({
        data: {
            nome: 'causali',
            modelName: 'CausaleContabile',
            fields: { create: [
                    { nomeCampo: 'externalId', start: 4, length: 6, type: 'string' },
                    { nomeCampo: 'descrizione', start: 10, length: 40, type: 'string' },
                    { nomeCampo: 'tipoMovimento', start: 50, length: 1, type: 'string' },
                    { nomeCampo: 'tipoAggiornamento', start: 51, length: 1, type: 'string' },
                    { nomeCampo: 'dataInizioValidita', start: 52, length: 8, type: 'date' },
                    { nomeCampo: 'dataFineValidita', start: 60, length: 8, type: 'date' },
                    { nomeCampo: 'tipoRegistroIva', start: 68, length: 1, type: 'string' },
                    { nomeCampo: 'segnoMovimentoIva', start: 69, length: 1, type: 'string' },
                    { nomeCampo: 'contoIva', start: 70, length: 10, type: 'string' },
                    { nomeCampo: 'generazioneAutofattura', start: 80, length: 1, type: 'string' },
                    { nomeCampo: 'gestionePartite', start: 97, length: 1, type: 'string' },
                    { nomeCampo: 'gestioneRitenuteEnasarco', start: 99, length: 1, type: 'string' },
                    { nomeCampo: 'noteMovimento', start: 101, length: 60, type: 'string' }
                ] },
        }
    });
    // Template Condizioni Pagamento
    await prisma.importTemplate.create({
        data: {
            nome: 'condizioni_pagamento',
            modelName: 'CondizionePagamento',
            fields: { create: [
                    { nomeCampo: 'externalId', start: 4, length: 8, type: 'string' },
                    { nomeCampo: 'descrizione', start: 12, length: 40, type: 'string' },
                    { nomeCampo: 'contoIncassoPagamento', start: 52, length: 10, type: 'string' },
                    { nomeCampo: 'calcolaGiorniCommerciali', start: 62, length: 1, type: 'string' },
                    { nomeCampo: 'consideraPeriodiChiusura', start: 63, length: 1, type: 'string' },
                    { nomeCampo: 'suddivisione', start: 64, length: 1, type: 'string' },
                    { nomeCampo: 'inizioScadenza', start: 65, length: 1, type: 'string' },
                    { nomeCampo: 'numeroRate', start: 66, length: 2, type: 'number' }
                ] },
        }
    });
    // Template Codici IVA
    await prisma.importTemplate.create({
        data: {
            nome: 'codici_iva',
            modelName: 'CodiceIva',
            fields: { create: [
                    { nomeCampo: 'externalId', start: 4, length: 4, type: 'string' },
                    { nomeCampo: 'descrizione', start: 8, length: 40, type: 'string' },
                    { nomeCampo: 'tipoCalcolo', start: 48, length: 1, type: 'string' },
                    { nomeCampo: 'aliquota', start: 49, length: 6, type: 'number' },
                    { nomeCampo: 'percentualeIndetraibilita', start: 55, length: 3, type: 'number' },
                    { nomeCampo: 'note', start: 58, length: 40, type: 'string' },
                    { nomeCampo: 'dataInizioValidita', start: 98, length: 8, type: 'date' },
                    { nomeCampo: 'dataFineValidita', start: 106, length: 8, type: 'date' },
                    { nomeCampo: 'plafondAcquisti', start: 124, length: 1, type: 'string' },
                    { nomeCampo: 'gestioneProRata', start: 128, length: 1, type: 'string' },
                    { nomeCampo: 'autofatturaReverseCharge', start: 133, length: 1, type: 'string' }
                ] },
        }
    });
    // Template Anagrafica Clienti/Fornitori (CORRETTO)
    await prisma.importTemplate.create({
        data: {
            nome: 'anagrafica_clifor',
            modelName: null,
            fields: { create: [
                    { nomeCampo: 'codiceUnivoco', start: 20, length: 12, type: 'string' },
                    { nomeCampo: 'codiceFiscale', start: 32, length: 16, type: 'string' },
                    { nomeCampo: 'tipoConto', start: 49, length: 1, type: 'string' },
                    { nomeCampo: 'sottocontoCliente', start: 50, length: 10, type: 'string' },
                    { nomeCampo: 'sottocontoFornitore', start: 60, length: 10, type: 'string' },
                    { nomeCampo: 'codiceAnagrafica', start: 70, length: 12, type: 'string' },
                    { nomeCampo: 'partitaIva', start: 82, length: 11, type: 'string' },
                    { nomeCampo: 'tipoSoggetto', start: 93, length: 1, type: 'string' },
                    { nomeCampo: 'denominazione', start: 94, length: 60, type: 'string' },
                    { nomeCampo: 'cognome', start: 154, length: 20, type: 'string' },
                    { nomeCampo: 'nome', start: 174, length: 20, type: 'string' },
                    { nomeCampo: 'sesso', start: 194, length: 1, type: 'string' },
                    { nomeCampo: 'dataNascita', start: 195, length: 8, type: 'date' },
                    { nomeCampo: 'comuneNascita', start: 203, length: 4, type: 'string' },
                    { nomeCampo: 'comuneResidenza', start: 207, length: 4, type: 'string' },
                    { nomeCampo: 'cap', start: 211, length: 5, type: 'string' },
                    { nomeCampo: 'indirizzo', start: 216, length: 30, type: 'string' },
                    { nomeCampo: 'codicePagamento', start: 283, length: 8, type: 'string' }
                ] },
        }
    });
    // Template Piano dei Conti (CORRETTO per CONTIGEN.TXT)
    await prisma.importTemplate.create({
        data: {
            nome: 'piano_dei_conti',
            modelName: null,
            fields: { create: [
                    { nomeCampo: 'livello', start: 4, length: 1, type: 'string' },
                    { nomeCampo: 'codice', start: 5, length: 10, type: 'string' },
                    { nomeCampo: 'descrizione', start: 15, length: 60, type: 'string' },
                    { nomeCampo: 'tipo', start: 75, length: 1, type: 'string' },
                    { nomeCampo: 'sigla', start: 76, length: 12, type: 'string' },
                    { nomeCampo: 'gruppo', start: 256, length: 1, type: 'string' }
                ] },
        }
    });
    // Template Scritture Contabili
    const scrittureContabiliFields = [
        // --- PNTESTA.TXT ---
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'codiceUnivoco', start: 20, length: 12, type: 'string' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'codiceCausale', start: 39, length: 6, type: 'string' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataRegistrazione', start: 85, length: 8, type: 'date' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'codiceFiscaleClienteFornitore', start: 99, length: 16, type: 'string' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'dataDocumento', start: 128, length: 8, type: 'date' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'numeroDocumento', start: 136, length: 12, type: 'string' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'totaleDocumento', start: 172, length: 12, type: 'number' },
        { fileIdentifier: 'PNTESTA.TXT', nomeCampo: 'noteMovimento', start: 192, length: 60, type: 'string' },
        // --- PNRIGCON.TXT ---
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'codiceUnivoco', start: 3, length: 12, type: 'string' },
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'progressivoRiga', start: 15, length: 3, type: 'number' },
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'codiceConto', start: 48, length: 10, type: 'string' },
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoDare', start: 58, length: 12, type: 'number' },
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'importoAvere', start: 70, length: 12, type: 'number' },
        { fileIdentifier: 'PNRIGCON.TXT', nomeCampo: 'note', start: 82, length: 60, type: 'string' },
        // --- PNRIGIVA.TXT ---
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codiceUnivoco', start: 3, length: 12, type: 'string' },
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'codiceIva', start: 15, length: 4, type: 'string' },
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'contropartita', start: 19, length: 10, type: 'string' },
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imponibile', start: 29, length: 12, type: 'number' },
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'imposta', start: 41, length: 12, type: 'number' },
        { fileIdentifier: 'PNRIGIVA.TXT', nomeCampo: 'importoLordo', start: 89, length: 12, type: 'number' },
        // --- MOVANAC.TXT ---
        { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'codiceUnivoco', start: 3, length: 12, type: 'string' },
        { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'progressivoRiga', start: 15, length: 3, type: 'number' },
        { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'centroDiCosto', start: 18, length: 4, type: 'string' },
        { fileIdentifier: 'MOVANAC.TXT', nomeCampo: 'importo', start: 22, length: 12, type: 'number' }
    ];
    await prisma.importTemplate.create({
        data: {
            nome: 'scritture_contabili',
            modelName: null,
            fields: { create: scrittureContabiliFields },
        },
    });
    console.log('Template di importazione creati.');
    console.log('Seeding completato - Database pulito e pronto per importazioni reali.');
}
main()
    .catch((e) => {
    console.error('ERRORE DURANTE IL SEEDING:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
