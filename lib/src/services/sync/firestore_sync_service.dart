import 'package:cloud_firestore/cloud_firestore.dart';

import '../../data/life_repository.dart';
import '../sync_services.dart';

abstract class FirestoreSyncClient {
  Future<Map<String, Object?>?> downloadSnapshot(String userId);
  Future<void> uploadSnapshot(String userId, Map<String, Object?> snapshot);
}

class FirebaseBackupSyncService {
  const FirebaseBackupSyncService({required this.client});

  final FirestoreSyncClient client;

  Future<SyncState> sync({required String userId, required bool backupEnabled, required LocalLifeRepository repository}) async {
    if (!backupEnabled) {
      return const SyncState.localOnly();
    }
    final remote = await client.downloadSnapshot(userId);
    if (remote == null) {
      await client.uploadSnapshot(userId, repository.toSnapshot());
      return const SyncState(status: SyncStatus.synced, lastSyncLabel: 'Backup synced', pendingWrites: 0);
    }
    await client.uploadSnapshot(userId, repository.toSnapshot());
    return const SyncState(status: SyncStatus.synced, lastSyncLabel: 'Backup synced', pendingWrites: 0);
  }
}

class MemoryFirestoreSyncClient implements FirestoreSyncClient {
  final Map<String, Map<String, Object?>> _snapshots = {};

  @override
  Future<Map<String, Object?>?> downloadSnapshot(String userId) async => _snapshots[userId];

  @override
  Future<void> uploadSnapshot(String userId, Map<String, Object?> snapshot) async {
    _snapshots[userId] = Map<String, Object?>.from(snapshot);
  }
}


class CloudFirestoreSyncClient implements FirestoreSyncClient {
  CloudFirestoreSyncClient({FirebaseFirestore? firestore}) : firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore firestore;

  DocumentReference<Map<String, dynamic>> _snapshotRef(String userId) => firestore.collection('users').doc(userId).collection('snapshots').doc('current');

  @override
  Future<Map<String, Object?>?> downloadSnapshot(String userId) async {
    final doc = await _snapshotRef(userId).get();
    final data = doc.data();
    if (data == null) {
      return null;
    }
    return Map<String, Object?>.from(data['snapshot'] as Map);
  }

  @override
  Future<void> uploadSnapshot(String userId, Map<String, Object?> snapshot) async {
    await _snapshotRef(userId).set({
      'snapshot': snapshot,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
