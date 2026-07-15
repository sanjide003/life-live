import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/backup/backup_services.dart';

void main() {
  test('exports versioned backup with record counts and previews import', () {
    final snapshot = LocalLifeRepository.seeded().toSnapshot();
    const service = LifeBackupService();
    final json = service.exportSnapshot(snapshot, createdAt: DateTime(2026, 7, 12));
    final preview = service.preview(json);

    expect(preview.schemaVersion, localSchemaVersion);
    expect(preview.createdAt, DateTime(2026, 7, 12));
    expect(preview.recordCounts['tasks'], 4);
    expect(preview.totalRecords, greaterThan(0));
  });

  test('import can merge or replace snapshots', () {
    final current = LocalLifeRepository.seeded().toSnapshot();
    const service = LifeBackupService();
    final backup = service.exportSnapshot({...current, 'tasks': const []}, createdAt: DateTime(2026, 7, 12));

    final replaced = service.importSnapshot(backup, currentSnapshot: current, mode: BackupImportMode.replace);
    final merged = service.importSnapshot(backup, currentSnapshot: current, mode: BackupImportMode.merge);

    expect(replaced.snapshot['tasks'], isEmpty);
    expect(merged.snapshot['tasks'], isNotEmpty);
  });

  test('rejects corrupted backup files', () {
    const service = LifeBackupService();
    expect(() => service.preview('{"not":"livelife"}'), throwsFormatException);
  });
}
