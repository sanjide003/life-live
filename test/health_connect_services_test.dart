import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/health/health_connect_services.dart';
import 'package:livelife/src/services/health_integration_services.dart';

void main() {
  test('supports unavailable and partial Health Connect states', () async {
    final unavailable = HealthConnectSyncService(client: FakeHealthConnectClient(available: false));
    expect((await unavailable.connect()).status, HealthIntegrationStatus.unavailable);

    final partial = HealthConnectSyncService(client: FakeHealthConnectClient(granted: const [HealthDataType.steps]));
    final state = await partial.connect();
    expect(state.status, HealthIntegrationStatus.partial);
    expect(state.canRead(HealthDataType.steps), isTrue);
  });

  test('reads allowed samples and deduplicates imported source ids', () async {
    final service = HealthConnectSyncService(client: FakeHealthConnectClient(granted: const [HealthDataType.steps], samples: [HealthSample(type: HealthDataType.steps, value: 1000, unit: 'steps', recordedAt: DateTime(2026, 7, 12), sourceId: 'steps-1')]));
    final state = await service.connect();
    final imported = <String>{};

    final first = await service.readAllowed(state, DateTime(2026, 7, 1), DateTime(2026, 7, 31), imported);
    final second = await service.readAllowed(state, DateTime(2026, 7, 1), DateTime(2026, 7, 31), imported);

    expect(first, hasLength(1));
    expect(second, isEmpty);
  });
}
