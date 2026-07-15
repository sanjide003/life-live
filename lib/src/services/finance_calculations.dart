import '../models/life_models.dart';

class FinanceSummary {
  const FinanceSummary({
    required this.incomeInr,
    required this.expenseInr,
    required this.pendingBillsInr,
  });

  final double incomeInr;
  final double expenseInr;
  final double pendingBillsInr;

  double get cashFlowInr => incomeInr - expenseInr - pendingBillsInr;
}

FinanceSummary calculateFinanceSummary(List<FinanceEntry> entries) {
  double income = 0;
  double expense = 0;
  double pendingBills = 0;

  for (final entry in entries) {
    switch (entry.type) {
      case FinanceType.income:
        income += entry.amountInr;
        break;
      case FinanceType.expense:
        expense += entry.amountInr;
        break;
      case FinanceType.bill:
        if (!entry.paid) {
          pendingBills += entry.amountInr;
        }
        break;
    }
  }

  return FinanceSummary(
    incomeInr: income,
    expenseInr: expense,
    pendingBillsInr: pendingBills,
  );
}

String financeTypeLabel(FinanceType type) {
  switch (type) {
    case FinanceType.income:
      return 'Income';
    case FinanceType.expense:
      return 'Expense';
    case FinanceType.bill:
      return 'Pending bill';
  }
}
