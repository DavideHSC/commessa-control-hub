/**
 * SCRIPT DI VALIDAZIONE: Currency Transform Problem
 * 
 * Questo script testa la conversione degli importi per identificare
 * e verificare il fix del problema dei decimali impliciti
 */

import { z } from 'zod';

// CURRENT PROBLEMATIC TRANSFORM
const currencyTransformCurrent = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    // Handle implicit decimals (e.g., "12345" -> 123.45)
    if (!cleaned.includes('.')) {
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed / 100;  // 🚨 PROBLEMA QUI
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });

// NEW EXPLICIT TRANSFORM FOR PRIMA NOTA FILES
const currencyTransformExplicit = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });

// TEST CASES FROM REAL DATA
const testCases = [
  // Dal file PNRIGCON.TXT - movimento 012025110522
  { input: '        2500', expected: 25.00, description: 'DARE riga 1 - decimali impliciti' },
  { input: '        0.75', expected: 0.75, description: 'DARE riga 2 - decimali espliciti' },
  { input: '     2500.75', expected: 2500.75, description: 'AVERE riga 3 - decimali espliciti' },
  
  // Altri casi edge
  { input: '', expected: 0, description: 'Stringa vuota' },
  { input: '     ', expected: 0, description: 'Solo spazi' },
  { input: '1000', expected: 1000, description: 'Intero senza decimali' },
  { input: '1000.00', expected: 1000.00, description: 'Decimali zero espliciti' },
  { input: '123,45', expected: 123.45, description: 'Virgola come separatore decimale' },
];

function runValidationTest() {
  console.log('🔍 CURRENCY TRANSFORM VALIDATION TEST');
  console.log('='.repeat(80));
  
  console.log('\n📊 TEST CON CURRENT TRANSFORM (PROBLEMATICO):');
  console.log('-'.repeat(80));
  
  testCases.forEach((testCase, index) => {
    try {
      const result = currencyTransformCurrent.parse(testCase.input);
      const isCorrect = Math.abs(result - testCase.expected) < 0.01;
      const status = isCorrect ? '✅' : '❌';
      
      console.log(`${status} Test ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Expected: €${testCase.expected.toFixed(2)}`);
      console.log(`   Got:      €${result.toFixed(2)}`);
      if (!isCorrect) {
        console.log(`   ❌ ERRORE: Differenza di €${Math.abs(result - testCase.expected).toFixed(2)}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Test ${index + 1}: PARSING ERROR`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Error: ${error}`);
      console.log('');
    }
  });
  
  console.log('\n📊 TEST CON NEW EXPLICIT TRANSFORM (FIX):');
  console.log('-'.repeat(80));
  
  let passedTests = 0;
  const totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = currencyTransformExplicit.parse(testCase.input);
      const isCorrect = Math.abs(result - testCase.expected) < 0.01;
      const status = isCorrect ? '✅' : '❌';
      
      if (isCorrect) passedTests++;
      
      console.log(`${status} Test ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Expected: €${testCase.expected.toFixed(2)}`);
      console.log(`   Got:      €${result.toFixed(2)}`);
      if (!isCorrect) {
        console.log(`   ❌ ERRORE: Differenza di €${Math.abs(result - testCase.expected).toFixed(2)}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Test ${index + 1}: PARSING ERROR`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Error: ${error}`);
      console.log('');
    }
  });
  
  console.log('\n📈 SUMMARY:');
  console.log('-'.repeat(80));
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('✅ TUTTI I TEST PASSANO - FIX VALIDATO!');
  } else {
    console.log('❌ ALCUNI TEST FALLISCONO - FIX DA RIVEDERE');
  }
  
  return passedTests === totalTests;
}

// TEST SPECIFICO DEL MOVIMENTO PROBLEMATICO
function testProblematicMovement() {
  console.log('\n🎯 TEST MOVIMENTO SPECIFICO 012025110522:');
  console.log('-'.repeat(80));
  
  const movementData = [
    { riga: 1, conto: '1890000450', dare: '        2500', avere: '', expectedDare: 25.00, expectedAvere: 0 },
    { riga: 2, conto: '6015004700', dare: '        0.75', avere: '', expectedDare: 0.75, expectedAvere: 0 },
    { riga: 3, conto: '2205000102', dare: '', avere: '     2500.75', expectedDare: 0, expectedAvere: 2500.75 }
  ];
  
  let totalDareOld = 0, totalAvereOld = 0;
  let totalDareNew = 0, totalAvereNew = 0;
  let totalDareExpected = 0, totalAvereExpected = 0;
  
  movementData.forEach(riga => {
    console.log(`\nRiga ${riga.riga} - Conto ${riga.conto}:`);
    
    // Test DARE
    if (riga.dare) {
      const dareOld = currencyTransformCurrent.parse(riga.dare);
      const dareNew = currencyTransformExplicit.parse(riga.dare);
      
      console.log(`  DARE: "${riga.dare}" → Expected: €${riga.expectedDare.toFixed(2)}`);
      console.log(`    Current: €${dareOld.toFixed(2)} ${dareOld === riga.expectedDare ? '✅' : '❌'}`);
      console.log(`    New:     €${dareNew.toFixed(2)} ${dareNew === riga.expectedDare ? '✅' : '❌'}`);
      
      totalDareOld += dareOld;
      totalDareNew += dareNew;
      totalDareExpected += riga.expectedDare;
    }
    
    // Test AVERE
    if (riga.avere) {
      const avereOld = currencyTransformCurrent.parse(riga.avere);
      const avereNew = currencyTransformExplicit.parse(riga.avere);
      
      console.log(`  AVERE: "${riga.avere}" → Expected: €${riga.expectedAvere.toFixed(2)}`);
      console.log(`    Current: €${avereOld.toFixed(2)} ${avereOld === riga.expectedAvere ? '✅' : '❌'}`);
      console.log(`    New:     €${avereNew.toFixed(2)} ${avereNew === riga.expectedAvere ? '✅' : '❌'}`);
      
      totalAvereOld += avereOld;
      totalAvereNew += avereNew;
      totalAvereExpected += riga.expectedAvere;
    }
  });
  
  console.log('\n💰 TOTALI MOVIMENTO:');
  console.log('-'.repeat(40));
  console.log(`Expected:    Dare €${totalDareExpected.toFixed(2)}, Avere €${totalAvereExpected.toFixed(2)} → Bilanciato: ${totalDareExpected === totalAvereExpected ? '✅' : '❌'}`);
  console.log(`Current:     Dare €${totalDareOld.toFixed(2)}, Avere €${totalAvereOld.toFixed(2)} → Bilanciato: ${Math.abs(totalDareOld - totalAvereOld) < 0.01 ? '✅' : '❌'}`);
  console.log(`New (Fixed): Dare €${totalDareNew.toFixed(2)}, Avere €${totalAvereNew.toFixed(2)} → Bilanciato: ${Math.abs(totalDareNew - totalAvereNew) < 0.01 ? '✅' : '❌'}`);
  
  const oldBalanced = Math.abs(totalDareOld - totalAvereOld) < 0.01;
  const newBalanced = Math.abs(totalDareNew - totalAvereNew) < 0.01;
  const correctData = totalDareNew === totalDareExpected && totalAvereNew === totalAvereExpected;
  
  console.log('\n🏆 RISULTATO:');
  if (!oldBalanced && newBalanced && correctData) {
    console.log('✅ FIX SUCCESSFUL: Movimento ora bilanciato e dati corretti!');
    return true;
  } else {
    console.log('❌ FIX FAILED: Movimento ancora problematico');
    return false;
  }
}

// Esegui i test
if (require.main === module) {
  console.log('🚀 STARTING CURRENCY TRANSFORM VALIDATION\n');
  
  const basicTestsPass = runValidationTest();
  const movementTestPass = testProblematicMovement();
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 FINAL RESULT:');
  console.log(`Basic Tests: ${basicTestsPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Movement Test: ${movementTestPass ? '✅ PASS' : '❌ FAIL'}`);
  
  if (basicTestsPass && movementTestPass) {
    console.log('🎉 ALL VALIDATION PASSED - READY TO IMPLEMENT FIX!');
    process.exit(0);
  } else {
    console.log('💥 VALIDATION FAILED - FIX NEEDS REVIEW');
    process.exit(1);
  }
} 