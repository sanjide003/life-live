import '../../models/life_models.dart';
import '../health_integration_services.dart';

class HealthSample {
  const HealthSample({required this.type, required this.value, required this.unit, required this.recordedAt, required this.sourceId});
  final HealthDataType type;
  final double value;
  final String unit;
  final DateTime recordedAt;
  final String sourceId;
}

abstract class HealthConnectClient {
  Future<bool> isAvailable();
  Future<List<HealthDataType>> requestPermissions(List<HealthDataType> types);
  Future<List<HealthSample>> read(DateTime from, DateTime to, List<HealthDataType> types);
}

class FakeHealthConnectClient implements HealthConnectClient {
  FakeHealthConnectClient({this.available = true, this.granted = const [], this.samples = const []});
  final bool available;
  final List<HealthDataType> granted;
  final List<HealthSample> samples;
  @override
  Future<bool> isAvailable() async => available;
  @override
  Future<List<HealthDataType>> requestPermissions(List<HealthDataType> types) async => granted.where(types.contains).toList();
  @override
  Future<List<HealthSample>> read(DateTime from, DateTime to, List<HealthDataType> types) async => samples.where((sample) => types.contains(sample.type) && !sample.recordedAt.isBefore(from) && !sample.recordedAt.isAfter(to)).toList();
}

class HealthConnectSyncService {
  const HealthConnectSyncService({required this.client});
  final HealthConnectClient client;

  Future<HealthIntegrationState> connect() async {
    final boundary = const HealthIntegrationBoundary();
    final available = await client.isAvailable();
    if (!available) return boundary.requestPermissions(available: false, grantedTypes: const []);
    final granted = await client.requestPermissions(const [HealthDataType.steps, HealthDataType.sleep, HealthDataType.exercise, HealthDataType.weight]);
    return boundary.requestPermissions(available: true, grantedTypes: granted);
  }

  Future<List<HealthEntry>> readAllowed(HealthIntegrationState state, DateTime from, DateTime to, Set<String> importedSourceIds) async {
    if (!state.canReadAny) return const [];
    final samples = await client.read(from, to, state.grantedTypes);
    final unique = samples.where((sample) => importedSourceIds.add(sample.sourceId));
    return [for (final sample in unique) HealthEntry(id: 'health-${sample.sourceId}', type: _metric(sample.type), value: sample.value, unit: sample.unit, recordedAt: sample.recordedAt)];
  }

  HealthMetricType _metric(HealthDataType type) => switch (type) {
        HealthDataType.steps => HealthMetricType.steps,
        HealthDataType.sleep => HealthMetricType.sleep,
        HealthDataType.exercise => HealthMetricType.exercise,
        HealthDataType.weight => HealthMetricType.weight,
      };
}
