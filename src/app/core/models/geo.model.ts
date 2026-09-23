export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type SpotType = 'bureau_de_change' | 'western_union' | 'bank' | 'atm';

export interface ExchangeSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  distanceMeters: number;
  type: SpotType;
  operator?: string;
  openingHours?: string;
}

export interface ReverseGeocodeResult {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  displayName: string;
}
