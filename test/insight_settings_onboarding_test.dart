import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/onboarding/onboarding_services.dart';
import 'package:livelife/src/services/reports/insight_services.dart';
import 'package:livelife/src/services/settings/settings_services.dart';

void main() {
  test('builds exportable offline insight reports', () {
    final repository = LocalLifeRepository.seeded();
    final report = buildInsightReport(tasks: repository.getTasks(), habits: repository.getHabits(), financeEntries: repository.getFinanceEntries(), healthEntries: repository.getHealthEntries(), prayerRecords: repository.getPrayerRecords());
    expect(report.summary, contains('prayers'));
    expect(report.exportText(), contains('Offline life insights'));
  });

  test('settings and onboarding model safe defaults', () {
    expect(ThemePreference.system.name, 'system');
    expect(onboardingSteps.map((step) => step.title), contains('Local-first privacy'));
    expect(const OnboardingState(completed: false, currentIndex: 0).next(onboardingSteps.length).completed, isFalse);
    expect(const OnboardingState(completed: false, currentIndex: 0).skip().completed, isTrue);
  });
}
