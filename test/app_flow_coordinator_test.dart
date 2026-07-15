import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/app_flow/app_flow_coordinator.dart';
import 'package:livelife/src/services/auth/auth_services.dart';
import 'package:livelife/src/services/backup/backup_services.dart';
import 'package:livelife/src/services/health/health_connect_services.dart';
import 'package:livelife/src/services/health_integration_services.dart';
import 'package:livelife/src/services/notifications/local_notification_services.dart';
import 'package:livelife/src/services/privacy/privacy_services.dart';
import 'package:livelife/src/services/reminder_services.dart';
import 'package:livelife/src/services/sync/firestore_sync_service.dart';
import 'package:livelife/src/services/sync_services.dart';

void main() {
  AppFlowCoordinator buildCoordinator(MemoryLocalNotificationClient notifications) => AppFlowCoordinator(
        auth: FakeGoogleAuthService(),
        backup: const LifeBackupService(),
        privacy: const PrivacyLifecycleService(),
        notifications: LocalNotificationScheduler(client: notifications),
        health: HealthConnectSyncService(client: FakeHealthConnectClient(granted: const [HealthDataType.steps])),
        sync: FirebaseBackupSyncService(client: MemoryFirestoreSyncClient()),
      );

  test('coordinator connects auth, backup import/export, notifications, health and sync fakes', () async {
    final repository = LocalLifeRepository.seeded();
    final notificationClient = MemoryLocalNotificationClient();
    final coordinator = buildCoordinator(notificationClient);

    expect((await coordinator.toggleSignIn()).status, AuthStatus.signedIn);
    final backupJson = coordinator.exportBackup(repository);
    expect(coordinator.importBackup(backupJson, repository, BackupImportMode.merge).preview.totalRecords, greaterThan(0));

    var reminders = const ReminderScheduler().requestAndroidPermission(const ReminderScheduler().defaultSettings(), userGranted: true);
    reminders = const ReminderScheduler().setPreferenceEnabled(reminders, 'daily-closing', true);
    final scheduled = await coordinator.rescheduleNotifications(settings: reminders, now: DateTime(2026, 7, 12), repository: repository);
    expect(scheduled, isNotEmpty);

    expect((await coordinator.connectHealth()).canRead(HealthDataType.steps), isTrue);
    expect((await coordinator.syncBackup(userId: 'user-1', backupEnabled: false, repository: repository)).status, SyncStatus.localOnly);
  });

  test('coordinator disables backup through privacy lifecycle', () {
    final coordinator = buildCoordinator(MemoryLocalNotificationClient());
    final result = coordinator.disableBackup(const PrivacySettings(firebaseBackupEnabled: true, exportEnabled: true, importEnabled: true), deleteRemoteCopy: true);

    expect(result.privacySettings.firebaseBackupEnabled, isFalse);
    expect(result.remoteDeletionRequired, isTrue);
  });
}
