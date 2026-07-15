import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/life_reports.dart';

void main() {
  test('daily closing report uses local data and offline suggestions', () {
    final repository = LocalLifeRepository.seeded();
    final report = buildDailyClosingReport(
      tasks: repository.getTasks(),
      habits: repository.getHabits(),
      financeEntries: repository.getFinanceEntries(),
      healthEntries: repository.getHealthEntries(),
      prayerRecords: repository.getPrayerRecords(),
    );

    expect(report.title, 'Daily closing report');
    expect(report.summary, contains('tasks'));
    expect(report.summary, contains('prayers'));
    expect(report.suggestions, isNotEmpty);
    expect(report.suggestions.any((suggestion) => suggestion.contains('Prayer progress')), isTrue);
  });

  test('weekly and monthly reviews are generated without online AI', () {
    final repository = LocalLifeRepository.seeded();

    final weekly = buildWeeklyReview(
      tasks: repository.getTasks(),
      habits: repository.getHabits(),
      financeEntries: repository.getFinanceEntries(),
      prayerRecords: repository.getPrayerRecords(),
    );
    final monthly = buildMonthlyReview(
      goals: repository.getGoals(),
      financeEntries: repository.getFinanceEntries(),
      habits: repository.getHabits(),
    );

    expect(weekly.title, 'Weekly review');
    expect(monthly.title, 'Monthly review');
    expect(weekly.suggestions, isNotEmpty);
    expect(monthly.suggestions, isNotEmpty);
  });
}
