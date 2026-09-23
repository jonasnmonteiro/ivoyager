import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ExchangeRateService } from './exchange-rate.service.js';

describe('ExchangeRateService (Multi-Currency & Cross-Rates)', () => {
  const service = new ExchangeRateService();

  service.setRateInMemory({
    id: 'USD-BRL-official',
    from: 'USD',
    to: 'BRL',
    type: 'official',
    buy: 5.48,
    sell: 5.50,
    source: 'CentralBank',
    updatedAt: Date.now()
  });

  service.setRateInMemory({
    id: 'EUR-BRL-official',
    from: 'EUR',
    to: 'BRL',
    type: 'official',
    buy: 5.98,
    sell: 6.00,
    source: 'CentralBank',
    updatedAt: Date.now()
  });

  service.setRateInMemory({
    id: 'ARS-BRL-official',
    from: 'ARS',
    to: 'BRL',
    type: 'official',
    buy: 0.0055,
    sell: 0.0057,
    source: 'DolarAPI',
    updatedAt: Date.now()
  });

  service.setRateInMemory({
    id: 'USD-ARS-blue',
    from: 'USD',
    to: 'ARS',
    type: 'blue',
    buy: 1350,
    sell: 1380,
    source: 'DolarAPI',
    updatedAt: Date.now()
  });

  it('converts same currency with 1.0 multiplier', async () => {
    const result = await service.convert('150.00', 'BRL', 'BRL');
    assert.equal(result.convertedAmount.toFixed(2), '150.00');
    assert.equal(result.rateUsed.toNumber(), 1.0);
  });

  it('converts direct currency pair (USD to BRL)', async () => {
    const result = await service.convert('100.00', 'USD', 'BRL', 'official');
    assert.equal(result.convertedAmount.toFixed(2), '550.00');
  });

  it('converts parallel market rate (USD to ARS Blue)', async () => {
    const result = await service.convert('50.00', 'USD', 'ARS', 'blue');
    assert.equal(result.convertedAmount.toFixed(2), '69000.00');
  });

  it('calculates cross-rates via BRL base (EUR to ARS official)', async () => {
    const result = await service.convert('10.00', 'EUR', 'ARS', 'official');
    assert.ok(result.convertedAmount.greaterThan(0));
  });
});
