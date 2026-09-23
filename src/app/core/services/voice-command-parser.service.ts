export interface ParsedVoiceCommand {
  description: string;
  amount: number | null;
  currency: string;
  category: string;
  isRecognized: boolean;
}

export class VoiceCommandParserService {
  private readonly categoryKeywords: Record<string, string[]> = {
    food: ['almoço', 'jantar', 'café', 'lanche', 'restaurante', 'pizza', 'hambúrguer', 'comida', 'lunch', 'dinner', 'breakfast'],
    transport: ['uber', 'táxi', 'taxi', 'ônibus', 'metro', 'metrô', 'passagem', 'gasolina', 'combustível'],
    lodging: ['hotel', 'airbnb', 'pousada', 'hospedagem', 'hostel'],
    shopping: ['compras', 'loja', 'roupa', 'eletrônico', 'souvenir', 'presente', 'supermercado'],
    entertainment: ['ingresso', 'museu', 'show', 'cinema', 'parque', 'passeio']
  };

  private readonly currencyKeywords: Record<string, string[]> = {
    BRL: ['reais', 'real', 'r$'],
    USD: ['dólares', 'dólar', 'dolares', 'dolar', 'bucks', 'usd'],
    EUR: ['euros', 'euro'],
    ARS: ['pesos argentinos', 'pesos', 'ars'],
    CLP: ['pesos chilenos', 'clp'],
    PYG: ['guaranis', 'guaranies', 'pyg']
  };

  public parse(spokenText: string, defaultCurrency: string = 'ARS'): ParsedVoiceCommand {
    const text = (spokenText || '').toLowerCase().trim();
    if (!text) {
      return { description: '', amount: null, currency: defaultCurrency, category: 'other', isRecognized: false };
    }

    let detectedCurrency = defaultCurrency;
    for (const [code, keywords] of Object.entries(this.currencyKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        detectedCurrency = code;
        break;
      }
    }

    let detectedCategory = 'other';
    for (const [cat, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        detectedCategory = cat;
        break;
      }
    }

    let detectedAmount: number | null = null;
    const numberRegex = /(?:^|\s)([0-9]+(?:[.,][0-9]{1,2})?)(?:\s|$)/;
    const match = text.match(numberRegex);
    if (match && match[1]) {
      const sanitized = match[1].replace(',', '.');
      const parsed = parseFloat(sanitized);
      if (!isNaN(parsed) && parsed > 0) {
        detectedAmount = parsed;
      }
    }

    let cleanDescription = text
      .replace(numberRegex, ' ')
      .replace(/\b(adicionar|lancar|lançar|gasto|despesa|em|de|no|na)\b/gi, ' ')
      .trim();

    cleanDescription = cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1);

    return {
      description: cleanDescription || 'Spoken Expense',
      amount: detectedAmount,
      currency: detectedCurrency,
      category: detectedCategory,
      isRecognized: detectedAmount !== null
    };
  }
}
