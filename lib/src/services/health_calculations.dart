import '../models/life_models.dart';

class HealthSummary {
  const HealthSummary({
    required this.steps,
    required this.sleepHours,
    required this.waterLiters,
    required this.weightKg,
    required this.exerciseMinutes,
    required this.moodScore,
    required this.medicineTaken,
  });

  final double steps;
  final double sleepHours;
  final double waterLiters;
  final double weightKg;
  final double exerciseMinutes;
  final double moodScore;
  final double medicineTaken;
}

HealthSummary calculateHealthSummary(List<HealthEntry> entries) {
  double valueFor(HealthMetricType type) {
    final matches = entries.where((entry) => entry.type == type);
    if (matches.isEmpty) {
      return 0;
    }
    return matches.last.value;
  }

  return HealthSummary(
    steps: valueFor(HealthMetricType.steps),
    sleepHours: valueFor(HealthMetricType.sleep),
    waterLiters: valueFor(HealthMetricType.water),
    weightKg: valueFor(HealthMetricType.weight),
    exerciseMinutes: valueFor(HealthMetricType.exercise),
    moodScore: valueFor(HealthMetricType.mood),
    medicineTaken: valueFor(HealthMetricType.medicine),
  );
}
