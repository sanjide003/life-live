import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/sync_services.dart';

void main() {
  test('signed-out users remain in local-only mode', () {
    const auth = AuthState.signedOut();
    final sync = const FirebaseSyncAdapter().signedOutState();

    expect(auth.isSignedIn, isFalse);
    expect(sync.status, SyncStatus.localOnly);
    expect(sync.label, 'Local-only backup is active');
  });

  test('signed-in state can prepare Firebase backup without forcing sync', () {
    const auth = AuthState.signedIn(displayName: 'Livelife User', email: 'user@example.com');
    final sync = const FirebaseSyncAdapter().signedInReadyState();

    expect(auth.isSignedIn, isTrue);
    expect(sync.status, SyncStatus.ready);
    expect(sync.lastSyncLabel, 'Waiting for first backup');
  });

  test('conflict strategy protects local data until reviewed', () {
    final conflict = SyncConflict(
      localUpdatedAt: DateTime(2026, 7, 11, 12),
      remoteUpdatedAt: DateTime(2026, 7, 11, 13),
    );

    expect(conflict.resolveStrategy(), 'Show conflict review before overwriting local data');
  });
}
