import '../models/life_models.dart';

enum HealthIntegrationStatus { notConnected, permissionDenied, connected, partial, unavailable }

enum HealthDataType { steps, sleep, exercise, weight }

class HealthIntegrationState {
  const HealthIntegrationState({required this.status, required this.grantedTypes, required this.message});

  const HealthIntegrationState.notConnected()
      : status = HealthIntegrationStatus.notConnected,
        grantedTypes = const [],
        message = 'Health Connect / Google Fit is not connected';

  final HealthIntegrationStatus status;
  final List<HealthDataType> grantedTypes;
  final String message;

  bool get canReadAny => status == HealthIntegrationStatus.connected || status == HealthIntegrationStatus.partial;
  bool canRead(HealthDataType type) => grantedTypes.contains(type);

  String get label {
    switch (status) {
      case HealthIntegrationStatus.notConnected:
        return 'Not connected';
      case HealthIntegrationStatus.permissionDenied:
        return 'Permission denied';
      case HealthIntegrationStatus.connected:
        return 'Connected';
      case HealthIntegrationStatus.partial:
        return 'Partially connected';
      case HealthIntegrationStatus.unavailable:
        return 'Unavailable on this device';
    }
  }
}

class HealthIntegrationBoundary {
  const HealthIntegrationBoundary();

  HealthIntegrationState requestPermissions({required bool available, required List<HealthDataType> grantedTypes}) {
    if (!available) {
      return const HealthIntegrationState(status: HealthIntegrationStatus.unavailable, grantedTypes: [], message: 'Health Connect / Google Fit is not available on this Android device');
    }
    if (grantedTypes.isEmpty) {
      return const HealthIntegrationState(status: HealthIntegrationStatus.permissionDenied, grantedTypes: [], message: 'No health permissions were granted');
    }
    if (grantedTypes.length < HealthDataType.values.length) {
      return HealthIntegrationState(status: HealthIntegrationStatus.partial, grantedTypes: grantedTypes, message: 'Some health permissions were granted');
    }
    return HealthIntegrationState(status: HealthIntegrationStatus.connected, grantedTypes: grantedTypes, message: 'Health Connect / Google Fit is connected');
  }

  List<HealthEntry> readAllowedSampleData(HealthIntegrationState state, DateTime recordedAt) {
    if (!state.canReadAny) {
      return const [];
    }
    return [
      if (state.canRead(HealthDataType.steps)) HealthEntry(id: 'sync-steps', type: HealthMetricType.steps, value: 7200, unit: 'steps', recordedAt: recordedAt),
      if (state.canRead(HealthDataType.sleep)) HealthEntry(id: 'sync-sleep', type: HealthMetricType.sleep, value: 7.1, unit: 'h', recordedAt: recordedAt),
      if (state.canRead(HealthDataType.exercise)) HealthEntry(id: 'sync-exercise', type: HealthMetricType.exercise, value: 42, unit: 'min', recordedAt: recordedAt),
      if (state.canRead(HealthDataType.weight)) HealthEntry(id: 'sync-weight', type: HealthMetricType.weight, value: 71.5, unit: 'kg', recordedAt: recordedAt),
    ];
  }
}
