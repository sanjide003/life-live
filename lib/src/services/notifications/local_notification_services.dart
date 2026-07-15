import '../../models/life_models.dart';
import '../prayer_calculations.dart';
import '../reminder_services.dart';

class ScheduledNotificationRequest {
  const ScheduledNotificationRequest({required this.id, required this.title, required this.body, required this.scheduledAt, required this.channel});
  final int id;
  final String title;
  final String body;
  final DateTime scheduledAt;
  final String channel;
}

abstract class LocalNotificationClient {
  Future<void> schedule(ScheduledNotificationRequest request);
  Future<void> cancelAll();
}

class MemoryLocalNotificationClient implements LocalNotificationClient {
  final List<ScheduledNotificationRequest> scheduled = [];
  @override
  Future<void> cancelAll() async => scheduled.clear();
  @override
  Future<void> schedule(ScheduledNotificationRequest request) async => scheduled.add(request);
}

class LocalNotificationScheduler {
  const LocalNotificationScheduler({required this.client});
  final LocalNotificationClient client;

  Future<List<ScheduledNotificationRequest>> reschedule({required ReminderSettings settings, required DateTime now, required List<LifeTask> tasks, required List<Habit> habits, required List<FinanceEntry> financeEntries, required List<PrayerRecord> prayerRecords}) async {
    await client.cancelAll();
    if (!settings.canSchedule) return const [];
    final requests = buildSchedule(settings: settings, now: now, tasks: tasks, habits: habits, financeEntries: financeEntries, prayerRecords: prayerRecords);
    for (final request in requests) {
      await client.schedule(request);
    }
    return requests;
  }

  List<ScheduledNotificationRequest> buildSchedule({required ReminderSettings settings, required DateTime now, required List<LifeTask> tasks, required List<Habit> habits, required List<FinanceEntry> financeEntries, required List<PrayerRecord> prayerRecords}) {
    if (!settings.canSchedule) return const [];
    final enabled = {for (final preference in settings.preferences.where((preference) => preference.enabled)) preference.id};
    return [
      if (enabled.contains('daily-closing')) ScheduledNotificationRequest(id: 100, title: 'Daily closing report', body: 'Review today and plan tomorrow.', scheduledAt: _todayAt(now, 21, 30), channel: 'daily'),
      if (enabled.contains('task-review')) ScheduledNotificationRequest(id: 101, title: 'Planner review', body: '${tasks.where((task) => !task.completed).length} tasks are still open.', scheduledAt: _todayAt(now, 20, 30), channel: 'planner'),
      if (enabled.contains('habit-water')) ScheduledNotificationRequest(id: 102, title: 'Habit reminders', body: '${habits.where((habit) => !habit.completedToday).length} habits need attention.', scheduledAt: now.add(const Duration(hours: 2)), channel: 'habits'),
      if (enabled.contains('bill-due'))
        for (final bill in financeEntries.where((entry) => entry.type == FinanceType.bill && !entry.paid)) ScheduledNotificationRequest(id: bill.id.hashCode, title: 'Bill due reminder', body: '${bill.title} is due soon.', scheduledAt: bill.date.subtract(const Duration(days: 1)), channel: 'finance'),
      if (enabled.contains('prayer-all'))
        for (final prayer in prayerRecords) ScheduledNotificationRequest(id: prayer.id.hashCode, title: '${prayer.name} reminder', body: 'It is time for ${prayer.name}.', scheduledAt: _nextPrayerTime(now, prayer.timeLabel), channel: 'prayer'),
    ]..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
  }

  DateTime _todayAt(DateTime now, int hour, int minute) => DateTime(now.year, now.month, now.day, hour, minute);
  DateTime _nextPrayerTime(DateTime now, String label) {
    final parts = label.split(RegExp('[: ]'));
    var hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final pm = parts[2] == 'PM';
    if (pm && hour != 12) hour += 12;
    if (!pm && hour == 12) hour = 0;
    final candidate = DateTime(now.year, now.month, now.day, hour, minute);
    return candidate.isBefore(now) ? candidate.add(const Duration(days: 1)) : candidate;
  }
}

List<PrayerRecord> recalculatePrayerRemindersForTimezone({required DateTime date, required PrayerCalculationSettings settings, required Duration timezoneOffset}) {
  final location = PrayerLocation(label: settings.location.label, latitude: settings.location.latitude, longitude: settings.location.longitude, timeZoneOffset: timezoneOffset);
  return const PrayerTimesEngine().calculateDailyPrayers(date: date, settings: settings.copyWith(location: location));
}
