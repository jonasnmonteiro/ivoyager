export type PaymentMethodType = 'cash' | 'credit_card' | 'global_account' | 'crypto_p2p';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: PaymentMethodType;
  defaultIofPercent: number;
  defaultSpreadPercent: number;
  fixedFeeBrl: number;
  description: string;
  isRecommended: boolean;
}

export const PAYMENT_METHOD_PRESETS: Record<PaymentMethodType, PaymentMethodConfig> = {
  global_account: {
    id: 'global_account',
    name: 'Global Digital Account (Wise, Nomad)',
    type: 'global_account',
    defaultIofPercent: 1.10,
    defaultSpreadPercent: 1.50,
    fixedFeeBrl: 0.00,
    description: 'Commercial exchange rate with reduced IOF of 1.10% and competitive spread.',
    isRecommended: true
  },
  cash: {
    id: 'cash',
    name: 'Physical Cash (Foreign Currency)',
    type: 'cash',
    defaultIofPercent: 1.10,
    defaultSpreadPercent: 2.50,
    fixedFeeBrl: 0.00,
    description: 'Tourism exchange rate with IOF of 1.10% and exchange office operational spread.',
    isRecommended: false
  },
  credit_card: {
    id: 'credit_card',
    name: 'Traditional International Credit Card',
    type: 'credit_card',
    defaultIofPercent: 4.38,
    defaultSpreadPercent: 4.50,
    fixedFeeBrl: 0.00,
    description: 'PTAX exchange rate with standard IOF of 4.38% plus commercial bank spread.',
    isRecommended: false
  },
  crypto_p2p: {
    id: 'crypto_p2p',
    name: 'Crypto P2P Stablecoins (USDT, USDC)',
    type: 'crypto_p2p',
    defaultIofPercent: 0.00,
    defaultSpreadPercent: 0.50,
    fixedFeeBrl: 0.00,
    description: 'Direct P2P stablecoin liquidity with zero statutory IOF and network fee.',
    isRecommended: false
  }
};
