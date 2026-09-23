import { DebtSettlement, ExpenseItem, TripCategory, TripMember, TripSummary } from '../models/trip.model.js';
import { TripRecord } from '../storage/database.js';

export class TripTrackerService {
  private trips: Map<string, TripRecord> = new Map();
  private expenses: Map<string, ExpenseItem[]> = new Map();
  private members: Map<string, TripMember[]> = new Map();

  public createTrip(name: string, destination: string, baseCurrency: string = 'BRL', targetCurrency: string = 'USD'): TripRecord {
    const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const trip: TripRecord = {
      id,
      name,
      destination,
      baseCurrency: baseCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      startDate: new Date().toISOString().split('T')[0],
      totalBudgetBrl: 0,
      status: 'active',
      createdAt: Date.now()
    };
    this.trips.set(id, trip);
    this.expenses.set(id, []);
    this.members.set(id, []);
    return trip;
  }

  public addMember(tripId: string, name: string, email?: string): TripMember {
    const id = `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const member: TripMember = { id, name, email };
    const tripMembers = this.members.get(tripId) || [];
    tripMembers.push(member);
    this.members.set(tripId, tripMembers);
    return member;
  }

  public addExpense(
    tripId: string,
    description: string,
    category: TripCategory,
    originalAmount: number,
    originalCurrency: string,
    exchangeRateUsed: number,
    payerMemberId: string,
    payerName: string,
    beneficiaryMemberIds: string[]
  ): ExpenseItem {
    const convertedAmountBrl = Math.round(originalAmount * exchangeRateUsed * 100) / 100;
    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expense: ExpenseItem = {
      id,
      tripId,
      description,
      category,
      originalAmount,
      originalCurrency: originalCurrency.toUpperCase(),
      exchangeRateUsed,
      convertedAmountBrl,
      payerMemberId,
      payerName,
      beneficiaryMemberIds,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    const tripExpenses = this.expenses.get(tripId) || [];
    tripExpenses.push(expense);
    this.expenses.set(tripId, tripExpenses);
    return expense;
  }

  public calculateSettlements(tripId: string): DebtSettlement[] {
    const tripExpenses = this.expenses.get(tripId) || [];
    const tripMembers = this.members.get(tripId) || [];
    const memberMap = new Map(tripMembers.map(m => [m.id, m.name]));

    const netBalances: Map<string, number> = new Map();
    for (const m of tripMembers) {
      netBalances.set(m.id, 0);
    }

    for (const exp of tripExpenses) {
      const payerId = exp.payerMemberId;
      const beneficiaries = exp.beneficiaryMemberIds.length > 0 ? exp.beneficiaryMemberIds : tripMembers.map(m => m.id);
      const share = exp.convertedAmountBrl / beneficiaries.length;

      netBalances.set(payerId, (netBalances.get(payerId) || 0) + exp.convertedAmountBrl);
      for (const bId of beneficiaries) {
        netBalances.set(bId, (netBalances.get(bId) || 0) - share);
      }
    }

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    for (const [memberId, balance] of netBalances.entries()) {
      const rounded = Math.round(balance * 100) / 100;
      if (rounded < -0.01) {
        debtors.push({ id: memberId, amount: -rounded });
      } else if (rounded > 0.01) {
        creditors.push({ id: memberId, amount: rounded });
      }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: DebtSettlement[] = [];
    let dIndex = 0;
    let cIndex = 0;

    while (dIndex < debtors.length && cIndex < creditors.length) {
      const debtor = debtors[dIndex];
      const creditor = creditors[cIndex];
      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) {
        settlements.push({
          fromMemberId: debtor.id,
          fromMemberName: memberMap.get(debtor.id) || debtor.id,
          toMemberId: creditor.id,
          toMemberName: memberMap.get(creditor.id) || creditor.id,
          amountBrl: Math.round(settlementAmount * 100) / 100
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount <= 0.01) dIndex++;
      if (creditor.amount <= 0.01) cIndex++;
    }

    return settlements;
  }

  public getTripSummary(tripId: string): TripSummary | null {
    const trip = this.trips.get(tripId);
    if (!trip) return null;

    const tripExpenses = this.expenses.get(tripId) || [];
    let totalExpensesBrl = 0;
    const expensesByCategory: Record<TripCategory, number> = {
      food: 0,
      transport: 0,
      lodging: 0,
      shopping: 0,
      entertainment: 0,
      services: 0,
      other: 0
    };

    for (const exp of tripExpenses) {
      totalExpensesBrl += exp.convertedAmountBrl;
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.convertedAmountBrl;
    }

    const settlements = this.calculateSettlements(tripId);

    return {
      trip,
      totalExpensesBrl: Math.round(totalExpensesBrl * 100) / 100,
      expensesByCategory,
      settlements
    };
  }

  public exportTripToCSV(tripId: string): string {
    const tripExpenses = this.expenses.get(tripId) || [];
    const headers = ['Date', 'Description', 'Category', 'Original Amount', 'Currency', 'Exchange Rate', 'Amount BRL', 'Payer'];
    const rows = tripExpenses.map(e => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.originalAmount.toFixed(2),
      e.originalCurrency,
      e.exchangeRateUsed.toFixed(4),
      e.convertedAmountBrl.toFixed(2),
      `"${e.payerName.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
