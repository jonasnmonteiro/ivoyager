import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VETCalculatorService } from './vet-calculator.service.js';
import { PAYMENT_METHOD_PRESETS } from '../models/payment-method.model.js';

describe('VETCalculatorService (Effective Total Value Engine)', () => {
  const service = new VETCalculatorService();

  it('calculates exact VET for Global Digital Account (Nomad/Wise)', () => {
    const result = service.calculateVET({
      foreignAmount: '1000.00',
      baseExchangeRate: '5.50',
      foreignCurrencyCode: 'USD',
      paymentMethod: PAYMENT_METHOD_PRESETS.global_account
    });

    assert.equal(result.grossBrl.toFixed(2), '5500.00');
    assert.equal(result.spreadPercent.toFixed(2), '1.50');
    assert.equal(result.spreadAmountBrl.toFixed(2), '82.50');
    assert.equal(result.subtotalWithSpreadBrl.toFixed(2), '5582.50');
    assert.equal(result.iofPercent.toFixed(2), '1.10');
    assert.equal(result.iofAmountBrl.toFixed(2), '61.41');
    assert.equal(result.totalCostBrl.toFixed(2), '5643.91');
    assert.equal(result.effectiveRate.toFixed(4), '5.6439');
    assert.equal(result.effectiveTaxRatePercent.toFixed(2), '2.62');
  });

  it('calculates exact VET for Traditional International Credit Card', () => {
    const result = service.calculateVET({
      foreignAmount: '1000.00',
      baseExchangeRate: '5.50',
      foreignCurrencyCode: 'USD',
      paymentMethod: PAYMENT_METHOD_PRESETS.credit_card
    });

    assert.equal(result.grossBrl.toFixed(2), '5500.00');
    assert.equal(result.spreadPercent.toFixed(2), '4.50');
    assert.equal(result.spreadAmountBrl.toFixed(2), '247.50');
    assert.equal(result.subtotalWithSpreadBrl.toFixed(2), '5747.50');
    assert.equal(result.iofPercent.toFixed(2), '4.38');
    assert.equal(result.iofAmountBrl.toFixed(2), '251.74');
    assert.equal(result.totalCostBrl.toFixed(2), '5999.24');
    assert.equal(result.effectiveRate.toFixed(4), '5.9992');
    assert.equal(result.effectiveTaxRatePercent.toFixed(2), '9.08');
  });

  it('accurately compares all instruments and calculates net savings', () => {
    const comparison = service.compareAll('1000.00', '5.50', 'USD', 'BRL');

    assert.equal(comparison.results.length, 4);
    assert.equal(comparison.bestOption.paymentMethod.type, 'crypto_p2p');
    assert.equal(comparison.worstOption.paymentMethod.type, 'credit_card');

    const globalAccountResult = comparison.results.find(r => r.paymentMethod.type === 'global_account');
    const creditCardResult = comparison.results.find(r => r.paymentMethod.type === 'credit_card');

    assert.ok(globalAccountResult);
    assert.ok(creditCardResult);

    const savingsVsCreditCard = creditCardResult.totalCostBrl.minus(globalAccountResult.totalCostBrl);
    assert.equal(savingsVsCreditCard.toFixed(2), '355.33');
  });

  it('supports custom override for bank spread and IOF rates', () => {
    const result = service.calculateVET({
      foreignAmount: '500.00',
      baseExchangeRate: '6.00',
      foreignCurrencyCode: 'EUR',
      paymentMethod: PAYMENT_METHOD_PRESETS.credit_card,
      customSpreadPercent: 2.0,
      customIofPercent: 1.1
    });

    assert.equal(result.grossBrl.toFixed(2), '3000.00');
    assert.equal(result.spreadAmountBrl.toFixed(2), '60.00');
    assert.equal(result.subtotalWithSpreadBrl.toFixed(2), '3060.00');
    assert.equal(result.iofAmountBrl.toFixed(2), '33.66');
    assert.equal(result.totalCostBrl.toFixed(2), '3093.66');
  });
});
