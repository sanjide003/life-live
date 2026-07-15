import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/models/life_models.dart';
import 'package:livelife/src/services/prayer_calculations.dart';

void main() {
  test('calculates five-prayer progress from seeded records', () {
    final progress = calculatePrayerProgress(LocalLifeRepository.seeded().getPrayerRecords());

    expect(progress.total, 5);
    expect(progress.completed, 2);
    expect(progress.label, '2 / 5');
    expect(progress.ratio, 0.4);
  });

  test('updates prayer completion through repository', () {
    final repository = LocalLifeRepository.seeded();
    final updatedAsr = PrayerRecord(
      id: 'asr',
      name: 'Asr',
      completed: true,
      timeLabel: '3:47 PM',
    );

    repository.updatePrayerRecord(updatedAsr);

    final progress = calculatePrayerProgress(repository.getPrayerRecords());
    expect(progress.completed, 3);
  });
  mainPrayerCalculationSettingsUpdate14();
}

void mainPrayerCalculationSettingsUpdate14() {
  test('calculates prayer times with different methods and Asr options', () {
    const engine = PrayerTimesEngine();
    final base = PrayerCalculationSettings.defaults(now: DateTime(2026, 7, 12)).copyWith(
      location: const PrayerLocation(label: 'Makkah', latitude: 21.3891, longitude: 39.8579, timeZoneOffset: Duration(hours: 3)),
    );

    final mwl = engine.calculateDailyPrayers(date: DateTime(2026, 7, 12), settings: base);
    final northAmerica = engine.calculateDailyPrayers(date: DateTime(2026, 7, 12), settings: base.copyWith(method: PrayerCalculationMethod.northAmerica));
    final hanafi = engine.calculateDailyPrayers(date: DateTime(2026, 7, 12), settings: base.copyWith(asrJuristicMethod: AsrJuristicMethod.hanafi));

    expect(mwl.map((record) => record.name), ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
    expect(northAmerica.first.timeLabel, isNot(mwl.first.timeLabel));
    expect(hanafi.firstWhere((record) => record.id == 'asr').timeLabel, isNot(mwl.firstWhere((record) => record.id == 'asr').timeLabel));
  });

  test('applies manual adjustments without resetting prayer completion progress', () {
    const engine = PrayerTimesEngine();
    final settings = PrayerCalculationSettings.defaults(now: DateTime(2026, 7, 12)).copyWith(manualAdjustments: const {'fajr': 10, 'isha': -5});
    final adjusted = engine.calculateDailyPrayers(
      date: DateTime(2026, 7, 12),
      settings: settings,
      existing: [PrayerRecord(id: 'fajr', name: 'Fajr', completed: true, timeLabel: 'old')],
    );

    expect(adjusted.first.completed, isTrue);
    expect(calculatePrayerProgress(adjusted).label, '1 / 5');
    expect(settings.manualAdjustments['fajr'], 10);
    expect(settings.manualAdjustments['isha'], -5);
  });
}
