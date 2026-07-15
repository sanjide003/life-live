enum AuthStatus { signedOut, signedIn }

enum SyncStatus { localOnly, ready, queued, synced, conflict }

class AuthState {
  const AuthState.signedOut() : status = AuthStatus.signedOut, displayName = null, email = null;
  const AuthState.signedIn({required this.displayName, required this.email}) : status = AuthStatus.signedIn;

  final AuthStatus status;
  final String? displayName;
  final String? email;

  bool get isSignedIn => status == AuthStatus.signedIn;
  String get label => isSignedIn ? 'Signed in as $displayName' : 'Signed out • Local-first mode';
}

class SyncState {
  const SyncState({required this.status, required this.lastSyncLabel, required this.pendingWrites, this.conflictMessage});
  const SyncState.localOnly() : this(status: SyncStatus.localOnly, lastSyncLabel: 'Never synced', pendingWrites: 0);

  final SyncStatus status;
  final String lastSyncLabel;
  final int pendingWrites;
  final String? conflictMessage;

  String get label {
    switch (status) {
      case SyncStatus.localOnly:
        return 'Local-only backup is active';
      case SyncStatus.ready:
        return 'Firebase backup ready';
      case SyncStatus.queued:
        return '$pendingWrites local changes queued';
      case SyncStatus.synced:
        return 'Backup synced';
      case SyncStatus.conflict:
        return 'Conflict review needed';
    }
  }
}

class PrivacySettings {
  const PrivacySettings({required this.firebaseBackupEnabled, required this.exportEnabled, required this.importEnabled});

  final bool firebaseBackupEnabled;
  final bool exportEnabled;
  final bool importEnabled;

  PrivacySettings copyWith({bool? firebaseBackupEnabled, bool? exportEnabled, bool? importEnabled}) => PrivacySettings(
        firebaseBackupEnabled: firebaseBackupEnabled ?? this.firebaseBackupEnabled,
        exportEnabled: exportEnabled ?? this.exportEnabled,
        importEnabled: importEnabled ?? this.importEnabled,
      );
}

class SyncConflict {
  const SyncConflict({required this.localUpdatedAt, required this.remoteUpdatedAt});

  final DateTime localUpdatedAt;
  final DateTime remoteUpdatedAt;

  String resolveStrategy() {
    if (localUpdatedAt.isAfter(remoteUpdatedAt)) {
      return 'Keep local change and queue remote update';
    }
    if (remoteUpdatedAt.isAfter(localUpdatedAt)) {
      return 'Show conflict review before overwriting local data';
    }
    return 'No conflict; records match';
  }
}

class FirebaseSyncAdapter {
  const FirebaseSyncAdapter();

  SyncState signedOutState() => const SyncState.localOnly();
  SyncState signedInReadyState() => const SyncState(status: SyncStatus.ready, lastSyncLabel: 'Waiting for first backup', pendingWrites: 0);
  SyncState queuedState(int pendingWrites) => SyncState(status: SyncStatus.queued, lastSyncLabel: 'Offline writes pending', pendingWrites: pendingWrites);
}
