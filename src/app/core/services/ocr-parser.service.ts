export interface ParsedReceiptData {
  detectedAmount: number | null;
  detectedCurrency: string | null;
  detectedDate: string | null;
  confidenceScore: number;
  rawText: string;
}

export class OCRParserService {
  private readonly currencyKeywords: Record<string, string[]> = {
    BRL: ['r$', 'brl', 'reais', 'real'],
    USD: ['us$', 'usd', 'dollars', 'dollar'],
    EUR: ['€', 'eur', 'euros', 'euro'],
    ARS: ['ars', 'pesos arg', 'pesos'],
    CLP: ['clp', 'pesos chilenos'],
    PYG: ['gs', 'pyg', 'guaranies', 'guarani']
  };

  public parseReceipt(text: string): ParsedReceiptData {
    const raw = text || '';
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

    let detectedCurrency: string | null = null;
    let detectedAmount: number | null = null;
    let detectedDate: string | null = null;
    let confidence = 0.5;

    for (const [code, keywords] of Object.entries(this.currencyKeywords)) {
      if (keywords.some(kw => raw.toLowerCase().includes(kw))) {
        detectedCurrency = code;
        confidence += 0.2;
        break;
      }
    }

    const totalLineRegex = /(?:total|importe|valor\s+total|subtotal|monto|due)\s*[:=\s]*([$R€GsA-Z\s]*)([0-9.,]+)/i;
    for (const line of lines) {
      const match = line.match(totalLineRegex);
      if (match && match[1]) {
        const numStr = match[1].replace(/[^0-9.,]/g, '');
        const parsed = this.normalizeNumericString(numStr);
        if (parsed !== null && parsed > 0) {
          detectedAmount = parsed;
          confidence += 0.25;
          break;
        }
      }
    }

    if (detectedAmount === null) {
      const genericAmountRegex = /\b([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2})\b/g;
      const allMatches = [...raw.matchAll(genericAmountRegex)];
      if (allMatches.length > 0) {
        const numbers = allMatches.map(m => this.normalizeNumericString(m[1])).filter((n): n is number => n !== null);
        if (numbers.length > 0) {
          detectedAmount = Math.max(...numbers);
          confidence += 0.15;
        }
      }
    }

    const dateRegex = /\b([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:20)?[0-9]{2})\b/;
    const dateMatch = raw.match(dateRegex);
    if (dateMatch) {
      detectedDate = dateMatch[1];
      confidence += 0.1;
    }

    return {
      detectedAmount,
      detectedCurrency: detectedCurrency || 'USD',
      detectedDate,
      confidenceScore: Math.min(1.0, Math.round(confidence * 100) / 100),
      rawText: raw
    };
  }

  private normalizeNumericString(str: string): number | null {
    if (!str) return null;
    let clean = str.trim();

    if (clean.includes(',') && clean.includes('.')) {
      if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }

    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
  }
}
