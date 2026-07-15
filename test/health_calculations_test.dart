import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/health_calculations.dart';

void main() {
  test('summarizes primary health metrics from seeded entries', () {
    final summary = calculateHealthSummary(LocalLifeRepository.seeded().getHealthEntries());

    expect(summary.steps, 6400);
    expect(summary.sleepHours, 6.5);
    expect(summary.waterLiters, 1.8);
    expect(summary.weightKg, 72);
    expect(summary.exerciseMinutes, 35);
    expect(summary.moodScore, 4);
    expect(summary.medicineTaken, 1);
  });
}
