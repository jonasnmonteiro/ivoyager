import { FixedDecimal } from '../math/fixed-decimal.js';
import { PaymentMethodConfig } from './payment-method.model.js';

export interface VETCalculationInput {
  foreignAmount: number | string | FixedDecimal;
  baseExchangeRate: number | string | FixedDecimal;
  foreignCurrencyCode: string;
  targetCurrencyCode?: string;
  paymentMethod: PaymentMethodConfig;
  customSpreadPercent?: number;
  customIofPercent?: number;
  customFixedFeeBrl?: number;
}

export interface VETCalculationResult {
  foreignAmount: FixedDecimal;
  foreignCurrencyCode: string;
  targetCurrencyCode: string;
  baseRate: FixedDecimal;
  effectiveRate: FixedDecimal;
  grossBrl: FixedDecimal;
  spreadPercent: FixedDecimal;
  spreadAmountBrl: FixedDecimal;
  subtotalWithSpreadBrl: FixedDecimal;
  iofPercent: FixedDecimal;
  iofAmountBrl: FixedDecimal;
  fixedFeeBrl: FixedDecimal;
  totalCostBrl: FixedDecimal;
  effectiveTaxRatePercent: FixedDecimal;
  paymentMethod: PaymentMethodConfig;
}

export interface VETComparisonResult {
  foreignAmount: FixedDecimal;
  foreignCurrencyCode: string;
  targetCurrencyCode: string;
  baseRate: FixedDecimal;
  results: VETCalculationResult[];
  bestOption: VETCalculationResult;
  worstOption: VETCalculationResult;
  maxSavingsBrl: FixedDecimal;
  maxSavingsPercent: FixedDecimal;
}
