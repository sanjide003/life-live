part of 'life_os_shell.dart';

class PlannerScreen extends StatelessWidget {
  const PlannerScreen({super.key, required this.tasks, required this.onAddTask, required this.onToggleTask, required this.onEditTask});

  final List<LifeTask> tasks;
  final void Function(String title, TaskArea area) onAddTask;
  final void Function(LifeTask task, bool? completed) onToggleTask;
  final ValueChanged<LifeTask> onEditTask;

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionHeader(title: 'Daily Planner', action: '${tasks.length} items'),
          const SizedBox(height: 8),
          for (final area in TaskArea.values) ...[
            Padding(padding: const EdgeInsets.only(top: 12, bottom: 4), child: Text(_taskAreaLabel(area), style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold))),
            ...tasks.where((task) => task.area == area).map((task) => Card(child: CheckboxListTile(value: task.completed, onChanged: (value) => onToggleTask(task, value), title: Text(task.title), subtitle: task.note == null ? null : Text(task.note!), secondary: IconButton(tooltip: 'Edit task', icon: const Icon(Icons.edit_outlined), onPressed: () => showTaskEditor(context: context, initialTask: task, onSave: (title, area) => onEditTask(task.copyWith(title: title, area: area))))))),
            if (!tasks.any((task) => task.area == area)) EmptyStateCard(message: 'No ${_taskAreaLabel(area).toLowerCase()} yet.'),
          ],
        ],
      );
}
