part of 'life_os_shell.dart';

class HealthScreen extends StatelessWidget {
  const HealthScreen({super.key, required this.entries, required this.integrationState, required this.onConnectHealth, required this.onDenyHealth, required this.onAddEntry, required this.onDeleteEntry});

  final List<HealthEntry> entries;
  final HealthIntegrationState integrationState;
  final VoidCallback onConnectHealth;
  final VoidCallback onDenyHealth;
  final ValueChanged<HealthEntry> onAddEntry;
  final ValueChanged<String> onDeleteEntry;

  @override
  Widget build(BuildContext context) {
    final summary = calculateHealthSummary(entries);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const SectionHeader(title: 'Health', action: 'Manual + Health Connect'), FilledButton.icon(onPressed: () => showHealthEditor(context: context, onSave: onAddEntry), icon: const Icon(Icons.add), label: const Text('Add Health'))]),
        const SizedBox(height: 8),
        FeatureTile(
          title: 'Permission required before sync',
          description: 'No background tracking starts until you explicitly connect Android Health Connect / Google Fit',
          icon: Icons.privacy_tip,
          action: FilledButton(onPressed: onConnectHealth, child: const Text('Connect')),
        ),
        FeatureTile(
          title: integrationState.label,
          description: integrationState.message,
          icon: Icons.health_and_safety,
          action: TextButton(onPressed: onDenyHealth, child: const Text('Deny')),
        ),
        const FeatureTile(title: 'Consent boundary', description: 'Steps, sleep, exercise and weight are read only after permission; water, mood and medicine stay manual-first', icon: Icons.verified_user),
        GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, childAspectRatio: 1.65, crossAxisSpacing: 12, mainAxisSpacing: 12, children: [
          MetricCard(label: 'Steps', value: summary.steps.toStringAsFixed(0), icon: Icons.directions_walk, color: const Color(0xFF2563EB)),
          MetricCard(label: 'Sleep', value: '${summary.sleepHours.toStringAsFixed(1)} h', icon: Icons.bedtime, color: const Color(0xFF7C3AED)),
          MetricCard(label: 'Water', value: '${summary.waterLiters.toStringAsFixed(1)} L', icon: Icons.water_drop, color: const Color(0xFF0891B2)),
          MetricCard(label: 'Exercise', value: '${summary.exerciseMinutes.toStringAsFixed(0)} min', icon: Icons.fitness_center, color: const Color(0xFF16A34A)),
        ]),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Primary manual logs'),
        for (final entry in entries) Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.monitor_heart)), title: Text(_healthMetricLabel(entry.type)), subtitle: const Text('Manual entry now • Sync adapter later'), trailing: Wrap(crossAxisAlignment: WrapCrossAlignment.center, children: [Text('${entry.value.toStringAsFixed(entry.value.truncateToDouble() == entry.value ? 0 : 1)} ${entry.unit}'), IconButton(tooltip: 'Delete health entry', icon: const Icon(Icons.delete_outline), onPressed: () => onDeleteEntry(entry.id))]))),
        const SectionHeader(title: 'Secondary metrics'),
        const FeatureTile(title: 'Heart Rate', description: 'Coming with permission-based health sync', icon: Icons.favorite, comingSoon: true),
        const FeatureTile(title: 'Blood Pressure', description: 'Coming with manual logs and supported devices', icon: Icons.bloodtype, comingSoon: true),
        const FeatureTile(title: 'Blood Sugar', description: 'Coming with manual logs and supported devices', icon: Icons.monitor_heart, comingSoon: true),
        const FeatureTile(title: 'Calories, distance, active minutes and BMI', description: 'Coming after primary health metrics are stable', icon: Icons.insights, comingSoon: true),
      ],
    );
  }
}
