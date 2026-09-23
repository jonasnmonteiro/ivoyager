import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TripTrackerService } from './trip-tracker.service.js';
import { SmartCartService } from './smart-cart.service.js';

describe('Block 4: SmartCartService & TripTrackerService (Mini-Splitwise)', () => {
  it('calculates multi-currency cart subtotals and conversions accurately', () => {
    const cart = new SmartCartService();
    cart.setBaseCurrency('ARS');
    cart.setCustomRate(0.0055, 0.0010);

    cart.addItem('Empanadas', 5000, 2);
    cart.addItem('Vino Malbec', 12000, 1);

    const summary = cart.getSummary();
    assert.equal(summary.itemCount, 2);
    assert.equal(summary.totalForeign.toNumber(), 22000.00);
    assert.equal(summary.totalBrl.toNumber(), 121.00);
    assert.equal(summary.totalUsd.toNumber(), 22.00);
  });

  it('balances group debts with the minimal number of transactions (Splitwise matrix)', () => {
    const tracker = new TripTrackerService();
    const trip = tracker.createTrip('Buenos Aires Trip', 'Argentina', 'BRL', 'ARS');

    const alice = tracker.addMember(trip.id, 'Alice');
    const bob = tracker.addMember(trip.id, 'Bob');
    const charlie = tracker.addMember(trip.id, 'Charlie');

    tracker.addExpense(
      trip.id,
      'Hotel Booking',
      'lodging',
      300.00,
      'BRL',
      1.0,
      alice.id,
      alice.name,
      [alice.id, bob.id, charlie.id]
    );

    const summary = tracker.getTripSummary(trip.id);
    assert.ok(summary);
    assert.equal(summary.totalExpensesBrl, 300.00);
    assert.equal(summary.expensesByCategory.lodging, 300.00);
    assert.equal(summary.settlements.length, 2);

    const bobPays = summary.settlements.find(s => s.fromMemberId === bob.id);
    const charliePays = summary.settlements.find(s => s.fromMemberId === charlie.id);

    assert.ok(bobPays);
    assert.ok(charliePays);
    assert.equal(bobPays.toMemberId, alice.id);
    assert.equal(bobPays.amountBrl, 100.00);
    assert.equal(charliePays.toMemberId, alice.id);
    assert.equal(charliePays.amountBrl, 100.00);
  });

  it('exports trip expenses properly into CSV format', () => {
    const tracker = new TripTrackerService();
    const trip = tracker.createTrip('Santiago Trip', 'Chile', 'BRL', 'CLP');
    const member = tracker.addMember(trip.id, 'Alice');

    tracker.addExpense(
      trip.id,
      'Dinner',
      'food',
      45000,
      'CLP',
      0.0058,
      member.id,
      member.name,
      [member.id]
    );

    const csv = tracker.exportTripToCSV(trip.id);
    assert.ok(csv.includes('Dinner'));
    assert.ok(csv.includes('food'));
    assert.ok(csv.includes('45000.00'));
    assert.ok(csv.includes('CLP'));
  });
});
