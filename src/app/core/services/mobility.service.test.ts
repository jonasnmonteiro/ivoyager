import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MobilityService } from './mobility.service.js';

describe('MobilityService (Fuel & Toll Calculation Engine)', () => {
  const service = new MobilityService();

  it('calculates fuel consumption and converted trip cost in BRL', () => {
    const result = service.calculateFuelTrip({
      distanceKm: 700,
      consumptionLitersPer100Km: 8.0,
      fuelPricePerLiterLocal: 1100,
      exchangeRateToBrl: 261.99
    });

    assert.equal(result.distanceKm, 700);
    assert.equal(result.litersRequired, 56);
    assert.equal(result.totalCostLocalCurrency, 61600);
    assert.ok(result.totalCostBrl > 200 && result.totalCostBrl < 300);
  });

  it('retrieves highway toll information for major travel corridors', () => {
    const corridor = service.getCorridorTolls('bue_cor');
    assert.ok(corridor);
    assert.equal(corridor?.country, 'Argentina');
    assert.equal(corridor?.tollPlazaCount, 4);
    assert.equal(corridor?.telepeajeTagCompatible, true);
  });

  it('generates valid Overpass query string for lodging and transport', () => {
    const query = service.buildLodgingOverpassQuery(-31.4167, -64.1833, 2500);
    assert.ok(query.includes('around:2500,-31.4167,-64.1833'));
    assert.ok(query.includes('tourism'));
    assert.ok(query.includes('amenity'));
  });
});
