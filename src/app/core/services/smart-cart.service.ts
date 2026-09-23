import { FixedDecimal } from '../math/fixed-decimal.js';
import { CartItem, CartSummary } from '../models/cart.model.js';
import { ExchangeRateService } from './exchange-rate.service.js';

export class SmartCartService {
  private items: CartItem[] = [];
  private baseForeignCurrency: string = 'ARS';
  private customRateToBrl: number | null = null;
  private customRateToUsd: number | null = null;

  constructor(private exchangeRateService?: ExchangeRateService) {}

  public setBaseCurrency(currencyCode: string): void {
    this.baseForeignCurrency = currencyCode.toUpperCase();
    this.recalculateAll();
  }

  public setCustomRate(rateToBrl: number | null, rateToUsd: number | null): void {
    this.customRateToBrl = rateToBrl;
    this.customRateToUsd = rateToUsd;
    this.recalculateAll();
  }

  public addItem(name: string, unitPrice: number, quantity: number = 1): CartItem {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: CartItem = {
      id,
      name: name.trim() || `Item ${this.items.length + 1}`,
      quantity: Math.max(1, quantity),
      unitPriceForeign: Math.max(0, unitPrice),
      currencyCode: this.baseForeignCurrency,
      totalForeign: 0,
      totalBrl: 0,
      totalUsd: 0
    };

    this.calculateItemTotals(newItem);
    this.items.push(newItem);
    return newItem;
  }

  public updateItem(id: string, updates: Partial<Pick<CartItem, 'name' | 'unitPriceForeign' | 'quantity'>>): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;

    if (updates.name !== undefined) item.name = updates.name;
    if (updates.unitPriceForeign !== undefined) item.unitPriceForeign = Math.max(0, updates.unitPriceForeign);
    if (updates.quantity !== undefined) item.quantity = Math.max(1, updates.quantity);

    this.calculateItemTotals(item);
    return true;
  }

  public removeItem(id: string): boolean {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  public clear(): void {
    this.items = [];
  }

  public getSummary(): CartSummary {
    let sumForeign = FixedDecimal.zero();
    let sumBrl = FixedDecimal.zero();
    let sumUsd = FixedDecimal.zero();

    for (const item of this.items) {
      sumForeign = sumForeign.plus(item.totalForeign);
      sumBrl = sumBrl.plus(item.totalBrl);
      sumUsd = sumUsd.plus(item.totalUsd);
    }

    return {
      items: [...this.items],
      itemCount: this.items.length,
      foreignCurrencyCode: this.baseForeignCurrency,
      totalForeign: sumForeign.round(2),
      totalBrl: sumBrl.round(2),
      totalUsd: sumUsd.round(2)
    };
  }

  private calculateItemTotals(item: CartItem): void {
    const unitPrice = FixedDecimal.from(item.unitPriceForeign);
    const qty = FixedDecimal.from(item.quantity);
    const totalForeign = unitPrice.times(qty).round(2);
    item.totalForeign = totalForeign.toNumber();

    const rateBrl = this.customRateToBrl ?? 0.0055;
    const rateUsd = this.customRateToUsd ?? 0.0010;

    item.totalBrl = totalForeign.times(rateBrl).round(2).toNumber();
    item.totalUsd = totalForeign.times(rateUsd).round(2).toNumber();
  }

  private recalculateAll(): void {
    for (const item of this.items) {
      item.currencyCode = this.baseForeignCurrency;
      this.calculateItemTotals(item);
    }
  }
}
