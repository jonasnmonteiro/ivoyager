import { TripRecord } from '../storage/database.js';

export type TripCategory = 'food' | 'transport' | 'lodging' | 'shopping' | 'entertainment' | 'services' | 'other';

export interface TripMember {
  id: string;
  name: string;
  email?: string;
}

export interface ExpenseItem {
  id: string;
  tripId: string;
  description: string;
  category: TripCategory;
  originalAmount: number;
  originalCurrency: string;
  exchangeRateUsed: number;
  convertedAmountBrl: number;
  payerMemberId: string;
  payerName: string;
  beneficiaryMemberIds: string[];
  date: string;
  timestamp: number;
}

export interface DebtSettlement {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amountBrl: number;
}

export interface TripSummary {
  trip: TripRecord;
  totalExpensesBrl: number;
  expensesByCategory: Record<TripCategory, number>;
  settlements: DebtSettlement[];
}
