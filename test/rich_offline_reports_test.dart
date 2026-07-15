import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/reports/report_export_services.dart';

void main() {
  test('builds exportable rich daily reports with next actions', () {
    final repository = LocalLifeRepository.seeded();
    final report = buildRichDailyReport(tasks: repository.getTasks(), habits: repository.getHabits(), financeEntries: repository.getFinanceEntries(), healthEntries: repository.getHealthEntries(), prayerRecords: repository.getPrayerRecords());

    expect(report.sections.keys, containsAll(['Habit consistency', 'Health trend', 'Finance cash flow', 'Prayer consistency']));
    expect(report.exportText(), contains('Next actions'));
  });
}
