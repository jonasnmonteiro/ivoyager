import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SignTranslatorService } from './sign-translator.service.js';

describe('SignTranslatorService (Offline Sign & Menu Translator)', () => {
  const service = new SignTranslatorService();

  it('translates exact traffic sign Pare into Portuguese and English', () => {
    const results = service.translateText('Pare');
    assert.ok(results.length > 0);
    const pare = results.find((r) => r.spanish === 'Pare');
    assert.ok(pare);
    assert.equal(pare?.english, 'Stop');
    assert.equal(pare?.confidence, 1.0);
  });

  it('translates complex traffic phrase Telepeaje and Ceda el paso', () => {
    const tollResults = service.translateText('Telepeaje');
    assert.ok(tollResults.length > 0);
    assert.equal(tollResults[0].category, 'traffic');

    const yieldResults = service.translateText('Ceda el paso');
    assert.ok(yieldResults.length > 0);
    assert.equal(yieldResults[0].english, 'Yield / Give Way');
  });

  it('handles fuzzy typos from noisy camera OCR recognition', () => {
    const fuzzyResults = service.translateText('Calzada resbaladsa');
    assert.ok(fuzzyResults.length > 0);
    assert.equal(fuzzyResults[0].spanish, 'Calzada resbaladiza');
    assert.ok(fuzzyResults[0].confidence >= 0.8);
  });

  it('translates dining terms such as Cubierto and Propina', () => {
    const cubierto = service.translateText('Cubierto');
    assert.ok(cubierto.length > 0);
    assert.equal(cubierto[0].category, 'dining');
    assert.ok(cubierto[0].explanation.includes('Cover Charge'));
  });

  it('retrieves full catalog of terms by category', () => {
    const trafficList = service.getTermsByCategory('traffic');
    assert.ok(trafficList.length >= 5);
    assert.ok(trafficList.some((t) => t.spanish === 'Contramano'));
  });
});
