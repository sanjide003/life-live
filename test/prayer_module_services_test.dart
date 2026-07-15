import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/prayer/prayer_module_services.dart';

void main() {
  test('tracks prayer history, offsets, Quran, dhikr, fasting and charity', () {
    final history = historyForDate(DateTime(2026, 7, 12), LocalLifeRepository.seeded().getPrayerRecords());
    expect(defaultPrayerReminderOffsets()['fajr'], -10);
    expect(monthlyPrayerCompletionRatio(history, DateTime(2026, 7)), 0.4);
    expect(totalQuranPages([QuranSession(date: DateTime(2026, 7, 12), pagesRead: 4, versesRead: 20)]), 4);
    expect(const DhikrCounter(label: 'SubhanAllah', count: 0).increment(33).count, 33);
    expect(fastingDays([RamadanFastEntry(date: DateTime(2026, 3, 1), fasted: true)]), 1);
    expect(charityTotalInr([CharityEntry(date: DateTime(2026, 3, 1), amountInr: 100, note: 'Sadaqah')]), 100);
  });
}
