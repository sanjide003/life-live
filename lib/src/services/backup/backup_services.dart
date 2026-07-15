import 'dart:convert';

import '../../data/life_repository.dart';

enum BackupImportMode { merge, replace }

class BackupPreview {
  const BackupPreview({required this.schemaVersion, required this.createdAt, required this.recordCounts});

  final int schemaVersion;
  final DateTime createdAt;
  final Map<String, int> recordCounts;

  int get totalRecords => recordCounts.values.fold(0, (sum, value) => sum + value);
}

class BackupImportResult {
  const BackupImportResult({required this.preview, required this.snapshot});

  final BackupPreview preview;
  final Map<String, Object?> snapshot;
}

class LifeBackupService {
  const LifeBackupService();

  String exportSnapshot(Map<String, Object?> snapshot, {DateTime? createdAt}) {
    final counts = _recordCounts(snapshot);
    return const JsonEncoder.withIndent('  ').convert({
      'app': 'Livelife',
      'backupVersion': 1,
      'schemaVersion': snapshot['schemaVersion'] ?? localSchemaVersion,
      'createdAt': (createdAt ?? DateTime.now()).toIso8601String(),
      'recordCounts': counts,
      'data': snapshot,
    });
  }

  BackupPreview preview(String backupJson) {
    final decoded = _decodeBackup(backupJson);
    return BackupPreview(
      schemaVersion: decoded['schemaVersion'] as int,
      createdAt: DateTime.parse(decoded['createdAt'] as String),
      recordCounts: Map<String, int>.from(decoded['recordCounts'] as Map),
    );
  }

  BackupImportResult importSnapshot(String backupJson, {required Map<String, Object?> currentSnapshot, required BackupImportMode mode}) {
    final decoded = _decodeBackup(backupJson);
    final incoming = Map<String, Object?>.from(decoded['data'] as Map);
    final snapshot = mode == BackupImportMode.replace ? incoming : _mergeSnapshots(currentSnapshot, incoming);
    return BackupImportResult(preview: preview(backupJson), snapshot: snapshot);
  }

  Map<String, Object?> _decodeBackup(String backupJson) {
    final decoded = jsonDecode(backupJson);
    if (decoded is! Map<String, Object?>) {
      throw const FormatException('Backup file is not a JSON object');
    }
    if (decoded['app'] != 'Livelife' || decoded['data'] is! Map) {
      throw const FormatException('Backup file is not a valid Livelife backup');
    }
    return decoded;
  }

  Map<String, int> _recordCounts(Map<String, Object?> snapshot) {
    const keys = ['tasks', 'habits', 'goals', 'financeEntries', 'healthEntries', 'prayerRecords', 'notes', 'dailyReviews'];
    return {for (final key in keys) key: ((snapshot[key] as List?) ?? const []).length};
  }

  Map<String, Object?> _mergeSnapshots(Map<String, Object?> current, Map<String, Object?> incoming) {
    final merged = Map<String, Object?>.from(current)..['schemaVersion'] = incoming['schemaVersion'] ?? current['schemaVersion'] ?? localSchemaVersion;
    for (final key in _recordCounts(current).keys) {
      final byId = <String, Map<String, Object?>>{};
      for (final item in ((current[key] as List?) ?? const [])) {
        final map = Map<String, Object?>.from(item as Map);
        byId[map['id'] as String] = map;
      }
      for (final item in ((incoming[key] as List?) ?? const [])) {
        final map = Map<String, Object?>.from(item as Map);
        byId[map['id'] as String] = map;
      }
      merged[key] = byId.values.toList();
    }
    return merged;
  }
}
