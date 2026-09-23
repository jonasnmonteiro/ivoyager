import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RoutingService } from './routing.service.js';

describe('Block 8: RoutingService (OSRM Walking Routes & Deep Navigation)', () => {
  const service = new RoutingService();

  it('calculates walking and driving durations correctly', () => {
    const walkingDuration = service.calculateWalkingDurationMinutes(900);
    assert.equal(walkingDuration, 12);

    const zeroDuration = service.calculateWalkingDurationMinutes(0);
    assert.equal(zeroDuration, 0);

    const drivingDuration = service.calculateDrivingDurationMinutes(5000);
    assert.equal(drivingDuration, 12);
  });

  it('generates universal navigation deep links for Google Maps, Apple Maps, and Waze', () => {
    const origin = { latitude: -34.6037, longitude: -58.3816 };
    const destination = { latitude: -34.608, longitude: -58.3703 };
    const links = service.generateNavigationLinks(origin, destination, 'Casa Rosada');

    assert.ok(links.googleMaps.includes('origin=-34.6037,-58.3816'));
    assert.ok(links.googleMaps.includes('destination=-34.608,-58.3703'));
    assert.ok(links.googleMaps.includes('travelmode=walking'));

    assert.ok(links.appleMaps.includes('saddr=-34.6037,-58.3816'));
    assert.ok(links.appleMaps.includes('daddr=-34.608,-58.3703'));
    assert.ok(links.appleMaps.includes('dirflg=w'));
    assert.ok(links.appleMaps.includes('q=Casa%20Rosada'));

    assert.ok(links.waze.includes('ll=-34.608,-58.3703'));
    assert.ok(links.waze.includes('navigate=yes'));
  });

  it('builds a valid OSRM walking routing URL', () => {
    const origin = { latitude: -34.6037, longitude: -58.3816 };
    const destination = { latitude: -34.608, longitude: -58.3703 };
    const url = service.buildOsrmWalkingUrl(origin, destination);

    assert.ok(url.startsWith('https://router.project-osrm.org/route/v1/walking/'));
    assert.ok(url.includes('-58.3816,-34.6037;-58.3703,-34.608'));
    assert.ok(url.includes('overview=full&geometries=geojson'));
  });

  it('provides geodesic fallback when network is unavailable', async () => {
    const origin = { latitude: -34.6037, longitude: -58.3816 };
    const destination = { latitude: -34.608, longitude: -58.3703 };

    const route = await service.fetchRoute(origin, destination);
    assert.ok(route.distanceMeters > 0);
    assert.ok(route.durationMinutes > 0);
    assert.equal(route.mode, 'walking');
    assert.ok(route.geometryCoords.length >= 2);
  });
});
