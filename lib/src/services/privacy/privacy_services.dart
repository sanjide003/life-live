import '../../data/life_repository.dart';
import '../sync_services.dart';

class BackupDisableResult {
  const BackupDisableResult({required this.privacySettings, required this.syncState, required this.remoteDeletionRequired});
  final PrivacySettings privacySettings;
  final SyncState syncState;
  final bool remoteDeletionRequired;
}

class DataDeletionPlan {
  const DataDeletionPlan({required this.deleteLocal, required this.deleteCloud, required this.requiresConfirmation, required this.message});
  final bool deleteLocal;
  final bool deleteCloud;
  final bool requiresConfirmation;
  final String message;
}

class PrivacyLifecycleService {
  const PrivacyLifecycleService();

  BackupDisableResult disableBackup(PrivacySettings settings, {required bool deleteRemoteCopy}) => BackupDisableResult(
        privacySettings: settings.copyWith(firebaseBackupEnabled: false),
        syncState: const SyncState.localOnly(),
        remoteDeletionRequired: deleteRemoteCopy,
      );

  DataDeletionPlan buildDeletionPlan({required bool deleteLocal, required bool deleteCloud}) => DataDeletionPlan(
        deleteLocal: deleteLocal,
        deleteCloud: deleteCloud,
        requiresConfirmation: deleteLocal || deleteCloud,
        message: deleteCloud ? 'Cloud backup deletion requires confirmation.' : 'Local data deletion requires confirmation.',
      );

  Map<String, Object?> emptyLocalSnapshot() => {
        'schemaVersion': localSchemaVersion,
        'tasks': const [],
        'habits': const [],
        'goals': const [],
        'financeEntries': const [],
        'healthEntries': const [],
        'prayerRecords': const [],
        'notes': const [],
        'dailyReviews': const [],
      };
}
