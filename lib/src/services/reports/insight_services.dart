import '../../models/life_models.dart';
import '../finance_calculations.dart';
import '../health_calculations.dart';
import '../prayer_calculations.dart';

class OfflineInsightReport {
  const OfflineInsightReport({required this.title, required this.summary, required this.nextActions});
  final String title;
  final String summary;
  final List<String> nextActions;

  String exportText() => '$title\n$summary\n${nextActions.map((action) => '- $action').join('\n')}';
}

OfflineInsightReport buildInsightReport({required List<LifeTask> tasks, required List<Habit> habits, required List<FinanceEntry> financeEntries, required List<HealthEntry> healthEntries, required List<PrayerRecord> prayerRecords}) {
  final finance = calculateFinanceSummary(financeEntries);
  final health = calculateHealthSummary(healthEntries);
  final prayer = calculatePrayerProgress(prayerRecords);
  final openTasks = tasks.where((task) => !task.completed).length;
  final habitConsistency = habits.isEmpty ? 0 : habits.where((habit) => habit.completedToday).length / habits.length;
  return OfflineInsightReport(
    title: 'Offline life insights',
    summary: '$openTasks open tasks, ${(habitConsistency * 100).toStringAsFixed(0)}% habit consistency, ${prayer.label} prayers, ₹${finance.cashFlowInr.toStringAsFixed(0)} cash flow, ${health.steps.toStringAsFixed(0)} steps.',
    nextActions: [
      if (openTasks > 0) 'Finish one high-priority task.',
      if (habitConsistency < 1) 'Recover one missed habit before sleep.',
      if (prayer.completed < prayer.total) 'Check remaining prayer progress.',
      if (finance.cashFlowInr < 0) 'Review expenses for this month.',
      if (health.steps < 8000) 'Take a short walk to improve step progress.',
    ],
  );
}
