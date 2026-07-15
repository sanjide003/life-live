import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/models/life_models.dart';
import 'package:livelife/src/services/health_integration_services.dart';
import 'package:livelife/src/state/life_providers.dart';

void main() {
  test('task provider supports CRUD-style updates', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    container.read(tasksProvider.notifier).upsert(LifeTask(id: 'provider-task', title: 'Provider task', area: TaskArea.work, completed: false));
    expect(container.read(tasksProvider).any((task) => task.id == 'provider-task'), isTrue);

    container.read(tasksProvider.notifier).delete('provider-task');
    expect(container.read(tasksProvider).any((task) => task.id == 'provider-task'), isFalse);
  });

  test('prayer provider recalculates settings and preserves progress state', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final before = container.read(prayerControllerProvider);
    container.read(prayerControllerProvider.notifier).updateSettings(before.settings.copyWith(manualAdjustments: const {'fajr': 1}));
    final after = container.read(prayerControllerProvider);

    expect(after.records, hasLength(5));
    expect(after.settings.manualAdjustments['fajr'], 1);
    expect(after.records.firstWhere((record) => record.id == 'fajr').completed, isTrue);
  });

  test('reminder and health providers expose safe state changes', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    container.read(reminderControllerProvider.notifier).requestPermission(true);
    container.read(reminderControllerProvider.notifier).setEnabled('task-review', true);
    expect(container.read(reminderControllerProvider).enabledCount, 1);

    container.read(healthIntegrationProvider.notifier).connect(const [HealthDataType.steps]);
    expect(container.read(healthIntegrationProvider).canRead(HealthDataType.steps), isTrue);
  });
}
