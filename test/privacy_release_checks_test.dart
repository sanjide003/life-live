import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/privacy/privacy_services.dart';
import 'package:livelife/src/services/sync_services.dart';

void main() {
  test('backup disable keeps local-first state and can request remote deletion', () {
    const service = PrivacyLifecycleService();
    final result = service.disableBackup(const PrivacySettings(firebaseBackupEnabled: true, exportEnabled: true, importEnabled: true), deleteRemoteCopy: true);

    expect(result.privacySettings.firebaseBackupEnabled, isFalse);
    expect(result.syncState.status, SyncStatus.localOnly);
    expect(result.remoteDeletionRequired, isTrue);
  });

  test('release and privacy documents include required disclosures', () {
    expect(File('docs/ANDROID_RELEASE_CHECKLIST.md').readAsStringSync(), contains('flutter build appbundle --release'));
    expect(File('docs/PRIVACY_POLICY_DRAFT.md').readAsStringSync(), contains('Firebase backup is optional'));
    expect(File('docs/BETA_RELEASE_NOTES.md').readAsStringSync(), contains('Known production blockers'));
  });
}
