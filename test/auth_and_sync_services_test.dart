import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/auth/auth_services.dart';
import 'package:livelife/src/services/sync/firestore_sync_service.dart';
import 'package:livelife/src/services/sync_services.dart';

void main() {
  test('fake auth preserves local-first signed out default and supports optional sign in', () async {
    final auth = FakeGoogleAuthService();

    expect(auth.currentUser.status, AuthStatus.signedOut);
    final signedIn = await auth.signInWithGoogle();
    expect(signedIn.status, AuthStatus.signedIn);

    final signedOut = await auth.signOut();
    expect(signedOut.status, AuthStatus.signedOut);
  });

  test('firebase backup sync stays local-only until backup is enabled', () async {
    final service = FirebaseBackupSyncService(client: MemoryFirestoreSyncClient());
    final repository = LocalLifeRepository.seeded();

    final localOnly = await service.sync(userId: 'user-1', backupEnabled: false, repository: repository);
    expect(localOnly.status, SyncStatus.localOnly);

    final synced = await service.sync(userId: 'user-1', backupEnabled: true, repository: repository);
    expect(synced.status, SyncStatus.synced);
  });
}
