import 'package:flutter/material.dart';

import '../data/life_repository.dart';
import '../models/life_models.dart';
import '../services/finance_calculations.dart';
import '../services/health_calculations.dart';
import '../services/health_integration_services.dart';
import '../services/life_reports.dart';
import '../services/prayer_calculations.dart';
import '../services/reminder_services.dart';
import '../services/sync_services.dart';
import '../services/settings/settings_services.dart';
import '../services/onboarding/onboarding_services.dart';
import '../widgets/life_widgets.dart';

part 'dashboard_screen.dart';
part 'planner_screen.dart';
part 'habits_screen.dart';
part 'finance_screen.dart';
part 'health_screen.dart';
part 'more_screen.dart';
part '../widgets/dashboard/dashboard_cards.dart';
part 'life_editors.dart';
part 'prayer_settings_card.dart';
part 'settings_screen.dart';
part 'onboarding_screen.dart';

class LifeOsShell extends StatefulWidget {
  const LifeOsShell({super.key, required this.repository});

  final LocalLifeRepository repository;

  @override
  State<LifeOsShell> createState() => _LifeOsShellState();
}

class _LifeOsShellState extends State<LifeOsShell> {
  int _selectedIndex = 0;
  late List<LifeTask> _tasks = widget.repository.getTasks();
  late List<Habit> _habits = widget.repository.getHabits();
  late List<Goal> _goals = widget.repository.getGoals();
  late List<FinanceEntry> _financeEntries = widget.repository.getFinanceEntries();
  late List<HealthEntry> _healthEntries = widget.repository.getHealthEntries();
  late List<PrayerRecord> _prayerRecords = widget.repository.getPrayerRecords();
  PrayerCalculationSettings _prayerSettings = PrayerCalculationSettings.defaults();
  late List<LifeNote> _notes = widget.repository.getNotes();
  late List<DailyReview> _reviews = widget.repository.getDailyReviews();
  AuthState _authState = const AuthState.signedOut();
  SyncState _syncState = const SyncState.localOnly();
  PrivacySettings _privacySettings = const PrivacySettings(firebaseBackupEnabled: false, exportEnabled: true, importEnabled: true);
  ReminderSettings _reminderSettings = const ReminderScheduler().defaultSettings();
  HealthIntegrationState _healthIntegrationState = const HealthIntegrationState.notConnected();

  void _refresh() {
    setState(() {
      _tasks = widget.repository.getTasks();
      _habits = widget.repository.getHabits();
      _goals = widget.repository.getGoals();
      _financeEntries = widget.repository.getFinanceEntries();
      _healthEntries = widget.repository.getHealthEntries();
      _prayerRecords = widget.repository.getPrayerRecords();
      _notes = widget.repository.getNotes();
      _reviews = widget.repository.getDailyReviews();
    });
  }

  void _selectTab(int index) => setState(() => _selectedIndex = index);

  void _addTask(String title, TaskArea area) {
    widget.repository.addTask(LifeTask(id: 'task-${DateTime.now().microsecondsSinceEpoch}', title: title, area: area, completed: false));
    _refresh();
  }

  void _toggleTask(LifeTask task, bool? completed) {
    widget.repository.updateTask(task.copyWith(completed: completed ?? false));
    _refresh();
  }

  void _editTask(LifeTask task) {
    widget.repository.updateTask(task);
    _refresh();
  }

  void _addHabit(String title) {
    widget.repository.addHabit(Habit(id: 'habit-${DateTime.now().microsecondsSinceEpoch}', title: title, streak: 0, completedToday: false, missedDays: 0, reminderLabel: 'Reminder not set'));
    _refresh();
  }

  void _toggleHabit(Habit habit, bool? completed) {
    final isCompleted = completed ?? false;
    widget.repository.updateHabit(habit.copyWith(completedToday: isCompleted, streak: isCompleted ? habit.streak + 1 : habit.streak));
    _refresh();
  }

  void _togglePrayer(PrayerRecord prayer, bool? completed) {
    widget.repository.updatePrayerRecord(prayer.copyWith(completed: completed ?? false));
    _refresh();
  }

  void _updatePrayerSettings(PrayerCalculationSettings settings) {
    final records = const PrayerTimesEngine().calculateDailyPrayers(date: DateTime.now(), settings: settings, existing: _prayerRecords);
    for (final record in records) {
      widget.repository.updatePrayerRecord(record);
    }
    setState(() {
      _prayerSettings = settings;
      _prayerRecords = widget.repository.getPrayerRecords();
    });
  }

  void _toggleOptionalSignIn() {
    setState(() {
      if (_authState.isSignedIn) {
        _authState = const AuthState.signedOut();
        _syncState = const FirebaseSyncAdapter().signedOutState();
        _privacySettings = _privacySettings.copyWith(firebaseBackupEnabled: false);
      } else {
        _authState = const AuthState.signedIn(displayName: 'Livelife User', email: 'user@example.com');
        _syncState = const FirebaseSyncAdapter().signedInReadyState();
      }
    });
  }

  void _toggleFirebaseBackup(bool value) {
    setState(() {
      _privacySettings = _privacySettings.copyWith(firebaseBackupEnabled: value);
      _syncState = value ? const FirebaseSyncAdapter().queuedState(1) : const SyncState.localOnly();
    });
  }

  void _grantNotificationPermission() {
    setState(() => _reminderSettings = const ReminderScheduler().requestAndroidPermission(_reminderSettings, userGranted: true));
  }

  void _denyNotificationPermission() {
    setState(() => _reminderSettings = const ReminderScheduler().requestAndroidPermission(_reminderSettings, userGranted: false));
  }

  void _toggleReminder(String id, bool enabled) {
    setState(() => _reminderSettings = const ReminderScheduler().setPreferenceEnabled(_reminderSettings, id, enabled));
  }

  void _connectHealthIntegration() {
    final boundary = const HealthIntegrationBoundary();
    final state = boundary.requestPermissions(
      available: true,
      grantedTypes: const [HealthDataType.steps, HealthDataType.sleep, HealthDataType.exercise, HealthDataType.weight],
    );
    for (final entry in boundary.readAllowedSampleData(state, DateTime.now())) {
      widget.repository.updateHealthEntry(entry);
    }
    setState(() {
      _healthIntegrationState = state;
      _healthEntries = widget.repository.getHealthEntries();
    });
  }

  void _denyHealthIntegration() {
    setState(() {
      _healthIntegrationState = const HealthIntegrationBoundary().requestPermissions(available: true, grantedTypes: const []);
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(tasks: _tasks, habits: _habits, goals: _goals, financeEntries: _financeEntries, healthEntries: _healthEntries, prayerRecords: _prayerRecords, reviews: _reviews, onOpenTab: _selectTab),
      PlannerScreen(tasks: _tasks, onAddTask: _addTask, onToggleTask: _toggleTask, onEditTask: _editTask),
      HabitsScreen(
        habits: _habits,
        goals: _goals,
        onAddHabit: _addHabit,
        onToggleHabit: _toggleHabit,
        onAddGoal: (goal) {
          widget.repository.addGoal(goal);
          _refresh();
        },
        onDeleteGoal: (id) {
          widget.repository.deleteGoal(id);
          _refresh();
        },
      ),
      FinanceScreen(
        entries: _financeEntries,
        onAddEntry: (entry) {
          widget.repository.addFinanceEntry(entry);
          _refresh();
        },
        onUpdateEntry: (entry) {
          widget.repository.updateFinanceEntry(entry);
          _refresh();
        },
        onDeleteEntry: (id) {
          widget.repository.deleteFinanceEntry(id);
          _refresh();
        },
      ),
      HealthScreen(
        entries: _healthEntries,
        integrationState: _healthIntegrationState,
        onConnectHealth: _connectHealthIntegration,
        onDenyHealth: _denyHealthIntegration,
        onAddEntry: (entry) {
          widget.repository.addHealthEntry(entry);
          _refresh();
        },
        onDeleteEntry: (id) {
          widget.repository.deleteHealthEntry(id);
          _refresh();
        },
      ),
      MoreScreen(
        prayerRecords: _prayerRecords,
        prayerSettings: _prayerSettings,
        onTogglePrayer: _togglePrayer,
        onPrayerSettingsChanged: _updatePrayerSettings,
        notes: _notes,
        reviews: _reviews,
        authState: _authState,
        syncState: _syncState,
        privacySettings: _privacySettings,
        reminderSettings: _reminderSettings,
        onGrantNotifications: _grantNotificationPermission,
        onDenyNotifications: _denyNotificationPermission,
        onToggleReminder: _toggleReminder,
        onToggleSignIn: _toggleOptionalSignIn,
        onToggleBackup: _toggleFirebaseBackup,
        onAddNote: (note) {
          widget.repository.addNote(note);
          _refresh();
        },
        onDeleteNote: (id) {
          widget.repository.deleteNote(id);
          _refresh();
        },
        onAddReview: (review) {
          widget.repository.addDailyReview(review);
          _refresh();
        },
        onDeleteReview: (id) {
          widget.repository.deleteDailyReview(id);
          _refresh();
        },
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Livelife'), actions: [IconButton(tooltip: 'Notifications', onPressed: () {}, icon: const Icon(Icons.notifications_none))]),
      body: SafeArea(child: screens[_selectedIndex]),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton.extended(onPressed: () => showTaskEditor(context: context, onSave: _addTask), icon: const Icon(Icons.add), label: const Text('Add Task'))
          : FloatingActionButton.extended(onPressed: () => _selectTab(1), icon: const Icon(Icons.add), label: const Text('Quick Add')),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _selectTab,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.today_outlined), selectedIcon: Icon(Icons.today), label: 'Planner'),
          NavigationDestination(icon: Icon(Icons.track_changes_outlined), selectedIcon: Icon(Icons.track_changes), label: 'Habits'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Finance'),
          NavigationDestination(icon: Icon(Icons.favorite_border), selectedIcon: Icon(Icons.favorite), label: 'Health'),
          NavigationDestination(icon: Icon(Icons.more_horiz), selectedIcon: Icon(Icons.more), label: 'More'),
        ],
      ),
    );
  }
}
