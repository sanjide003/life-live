import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/typed_life_schema.dart';

void main() {
  test('typed schema covers production modules requested for Update 39', () {
    final names = typedLifeTables.map((table) => table.name).toSet();

    expect(typedLifeSchemaVersion, greaterThan(1));
    expect(names, containsAll(['tasks', 'task_metadata', 'habits', 'habit_history', 'goals', 'goal_milestones', 'finance_entries', 'recurring_bill_rules', 'health_entries', 'imported_health_source_ids', 'prayer_records', 'prayer_settings', 'prayer_history', 'quran_sessions', 'dhikr_counters', 'duas', 'fasting_entries', 'charity_entries', 'notes', 'daily_reviews', 'reminder_preferences', 'privacy_settings', 'sync_metadata', 'onboarding_state', 'app_settings']));
    expect(typedLifeTables.every((table) => table.createSql.startsWith('CREATE TABLE IF NOT EXISTS')), isTrue);
  });
}
