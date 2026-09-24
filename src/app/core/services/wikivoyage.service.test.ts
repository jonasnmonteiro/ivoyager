import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WikivoyageService } from './wikivoyage.service.js';

describe('WikivoyageService (Open Community Travel Guide)', () => {
  const service = new WikivoyageService();

  it('retrieves pre-compiled offline city guide for Cordoba', () => {
    const guide = service.getOfflineGuide('cordoba');
    assert.ok(guide);
    assert.equal(guide?.cityName, 'Cordoba');
    assert.equal(guide?.country, 'Argentina');
    assert.ok(guide?.sections.length >= 3);
    assert.ok(guide?.safetyTips.length >= 2);
    assert.ok(guide?.localScams.length >= 1);
    assert.equal(guide?.emergencyContacts.police, '911');
  });

  it('retrieves pre-compiled offline city guide for Buenos Aires', () => {
    const guide = service.getOfflineGuide('buenos_aires');
    assert.ok(guide);
    assert.equal(guide?.cityName, 'Buenos Aires');
    assert.ok(guide?.sections.some((s) => s.title === 'Eat & Drink'));
  });

  it('lists all available offline destination guides', () => {
    const cities = service.getAllAvailableCities();
    assert.ok(cities.length >= 4);
    assert.ok(cities.some((c) => c.id === 'cordoba'));
    assert.ok(cities.some((c) => c.id === 'santiago'));
  });

  it('returns undefined for non-existent city', () => {
    const guide = service.getOfflineGuide('non_existent_city_xyz');
    assert.equal(guide, undefined);
  });
});
