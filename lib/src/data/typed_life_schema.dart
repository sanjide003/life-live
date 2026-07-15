class SqliteColumnDefinition {
  const SqliteColumnDefinition(this.name, this.type, {this.primaryKey = false, this.notNull = false});
  final String name;
  final String type;
  final bool primaryKey;
  final bool notNull;

  String get sql => [name, type, if (primaryKey) 'PRIMARY KEY', if (notNull) 'NOT NULL'].join(' ');
}

class SqliteTableDefinition {
  const SqliteTableDefinition({required this.name, required this.columns});
  final String name;
  final List<SqliteColumnDefinition> columns;

  String get createSql => 'CREATE TABLE IF NOT EXISTS $name(${columns.map((column) => column.sql).join(', ')})';
}

const typedLifeSchemaVersion = 2;

const typedLifeTables = [
  SqliteTableDefinition(name: 'tasks', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT', notNull: true), SqliteColumnDefinition('area', 'TEXT', notNull: true), SqliteColumnDefinition('completed', 'INTEGER', notNull: true), SqliteColumnDefinition('due_at', 'TEXT'), SqliteColumnDefinition('priority', 'INTEGER'), SqliteColumnDefinition('recurrence', 'TEXT'), SqliteColumnDefinition('notes', 'TEXT'), SqliteColumnDefinition('updated_at', 'TEXT', notNull: true)]),
  SqliteTableDefinition(name: 'task_metadata', columns: [SqliteColumnDefinition('task_id', 'TEXT', primaryKey: true), SqliteColumnDefinition('last_completed_at', 'TEXT'), SqliteColumnDefinition('source', 'TEXT')]),
  SqliteTableDefinition(name: 'habits', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT', notNull: true), SqliteColumnDefinition('frequency', 'TEXT'), SqliteColumnDefinition('streak', 'INTEGER'), SqliteColumnDefinition('missed_days', 'INTEGER'), SqliteColumnDefinition('updated_at', 'TEXT', notNull: true)]),
  SqliteTableDefinition(name: 'habit_history', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('habit_id', 'TEXT', notNull: true), SqliteColumnDefinition('date', 'TEXT', notNull: true), SqliteColumnDefinition('completed', 'INTEGER', notNull: true)]),
  SqliteTableDefinition(name: 'goals', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT', notNull: true), SqliteColumnDefinition('category', 'TEXT'), SqliteColumnDefinition('deadline', 'TEXT'), SqliteColumnDefinition('progress', 'REAL'), SqliteColumnDefinition('updated_at', 'TEXT', notNull: true)]),
  SqliteTableDefinition(name: 'goal_milestones', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('goal_id', 'TEXT', notNull: true), SqliteColumnDefinition('title', 'TEXT', notNull: true), SqliteColumnDefinition('completed', 'INTEGER', notNull: true)]),
  SqliteTableDefinition(name: 'finance_entries', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT'), SqliteColumnDefinition('amount_inr', 'REAL'), SqliteColumnDefinition('type', 'TEXT'), SqliteColumnDefinition('category', 'TEXT'), SqliteColumnDefinition('account_label', 'TEXT'), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('paid', 'INTEGER')]),
  SqliteTableDefinition(name: 'recurring_bill_rules', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT'), SqliteColumnDefinition('amount_inr', 'REAL'), SqliteColumnDefinition('day_of_month', 'INTEGER'), SqliteColumnDefinition('category', 'TEXT')]),
  SqliteTableDefinition(name: 'health_entries', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('type', 'TEXT'), SqliteColumnDefinition('value', 'REAL'), SqliteColumnDefinition('unit', 'TEXT'), SqliteColumnDefinition('recorded_at', 'TEXT'), SqliteColumnDefinition('source_id', 'TEXT')]),
  SqliteTableDefinition(name: 'imported_health_source_ids', columns: [SqliteColumnDefinition('source_id', 'TEXT', primaryKey: true), SqliteColumnDefinition('imported_at', 'TEXT')]),
  SqliteTableDefinition(name: 'prayer_records', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('name', 'TEXT'), SqliteColumnDefinition('time_label', 'TEXT'), SqliteColumnDefinition('completed', 'INTEGER')]),
  SqliteTableDefinition(name: 'prayer_settings', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('method', 'TEXT'), SqliteColumnDefinition('asr_method', 'TEXT'), SqliteColumnDefinition('location_json', 'TEXT'), SqliteColumnDefinition('adjustments_json', 'TEXT')]),
  SqliteTableDefinition(name: 'prayer_history', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('prayer_id', 'TEXT'), SqliteColumnDefinition('completed', 'INTEGER'), SqliteColumnDefinition('note', 'TEXT')]),
  SqliteTableDefinition(name: 'quran_sessions', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('pages_read', 'INTEGER'), SqliteColumnDefinition('verses_read', 'INTEGER')]),
  SqliteTableDefinition(name: 'dhikr_counters', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('label', 'TEXT'), SqliteColumnDefinition('count', 'INTEGER')]),
  SqliteTableDefinition(name: 'duas', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT'), SqliteColumnDefinition('body', 'TEXT')]),
  SqliteTableDefinition(name: 'fasting_entries', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('fasted', 'INTEGER')]),
  SqliteTableDefinition(name: 'charity_entries', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('amount_inr', 'REAL'), SqliteColumnDefinition('note', 'TEXT')]),
  SqliteTableDefinition(name: 'notes', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('title', 'TEXT'), SqliteColumnDefinition('body', 'TEXT'), SqliteColumnDefinition('updated_at', 'TEXT')]),
  SqliteTableDefinition(name: 'daily_reviews', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('date', 'TEXT'), SqliteColumnDefinition('summary', 'TEXT'), SqliteColumnDefinition('tomorrow_plan', 'TEXT')]),
  SqliteTableDefinition(name: 'reminder_preferences', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('target_type', 'TEXT'), SqliteColumnDefinition('enabled', 'INTEGER'), SqliteColumnDefinition('time_label', 'TEXT')]),
  SqliteTableDefinition(name: 'privacy_settings', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('firebase_backup_enabled', 'INTEGER'), SqliteColumnDefinition('export_enabled', 'INTEGER'), SqliteColumnDefinition('import_enabled', 'INTEGER')]),
  SqliteTableDefinition(name: 'sync_metadata', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('last_sync_at', 'TEXT'), SqliteColumnDefinition('pending_writes', 'INTEGER'), SqliteColumnDefinition('status', 'TEXT')]),
  SqliteTableDefinition(name: 'onboarding_state', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('completed', 'INTEGER'), SqliteColumnDefinition('current_index', 'INTEGER')]),
  SqliteTableDefinition(name: 'app_settings', columns: [SqliteColumnDefinition('id', 'TEXT', primaryKey: true), SqliteColumnDefinition('theme', 'TEXT'), SqliteColumnDefinition('app_version', 'TEXT')]),
];
