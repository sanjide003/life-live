part of 'life_os_shell.dart';

class HabitsScreen extends StatelessWidget {
  const HabitsScreen({super.key, required this.habits, required this.goals, required this.onAddHabit, required this.onToggleHabit, required this.onAddGoal, required this.onDeleteGoal});

  final List<Habit> habits;
  final List<Goal> goals;
  final ValueChanged<String> onAddHabit;
  final void Function(Habit habit, bool? completed) onToggleHabit;
  final ValueChanged<Goal> onAddGoal;
  final ValueChanged<String> onDeleteGoal;

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const SectionHeader(title: 'Habits'), FilledButton.icon(onPressed: () => showHabitEditor(context: context, onSave: onAddHabit), icon: const Icon(Icons.add), label: const Text('Add Habit'))]),
          const SizedBox(height: 8),
          for (final habit in habits) Card(child: CheckboxListTile(value: habit.completedToday, onChanged: (value) => onToggleHabit(habit, value), title: Text(habit.title), subtitle: Text('Streak: ${habit.streak} days • Missed: ${habit.missedDays} • Reminder: ${habit.reminderLabel ?? 'Not set'}'))),
          const SizedBox(height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const SectionHeader(title: 'Goals'), OutlinedButton.icon(onPressed: () => showGoalEditor(context: context, onSave: onAddGoal), icon: const Icon(Icons.add), label: const Text('Add Goal'))]),
          const SizedBox(height: 8),
          for (final goal in goals)
            Card(
              child: ListTile(
                title: Text(goal.title),
                trailing: IconButton(tooltip: 'Delete goal', icon: const Icon(Icons.delete_outline), onPressed: () => onDeleteGoal(goal.id)),
                subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Deadline: ${goal.deadline.year}-${goal.deadline.month.toString().padLeft(2, '0')}-${goal.deadline.day.toString().padLeft(2, '0')}'),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(value: goal.progress),
                  const SizedBox(height: 8),
                  Text('Milestones: ${goal.milestones.join(', ')}'),
                ]),
              ),
            ),
        ],
      );
}
