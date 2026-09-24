import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FlightTransitService } from './flight-transit.service.js';

describe('FlightTransitService (Open Airport & Transit Hub Intelligence)', () => {
  const service = new FlightTransitService();

  it('retrieves detailed airport transit guide for Ezeiza (EZE)', () => {
    const hub = service.getAirportHub('eze');
    assert.ok(hub);
    assert.equal(hub?.iataCode, 'EZE');
    assert.equal(hub?.city, 'Buenos Aires');
    assert.ok(hub?.transportOptions.length >= 2);
    assert.ok(hub?.transportOptions.some((o) => o.name.includes('Manuel Tienda Leon')));
  });

  it('retrieves detailed transit guide for Cordoba Airport (COR)', () => {
    const hub = service.getAirportHub('cor');
    assert.ok(hub);
    assert.equal(hub?.iataCode, 'COR');
    assert.ok(hub?.transportOptions.some((o) => o.name.includes('Aerobus')));
  });

  it('lists all available international airport hubs', () => {
    const all = service.getAllHubs();
    assert.ok(all.length >= 4);
    assert.ok(all.some((h) => h.iataCode === 'SCL'));
    assert.ok(all.some((h) => h.iataCode === 'AEP'));
  });
});
