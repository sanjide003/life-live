import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/models/life_models.dart';
import 'package:livelife/src/services/health/health_mvp_services.dart';

void main() {
  test('filters health entries and builds trends/offline report for first-version metrics', () {
    final entries = LocalLifeRepository.seeded().getHealthEntries();
    final filter = HealthDateFilter(from: DateTime(2000), to: DateTime(2100));

    expect(firstVersionHealthMetrics, containsAll([HealthMetricType.steps, HealthMetricType.sleep, HealthMetricType.water, HealthMetricType.weight, HealthMetricType.exercise, HealthMetricType.mood, HealthMetricType.medicine]));
    expect(manualHealthMetrics, contains(HealthMetricType.medicine));
    expect(importedHealthMetrics, contains(HealthMetricType.steps));
    expect(buildHealthTrend(entries, HealthMetricType.steps, filter), isNotEmpty);
    expect(buildHealthOfflineReport(entries, filter).summary, contains('steps'));
    expect(secondaryHealthComingSoon, contains('BMI'));
  });

  test('detects imported health duplicates by id', () {
    final entry = LocalLifeRepository.seeded().getHealthEntries().first;
    expect(isDuplicateImportedHealthEntry(entry, {entry.id}), isTrue);
  });
}
