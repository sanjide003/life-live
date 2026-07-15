import 'dart:convert';
import 'dart:io';

import 'package:sqlite3/sqlite3.dart';

import 'life_repository.dart';

const List<String> sqliteLifeTables = [
  'tasks',
  'habits',
  'goals',
  'financeEntries',
  'healthEntries',
  'prayerRecords',
  'notes',
  'dailyReviews',
  'reminderSettings',
  'prayerSettings',
  'privacySyncSettings',
];

class SqliteLifeLocalStore implements LifeLocalStore {
  SqliteLifeLocalStore(this.file) {
    file.parent.createSync(recursive: true);
    _db = sqlite3.open(file.path);
    _migrate();
  }

  final File file;
  late final Database _db;

  void close() => _db.dispose();

  void migrateFromSnapshot(Map<String, Object?> legacySnapshot) {
    writeSnapshot({
      'schemaVersion': legacySnapshot['schemaVersion'] ?? localSchemaVersion,
      for (final table in sqliteLifeTables) table: legacySnapshot[table] ?? const [],
    });
  }

  @override
  Map<String, Object?>? readSnapshot() {
    final metadata = _db.select("SELECT value_json FROM metadata WHERE key = 'schemaVersion' LIMIT 1");
    if (metadata.isEmpty) {
      return null;
    }
    final snapshot = <String, Object?>{'schemaVersion': jsonDecode(metadata.first['value_json'] as String)};
    for (final table in sqliteLifeTables) {
      final rows = _db.select('SELECT payload_json FROM $table ORDER BY id');
      snapshot[table] = [for (final row in rows) jsonDecode(row['payload_json'] as String) as Map<String, Object?>];
    }
    return snapshot;
  }

  @override
  void writeSnapshot(Map<String, Object?> snapshot) {
    _db.execute('BEGIN IMMEDIATE');
    try {
      _db.execute(
        'INSERT OR REPLACE INTO metadata(key, value_json, updated_at) VALUES (?, ?, ?)',
        ['schemaVersion', jsonEncode(snapshot['schemaVersion'] ?? localSchemaVersion), DateTime.now().toIso8601String()],
      );
      for (final table in sqliteLifeTables) {
        final records = (snapshot[table] as List?) ?? const [];
        _db.execute('DELETE FROM $table');
        for (final item in records) {
          final map = Map<String, Object?>.from(item as Map);
          _db.execute(
            'INSERT OR REPLACE INTO $table(id, payload_json, updated_at) VALUES (?, ?, ?)',
            [map['id'] as String? ?? table, jsonEncode(map), map['updatedAt'] as String? ?? DateTime.now().toIso8601String()],
          );
        }
      }
      _db.execute('COMMIT');
    } catch (_) {
      _db.execute('ROLLBACK');
      rethrow;
    }
  }

  void _migrate() {
    _db.execute('PRAGMA journal_mode = WAL');
    _db.execute('CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL)');
    for (final table in sqliteLifeTables) {
      _db.execute('CREATE TABLE IF NOT EXISTS $table(id TEXT PRIMARY KEY, payload_json TEXT NOT NULL, updated_at TEXT NOT NULL)');
      _db.execute('CREATE INDEX IF NOT EXISTS idx_${table}_updated_at ON $table(updated_at)');
    }
  }
}
