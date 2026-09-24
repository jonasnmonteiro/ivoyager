export interface TranslatedTerm {
  original: string;
  category: 'traffic' | 'transit' | 'dining' | 'emergency' | 'general';
  spanish: string;
  portuguese: string;
  english: string;
  explanation: string;
  confidence: number;
}

export class SignTranslatorService {
  private readonly lexicon: Array<Omit<TranslatedTerm, 'original' | 'confidence'>> = [
    {
      category: 'traffic',
      spanish: 'Pare',
      portuguese: 'Pare (Parada Obrigatória)',
      english: 'Stop',
      explanation: 'Mandatory full vehicle stop at junction or intersection.'
    },
    {
      category: 'traffic',
      spanish: 'Ceda el paso',
      portuguese: 'Dê a preferência',
      english: 'Yield / Give Way',
      explanation: 'Slow down and yield right of way to vehicles on the crossing road.'
    },
    {
      category: 'traffic',
      spanish: 'Telepeaje',
      portuguese: 'Pedágio Automático (Sem Parar / Tag)',
      english: 'Electronic Toll Collection (RFID Tag)',
      explanation: 'Automatic toll lane reserved for vehicles with active electronic RFID windshield tags.'
    },
    {
      category: 'traffic',
      spanish: 'Peaje',
      portuguese: 'Pedágio',
      english: 'Toll Booth',
      explanation: 'Highway toll payment plaza.'
    },
    {
      category: 'traffic',
      spanish: 'Calzada resbaladiza',
      portuguese: 'Pista escorregadia',
      english: 'Slippery Road Surface',
      explanation: 'Warning of reduced tire traction, common in rain, ice, or loose gravel.'
    },
    {
      category: 'traffic',
      spanish: 'Contramano',
      portuguese: 'Contramão (Sentido Proibido)',
      english: 'Wrong Way / No Entry',
      explanation: 'One-way street in the opposite direction. Do not enter.'
    },
    {
      category: 'traffic',
      spanish: 'Velocidad máxima',
      portuguese: 'Velocidade máxima permitida',
      english: 'Maximum Speed Limit',
      explanation: 'Maximum legal speed in kilometers per hour (km/h).'
    },
    {
      category: 'traffic',
      spanish: 'Prohibido estacionar',
      portuguese: 'Proibido estacionar',
      english: 'No Parking',
      explanation: 'Vehicles must not be parked in this zone. Tow-away risk.'
    },
    {
      category: 'traffic',
      spanish: 'Desvío',
      portuguese: 'Desvio',
      english: 'Detour',
      explanation: 'Temporary route redirection due to roadworks or closures.'
    },
    {
      category: 'transit',
      spanish: 'Boletería',
      portuguese: 'Bilheteria',
      english: 'Ticket Office',
      explanation: 'Counter or kiosk for purchasing transit, bus, or event tickets.'
    },
    {
      category: 'transit',
      spanish: 'Andén',
      portuguese: 'Plataforma / Cais',
      english: 'Platform',
      explanation: 'Train or long-distance bus boarding platform.'
    },
    {
      category: 'transit',
      spanish: 'Subte',
      portuguese: 'Metrô subterrâneo',
      english: 'Subway / Underground Metro',
      explanation: 'Buenos Aires underground metropolitan rapid transit system.'
    },
    {
      category: 'transit',
      spanish: 'Colectivo',
      portuguese: 'Ônibus urbano',
      english: 'City Bus',
      explanation: 'Standard urban public transit bus.'
    },
    {
      category: 'transit',
      spanish: 'Terminal de Ómnibus',
      portuguese: 'Rodoviária',
      english: 'Bus Station / Terminal',
      explanation: 'Long-distance intercity coach station.'
    },
    {
      category: 'transit',
      spanish: 'Migraciones',
      portuguese: 'Controle de Imigração',
      english: 'Immigration Control',
      explanation: 'Passport inspection checkpoint at border crossings and airports.'
    },
    {
      category: 'transit',
      spanish: 'Aduana',
      portuguese: 'Alfândega',
      english: 'Customs',
      explanation: 'Tax and baggage declaration checkpoint at international entry points.'
    },
    {
      category: 'dining',
      spanish: 'Cubierto',
      portuguese: 'Taxa de serviço / Couvert de mesa',
      english: 'Cover Charge (Table Fee)',
      explanation: 'Cover Charge / fixed per-person restaurant fee for bread, butter, and table service (not a tip).'
    },
    {
      category: 'dining',
      spanish: 'Propina',
      portuguese: 'Gorjeta',
      english: 'Tip / Gratuity',
      explanation: 'Customary tip for waitstaff, generally 10% in Argentina and Chile.'
    },
    {
      category: 'dining',
      spanish: 'Bife de chorizo',
      portuguese: 'Contrafilé argentino',
      english: 'Sirloin / Strip Steak',
      explanation: 'Signature thick cut of tender Argentine beef.'
    },
    {
      category: 'dining',
      spanish: 'Agua sin gas',
      portuguese: 'Água sem gás',
      english: 'Still Water',
      explanation: 'Non-carbonated bottled mineral water.'
    },
    {
      category: 'dining',
      spanish: 'Agua con gas',
      portuguese: 'Água com gás',
      english: 'Sparkling Water',
      explanation: 'Carbonated bottled water.'
    },
    {
      category: 'dining',
      spanish: 'Factura B',
      portuguese: 'Nota Fiscal ao Consumidor',
      english: 'Consumer Tax Invoice',
      explanation: 'Standard official tax invoice issued to final consumers by Argentine merchants.'
    },
    {
      category: 'emergency',
      spanish: 'Policía Turística',
      portuguese: 'Polícia Turística',
      english: 'Tourist Police',
      explanation: 'Specialized police division dedicated to assisting foreign visitors.'
    },
    {
      category: 'emergency',
      spanish: 'Farmacia de turno',
      portuguese: 'Farmácia de plantão 24h',
      english: 'On-Duty 24h Pharmacy',
      explanation: 'Designated rotating pharmacy open overnight and during holidays.'
    },
    {
      category: 'emergency',
      spanish: 'Guardia',
      portuguese: 'Pronto-Socorro / Emergência médica',
      english: 'Emergency Room / Urgent Care',
      explanation: 'Hospital emergency intake and trauma unit.'
    }
  ];

  public translateText(rawText: string): TranslatedTerm[] {
    const query = this.sanitize(rawText);
    if (!query) return [];

    const matches: TranslatedTerm[] = [];

    for (const item of this.lexicon) {
      const cleanEs = this.sanitize(item.spanish);
      const cleanPt = this.sanitize(item.portuguese);
      const cleanEn = this.sanitize(item.english);

      if (
        query.includes(cleanEs) ||
        cleanEs.includes(query) ||
        query.includes(cleanPt) ||
        query.includes(cleanEn)
      ) {
        matches.push({
          original: rawText,
          ...item,
          confidence: 1.0
        });
        continue;
      }

      const dist = this.levenshtein(query, cleanEs);
      const maxLen = Math.max(query.length, cleanEs.length);
      if (dist <= 2 && query.length >= 4) {
        const similarity = Number((1.0 - dist / maxLen).toFixed(2));
        matches.push({
          original: rawText,
          ...item,
          confidence: similarity
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  public getTermsByCategory(category: 'traffic' | 'transit' | 'dining' | 'emergency'): TranslatedTerm[] {
    return this.lexicon
      .filter((item) => item.category === category)
      .map((item) => ({
        original: item.spanish,
        ...item,
        confidence: 1.0
      }));
  }

  private sanitize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
