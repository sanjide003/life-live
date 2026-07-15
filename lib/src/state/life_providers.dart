import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/life_repository.dart';
import '../models/life_models.dart';
import '../services/health_integration_services.dart';
import '../services/prayer_calculations.dart';
import '../services/reminder_services.dart';
import '../services/sync_services.dart';

final lifeRepositoryProvider = Provider<LocalLifeRepository>((ref) => LocalLifeRepository.seeded());

final tasksProvider = StateNotifierProvider<TasksController, List<LifeTask>>((ref) => TasksController(ref.read(lifeRepositoryProvider)));
final financeEntriesProvider = StateNotifierProvider<FinanceController, List<FinanceEntry>>((ref) => FinanceController(ref.read(lifeRepositoryProvider)));
final prayerControllerProvider = StateNotifierProvider<PrayerController, PrayerState>((ref) => PrayerController(ref.read(lifeRepositoryProvider)));
final reminderControllerProvider = StateNotifierProvider<ReminderController, ReminderSettings>((ref) => ReminderController());
final healthIntegrationProvider = StateNotifierProvider<HealthIntegrationController, HealthIntegrationState>((ref) => HealthIntegrationController(ref.read(lifeRepositoryProvider)));
final authStateProvider = StateProvider<AuthState>((ref) => const AuthState.signedOut());
final syncStateProvider = StateProvider<SyncState>((ref) => const SyncState.localOnly());

class TasksController extends StateNotifier<List<LifeTask>> {
  TasksController(this.repository) : super(repository.getTasks());

  final LocalLifeRepository repository;

  void upsert(LifeTask task) {
    repository.updateTask(task);
    state = repository.getTasks();
  }

  void delete(String id) {
    repository.deleteTask(id);
    state = repository.getTasks();
  }
}

class FinanceController extends StateNotifier<List<FinanceEntry>> {
  FinanceController(this.repository) : super(repository.getFinanceEntries());

  final LocalLifeRepository repository;

  void upsert(FinanceEntry entry) {
    repository.updateFinanceEntry(entry);
    state = repository.getFinanceEntries();
  }

  void delete(String id) {
    repository.deleteFinanceEntry(id);
    state = repository.getFinanceEntries();
  }
}

class PrayerState {
  const PrayerState({required this.records, required this.settings});

  final List<PrayerRecord> records;
  final PrayerCalculationSettings settings;
}

class PrayerController extends StateNotifier<PrayerState> {
  PrayerController(this.repository)
      : super(PrayerState(records: repository.getPrayerRecords(), settings: PrayerCalculationSettings.defaults()));

  final LocalLifeRepository repository;

  void toggle(PrayerRecord prayer, bool completed) {
    repository.updatePrayerRecord(prayer.copyWith(completed: completed));
    state = PrayerState(records: repository.getPrayerRecords(), settings: state.settings);
  }

  void updateSettings(PrayerCalculationSettings settings) {
    final records = const PrayerTimesEngine().calculateDailyPrayers(date: DateTime.now(), settings: settings, existing: state.records);
    for (final record in records) {
      repository.updatePrayerRecord(record);
    }
    state = PrayerState(records: repository.getPrayerRecords(), settings: settings);
  }
}

class ReminderController extends StateNotifier<ReminderSettings> {
  ReminderController() : super(const ReminderScheduler().defaultSettings());

  void requestPermission(bool granted) => state = const ReminderScheduler().requestAndroidPermission(state, userGranted: granted);
  void setEnabled(String id, bool enabled) => state = const ReminderScheduler().setPreferenceEnabled(state, id, enabled);
}

class HealthIntegrationController extends StateNotifier<HealthIntegrationState> {
  HealthIntegrationController(this.repository) : super(const HealthIntegrationState.notConnected());

  final LocalLifeRepository repository;

  void connect(List<HealthDataType> grantedTypes) {
    final boundary = const HealthIntegrationBoundary();
    final next = boundary.requestPermissions(available: true, grantedTypes: grantedTypes);
    for (final entry in boundary.readAllowedSampleData(next, DateTime.now())) {
      repository.updateHealthEntry(entry);
    }
    state = next;
  }
}
