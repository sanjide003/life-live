import '../models/life_models.dart';
import 'finance_calculations.dart';
import 'health_calculations.dart';
import 'prayer_calculations.dart';

class LifeReport {
  const LifeReport({required this.title, required this.summary, required this.suggestions});

  final String title;
  final String summary;
  final List<String> suggestions;
}

LifeReport buildDailyClosingReport({
  required List<LifeTask> tasks,
  required List<Habit> habits,
  required List<FinanceEntry> financeEntries,
  required List<HealthEntry> healthEntries,
  required List<PrayerRecord> prayerRecords,
}) {
  final completedTasks = tasks.where((task) => task.completed).length;
  final completedHabits = habits.where((habit) => habit.completedToday).length;
  final finance = calculateFinanceSummary(financeEntries);
  final health = calculateHealthSummary(healthEntries);
  final prayer = calculatePrayerProgress(prayerRecords);

  return LifeReport(
    title: 'Daily closing report',
    summary: '$completedTasks/${tasks.length} tasks, $completedHabits/${habits.length} habits, ${prayer.label} prayers, ₹${finance.cashFlowInr.toStringAsFixed(0)} cash flow, ${health.steps.toStringAsFixed(0)} steps.',
    suggestions: buildOfflineSuggestions(
      tasks: tasks,
      habits: habits,
      financeEntries: financeEntries,
      healthEntries: healthEntries,
      prayerRecords: prayerRecords,
    ),
  );
}

LifeReport buildWeeklyReview({
  required List<LifeTask> tasks,
  required List<Habit> habits,
  required List<FinanceEntry> financeEntries,
  required List<PrayerRecord> prayerRecords,
}) {
  final finance = calculateFinanceSummary(financeEntries);
  final prayer = calculatePrayerProgress(prayerRecords);
  final activeStreaks = habits.where((habit) => habit.streak > 0).length;

  return LifeReport(
    title: 'Weekly review',
    summary: '${tasks.where((task) => task.completed).length} completed tasks, $activeStreaks active streaks, ${prayer.label} prayer progress, ₹${finance.expenseInr.toStringAsFixed(0)} expenses reviewed.',
    suggestions: const [
      'Review unfinished planner items before setting next week priorities.',
      'Keep Bank / UPI entries updated so cash flow remains accurate.',
    ],
  );
}

LifeReport buildMonthlyReview({
  required List<Goal> goals,
  required List<FinanceEntry> financeEntries,
  required List<Habit> habits,
}) {
  final finance = calculateFinanceSummary(financeEntries);
  final averageGoalProgress = goals.isEmpty ? 0 : goals.map((goal) => goal.progress).reduce((a, b) => a + b) / goals.length;

  return LifeReport(
    title: 'Monthly review',
    summary: '${goals.length} goals tracked, ${(averageGoalProgress * 100).toStringAsFixed(0)}% average goal progress, ₹${finance.cashFlowInr.toStringAsFixed(0)} projected cash flow, ${habits.length} habits monitored.',
    suggestions: const [
      'Move one goal milestone into next week\'s planner.',
      'Check whether recurring bills are already listed before month end.',
    ],
  );
}

List<String> buildOfflineSuggestions({
  required List<LifeTask> tasks,
  required List<Habit> habits,
  required List<FinanceEntry> financeEntries,
  required List<HealthEntry> healthEntries,
  required List<PrayerRecord> prayerRecords,
}) {
  final suggestions = <String>[];
  final pendingTasks = tasks.where((task) => !task.completed).length;
  final missedHabits = habits.where((habit) => !habit.completedToday).length;
  final finance = calculateFinanceSummary(financeEntries);
  final health = calculateHealthSummary(healthEntries);
  final prayer = calculatePrayerProgress(prayerRecords);

  if (pendingTasks > 0) {
    suggestions.add('Finish or reschedule $pendingTasks pending planner items before sleep.');
  }
  if (missedHabits > 0) {
    suggestions.add('Complete one small habit now to protect your streaks.');
  }
  if (finance.pendingBillsInr > 0) {
    suggestions.add('Review pending bills worth ₹${finance.pendingBillsInr.toStringAsFixed(0)}.');
  }
  if (health.waterLiters < 2) {
    suggestions.add('Drink water now; current intake is ${health.waterLiters.toStringAsFixed(1)} L.');
  }
  if (prayer.completed < prayer.total) {
    suggestions.add('Prayer progress is ${prayer.label}; check the remaining prayers.');
  }

  return suggestions;
}
