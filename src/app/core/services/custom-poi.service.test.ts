import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CustomPoiService } from './custom-poi.service.js';

describe('Block 9: CustomPoiService (User POI Dropper & GeoJSON Export)', () => {
  const service = new CustomPoiService();

  it('creates and retrieves custom points of interest', async () => {
    const poi = await service.createPoi({
      name: 'San Telmo Market',
      category: 'shopping',
      latitude: -34.6198,
      longitude: -58.3712,
      address: 'Defensa 961, San Telmo',
      notes: 'Antique flea market on Sundays'
    });

    assert.ok(poi.id.startsWith('poi-'));
    assert.equal(poi.name, 'San Telmo Market');
    assert.equal(poi.category, 'shopping');

    const retrieved = await service.getPoiById(poi.id);
    assert.ok(retrieved);
    assert.equal(retrieved?.name, 'San Telmo Market');
  });

  it('updates an existing custom point of interest', async () => {
    const poi = await service.createPoi({
      name: 'Cafe Tortoni',
      category: 'restaurant',
      latitude: -34.6085,
      longitude: -58.3793,
      notes: 'Historic coffee shop'
    });

    const updated = await service.updatePoi(poi.id, {
      notes: 'Historic coffee shop, must try churros con chocolate'
    });

    assert.ok(updated);
    assert.equal(updated?.notes, 'Historic coffee shop, must try churros con chocolate');
  });

  it('filters custom points of interest by geographic proximity', async () => {
    const userLocation = { latitude: -34.6037, longitude: -58.3816 };

    await service.createPoi({
      name: 'Teatro Colon',
      category: 'attraction',
      latitude: -34.6011,
      longitude: -58.3831
    });

    await service.createPoi({
      name: 'La Bombonera',
      category: 'attraction',
      latitude: -34.6356,
      longitude: -58.3648
    });

    const nearbyWithin1Km = await service.getPoisNearLocation(
      userLocation.latitude,
      userLocation.longitude,
      1000
    );

    const colonFound = nearbyWithin1Km.find((p) => p.name === 'Teatro Colon');
    assert.ok(colonFound);
    assert.ok(colonFound.distanceMeters < 1000);

    const bomboneraFound = nearbyWithin1Km.find((p) => p.name === 'La Bombonera');
    assert.equal(bomboneraFound, undefined);
  });

  it('exports all custom points of interest to valid GeoJSON FeatureCollection', async () => {
    const geoJson = (await service.exportGeoJson()) as {
      type: string;
      features: Array<{
        type: string;
        geometry: { type: string; coordinates: [number, number] };
        properties: { name: string; category: string };
      }>;
    };

    assert.equal(geoJson.type, 'FeatureCollection');
    assert.ok(geoJson.features.length >= 2);
    assert.equal(geoJson.features[0].type, 'Feature');
    assert.equal(geoJson.features[0].geometry.type, 'Point');
    assert.equal(typeof geoJson.features[0].geometry.coordinates[0], 'number');
    assert.equal(typeof geoJson.features[0].geometry.coordinates[1], 'number');
  });

  it('deletes a custom point of interest', async () => {
    const poi = await service.createPoi({
      name: 'Temporary Point',
      category: 'other',
      latitude: -34.6000,
      longitude: -58.3800
    });

    const deleted = await service.deletePoi(poi.id);
    assert.equal(deleted, true);

    const check = await service.getPoiById(poi.id);
    assert.equal(check, undefined);
  });
});
