part of 'life_os_shell.dart';

Future<void> showTaskEditor({required BuildContext context, required void Function(String title, TaskArea area) onSave, LifeTask? initialTask}) async {
  final controller = TextEditingController(text: initialTask?.title ?? '');
  var selectedArea = initialTask?.area ?? TaskArea.personal;
  await showDialog<void>(context: context, builder: (context) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(title: Text(initialTask == null ? 'Add Task' : 'Edit Task'), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Task title')), const SizedBox(height: 12), DropdownButtonFormField<TaskArea>(value: selectedArea, decoration: const InputDecoration(labelText: 'Planner section'), items: [for (final area in TaskArea.values) DropdownMenuItem(value: area, child: Text(_taskAreaLabel(area)))], onChanged: (value) => setDialogState(() => selectedArea = value ?? selectedArea))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final title = controller.text.trim(); if (title.isEmpty) return; onSave(title, selectedArea); Navigator.pop(context); }, child: const Text('Save'))])));
}

Future<void> showHabitEditor({required BuildContext context, required ValueChanged<String> onSave}) async {
  final controller = TextEditingController();
  await showDialog<void>(context: context, builder: (context) => AlertDialog(title: const Text('Add Habit'), content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Habit title')), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final title = controller.text.trim(); if (title.isEmpty) return; onSave(title); Navigator.pop(context); }, child: const Text('Save'))]));
}

Future<void> showFinanceEditor({required BuildContext context, required ValueChanged<FinanceEntry> onSave}) async {
  final titleController = TextEditingController();
  final amountController = TextEditingController();
  var selectedType = FinanceType.expense;
  await showDialog<void>(context: context, builder: (context) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(title: const Text('Add Finance Entry'), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: titleController, autofocus: true, decoration: const InputDecoration(labelText: 'Title')), TextField(controller: amountController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount in INR')), DropdownButtonFormField<FinanceType>(value: selectedType, decoration: const InputDecoration(labelText: 'Type'), items: [for (final type in FinanceType.values) DropdownMenuItem(value: type, child: Text(financeTypeLabel(type)))], onChanged: (value) => setDialogState(() => selectedType = value ?? selectedType))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final title = titleController.text.trim(); final amount = double.tryParse(amountController.text.trim()); if (title.isEmpty || amount == null) return; onSave(FinanceEntry(id: 'finance-${DateTime.now().microsecondsSinceEpoch}', title: title, amountInr: amount, type: selectedType, accountLabel: bankUpiAccountLabel, date: DateTime.now(), paid: selectedType != FinanceType.bill)); Navigator.pop(context); }, child: const Text('Save'))])));
}

Future<void> showHealthEditor({required BuildContext context, required ValueChanged<HealthEntry> onSave}) async {
  final valueController = TextEditingController();
  var selectedType = HealthMetricType.water;
  await showDialog<void>(context: context, builder: (context) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(title: const Text('Add Health Entry'), content: Column(mainAxisSize: MainAxisSize.min, children: [DropdownButtonFormField<HealthMetricType>(value: selectedType, decoration: const InputDecoration(labelText: 'Metric'), items: [for (final type in HealthMetricType.values) DropdownMenuItem(value: type, child: Text(_healthMetricLabel(type)))], onChanged: (value) => setDialogState(() => selectedType = value ?? selectedType)), TextField(controller: valueController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Value'))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final value = double.tryParse(valueController.text.trim()); if (value == null) return; onSave(HealthEntry(id: 'health-${DateTime.now().microsecondsSinceEpoch}', type: selectedType, value: value, unit: _healthUnit(selectedType), recordedAt: DateTime.now())); Navigator.pop(context); }, child: const Text('Save'))])));
}

Future<void> showGoalEditor({required BuildContext context, required ValueChanged<Goal> onSave}) async {
  final controller = TextEditingController();
  await showDialog<void>(context: context, builder: (context) => AlertDialog(title: const Text('Add Goal'), content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Goal title')), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final title = controller.text.trim(); if (title.isEmpty) return; onSave(Goal(id: 'goal-${DateTime.now().microsecondsSinceEpoch}', title: title, category: GoalCategory.personal, deadline: DateTime.now().add(const Duration(days: 90)), progress: 0, milestones: const ['First milestone'])); Navigator.pop(context); }, child: const Text('Save'))]));
}

Future<void> showNoteEditor({required BuildContext context, required ValueChanged<LifeNote> onSave}) async {
  final titleController = TextEditingController();
  final bodyController = TextEditingController();
  await showDialog<void>(context: context, builder: (context) => AlertDialog(title: const Text('Add Note'), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: titleController, autofocus: true, decoration: const InputDecoration(labelText: 'Title')), TextField(controller: bodyController, decoration: const InputDecoration(labelText: 'Body'))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final title = titleController.text.trim(); if (title.isEmpty) return; onSave(LifeNote(id: 'note-${DateTime.now().microsecondsSinceEpoch}', title: title, body: bodyController.text.trim())); Navigator.pop(context); }, child: const Text('Save'))]));
}

Future<void> showReviewEditor({required BuildContext context, required ValueChanged<DailyReview> onSave}) async {
  final summaryController = TextEditingController();
  final planController = TextEditingController();
  await showDialog<void>(context: context, builder: (context) => AlertDialog(title: const Text('Add Daily Review'), content: Column(mainAxisSize: MainAxisSize.min, children: [TextField(controller: summaryController, autofocus: true, decoration: const InputDecoration(labelText: 'Summary')), TextField(controller: planController, decoration: const InputDecoration(labelText: 'Tomorrow plan'))]), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () { final summary = summaryController.text.trim(); if (summary.isEmpty) return; onSave(DailyReview(id: 'review-${DateTime.now().microsecondsSinceEpoch}', date: DateTime.now(), summary: summary, tomorrowPlan: planController.text.trim())); Navigator.pop(context); }, child: const Text('Save'))]));
}

String _taskAreaLabel(TaskArea area) {
  switch (area) {
    case TaskArea.routine:
      return 'Morning Routine';
    case TaskArea.work:
      return 'Work Tasks';
    case TaskArea.personal:
      return 'Personal Tasks';
    case TaskArea.notes:
      return 'Notes';
    case TaskArea.review:
      return 'Evening Review';
    case TaskArea.tomorrow:
      return 'Tomorrow Planning';
  }
}

IconData _financeIcon(FinanceType type) {
  switch (type) {
    case FinanceType.income:
      return Icons.south_west;
    case FinanceType.expense:
      return Icons.north_east;
    case FinanceType.bill:
      return Icons.receipt_long;
  }
}

String _healthMetricLabel(HealthMetricType type) {
  switch (type) {
    case HealthMetricType.steps:
      return 'Steps';
    case HealthMetricType.sleep:
      return 'Sleep Duration';
    case HealthMetricType.water:
      return 'Water Intake';
    case HealthMetricType.weight:
      return 'Weight';
    case HealthMetricType.exercise:
      return 'Exercise / Workout';
    case HealthMetricType.mood:
      return 'Mood';
    case HealthMetricType.medicine:
      return 'Medicine Tracking';
  }
}

String _healthUnit(HealthMetricType type) {
  switch (type) {
    case HealthMetricType.steps:
      return 'steps';
    case HealthMetricType.sleep:
      return 'h';
    case HealthMetricType.water:
      return 'L';
    case HealthMetricType.weight:
      return 'kg';
    case HealthMetricType.exercise:
      return 'min';
    case HealthMetricType.mood:
      return '/5';
    case HealthMetricType.medicine:
      return 'taken';
  }
}
