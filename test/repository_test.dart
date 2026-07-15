import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/json_life_store.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/models/life_models.dart';

void main() {
  group('LocalLifeRepository', () {
    test('seeds core Life OS data for Update 2', () {
      final repository = LocalLifeRepository.seeded();

      expect(repository.getTasks(), isNotEmpty);
      expect(repository.getHabits(), isNotEmpty);
      expect(repository.getGoals(), isNotEmpty);
      expect(repository.getFinanceEntries().first.accountLabel, 'Bank / UPI');
      expect(repository.getHealthEntries(), isNotEmpty);
      expect(repository.getPrayerRecords(), hasLength(5));
      expect(repository.getNotes(), isNotEmpty);
      expect(repository.getDailyReviews(), isNotEmpty);
    });

    test('adds and updates tasks through the repository interface', () {
      final repository = LocalLifeRepository.seeded();
      final task = LifeTask(
        id: 'task-test',
        title: 'Test task',
        area: TaskArea.personal,
        completed: false,
      );

      repository.addTask(task);
      expect(repository.getTasks().any((item) => item.id == 'task-test'), isTrue);

      repository.updateTask(task.copyWith(completed: true));
      final updatedTask = repository.getTasks().firstWhere((item) => item.id == 'task-test');
      expect(updatedTask.completed, isTrue);
    });

    test('adds and updates habits through the repository interface', () {
      final repository = LocalLifeRepository.seeded();
      final habit = Habit(
        id: 'habit-test',
        title: 'Test habit',
        streak: 0,
        completedToday: false,
        missedDays: 0,
      );

      repository.addHabit(habit);
      repository.updateHabit(habit.copyWith(completedToday: true, streak: 1));

      final updatedHabit = repository.getHabits().firstWhere((item) => item.id == 'habit-test');
      expect(updatedHabit.completedToday, isTrue);
      expect(updatedHabit.streak, 1);
    });

    test('persists data across repository re-creation with the same local store', () {
      final store = MemoryLifeLocalStore();
      final firstRepository = LocalLifeRepository.seeded(store: store);
      final task = LifeTask(
        id: 'task-persisted',
        title: 'Persisted task',
        area: TaskArea.personal,
        completed: false,
      );

      firstRepository.addTask(task);
      firstRepository.updateTask(task.copyWith(completed: true));

      final secondRepository = LocalLifeRepository.seeded(store: store);
      final persisted = secondRepository.getTasks().firstWhere((item) => item.id == 'task-persisted');
      expect(persisted.completed, isTrue);
      expect(secondRepository.toSnapshot()['schemaVersion'], localSchemaVersion);
    });

    test('writes and reads a JSON local snapshot from disk', () {
      final directory = Directory.systemTemp.createTempSync('livelife_store_test');
      addTearDown(() => directory.deleteSync(recursive: true));
      final store = JsonFileLifeLocalStore(File('${directory.path}/life.json'));
      final firstRepository = LocalLifeRepository.seeded(store: store);
      firstRepository.addNote(LifeNote(id: 'note-disk', title: 'Disk note', body: 'Saved locally'));

      final secondRepository = LocalLifeRepository.seeded(store: store);

      expect(secondRepository.getNotes().any((note) => note.id == 'note-disk'), isTrue);
    });
  });
}
