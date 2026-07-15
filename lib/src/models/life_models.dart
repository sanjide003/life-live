enum TaskArea { routine, work, personal, notes, review, tomorrow }

enum GoalCategory { personal, health, finance, prayer, learning }

enum FinanceType { income, expense, bill }

enum HealthMetricType { steps, sleep, water, weight, exercise, mood, medicine }

DateTime _dateFromJson(Object? value) => DateTime.parse(value as String);
String _dateToJson(DateTime value) => value.toIso8601String();
T _enumFromName<T extends Enum>(List<T> values, Object? name) => values.byName(name as String);

class LifeTask {
  LifeTask({
    required this.id,
    required this.title,
    required this.area,
    required this.completed,
    this.note,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String title;
  final TaskArea area;
  final bool completed;
  final String? note;
  final DateTime createdAt;
  final DateTime updatedAt;

  LifeTask copyWith({String? title, TaskArea? area, bool? completed, String? note, DateTime? updatedAt}) {
    return LifeTask(
      id: id,
      title: title ?? this.title,
      area: area ?? this.area,
      completed: completed ?? this.completed,
      note: note ?? this.note,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'title': title,
        'area': area.name,
        'completed': completed,
        'note': note,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory LifeTask.fromJson(Map<String, Object?> json) => LifeTask(
        id: json['id'] as String,
        title: json['title'] as String,
        area: _enumFromName(TaskArea.values, json['area']),
        completed: json['completed'] as bool,
        note: json['note'] as String?,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class Habit {
  Habit({
    required this.id,
    required this.title,
    required this.streak,
    required this.completedToday,
    required this.missedDays,
    this.reminderLabel,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String title;
  final int streak;
  final bool completedToday;
  final int missedDays;
  final String? reminderLabel;
  final DateTime createdAt;
  final DateTime updatedAt;

  Habit copyWith({String? title, int? streak, bool? completedToday, int? missedDays, String? reminderLabel, DateTime? updatedAt}) {
    return Habit(
      id: id,
      title: title ?? this.title,
      streak: streak ?? this.streak,
      completedToday: completedToday ?? this.completedToday,
      missedDays: missedDays ?? this.missedDays,
      reminderLabel: reminderLabel ?? this.reminderLabel,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'title': title,
        'streak': streak,
        'completedToday': completedToday,
        'missedDays': missedDays,
        'reminderLabel': reminderLabel,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory Habit.fromJson(Map<String, Object?> json) => Habit(
        id: json['id'] as String,
        title: json['title'] as String,
        streak: json['streak'] as int,
        completedToday: json['completedToday'] as bool,
        missedDays: json['missedDays'] as int,
        reminderLabel: json['reminderLabel'] as String?,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class Goal {
  Goal({
    required this.id,
    required this.title,
    required this.category,
    required this.deadline,
    required this.progress,
    required this.milestones,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String title;
  final GoalCategory category;
  final DateTime deadline;
  final double progress;
  final List<String> milestones;
  final DateTime createdAt;
  final DateTime updatedAt;

  Goal copyWith({String? title, GoalCategory? category, DateTime? deadline, double? progress, List<String>? milestones, DateTime? updatedAt}) => Goal(
        id: id,
        title: title ?? this.title,
        category: category ?? this.category,
        deadline: deadline ?? this.deadline,
        progress: progress ?? this.progress,
        milestones: milestones ?? this.milestones,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'title': title,
        'category': category.name,
        'deadline': _dateToJson(deadline),
        'progress': progress,
        'milestones': milestones,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory Goal.fromJson(Map<String, Object?> json) => Goal(
        id: json['id'] as String,
        title: json['title'] as String,
        category: _enumFromName(GoalCategory.values, json['category']),
        deadline: _dateFromJson(json['deadline']),
        progress: (json['progress'] as num).toDouble(),
        milestones: List<String>.from(json['milestones'] as List),
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class FinanceEntry {
  FinanceEntry({
    required this.id,
    required this.title,
    required this.amountInr,
    required this.type,
    required this.accountLabel,
    required this.date,
    this.paid = false,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String title;
  final double amountInr;
  final FinanceType type;
  final String accountLabel;
  final DateTime date;
  final bool paid;
  final DateTime createdAt;
  final DateTime updatedAt;

  FinanceEntry copyWith({String? title, double? amountInr, FinanceType? type, String? accountLabel, DateTime? date, bool? paid, DateTime? updatedAt}) => FinanceEntry(
        id: id,
        title: title ?? this.title,
        amountInr: amountInr ?? this.amountInr,
        type: type ?? this.type,
        accountLabel: accountLabel ?? this.accountLabel,
        date: date ?? this.date,
        paid: paid ?? this.paid,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'title': title,
        'amountInr': amountInr,
        'type': type.name,
        'accountLabel': accountLabel,
        'date': _dateToJson(date),
        'paid': paid,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory FinanceEntry.fromJson(Map<String, Object?> json) => FinanceEntry(
        id: json['id'] as String,
        title: json['title'] as String,
        amountInr: (json['amountInr'] as num).toDouble(),
        type: _enumFromName(FinanceType.values, json['type']),
        accountLabel: json['accountLabel'] as String,
        date: _dateFromJson(json['date']),
        paid: json['paid'] as bool? ?? false,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class HealthEntry {
  HealthEntry({required this.id, required this.type, required this.value, required this.unit, required this.recordedAt, DateTime? createdAt, DateTime? updatedAt})
      : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final HealthMetricType type;
  final double value;
  final String unit;
  final DateTime recordedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  HealthEntry copyWith({HealthMetricType? type, double? value, String? unit, DateTime? recordedAt, DateTime? updatedAt}) => HealthEntry(
        id: id,
        type: type ?? this.type,
        value: value ?? this.value,
        unit: unit ?? this.unit,
        recordedAt: recordedAt ?? this.recordedAt,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'type': type.name,
        'value': value,
        'unit': unit,
        'recordedAt': _dateToJson(recordedAt),
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory HealthEntry.fromJson(Map<String, Object?> json) => HealthEntry(
        id: json['id'] as String,
        type: _enumFromName(HealthMetricType.values, json['type']),
        value: (json['value'] as num).toDouble(),
        unit: json['unit'] as String,
        recordedAt: _dateFromJson(json['recordedAt']),
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class PrayerRecord {
  PrayerRecord({required this.id, required this.name, required this.completed, required this.timeLabel, DateTime? createdAt, DateTime? updatedAt})
      : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String name;
  final bool completed;
  final String timeLabel;
  final DateTime createdAt;
  final DateTime updatedAt;

  PrayerRecord copyWith({String? name, bool? completed, String? timeLabel, DateTime? updatedAt}) => PrayerRecord(
        id: id,
        name: name ?? this.name,
        completed: completed ?? this.completed,
        timeLabel: timeLabel ?? this.timeLabel,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'name': name,
        'completed': completed,
        'timeLabel': timeLabel,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory PrayerRecord.fromJson(Map<String, Object?> json) => PrayerRecord(
        id: json['id'] as String,
        name: json['name'] as String,
        completed: json['completed'] as bool,
        timeLabel: json['timeLabel'] as String,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class LifeNote {
  LifeNote({required this.id, required this.title, required this.body, DateTime? createdAt, DateTime? updatedAt})
      : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final DateTime updatedAt;

  LifeNote copyWith({String? title, String? body, DateTime? updatedAt}) => LifeNote(
        id: id,
        title: title ?? this.title,
        body: body ?? this.body,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {'id': id, 'title': title, 'body': body, 'createdAt': _dateToJson(createdAt), 'updatedAt': _dateToJson(updatedAt)};

  factory LifeNote.fromJson(Map<String, Object?> json) => LifeNote(
        id: json['id'] as String,
        title: json['title'] as String,
        body: json['body'] as String,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}

class DailyReview {
  DailyReview({required this.id, required this.date, required this.summary, required this.tomorrowPlan, DateTime? createdAt, DateTime? updatedAt})
      : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  final String id;
  final DateTime date;
  final String summary;
  final String tomorrowPlan;
  final DateTime createdAt;
  final DateTime updatedAt;

  DailyReview copyWith({DateTime? date, String? summary, String? tomorrowPlan, DateTime? updatedAt}) => DailyReview(
        id: id,
        date: date ?? this.date,
        summary: summary ?? this.summary,
        tomorrowPlan: tomorrowPlan ?? this.tomorrowPlan,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'date': _dateToJson(date),
        'summary': summary,
        'tomorrowPlan': tomorrowPlan,
        'createdAt': _dateToJson(createdAt),
        'updatedAt': _dateToJson(updatedAt),
      };

  factory DailyReview.fromJson(Map<String, Object?> json) => DailyReview(
        id: json['id'] as String,
        date: _dateFromJson(json['date']),
        summary: json['summary'] as String,
        tomorrowPlan: json['tomorrowPlan'] as String,
        createdAt: _dateFromJson(json['createdAt']),
        updatedAt: _dateFromJson(json['updatedAt']),
      );
}
