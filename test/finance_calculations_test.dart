import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/models/life_models.dart';
import 'package:livelife/src/services/finance_calculations.dart';

void main() {
  test('calculates INR finance summary with bank/UPI bills', () {
    final summary = calculateFinanceSummary([
      FinanceEntry(
        id: 'income',
        title: 'Salary',
        amountInr: 50000,
        type: FinanceType.income,
        accountLabel: 'Bank / UPI',
        date: DateTime(2026),
      ),
      FinanceEntry(
        id: 'expense',
        title: 'Groceries',
        amountInr: 2500,
        type: FinanceType.expense,
        accountLabel: 'Bank / UPI',
        date: DateTime(2026),
      ),
      FinanceEntry(
        id: 'bill',
        title: 'Electricity bill',
        amountInr: 1200,
        type: FinanceType.bill,
        accountLabel: 'Bank / UPI',
        date: DateTime(2026),
      ),
    ]);

    expect(summary.incomeInr, 50000);
    expect(summary.expenseInr, 2500);
    expect(summary.pendingBillsInr, 1200);
    expect(summary.cashFlowInr, 46300);
  });

  test('labels finance entry types for reports', () {
    expect(financeTypeLabel(FinanceType.income), 'Income');
    expect(financeTypeLabel(FinanceType.expense), 'Expense');
    expect(financeTypeLabel(FinanceType.bill), 'Pending bill');
  });
}
