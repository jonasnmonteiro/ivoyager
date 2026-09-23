import { FixedDecimal } from '../math/fixed-decimal.js';
import { PAYMENT_METHOD_PRESETS, PaymentMethodConfig, PaymentMethodType } from '../models/payment-method.model.js';
import { VETCalculationInput, VETCalculationResult, VETComparisonResult } from '../models/vet.model.js';

export class VETCalculatorService {
  public calculateVET(input: VETCalculationInput): VETCalculationResult {
    const foreignAmount = FixedDecimal.from(input.foreignAmount);
    const baseRate = FixedDecimal.from(input.baseExchangeRate);
    const foreignCurrencyCode = input.foreignCurrencyCode.toUpperCase();
    const targetCurrencyCode = (input.targetCurrencyCode || 'BRL').toUpperCase();

    const spreadPercent = FixedDecimal.from(
      input.customSpreadPercent !== undefined
        ? input.customSpreadPercent
        : input.paymentMethod.defaultSpreadPercent
    );

    const iofPercent = FixedDecimal.from(
      input.customIofPercent !== undefined
        ? input.customIofPercent
        : input.paymentMethod.defaultIofPercent
    );

    const fixedFeeBrl = FixedDecimal.from(
      input.customFixedFeeBrl !== undefined
        ? input.customFixedFeeBrl
        : input.paymentMethod.fixedFeeBrl
    );

    const grossBrl = foreignAmount.times(baseRate).round(4);
    const spreadAmountBrl = grossBrl.percentOf(spreadPercent).round(2);
    const subtotalWithSpreadBrl = grossBrl.plus(spreadAmountBrl).round(2);
    const iofAmountBrl = subtotalWithSpreadBrl.percentOf(iofPercent).round(2);
    const totalCostBrl = subtotalWithSpreadBrl.plus(iofAmountBrl).plus(fixedFeeBrl).round(2);

    const effectiveRate = foreignAmount.isZero()
      ? baseRate
      : totalCostBrl.dividedBy(foreignAmount).round(4);

    const effectiveTaxRatePercent = grossBrl.isZero()
      ? FixedDecimal.zero()
      : totalCostBrl.minus(grossBrl).dividedBy(grossBrl).times(100).round(2);

    return {
      foreignAmount,
      foreignCurrencyCode,
      targetCurrencyCode,
      baseRate,
      effectiveRate,
      grossBrl,
      spreadPercent,
      spreadAmountBrl,
      subtotalWithSpreadBrl,
      iofPercent,
      iofAmountBrl,
      fixedFeeBrl,
      totalCostBrl,
      effectiveTaxRatePercent,
      paymentMethod: input.paymentMethod
    };
  }

  public compareAll(
    foreignAmountValue: number | string | FixedDecimal,
    baseExchangeRateValue: number | string | FixedDecimal,
    foreignCurrencyCode: string = 'USD',
    targetCurrencyCode: string = 'BRL',
    customMethods?: PaymentMethodConfig[]
  ): VETComparisonResult {
    const methods = customMethods || Object.values(PAYMENT_METHOD_PRESETS);
    const results: VETCalculationResult[] = methods.map(method =>
      this.calculateVET({
        foreignAmount: foreignAmountValue,
        baseExchangeRate: baseExchangeRateValue,
        foreignCurrencyCode,
        targetCurrencyCode,
        paymentMethod: method
      })
    );

    results.sort((a, b) => (a.totalCostBrl.lessThan(b.totalCostBrl) ? -1 : 1));

    const bestOption = results[0];
    const worstOption = results[results.length - 1];
    const maxSavingsBrl = worstOption.totalCostBrl.minus(bestOption.totalCostBrl).round(2);

    const maxSavingsPercent = worstOption.totalCostBrl.isZero()
      ? FixedDecimal.zero()
      : maxSavingsBrl.dividedBy(worstOption.totalCostBrl).times(100).round(2);

    return {
      foreignAmount: FixedDecimal.from(foreignAmountValue),
      foreignCurrencyCode: foreignCurrencyCode.toUpperCase(),
      targetCurrencyCode: targetCurrencyCode.toUpperCase(),
      baseRate: FixedDecimal.from(baseExchangeRateValue),
      results,
      bestOption,
      worstOption,
      maxSavingsBrl,
      maxSavingsPercent
    };
  }

  public getPreset(type: PaymentMethodType): PaymentMethodConfig {
    return PAYMENT_METHOD_PRESETS[type];
  }
}
