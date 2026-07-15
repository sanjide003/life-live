import '../../models/life_models.dart';

class PrayerHistoryEntry {
  const PrayerHistoryEntry({required this.date, required this.prayerId, required this.completed, this.note = ''});
  final DateTime date;
  final String prayerId;
  final bool completed;
  final String note;
}

class QuranSession {
  const QuranSession({required this.date, required this.pagesRead, required this.versesRead});
  final DateTime date;
  final int pagesRead;
  final int versesRead;
}

class DhikrCounter {
  const DhikrCounter({required this.label, required this.count});
  final String label;
  final int count;
  DhikrCounter increment([int by = 1]) => DhikrCounter(label: label, count: count + by);
}

class SavedDua {
  const SavedDua({required this.title, required this.body});
  final String title;
  final String body;
}

class RamadanFastEntry {
  const RamadanFastEntry({required this.date, required this.fasted});
  final DateTime date;
  final bool fasted;
}

class CharityEntry {
  const CharityEntry({required this.date, required this.amountInr, required this.note});
  final DateTime date;
  final double amountInr;
  final String note;
}

Map<String, int> defaultPrayerReminderOffsets() => const {'fajr': -10, 'dhuhr': -10, 'asr': -10, 'maghrib': -5, 'isha': -10};
List<PrayerHistoryEntry> historyForDate(DateTime date, List<PrayerRecord> records) => [for (final record in records) PrayerHistoryEntry(date: date, prayerId: record.id, completed: record.completed, note: record.completed ? '' : 'Missed prayer note')];
double monthlyPrayerCompletionRatio(List<PrayerHistoryEntry> entries, DateTime month) {
  final monthEntries = entries.where((entry) => entry.date.year == month.year && entry.date.month == month.month).toList();
  if (monthEntries.isEmpty) return 0;
  return monthEntries.where((entry) => entry.completed).length / monthEntries.length;
}
int totalQuranPages(List<QuranSession> sessions) => sessions.fold(0, (sum, session) => sum + session.pagesRead);
int fastingDays(List<RamadanFastEntry> entries) => entries.where((entry) => entry.fasted).length;
double charityTotalInr(List<CharityEntry> entries) => entries.fold(0, (sum, entry) => sum + entry.amountInr);
