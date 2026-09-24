export interface AirportTransitHub {
  iataCode: string;
  icaoCode: string;
  airportName: string;
  city: string;
  country: string;
  distanceToCenterKm: number;
  terminalCount: number;
  transportOptions: Array<{
    type: 'bus' | 'shuttle' | 'train' | 'taxi' | 'rideshare';
    name: string;
    estimatedCostLocal: string;
    durationMinutes: number;
    recommended: boolean;
    details: string;
  }>;
  safetyAdvice: string[];
  luggageStorageAvailable: boolean;
}

export class FlightTransitService {
  private readonly airportHubs: Record<string, AirportTransitHub> = {
    eze: {
      iataCode: 'EZE',
      icaoCode: 'SAEZ',
      airportName: 'Ministro Pistarini International Airport (Ezeiza)',
      city: 'Buenos Aires',
      country: 'Argentina',
      distanceToCenterKm: 32,
      terminalCount: 3,
      transportOptions: [
        {
          type: 'shuttle',
          name: 'Manuel Tienda Leon Airport Express',
          estimatedCostLocal: '12,500 ARS',
          durationMinutes: 50,
          recommended: true,
          details: 'Official direct coach service connecting to Puerto Madero terminal.'
        },
        {
          type: 'taxi',
          name: 'Official Taxi Ezeiza Counter',
          estimatedCostLocal: '35,000 ARS',
          durationMinutes: 45,
          recommended: true,
          details: 'Fixed-rate pre-paid taxi counter inside the arrivals hall. Do not accept unofficial curb touts.'
        },
        {
          type: 'bus',
          name: 'Colectivo Linea 8 Semirapido',
          estimatedCostLocal: '850 ARS',
          durationMinutes: 80,
          recommended: false,
          details: 'Budget city bus via highway, requires active SUBE card.'
        }
      ],
      safetyAdvice: [
        'Only hire taxis inside the authorized booths (Taxi Ezeiza or Remis) inside arrivals.',
        'Never follow unbadged drivers offering rides in the terminal exit corridor.'
      ],
      luggageStorageAvailable: true
    },
    aep: {
      iataCode: 'AEP',
      icaoCode: 'SABE',
      airportName: 'Aeroparque Jorge Newbery',
      city: 'Buenos Aires',
      country: 'Argentina',
      distanceToCenterKm: 6,
      terminalCount: 1,
      transportOptions: [
        {
          type: 'taxi',
          name: 'Totem de Taxis GCBA / Radio Taxi',
          estimatedCostLocal: '8,000 ARS',
          durationMinutes: 20,
          recommended: true,
          details: 'Print ticket with estimated fare at the municipal airport totem before boarding taxi.'
        },
        {
          type: 'bus',
          name: 'Colectivo Lineas 33, 37, 45, 160',
          estimatedCostLocal: '450 ARS',
          durationMinutes: 35,
          recommended: true,
          details: 'Frequent bus stops right in front of the terminal. SUBE card required.'
        }
      ],
      safetyAdvice: [
        'Located directly in the city along the Costanera. Secure zone with regular municipal transit police.'
      ],
      luggageStorageAvailable: false
    },
    cor: {
      iataCode: 'COR',
      icaoCode: 'SACO',
      airportName: 'Ingeniero Ambrosio Taravella International Airport',
      city: 'Cordoba',
      country: 'Argentina',
      distanceToCenterKm: 11,
      terminalCount: 1,
      transportOptions: [
        {
          type: 'bus',
          name: 'Aerobus Cordoba (ERSA Line 25)',
          estimatedCostLocal: '1,800 ARS',
          durationMinutes: 35,
          recommended: true,
          details: 'Direct airport-to-city center bus connecting to Terminal de Omnibus and Patio Olmos.'
        },
        {
          type: 'taxi',
          name: 'AutoCar Remises / Municipal Taxis',
          estimatedCostLocal: '14,000 ARS',
          durationMinutes: 25,
          recommended: true,
          details: 'Pre-paid ticket booth inside airport hall or official municipal taxi rank.'
        }
      ],
      safetyAdvice: [
        'Safe airport environment. RedBus card can be purchased and loaded at the airport newsstand.'
      ],
      luggageStorageAvailable: false
    },
    scl: {
      iataCode: 'SCL',
      icaoCode: 'SCEL',
      airportName: 'Arturo Merino Benitez International Airport',
      city: 'Santiago',
      country: 'Chile',
      distanceToCenterKm: 17,
      terminalCount: 2,
      transportOptions: [
        {
          type: 'shuttle',
          name: 'Centropuerto / Turbus Airport Coach',
          estimatedCostLocal: '2,200 CLP',
          durationMinutes: 35,
          recommended: true,
          details: 'Connects to Los Heroes and Pajaritos Metro stations every 10 minutes.'
        },
        {
          type: 'taxi',
          name: 'Taxi Oficial / TransVip',
          estimatedCostLocal: '25,000 CLP',
          durationMinutes: 30,
          recommended: true,
          details: 'Book at TransVip or Taxi Oficial counters before leaving baggage claim area.'
        }
      ],
      safetyAdvice: [
        'Refuse unauthorized drivers soliciting passengers in the terminal exit corridor.'
      ],
      luggageStorageAvailable: true
    }
  };

  public getAirportHub(iata: string): AirportTransitHub | undefined {
    return this.airportHubs[iata.toLowerCase()];
  }

  public getAllHubs(): AirportTransitHub[] {
    return Object.values(this.airportHubs);
  }
}
