import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/data/life_repository.dart';
import 'package:livelife/src/services/planner/planner_workflow_services.dart';

void main() {
  test('calculates recurrence, habit recovery, goal progress and daily review', () {
    expect(nextDueDate(DateTime(2026, 7, 12), TaskRecurrence.weekly), DateTime(2026, 7, 19));
    final repository = LocalLifeRepository.seeded();
    final recovered = recoverMissedDay(repository.getHabits().first);
    expect(recovered.missedDays, repository.getHabits().first.missedDays + 1);
    final completed = completeHabitForFrequency(repository.getHabits().first, HabitFrequency.daily);
    expect(completed.completedToday, isTrue);
    final goal = updateGoalMilestoneProgress(repository.getGoals().first, 1);
    expect(goal.progress, greaterThan(0));
    final review = buildDailyReviewFromProgress(id: 'review', date: DateTime(2026, 7, 12), tasks: repository.getTasks(), habits: repository.getHabits());
    expect(review.summary, contains('tasks'));
  });
}
