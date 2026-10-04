const assert = require('assert');
const { calculateSwitch } = require('../calc-engine.js');

console.log('🧪 Running Switch PZU-ID Calculation Tests...');

// 1. Test Cumpărare (BUY PZU → ID) from Excel row 4-14
const buyCase = calculateSwitch({
  mode: 'BUY',
  pzuPrice: 155,
  idClosePrice: 153,
  idNewPrice: 40,
  interval: '60m',
  quantityMw: 20
});

assert.strictEqual(buyCase.spreadClose, -2, 'BUY Spread închidere should be -2');
assert.strictEqual(buyCase.netBenefit, 113, 'BUY Beneficiu net switch should be 113');
assert.strictEqual(buyCase.effectivePrice, 42, 'BUY Preț efectiv should be 42');
assert.strictEqual(buyCase.energyMwh, 20, 'BUY Energie aferentă should be 20 MWh');
assert.strictEqual(buyCase.finalGainEur, 2260, 'BUY Câștig final should be 2260 €');
console.log('✅ BUY Case PASSED (2260 €)');

// 2. Test Vânzare (SELL PZU → ID) from Excel row 4-14
const sellCase = calculateSwitch({
  mode: 'SELL',
  pzuPrice: 200.69,
  idClosePrice: 350,
  idNewPrice: 425,
  interval: '15m',
  quantityMw: 5
});

assert.strictEqual(sellCase.spreadClose, -149.31, 'SELL Spread închidere should be -149.31');
assert.strictEqual(sellCase.netBenefit, 75, 'SELL Beneficiu net switch should be 75');
assert.strictEqual(sellCase.effectivePrice, 275.69, 'SELL Preț efectiv should be 275.69');
assert.strictEqual(sellCase.energyMwh, 1.25, 'SELL Energie aferentă should be 1.25 MWh');
assert.strictEqual(sellCase.finalGainEur, 93.75, 'SELL Câștig final should be 93.75 €');
console.log('✅ SELL Case PASSED (93.75 €)');

console.log('🎉 All Excel calculation vectors verified with 100% precision!');
