export interface FuelCalculationParams {
  distanceKm: number;
  consumptionLitersPer100Km?: number;
  fuelPricePerLiterLocal: number;
  exchangeRateToBrl: number;
}

export interface FuelCalculationResult {
  distanceKm: number;
  litersRequired: number;
  totalCostLocalCurrency: number;
  totalCostBrl: number;
  costPerKmBrl: number;
}

export interface CorridorTollInfo {
  corridorName: string;
  country: string;
  totalDistanceKm: number;
  tollPlazaCount: number;
  estimatedTollCostLocalCurrency: number;
  localCurrency: string;
  telepeajeTagCompatible: boolean;
}

export interface LodgingSpot {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'guest_house' | 'apartment';
  latitude: number;
  longitude: number;
  address?: string;
  distanceMeters?: number;
}

export class MobilityService {
  private readonly defaultConsumptionL100Km = 8.5;

  private readonly regionalCorridors: Record<string, CorridorTollInfo> = {
    bue_cor: {
      corridorName: 'Autopista Ruta 9 (Buenos Aires to Cordoba)',
      country: 'Argentina',
      totalDistanceKm: 700,
      tollPlazaCount: 4,
      estimatedTollCostLocalCurrency: 6000,
      localCurrency: 'ARS',
      telepeajeTagCompatible: true
    },
    bue_mdz: {
      corridorName: 'Ruta Nacional 7 (Buenos Aires to Mendoza)',
      country: 'Argentina',
      totalDistanceKm: 1050,
      tollPlazaCount: 6,
      estimatedTollCostLocalCurrency: 9500,
      localCurrency: 'ARS',
      telepeajeTagCompatible: true
    },
    bue_mdp: {
      corridorName: 'Autovia 2 (Buenos Aires to Mar del Plata)',
      country: 'Argentina',
      totalDistanceKm: 400,
      tollPlazaCount: 2,
      estimatedTollCostLocalCurrency: 4400,
      localCurrency: 'ARS',
      telepeajeTagCompatible: true
    },
    scl_vlp: {
      corridorName: 'Ruta 68 (Santiago to Valparaiso / Vina del Mar)',
      country: 'Chile',
      totalDistanceKm: 120,
      tollPlazaCount: 2,
      estimatedTollCostLocalCurrency: 7200,
      localCurrency: 'CLP',
      telepeajeTagCompatible: true
    }
  };

  public calculateFuelTrip(params: FuelCalculationParams): FuelCalculationResult {
    const consumption = params.consumptionLitersPer100Km || this.defaultConsumptionL100Km;
    const litersRequired = (params.distanceKm * consumption) / 100;
    const totalCostLocal = litersRequired * params.fuelPricePerLiterLocal;
    const totalCostBrl = params.exchangeRateToBrl > 0 ? totalCostLocal / params.exchangeRateToBrl : 0;
    const costPerKmBrl = params.distanceKm > 0 ? totalCostBrl / params.distanceKm : 0;

    return {
      distanceKm: Math.round(params.distanceKm * 10) / 10,
      litersRequired: Math.round(litersRequired * 100) / 100,
      totalCostLocalCurrency: Math.round(totalCostLocal * 100) / 100,
      totalCostBrl: Math.round(totalCostBrl * 100) / 100,
      costPerKmBrl: Math.round(costPerKmBrl * 1000) / 1000
    };
  }

  public getCorridorTolls(corridorKey: string): CorridorTollInfo | undefined {
    return this.regionalCorridors[corridorKey.toLowerCase()];
  }

  public getAllCorridors(): CorridorTollInfo[] {
    return Object.values(this.regionalCorridors);
  }

  public buildLodgingOverpassQuery(lat: number, lon: number, radiusMeters: number = 3000): string {
    return `[out:json][timeout:15];(node["tourism"~"hotel|hostel|guest_house|apartment"](around:${radiusMeters},${lat},${lon});node["amenity"~"taxi|fuel|bus_station"](around:${radiusMeters},${lat},${lon}););out body;>;out skel qt;`;
  }
}
