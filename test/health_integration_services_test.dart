import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/models/life_models.dart';
import 'package:livelife/src/services/health_calculations.dart';
import 'package:livelife/src/services/health_integration_services.dart';

void main() {
  test('health integration stays blocked without explicit consent', () {
    const boundary = HealthIntegrationBoundary();
    final denied = boundary.requestPermissions(available: true, grantedTypes: const []);

    expect(denied.status, HealthIntegrationStatus.permissionDenied);
    expect(boundary.readAllowedSampleData(denied, DateTime(2026, 7, 11)), isEmpty);
  });

  test('partial permissions read only allowed Android health data', () {
    const boundary = HealthIntegrationBoundary();
    final partial = boundary.requestPermissions(available: true, grantedTypes: const [HealthDataType.steps, HealthDataType.sleep]);
    final entries = boundary.readAllowedSampleData(partial, DateTime(2026, 7, 11));

    expect(partial.status, HealthIntegrationStatus.partial);
    expect(entries.map((entry) => entry.type), containsAll([HealthMetricType.steps, HealthMetricType.sleep]));
    expect(entries.any((entry) => entry.type == HealthMetricType.exercise), isFalse);
  });

  test('connected health sync updates primary summary values', () {
    const boundary = HealthIntegrationBoundary();
    final connected = boundary.requestPermissions(available: true, grantedTypes: HealthDataType.values);
    final summary = calculateHealthSummary(boundary.readAllowedSampleData(connected, DateTime(2026, 7, 11)));

    expect(connected.status, HealthIntegrationStatus.connected);
    expect(summary.steps, 7200);
    expect(summary.sleepHours, 7.1);
    expect(summary.exerciseMinutes, 42);
    expect(summary.weightKg, 71.5);
  });
}
