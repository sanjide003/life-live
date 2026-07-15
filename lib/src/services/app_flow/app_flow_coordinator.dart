import '../../data/life_repository.dart';
import '../auth/auth_services.dart';
import '../backup/backup_services.dart';
import '../health/health_connect_services.dart';
import '../notifications/local_notification_services.dart';
import '../privacy/privacy_services.dart';
import '../reminder_services.dart';
import '../sync/firestore_sync_service.dart';
import '../sync_services.dart';

class AppFlowCoordinator {
  const AppFlowCoordinator({required this.auth, required this.backup, required this.privacy, required this.notifications, required this.health, required this.sync});

  final OptionalAuthService auth;
  final LifeBackupService backup;
  final PrivacyLifecycleService privacy;
  final LocalNotificationScheduler notifications;
  final HealthConnectSyncService health;
  final FirebaseBackupSyncService sync;

  Future<AuthState> toggleSignIn() async => auth.currentUser.isSignedIn ? auth.signOut() : auth.signInWithGoogle();

  String exportBackup(LocalLifeRepository repository) => backup.exportSnapshot(repository.toSnapshot());

  BackupImportResult importBackup(String backupJson, LocalLifeRepository repository, BackupImportMode mode) => backup.importSnapshot(backupJson, currentSnapshot: repository.toSnapshot(), mode: mode);

  BackupDisableResult disableBackup(PrivacySettings settings, {required bool deleteRemoteCopy}) => privacy.disableBackup(settings, deleteRemoteCopy: deleteRemoteCopy);

  Future<List<ScheduledNotificationRequest>> rescheduleNotifications({required ReminderSettings settings, required DateTime now, required LocalLifeRepository repository}) => notifications.reschedule(settings: settings, now: now, tasks: repository.getTasks(), habits: repository.getHabits(), financeEntries: repository.getFinanceEntries(), prayerRecords: repository.getPrayerRecords());

  Future<HealthIntegrationState> connectHealth() => health.connect();

  Future<SyncState> syncBackup({required String userId, required bool backupEnabled, required LocalLifeRepository repository}) => sync.sync(userId: userId, backupEnabled: backupEnabled, repository: repository);
}
