import { FixedDecimal } from '../math/fixed-decimal.js';
import { CrossRateResult, ExchangeRate, RateType } from '../models/currency.model.js';
import { AppDatabase, db } from '../storage/database.js';

export interface RateProvider {
  name: string;
  fetchRates(): Promise<ExchangeRate[]>;
}

export class ExchangeRateService {
  private database: AppDatabase;
  private readonly ttlMs: number;
  private memoryRates: Map<string, ExchangeRate> = new Map();

  constructor(customDatabase?: AppDatabase, ttlMs: number = 300000) {
    this.database = customDatabase || db;
    this.ttlMs = ttlMs;
  }

  public async getRate(from: string, to: string, type: RateType = 'official'): Promise<ExchangeRate | null> {
    const key = `${from.toUpperCase()}-${to.toUpperCase()}-${type}`;
    if (this.memoryRates.has(key)) {
      return this.memoryRates.get(key)!;
    }

    try {
      const stored = await this.database.rates.get(key);
      if (stored) {
        this.memoryRates.set(key, stored);
        return stored;
      }
    } catch {
      return null;
    }

    return null;
  }

  public setRateInMemory(rate: ExchangeRate): void {
    const key = `${rate.from.toUpperCase()}-${rate.to.toUpperCase()}-${rate.type}`;
    this.memoryRates.set(key, rate);
  }

  public async saveRate(rate: ExchangeRate): Promise<void> {
    const key = `${rate.from.toUpperCase()}-${rate.to.toUpperCase()}-${rate.type}`;
    rate.id = key;
    this.memoryRates.set(key, rate);
    try {
      await this.database.rates.put(rate);
    } catch {
    }
  }

  public async saveBatchRates(rates: ExchangeRate[]): Promise<void> {
    for (const rate of rates) {
      await this.saveRate(rate);
    }
  }

  public async convert(
    amountValue: number | string | FixedDecimal,
    fromCurrency: string,
    toCurrency: string,
    type: RateType = 'official'
  ): Promise<{ convertedAmount: FixedDecimal; rateUsed: FixedDecimal; crossRate: CrossRateResult }> {
    const amount = FixedDecimal.from(amountValue);
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      const unitaryResult: CrossRateResult = {
        from,
        to,
        rate: 1.0,
        inverseRate: 1.0,
        type,
        timestamp: Date.now()
      };
      return {
        convertedAmount: amount,
        rateUsed: FixedDecimal.from(1),
        crossRate: unitaryResult
      };
    }

    const directRate = await this.getRate(from, to, type);
    if (directRate && directRate.sell > 0) {
      const rateFixed = FixedDecimal.from(directRate.sell);
      const converted = amount.times(rateFixed).round(2);
      const crossRate: CrossRateResult = {
        from,
        to,
        rate: directRate.sell,
        inverseRate: 1 / directRate.sell,
        type,
        timestamp: directRate.updatedAt
      };
      return {
        convertedAmount: converted,
        rateUsed: rateFixed,
        crossRate
      };
    }

    const inverseRate = await this.getRate(to, from, type);
    if (inverseRate && inverseRate.sell > 0) {
      const rateFixed = FixedDecimal.from(1).dividedBy(inverseRate.sell);
      const converted = amount.times(rateFixed).round(2);
      const crossRate: CrossRateResult = {
        from,
        to,
        rate: rateFixed.toNumber(),
        inverseRate: inverseRate.sell,
        type,
        timestamp: inverseRate.updatedAt
      };
      return {
        convertedAmount: converted,
        rateUsed: rateFixed,
        crossRate
      };
    }

    const fromToBrl = await this.getRate(from, 'BRL', type);
    const toToBrl = await this.getRate(to, 'BRL', type);

    if (fromToBrl && toToBrl && toToBrl.sell > 0) {
      const crossMultiplier = fromToBrl.sell / toToBrl.sell;
      const rateFixed = FixedDecimal.from(crossMultiplier);
      const converted = amount.times(rateFixed).round(2);
      const crossRate: CrossRateResult = {
        from,
        to,
        rate: crossMultiplier,
        inverseRate: 1 / crossMultiplier,
        type,
        timestamp: Math.min(fromToBrl.updatedAt, toToBrl.updatedAt)
      };
      return {
        convertedAmount: converted,
        rateUsed: rateFixed,
        crossRate
      };
    }

    return {
      convertedAmount: FixedDecimal.zero(),
      rateUsed: FixedDecimal.zero(),
      crossRate: {
        from,
        to,
        rate: 0,
        inverseRate: 0,
        type,
        timestamp: Date.now()
      }
    };
  }
}
