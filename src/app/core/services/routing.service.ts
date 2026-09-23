import { GeoCoordinates } from '../models/geo.model.js';

export interface RouteStep {
  distanceMeters: number;
  durationMinutes: number;
  geometryCoords: [number, number][];
  mode: 'walking' | 'driving';
}

export interface NavigationLinks {
  googleMaps: string;
  appleMaps: string;
  waze: string;
}

export class RoutingService {
  private readonly defaultWalkingSpeedKmh: number = 4.5;
  private readonly defaultDrivingSpeedKmh: number = 25.0;

  public calculateWalkingDurationMinutes(distanceMeters: number, walkingSpeedKmh: number = this.defaultWalkingSpeedKmh): number {
    if (distanceMeters <= 0 || walkingSpeedKmh <= 0) return 0;
    const speedMetersPerMinute = (walkingSpeedKmh * 1000) / 60;
    return Math.max(1, Math.round(distanceMeters / speedMetersPerMinute));
  }

  public calculateDrivingDurationMinutes(distanceMeters: number, drivingSpeedKmh: number = this.defaultDrivingSpeedKmh): number {
    if (distanceMeters <= 0 || drivingSpeedKmh <= 0) return 0;
    const speedMetersPerMinute = (drivingSpeedKmh * 1000) / 60;
    return Math.max(1, Math.round(distanceMeters / speedMetersPerMinute));
  }

  public generateNavigationLinks(origin: GeoCoordinates, destination: GeoCoordinates, destinationName?: string): NavigationLinks {
    const encodedName = destinationName ? encodeURIComponent(destinationName) : '';
    return {
      googleMaps: `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=walking`,
      appleMaps: `https://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=w${encodedName ? `&q=${encodedName}` : ''}`,
      waze: `https://waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes`
    };
  }

  public buildOsrmWalkingUrl(origin: GeoCoordinates, destination: GeoCoordinates): string {
    return `https://router.project-osrm.org/route/v1/walking/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
  }

  public async fetchRoute(origin: GeoCoordinates, destination: GeoCoordinates): Promise<RouteStep> {
    const fallbackDistance = this.calculateHaversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
    const fallbackDuration = this.calculateWalkingDurationMinutes(fallbackDistance);

    try {
      const url = this.buildOsrmWalkingUrl(origin, destination);
      const response = await fetch(url);
      if (!response.ok) {
        return {
          distanceMeters: fallbackDistance,
          durationMinutes: fallbackDuration,
          geometryCoords: [
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude]
          ],
          mode: 'walking'
        };
      }

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        return {
          distanceMeters: fallbackDistance,
          durationMinutes: fallbackDuration,
          geometryCoords: [
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude]
          ],
          mode: 'walking'
        };
      }

      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

      return {
        distanceMeters: Math.round(route.distance),
        durationMinutes: Math.max(1, Math.round(route.duration / 60)),
        geometryCoords: coords,
        mode: 'walking'
      };
    } catch {
      return {
        distanceMeters: fallbackDistance,
        durationMinutes: fallbackDuration,
        geometryCoords: [
          [origin.latitude, origin.longitude],
          [destination.latitude, destination.longitude]
        ],
        mode: 'walking'
      };
    }
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }
}
