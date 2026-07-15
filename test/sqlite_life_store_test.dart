import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/data/sqlite_life_store.dart';
import 'package:livelife/src/models/life_models.dart';

void main() {
  test('sqlite store persists CRUD data across repository restart', () {
    final dir = Directory.systemTemp.createTempSync('livelife_sqlite_test_');
    final dbFile = File('${dir.path}/life.db');
    final store = SqliteLifeLocalStore(dbFile);
    final repository = LocalLifeRepository.seeded(store: store);

    repository.addTask(LifeTask(id: 'task-test', title: 'Persist me', area: TaskArea.personal, completed: false));
    repository.deleteTask('task-review');
    store.close();

    final restartedStore = SqliteLifeLocalStore(dbFile);
    final restarted = LocalLifeRepository.seeded(store: restartedStore);

    expect(restarted.getTasks().any((task) => task.id == 'task-test'), isTrue);
    expect(restarted.getTasks().any((task) => task.id == 'task-review'), isFalse);
    expect(restarted.toSnapshot()['schemaVersion'], localSchemaVersion);
    restartedStore.close();
    dir.deleteSync(recursive: true);
  });

  test('sqlite store migrates an existing snapshot shape', () {
    final dir = Directory.systemTemp.createTempSync('livelife_sqlite_migration_test_');
    final dbFile = File('${dir.path}/life.db');
    final store = SqliteLifeLocalStore(dbFile);
    final legacy = LocalLifeRepository.seeded().toSnapshot();

    store.migrateFromSnapshot(legacy);
    final restarted = LocalLifeRepository.seeded(store: store);

    expect(restarted.getFinanceEntries(), hasLength(3));
    expect(restarted.getPrayerRecords(), hasLength(5));
    store.close();
    dir.deleteSync(recursive: true);
  });

  test('sqlite store exposes production tables for enabled modules and settings', () {
    expect(sqliteLifeTables, containsAll(['tasks', 'habits', 'goals', 'financeEntries', 'healthEntries', 'prayerRecords', 'notes', 'dailyReviews', 'reminderSettings', 'prayerSettings', 'privacySyncSettings']));
  });
}
