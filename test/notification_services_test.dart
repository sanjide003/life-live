import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/notifications/local_notification_services.dart';
import 'package:livelife/src/services/reminder_services.dart';

void main() {
  test('does not schedule reminders until notification permission is granted', () async {
    final repository = LocalLifeRepository.seeded();
    final client = MemoryLocalNotificationClient();
    final scheduler = LocalNotificationScheduler(client: client);

    final scheduled = await scheduler.reschedule(settings: const ReminderScheduler().defaultSettings(), now: DateTime(2026, 7, 12, 10), tasks: repository.getTasks(), habits: repository.getHabits(), financeEntries: repository.getFinanceEntries(), prayerRecords: repository.getPrayerRecords());

    expect(scheduled, isEmpty);
    expect(client.scheduled, isEmpty);
  });

  test('schedules enabled planner, habit, prayer, bill and daily report reminders', () async {
    final repository = LocalLifeRepository.seeded();
    final client = MemoryLocalNotificationClient();
    final scheduler = LocalNotificationScheduler(client: client);
    var settings = const ReminderScheduler().requestAndroidPermission(const ReminderScheduler().defaultSettings(), userGranted: true);
    for (final id in ['daily-closing', 'task-review', 'habit-water', 'prayer-all', 'bill-due']) {
      settings = const ReminderScheduler().setPreferenceEnabled(settings, id, true);
    }

    final scheduled = await scheduler.reschedule(settings: settings, now: DateTime(2026, 7, 12, 10), tasks: repository.getTasks(), habits: repository.getHabits(), financeEntries: repository.getFinanceEntries(), prayerRecords: repository.getPrayerRecords());

    expect(scheduled.map((item) => item.channel), containsAll(['daily', 'planner', 'habits', 'prayer', 'finance']));
    expect(client.scheduled, hasLength(scheduled.length));
  });
}
