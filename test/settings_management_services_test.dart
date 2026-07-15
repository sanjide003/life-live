import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/onboarding/onboarding_persistence_services.dart';
import 'package:livelife/src/services/privacy/privacy_services.dart';
import 'package:livelife/src/services/settings/settings_management_services.dart';
import 'package:livelife/src/services/sync_services.dart';

void main() {
  test('settings service plans reset, cloud deletion, backup disable and onboarding reset', () async {
    final service = SettingsManagementService(privacy: const PrivacyLifecycleService(), onboarding: OnboardingController(MemoryOnboardingStore()));

    expect(service.resetLocalDataPlan().requiresConfirmation, isTrue);
    expect(service.deleteCloudBackupPlan().deleteCloud, isTrue);
    expect(service.disableBackup(const PrivacySettings(firebaseBackupEnabled: true, exportEnabled: true, importEnabled: true), deleteRemoteCopy: false).privacySettings.firebaseBackupEnabled, isFalse);
    expect((await service.resetOnboarding()).message, contains('Onboarding reset'));
  });
}
