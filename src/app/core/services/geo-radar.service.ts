import { ExchangeSpot, GeoCoordinates, ReverseGeocodeResult, SpotType } from '../models/geo.model.js';

export interface OverpassElement {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export class GeoRadarService {
  public calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadiusMeters = 6371000;
    const toRadians = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusMeters * c);
  }

  public buildOverpassQuery(lat: number, lon: number, radiusMeters: number = 2500): string {
    return `[out:json][timeout:15];(node["amenity"="bureau_de_change"](around:${radiusMeters},${lat},${lon});node["name"~"Western Union|MoneyGram|Câmbio|Cambio|Exchange"](around:${radiusMeters},${lat},${lon});node["amenity"="bank"]["atm"="yes"](around:${radiusMeters},${lat},${lon}););out body;>;out skel qt;`;
  }

  public parseOverpassElements(elements: OverpassElement[], userCoords: GeoCoordinates): ExchangeSpot[] {
    const spots: ExchangeSpot[] = [];

    for (const el of elements) {
      if (!el.lat || !el.lon) continue;

      const tags = el.tags || {};
      const name = tags.name || tags.operator || tags.brand || 'Exchange Spot';
      const address = tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`.trim() : 'Local Address';
      const city = tags['addr:city'] || 'City Center';
      const country = tags['addr:country'] || '';

      let type: SpotType = 'bureau_de_change';
      if (tags.amenity === 'atm' || tags.atm === 'yes') {
        type = 'atm';
      } else if (tags.amenity === 'bank') {
        type = 'bank';
      } else if (name.toLowerCase().includes('western union')) {
        type = 'western_union';
      }

      const distanceMeters = this.calculateDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        el.lat,
        el.lon
      );

      spots.push({
        id: `osm-${el.id}`,
        name,
        latitude: el.lat,
        longitude: el.lon,
        address,
        city,
        country,
        distanceMeters,
        type,
        operator: tags.operator || tags.brand,
        openingHours: tags.opening_hours
      });
    }

    spots.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return spots;
  }

  public getOfflineCityPack(cityCode: string, userCoords?: GeoCoordinates): ExchangeSpot[] {
    const cityDatabase: Record<string, Omit<ExchangeSpot, 'distanceMeters'>[]> = {
      bue: [
        {
          id: 'bue-1',
          name: 'Banco Piano Casa Central (Cambio)',
          latitude: -34.6042,
          longitude: -58.3732,
          address: 'San Martín 345',
          city: 'Buenos Aires',
          country: 'Argentina',
          type: 'bureau_de_change',
          operator: 'Banco Piano'
        },
        {
          id: 'bue-2',
          name: 'Western Union Florida Central',
          latitude: -34.6035,
          longitude: -58.3758,
          address: 'Calle Florida 520',
          city: 'Buenos Aires',
          country: 'Argentina',
          type: 'western_union'
        },
        {
          id: 'bue-3',
          name: 'Casa de Cambio Puente',
          latitude: -34.6028,
          longitude: -58.3741,
          address: 'Sarmiento 448',
          city: 'Buenos Aires',
          country: 'Argentina',
          type: 'bureau_de_change'
        }
      ],
      scl: [
        {
          id: 'scl-1',
          name: 'AFEX Casa de Cambio Agustinas',
          latitude: -33.4402,
          longitude: -70.6515,
          address: 'Calle Agustinas 1050',
          city: 'Santiago',
          country: 'Chile',
          type: 'bureau_de_change'
        },
        {
          id: 'scl-2',
          name: 'Western Union Moneda',
          latitude: -33.4418,
          longitude: -70.6528,
          address: 'Calle Moneda 1140',
          city: 'Santiago',
          country: 'Chile',
          type: 'western_union'
        }
      ],
      cor: [
        {
          id: 'cor-1',
          name: 'Cambio Barujel Cordoba',
          latitude: -31.4168,
          longitude: -64.1825,
          address: 'San Jeronimo 281',
          city: 'Cordoba',
          country: 'Argentina',
          type: 'bureau_de_change'
        },
        {
          id: 'cor-2',
          name: 'Western Union Peatonal 9 de Julio',
          latitude: -31.4145,
          longitude: -64.1848,
          address: '9 de Julio 150',
          city: 'Cordoba',
          country: 'Argentina',
          type: 'western_union'
        },
        {
          id: 'cor-3',
          name: 'Exprinter Casa de Cambio',
          latitude: -31.4158,
          longitude: -64.1832,
          address: 'Rivadavia 45',
          city: 'Cordoba',
          country: 'Argentina',
          type: 'bureau_de_change'
        }
      ]
    };

    const rawList = cityDatabase[cityCode.toLowerCase()] || [];
    const baseLat = userCoords?.latitude ?? (cityCode === 'bue' ? -34.6037 : cityCode === 'cor' ? -31.4167 : -33.4400);
    const baseLon = userCoords?.longitude ?? (cityCode === 'bue' ? -58.3816 : cityCode === 'cor' ? -64.1833 : -70.6500);

    return rawList.map(spot => ({
      ...spot,
      distanceMeters: this.calculateDistanceMeters(baseLat, baseLon, spot.latitude, spot.longitude)
    })).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
}
