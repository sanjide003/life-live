import '../../models/life_models.dart';
import '../finance_calculations.dart';

class RecurringBillRule {
  const RecurringBillRule({required this.id, required this.title, required this.amountInr, required this.dayOfMonth, required this.accountLabel, this.category = 'Bills'});
  final String id;
  final String title;
  final double amountInr;
  final int dayOfMonth;
  final String accountLabel;
  final String category;
}

class FinanceReportFilter {
  const FinanceReportFilter({required this.from, required this.to, this.category});
  final DateTime from;
  final DateTime to;
  final String? category;
}

List<FinanceEntry> generateRecurringBills(List<RecurringBillRule> rules, DateTime month) {
  final lastDay = DateTime(month.year, month.month + 1, 0).day;
  return [for (final rule in rules) FinanceEntry(id: 'bill-${rule.id}-${month.year}-${month.month}', title: rule.title, amountInr: rule.amountInr, type: FinanceType.bill, accountLabel: rule.accountLabel, date: DateTime(month.year, month.month, rule.dayOfMonth.clamp(1, lastDay).toInt()), paid: false)];
}

List<FinanceEntry> sortBillsByDueDate(List<FinanceEntry> entries) => [...entries.where((entry) => entry.type == FinanceType.bill)]..sort((a, b) => a.date.compareTo(b.date));
FinanceEntry markBillPaid(FinanceEntry bill, bool paid) => bill.copyWith(paid: paid);
FinanceSummary filteredMonthlySummary(List<FinanceEntry> entries, FinanceReportFilter filter) => calculateFinanceSummary(entries.where((entry) => !entry.date.isBefore(filter.from) && !entry.date.isAfter(filter.to)).toList());
List<double> cashFlowTrend(List<FinanceEntry> entries, int months, {DateTime? now}) {
  final anchor = now ?? DateTime.now();
  return [for (var i = months - 1; i >= 0; i--) filteredMonthlySummary(entries, FinanceReportFilter(from: DateTime(anchor.year, anchor.month - i), to: DateTime(anchor.year, anchor.month - i + 1, 0))).cashFlowInr];
}

const List<String> personalFinanceCategories = ['Income', 'Groceries', 'Bills', 'Health', 'Travel', 'Learning', 'Personal'];
const List<String> advancedFinanceComingSoon = ['Budget rules', 'Tax / GST', 'Investments', 'Loans', 'Credit cards'];
