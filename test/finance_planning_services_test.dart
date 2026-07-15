import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/data/life_repository.dart' show bankUpiAccountLabel;
import 'package:livelife/src/services/finance/finance_planning_services.dart';

void main() {
  test('generates recurring bills and supports paid state', () {
    final bills = generateRecurringBills(const [RecurringBillRule(id: 'rent', title: 'Rent', amountInr: 12000, dayOfMonth: 5, accountLabel: bankUpiAccountLabel)], DateTime(2026, 7));
    expect(bills.single.date, DateTime(2026, 7, 5));
    expect(markBillPaid(bills.single, true).paid, isTrue);
  });

  test('sorts bills, calculates monthly summary and cash-flow trend', () {
    final entries = LocalLifeRepository.seeded().getFinanceEntries();
    expect(sortBillsByDueDate(entries).first.title, contains('bill'));
    final summary = filteredMonthlySummary(entries, FinanceReportFilter(from: DateTime(2020), to: DateTime(2100)));
    expect(summary.incomeInr, greaterThan(0));
    expect(cashFlowTrend(entries, 2, now: DateTime.now()), hasLength(2));
    expect(advancedFinanceComingSoon, contains('Tax / GST'));
  });
}
