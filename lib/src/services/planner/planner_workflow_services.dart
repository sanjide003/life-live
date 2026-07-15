import '../../models/life_models.dart';

class TaskWorkflowSettings {
  const TaskWorkflowSettings({this.dueDate, this.priority = 2, this.recurrence = TaskRecurrence.none, this.notes = ''});
  final DateTime? dueDate;
  final int priority;
  final TaskRecurrence recurrence;
  final String notes;
}

enum TaskRecurrence { none, daily, weekly, monthly }
enum TaskFilter { today, upcoming, completed, overdue }
enum HabitFrequency { daily, weekdays, weekly }

DateTime? nextDueDate(DateTime? dueDate, TaskRecurrence recurrence) => switch (recurrence) {
      TaskRecurrence.none => null,
      TaskRecurrence.daily => dueDate?.add(const Duration(days: 1)),
      TaskRecurrence.weekly => dueDate?.add(const Duration(days: 7)),
      TaskRecurrence.monthly => dueDate == null ? null : DateTime(dueDate.year, dueDate.month + 1, dueDate.day),
    };

List<LifeTask> filterTasks(List<LifeTask> tasks, TaskFilter filter, DateTime now) => switch (filter) {
      TaskFilter.completed => tasks.where((task) => task.completed).toList(),
      TaskFilter.today => tasks.where((task) => !task.completed).toList(),
      TaskFilter.upcoming => tasks.where((task) => !task.completed).toList(),
      TaskFilter.overdue => const [],
    };

Habit recoverMissedDay(Habit habit) => habit.copyWith(missedDays: habit.missedDays + 1, completedToday: false);
Habit completeHabitForFrequency(Habit habit, HabitFrequency frequency) => habit.copyWith(completedToday: true, streak: habit.streak + 1, missedDays: 0);
Goal updateGoalMilestoneProgress(Goal goal, int completedMilestones) => goal.copyWith(progress: goal.milestones.isEmpty ? goal.progress : (completedMilestones / goal.milestones.length).clamp(0, 1).toDouble());
DailyReview buildDailyReviewFromProgress({required String id, required DateTime date, required List<LifeTask> tasks, required List<Habit> habits}) {
  final completedTasks = tasks.where((task) => task.completed).length;
  final completedHabits = habits.where((habit) => habit.completedToday).length;
  return DailyReview(id: id, date: date, summary: '$completedTasks tasks and $completedHabits habits completed today.', tomorrowPlan: 'Review overdue tasks and continue priority habits.');
}
