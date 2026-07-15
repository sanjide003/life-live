import '../../models/life_models.dart';
import '../finance_calculations.dart';
import '../health/health_mvp_services.dart';
import '../health_calculations.dart';
import '../prayer_calculations.dart';

class RichOfflineReport {
  const RichOfflineReport({required this.title, required this.summary, required this.sections, required this.nextActions});
  final String title;
  final String summary;
  final Map<String, String> sections;
  final List<String> nextActions;

  String exportText() => [title, summary, ...sections.entries.map((entry) => '${entry.key}: ${entry.value}'), 'Next actions:', ...nextActions.map((action) => '- $action')].join('\n');
}

RichOfflineReport buildRichDailyReport({required List<LifeTask> tasks, required List<Habit> habits, required List<FinanceEntry> financeEntries, required List<HealthEntry> healthEntries, required List<PrayerRecord> prayerRecords}) {
  final completedTasks = tasks.where((task) => task.completed).length;
  final habitRatio = habits.isEmpty ? 0 : habits.where((habit) => habit.completedToday).length / habits.length;
  final finance = calculateFinanceSummary(financeEntries);
  final health = calculateHealthSummary(healthEntries);
  final prayer = calculatePrayerProgress(prayerRecords);
  final healthReport = buildHealthOfflineReport(healthEntries, HealthDateFilter(from: DateTime(2000), to: DateTime(2100)));
  return RichOfflineReport(
    title: 'Daily offline report',
    summary: '$completedTasks/${tasks.length} tasks, ${(habitRatio * 100).toStringAsFixed(0)}% habits, ${prayer.label} prayers.',
    sections: {
      'Habit consistency': '${(habitRatio * 100).toStringAsFixed(0)}%',
      'Health trend': healthReport.summary,
      'Finance cash flow': '₹${finance.cashFlowInr.toStringAsFixed(0)}',
      'Prayer consistency': prayer.label,
    },
    nextActions: [
      if (completedTasks < tasks.length) 'Complete one remaining task.',
      if (habitRatio < 1) 'Recover one habit before sleep.',
      if (finance.cashFlowInr < 0) 'Review today\'s expenses.',
      if (health.steps < 8000) 'Walk for ten minutes.',
      if (prayer.completed < prayer.total) 'Check remaining prayers.',
    ],
  );
}
