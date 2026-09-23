import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FixedDecimal } from './fixed-decimal.js';

describe('FixedDecimal Mathematical Precision', () => {
  it('eliminates standard binary floating point errors (0.1 + 0.2 === 0.3)', () => {
    const a = FixedDecimal.from('0.1');
    const b = FixedDecimal.from('0.2');
    const sum = a.plus(b);

    assert.equal(sum.toString(), '0.3');
    assert.equal(sum.toNumber(), 0.3);
    assert.equal(sum.equals('0.3'), true);
  });

  it('performs exact multiplication and division without roundoff decay', () => {
    const base = FixedDecimal.from('100.55');
    const rate = FixedDecimal.from('5.4321');
    const multiplied = base.times(rate);
    
    assert.equal(multiplied.toFixed(4), '546.1977');

    const divided = multiplied.dividedBy(rate);
    assert.equal(divided.toFixed(2), '100.55');
  });

  it('calculates exact percentages', () => {
    const amount = FixedDecimal.from('5500.00');
    const spread = amount.percentOf('1.5');
    assert.equal(spread.toFixed(2), '82.50');

    const iof = FixedDecimal.from('5582.50').percentOf('1.1');
    assert.equal(iof.toFixed(2), '61.41');
  });

  it('handles rounding half-up correctly', () => {
    const val1 = FixedDecimal.from('10.555');
    assert.equal(val1.round(2).toString(), '10.56');

    const val2 = FixedDecimal.from('10.554');
    assert.equal(val2.round(2).toString(), '10.55');
  });

  it('formats currency strings properly', () => {
    const val = FixedDecimal.from('1234.56');
    const formatted = val.formatCurrency('BRL', 'pt-BR');
    assert.ok(formatted.includes('1.234,56') || formatted.includes('1234,56'));
  });

  it('correctly handles comparison operations', () => {
    const low = FixedDecimal.from('5.15');
    const high = FixedDecimal.from('5.80');
    const equalToLow = FixedDecimal.from('5.1500');

    assert.equal(low.lessThan(high), true);
    assert.equal(high.greaterThan(low), true);
    assert.equal(low.equals(equalToLow), true);
  });
});
