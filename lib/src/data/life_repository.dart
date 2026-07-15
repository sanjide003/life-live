import '../models/life_models.dart';

const int localSchemaVersion = 1;
const String bankUpiAccountLabel = 'Bank / UPI';

abstract class LifeRepository {
  List<LifeTask> getTasks();
  List<Habit> getHabits();
  List<Goal> getGoals();
  List<FinanceEntry> getFinanceEntries();
  List<HealthEntry> getHealthEntries();
  List<PrayerRecord> getPrayerRecords();
  List<LifeNote> getNotes();
  List<DailyReview> getDailyReviews();
}

abstract class TaskRepository {
  List<LifeTask> getTasks();
  void addTask(LifeTask task);
  void updateTask(LifeTask task);
  void deleteTask(String id);
}

abstract class HabitRepository {
  List<Habit> getHabits();
  void addHabit(Habit habit);
  void updateHabit(Habit habit);
  void deleteHabit(String id);
}

abstract class GoalRepository {
  List<Goal> getGoals();
  void addGoal(Goal goal);
  void updateGoal(Goal goal);
  void deleteGoal(String id);
}

abstract class FinanceRepository {
  List<FinanceEntry> getFinanceEntries();
  void addFinanceEntry(FinanceEntry entry);
  void updateFinanceEntry(FinanceEntry entry);
  void deleteFinanceEntry(String id);
}

abstract class HealthRepository {
  List<HealthEntry> getHealthEntries();
  void addHealthEntry(HealthEntry entry);
  void updateHealthEntry(HealthEntry entry);
  void deleteHealthEntry(String id);
}

abstract class PrayerRepository {
  List<PrayerRecord> getPrayerRecords();
  void updatePrayerRecord(PrayerRecord record);
}

abstract class NotesRepository {
  List<LifeNote> getNotes();
  void addNote(LifeNote note);
  void updateNote(LifeNote note);
  void deleteNote(String id);
}

abstract class ReviewRepository {
  List<DailyReview> getDailyReviews();
  void addDailyReview(DailyReview review);
  void updateDailyReview(DailyReview review);
  void deleteDailyReview(String id);
}

abstract class LifeLocalStore {
  Map<String, Object?>? readSnapshot();
  void writeSnapshot(Map<String, Object?> snapshot);
}

class MemoryLifeLocalStore implements LifeLocalStore {
  MemoryLifeLocalStore([Map<String, Object?>? seed]) : _snapshot = seed;

  Map<String, Object?>? _snapshot;

  @override
  Map<String, Object?>? readSnapshot() => _snapshot == null ? null : Map<String, Object?>.from(_snapshot!);

  @override
  void writeSnapshot(Map<String, Object?> snapshot) {
    _snapshot = Map<String, Object?>.from(snapshot);
  }
}

class LocalLifeRepository
    implements
        LifeRepository,
        TaskRepository,
        HabitRepository,
        GoalRepository,
        FinanceRepository,
        HealthRepository,
        PrayerRepository,
        NotesRepository,
        ReviewRepository {
  LocalLifeRepository._({
    required LifeLocalStore store,
    required List<LifeTask> tasks,
    required List<Habit> habits,
    required List<Goal> goals,
    required List<FinanceEntry> financeEntries,
    required List<HealthEntry> healthEntries,
    required List<PrayerRecord> prayerRecords,
    required List<LifeNote> notes,
    required List<DailyReview> dailyReviews,
  })  : _store = store,
        _tasks = tasks,
        _habits = habits,
        _goals = goals,
        _financeEntries = financeEntries,
        _healthEntries = healthEntries,
        _prayerRecords = prayerRecords,
        _notes = notes,
        _dailyReviews = dailyReviews;

  factory LocalLifeRepository.seeded({LifeLocalStore? store}) {
    final localStore = store ?? MemoryLifeLocalStore();
    final snapshot = localStore.readSnapshot();
    if (snapshot != null) {
      return LocalLifeRepository.fromSnapshot(store: localStore, snapshot: snapshot);
    }

    final repository = LocalLifeRepository._seeded(store: localStore);
    repository._persist();
    return repository;
  }

  factory LocalLifeRepository.fromSnapshot({required LifeLocalStore store, required Map<String, Object?> snapshot}) {
    return LocalLifeRepository._(
      store: store,
      tasks: _list(snapshot, 'tasks').map(LifeTask.fromJson).toList(),
      habits: _list(snapshot, 'habits').map(Habit.fromJson).toList(),
      goals: _list(snapshot, 'goals').map(Goal.fromJson).toList(),
      financeEntries: _list(snapshot, 'financeEntries').map(FinanceEntry.fromJson).toList(),
      healthEntries: _list(snapshot, 'healthEntries').map(HealthEntry.fromJson).toList(),
      prayerRecords: _list(snapshot, 'prayerRecords').map(PrayerRecord.fromJson).toList(),
      notes: _list(snapshot, 'notes').map(LifeNote.fromJson).toList(),
      dailyReviews: _list(snapshot, 'dailyReviews').map(DailyReview.fromJson).toList(),
    );
  }

  factory LocalLifeRepository._seeded({required LifeLocalStore store}) {
    final now = DateTime.now();
    return LocalLifeRepository._(
      store: store,
      tasks: [
        LifeTask(id: 'task-morning-quran', title: 'Read Quran after Fajr', area: TaskArea.routine, completed: true),
        LifeTask(id: 'task-work-priority', title: 'Finish top 3 priority tasks', area: TaskArea.work, completed: false),
        LifeTask(id: 'task-review', title: 'Write evening review', area: TaskArea.review, completed: false),
        LifeTask(id: 'task-tomorrow', title: 'Plan tomorrow before sleep', area: TaskArea.tomorrow, completed: false),
      ],
      habits: [
        Habit(id: 'habit-water', title: 'Drink 2.5L water', streak: 9, completedToday: false, missedDays: 1, reminderLabel: 'Every 2 hours'),
        Habit(id: 'habit-walk', title: 'Walk 8,000 steps', streak: 14, completedToday: true, missedDays: 0, reminderLabel: '7:00 PM'),
        Habit(id: 'habit-sleep', title: 'Sleep before 11:00 PM', streak: 5, completedToday: false, missedDays: 2, reminderLabel: '10:15 PM'),
      ],
      goals: [
        Goal(id: 'goal-health', title: 'Build a consistent health routine', category: GoalCategory.health, deadline: now.add(const Duration(days: 90)), progress: 0.42, milestones: const ['Track steps daily', 'Exercise 4x weekly', 'Sleep before 11 PM']),
        Goal(id: 'goal-finance', title: 'Save ₹50,000 emergency fund', category: GoalCategory.finance, deadline: now.add(const Duration(days: 180)), progress: 0.28, milestones: const ['Track expenses', 'Save weekly', 'Review monthly']),
      ],
      financeEntries: [
        FinanceEntry(id: 'finance-salary', title: 'Salary', amountInr: 55000, type: FinanceType.income, accountLabel: bankUpiAccountLabel, date: now, paid: true),
        FinanceEntry(id: 'finance-groceries', title: 'Groceries', amountInr: 1850, type: FinanceType.expense, accountLabel: bankUpiAccountLabel, date: now, paid: true),
        FinanceEntry(id: 'finance-electricity-bill', title: 'Electricity bill', amountInr: 1240, type: FinanceType.bill, accountLabel: bankUpiAccountLabel, date: now.add(const Duration(days: 3))),
      ],
      healthEntries: [
        HealthEntry(id: 'health-steps', type: HealthMetricType.steps, value: 6400, unit: 'steps', recordedAt: now),
        HealthEntry(id: 'health-water', type: HealthMetricType.water, value: 1.8, unit: 'L', recordedAt: now),
        HealthEntry(id: 'health-sleep', type: HealthMetricType.sleep, value: 6.5, unit: 'h', recordedAt: now),
        HealthEntry(id: 'health-weight', type: HealthMetricType.weight, value: 72, unit: 'kg', recordedAt: now),
        HealthEntry(id: 'health-exercise', type: HealthMetricType.exercise, value: 35, unit: 'min', recordedAt: now),
        HealthEntry(id: 'health-mood', type: HealthMetricType.mood, value: 4, unit: '/5', recordedAt: now),
        HealthEntry(id: 'health-medicine', type: HealthMetricType.medicine, value: 1, unit: 'taken', recordedAt: now),
      ],
      prayerRecords: [
        PrayerRecord(id: 'fajr', name: 'Fajr', completed: true, timeLabel: '5:05 AM'),
        PrayerRecord(id: 'dhuhr', name: 'Dhuhr', completed: true, timeLabel: '12:28 PM'),
        PrayerRecord(id: 'asr', name: 'Asr', completed: false, timeLabel: '3:47 PM'),
        PrayerRecord(id: 'maghrib', name: 'Maghrib', completed: false, timeLabel: '6:52 PM'),
        PrayerRecord(id: 'isha', name: 'Isha', completed: false, timeLabel: '8:04 PM'),
      ],
      notes: [LifeNote(id: 'note-idea', title: 'Life OS idea', body: 'Keep the app personal and Android-first.')],
      dailyReviews: [DailyReview(id: 'review-today', date: now, summary: 'Good progress on habits and planning.', tomorrowPlan: 'Complete planner MVP and review finances.')],
    );
  }

  final LifeLocalStore _store;
  final List<LifeTask> _tasks;
  final List<Habit> _habits;
  final List<Goal> _goals;
  final List<FinanceEntry> _financeEntries;
  final List<HealthEntry> _healthEntries;
  final List<PrayerRecord> _prayerRecords;
  final List<LifeNote> _notes;
  final List<DailyReview> _dailyReviews;

  static List<Map<String, Object?>> _list(Map<String, Object?> snapshot, String key) =>
      (snapshot[key] as List).map((item) => Map<String, Object?>.from(item as Map)).toList();

  Map<String, Object?> toSnapshot() => {
        'schemaVersion': localSchemaVersion,
        'tasks': _tasks.map((item) => item.toJson()).toList(),
        'habits': _habits.map((item) => item.toJson()).toList(),
        'goals': _goals.map((item) => item.toJson()).toList(),
        'financeEntries': _financeEntries.map((item) => item.toJson()).toList(),
        'healthEntries': _healthEntries.map((item) => item.toJson()).toList(),
        'prayerRecords': _prayerRecords.map((item) => item.toJson()).toList(),
        'notes': _notes.map((item) => item.toJson()).toList(),
        'dailyReviews': _dailyReviews.map((item) => item.toJson()).toList(),
      };

  void _persist() => _store.writeSnapshot(toSnapshot());

  void _upsert<T>(List<T> items, T item, String Function(T) idOf) {
    final index = items.indexWhere((current) => idOf(current) == idOf(item));
    if (index == -1) {
      items.add(item);
    } else {
      items[index] = item;
    }
    _persist();
  }

  @override
  List<LifeTask> getTasks() => List.unmodifiable(_tasks);
  @override
  List<Habit> getHabits() => List.unmodifiable(_habits);
  @override
  List<Goal> getGoals() => List.unmodifiable(_goals);
  @override
  List<FinanceEntry> getFinanceEntries() => List.unmodifiable(_financeEntries);
  @override
  List<HealthEntry> getHealthEntries() => List.unmodifiable(_healthEntries);
  @override
  List<PrayerRecord> getPrayerRecords() => List.unmodifiable(_prayerRecords);
  @override
  List<LifeNote> getNotes() => List.unmodifiable(_notes);
  @override
  List<DailyReview> getDailyReviews() => List.unmodifiable(_dailyReviews);

  @override
  void addTask(LifeTask task) => updateTask(task);
  @override
  void updateTask(LifeTask task) => _upsert(_tasks, task, (item) => item.id);
  @override
  void deleteTask(String id) {
    _tasks.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void addHabit(Habit habit) => updateHabit(habit);
  @override
  void updateHabit(Habit habit) => _upsert(_habits, habit, (item) => item.id);
  @override
  void deleteHabit(String id) {
    _habits.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void addGoal(Goal goal) => updateGoal(goal);
  @override
  void updateGoal(Goal goal) => _upsert(_goals, goal, (item) => item.id);
  @override
  void deleteGoal(String id) {
    _goals.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void addFinanceEntry(FinanceEntry entry) => updateFinanceEntry(entry);
  @override
  void updateFinanceEntry(FinanceEntry entry) => _upsert(_financeEntries, entry, (item) => item.id);
  @override
  void deleteFinanceEntry(String id) {
    _financeEntries.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void addHealthEntry(HealthEntry entry) => updateHealthEntry(entry);
  @override
  void updateHealthEntry(HealthEntry entry) => _upsert(_healthEntries, entry, (item) => item.id);
  @override
  void deleteHealthEntry(String id) {
    _healthEntries.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void updatePrayerRecord(PrayerRecord record) => _upsert(_prayerRecords, record, (item) => item.id);

  @override
  void addNote(LifeNote note) => updateNote(note);
  @override
  void updateNote(LifeNote note) => _upsert(_notes, note, (item) => item.id);
  @override
  void deleteNote(String id) {
    _notes.removeWhere((item) => item.id == id);
    _persist();
  }

  @override
  void addDailyReview(DailyReview review) => updateDailyReview(review);
  @override
  void updateDailyReview(DailyReview review) => _upsert(_dailyReviews, review, (item) => item.id);
  @override
  void deleteDailyReview(String id) {
    _dailyReviews.removeWhere((item) => item.id == id);
    _persist();
  }
}

typedef InMemoryLifeRepository = LocalLifeRepository;
