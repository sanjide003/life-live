import '../backup/backup_services.dart';
import '../onboarding/onboarding_persistence_services.dart';
import '../privacy/privacy_services.dart';
import '../sync_services.dart';

class SettingsActionResult {
  const SettingsActionResult({required this.message, this.requiresConfirmation = false});
  final String message;
  final bool requiresConfirmation;
}

class SettingsManagementService {
  const SettingsManagementService({required this.privacy, required this.onboarding});
  final PrivacyLifecycleService privacy;
  final OnboardingController onboarding;

  BackupDisableResult disableBackup(PrivacySettings settings, {required bool deleteRemoteCopy}) => privacy.disableBackup(settings, deleteRemoteCopy: deleteRemoteCopy);
  DataDeletionPlan resetLocalDataPlan() => privacy.buildDeletionPlan(deleteLocal: true, deleteCloud: false);
  DataDeletionPlan deleteCloudBackupPlan() => privacy.buildDeletionPlan(deleteLocal: false, deleteCloud: true);
  Future<SettingsActionResult> resetOnboarding() async {
    await onboarding.reset();
    return const SettingsActionResult(message: 'Onboarding reset complete');
  }

  BackupImportResult previewImport(LifeBackupService backup, String backupJson, Map<String, Object?> currentSnapshot) => backup.importSnapshot(backupJson, currentSnapshot: currentSnapshot, mode: BackupImportMode.merge);
}
