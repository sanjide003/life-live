import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/reminder_services.dart';

void main() {
  test('reminders are disabled before Android notification permission is granted', () {
    final scheduler = const ReminderScheduler();
    final settings = scheduler.defaultSettings();

    final updated = scheduler.setPreferenceEnabled(settings, 'daily-closing', true);

    expect(settings.canSchedule, isFalse);
    expect(updated.enabledCount, 0);
    expect(updated.permissionLabel, 'Notification permission not requested');
  });

  test('permission grant allows reminder scheduling', () {
    final scheduler = const ReminderScheduler();
    final granted = scheduler.requestAndroidPermission(scheduler.defaultSettings(), userGranted: true);
    final enabled = scheduler.setPreferenceEnabled(granted, 'daily-closing', true);

    expect(enabled.canSchedule, isTrue);
    expect(enabled.enabledCount, 1);
    expect(scheduler.scheduledPreferences(enabled).single.title, 'Daily closing report');
  });

  test('permission denial disables all reminders', () {
    final scheduler = const ReminderScheduler();
    final granted = scheduler.requestAndroidPermission(scheduler.defaultSettings(), userGranted: true);
    final enabled = scheduler.setPreferenceEnabled(granted, 'prayer-all', true);
    final denied = scheduler.requestAndroidPermission(enabled, userGranted: false);

    expect(denied.canSchedule, isFalse);
    expect(denied.enabledCount, 0);
    expect(denied.permissionLabel, 'Notifications disabled');
  });
}
