import { Decimal } from 'decimal.js';

export type DecimalValue = Decimal | number | string | FixedDecimal;

export class FixedDecimal {
  private readonly value: Decimal;

  constructor(val: DecimalValue) {
    if (val instanceof FixedDecimal) {
      this.value = val.value;
    } else if (val instanceof Decimal) {
      this.value = val;
    } else {
      const sanitized = typeof val === 'string' ? val.trim().replace(',', '.') : val;
      this.value = new Decimal(sanitized || 0);
    }
  }

  public static from(val: DecimalValue): FixedDecimal {
    return new FixedDecimal(val);
  }

  public static zero(): FixedDecimal {
    return new FixedDecimal(0);
  }

  public plus(other: DecimalValue): FixedDecimal {
    const o = FixedDecimal.from(other);
    return new FixedDecimal(this.value.plus(o.value));
  }

  public minus(other: DecimalValue): FixedDecimal {
    const o = FixedDecimal.from(other);
    return new FixedDecimal(this.value.minus(o.value));
  }

  public times(other: DecimalValue): FixedDecimal {
    const o = FixedDecimal.from(other);
    return new FixedDecimal(this.value.times(o.value));
  }

  public dividedBy(other: DecimalValue): FixedDecimal {
    const o = FixedDecimal.from(other);
    if (o.value.isZero()) {
      return FixedDecimal.zero();
    }
    return new FixedDecimal(this.value.dividedBy(o.value));
  }

  public percentOf(percentValue: DecimalValue): FixedDecimal {
    const p = FixedDecimal.from(percentValue);
    return this.times(p).dividedBy(100);
  }

  public round(decimalPlaces: number = 2): FixedDecimal {
    return new FixedDecimal(this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP));
  }

  public toNumber(): number {
    return this.value.toNumber();
  }

  public toString(): string {
    return this.value.toString();
  }

  public toFixed(decimalPlaces: number = 2): string {
    return this.value.toFixed(decimalPlaces, Decimal.ROUND_HALF_UP);
  }

  public isZero(): boolean {
    return this.value.isZero();
  }

  public isPositive(): boolean {
    return this.value.isPositive() && !this.value.isZero();
  }

  public isNegative(): boolean {
    return this.value.isNegative();
  }

  public greaterThan(other: DecimalValue): boolean {
    const o = FixedDecimal.from(other);
    return this.value.greaterThan(o.value);
  }

  public lessThan(other: DecimalValue): boolean {
    const o = FixedDecimal.from(other);
    return this.value.lessThan(o.value);
  }

  public equals(other: DecimalValue): boolean {
    const o = FixedDecimal.from(other);
    return this.value.equals(o.value);
  }

  public format(locale: string = 'pt-BR', minimumFractionDigits: number = 2, maximumFractionDigits: number = 2): string {
    const num = this.toNumber();
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num);
  }

  public formatCurrency(currencyCode: string, locale: string = 'pt-BR'): string {
    const num = this.toNumber();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(num);
  }
}
