export type RateType = 'official' | 'blue' | 'mep' | 'tarjeta' | 'crypto_p2p' | 'remittance';

export interface CurrencyMetadata {
  code: string;
  name: string;
  flagSymbol: string;
  decimalPlaces: number;
}

export interface ExchangeRate {
  id: string;
  from: string;
  to: string;
  type: RateType;
  buy: number;
  sell: number;
  source: string;
  updatedAt: number;
}

export interface CrossRateResult {
  from: string;
  to: string;
  rate: number;
  inverseRate: number;
  type: RateType;
  timestamp: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyMetadata> = {
  BRL: { code: 'BRL', name: 'Brazilian Real', flagSymbol: 'BR', decimalPlaces: 2 },
  USD: { code: 'USD', name: 'US Dollar', flagSymbol: 'US', decimalPlaces: 2 },
  EUR: { code: 'EUR', name: 'Euro', flagSymbol: 'EU', decimalPlaces: 2 },
  ARS: { code: 'ARS', name: 'Argentine Peso', flagSymbol: 'AR', decimalPlaces: 2 },
  CLP: { code: 'CLP', name: 'Chilean Peso', flagSymbol: 'CL', decimalPlaces: 0 },
  UYU: { code: 'UYU', name: 'Uruguayan Peso', flagSymbol: 'UY', decimalPlaces: 2 },
  PYG: { code: 'PYG', name: 'Paraguayan Guarani', flagSymbol: 'PY', decimalPlaces: 0 },
  USDT: { code: 'USDT', name: 'Tether USD (Stablecoin)', flagSymbol: 'USDT', decimalPlaces: 2 }
};
