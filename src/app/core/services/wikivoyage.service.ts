export interface CityGuideSection {
  title: string;
  content: string;
}

export interface CityTravelGuide {
  cityId: string;
  cityName: string;
  country: string;
  summary: string;
  sections: CityGuideSection[];
  safetyTips: string[];
  localScams: string[];
  emergencyContacts: Record<string, string>;
  updatedAt: number;
}

export class WikivoyageService {
  private readonly offlinePacks: Record<string, CityTravelGuide> = {
    cordoba: {
      cityId: 'cordoba',
      cityName: 'Cordoba',
      country: 'Argentina',
      summary: 'Argentinas second-largest city, known for its colonial Jesuit architecture, vibrant student population, and surrounding Sierras.',
      sections: [
        {
          title: 'Understand',
          content: 'Founded in 1573, Cordoba is a major cultural and educational center. The historic Jesuit Block (Manzana Jesuítica) is a UNESCO World Heritage Site.'
        },
        {
          title: 'Get around',
          content: 'Public transit uses the RedBus contactless card, purchasable at kiosks. Taxis and remises are widely available and metered.'
        },
        {
          title: 'See & Do',
          content: 'Visit Plaza San Martin, the historic Cathedral, Paseo del Buen Pastor in Nueva Cordoba, and the artisan fair in Guemes on weekends.'
        },
        {
          title: 'Eat & Drink',
          content: 'Traditional Argentine asado, empanadas cordobesas (with sweet raisins and sugar crust), and the signature Fernet with Coca-Cola.'
        }
      ],
      safetyTips: [
        'Keep valuables concealed in crowded peatonal walkways around 9 de Julio.',
        'Avoid desolate streets in the immediate vicinity of the Rio Suquia after dark.',
        'Use radio-taxis or registered remises at night.'
      ],
      localScams: [
        'Mustard or ketchup spill distraction scam in central plazas.',
        'Counterfeit 1000 and 2000 ARS banknotes given as change by informal vendors.'
      ],
      emergencyContacts: {
        police: '911',
        ambulance: '107 (SAME)',
        touristPolice: '+54 351 434-2121'
      },
      updatedAt: Date.now()
    },
    buenos_aires: {
      cityId: 'buenos_aires',
      cityName: 'Buenos Aires',
      country: 'Argentina',
      summary: 'The cosmopolitan capital of Argentina, renowned for European architecture, rich tango heritage, and world-class culinary scenes.',
      sections: [
        {
          title: 'Understand',
          content: 'Buenos Aires is organized into 48 distinct barrios. Key tourist areas include Microcentro, San Telmo, Recoleta, and Palermo.'
        },
        {
          title: 'Get around',
          content: 'The Subte (subway) and extensive Colectivo (bus) network operate with the SUBE card. Taxis are black and yellow.'
        },
        {
          title: 'See & Do',
          content: 'Teatro Colon, Casa Rosada, Recoleta Cemetery, MALBA museum, and San Telmo Sunday antique market.'
        },
        {
          title: 'Eat & Drink',
          content: 'Steak at traditional parrillas (bife de chorizo, entraña), pizza de muzzarella along Av. Corrientes, and helado artesanal.'
        }
      ],
      safetyTips: [
        'Be alert for motorchorros (motorbike thieves) snatching phones near curbs.',
        'Avoid visiting La Boca outside the guarded Caminito tourist perimeter.',
        'Do not exhibit high-end jewelry or watches in crowded subway stations.'
      ],
      localScams: [
        'Fake currency exchange offers on Calle Florida ("arbolitos" distributing counterfeit notes).',
        'Taxi meter rigging or deliberately taking circuitous routes from Ezeiza airport.'
      ],
      emergencyContacts: {
        police: '911',
        ambulance: '107',
        touristPolice: '+54 11 4346-5748'
      },
      updatedAt: Date.now()
    },
    mendoza: {
      cityId: 'mendoza',
      cityName: 'Mendoza',
      country: 'Argentina',
      summary: 'The heart of Argentinas wine country, located at the foothills of the Andes mountain range.',
      sections: [
        {
          title: 'Understand',
          content: 'Famous for Malbec vineyards, tree-lined irrigation canals (acequias), and proximity to Mount Aconcagua.'
        },
        {
          title: 'Get around',
          content: 'Trolleybuses, metrotranvia, and standard buses use the SUBE card. Biking is popular for bodega tours in Maipu and Lujan de Cuyo.'
        }
      ],
      safetyTips: [
        'Be cautious walking along unlit acequias at night to prevent falls.',
        'Keep belongings secure around the Parque General San Martin perimeter.'
      ],
      localScams: [
        'Unlicensed wine tour operators charging inflated prices with low-grade tastings.'
      ],
      emergencyContacts: {
        police: '911',
        ambulance: '107',
        touristPolice: '+54 261 413-2135'
      },
      updatedAt: Date.now()
    },
    santiago: {
      cityId: 'santiago',
      cityName: 'Santiago',
      country: 'Chile',
      summary: 'The vibrant capital of Chile nestled in a valley surrounded by the snow-capped Andes and Chilean Coastal Range.',
      sections: [
        {
          title: 'Understand',
          content: 'A modern South American financial hub with distinct neighborhoods including Lastarria, Bellavista, and Providencia.'
        },
        {
          title: 'Get around',
          content: 'The modern Metro de Santiago network requires a contactless Bip! card.'
        }
      ],
      safetyTips: [
        'Stay alert in crowded areas around Plaza de Armas and Mercado Central.',
        'Use registered airport transfers (Centropuerto bus or official taxi counter) from SCL.'
      ],
      localScams: [
        'Fake taxi drivers altering card payment terminal values at the airport.'
      ],
      emergencyContacts: {
        police: '133 (Carabineros)',
        ambulance: '131',
        fire: '132'
      },
      updatedAt: Date.now()
    }
  };

  public getOfflineGuide(cityId: string): CityTravelGuide | undefined {
    return this.offlinePacks[cityId.toLowerCase()];
  }

  public getAllAvailableCities(): Array<{ id: string; name: string; country: string }> {
    return Object.values(this.offlinePacks).map((guide) => ({
      id: guide.cityId,
      name: guide.cityName,
      country: guide.country
    }));
  }

  public async fetchWikivoyageSummary(title: string): Promise<{ title: string; extract: string } | null> {
    const encodedTitle = encodeURIComponent(title.replace(/\s+/g, '_'));
    const url = `https://en.wikivoyage.org/api/rest_v1/page/summary/${encodedTitle}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        title: data.title || title,
        extract: data.extract || ''
      };
    } catch {
      return null;
    }
  }
}
