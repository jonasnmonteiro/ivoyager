import { Dexie, type Table } from 'dexie';
import { ExchangeRate } from '../models/currency.model.js';

export interface TripRecord {
  id: string;
  name: string;
  destination: string;
  baseCurrency: string;
  targetCurrency: string;
  startDate: string;
  endDate?: string;
  totalBudgetBrl: number;
  status: 'active' | 'archived';
  createdAt: number;
}

export interface ExpenseRecord {
  id: string;
  tripId: string;
  description: string;
  category: 'food' | 'transport' | 'lodging' | 'shopping' | 'entertainment' | 'services' | 'other';
  originalAmount: number;
  originalCurrency: string;
  exchangeRateUsed: number;
  convertedAmountBrl: number;
  paymentMethod: string;
  payerName: string;
  date: string;
  timestamp: number;
  receiptUrl?: string;
}

export interface ExchangeSpotRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  type: 'bureau_de_change' | 'western_union' | 'bank' | 'atm';
  updatedAt: number;
}

export interface AppSettingRecord {
  key: string;
  value: string | number | boolean | object;
}

export class AppDatabase extends Dexie {
  public rates!: Table<ExchangeRate, string>;
  public trips!: Table<TripRecord, string>;
  public expenses!: Table<ExpenseRecord, string>;
  public exchangeSpots!: Table<ExchangeSpotRecord, string>;
  public settings!: Table<AppSettingRecord, string>;

  constructor(databaseName: string = 'iVoyagerDB') {
    super(databaseName);
    this.version(1).stores({
      rates: 'id, from, to, type, updatedAt',
      trips: 'id, name, destination, baseCurrency, status, createdAt',
      expenses: 'id, tripId, category, originalCurrency, payerName, date, timestamp',
      exchangeSpots: 'id, city, country, type, updatedAt',
      settings: 'key'
    });
  }
}

export const db = new AppDatabase();
