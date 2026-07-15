import '../../models/life_models.dart';
import '../health_calculations.dart';

class HealthDateFilter {
  const HealthDateFilter({required this.from, required this.to});
  final DateTime from;
  final DateTime to;
}

class HealthTrendPoint {
  const HealthTrendPoint({required this.date, required this.type, required this.value});
  final DateTime date;
  final HealthMetricType type;
  final double value;
}

class HealthOfflineReport {
  const HealthOfflineReport({required this.summary, required this.suggestions});
  final String summary;
  final List<String> suggestions;
}

const firstVersionHealthMetrics = [HealthMetricType.steps, HealthMetricType.sleep, HealthMetricType.water, HealthMetricType.weight, HealthMetricType.exercise, HealthMetricType.mood, HealthMetricType.medicine];
const importedHealthMetrics = [HealthMetricType.steps, HealthMetricType.sleep, HealthMetricType.exercise, HealthMetricType.weight];
const manualHealthMetrics = [HealthMetricType.water, HealthMetricType.mood, HealthMetricType.medicine, HealthMetricType.weight, HealthMetricType.exercise];
const secondaryHealthComingSoon = ['Heart Rate', 'Blood Pressure', 'Blood Sugar', 'Calories', 'Distance', 'Active Minutes', 'BMI'];

List<HealthEntry> filterHealthEntries(List<HealthEntry> entries, HealthDateFilter filter) => entries.where((entry) => !entry.recordedAt.isBefore(filter.from) && !entry.recordedAt.isAfter(filter.to)).toList();

List<HealthTrendPoint> buildHealthTrend(List<HealthEntry> entries, HealthMetricType type, HealthDateFilter filter) => [for (final entry in filterHealthEntries(entries, filter).where((entry) => entry.type == type)) HealthTrendPoint(date: entry.recordedAt, type: entry.type, value: entry.value)]..sort((a, b) => a.date.compareTo(b.date));

bool isDuplicateImportedHealthEntry(HealthEntry entry, Set<String> importedIds) => importedIds.contains(entry.id);

HealthOfflineReport buildHealthOfflineReport(List<HealthEntry> entries, HealthDateFilter filter) {
  final summary = calculateHealthSummary(filterHealthEntries(entries, filter));
  return HealthOfflineReport(
    summary: '${summary.steps.toStringAsFixed(0)} steps, ${summary.sleepHours.toStringAsFixed(1)}h sleep, ${summary.waterLiters.toStringAsFixed(1)}L water, ${summary.exerciseMinutes.toStringAsFixed(0)} exercise minutes.',
    suggestions: [
      if (summary.steps < 8000) 'Take a short walk to improve step progress.',
      if (summary.sleepHours < 7) 'Plan an earlier sleep window tonight.',
      if (summary.waterLiters < 2) 'Drink more water before the day ends.',
      if (summary.medicineTaken == 0) 'Confirm whether medicine was taken today.',
    ],
  );
}
