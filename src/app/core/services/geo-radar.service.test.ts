import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GeoRadarService, OverpassElement } from './geo-radar.service.js';

describe('Block 5: GeoRadarService (OpenStreetMap Radar & Haversine Math)', () => {
  const service = new GeoRadarService();

  it('calculates exact Haversine distance between two coordinates', () => {
    const obeliskBue = { lat: -34.6037, lon: -58.3816 };
    const casaRosadaBue = { lat: -34.6080, lon: -58.3703 };

    const distanceMeters = service.calculateDistanceMeters(
      obeliskBue.lat,
      obeliskBue.lon,
      casaRosadaBue.lat,
      casaRosadaBue.lon
    );

    assert.ok(distanceMeters > 1000 && distanceMeters < 1500);
  });

  it('builds a valid Overpass QL query string with radius filter', () => {
    const query = service.buildOverpassQuery(-34.6037, -58.3816, 2000);
    assert.ok(query.includes('amenity"="bureau_de_change'));
    assert.ok(query.includes('around:2000,-34.6037,-58.3816'));
    assert.ok(query.includes('out body'));
  });

  it('parses Overpass API elements and sorts them by proximity to user', () => {
    const userCoords = { latitude: -34.6037, longitude: -58.3816 };
    const mockElements: OverpassElement[] = [
      {
        id: 101,
        type: 'node',
        lat: -34.6100,
        lon: -58.3900,
        tags: { name: 'Far Away Exchange', amenity: 'bureau_de_change' }
      },
      {
        id: 102,
        type: 'node',
        lat: -34.6040,
        lon: -58.3820,
        tags: { name: 'Close Western Union', amenity: 'bureau_de_change', brand: 'Western Union' }
      }
    ];

    const spots = service.parseOverpassElements(mockElements, userCoords);
    assert.equal(spots.length, 2);
    assert.equal(spots[0].id, 'osm-102');
    assert.equal(spots[0].type, 'western_union');
    assert.ok(spots[0].distanceMeters < spots[1].distanceMeters);
  });

  it('loads offline city packs with calculated distances', () => {
    const userCoords = { latitude: -34.6037, longitude: -58.3816 };
    const bueSpots = service.getOfflineCityPack('bue', userCoords);

    assert.ok(bueSpots.length >= 2);
    assert.ok(bueSpots[0].distanceMeters >= 0);
    assert.equal(bueSpots[0].city, 'Buenos Aires');
  });
});
