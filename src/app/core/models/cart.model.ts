import { FixedDecimal } from '../math/fixed-decimal.js';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceForeign: number;
  currencyCode: string;
  totalForeign: number;
  totalBrl: number;
  totalUsd: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  foreignCurrencyCode: string;
  totalForeign: FixedDecimal;
  totalBrl: FixedDecimal;
  totalUsd: FixedDecimal;
}
